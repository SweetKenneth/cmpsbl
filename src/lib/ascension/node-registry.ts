/**
 * CMPSBL® Ascension Node Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Manages all ingested Candidate Nodes (Node 41+).
 *
 * Responsibilities:
 *   - Store and retrieve candidate nodes
 *   - Lifecycle management (candidate → active → archived → rejected)
 *   - Temporary node run-limit tracking
 *   - Primitive attachment and retrieval
 *   - CJPI delta tracking per node
 *   - Governor promotion/demotion controls
 *
 * Integrates with:
 *   - artifact_registry (Supabase persistence)
 *   - primitive-extractor (for extraction on ingest)
 *   - chain-executor (for chain injection)
 *   - brain learning bridge (for primitive telemetry)
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import { extractPrimitives, type ExtractedPrimitive, type ExtractionResult } from './primitive-extractor';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type NodeStatus = 'candidate' | 'active' | 'archived' | 'rejected';
export type NodeMode = 'temporary' | 'persistent';

export interface AscensionNode {
  /** DB ID from artifact_registry */
  id: string;
  /** Display name (e.g., 'TRADER') */
  name: string;
  /** Original source file/project name */
  source: string;
  /** Extracted primitives */
  primitives: ExtractedPrimitive[];
  /** Lifecycle status */
  status: NodeStatus;
  /** Persistence mode */
  mode: NodeMode;
  /** Remaining runs before auto-archive (only for temporary mode) */
  runLimit: number | null;
  /** Total runs executed */
  totalRuns: number;
  /** Derived capability surface */
  surface: {
    nodeName: string;
    capabilities: string[];
    sector: string;
    domain: string;
  } | null;
  /** Source language */
  language: string;
  /** CJPI performance tracking */
  performance: {
    avgCjpi: number;
    bestCjpi: number;
    chainsParticipated: number;
    lastUsed: string | null;
  };
  /** Extraction stats */
  extractionStats: ExtractionResult['stats'] | null;
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
  /** User owner */
  userId: string;
}

export interface NodeListFilters {
  status?: NodeStatus;
  mode?: NodeMode;
  language?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface NodeUpdatePayload {
  status?: NodeStatus;
  mode?: NodeMode;
  runLimit?: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — REGISTRY OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse an artifact_registry row into an AscensionNode
 */
function parseNode(row: Record<string, unknown>): AscensionNode {
  const meta = (row.metadata || {}) as Record<string, unknown>;
  const sourceFiles = (meta.source_files as Array<{ name: string; content: string; language: string }>) || [];
  const surface = meta.derived_surface as AscensionNode['surface'];
  const nodePerf = (meta.node_performance || {}) as Record<string, unknown>;
  const extractionStats = (meta.extraction_stats || null) as AscensionNode['extractionStats'];
  const storedPrimitives = (meta.primitives || []) as ExtractedPrimitive[];

  return {
    id: String(row.id),
    name: String(row.name || '').replace(/^CANDIDATE_/, ''),
    source: sourceFiles.length > 0 ? sourceFiles.map(f => String(f.name)).join(', ') : String(row.name || ''),
    primitives: storedPrimitives,
    status: (meta.node_status as NodeStatus) || (String(row.tier) === 'candidate' ? 'candidate' : 'active'),
    mode: (meta.node_mode as NodeMode) || 'temporary',
    runLimit: typeof meta.run_limit === 'number' ? meta.run_limit : null,
    totalRuns: typeof meta.total_runs === 'number' ? meta.total_runs : 0,
    surface,
    language: String(meta.language || 'Unknown'),
    performance: {
      avgCjpi: Number(nodePerf.avg_cjpi || 0),
      bestCjpi: Number(nodePerf.best_cjpi || 0),
      chainsParticipated: Number(nodePerf.chains_participated || 0),
      lastUsed: (nodePerf.last_used as string) || null,
    },
    extractionStats,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
    userId: String(row.user_id || ''),
  };
}

/**
 * Fetch all ascension nodes for the current user
 */
export async function listNodes(
  userId: string,
  filters: NodeListFilters = {}
): Promise<{ nodes: AscensionNode[]; total: number }> {
  const { status, mode, language, search, limit = 50, offset = 0 } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('artifact_registry')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('category', 'proprietary-evolution')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(`Failed to list nodes: ${error.message}`);

  let nodes = ((data || []) as Record<string, unknown>[]).map(parseNode);

  // Client-side filters for metadata fields
  if (status) nodes = nodes.filter(n => n.status === status);
  if (mode) nodes = nodes.filter(n => n.mode === mode);
  if (language) nodes = nodes.filter(n => n.language.toLowerCase().includes(language.toLowerCase()));

  return { nodes, total: count || 0 };
}

/**
 * Get a single node by ID
 */
export async function getNode(nodeId: string, userId: string): Promise<AscensionNode | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('artifact_registry')
    .select('*')
    .eq('id', nodeId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return parseNode(data as Record<string, unknown>);
}

/**
 * Run primitive extraction on a node and persist results
 */
export async function extractAndAttachPrimitives(
  nodeId: string,
  userId: string
): Promise<ExtractionResult> {
  const node = await getNode(nodeId, userId);
  if (!node) throw new Error('Node not found');

  // Get source files from artifact_registry metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('artifact_registry')
    .select('metadata')
    .eq('id', nodeId)
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('Cannot read node metadata');

  const meta = (data.metadata || {}) as Record<string, unknown>;
  const sourceFiles = (meta.source_files as Array<{ name: string; content: string; language: string }>) || [];

  if (sourceFiles.length === 0) {
    throw new Error('No source files found on this node');
  }

  // Run extraction
  const result = extractPrimitives(sourceFiles);

  // Persist primitives + stats back to the node
  const updatedMeta = {
    ...meta,
    primitives: result.primitives,
    extraction_stats: result.stats,
    extraction_warnings: result.warnings,
    last_extraction_at: new Date().toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('artifact_registry')
    .update({ metadata: updatedMeta, updated_at: new Date().toISOString() })
    .eq('id', nodeId)
    .eq('user_id', userId);

  if (updateError) throw new Error(`Failed to persist primitives: ${updateError.message}`);

  return result;
}

/**
 * Update a node's status, mode, or run limit (Governor controls)
 */
export async function updateNode(
  nodeId: string,
  userId: string,
  updates: NodeUpdatePayload
): Promise<AscensionNode> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing, error: readErr } = await (supabase as any)
    .from('artifact_registry')
    .select('metadata, tier')
    .eq('id', nodeId)
    .eq('user_id', userId)
    .single();

  if (readErr || !existing) throw new Error('Node not found');

  const meta = { ...(existing.metadata as Record<string, unknown>) };

  if (updates.status) meta.node_status = updates.status;
  if (updates.mode) meta.node_mode = updates.mode;
  if (updates.runLimit !== undefined) meta.run_limit = updates.runLimit;

  // Map status to tier for backward compatibility
  const tierMap: Record<NodeStatus, string> = {
    candidate: 'candidate',
    active: 'active',
    archived: 'archived',
    rejected: 'rejected',
  };

  const payload: Record<string, unknown> = {
    metadata: meta,
    updated_at: new Date().toISOString(),
  };

  if (updates.status) {
    payload.tier = tierMap[updates.status];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('artifact_registry')
    .update(payload)
    .eq('id', nodeId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to update node: ${error.message}`);

  const updated = await getNode(nodeId, userId);
  if (!updated) throw new Error('Node disappeared after update');
  return updated;
}

/**
 * Delete a node permanently
 */
export async function deleteNode(nodeId: string, userId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('artifact_registry')
    .delete()
    .eq('id', nodeId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to delete node: ${error.message}`);
}

/**
 * Record a discovery run participation for a node.
 * Decrements run limit for temporary nodes.
 */
export async function recordRunParticipation(
  nodeId: string,
  userId: string,
  cjpiScore: number
): Promise<{ archived: boolean }> {
  const node = await getNode(nodeId, userId);
  if (!node) throw new Error('Node not found');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error: readErr } = await (supabase as any)
    .from('artifact_registry')
    .select('metadata')
    .eq('id', nodeId)
    .eq('user_id', userId)
    .single();

  if (readErr || !data) throw new Error('Cannot read node');

  const meta = { ...(data.metadata as Record<string, unknown>) };
  const perf = (meta.node_performance || {}) as Record<string, unknown>;

  // Update performance
  const totalRuns = (Number(meta.total_runs) || 0) + 1;
  const chainsParticipated = (Number(perf.chains_participated) || 0) + 1;
  const currentAvg = Number(perf.avg_cjpi) || 0;
  const newAvg = chainsParticipated > 1
    ? currentAvg + (cjpiScore - currentAvg) / chainsParticipated
    : cjpiScore;

  meta.total_runs = totalRuns;
  meta.node_performance = {
    avg_cjpi: Math.round(newAvg * 100) / 100,
    best_cjpi: Math.max(Number(perf.best_cjpi) || 0, cjpiScore),
    chains_participated: chainsParticipated,
    last_used: new Date().toISOString(),
  };

  // Check run limit for temporary nodes
  let shouldArchive = false;
  if (meta.node_mode === 'temporary' && typeof meta.run_limit === 'number') {
    const newLimit = meta.run_limit - 1;
    meta.run_limit = Math.max(0, newLimit);
    if (newLimit <= 0) {
      meta.node_status = 'archived';
      shouldArchive = true;
    }
  }

  const updatePayload: Record<string, unknown> = {
    metadata: meta,
    updated_at: new Date().toISOString(),
  };
  if (shouldArchive) updatePayload.tier = 'archived';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('artifact_registry')
    .update(updatePayload)
    .eq('id', nodeId)
    .eq('user_id', userId);

  return { archived: shouldArchive };
}
