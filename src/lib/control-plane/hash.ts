/**
 * Canonical JSON + SHA-256 Hashing
 * Provides tamper-evident snapshot hashing via WebCrypto.
 */

/**
 * Produce a stable JSON string with sorted keys (deep).
 */
export function canonicalizeJson(obj: unknown): string {
  return JSON.stringify(sortKeys(obj));
}

function sortKeys(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(sortKeys);
  if (typeof val === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
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
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback: djb2 hash (not cryptographic, but functional)
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
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
