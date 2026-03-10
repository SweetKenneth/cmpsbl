/**
 * S-Tier 109 — External API Rate Limiter
 * ID: S-133 | CJPI: 89 | Module: INTEGRATION
 * 
 * Intelligent rate limiting for external API calls with token bucket and sliding window.
 */

export interface RateLimitConfig {
  strategy: 'token_bucket' | 'sliding_window' | 'fixed_window';
  maxRequests: number;
  windowMs: number;
  burstSize?: number;
  refillRate?: number; // tokens per second
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  retryAfterMs: number | null;
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  consume(count = 1): RateLimitResult {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return {
        allowed: true,
        remaining: Math.floor(this.tokens),
        resetAt: new Date(Date.now() + (this.maxTokens - this.tokens) / this.refillRate * 1000).toISOString(),
        retryAfterMs: null,
      };
    }

    const waitMs = Math.ceil((count - this.tokens) / this.refillRate * 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + waitMs).toISOString(),
      retryAfterMs: waitMs,
    };
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

class SlidingWindow {
  private timestamps: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  consume(): RateLimitResult {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => t > now - this.windowMs);

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return {
        allowed: true,
        remaining: this.maxRequests - this.timestamps.length,
        resetAt: new Date(now + this.windowMs).toISOString(),
        retryAfterMs: null,
      };
    }

    const oldest = this.timestamps[0];
    const retryAfterMs = oldest + this.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(oldest + this.windowMs).toISOString(),
      retryAfterMs,
    };
  }
}

export class ExternalAPIRateLimiter {
  private limiters: Map<string, TokenBucket | SlidingWindow> = new Map();

  configure(apiKey: string, config: RateLimitConfig): void {
    if (config.strategy === 'token_bucket') {
      this.limiters.set(apiKey, new TokenBucket(
        config.burstSize || config.maxRequests,
        config.refillRate || config.maxRequests / (config.windowMs / 1000)
      ));
    } else {
      this.limiters.set(apiKey, new SlidingWindow(config.maxRequests, config.windowMs));
    }
  }

  checkLimit(apiKey: string): RateLimitResult {
    const limiter = this.limiters.get(apiKey);
    if (!limiter) {
      return { allowed: true, remaining: Infinity, resetAt: '', retryAfterMs: null };
    }
    return limiter.consume();
  }

  remove(apiKey: string): void {
    this.limiters.delete(apiKey);
  }
}
