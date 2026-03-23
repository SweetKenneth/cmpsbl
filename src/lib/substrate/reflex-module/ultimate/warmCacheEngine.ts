/**
 * REFLEX Ultimate — System 7: Warm Cache Engine
 * 
 * LRU + frequency-weighted decision cache with TTL management,
 * cache-hit ratio optimization, and warm-up strategies.
 * 
 * @module reflex/ultimate/warmCacheEngine
 */

// ── Types ────────────────────────────────────────────────────────

export interface CacheEntry {
  key: string;
  value: unknown;
  frequency: number;
  lastAccessedAt: number;
  createdAt: number;
  ttlMs: number;
  sizeEstimate: number;       // Bytes
}

export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;              // 0-100
  evictionCount: number;
  avgFrequency: number;
  estimatedSizeBytes: number;
  oldestEntryAge: number;      // Ms
}

// ── State ────────────────────────────────────────────────────────

const cache: Map<string, CacheEntry> = new Map();
const MAX_ENTRIES = 2000;
const DEFAULT_TTL_MS = 60_000; // 1 minute

let hitCount = 0;
let missCount = 0;
let evictionCount = 0;

// ── Core API ────────────────────────────────────────────────────

/** Put a value in the cache */
export function cachePut(key: string, value: unknown, ttlMs: number = DEFAULT_TTL_MS): void {
  const existing = cache.get(key);

  const entry: CacheEntry = {
    key, value,
    frequency: existing ? existing.frequency + 1 : 1,
    lastAccessedAt: Date.now(),
    createdAt: existing?.createdAt ?? Date.now(),
    ttlMs,
    sizeEstimate: JSON.stringify(value).length,
  };

  cache.set(key, entry);

  if (cache.size > MAX_ENTRIES) {
    evictLFU();
  }
}

/** Get a value from the cache */
export function cacheGet(key: string): { hit: boolean; value: unknown } {
  const entry = cache.get(key);

  if (!entry) {
    missCount++;
    return { hit: false, value: undefined };
  }

  // Check TTL
  if (Date.now() - entry.createdAt > entry.ttlMs) {
    cache.delete(key);
    missCount++;
    evictionCount++;
    return { hit: false, value: undefined };
  }

  entry.frequency++;
  entry.lastAccessedAt = Date.now();
  hitCount++;

  return { hit: true, value: entry.value };
}

/** Check if key exists and is valid */
export function cacheHas(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return false;
  if (Date.now() - entry.createdAt > entry.ttlMs) {
    cache.delete(key);
    return false;
  }
  return true;
}

/** Invalidate a cache entry */
export function cacheInvalidate(key: string): boolean {
  return cache.delete(key);
}

/** Invalidate all entries matching a prefix */
export function cacheInvalidatePrefix(prefix: string): number {
  let count = 0;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
      count++;
    }
  }
  return count;
}

/** Purge expired entries */
export function cachePurgeExpired(): number {
  let purged = 0;
  const now = Date.now();

  for (const [key, entry] of cache) {
    if (now - entry.createdAt > entry.ttlMs) {
      cache.delete(key);
      purged++;
      evictionCount++;
    }
  }

  return purged;
}

/** Warm up cache with pre-computed entries */
export function cacheWarmUp(entries: Array<{ key: string; value: unknown; ttlMs?: number }>): number {
  let warmed = 0;
  for (const e of entries) {
    if (!cache.has(e.key)) {
      cachePut(e.key, e.value, e.ttlMs ?? DEFAULT_TTL_MS);
      warmed++;
    }
  }
  return warmed;
}

// ── Eviction ────────────────────────────────────────────────────

function evictLFU(): void {
  // Evict entry with lowest frequency (LFU with LRU tiebreak)
  let minFreq = Infinity;
  let minKey = '';
  let minAccess = Infinity;

  for (const [key, entry] of cache) {
    if (entry.frequency < minFreq || (entry.frequency === minFreq && entry.lastAccessedAt < minAccess)) {
      minFreq = entry.frequency;
      minKey = key;
      minAccess = entry.lastAccessedAt;
    }
  }

  if (minKey) {
    cache.delete(minKey);
    evictionCount++;
  }
}

// ── Query ────────────────────────────────────────────────────────

export function getCacheStats(): CacheStats {
  const entries = Array.from(cache.values());
  const total = hitCount + missCount;
  const now = Date.now();

  return {
    totalEntries: cache.size,
    hitCount,
    missCount,
    hitRate: total > 0 ? Math.round((hitCount / total) * 10000) / 100 : 0,
    evictionCount,
    avgFrequency: entries.length > 0
      ? Math.round(entries.reduce((s, e) => s + e.frequency, 0) / entries.length * 10) / 10
      : 0,
    estimatedSizeBytes: entries.reduce((s, e) => s + e.sizeEstimate, 0),
    oldestEntryAge: entries.length > 0
      ? now - Math.min(...entries.map(e => e.createdAt))
      : 0,
  };
}

export function getCacheHealth() {
  const stats = getCacheStats();
  return {
    ...stats,
    healthScore: stats.hitRate > 0 ? Math.min(100, Math.round(stats.hitRate)) : 50,
  };
}

export function resetCache(): void {
  cache.clear();
  hitCount = 0;
  missCount = 0;
  evictionCount = 0;
}
