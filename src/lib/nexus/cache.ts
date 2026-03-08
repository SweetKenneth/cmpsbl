/**
 * CMPSBL® NEXUS Cache
 * Intelligent response caching with TTL tiers, LRU eviction, and cost tracking
 *
 * CLM-Granted Upgrades:
 * ✅ [CLM#8]  Tiered TTL (short/medium/long by category)
 * ✅ [CLM#26] Cost-aware caching (track savings per cache hit)
 * ✅ [CLM#11] LRU eviction with bounded capacity
 */

interface CachedResponse {
  content: string;
  model: string;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttlMs: number;
  estimatedCostCents: number;
  category: CacheCategory;
}

export type CacheCategory = 'chat' | 'analysis' | 'generation' | 'system' | 'default';

// ═══════════════════════════════════════════════════════════════════
// CLM#8: Tiered TTL by Category
// ═══════════════════════════════════════════════════════════════════
const CATEGORY_TTL: Record<CacheCategory, number> = {
  chat: 5 * 60 * 1000,         // 5 min — conversational, stale fast
  analysis: 30 * 60 * 1000,    // 30 min — analytical queries
  generation: 60 * 60 * 1000,  // 1 hour — code generation, stable
  system: 2 * 60 * 60 * 1000,  // 2 hours — system status, rarely changes
  default: 60 * 60 * 1000,     // 1 hour fallback
};

// ═══════════════════════════════════════════════════════════════════
// CLM#26: Cost Tracking
// ═══════════════════════════════════════════════════════════════════
interface CacheCostMetrics {
  totalHits: number;
  totalMisses: number;
  estimatedSavingsCents: number;
  avgResponseSavedMs: number;
}

const costMetrics: CacheCostMetrics = {
  totalHits: 0,
  totalMisses: 0,
  estimatedSavingsCents: 0,
  avgResponseSavedMs: 0,
};

// ═══════════════════════════════════════════════════════════════════
// CLM#11: LRU Cache with Bounded Capacity
// ═══════════════════════════════════════════════════════════════════
const MAX_CACHE_SIZE = 500;

let responseCache = new Map<string, CachedResponse>();

/**
 * Clear all cached responses
 */
export function clearCache(): void {
  responseCache = new Map<string, CachedResponse>();
}

/**
 * Generate cache key from prompt (normalized)
 * Uses FNV-1a 32-bit hash + length discriminator to reduce collisions
 */
function generateCacheKey(prompt: string): string {
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
  // FNV-1a 32-bit — better distribution than djb2
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Include length to disambiguate collisions
  return `nc-${(hash >>> 0).toString(36)}-${normalized.length}`;
}

/**
 * Detect cache category from prompt content
 */
function detectCategory(prompt: string): CacheCategory {
  const lower = prompt.toLowerCase();
  if (/\b(status|health|config|system|module)\b/.test(lower)) return 'system';
  if (/\b(generate|create|build|code|implement)\b/.test(lower)) return 'generation';
  if (/\b(analyze|report|compare|statistics|metrics)\b/.test(lower)) return 'analysis';
  if (/\b(chat|hello|hi|question|what|how|why)\b/.test(lower)) return 'chat';
  return 'default';
}

/**
 * Evict least recently used entries when cache exceeds capacity
 */
function evictLRU(): number {
  if (responseCache.size <= MAX_CACHE_SIZE) return 0;

  const entries = Array.from(responseCache.entries())
    .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

  const toEvict = entries.slice(0, Math.ceil(MAX_CACHE_SIZE * 0.2)); // Evict 20%
  for (const [key] of toEvict) {
    responseCache.delete(key);
  }
  return toEvict.length;
}

/**
 * Store response in cache with tiered TTL
 */
export async function cacheResponse(
  prompt: string,
  response: Omit<CachedResponse, 'accessCount' | 'lastAccessed' | 'ttlMs' | 'category' | 'estimatedCostCents'> & { estimatedCostCents?: number },
  category?: CacheCategory
): Promise<void> {
  const cat = category || detectCategory(prompt);
  const key = generateCacheKey(prompt);

  // Evict before inserting
  evictLRU();

  responseCache.set(key, {
    ...response,
    timestamp: Date.now(),
    accessCount: 0,
    lastAccessed: Date.now(),
    ttlMs: CATEGORY_TTL[cat],
    estimatedCostCents: response.estimatedCostCents || 0,
    category: cat,
  });
}

/**
 * Retrieve cached response if available and not expired
 */
export async function getCachedResponse(
  prompt: string
): Promise<(CachedResponse & { cacheHit: true }) | null> {
  const key = generateCacheKey(prompt);
  const cached = responseCache.get(key);

  if (!cached) {
    costMetrics.totalMisses++;
    return null;
  }

  // Check TTL
  const age = Date.now() - cached.timestamp;
  if (age > cached.ttlMs) {
    responseCache.delete(key);
    costMetrics.totalMisses++;
    return null;
  }

  // Update access tracking
  cached.accessCount++;
  cached.lastAccessed = Date.now();

  // Track cost savings
  costMetrics.totalHits++;
  costMetrics.estimatedSavingsCents += cached.estimatedCostCents;

  return { ...cached, cacheHit: true as const };
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  let cleared = 0;
  const now = Date.now();

  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > value.ttlMs) {
      responseCache.delete(key);
      cleared++;
    }
  }

  return cleared;
}

/**
 * Get comprehensive cache statistics
 */
export async function getCacheStats(): Promise<{
  total_entries: number;
  memory_usage: number;
  hit_rate: number;
  total_hits: number;
  total_misses: number;
  estimated_savings_cents: number;
  entries_by_category: Record<CacheCategory, number>;
  avg_access_count: number;
  lru_eviction_threshold: number;
}> {
  const entries = Array.from(responseCache.values());
  const totalAccesses = costMetrics.totalHits + costMetrics.totalMisses;

  const byCategory: Record<CacheCategory, number> = {
    chat: 0, analysis: 0, generation: 0, system: 0, default: 0,
  };
  let totalAccessCount = 0;

  for (const entry of entries) {
    byCategory[entry.category]++;
    totalAccessCount += entry.accessCount;
  }

  return {
    total_entries: responseCache.size,
    memory_usage: responseCache.size * 1024,
    hit_rate: totalAccesses > 0 ? costMetrics.totalHits / totalAccesses : 0,
    total_hits: costMetrics.totalHits,
    total_misses: costMetrics.totalMisses,
    estimated_savings_cents: costMetrics.estimatedSavingsCents,
    entries_by_category: byCategory,
    avg_access_count: entries.length > 0 ? totalAccessCount / entries.length : 0,
    lru_eviction_threshold: MAX_CACHE_SIZE,
  };
}

/**
 * Reset cost metrics (for testing or period rollover)
 */
export function resetCostMetrics(): void {
  costMetrics.totalHits = 0;
  costMetrics.totalMisses = 0;
  costMetrics.estimatedSavingsCents = 0;
  costMetrics.avgResponseSavedMs = 0;
}
