/**
 * Production Caching System
 * Safe caching for read-heavy widgets with TTL and invalidation
 */

export interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  ttlMs: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry<unknown>>();
  private focusedTab = true;
  private readonly maxSize = 500;

  private constructor() {
    // Track tab focus for polling backoff
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => { this.focusedTab = true; });
      window.addEventListener('blur', () => { this.focusedTab = false; });
    }
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.fetchedAt > entry.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number = 5000): void {
    this.cache.set(key, {
      data,
      fetchedAt: Date.now(),
      ttlMs,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  isTabFocused(): boolean {
    return this.focusedTab;
  }

  // Get effective polling interval based on tab focus
  getPollingInterval(baseMs: number): number {
    return this.focusedTab ? baseMs : baseMs * 4; // 4x slower when unfocused
  }

  // Get cache stats for monitoring
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheManager = CacheManager.getInstance();

// Preset TTLs for common use cases
export const CacheTTL = {
  /** 5 seconds - for frequently updating data */
  SHORT: 5000,
  /** 30 seconds - for moderately updating data */
  MEDIUM: 30000,
  /** 2 minutes - for slowly updating data */
  LONG: 120000,
  /** 5 minutes - for static-ish data */
  EXTENDED: 300000,
} as const;

// Helper to wrap async functions with caching
export function withCache<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string,
  ttlMs: number = CacheTTL.SHORT
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);
    const cached = cacheManager.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cacheManager.set(key, result, ttlMs);
    return result;
  };
}
