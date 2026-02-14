/**
 * Intent Mesh — Type Definitions
 * v10.0.0 — Emergent Module Intelligence Layer
 * 
 * Enables autonomous cross-module capability discovery and composition.
 * Modules advertise resolvers, broadcast intents, and the mesh routes dynamically.
 */

/** A resolver is a single capability a module advertises */
export interface MeshResolver {
  /** Unique resolver ID (e.g., 'relay.email_by_ip') */
  id: string;
  /** Module that owns this resolver */
  module: string;
  /** Human-readable description */
  description: string;
  /** What data domains this resolver can enrich */
  domains: string[];
  /** Input schema keys this resolver accepts */
  accepts: string[];
  /** Output schema keys this resolver produces */
  produces: string[];
  /** Risk level — governs whether mutations are allowed */
  risk: 'read' | 'enrich' | 'mutate';
  /** Whether this resolver is currently active */
  enabled: boolean;
}

/** An intent is a request broadcast by a module seeking data/enrichment */
export interface MeshIntent {
  /** Auto-generated intent ID */
  id: string;
  /** The module broadcasting the intent */
  sourceModule: string;
  /** What the module is looking for (e.g., 'actor_enrichment', 'threat_context') */
  intentType: string;
  /** Data domains relevant to this intent */
  domains: string[];
  /** Input data provided with the intent */
  input: Record<string, unknown>;
  /** Governance mode for this intent */
  governanceMode: 'read_only' | 'governed' | 'emergency';
  /** Timestamp */
  timestamp: string;
}

/** Result from a single resolver responding to an intent */
export interface ResolverResponse {
  resolverId: string;
  module: string;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  durationMs: number;
}

/** Complete mesh resolution result */
export interface MeshResolution {
  intentId: string;
  sourceModule: string;
  intentType: string;
  resolversMatched: number;
  resolversResponded: number;
  responses: ResolverResponse[];
  composedResult: Record<string, unknown>;
  totalDurationMs: number;
  timestamp: string;
}

/** Receipt logged to database for auditability */
export interface MeshReceipt {
  id?: string;
  intent_type: string;
  source_module: string;
  target_modules: string[];
  resolved_by: string[];
  input_summary: Record<string, unknown>;
  output_summary: Record<string, unknown>;
  governance_mode: string;
  success: boolean;
  duration_ms: number;
  error_message?: string;
}

/** Mesh status for dashboard/terminal */
export interface MeshStatus {
  enabled: boolean;
  totalResolvers: number;
  activeResolvers: number;
  moduleCount: number;
  recentIntents: number;
  topRoutes: Array<{ source: string; target: string; count: number }>;
}
