/**
 * Persistent Rate Limiter
 * v1.0.0 — Cross-instance rate limiting with localStorage persistence
 * 
 * Survives page reloads, tab switches, and instance restarts.
 * Uses localStorage for persistence and BroadcastChannel for cross-tab sync.
 */

import { secureGet, secureSet, secureRemove } from '@/lib/system/secureStorage';

export interface PersistentBucket {
  key: string;
  tokens: number;
  maxTokens: number;
  refillRate: number; // tokens per second
  lastRefillAt: number;
  blockedUntil: number | null;
  totalRequests: number;
  totalBlocked: number;
}

export interface PersistentRateLimitConfig {
  maxTokens: number;
  refillRate: number;
  windowMs?: number;
}

export interface PersistentRateLimitResult {
  allowed: boolean;
  remainingTokens: number;
  retryAfterMs: number | null;
  totalRequests: number;
  totalBlocked: number;
}

const STORAGE_PREFIX = 'pf_rl_';
const CHANNEL_NAME = 'pf_rate_limit_sync';

class PersistentRateLimiter {
  private static instance: PersistentRateLimiter;
  private cache = new Map<string, PersistentBucket>();
  private channel: BroadcastChannel | null = null;

  private constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'bucket_update') {
            this.cache.set(event.data.key, event.data.bucket);
          }
        };
      } catch {
        // BroadcastChannel not available
      }
    }
  }

  static getInstance(): PersistentRateLimiter {
    if (!PersistentRateLimiter.instance) {
      PersistentRateLimiter.instance = new PersistentRateLimiter();
    }
    return PersistentRateLimiter.instance;
  }

  /** Check rate limit and consume a token */
  check(key: string, config: PersistentRateLimitConfig): PersistentRateLimitResult {
    const bucket = this.loadBucket(key, config);
    this.refill(bucket);

    // Check if blocked
    if (bucket.blockedUntil && Date.now() < bucket.blockedUntil) {
      bucket.totalRequests++;
      bucket.totalBlocked++;
      this.saveBucket(bucket);
      return {
        allowed: false,
        remainingTokens: 0,
        retryAfterMs: bucket.blockedUntil - Date.now(),
        totalRequests: bucket.totalRequests,
        totalBlocked: bucket.totalBlocked,
      };
    }

    bucket.blockedUntil = null;
    bucket.totalRequests++;

    if (bucket.tokens < 1) {
      bucket.totalBlocked++;
      const retryMs = config.windowMs || Math.ceil((1 / config.refillRate) * 1000);
      bucket.blockedUntil = Date.now() + retryMs;
      this.saveBucket(bucket);
      return {
        allowed: false,
        remainingTokens: 0,
        retryAfterMs: retryMs,
        totalRequests: bucket.totalRequests,
        totalBlocked: bucket.totalBlocked,
      };
    }

    bucket.tokens -= 1;
    this.saveBucket(bucket);

    return {
      allowed: true,
      remainingTokens: Math.floor(bucket.tokens),
      retryAfterMs: null,
      totalRequests: bucket.totalRequests,
      totalBlocked: bucket.totalBlocked,
    };
  }

  /** Get bucket status without consuming a token */
  peek(key: string): PersistentBucket | null {
    return this.cache.get(key) || this.loadFromStorage(key);
  }

  /** Reset a specific bucket */
  reset(key: string): void {
    this.cache.delete(key);
    secureRemove(STORAGE_PREFIX + key);
  }

  /** Get all active buckets */
  getAllBuckets(): PersistentBucket[] {
    this.loadAllFromStorage();
    return Array.from(this.cache.values());
  }

  /** Cleanup expired buckets */
  cleanup(): { cleaned: number; remaining: number } {
    const now = Date.now();
    const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours
    let cleaned = 0;

    for (const [key, bucket] of this.cache) {
      if (now - bucket.lastRefillAt > staleThreshold) {
        this.cache.delete(key);
        secureRemove(STORAGE_PREFIX + key);
        cleaned++;
      }
    }

    return { cleaned, remaining: this.cache.size };
  }

  /** Get stats across all buckets */
  stats(): {
    totalBuckets: number;
    totalRequests: number;
    totalBlocked: number;
    blockRate: number;
    activeBuckets: number;
  } {
    const buckets = this.getAllBuckets();
    const totalRequests = buckets.reduce((s, b) => s + b.totalRequests, 0);
    const totalBlocked = buckets.reduce((s, b) => s + b.totalBlocked, 0);

    return {
      totalBuckets: buckets.length,
      totalRequests,
      totalBlocked,
      blockRate: totalRequests > 0 ? (totalBlocked / totalRequests) * 100 : 0,
      activeBuckets: buckets.filter(b => Date.now() - b.lastRefillAt < 3600_000).length,
    };
  }

  private refill(bucket: PersistentBucket): void {
    const now = Date.now();
    const elapsedSec = (now - bucket.lastRefillAt) / 1000;
    const newTokens = elapsedSec * bucket.refillRate;
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + newTokens);
    bucket.lastRefillAt = now;
  }

  private loadBucket(key: string, config: PersistentRateLimitConfig): PersistentBucket {
    // Check cache first
    let bucket = this.cache.get(key);
    if (bucket) return bucket;

    // Try localStorage
    bucket = this.loadFromStorage(key);
    if (bucket) {
      this.cache.set(key, bucket);
      return bucket;
    }

    // Create new bucket
    bucket = {
      key,
      tokens: config.maxTokens,
      maxTokens: config.maxTokens,
      refillRate: config.refillRate,
      lastRefillAt: Date.now(),
      blockedUntil: null,
      totalRequests: 0,
      totalBlocked: 0,
    };
    this.cache.set(key, bucket);
    return bucket;
  }

  private loadFromStorage(key: string): PersistentBucket | null {
    try {
      return secureGet<PersistentBucket>(STORAGE_PREFIX + key);
    } catch {
      return null;
    }
  }

  private loadAllFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        // Check both obfuscated (_s_) and legacy prefix
        const prefix = storageKey?.startsWith('_s_') ? '_s_' + STORAGE_PREFIX : STORAGE_PREFIX;
        if (storageKey?.startsWith(prefix)) {
          const key = storageKey.slice(prefix.length);
          if (!this.cache.has(key)) {
            const bucket = this.loadFromStorage(key);
            if (bucket) this.cache.set(key, bucket);
          }
        }
      }
    } catch {
      // Storage access may fail in restricted contexts
    }
  }

  private saveBucket(bucket: PersistentBucket): void {
    this.cache.set(bucket.key, bucket);
    try {
      secureSet(STORAGE_PREFIX + bucket.key, bucket);
    } catch {
      // Storage full — cleanup old entries
      this.cleanup();
    }

    // Sync across tabs
    this.channel?.postMessage({ type: 'bucket_update', key: bucket.key, bucket });
  }
}

export const persistentRateLimiter = PersistentRateLimiter.getInstance();

/** Preset persistent rate limit configs */
export const PersistentRateLimitPresets = {
  /** Terminal commands: 30 tokens, refill 0.5/s */
  TERMINAL: { maxTokens: 30, refillRate: 0.5 },
  /** API calls: 60 tokens, refill 1/s */
  API: { maxTokens: 60, refillRate: 1.0 },
  /** Sensitive ops: 5 tokens, refill 0.083/s (5/min) */
  SENSITIVE: { maxTokens: 5, refillRate: 0.083 },
  /** SEBA evolution: 3 tokens, refill 0.0008/s (3/hr) */
  EVOLUTION: { maxTokens: 3, refillRate: 0.0008 },
  /** Encoded generation: 10 tokens, refill 0.167/s (10/min) */
  ENCODED: { maxTokens: 10, refillRate: 0.167 },
} as const;
