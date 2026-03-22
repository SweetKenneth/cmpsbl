/**
 * CMPSBL® Ascension Node Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Manages all ingested Candidate Nodes (Auxiliary Node).
 * Uses structured metadata schema with migration support.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import { extractPrimitives } from './primitive-extractor';
import {
  type AscensionNode,
  type NodeStatus,
  type NodeMode,
  type NodeListFilters,
  type NodeUpdatePayload,
  type NodeMetadata,
  type ExtractionResult,
  type ExtractedPrimitive,
  ASCENSION_SCHEMA_VERSION,
  migrateMetadata,
  generateCorrelationId,
} from './types';

// Re-export types
export type { AscensionNode, NodeStatus, NodeMode, NodeListFilters, NodeUpdatePayload, ExtractionResult };

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — PARSE + MIGRATE
// ═══════════════════════════════════════════════════════════════════════════════

function parseNode(row: Record<string, unknown>): AscensionNode {
  const rawMeta = (row.metadata || {}) as Record<string, unknown>;
  const meta = migrateMetadata(rawMeta);

  return {
    id: String(row.id),
    name: meta.identity.node_name || String(row.name || '').replace(/^CANDIDATE_/, ''),
    source: meta.provenance.upload_file_names.join(', ') || String(row.name || ''),
    primitives: meta.extraction.primitives,
    status: meta.lifecycle.node_status,
    mode: meta.lifecycle.node_mode,
    runLimit: meta.lifecycle.run_limit,
    totalRuns: meta.lifecycle.total_runs,
    surface: meta.identity.derived_surface,
    language: meta.identity.language,
    performance: {
      avgCjpi: meta.performance.avg_cjpi,
      bestCjpi: meta.performance.best_cjpi,
      chainsParticipated: meta.performance.chains_participated,
      lastUsed: meta.performance.last_used,
    },
    extractionStats: meta.extraction.stats,
    qualitySummary: meta.extraction.quality_summary,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
    userId: String(row.user_id || ''),
    schemaVersion: meta.schema_version,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — REGISTRY OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function listNodes(
  userId: string,
  filters: NodeListFilters = {}
): Promise<{ nodes: AscensionNode[]; total: number }> {
  if (!userId) return { nodes: [], total: 0 };

  const { status, mode, language, search, minQuality, minCjpi, limit = 50, offset = 0 } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('artifact_registry')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('category', 'proprietary-evolution')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) query = query.ilike('name', `%${search}%`);

  const { data, count, error } = await query;
  if (error) throw new Error(`Failed to list nodes: ${error.message}`);

  let nodes = ((data || []) as Record<string, unknown>[]).map(parseNode);

  // Client-side filters for metadata fields
  if (status) nodes = nodes.filter(n => n.status === status);
  if (mode) nodes = nodes.filter(n => n.mode === mode);
  if (language) nodes = nodes.filter(n => n.language.toLowerCase().includes(language.toLowerCase()));
  if (minQuality !== undefined) nodes = nodes.filter(n => (n.qualitySummary?.avgQualityScore ?? 0) >= minQuality);
  if (minCjpi !== undefined) nodes = nodes.filter(n => n.performance.avgCjpi >= minCjpi);

  return { nodes, total: count || 0 };
}

export async function getNode(nodeId: string, userId: string): Promise<AscensionNode | null> {
  if (!nodeId || !userId) return null;

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
 * Run primitive extraction and persist results with quality gate.
 */
export async function extractAndAttachPrimitives(
  nodeId: string,
  userId: string
): Promise<ExtractionResult> {
  if (!nodeId || !userId) throw new Error('nodeId and userId required');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('artifact_registry')
    .select('metadata')
    .eq('id', nodeId)
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('Cannot read node metadata');

  const rawMeta = (data.metadata || {}) as Record<string, unknown>;
  const meta = migrateMetadata(rawMeta);

  if (meta.identity.source_files.length === 0) {
    throw new Error('No source files found on this node');
  }

  const result = extractPrimitives(meta.identity.source_files);

  // Update extraction section
  meta.extraction = {
    primitives: result.primitives,
    stats: result.stats,
    quality_summary: result.quality.summary,
    warnings: result.warnings,
    last_extraction_at: new Date().toISOString(),
    extraction_count: meta.extraction.extraction_count + 1,
  };
  meta.schema_version = ASCENSION_SCHEMA_VERSION;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('artifact_registry')
    .update({ metadata: meta, updated_at: new Date().toISOString() })
    .eq('id', nodeId)
    .eq('user_id', userId);

  if (updateError) throw new Error(`Failed to persist primitives: ${updateError.message}`);

  return result;
}

/**
 * Update a node's status, mode, or run limit.
 */
export async function updateNode(
  nodeId: string,
  userId: string,
  updates: NodeUpdatePayload
): Promise<AscensionNode> {
  if (!nodeId || !userId) throw new Error('nodeId and userId required');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing, error: readErr } = await (supabase as any)
    .from('artifact_registry')
    .select('metadata, tier')
    .eq('id', nodeId)
    .eq('user_id', userId)
    .single();

  if (readErr || !existing) throw new Error('Node not found');

  const meta = migrateMetadata((existing.metadata || {}) as Record<string, unknown>);

  if (updates.status) {
    meta.lifecycle.node_status = updates.status;
    if (updates.status === 'active') meta.lifecycle.promoted_at = new Date().toISOString();
    if (updates.status === 'archived') meta.lifecycle.archived_at = new Date().toISOString();
  }
  if (updates.mode) meta.lifecycle.node_mode = updates.mode;
  if (updates.runLimit !== undefined) meta.lifecycle.run_limit = updates.runLimit;

  const tierMap: Record<NodeStatus, string> = {
    candidate: 'candidate', active: 'active', archived: 'archived', rejected: 'rejected',
  };

  const payload: Record<string, unknown> = {
    metadata: meta,
    updated_at: new Date().toISOString(),
  };
  if (updates.status) payload.tier = tierMap[updates.status];

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

export async function deleteNode(nodeId: string, userId: string): Promise<void> {
  if (!nodeId || !userId) throw new Error('nodeId and userId required');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('artifact_registry')
    .delete()
    .eq('id', nodeId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to delete node: ${error.message}`);
}

/**
 * Record a discovery run participation. Decrements run limit for temporary nodes.
 */
export async function recordRunParticipation(
  nodeId: string,
  userId: string,
  cjpiScore: number
): Promise<{ archived: boolean }> {
  if (!nodeId || !userId) throw new Error('nodeId and userId required');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error: readErr } = await (supabase as any)
    .from('artifact_registry')
    .select('metadata')
    .eq('id', nodeId)
    .eq('user_id', userId)
    .single();

  if (readErr || !data) throw new Error('Node not found');

  const meta = migrateMetadata((data.metadata || {}) as Record<string, unknown>);

  // Update performance
  meta.lifecycle.total_runs += 1;
  meta.performance.chains_participated += 1;

  const n = meta.performance.chains_participated;
  meta.performance.avg_cjpi = Math.round(
    (meta.performance.avg_cjpi + (cjpiScore - meta.performance.avg_cjpi) / n) * 100
  ) / 100;
  meta.performance.best_cjpi = Math.max(meta.performance.best_cjpi, cjpiScore);
  meta.performance.last_used = new Date().toISOString();

  // Check run limit for temporary nodes
  let shouldArchive = false;
  if (meta.lifecycle.node_mode === 'temporary' && typeof meta.lifecycle.run_limit === 'number') {
    meta.lifecycle.run_limit = Math.max(0, meta.lifecycle.run_limit - 1);
    if (meta.lifecycle.run_limit <= 0) {
      meta.lifecycle.node_status = 'archived';
      meta.lifecycle.archived_at = new Date().toISOString();
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
