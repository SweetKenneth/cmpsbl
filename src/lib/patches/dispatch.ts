/**
 * CMPSBL® Patch Dispatch
 * 
 * Sends validated patch payloads to the LNCHBL distribution's
 * lnchbl-patch-receive endpoint.
 * 
 * @module patches/dispatch
 * @version 8.5.0
 */

import { signPayload } from '@/lib/patches/author';
import { 
  validatePatchForLnchbl, 
  type LnchblPatchPayload 
} from '@/lib/distribution/lnchbl-manifest';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PatchDispatchResult {
  success: boolean;
  patch_id?: string;
  patch_version?: string;
  error?: string;
  validation_errors?: string[];
}

// ─── Dispatch ───────────────────────────────────────────────────────────────

/**
 * Validates and sends a patch payload to LNCHBL's lnchbl-patch-receive endpoint.
 * 
 * Flow:
 * 1. Validate payload against LNCHBL rules (no pf-*, no protected overrides)
 * 2. Sign the payload with SHA-256
 * 3. POST to lnchbl-patch-receive
 * 4. Return result
 */
export async function sendPatchToLnchbl(
  payload: LnchblPatchPayload,
  apiKey?: string
): Promise<PatchDispatchResult> {
  // Step 1: Validate
  const validationErrors = validatePatchForLnchbl(payload);
  if (validationErrors.length > 0) {
    return {
      success: false,
      error: 'Patch validation failed',
      validation_errors: validationErrors,
    };
  }

  // Step 2: Sign
  const signature = await signPayload(JSON.stringify(payload));
  const signedPayload = {
    ...payload,
    signature,
  };

  // Step 3: Dispatch
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Distribution-ID': 'CMPSBL',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(LNCHBL_PATCH_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(signedPayload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorBody.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      patch_id: result.patch_id,
      patch_version: payload.patch_version,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error dispatching patch',
    };
  }
}

/**
 * Convenience: build and send a capability patch in one call.
 */
export async function patchCapabilities(
  version: string,
  capabilities: string[],
  engines: string[] = [],
  changelog: string,
  apiKey?: string
): Promise<PatchDispatchResult> {
  return sendPatchToLnchbl({
    target_distribution: 'LNCHBL',
    patch_version: version,
    capabilities,
    engines,
    changelog,
    config_overrides: {},
  }, apiKey);
}

/**
 * Convenience: send edge function code to LNCHBL via patch.
 */
export async function patchEdgeFunction(
  version: string,
  functionName: string,
  code: string,
  changelog: string,
  config?: Record<string, unknown>,
  apiKey?: string
): Promise<PatchDispatchResult> {
  return sendPatchToLnchbl({
    target_distribution: 'LNCHBL',
    patch_version: version,
    capabilities: [],
    engines: [],
    changelog,
    config_overrides: {},
    edge_function_code: [{ function_name: functionName, code, config }],
  }, apiKey);
}
