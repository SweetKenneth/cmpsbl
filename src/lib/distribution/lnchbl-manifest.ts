/**
 * LNCHBL Distribution Manifest
 * 
 * Defines the ONLY edge functions that exist in the LNCHBL distribution.
 * Used by patch authoring to validate outbound patches never reference
 * functions that don't exist downstream.
 * 
 * CRITICAL: LNCHBL has ZERO pf-* functions. All were permanently removed
 * in v8.5.0. New function code must be delivered via the edge_function_code
 * field in the patch payload, which lnchbl-patch-receive writes to the
 * distribution_edge_functions table.
 * 
 * @module distribution/lnchbl-manifest
 * @version 8.5.0
 */

// ─── LNCHBL Edge Function Registry ──────────────────────────────────────────

export const LNCHBL_EDGE_FUNCTIONS = Object.freeze([
  'lnchbl-checkout',
  'lnchbl-customer-portal',
  'lnchbl-download',
  'lnchbl-phone-home',
  'lnchbl-verify',
] as const);

export type LnchblEdgeFunction = typeof LNCHBL_EDGE_FUNCTIONS[number];

// ─── LNCHBL Database Tables (patch-writable) ────────────────────────────────

/** Tables that patches are allowed to write to in LNCHBL */
export const LNCHBL_PATCH_TABLES = Object.freeze([
  'distribution_patches',
  'distribution_state',
  'distribution_edge_functions',
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
 */
export function validatePatchForLnchbl(payload: LnchblPatchPayload): string[] {
  const errors: string[] = [];

  if (payload.target_distribution !== 'LNCHBL') {
    errors.push(`Invalid target_distribution: ${payload.target_distribution}`);
  }

  // Check if edge_function_code uses a pf-* name (which would conflict)
  if (payload.edge_function_code) {
    const fnName = payload.edge_function_code.function_name;
    if (isCmpsblOnlyFunction(fnName)) {
      errors.push(
        `edge_function_code.function_name "${fnName}" uses pf-* prefix which is reserved for CMPSBL. ` +
        `Use lnchbl-* prefix for LNCHBL functions.`
      );
    }
  }

  return errors;
}
