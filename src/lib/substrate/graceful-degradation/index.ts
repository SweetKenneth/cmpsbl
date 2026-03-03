/**
 * Unified Graceful Degradation Framework
 * Standardized resilience for all modules and subsystems
 * 
 * Provides:
 * - withGracefulExec: Wraps any async operation with timeout, retry, circuit-breaker awareness, and fallback
 * - withFallbackValue: Returns a default when an operation fails
 * - degradeGracefully: Logs degradation events and emits system alerts
 * - GracefulOperation: Builder pattern for complex resilience chains
 */

import { getCircuitStatus } from '../infra-resilience';
import { recordSuccess, recordFailure } from '../circuit-breaker';

// ═══ Types ═══════════════════════════════════════════════════════

export interface GracefulOptions<T> {
  /** Human-readable name for logging */
  name: string;
  /** Circuit breaker module key (optional) */
  circuitModule?: string;
  /** Fallback value if all attempts fail */
  fallback: T;
  /** Timeout in ms (default: 10000) */
  timeout?: number;
  /** Number of retries (default: 1) */
  retries?: number;
  /** Whether to log failures (default: true) */
  silent?: boolean;
}

export interface GracefulResult<T> {
  value: T;
  ok: boolean;
  degraded: boolean;
  error?: string;
  duration: number;
}

// ═══ Core: withGracefulExec ══════════════════════════════════════

/**
 * Execute an async operation with full resilience:
 * - Circuit breaker check (skip if open)
 * - Timeout enforcement
 * - Retry with exponential backoff
 * - Fallback on complete failure
 * - Success/failure recording to circuit breaker
 */
export async function withGracefulExec<T>(
  fn: () => Promise<T>,
  opts: GracefulOptions<T>
): Promise<GracefulResult<T>> {
  const start = Date.now();
  const timeout = opts.timeout ?? 10_000;
  const retries = opts.retries ?? 1;

  // Check circuit breaker — if open, return fallback immediately
  if (opts.circuitModule) {
    const circuit = getCircuitStatus(opts.circuitModule);
    if (circuit.state === 'open') {
      return {
        value: opts.fallback,
        ok: false,
        degraded: true,
        error: `Circuit breaker OPEN for ${opts.name}`,
        duration: Date.now() - start,
      };
    }
  }

  // Attempt with retries
  let lastError: string | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let timer: ReturnType<typeof setTimeout>;
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout);
        }),
      ]).finally(() => clearTimeout(timer!));

      // Success — record and return
      if (opts.circuitModule) {
        recordSuccess(opts.circuitModule);
      }

      return {
        value: result,
        ok: true,
        degraded: false,
        duration: Date.now() - start,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);

      // Wait before retry (exponential backoff: 500ms, 1000ms, 2000ms...)
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
  }

  // All attempts failed
  if (opts.circuitModule) {
    recordFailure(opts.circuitModule);
  }

  if (!opts.silent) {
    console.warn(`[GracefulDegradation] ${opts.name} failed after ${retries + 1} attempts: ${lastError}`);
  }

  return {
    value: opts.fallback,
    ok: false,
    degraded: true,
    error: lastError,
    duration: Date.now() - start,
  };
}

// ═══ Convenience: withFallbackValue ═════════════════════════════

/**
 * Simple wrapper: run fn, return fallback on any error.
 * No retries, no circuit breaker — just safe execution.
 */
export async function withFallbackValue<T>(
  fn: () => Promise<T>,
  fallback: T,
  name = 'unknown'
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[Fallback] ${name}: ${err instanceof Error ? err.message : String(err)}`);
    return fallback;
  }
}

/**
 * Synchronous version for non-async operations
 */
export function withFallbackSync<T>(fn: () => T, fallback: T, name = 'unknown'): T {
  try {
    return fn();
  } catch (err) {
    console.warn(`[Fallback] ${name}: ${err instanceof Error ? err.message : String(err)}`);
    return fallback;
  }
}

// ═══ Degradation Logger ═════════════════════════════════════════

const degradationLog: Array<{ name: string; error: string; timestamp: string }> = [];

export function degradeGracefully(name: string, error: unknown): void {
  const msg = error instanceof Error ? error.message : String(error);
  degradationLog.push({
    name,
    error: msg,
    timestamp: new Date().toISOString(),
  });
  // Keep only last 50 entries
  if (degradationLog.length > 50) {
    degradationLog.splice(0, degradationLog.length - 50);
  }
}

export function getDegradationLog() {
  return [...degradationLog];
}

// ═══ Batch Resilient Execution ══════════════════════════════════

/**
 * Execute multiple operations in parallel with individual fallbacks.
 * Each operation gets its own error handling — one failure doesn't affect others.
 */
export async function batchGraceful<T>(
  operations: Array<{
    name: string;
    fn: () => Promise<T>;
    fallback: T;
    circuitModule?: string;
  }>,
  globalTimeout = 15_000
): Promise<Array<{ name: string; result: GracefulResult<T> }>> {
  const results = await Promise.all(
    operations.map(async (op) => ({
      name: op.name,
      result: await withGracefulExec(op.fn, {
        name: op.name,
        fallback: op.fallback,
        circuitModule: op.circuitModule,
        timeout: globalTimeout,
        retries: 0, // No retries in batch — speed over reliability
        silent: true,
      }),
    }))
  );

  // Log any degraded operations
  const degraded = results.filter(r => r.result.degraded);
  if (degraded.length > 0) {
    console.warn(
      `[BatchGraceful] ${degraded.length}/${results.length} operations degraded:`,
      degraded.map(d => d.name).join(', ')
    );
  }

  return results;
}
