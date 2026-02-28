/**
 * Request Deduplicator — Prevents duplicate concurrent fetch requests
 * System-level middleware for any HTTP call deduplication
 */

const pending = new Map<string, Promise<Response>>();

function requestKey(url: string, init?: RequestInit): string {
  const method = init?.method?.toUpperCase() || 'GET';
  if (method !== 'GET') return ''; // Only dedup GETs
  return `${method}:${url}`;
}

/**
 * Deduplicated fetch. Identical GET requests in-flight share one promise.
 */
export async function dedupFetch(url: string, init?: RequestInit): Promise<Response> {
  const key = requestKey(url, init);
  if (!key) return fetch(url, init); // Non-GET: pass through

  const existing = pending.get(key);
  if (existing) return existing.then(r => r.clone());

  const promise = fetch(url, init).finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
}

export function getPendingCount(): number {
  return pending.size;
}

export function clearPending(): void {
  pending.clear();
}
