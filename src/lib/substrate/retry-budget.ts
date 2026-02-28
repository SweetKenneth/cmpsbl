/**
 * Retry Budget — Prevents retry storms by limiting retry rate per module
 * Each module gets a token bucket that refills over time
 */

interface BudgetBucket {
  tokens: number;
  maxTokens: number;
  refillRate: number; // tokens per second
  lastRefill: number;
  totalRetries: number;
  totalExhausted: number;
}

const buckets = new Map<string, BudgetBucket>();

const DEFAULT_MAX = 10;
const DEFAULT_REFILL = 0.5; // 1 token every 2 seconds

function getBucket(module: string): BudgetBucket {
  if (!buckets.has(module)) {
    buckets.set(module, {
      tokens: DEFAULT_MAX,
      maxTokens: DEFAULT_MAX,
      refillRate: DEFAULT_REFILL,
      lastRefill: Date.now(),
      totalRetries: 0,
      totalExhausted: 0,
    });
  }
  const b = buckets.get(module)!;
  // Refill tokens
  const now = Date.now();
  const elapsed = (now - b.lastRefill) / 1000;
  b.tokens = Math.min(b.maxTokens, b.tokens + elapsed * b.refillRate);
  b.lastRefill = now;
  return b;
}

/** Try to consume a retry token. Returns true if allowed. */
export function tryRetry(module: string): boolean {
  const b = getBucket(module);
  b.totalRetries++;
  if (b.tokens < 1) {
    b.totalExhausted++;
    return false;
  }
  b.tokens -= 1;
  return true;
}

/** Check remaining budget without consuming */
export function remainingBudget(module: string): number {
  return Math.floor(getBucket(module).tokens);
}

/** Configure a module's retry budget */
export function configureBudget(module: string, maxTokens: number, refillRate: number): void {
  const b = getBucket(module);
  b.maxTokens = maxTokens;
  b.refillRate = refillRate;
  b.tokens = Math.min(b.tokens, maxTokens);
}

/** Get stats for all modules */
export function getBudgetStats(): Array<{ module: string; remaining: number; total: number; exhausted: number }> {
  return Array.from(buckets.entries()).map(([module, b]) => ({
    module,
    remaining: Math.floor(b.tokens),
    total: b.totalRetries,
    exhausted: b.totalExhausted,
  }));
}

/** Reset a module's bucket to full */
export function resetBudget(module: string): void {
  const b = getBucket(module);
  b.tokens = b.maxTokens;
}
