/**
 * Request Coalescer — Deduplicates identical in-flight requests
 * If two callers request the same operation simultaneously, only one executes
 * 
 * Optimized: single Map with embedded timestamps, FNV-1a hash for key generation
 */

interface InflightEntry {
  promise: Promise<unknown>;
  ts: number;
}

const inflight = new Map<string, InflightEntry>();
const stats = { coalesced: 0, total: 0 };
const MAX_INFLIGHT_AGE_MS = 60_000;

/** FNV-1a-inspired fast string hash to avoid full JSON.stringify comparison */
function fastHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) | 0;
  }
  return h >>> 0;
}

/** Generate a cache key from module + action + payload hash */
function makeKey(module: string, action: string, payload?: unknown): string {
  if (!payload) return `${module}:${action}`;
  const p = JSON.stringify(payload);
  // For short payloads, inline; for long ones, use hash to reduce Map key memory
  return p.length < 128 ? `${module}:${action}:${p}` : `${module}:${action}:#${fastHash(p)}`;
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
  const now = Date.now();

  // Check existing entry — evict if stale
  const existing = inflight.get(key);
  if (existing) {
    if (now - existing.ts > MAX_INFLIGHT_AGE_MS) {
      inflight.delete(key);
    } else {
      stats.coalesced++;
      return existing.promise as Promise<T>;
    }
  }

  const promise = executor().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, { promise, ts: now });
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
