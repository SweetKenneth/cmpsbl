/**
 * Production Rate Limiting
 * Client-side rate limiting for sensitive operations
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitBucket {
  timestamps: number[];
  blocked: boolean;
  blockedUntil?: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private buckets = new Map<string, RateLimitBucket>();
  private readonly maxBuckets = 500;

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  check(key: string, config: RateLimitConfig): { allowed: boolean; retryAfterMs?: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { timestamps: [], blocked: false };
      this.buckets.set(key, bucket);
    }

    // Check if currently blocked
    if (bucket.blocked && bucket.blockedUntil) {
      if (now < bucket.blockedUntil) {
        return { allowed: false, retryAfterMs: bucket.blockedUntil - now };
      }
      bucket.blocked = false;
      bucket.blockedUntil = undefined;
    }

    // Clean old timestamps
    const windowStart = now - config.windowMs;
    bucket.timestamps = bucket.timestamps.filter(t => t > windowStart);

    // Check limit
    if (bucket.timestamps.length >= config.maxRequests) {
      bucket.blocked = true;
      bucket.blockedUntil = now + config.windowMs;
      return { allowed: false, retryAfterMs: config.windowMs };
    }

    // Record this request
    bucket.timestamps.push(now);
    return { allowed: true };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  getStats(key: string): { requestsInWindow: number; blocked: boolean } | null {
    const bucket = this.buckets.get(key);
    if (!bucket) return null;

    return {
      requestsInWindow: bucket.timestamps.length,
      blocked: bucket.blocked,
    };
  }
}

export const rateLimiter = RateLimiter.getInstance();

// Preset rate limits for common operations
export const RateLimitPresets = {
  /** Governor operations: 10/minute */
  GOVERNOR: { maxRequests: 10, windowMs: 60000 },
  /** Encoded generation: 5/minute */
  ENCODED: { maxRequests: 5, windowMs: 60000 },
  /** SEBA scheduler: 20/hour */
  SEBA: { maxRequests: 20, windowMs: 3600000 },
  /** Terminal commands: 30/minute */
  TERMINAL: { maxRequests: 30, windowMs: 60000 },
  /** API calls: 60/minute */
  API: { maxRequests: 60, windowMs: 60000 },
  /** Sensitive operations: 3/minute */
  SENSITIVE: { maxRequests: 3, windowMs: 60000 },
} as const;

// Helper to check and throw if rate limited
export function enforceRateLimit(key: string, config: RateLimitConfig): void {
  const result = rateLimiter.check(key, config);
  if (!result.allowed) {
    const retrySeconds = Math.ceil((result.retryAfterMs || 60000) / 1000);
    throw new Error(`Rate limited. Try again in ${retrySeconds}s`);
  }
}
