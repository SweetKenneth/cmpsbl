/**
 * SingleFlight — Auth-aware request deduplication with revalidation
 * Replaces the legacy requestDedup.ts with scope-safe coalescing
 */

import { generateCoalesceKey, type CoalesceContext } from './hash';
import { findPolicy, needsRevalidation } from './policies';

interface PendingEntry {
  promise: Promise<Response>;
  cached_at: number;
}

const pending = new Map<string, PendingEntry>();

/**
 * Deduplicated fetch with auth-scope awareness and revalidation
 */
export async function singleFlightFetch(
  url: string,
  init: RequestInit | undefined,
  context: CoalesceContext
): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';

  // Only dedup safe methods
  if (method !== 'GET' && method !== 'HEAD') {
    return fetch(url, init);
  }

  const key = await generateCoalesceKey(url, method, null, context);

  // Check for existing pending request
  const existing = pending.get(key);
  if (existing) {
    // Check revalidation policy
    const policy = findPolicy(url);
    if (!needsRevalidation(existing.cached_at, policy)) {
      return existing.promise.then(r => r.clone());
    }
    // Stale — remove and re-fetch
    pending.delete(key);
  }

  const promise = fetch(url, init).finally(() => {
    // Clean up after a short delay to catch rapid duplicates
    setTimeout(() => pending.delete(key), 100);
  });

  pending.set(key, { promise, cached_at: Date.now() });
  return promise;
}

/** Get count of in-flight dedup'd requests */
export function getPendingCount(): number {
  return pending.size;
}

/** Clear all pending entries */
export function clearPending(): void {
  pending.clear();
}
