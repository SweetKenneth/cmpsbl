/**
 * CMPSBL® Ascension Subsystem — Shared Types
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single source of truth for all Ascension type definitions.
 * Schema-versioned for migration safety.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — SCHEMA VERSION
// ═══════════════════════════════════════════════════════════════════════════════

/** Current metadata schema version. Bump on breaking changes. */
export const ASCENSION_SCHEMA_VERSION = 2;

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — PRIMITIVE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PrimitiveCategory =
  | 'analysis' | 'execution' | 'validation' | 'transformation'
  | 'prediction' | 'storage' | 'routing' | 'security'
  | 'communication' | 'scheduling' | 'monitoring' | 'computation'
  | 'rendering' | 'configuration' | 'io' | 'unknown';

export interface ExtractedPrimitive {
  id: string;
  name: string;
  canonicalName: string;
  category: PrimitiveCategory;
  inputs: string[];
  outputs: string[];
  confidence: number;
  qualityScore: number;
  sourceSnippet: string;
  language: string;
  extractionMethod: 'function' | 'class' | 'keyword' | 'pattern' | 'module';
  extractionTrust: 'high' | 'medium' | 'heuristic';
  keywords: string[];
  complexity: number;
  sourceFile?: string;
  patternId?: string;
  aliases?: string[];
}

export interface QualityReport {
  accepted: ExtractedPrimitive[];
  rejected: RejectedPrimitive[];
  summary: QualitySummary;
}

export interface RejectedPrimitive {
  primitive: ExtractedPrimitive;
  reason: string;
  score: number;
}

export interface QualitySummary {
  totalExtracted: number;
  totalAccepted: number;
  totalRejected: number;
  avgQualityScore: number;
  avgConfidence: number;
  topCategories: Array<{ category: PrimitiveCategory; count: number }>;
  extractionTrustBreakdown: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — EXTRACTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ExtractionResult {
  primitives: ExtractedPrimitive[];
  quality: QualityReport;
  stats: ExtractionStats;
  warnings: string[];
  durationMs: number;
  correlationId: string;
}

export interface ExtractionStats {
  totalPrimitives: number;
  byCategory: Record<PrimitiveCategory, number>;
  byMethod: Record<string, number>;
  avgConfidence: number;
  avgComplexity: number;
  avgQualityScore: number;
  languagesDetected: string[];
  totalLinesAnalyzed: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — NODE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type NodeStatus = 'candidate' | 'active' | 'archived' | 'rejected';
export type NodeMode = 'temporary' | 'persistent';

export interface AscensionNode {
  id: string;
  name: string;
  source: string;
  primitives: ExtractedPrimitive[];
  status: NodeStatus;
  mode: NodeMode;
  runLimit: number | null;
  totalRuns: number;
  surface: NodeSurface | null;
  language: string;
  performance: NodePerformance;
  extractionStats: ExtractionStats | null;
  qualitySummary: QualitySummary | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  schemaVersion: number;
}

export interface NodeSurface {
  nodeName: string;
  capabilities: string[];
  sector: string;
  domain: string;
}

export interface NodePerformance {
  avgCjpi: number;
  bestCjpi: number;
  chainsParticipated: number;
  lastUsed: string | null;
}

export interface NodeListFilters {
  status?: NodeStatus;
  mode?: NodeMode;
  language?: string;
  search?: string;
  minQuality?: number;
  minCjpi?: number;
  limit?: number;
  offset?: number;
}

export interface NodeUpdatePayload {
  status?: NodeStatus;
  mode?: NodeMode;
  runLimit?: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — NODE METADATA SCHEMA (structured sections)
// ═══════════════════════════════════════════════════════════════════════════════

export interface NodeMetadata {
  schema_version: number;
  identity: {
    node_name: string;
    language: string;
    source_files: Array<{ name: string; content: string; language: string }>;
    derived_surface: NodeSurface | null;
  };
  extraction: {
    primitives: ExtractedPrimitive[];
    stats: ExtractionStats | null;
    quality_summary: QualitySummary | null;
    warnings: string[];
    last_extraction_at: string | null;
    extraction_count: number;
  };
  lifecycle: {
    node_status: NodeStatus;
    node_mode: NodeMode;
    run_limit: number | null;
    total_runs: number;
    promoted_at: string | null;
    archived_at: string | null;
  };
  performance: {
    avg_cjpi: number;
    best_cjpi: number;
    chains_participated: number;
    last_used: string | null;
    delta_history: DeltaReport[];
  };
  learning: {
    brain_events_sent: number;
    last_learning_event: string | null;
    primitive_success_map: Record<string, number>;
  };
  provenance: {
    ingested_at: string;
    correlation_id: string;
    upload_file_names: string[];
    total_source_bytes: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — DELTA MEASUREMENT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DeltaReport {
  id: string;
  nodeId: string;
  nodeName: string;
  timestamp: string;
  baseline: DeltaSnapshot;
  injected: DeltaSnapshot;
  deltas: DeltaComparison;
}

export interface DeltaSnapshot {
  chainModules: string[];
  outputKeys: string[];
  annotationCount: number;
  confidence: number;
  durationMs: number;
  recoveryCount: number;
  transformationNotes: string[];
}

export interface DeltaComparison {
  outputKeysAdded: string[];
  outputKeysRemoved: string[];
  confidenceDelta: number;
  timingDeltaMs: number;
  recoveryDelta: number;
  annotationsAdded: number;
  primitivesContributed: number;
  verdict: 'positive' | 'neutral' | 'negative';
  impactScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — CHAIN INJECTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface InjectionResult {
  success: boolean;
  primitivesInjected: number;
  effectRegistered: boolean;
  warnings: string[];
  correlationId: string;
}

export interface ChainParticipation {
  nodeId: string;
  nodeName: string;
  chainModules: string[];
  position: number;
  cjpiDelta: number;
  primitivesExecuted: number;
  outputChanges: string[];
  timestamp: string;
  correlationId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — LEARNING TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type LearningEventType =
  | 'primitive_accepted'
  | 'primitive_rejected'
  | 'chain_participation'
  | 'delta_measured'
  | 'node_promotion'
  | 'node_archival'
  | 'pattern_recognition';

export interface LearningEvent {
  type: LearningEventType;
  nodeId: string;
  nodeName: string;
  data: Record<string, unknown>;
  weight: number;
  correlationId: string;
  timestamp: string;
}

export interface PatternFrequency {
  pattern: string;
  category: string;
  language: string;
  frequency: number;
  avgConfidence: number;
  avgQuality: number;
  successRate: number;
  chainImpact: number;
}

export interface LearningInsights {
  topPrimitiveFamilies: Array<{ family: string; count: number; avgImpact: number }>;
  strongestLanguages: Array<{ language: string; avgQuality: number; count: number }>;
  highImpactCategories: Array<{ category: string; avgChainImpact: number }>;
  promotionCandidates: Array<{ nodeId: string; nodeName: string; score: number }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — AUDIT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type AuditEventType =
  | 'upload'
  | 'extraction'
  | 'quality_gate'
  | 'node_created'
  | 'chain_participation'
  | 'delta_measured'
  | 'promotion'
  | 'demotion'
  | 'deletion'
  | 're_extraction'
  | 'learning_event';

export interface AuditEvent {
  type: AuditEventType;
  nodeId?: string;
  nodeName?: string;
  userId?: string;
  correlationId?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §10 — CANONICAL NAMING
// ═══════════════════════════════════════════════════════════════════════════════

/** Prefix for all ascension node module names */
export const ASCENSION_PREFIX = 'Ψ₄₁' as const;

/** Canonical module names that ascension nodes must NEVER collide with */
export const RESERVED_MODULE_NAMES = new Set([
  'CORE', 'BRAIN', 'MEMORY', 'NERVE', 'DECODE', 'ENCODE', 'CORTEX',
  'DEFENSE', 'ORACLE', 'CONSCIENCE', 'PHANTOM', 'HARVEST', 'EVOLUTION',
  'SHADOW', 'IMMUNITY', 'INTENT', 'GOVERNANCE', 'ATLAS', 'FORGE',
  'LINGUA', 'ECHO', 'SOVEREIGN', 'REFLEX', 'TREATY', 'ENGINEER',
  'COMPASS', 'OBSERVER', 'NEXUS', 'SENTINEL', 'PRISM', 'ARBITER',
  'CATALYST', 'BASTION', 'MERIDIAN', 'SYNAPSE', 'HELIX', 'CIPHER',
  'FULCRUM', 'PARADOX', 'AEGIS',
]);

/**
 * Build a collision-safe module name for an ascension node.
 * Always prefixed with Ψ₄₁_ and sanitized.
 */
export function buildAscensionModuleName(rawName: string): string {
  const sanitized = rawName
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);

  const name = sanitized || 'UNNAMED';

  // Guard against canonical collisions
  if (RESERVED_MODULE_NAMES.has(name)) {
    return `${ASCENSION_PREFIX}_X_${name}`;
  }

  return `${ASCENSION_PREFIX}_${name}`;
}

/**
 * Check if a module name is an ascension node
 */
export function isAscensionModule(moduleName: string): boolean {
  return moduleName.startsWith(ASCENSION_PREFIX);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §11 — CORRELATION ID GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

export function generateCorrelationId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `asc_${ts}_${rand}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §12 — METADATA MIGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Migrate legacy flat metadata to structured NodeMetadata.
 * Safe to call on already-migrated data (idempotent).
 */
export function migrateMetadata(raw: Record<string, unknown>): NodeMetadata {
  const version = typeof raw.schema_version === 'number' ? raw.schema_version : 1;

  if (version >= ASCENSION_SCHEMA_VERSION && raw.identity && raw.extraction) {
    return raw as unknown as NodeMetadata;
  }

  // V1 → V2 migration: flat keys → structured sections
  const sourceFiles = (raw.source_files as NodeMetadata['identity']['source_files']) || [];
  const primitives = (raw.primitives as ExtractedPrimitive[]) || [];

  return {
    schema_version: ASCENSION_SCHEMA_VERSION,
    identity: {
      node_name: (raw.node_name as string) || '',
      language: (raw.language as string) || 'Unknown',
      source_files: sourceFiles,
      derived_surface: (raw.derived_surface as NodeSurface) || null,
    },
    extraction: {
      primitives,
      stats: (raw.extraction_stats as ExtractionStats) || null,
      quality_summary: null,
      warnings: (raw.extraction_warnings as string[]) || [],
      last_extraction_at: (raw.last_extraction_at as string) || null,
      extraction_count: (raw.extraction_count as number) || (primitives.length > 0 ? 1 : 0),
    },
    lifecycle: {
      node_status: (raw.node_status as NodeStatus) || 'candidate',
      node_mode: (raw.node_mode as NodeMode) || 'temporary',
      run_limit: typeof raw.run_limit === 'number' ? raw.run_limit : null,
      total_runs: (raw.total_runs as number) || 0,
      promoted_at: null,
      archived_at: null,
    },
    performance: {
      avg_cjpi: ((raw.node_performance as Record<string, unknown>)?.avg_cjpi as number) || 0,
      best_cjpi: ((raw.node_performance as Record<string, unknown>)?.best_cjpi as number) || 0,
      chains_participated: ((raw.node_performance as Record<string, unknown>)?.chains_participated as number) || 0,
      last_used: ((raw.node_performance as Record<string, unknown>)?.last_used as string) || null,
      delta_history: [],
    },
    learning: {
      brain_events_sent: 0,
      last_learning_event: null,
      primitive_success_map: {},
    },
    provenance: {
      ingested_at: (raw.ingested_at as string) || new Date().toISOString(),
      correlation_id: (raw.correlation_id as string) || generateCorrelationId(),
      upload_file_names: sourceFiles.map(f => f.name),
      total_source_bytes: sourceFiles.reduce((s, f) => s + (f.content?.length || 0), 0),
    },
  };
}
