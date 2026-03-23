/**
 * NEXUS — Adaptive Retry Engine
 * Exponential backoff with jitter, circuit breaker integration, budget-aware caps.
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number;        // 0-1
  budgetPerMinute: number;    // max retries per minute across all calls
}

export interface RetryAttempt {
  attempt: number;
  delayMs: number;
  providerId: string;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  attempts: RetryAttempt[];
  totalDurationMs: number;
  finalProviderId: string;
  exhausted: boolean;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 500,
  maxDelayMs: 15000,
  jitterRatio: 0.3,
  budgetPerMinute: 30,
};

// Global retry budget tracking
const retryBudget = { count: 0, windowStart: Date.now() };

function checkBudget(config: RetryConfig): boolean {
  const now = Date.now();
  if (now - retryBudget.windowStart > 60_000) {
    retryBudget.count = 0;
    retryBudget.windowStart = now;
  }
  return retryBudget.count < config.budgetPerMinute;
}

function consumeBudget(): void {
  retryBudget.count++;
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponential = config.baseDelayMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, config.maxDelayMs);
  const jitter = capped * config.jitterRatio * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(capped + jitter));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: (providerId: string) => Promise<T>,
  providers: string[],
  config?: Partial<RetryConfig>
): Promise<RetryResult<T>> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const attempts: RetryAttempt[] = [];
  const start = Date.now();

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    const providerId = providers[attempt % providers.length];

    // Budget check
    if (attempt > 0 && !checkBudget(cfg)) {
      return {
        success: false,
        attempts,
        totalDurationMs: Date.now() - start,
        finalProviderId: providerId,
        exhausted: true,
      };
    }

    // Apply delay on retry
    if (attempt > 0) {
      const delay = calculateDelay(attempt - 1, cfg);
      attempts[attempts.length - 1].delayMs = delay;
      consumeBudget();
      await sleep(delay);
    }

    try {
      const data = await fn(providerId);
      attempts.push({
        attempt,
        delayMs: 0,
        providerId,
        timestamp: Date.now(),
        success: true,
      });
      return {
        success: true,
        data,
        attempts,
        totalDurationMs: Date.now() - start,
        finalProviderId: providerId,
        exhausted: false,
      };
    } catch (e: any) {
      attempts.push({
        attempt,
        delayMs: 0,
        providerId,
        timestamp: Date.now(),
        success: false,
        error: e.message?.slice(0, 200),
      });
    }
  }

  return {
    success: false,
    attempts,
    totalDurationMs: Date.now() - start,
    finalProviderId: providers[cfg.maxRetries % providers.length],
    exhausted: true,
  };
}

export function getRetryBudgetRemaining(): number {
  const now = Date.now();
  if (now - retryBudget.windowStart > 60_000) return DEFAULT_CONFIG.budgetPerMinute;
  return Math.max(0, DEFAULT_CONFIG.budgetPerMinute - retryBudget.count);
}
