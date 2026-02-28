/**
 * Retry with Exponential Backoff + Jitter
 * Used by atomic persistence commits.
 */

export interface RetryConfig {
  maxRetries: number;
  baseMs: number;
  maxMs: number;
  jitter: number; // 0–1
  onFail?: (attempt: number, error: unknown) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 6,
  baseMs: 500,
  maxMs: 30_000,
  jitter: 0.2,
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      cfg.onFail?.(attempt, err);

      if (attempt >= cfg.maxRetries) break;

      const exponential = cfg.baseMs * Math.pow(2, attempt);
      const capped = Math.min(exponential, cfg.maxMs);
      const jitterRange = capped * cfg.jitter;
      const jitter = (Math.random() * 2 - 1) * jitterRange;
      const delay = Math.max(cfg.baseMs, Math.round(capped + jitter));

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
