/**
 * Scan Result Cache with TTL
 * Prevents redundant scans within a configurable window.
 * Subscribers can tune TTL per scan mode.
 */

export interface CachedScanResult {
  key: string;
  result: unknown;
  createdAt: number;
  ttl: number;
  hitCount: number;
  source: string;
}

export interface ScanCacheConfig {
  defaultTtlMs: number;
  maxEntries: number;
  ttlOverrides?: Record<string, number>;
}

const DEFAULT_CONFIG: ScanCacheConfig = {
  defaultTtlMs: 60_000, // 1 minute
  maxEntries: 50,
  ttlOverrides: {
    full: 120_000,
    quick: 30_000,
    branding: 300_000,
    seo: 180_000,
  },
};

const cache = new Map<string, CachedScanResult>();
let config = { ...DEFAULT_CONFIG };

export function configureScanCache(overrides: Partial<ScanCacheConfig>): void {
  config = { ...config, ...overrides };
}

function generateKey(mode: string, opts?: Record<string, unknown>): string {
  const optsHash = opts ? JSON.stringify(opts) : '';
  return `scan:${mode}:${optsHash}`;
}

function isExpired(entry: CachedScanResult): boolean {
  return Date.now() - entry.createdAt > entry.ttl;
}

function evictExpired(): void {
  for (const [key, entry] of cache) {
    if (isExpired(entry)) cache.delete(key);
  }
}

function evictLRU(): void {
  if (cache.size <= config.maxEntries) return;
  let oldest: string | null = null;
  let oldestTime = Infinity;
  for (const [key, entry] of cache) {
    if (entry.createdAt < oldestTime) {
      oldestTime = entry.createdAt;
      oldest = key;
    }
  }
  if (oldest) cache.delete(oldest);
}

export function getCachedScan(mode: string, opts?: Record<string, unknown>): unknown | null {
  evictExpired();
  const key = generateKey(mode, opts);
  const entry = cache.get(key);
  if (!entry || isExpired(entry)) {
    if (entry) cache.delete(key);
    return null;
  }
  entry.hitCount++;
  return entry.result;
}

export function setCachedScan(
  mode: string,
  result: unknown,
  opts?: Record<string, unknown>,
): void {
  evictExpired();
  evictLRU();
  const key = generateKey(mode, opts);
  const ttl = config.ttlOverrides?.[mode] ?? config.defaultTtlMs;
  cache.set(key, {
    key,
    result,
    createdAt: Date.now(),
    ttl,
    hitCount: 0,
    source: mode,
  });
}

export function invalidateScanCache(mode?: string): void {
  if (!mode) {
    cache.clear();
    return;
  }
  for (const [key] of cache) {
    if (key.startsWith(`scan:${mode}:`)) cache.delete(key);
  }
}

export function getScanCacheStats(): {
  entries: number;
  totalHits: number;
  modes: string[];
} {
  evictExpired();
  let totalHits = 0;
  const modes = new Set<string>();
  for (const entry of cache.values()) {
    totalHits += entry.hitCount;
    modes.add(entry.source);
  }
  return { entries: cache.size, totalHits, modes: Array.from(modes) };
}
