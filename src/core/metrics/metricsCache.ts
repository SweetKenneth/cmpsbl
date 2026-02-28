/**
 * GOAL — Metrics Registry Cache
 * TTL-based cache to avoid hammering adapters on every snapshot.
 * Adapters are called at most once per TTL interval.
 */

import type { ModuleLiveMetrics } from './metricsSchema';

interface CachedMetrics {
  metrics: ModuleLiveMetrics;
  cachedAt: number;
}

const cache = new Map<string, CachedMetrics>();
const DEFAULT_TTL_MS = 60_000; // 1 minute

/**
 * Get cached metrics for a module, or null if stale/missing.
 */
export function getCachedMetrics(moduleId: string, ttlMs = DEFAULT_TTL_MS): ModuleLiveMetrics | null {
  const entry = cache.get(moduleId);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > ttlMs) {
    cache.delete(moduleId);
    return null;
  }
  return entry.metrics;
}

/**
 * Store metrics in cache.
 */
export function setCachedMetrics(moduleId: string, metrics: ModuleLiveMetrics): void {
  cache.set(moduleId, { metrics, cachedAt: Date.now() });
}

/**
 * Invalidate cache for a specific module.
 */
export function invalidateCache(moduleId: string): void {
  cache.delete(moduleId);
}

/**
 * Invalidate all cached metrics.
 */
export function invalidateAllCaches(): void {
  cache.clear();
}

/**
 * Get cache stats for observability.
 */
export function getCacheStats(): {
  size: number;
  moduleIds: string[];
  oldestAge: number;
} {
  const ages = Array.from(cache.values()).map(e => Date.now() - e.cachedAt);
  return {
    size: cache.size,
    moduleIds: Array.from(cache.keys()),
    oldestAge: ages.length > 0 ? Math.max(...ages) : 0,
  };
}
