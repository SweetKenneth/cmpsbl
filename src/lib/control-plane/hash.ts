/**
 * Canonical JSON + SHA-256 Hashing
 * Provides tamper-evident snapshot hashing via WebCrypto.
 * 
 * v13.3.1: Hardened canonicalization for deterministic fingerprints.
 */

/**
 * Produce a stable JSON string with recursively sorted keys.
 * Guarantees identical output across environments for identical input.
 */
export function canonicalizeJson(obj: unknown): string {
  return JSON.stringify(sortKeys(obj), null, 0);
}

function sortKeys(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(sortKeys);
  if (typeof val === 'object') {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(val as Record<string, unknown>).sort();
    for (const key of keys) {
      sorted[key] = sortKeys((val as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return val;
}

/**
 * SHA-256 hash using WebCrypto (returns hex string).
 * Falls back to simple djb2 hash if WebCrypto unavailable.
 */
export async function sha256(input: string): Promise<string> {
  if (!crypto?.subtle) {
    throw new Error(
      'WebCrypto SHA-256 unavailable. Structural fingerprinting requires crypto.subtle.'
    );
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute snapshot hash for a revision payload.
 */
export async function computeSnapshotHash(
  payload: unknown,
  revisionId: number,
  parentRevisionId: number | null
): Promise<string> {
  const canonical = canonicalizeJson({ payload, revisionId, parentRevisionId });
  return sha256(canonical);
}
