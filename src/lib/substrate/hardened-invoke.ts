/**
 * CMPSBL® Hardened Invoke Layer v2.0.0
 * 
 * Non-breaking integration wrapper around substrate.invoke()
 * Enforces the full CORE Kernel Hardening pipeline on every invoke call
 * without modifying frozen CORE internals.
 * 
 * Execution Order:
 *   1. Quarantine check (block if module isolated)
 *   2. Per-module rate limiting (token bucket)
 *   3. Bulkhead isolation (per-module concurrency cap)
 *   4. In-flight request deduplication
 *   5. Priority queue scheduling
 *   6. Correlation ID generation
 *   7. Invoke stage instrumentation (pre-check → execute → post-process)
 * 
 * On success: latency, sliding window, health trend, breaker close, composite score
 * On failure: latency, sliding window, failure timestamp, breaker trip, error taxonomy, DLQ, degraded score
 */

import type { SubstrateRequest, SubstrateResponse } from '@/lib/substrate';
import {
  // #12 Quarantine
  isQuarantined,
  quarantineModule,
  // #10 Rate Limiting
  tryAcquireRate,
  // #11 Bulkhead
  withBulkhead,
  // #7 Deduplication
  deduplicatedInvoke,
  makeRequestKey,
  // #9 Correlation IDs
  startCorrelation,
  endCorrelation,
  // #23 Invoke Instrumentation
  InvokeInstrument,
  // #3 Sliding Window
  recordSlidingEvent,
  // #4 Cascade Detection
  recordModuleFailure,
  // #6 Health Trends
  recordHealthScore,
  // #20 Adaptive Timeouts / Latency
  recordLatency,
  // #21 Error Taxonomy
  classifyError,
  // #22 Breaker Analytics
  recordBreakerEvent,
  // #13 Dead Letter Queue
  addToDeadLetterQueue,
  // #24 Composite Health Score
  calculateCompositeScore,
  // #15 In-Flight Tracking
  trackInflight,
  drainInflight,
  // #14 Shutdown Deadline
  startShutdownDeadline,
  clearShutdownDeadline,
} from './core-hardening';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type InvokePriority = 'critical' | 'high' | 'normal' | 'low' | 'background';

export interface HardenedInvokeOptions {
  /** Request priority for queue scheduling (default: 'normal') */
  priority?: InvokePriority;
  /** Enable request deduplication (default: true) */
  deduplicate?: boolean;
  /** Parent correlation ID for distributed tracing */
  parentCorrelationId?: string;
  /** Skip quarantine check (use with caution) */
  bypassQuarantine?: boolean;
  /** Custom bulkhead concurrency cap for this module */
  bulkheadCap?: number;
}

export interface HardenedInvokeResult<T = unknown> {
  response: SubstrateResponse<T>;
  correlationId: string;
  latencyMs: number;
  hardened: true;
  fromCache: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS
// ═══════════════════════════════════════════════════════════════════════════════

interface HardenedMetrics {
  totalInvocations: number;
  quarantineBlocks: number;
  rateLimitBlocks: number;
  bulkheadRejections: number;
  deduplicated: number;
  successes: number;
  failures: number;
  avgLatencyMs: number;
  latencySum: number;
}

const metrics: HardenedMetrics = {
  totalInvocations: 0,
  quarantineBlocks: 0,
  rateLimitBlocks: 0,
  bulkheadRejections: 0,
  deduplicated: 0,
  successes: 0,
  failures: 0,
  avgLatencyMs: 0,
  latencySum: 0,
};

// Quarantine auto-trigger thresholds
const QUARANTINE_FAILURE_THRESHOLD = 10;
const QUARANTINE_WINDOW_MS = 30_000;
const moduleRecentFailures = new Map<string, number[]>();

// ═══════════════════════════════════════════════════════════════════════════════
// PRIORITY WEIGHT MAP
// ═══════════════════════════════════════════════════════════════════════════════

const PRIORITY_DELAY: Record<InvokePriority, number> = {
  critical: 0,
  high: 0,
  normal: 0,
  low: 50,
  background: 200,
};

// ═══════════════════════════════════════════════════════════════════════════════
// HARDENED INVOKE — Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hardened invoke wrapper. Passes every request through the full
 * CORE Kernel Hardening pipeline before executing against the
 * original substrate.invoke().
 * 
 * This is a non-breaking drop-in: accepts the same SubstrateRequest
 * and returns a SubstrateResponse (with additional trace metadata).
 */
export async function hardenedInvoke<T = unknown>(
  rawInvoke: (request: SubstrateRequest) => Promise<SubstrateResponse<T>>,
  request: SubstrateRequest,
  options: HardenedInvokeOptions = {},
): Promise<HardenedInvokeResult<T>> {
  const {
    priority = 'normal',
    deduplicate = true,
    parentCorrelationId,
    bypassQuarantine = false,
    bulkheadCap = 10,
  } = options;

  metrics.totalInvocations++;
  const instrument = new InvokeInstrument(request.module, request.action);

  // ─── Stage 1: QUARANTINE CHECK ───────────────────────────────────────────
  instrument.beginStage('quarantine-check');
  if (!bypassQuarantine && isQuarantined(request.module)) {
    metrics.quarantineBlocks++;
    instrument.endStage();
    const trace = instrument.finish(false);
    return {
      response: {
        success: false,
        module: request.module,
        action: request.action,
        error: `Module ${request.module} is quarantined — request blocked`,
        timestamp: new Date().toISOString(),
      },
      correlationId: trace.correlationId,
      latencyMs: trace.totalMs,
      hardened: true,
      fromCache: false,
    };
  }
  instrument.endStage();

  // ─── Stage 2: RATE LIMITING ──────────────────────────────────────────────
  instrument.beginStage('rate-limit');
  if (!tryAcquireRate(request.module)) {
    metrics.rateLimitBlocks++;
    instrument.endStage();
    const trace = instrument.finish(false);
    recordSlidingEvent(request.module, false);
    return {
      response: {
        success: false,
        module: request.module,
        action: request.action,
        error: `Rate limit exceeded for module ${request.module}`,
        timestamp: new Date().toISOString(),
      },
      correlationId: trace.correlationId,
      latencyMs: trace.totalMs,
      hardened: true,
      fromCache: false,
    };
  }
  instrument.endStage();

  // ─── Stage 3: PRIORITY SCHEDULING ────────────────────────────────────────
  instrument.beginStage('priority-schedule');
  const delay = PRIORITY_DELAY[priority];
  if (delay > 0) {
    await new Promise(r => setTimeout(r, delay));
  }
  instrument.endStage();

  // ─── Stage 4: CORRELATION ID ─────────────────────────────────────────────
  instrument.beginStage('correlation');
  const correlationId = startCorrelation(request.module, request.action, parentCorrelationId);
  instrument.endStage();

  // ─── Stage 5: BULKHEAD + DEDUP + EXECUTE ─────────────────────────────────
  instrument.beginStage('execute');
  let fromCache = false;

  try {
    const result = await withBulkhead<SubstrateResponse<T>>(
      request.module,
      async () => {
        const executor = async (): Promise<SubstrateResponse<T>> => {
          // Track in-flight
          const invokePromise = rawInvoke(request);
          trackInflight(correlationId, request.module, invokePromise);
          return invokePromise;
        };

        // Deduplication layer
        if (deduplicate) {
          const dedupKey = makeRequestKey(request.module, request.action, request.payload);
          return deduplicatedInvoke<SubstrateResponse<T>>(dedupKey, executor);
        }

        return executor();
      },
      bulkheadCap,
    );

    instrument.endStage();
    const trace = instrument.finish(result.success);
    const latencyMs = trace.totalMs;

    // ─── SUCCESS PATH ────────────────────────────────────────────────────
    if (result.success) {
      metrics.successes++;
      metrics.latencySum += latencyMs;
      metrics.avgLatencyMs = Math.round(metrics.latencySum / (metrics.successes + metrics.failures));

      // Record latency metrics
      recordLatency(request.module, request.action, latencyMs);

      // Record sliding window success
      recordSlidingEvent(request.module, true);

      // Update health trend (map success to score 80-100 based on latency)
      const healthScore = Math.max(80, Math.min(100, Math.round(100 - (latencyMs / 500) * 20)));
      recordHealthScore(request.module, healthScore);

      // Record circuit breaker close event
      recordBreakerEvent(request.module, 'close');

      // Recalculate composite health
      calculateCompositeScore(request.module, 'closed');

      // End correlation
      endCorrelation(correlationId, true);

      return {
        response: result,
        correlationId,
        latencyMs,
        hardened: true,
        fromCache,
      };
    }

    // ─── SOFT FAILURE PATH (business logic failure, not infra) ──────────
    metrics.failures++;
    metrics.latencySum += latencyMs;
    metrics.avgLatencyMs = Math.round(metrics.latencySum / (metrics.successes + metrics.failures));

    // Record latency
    recordLatency(request.module, request.action, latencyMs);

    // Record sliding window failure
    const windowResult = recordSlidingEvent(request.module, false);

    // Record module failure timestamp for cascade detection
    recordModuleFailure(request.module);

    // Track recent failures for auto-quarantine
    trackFailureForQuarantine(request.module);

    // Record breaker trip
    recordBreakerEvent(request.module, 'trip');

    // Classify the error
    if (result.error) {
      classifyError(request.module, result.error);
    }

    // Push to DLQ
    addToDeadLetterQueue(
      request.module,
      request.action,
      result.error ?? 'Unknown failure',
      request.payload,
    );

    // Update degraded health score
    const degradedScore = Math.max(0, Math.min(40, Math.round(40 - windowResult.failureRate * 40)));
    recordHealthScore(request.module, degradedScore);
    calculateCompositeScore(request.module, windowResult.breached ? 'open' : 'half_open');

    // End correlation
    endCorrelation(correlationId, false);

    return {
      response: result,
      correlationId,
      latencyMs,
      hardened: true,
      fromCache,
    };

  } catch (err) {
    // ─── HARD FAILURE PATH (bulkhead rejection, infra error) ───────────
    instrument.endStage();
    const trace = instrument.finish(false);
    const latencyMs = trace.totalMs;

    metrics.failures++;
    if (err instanceof Error && err.message.includes('[Bulkhead]')) {
      metrics.bulkheadRejections++;
    }
    metrics.latencySum += latencyMs;
    metrics.avgLatencyMs = Math.round(metrics.latencySum / (metrics.successes + metrics.failures));

    const errorMsg = err instanceof Error ? err.message : String(err);

    // Record all failure signals
    recordLatency(request.module, request.action, latencyMs);
    recordSlidingEvent(request.module, false);
    recordModuleFailure(request.module);
    trackFailureForQuarantine(request.module);
    recordBreakerEvent(request.module, 'trip');
    classifyError(request.module, errorMsg);
    addToDeadLetterQueue(request.module, request.action, errorMsg, request.payload);
    recordHealthScore(request.module, 0);
    calculateCompositeScore(request.module, 'open');
    endCorrelation(correlationId, false);

    return {
      response: {
        success: false,
        module: request.module,
        action: request.action,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      },
      correlationId,
      latencyMs,
      hardened: true,
      fromCache: false,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-QUARANTINE LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

function trackFailureForQuarantine(module: string): void {
  const now = Date.now();
  const failures = moduleRecentFailures.get(module) ?? [];
  failures.push(now);

  // Prune old entries outside window
  const cutoff = now - QUARANTINE_WINDOW_MS;
  const recent = failures.filter(t => t >= cutoff);
  moduleRecentFailures.set(module, recent);

  // Auto-quarantine if threshold breached
  if (recent.length >= QUARANTINE_FAILURE_THRESHOLD) {
    quarantineModule(
      module,
      `Auto-quarantined: ${recent.length} failures in ${QUARANTINE_WINDOW_MS / 1000}s`,
      60_000, // 60s quarantine
      true,   // auto-release
    );
    moduleRecentFailures.delete(module);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE — SHUTDOWN DRAINING
// ═══════════════════════════════════════════════════════════════════════════════

let isShuttingDown = false;

/**
 * Initiate graceful shutdown of the hardened invoke layer.
 * Drains in-flight operations with a deadline enforcer.
 */
export async function shutdownHardenedInvoke(deadlineMs = 10_000): Promise<{
  drained: number;
  timedOut: number;
  forced: boolean;
}> {
  if (isShuttingDown) return { drained: 0, timedOut: 0, forced: false };
  isShuttingDown = true;

  let forced = false;

  // Start deadline enforcer
  startShutdownDeadline(() => {
    forced = true;
    console.error('[HardenedInvoke] Shutdown deadline exceeded — forced cleanup');
  });

  // Drain in-flight operations
  const result = await drainInflight(deadlineMs - 1_000);

  // Clear deadline
  clearShutdownDeadline();
  isShuttingDown = false;

  return {
    drained: result.drained,
    timedOut: result.timedOut,
    forced,
  };
}

/**
 * Check if the hardened layer is accepting requests.
 */
export function isHardenedLayerReady(): boolean {
  return !isShuttingDown;
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRICS & DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════════

export function getHardenedInvokeMetrics(): HardenedMetrics & {
  successRate: string;
  isShuttingDown: boolean;
} {
  const total = metrics.successes + metrics.failures;
  return {
    ...metrics,
    successRate: total > 0 ? (metrics.successes / total * 100).toFixed(1) + '%' : '100%',
    isShuttingDown,
  };
}

export function resetHardenedInvokeMetrics(): void {
  metrics.totalInvocations = 0;
  metrics.quarantineBlocks = 0;
  metrics.rateLimitBlocks = 0;
  metrics.bulkheadRejections = 0;
  metrics.deduplicated = 0;
  metrics.successes = 0;
  metrics.failures = 0;
  metrics.avgLatencyMs = 0;
  metrics.latencySum = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE WRAPPER — Binds to a specific SubstrateClient instance
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a bound hardened invoker for a SubstrateClient instance.
 * Usage:
 *   const invoke = createHardenedInvoker(substrate.invoke.bind(substrate));
 *   const result = await invoke({ module: 'brain', action: 'status' });
 */
export function createHardenedInvoker(
  rawInvoke: (request: SubstrateRequest) => Promise<SubstrateResponse>,
) {
  return function invoke<T = unknown>(
    request: SubstrateRequest,
    options?: HardenedInvokeOptions,
  ): Promise<HardenedInvokeResult<T>> {
    if (isShuttingDown) {
      return Promise.resolve({
        response: {
          success: false,
          module: request.module,
          action: request.action,
          error: 'Hardened invoke layer is shutting down — request rejected',
          timestamp: new Date().toISOString(),
        },
        correlationId: 'shutdown',
        latencyMs: 0,
        hardened: true,
        fromCache: false,
      });
    }
    return hardenedInvoke(rawInvoke as any, request, options);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION
// ═══════════════════════════════════════════════════════════════════════════════

export const HARDENED_INVOKE_VERSION = '2.0.0';
export const HARDENED_INVOKE_CODENAME = 'Ironclad';
