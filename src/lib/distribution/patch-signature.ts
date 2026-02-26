/**
 * Patch Signature Verification — SHA-256 Manifest Signatures
 * 
 * Generates and verifies SHA-256 signatures for LNCHBL patch payloads
 * to ensure integrity during distribution dispatch.
 * 
 * @module distribution/patch-signature
 * @version 1.0.0
 */

/**
 * Generate a SHA-256 hash of a patch payload for integrity verification.
 * Uses the Web Crypto API (available in both browser and Deno).
 */
export async function generatePatchSignature(payload: Record<string, unknown>): Promise<string> {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a patch signature matches the expected hash.
 */
export async function verifyPatchSignature(
  payload: Record<string, unknown>,
  expectedSignature: string
): Promise<{ valid: boolean; computed: string }> {
  const computed = await generatePatchSignature(payload);
  return { valid: computed === expectedSignature, computed };
}

/**
 * Sign a patch payload in-place, adding the `signature` field.
 */
export async function signPatch<T extends Record<string, unknown>>(
  patch: T
): Promise<T & { signature: string }> {
  // Remove existing signature before computing
  const { signature: _, ...payloadWithoutSig } = patch;
  const sig = await generatePatchSignature(payloadWithoutSig);
  return { ...patch, signature: sig };
}
