/**
 * Retry Policy System
 * v10.5.4 ARCHITECT — Exponential backoff with jitter for transient failures
 */

import { isRetryableError, fromError, type AppError } from './errors';
import { log } from './log';

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
  onRetry?: (attempt: number, error: AppError, delayMs: number) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.3,
};

export function calculateDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff: base * 2^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
  
  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  
  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * config.jitterFactor * (Math.random() - 0.5) * 2;
  
  return Math.max(0, cappedDelay + jitter);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  traceId?: string
): Promise<T> {
  const fullConfig: RetryConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: AppError | null = null;

  for (let attempt = 0; attempt < fullConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = fromError(error, 'UNKNOWN_ERROR', traceId);

      if (!isRetryableError(error) || attempt === fullConfig.maxAttempts - 1) {
        throw lastError;
      }

      const delayMs = calculateDelay(attempt, fullConfig);

      log.warn('retry', `Attempt ${attempt + 1} failed, retrying in ${Math.round(delayMs)}ms`, {
        trace_id: traceId,
        attempt,
        code: lastError.code,
        delay_ms: delayMs,
      });

      fullConfig.onRetry?.(attempt, lastError, delayMs);

      await sleep(delayMs);
    }
  }

  throw lastError || fromError(new Error('Retry exhausted'), 'UNKNOWN_ERROR', traceId);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createRetryableOperation<T, Args extends unknown[]>(
  operation: (...args: Args) => Promise<T>,
  config: Partial<RetryConfig> = {}
): (...args: Args) => Promise<T> {
  return (...args: Args) => withRetry(() => operation(...args), config);
}

// Preset configurations for common scenarios
export const RetryPresets = {
  /** Quick retry for fast operations */
  fast: {
    maxAttempts: 2,
    baseDelayMs: 500,
    maxDelayMs: 2000,
    jitterFactor: 0.2,
  },
  /** Standard retry for API calls */
  standard: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    jitterFactor: 0.3,
  },
  /** Patient retry for long-running operations */
  patient: {
    maxAttempts: 5,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
    jitterFactor: 0.4,
  },
  /** Aggressive retry for critical operations */
  critical: {
    maxAttempts: 10,
    baseDelayMs: 500,
    maxDelayMs: 30000,
    jitterFactor: 0.25,
  },
} as const;
