/**
 * ACCESS Ultimate — System 8: Entitlement Resolution Cache
 * 
 * O(1) entitlement lookups via in-memory cache with TTL,
 * cache invalidation on tier/scope changes, fallback to DB,
 * and per-request entitlement snapshots for audit.
 * 
 * @module access/ultimate/entitlementCache
 */

// ── Types ────────────────────────────────────────────────────────

export interface CachedEntitlement {
  keyId: string;
  developerId: string;
  tier: string;
  scopes: string[];
  ratePerMinute: number;
  ratePerDay: number;
  monthlyQuota: number;
  features: string[];
  cachedAt: number;
  ttlMs: number;
  accessCount: number;
}

export interface EntitlementSnapshot {
  id: string;
  keyId: string;
  entitlement: CachedEntitlement;
  requestContext: string;
  snapshotAt: number;
}

export interface EntitlementCacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  avgAccessCount: number;
  snapshotCount: number;
}

// ── Constants ────────────────────────────────────────────────────

const DEFAULT_TTL_MS = 300_000; // 5 minutes
const MAX_CACHE_SIZE = 2000;
const MAX_SNAPSHOTS = 1000;

// ── State ────────────────────────────────────────────────────────

const cache: Map<string, CachedEntitlement> = new Map();
const snapshots: EntitlementSnapshot[] = [];
let hitCount = 0;
let missCount = 0;
let evictionCount = 0;

// ── Core API ────────────────────────────────────────────────────

/** Cache an entitlement */
export function cacheEntitlement(
  keyId: string,
  developerId: string,
  entitlement: {
    tier: string;
    scopes: string[];
    ratePerMinute: number;
    ratePerDay: number;
    monthlyQuota: number;
    features: string[];
  },
  ttlMs: number = DEFAULT_TTL_MS,
): CachedEntitlement {
  const entry: CachedEntitlement = {
    keyId, developerId,
    ...entitlement,
    cachedAt: Date.now(),
    ttlMs,
    accessCount: 0,
  };

  cache.set(keyId, entry);
  if (cache.size > MAX_CACHE_SIZE) evictExpired();

  return entry;
}

/** Resolve entitlement (O(1) cache lookup) */
export function resolveEntitlement(keyId: string): CachedEntitlement | null {
  const entry = cache.get(keyId);

  if (!entry) {
    missCount++;
    return null;
  }

  // Check TTL
  if (Date.now() - entry.cachedAt > entry.ttlMs) {
    cache.delete(keyId);
    evictionCount++;
    missCount++;
    return null;
  }

  hitCount++;
  entry.accessCount++;
  return entry;
}

/** Invalidate cache for a key (on tier change, scope update, rotation) */
export function invalidateEntitlement(keyId: string): boolean {
  const deleted = cache.delete(keyId);
  if (deleted) evictionCount++;
  return deleted;
}

/** Invalidate all cache entries for a developer */
export function invalidateDeveloper(developerId: string): number {
  let count = 0;
  for (const [key, entry] of cache) {
    if (entry.developerId === developerId) {
      cache.delete(key);
      evictionCount++;
      count++;
    }
  }
  return count;
}

/** Take an entitlement snapshot for audit */
export function snapshotEntitlement(keyId: string, requestContext: string): EntitlementSnapshot | null {
  const entry = resolveEntitlement(keyId);
  if (!entry) return null;

  const snapshot: EntitlementSnapshot = {
    id: `esnap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    keyId,
    entitlement: { ...entry },
    requestContext,
    snapshotAt: Date.now(),
  };

  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);

  return snapshot;
}

/** Warm up cache with batch entries */
export function warmUpCache(
  entries: Array<{
    keyId: string;
    developerId: string;
    tier: string;
    scopes: string[];
    ratePerMinute: number;
    ratePerDay: number;
    monthlyQuota: number;
    features: string[];
  }>,
): number {
  let warmed = 0;
  for (const entry of entries) {
    cacheEntitlement(entry.keyId, entry.developerId, entry);
    warmed++;
  }
  return warmed;
}

/** Evict expired entries */
function evictExpired(): void {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.cachedAt > entry.ttlMs) {
      cache.delete(key);
      evictionCount++;
    }
  }

  // If still over limit, evict least accessed
  if (cache.size > MAX_CACHE_SIZE) {
    const sorted = [...cache.entries()].sort((a, b) => a[1].accessCount - b[1].accessCount);
    const toEvict = sorted.slice(0, cache.size - MAX_CACHE_SIZE + 100);
    for (const [key] of toEvict) {
      cache.delete(key);
      evictionCount++;
    }
  }
}

// ── Query ────────────────────────────────────────────────────────

export function getCachedKeys(): string[] { return [...cache.keys()]; }
export function getEntitlementSnapshots(keyId?: string, count?: number): EntitlementSnapshot[] {
  let filtered = keyId ? snapshots.filter(s => s.keyId === keyId) : snapshots;
  if (count) filtered = filtered.slice(-count);
  return filtered;
}

export function getEntitlementCacheStats(): EntitlementCacheStats {
  const entries = [...cache.values()];
  const total = hitCount + missCount;
  return {
    totalEntries: cache.size,
    hitCount,
    missCount,
    hitRate: total > 0 ? Math.round((hitCount / total) * 1000) / 1000 : 0,
    evictionCount,
    avgAccessCount: entries.length > 0
      ? Math.round(entries.reduce((s, e) => s + e.accessCount, 0) / entries.length * 10) / 10
      : 0,
    snapshotCount: snapshots.length,
  };
}

export function resetEntitlementCache(): void {
  cache.clear();
  snapshots.length = 0;
  hitCount = 0;
  missCount = 0;
  evictionCount = 0;
}
