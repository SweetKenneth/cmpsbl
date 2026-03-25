/**
 * Adaptive Rate Limiting
 * Dynamic rate limits based on system health and tenant behavior
 * 
 * Adjusts rate limits in real-time based on system pressure,
 * tenant reputation, and historical usage patterns.
 */

export interface RateLimitBucket {
  id: string;
  tenantId: string;
  moduleId: string;
  tokens: number;
  maxTokens: number;
  refillRatePerSec: number;
  lastRefillAt: number;
  adaptiveMultiplier: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  remainingTokens: number;
  retryAfterMs: number | null;
  adaptedRate: number;
  reason: string;
}

export interface AdaptiveRateConfig {
  baseRefillRate: number;
  minMultiplier: number;
  maxMultiplier: number;
  pressureThresholds: { low: number; medium: number; high: number };
  reputationWeight: number;
}

const DEFAULT_CONFIG: AdaptiveRateConfig = {
  baseRefillRate: 10,
  minMultiplier: 0.1,
  maxMultiplier: 3.0,
  pressureThresholds: { low: 0.3, medium: 0.6, high: 0.85 },
  reputationWeight: 0.3,
};

const buckets = new Map<string, RateLimitBucket>();
const reputationScores = new Map<string, number>();
let systemPressure = 0;
let config = { ...DEFAULT_CONFIG };

/**
 * Get or create a rate limit bucket
 */
export function getBucket(tenantId: string, moduleId: string): RateLimitBucket {
  const key = `${tenantId}:${moduleId}`;
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = {
      id: key,
      tenantId,
      moduleId,
      tokens: config.baseRefillRate,
      maxTokens: config.baseRefillRate * 10,
      refillRatePerSec: config.baseRefillRate,
      lastRefillAt: Date.now(),
      adaptiveMultiplier: 1.0,
    };
    buckets.set(key, bucket);
  }

  return bucket;
}

/**
 * Refill tokens based on elapsed time
 */
function refillTokens(bucket: RateLimitBucket): void {
  const now = Date.now();
  const elapsedSec = (now - bucket.lastRefillAt) / 1000;
  const effectiveRate = bucket.refillRatePerSec * bucket.adaptiveMultiplier;
  const newTokens = elapsedSec * effectiveRate;
  bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + newTokens);
  bucket.lastRefillAt = now;
}

/**
 * Adapt the multiplier based on system pressure and tenant reputation
 */
export function adaptMultiplier(tenantId: string, moduleId: string): number {
  const bucket = getBucket(tenantId, moduleId);
  const reputation = reputationScores.get(tenantId) ?? 0.5;

  let pressureMultiplier = 1.0;
  if (systemPressure >= config.pressureThresholds.high) {
    pressureMultiplier = config.minMultiplier;
  } else if (systemPressure >= config.pressureThresholds.medium) {
    pressureMultiplier = 0.5;
  } else if (systemPressure <= config.pressureThresholds.low) {
    pressureMultiplier = config.maxMultiplier;
  }

  const reputationFactor = 1.0 + (reputation - 0.5) * config.reputationWeight * 2;
  bucket.adaptiveMultiplier = Math.max(
    config.minMultiplier,
    Math.min(config.maxMultiplier, pressureMultiplier * reputationFactor)
  );

  return bucket.adaptiveMultiplier;
}

/**
 * Check rate limit and consume a token
 */
export function checkRateLimit(tenantId: string, moduleId: string): RateLimitDecision {
  const bucket = getBucket(tenantId, moduleId);
  refillTokens(bucket);
  adaptMultiplier(tenantId, moduleId);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remainingTokens: Math.floor(bucket.tokens),
      retryAfterMs: null,
      adaptedRate: bucket.refillRatePerSec * bucket.adaptiveMultiplier,
      reason: 'OK',
    };
  }

  const effectiveRate = bucket.refillRatePerSec * bucket.adaptiveMultiplier;
  const retryAfterMs = effectiveRate > 0 ? Math.ceil((1 / effectiveRate) * 1000) : 10000;

  return {
    allowed: false,
    remainingTokens: 0,
    retryAfterMs,
    adaptedRate: effectiveRate,
    reason: `Rate limited. Retry in ${retryAfterMs}ms`,
  };
}

/** Update system pressure (0-1) */
export function setSystemPressure(pressure: number) {
  systemPressure = Math.max(0, Math.min(1, pressure));
}

/** Set tenant reputation (0-1) */
export function setReputation(tenantId: string, score: number) {
  reputationScores.set(tenantId, Math.max(0, Math.min(1, score)));
}

/** Get all buckets */
export function getAllBuckets(): RateLimitBucket[] {
  return Array.from(buckets.values());
}

/** Configure rate limiting */
export function configureRateLimit(updates: Partial<AdaptiveRateConfig>) {
  config = { ...config, ...updates };
}

/** Evict stale buckets and reputation entries older than maxAgeMs */
const MAX_BUCKETS = 10_000;
const MAX_REPUTATIONS = 5_000;

export function evictStaleBuckets(maxAgeMs = 3_600_000): number {
  const now = Date.now();
  let evicted = 0;
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefillAt > maxAgeMs) {
      buckets.delete(key);
      evicted++;
    }
  }
  // Hard cap: single-pass min eviction instead of sort
  while (buckets.size > MAX_BUCKETS) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [k, b] of buckets) {
      if (b.lastRefillAt < oldestTime) { oldestTime = b.lastRefillAt; oldestKey = k; }
    }
    if (oldestKey) { buckets.delete(oldestKey); evicted++; }
    else break;
  }
  // Trim reputation map using iterator (FIFO order of Map)
  if (reputationScores.size > MAX_REPUTATIONS) {
    const excess = reputationScores.size - MAX_REPUTATIONS;
    const iter = reputationScores.keys();
    for (let i = 0; i < excess; i++) {
      const { value } = iter.next();
      if (value !== undefined) reputationScores.delete(value);
    }
  }
  return evicted;
}
