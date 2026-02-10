/**
 * Cognitive Warm Cache
 * v1.0.0 — Predictive caching for frequently-accessed cognitive data
 * 
 * Pre-warms cache based on access patterns, reducing latency
 * for memory recall, knowledge graph traversal, and context loading.
 */

export interface CacheEntry {
  key: string;
  value: unknown;
  accessCount: number;
  lastAccessAt: number;
  createdAt: number;
  ttlMs: number;
  size: number;
  tags: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
}

const cache = new Map<string, CacheEntry>();
let stats: CacheStats = { hits: 0, misses: 0, evictions: 0, hitRate: 0, totalSize: 0, entryCount: 0 };
const maxSize = 1000;

export function get(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) {
    stats.misses++;
    updateHitRate();
    return null;
  }
  if (Date.now() - entry.createdAt > entry.ttlMs) {
    cache.delete(key);
    stats.evictions++;
    updateHitRate();
    return null;
  }
  entry.accessCount++;
  entry.lastAccessAt = Date.now();
  stats.hits++;
  updateHitRate();
  return entry.value;
}

export function set(key: string, value: unknown, ttlMs: number = 300_000, tags: string[] = []): void {
  if (cache.size >= maxSize) evictLRU();
  const size = JSON.stringify(value).length;
  cache.set(key, { key, value, accessCount: 1, lastAccessAt: Date.now(), createdAt: Date.now(), ttlMs, size, tags });
  updateStats();
}

export function warmKeys(keys: string[], loader: (key: string) => unknown, ttlMs: number = 300_000): number {
  let warmed = 0;
  for (const key of keys) {
    if (!cache.has(key)) {
      const value = loader(key);
      if (value !== null && value !== undefined) {
        set(key, value, ttlMs);
        warmed++;
      }
    }
  }
  return warmed;
}

function evictLRU(): void {
  let oldest: CacheEntry | null = null;
  for (const entry of cache.values()) {
    if (!oldest || entry.lastAccessAt < oldest.lastAccessAt) oldest = entry;
  }
  if (oldest) {
    cache.delete(oldest.key);
    stats.evictions++;
  }
}

function updateHitRate(): void {
  const total = stats.hits + stats.misses;
  stats.hitRate = total > 0 ? stats.hits / total : 0;
}

function updateStats(): void {
  stats.entryCount = cache.size;
  stats.totalSize = Array.from(cache.values()).reduce((s, e) => s + e.size, 0);
}

export function invalidate(key: string): boolean { return cache.delete(key); }
export function invalidateByTag(tag: string): number {
  let count = 0;
  for (const [key, entry] of cache) {
    if (entry.tags.includes(tag)) { cache.delete(key); count++; }
  }
  return count;
}
export function clear(): void { cache.clear(); stats = { hits: 0, misses: 0, evictions: 0, hitRate: 0, totalSize: 0, entryCount: 0 }; }
export function getStats(): CacheStats { return { ...stats }; }
export function getHotKeys(limit: number = 10): string[] {
  return Array.from(cache.values()).sort((a, b) => b.accessCount - a.accessCount).slice(0, limit).map(e => e.key);
}
