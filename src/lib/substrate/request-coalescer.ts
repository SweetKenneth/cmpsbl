/**
 * Request Coalescer — Deduplicates identical in-flight requests
 * If two callers request the same operation simultaneously, only one executes
 */

const inflight = new Map<string, Promise<unknown>>();
const inflightTimestamps = new Map<string, number>();
const stats = { coalesced: 0, total: 0 };
const MAX_INFLIGHT_AGE_MS = 60_000; // Safety net: evict stuck promises after 60s

/** Generate a cache key from module + action + payload hash */
function makeKey(module: string, action: string, payload?: unknown): string {
  const p = payload ? JSON.stringify(payload) : '';
  return `${module}:${action}:${p}`;
}

/**
 * Coalesce identical requests. If the same request is in-flight,
 * returns the existing promise instead of starting a new one.
 */
export async function coalesce<T>(
  module: string,
  action: string,
  payload: unknown,
  executor: () => Promise<T>,
): Promise<T> {
  stats.total++;
  const key = makeKey(module, action, payload);

  // Evict stale entries (safety net for stuck promises)
  const now = Date.now();
  const staleTs = inflightTimestamps.get(key);
  if (staleTs && now - staleTs > MAX_INFLIGHT_AGE_MS) {
    inflight.delete(key);
    inflightTimestamps.delete(key);
  }

  const existing = inflight.get(key);
  if (existing) {
    stats.coalesced++;
    return existing as Promise<T>;
  }

  const promise = executor().finally(() => {
    inflight.delete(key);
    inflightTimestamps.delete(key);
  });

  inflight.set(key, promise);
  inflightTimestamps.set(key, now);
  return promise;
}

export function getCoalescerStats() {
  return {
    ...stats,
    inFlight: inflight.size,
    ratio: stats.total > 0 ? (stats.coalesced / stats.total * 100).toFixed(1) + '%' : '0%',
  };
}

export function resetCoalescerStats(): void {
  stats.coalesced = 0;
  stats.total = 0;
}
