/**
 * Circuit Breaker — Exponential Backoff Recovery
 * Adds exponential backoff to recovery timeouts to prevent thundering herd.
 */

export interface BackoffConfig {
  baseMs: number;
  maxMs: number;
  multiplier: number;
  jitterPercent: number; // 0–1
}

const DEFAULT_BACKOFF: BackoffConfig = {
  baseMs: 30_000,
  maxMs: 300_000, // 5 minutes max
  multiplier: 2,
  jitterPercent: 0.2,
};

/**
 * Calculate the next recovery timeout with exponential backoff and jitter.
 * tripCount = number of times the breaker has tripped for this module.
 */
export function calculateRecoveryTimeout(
  tripCount: number,
  config: Partial<BackoffConfig> = {}
): number {
  const cfg = { ...DEFAULT_BACKOFF, ...config };
  const exponential = cfg.baseMs * Math.pow(cfg.multiplier, Math.min(tripCount - 1, 8));
  const capped = Math.min(exponential, cfg.maxMs);
  
  // Add jitter to prevent thundering herd
  const jitterRange = capped * cfg.jitterPercent;
  const jitter = (Math.random() * 2 - 1) * jitterRange;
  
  return Math.max(cfg.baseMs, Math.round(capped + jitter));
}

/**
 * Get a human-readable description of the backoff delay.
 */
export function formatBackoffDelay(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}
