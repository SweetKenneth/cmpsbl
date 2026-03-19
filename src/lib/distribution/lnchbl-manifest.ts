/**
 * LNCHBL Distribution Manifest — DISCONTINUED
 * 
 * ⛔ LNCHBL self-hosted distribution has been DISCONTINUED.
 * This feature is no longer offered on any tier.
 * All outbound operations (patches, brain sync, downloads) are permanently blocked.
 * Edge functions return 503. No new patches will be authored or dispatched.
 * 
 * @module distribution/lnchbl-manifest
 * @version 12.0.0-discontinued
 */

// ─── LNCHBL Edge Function Registry ──────────────────────────────────────────

export const LNCHBL_EDGE_FUNCTIONS = Object.freeze([
  'lnchbl-checkout',
  'lnchbl-customer-portal',
  'lnchbl-download',
  'lnchbl-phone-home',
  'lnchbl-verify',
  'lnchbl-brain-ingest',       // v11.3.0: Receives brain sync payloads from CMPSBL
  'lnchbl-neural-bootstrap',   // v11.5.0: Initializes neural substrate on first boot
  'lnchbl-maintenance-tick',   // v11.5.0: Cron-driven maintenance automation heartbeat
] as const);

export type LnchblEdgeFunction = typeof LNCHBL_EDGE_FUNCTIONS[number];

// ─── LNCHBL Database Tables (patch-writable) ────────────────────────────────

/** Tables that patches are allowed to write to in LNCHBL */
export const LNCHBL_PATCH_TABLES = Object.freeze([
  'distribution_patches',
  'distribution_state',
  'distribution_edge_functions',
  'brain_embeddings',          // v11.5.0: Neural substrate vector storage
  'brain_classifier_models',   // v11.5.0: Confidence classifier weights
  'brain_drift_log',           // v11.5.0: Drift detection alerts
  'brain_maintenance_log',     // v11.5.0: Automated maintenance audit trail
] as const);

export type LnchblPatchTable = typeof LNCHBL_PATCH_TABLES[number];

// ─── Patch Payload Schema ───────────────────────────────────────────────────

export interface LnchblEdgeFunctionCode {
  function_name: string;
  code: string;
  config?: Record<string, unknown>;
}

export interface LnchblPatchPayload {
  target_distribution: 'LNCHBL';
  patch_version: string;
  patch_id?: string;
  capabilities: string[];
  engines: string[];
  changelog: string;
  signature?: string;
  config_overrides: Record<string, unknown>;
  /** Optional: array of edge function code to deploy in LNCHBL */
  edge_function_code?: LnchblEdgeFunctionCode[] | null;
}

// ─── Validation Helpers ─────────────────────────────────────────────────────

/**
 * Check if a function name exists in LNCHBL.
 * Used to prevent patches from referencing non-existent functions.
 */
export function isLnchblFunction(name: string): name is LnchblEdgeFunction {
  return (LNCHBL_EDGE_FUNCTIONS as readonly string[]).includes(name);
}

/**
 * Check if a function name is a pf-* function (which do NOT exist in LNCHBL).
 */
export function isCmpsblOnlyFunction(name: string): boolean {
  return name.startsWith('pf-');
}

/**
 * Validate that a patch payload doesn't reference any pf-* functions
 * as dependencies. Returns validation errors if any are found.
 * 
 * ⛔ SUSPENDED: Always rejects with suspension error.
 */
export function validatePatchForLnchbl(payload: LnchblPatchPayload): string[] {
  return [
    'LNCHBL distribution is SUSPENDED. No patches may be authored or dispatched until licensing is resolved.',
  ];
}
