/**
 * CMPSBL® NEXUS Cache
 * Intelligent response caching and retrieval
 */

interface CachedResponse {
  content: string;
  model: string;
  timestamp: number;
}

// In-memory cache (in production, use Redis or Supabase)
let responseCache = new Map<string, CachedResponse>();

/**
 * Clear all cached responses
 */
export function clearCache(): void {
  responseCache = new Map<string, CachedResponse>();
}

// Cache TTL: 1 hour
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Generate cache key from prompt
 */
function generateCacheKey(prompt: string): string {
  // Simple hash for now; in production use proper hash function
  return btoa(prompt.toLowerCase().trim()).substring(0, 64);
}

/**
 * Store response in cache
 */
export async function cacheResponse(
  prompt: string,
  response: CachedResponse
): Promise<void> {
  const key = generateCacheKey(prompt);
  responseCache.set(key, {
    ...response,
    timestamp: Date.now(),
  });

  // In production, also store in Supabase for persistence
  // await supabase.from('nexus_cache').upsert({ key, ...response });
}

/**
 * Retrieve cached response if available and not expired
 */
export async function getCachedResponse(
  prompt: string
): Promise<CachedResponse | null> {
  const key = generateCacheKey(prompt);
  const cached = responseCache.get(key);

  if (!cached) return null;

  // Check if cache is still valid
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }

  return cached;
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  let cleared = 0;
  const now = Date.now();

  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      responseCache.delete(key);
      cleared++;
    }
  }

  return cleared;
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  return {
    total_entries: responseCache.size,
    memory_usage: responseCache.size * 1024, // Rough estimate
  };
}
