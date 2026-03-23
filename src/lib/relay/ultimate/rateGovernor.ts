/**
 * RELAY Ultimate — Rate Governor
 * Per-source-node rate limiting (100 msg/sec default).
 * Burst allowance with token bucket. Priority-aware — critical signals bypass.
 */

export interface RateBucket {
  sourceNode: string;
  tokens: number;
  maxTokens: number;
  refillRate: number;       // tokens per second
  lastRefill: number;
  totalAllowed: number;
  totalThrottled: number;
  burstAllowance: number;
}

export interface RateDecision {
  allowed: boolean;
  sourceNode: string;
  tokensRemaining: number;
  reason: string;
  priority: string;
  decidedAt: number;
}

export interface RateGovernorStats {
  totalBuckets: number;
  totalAllowed: number;
  totalThrottled: number;
  throttleRate: number;
  avgTokensRemaining: number;
}

const DEFAULT_MAX_TOKENS = 100;
const DEFAULT_REFILL_RATE = 100;  // 100 tokens/sec
const BURST_MULTIPLIER = 1.5;
const MAX_BUCKETS = 100;

const buckets = new Map<string, RateBucket>();
const CRITICAL_PRIORITIES = new Set(['critical', 'emergency', 'governance']);

function getOrCreateBucket(sourceNode: string): RateBucket {
  let bucket = buckets.get(sourceNode);
  if (bucket) return bucket;

  bucket = {
    sourceNode, tokens: DEFAULT_MAX_TOKENS,
    maxTokens: DEFAULT_MAX_TOKENS,
    refillRate: DEFAULT_REFILL_RATE,
    lastRefill: Date.now(),
    totalAllowed: 0, totalThrottled: 0,
    burstAllowance: Math.floor(DEFAULT_MAX_TOKENS * BURST_MULTIPLIER),
  };

  if (buckets.size >= MAX_BUCKETS) {
    const oldest = [...buckets.entries()]
      .sort((a, b) => a[1].lastRefill - b[1].lastRefill)[0];
    if (oldest) buckets.delete(oldest[0]);
  }
  buckets.set(sourceNode, bucket);
  return bucket;
}

function refillTokens(bucket: RateBucket): void {
  const now = Date.now();
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(bucket.burstAllowance, bucket.tokens + elapsed * bucket.refillRate);
  bucket.lastRefill = now;
}

export function checkRate(sourceNode: string, priority: string = 'normal'): RateDecision {
  // Critical signals bypass rate limits
  if (CRITICAL_PRIORITIES.has(priority)) {
    const bucket = getOrCreateBucket(sourceNode);
    bucket.totalAllowed++;
    return {
      allowed: true, sourceNode, tokensRemaining: bucket.tokens,
      reason: 'Critical priority — rate limit bypassed',
      priority, decidedAt: Date.now(),
    };
  }

  const bucket = getOrCreateBucket(sourceNode);
  refillTokens(bucket);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    bucket.totalAllowed++;
    return {
      allowed: true, sourceNode, tokensRemaining: bucket.tokens,
      reason: 'Within rate limit', priority, decidedAt: Date.now(),
    };
  }

  bucket.totalThrottled++;
  return {
    allowed: false, sourceNode, tokensRemaining: 0,
    reason: `Rate limit exceeded for ${sourceNode} (${bucket.refillRate}/sec)`,
    priority, decidedAt: Date.now(),
  };
}

export function setRateLimit(sourceNode: string, maxPerSecond: number): void {
  const bucket = getOrCreateBucket(sourceNode);
  bucket.refillRate = Math.max(1, Math.min(10000, maxPerSecond));
  bucket.maxTokens = bucket.refillRate;
  bucket.burstAllowance = Math.floor(bucket.maxTokens * BURST_MULTIPLIER);
}

export function getRateGovernorStats(): RateGovernorStats {
  const all = [...buckets.values()];
  const totalAllowed = all.reduce((s, b) => s + b.totalAllowed, 0);
  const totalThrottled = all.reduce((s, b) => s + b.totalThrottled, 0);
  const total = totalAllowed + totalThrottled;
  return {
    totalBuckets: all.length,
    totalAllowed, totalThrottled,
    throttleRate: total > 0 ? totalThrottled / total : 0,
    avgTokensRemaining: all.length > 0 ? all.reduce((s, b) => s + b.tokens, 0) / all.length : 0,
  };
}

export function resetRateGovernorState(): void { buckets.clear(); }
