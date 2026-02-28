/**
 * Idempotency Key Manager — Prevents duplicate operations
 * Stores results of completed operations keyed by idempotency tokens
 */

interface IdempotencyEntry {
  key: string;
  result: unknown;
  status: 'pending' | 'complete' | 'failed';
  createdAt: number;
  expiresAt: number;
}

const store = new Map<string, IdempotencyEntry>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Clean expired entries */
function gc(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key);
  }
}

/** Execute with idempotency. Same key returns cached result. */
export async function withIdempotency<T>(
  key: string,
  executor: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  gc();

  const existing = store.get(key);
  if (existing) {
    if (existing.status === 'complete') return existing.result as T;
    if (existing.status === 'pending') {
      // Wait for completion (poll)
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          const e = store.get(key);
          if (!e || e.status === 'failed') { clearInterval(check); reject(new Error('Idempotent operation failed')); }
          if (e?.status === 'complete') { clearInterval(check); resolve(e.result as T); }
        }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error('Idempotency wait timeout')); }, 10000);
      });
    }
  }

  store.set(key, { key, result: null, status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + ttlMs });

  try {
    const result = await executor();
    store.set(key, { key, result, status: 'complete', createdAt: Date.now(), expiresAt: Date.now() + ttlMs });
    return result;
  } catch (err) {
    store.set(key, { key, result: err, status: 'failed', createdAt: Date.now(), expiresAt: Date.now() + ttlMs });
    throw err;
  }
}

export function hasKey(key: string): boolean {
  gc();
  return store.has(key);
}

export function clearKey(key: string): void {
  store.delete(key);
}

export function getIdempotencyStats() {
  gc();
  return { total: store.size, pending: [...store.values()].filter(e => e.status === 'pending').length };
}
