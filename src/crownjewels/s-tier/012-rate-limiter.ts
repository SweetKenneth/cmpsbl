/**
 * S-Tier Crown Jewel #12 — DEFENSE Rate Limiter
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 12 | CJPI: 94 | Module: DEFENSE | Type: Architecture
 *
 * Multi-strategy rate limiting: fixed window, sliding window,
 * token bucket, and leaky bucket. Per-key isolation, burst
 * allowance, penalty escalation, and analytics.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export type Strategy = 'fixed_window' | 'sliding_window' | 'token_bucket' | 'leaky_bucket';

export interface RateLimitConfig {
  strategy?: Strategy;
  maxRequests: number;
  windowMs: number;
  burstAllowance?: number;
  penaltyMultiplier?: number;
  maxPenaltyLevel?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
  penaltyLevel: number;
  key: string;
}

interface KeyState {
  tokens: number;
  lastRefill: number;
  requests: number[];
  penaltyLevel: number;
  windowStart: number;
  windowCount: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const {
    strategy = 'sliding_window',
    maxRequests,
    windowMs,
    burstAllowance = 0,
    penaltyMultiplier = 2,
    maxPenaltyLevel = 3,
  } = config;

  const keys = new Map<string, KeyState>();
  let totalAllowed = 0;
  let totalDenied = 0;

  function getState(key: string): KeyState {
    let s = keys.get(key);
    if (!s) {
      s = { tokens: maxRequests + burstAllowance, lastRefill: Date.now(), requests: [], penaltyLevel: 0, windowStart: Date.now(), windowCount: 0 };
      keys.set(key, s);
    }
    return s;
  }

  function effectiveLimit(state: KeyState): number {
    const divisor = state.penaltyLevel > 0 ? Math.pow(penaltyMultiplier, state.penaltyLevel) : 1;
    return Math.max(1, Math.floor((maxRequests + burstAllowance) / divisor));
  }

  // ── Strategies ───────────────────────────────────────────────────

  function fixedWindow(key: string): RateLimitResult {
    const s = getState(key);
    const now = Date.now();
    if (now - s.windowStart >= windowMs) { s.windowStart = now; s.windowCount = 0; }
    const limit = effectiveLimit(s);
    if (s.windowCount < limit) {
      s.windowCount++; totalAllowed++;
      return { allowed: true, remaining: limit - s.windowCount, penaltyLevel: s.penaltyLevel, key };
    }
    totalDenied++;
    return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - s.windowStart), penaltyLevel: s.penaltyLevel, key };
  }

  function slidingWindow(key: string): RateLimitResult {
    const s = getState(key);
    const now = Date.now();
    s.requests = s.requests.filter(t => now - t < windowMs);
    const limit = effectiveLimit(s);
    if (s.requests.length < limit) {
      s.requests.push(now); totalAllowed++;
      return { allowed: true, remaining: limit - s.requests.length, penaltyLevel: s.penaltyLevel, key };
    }
    totalDenied++;
    const oldest = s.requests[0];
    return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - oldest), penaltyLevel: s.penaltyLevel, key };
  }

  function tokenBucket(key: string): RateLimitResult {
    const s = getState(key);
    const now = Date.now();
    const elapsed = now - s.lastRefill;
    const refillRate = (maxRequests + burstAllowance) / windowMs;
    s.tokens = Math.min(effectiveLimit(s), s.tokens + elapsed * refillRate);
    s.lastRefill = now;
    if (s.tokens >= 1) {
      s.tokens -= 1; totalAllowed++;
      return { allowed: true, remaining: Math.floor(s.tokens), penaltyLevel: s.penaltyLevel, key };
    }
    totalDenied++;
    return { allowed: false, remaining: 0, retryAfterMs: Math.ceil((1 - s.tokens) / refillRate), penaltyLevel: s.penaltyLevel, key };
  }

  function leakyBucket(key: string): RateLimitResult {
    const s = getState(key);
    const now = Date.now();
    const leakRate = windowMs / maxRequests;
    s.requests = s.requests.filter(t => now - t < windowMs);
    const limit = effectiveLimit(s);
    if (s.requests.length < limit) {
      s.requests.push(now); totalAllowed++;
      return { allowed: true, remaining: limit - s.requests.length, penaltyLevel: s.penaltyLevel, key };
    }
    totalDenied++;
    return { allowed: false, remaining: 0, retryAfterMs: leakRate, penaltyLevel: s.penaltyLevel, key };
  }

  // ── Public API ───────────────────────────────────────────────────

  function check(key: string): RateLimitResult {
    switch (strategy) {
      case 'fixed_window': return fixedWindow(key);
      case 'sliding_window': return slidingWindow(key);
      case 'token_bucket': return tokenBucket(key);
      case 'leaky_bucket': return leakyBucket(key);
    }
  }

  function penalize(key: string): number {
    const s = getState(key);
    s.penaltyLevel = Math.min(s.penaltyLevel + 1, maxPenaltyLevel);
    return s.penaltyLevel;
  }

  function pardon(key: string): number {
    const s = getState(key);
    s.penaltyLevel = Math.max(0, s.penaltyLevel - 1);
    return s.penaltyLevel;
  }

  function reset(key: string) { keys.delete(key); }

  function getAnalytics() {
    return { totalAllowed, totalDenied, activeKeys: keys.size, denyRate: totalDenied / (totalAllowed + totalDenied || 1) };
  }

  return { check, penalize, pardon, reset, getAnalytics };
}
