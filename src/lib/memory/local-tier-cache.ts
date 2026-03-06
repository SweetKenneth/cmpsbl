/**
 * LocalTierCache — 2-tier (hot + warm) read-through cache for substrate nodes
 *
 * Each consuming node (BRAIN, DREAM, ENCODE, DECODE, EVOLUTION, etc.)
 * instantiates its own LocalTierCache. Lookups check hot → warm → central MEMORY.
 * Entries promote on access; demote on capacity overflow via LRU.
 *
 * Architecture:
 *   Node hot (Map)  →  Node warm (Map)  →  Central MEMORY (cold/archive)
 *   < 1 ms recall      ~2 ms recall         ~10–100 ms recall
 */

export interface LocalCacheEntry<T = unknown> {
  key: string;
  value: T;
  lastAccess: number;   // Unix ms
  accessCount: number;
  insertedAt: number;    // Unix ms
}

export interface LocalTierCacheConfig {
  /** Owning node identifier (e.g. 'brain', 'dream', 'encode') */
  nodeId: string;
  /** Max entries in hot tier (default: 128) */
  hotCapacity?: number;
  /** Max entries in warm tier (default: 512) */
  warmCapacity?: number;
  /** Hot → warm demotion threshold in ms since last access (default: 5 min) */
  hotTtlMs?: number;
  /** Warm eviction threshold in ms since last access (default: 30 min) */
  warmTtlMs?: number;
  /** Optional central MEMORY fallback — async lookup */
  centralFallback?: (key: string) => Promise<unknown | null>;
}

export interface CacheStats {
  nodeId: string;
  hotSize: number;
  warmSize: number;
  hotCapacity: number;
  warmCapacity: number;
  hits: { hot: number; warm: number; central: number };
  misses: number;
  promotions: number;
  demotions: number;
  evictions: number;
}

export class LocalTierCache<T = unknown> {
  private hot: Map<string, LocalCacheEntry<T>> = new Map();
  private warm: Map<string, LocalCacheEntry<T>> = new Map();

  private readonly nodeId: string;
  private readonly hotCapacity: number;
  private readonly warmCapacity: number;
  private readonly hotTtlMs: number;
  private readonly warmTtlMs: number;
  private readonly centralFallback?: (key: string) => Promise<T | null>;

  // Telemetry
  private stats = { hotHits: 0, warmHits: 0, centralHits: 0, misses: 0, promotions: 0, demotions: 0, evictions: 0 };

  constructor(config: LocalTierCacheConfig) {
    this.nodeId = config.nodeId;
    this.hotCapacity = config.hotCapacity ?? 128;
    this.warmCapacity = config.warmCapacity ?? 512;
    this.hotTtlMs = config.hotTtlMs ?? 5 * 60 * 1000;        // 5 min
    this.warmTtlMs = config.warmTtlMs ?? 30 * 60 * 1000;      // 30 min
    this.centralFallback = config.centralFallback as ((key: string) => Promise<T | null>) | undefined;
  }

  // ─── Public API ─────────────────────────────────────────

  /**
   * Read-through lookup: hot → warm → central MEMORY
   * Promotes on hit; returns null on full miss.
   * FIX #10: Central fallback errors are now caught instead of propagating
   */
  async get(key: string): Promise<T | null> {
    const now = Date.now();

    // 1. Hot tier
    const hotEntry = this.hot.get(key);
    if (hotEntry) {
      hotEntry.lastAccess = now;
      hotEntry.accessCount++;
      this.stats.hotHits++;
      return hotEntry.value;
    }

    // 2. Warm tier → promote to hot
    const warmEntry = this.warm.get(key);
    if (warmEntry) {
      this.stats.warmHits++;
      this.promote(key, warmEntry);
      return warmEntry.value;
    }

    // 3. Central MEMORY fallback (with error isolation)
    if (this.centralFallback) {
      try {
        const centralValue = await this.centralFallback(key);
        if (centralValue !== null && centralValue !== undefined) {
          this.stats.centralHits++;
          this.put(key, centralValue);
          return centralValue;
        }
      } catch (err) {
        // FIX #10: Don't let central fallback errors crash the cache
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[LocalTierCache:${this.nodeId}] Central fallback error for "${key}": ${msg}`);
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Insert or update an entry — always lands in hot tier first.
   */
  put(key: string, value: T): void {
    const now = Date.now();

    // Remove from warm if migrating up
    this.warm.delete(key);

    this.ensureHotCapacity();
    this.hot.set(key, {
      key,
      value,
      lastAccess: now,
      accessCount: 1,
      insertedAt: now,
    });
  }

  /**
   * Explicitly remove an entry from all tiers.
   */
  invalidate(key: string): boolean {
    const hotDel = this.hot.delete(key);
    const warmDel = this.warm.delete(key);
    return hotDel || warmDel;
  }

  /**
   * Run a maintenance pass — demote stale hot entries, evict stale warm entries.
   * Call this on a timer or before bulk operations.
   */
  maintain(): { demoted: number; evicted: number } {
    const now = Date.now();
    let demoted = 0;
    let evicted = 0;

    // Demote stale hot → warm
    for (const [key, entry] of this.hot) {
      if (now - entry.lastAccess > this.hotTtlMs) {
        this.hot.delete(key);
        this.ensureWarmCapacity();
        this.warm.set(key, entry);
        demoted++;
        this.stats.demotions++;
      }
    }

    // Evict stale warm entries (they fall back to central MEMORY on next access)
    for (const [key, entry] of this.warm) {
      if (now - entry.lastAccess > this.warmTtlMs) {
        this.warm.delete(key);
        evicted++;
        this.stats.evictions++;
      }
    }

    return { demoted, evicted };
  }

  /**
   * Bulk-warm the cache with entries (e.g. on node startup).
   */
  preload(entries: Array<{ key: string; value: T }>): void {
    for (const { key, value } of entries) {
      this.put(key, value);
    }
  }

  /**
   * Get current cache telemetry.
   */
  getStats(): CacheStats {
    return {
      nodeId: this.nodeId,
      hotSize: this.hot.size,
      warmSize: this.warm.size,
      hotCapacity: this.hotCapacity,
      warmCapacity: this.warmCapacity,
      hits: {
        hot: this.stats.hotHits,
        warm: this.stats.warmHits,
        central: this.stats.centralHits,
      },
      misses: this.stats.misses,
      promotions: this.stats.promotions,
      demotions: this.stats.demotions,
      evictions: this.stats.evictions,
    };
  }

  /**
   * Clear all local tiers. Central MEMORY is unaffected.
   */
  flush(): void {
    this.hot.clear();
    this.warm.clear();
  }

  // ─── Internals ──────────────────────────────────────────

  /** Promote a warm entry to hot */
  private promote(key: string, entry: LocalCacheEntry<T>): void {
    this.warm.delete(key);
    this.ensureHotCapacity();
    entry.lastAccess = Date.now();
    entry.accessCount++;
    this.hot.set(key, entry);
    this.stats.promotions++;
  }

  /** Evict LRU from hot → warm if at capacity */
  private ensureHotCapacity(): void {
    if (this.hot.size < this.hotCapacity) return;
    const lruKey = this.findLRU(this.hot);
    if (!lruKey) return;
    const evicted = this.hot.get(lruKey)!;
    this.hot.delete(lruKey);
    this.ensureWarmCapacity();
    this.warm.set(lruKey, evicted);
    this.stats.demotions++;
  }

  /** Evict LRU from warm (drops to central) if at capacity */
  private ensureWarmCapacity(): void {
    if (this.warm.size < this.warmCapacity) return;
    const lruKey = this.findLRU(this.warm);
    if (!lruKey) return;
    this.warm.delete(lruKey);
    this.stats.evictions++;
  }

  /** Find the least-recently-used key in a Map */
  private findLRU(tier: Map<string, LocalCacheEntry<T>>): string | null {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    for (const [key, entry] of tier) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }
    return oldestKey;
  }
}

// ─── Factory: Create per-node caches with sensible defaults ───

const nodeCaches = new Map<string, LocalTierCache>();

/**
 * Get or create a LocalTierCache for a substrate node.
 * Singleton per nodeId — safe to call multiple times.
 */
export function getNodeCache<T = unknown>(
  nodeId: string,
  config?: Partial<Omit<LocalTierCacheConfig, 'nodeId'>>,
): LocalTierCache<T> {
  const existing = nodeCaches.get(nodeId);
  if (existing) return existing as LocalTierCache<T>;

  const cache = new LocalTierCache<T>({ nodeId, ...config });
  nodeCaches.set(nodeId, cache as LocalTierCache);
  return cache;
}

/**
 * Get stats across all active node caches.
 */
export function getAllNodeCacheStats(): CacheStats[] {
  return Array.from(nodeCaches.values()).map(c => c.getStats());
}

/**
 * Run maintenance on all node caches.
 */
export function maintainAllCaches(): { nodeId: string; demoted: number; evicted: number }[] {
  return Array.from(nodeCaches.entries()).map(([nodeId, cache]) => ({
    nodeId,
    ...cache.maintain(),
  }));
}
