/**
 * Executor Immune Pilot — Wrapper
 * Wraps a synergy executor with defense (preflight), repair, and escalation
 *
 * Controlled by shadow_mesh_enabled system flag (DB-backed, admin-toggled).
 *
 * Phase 2: Deterministic repair + single retry before escalation.
 * SAFETY: 1 repair max, 1 retry max, no recursion, no cross-module writes.
 * Only active for the 5 pilot executors routed through this wrapper.
 */

import type {
  ImmuneEvent,
  ImmuneOutcome,
  EscalationPayload,
} from './types';
import type { SynergyExecutionContext, SynergyResult } from '@/lib/capabilities/synergies/types';
import { isShadowMeshEnabled } from '@/lib/system/flags';
import { logImmuneEvent, redactContext } from './logger';
import { enqueueEscalation } from './queue';
import { repair } from './repairs';
import { deterministicRepair } from './deterministic-repair';
import { incrementMetric, recordOutcome } from './metrics';
import { recordImmuneMetrics } from '@/lib/immune/recordMetrics';

/** Simple hash for input tracing (not cryptographic) */
function hashInput(input: Record<string, unknown>): string {
  try {
    const str = JSON.stringify(input);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(36);
  } catch {
    return 'unhashable';
  }
}

function createEvent(
  executor: string,
  scope: string,
  module: string,
  stage: ImmuneEvent['stage'],
  outcome: ImmuneOutcome,
  input: Record<string, unknown>,
  error?: string,
  repairAttempted = false,
): ImmuneEvent {
  return {
    id: `imm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    module,
    executor,
    scope,
    stage,
    severity: outcome === 'escalated' || outcome === 'failed_safe' ? 'high' : 'low',
    inputHash: hashInput(input),
    context: { inputKeys: Object.keys(input) },
    error,
    repairAttempted,
    outcome,
  };
}

/**
 * Basic preflight validation for an executor input
 */
function preflightCheck(input: unknown): { valid: boolean; reason?: string } {
  if (input === null || input === undefined) {
    return { valid: false, reason: 'input is null/undefined' };
  }
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { valid: false, reason: `input is ${typeof input}, expected object` };
  }
  try {
    const serialized = JSON.stringify(input);
    if (serialized.length > 1_000_000) {
      return { valid: false, reason: 'input exceeds 1MB serialized' };
    }
  } catch {
    return { valid: false, reason: 'input is not serializable' };
  }
  return { valid: true };
}

/**
 * Basic postcheck on executor output
 */
function postcheck(result: SynergyResult): { valid: boolean; reason?: string } {
  if (!result) return { valid: false, reason: 'result is null/undefined' };
  if (typeof result.success !== 'boolean') return { valid: false, reason: 'result.success is not boolean' };
  return { valid: true };
}

export interface WrapConfig {
  module: string;
  scope: string;
}

/**
 * Wrap a synergy executor with immune defense+repair
 * Phase 2: deterministic repair + single retry for pilot executors
 */
export function wrapExecutor(
  executorFn: (ctx: SynergyExecutionContext) => Promise<SynergyResult>,
  executorName: string,
  config: WrapConfig,
): (ctx: SynergyExecutionContext) => Promise<SynergyResult> {
  return async (ctx: SynergyExecutionContext): Promise<SynergyResult> => {
    // ── FLAG CHECK (DB-backed system flag) ──
    if (!(await isShadowMeshEnabled())) {
      return executorFn(ctx);
    }

    const { module, scope } = config;
    const input = ctx.input ?? {};

    // ── Phase 2: repair telemetry state (guards against recursion) ──
    let repairAttemptedFlag = false;
    let repairSuccessFlag = false;
    let repairTypeFlag: string | null = null;
    let retryAttemptedFlag = false;

    /** Persist repair telemetry for this run */
    const persistTelemetry = async () => {
      await recordImmuneMetrics({
        executor: executorName,
        total: 1,
        repaired: repairSuccessFlag ? 1 : 0,
        escalated: 0,
        safeFail: 0,
        repair_attempted: repairAttemptedFlag,
        repair_success: repairSuccessFlag,
        repair_type: repairTypeFlag,
        retry_attempted: retryAttemptedFlag,
      });
    };

    /**
     * Phase 2: Attempt ONE deterministic repair + ONE retry.
     * Returns the retry result or null if repair not applicable.
     */
    const tryDeterministicRepairAndRetry = async (
      failingInput: Record<string, unknown>,
    ): Promise<SynergyResult | null> => {
      // Guard: only one repair per run
      if (repairAttemptedFlag) return null;

      const dr = deterministicRepair(failingInput);
      if (!dr.repaired) return null;

      repairAttemptedFlag = true;
      repairTypeFlag = dr.repair_type ?? 'UNKNOWN';

      // Guard: only one retry per run
      retryAttemptedFlag = true;
      const repairedCtx = { ...ctx, input: dr.repaired_input };

      try {
        const retryResult = await executorFn(repairedCtx);
        const post = postcheck(retryResult);
        if (post.valid && retryResult.success) {
          repairSuccessFlag = true;
          const event = createEvent(executorName, scope, module, 'repair', 'repaired_success', dr.repaired_input, undefined, true);
          logImmuneEvent(event);
          recordOutcome('repaired_success');
          await persistTelemetry();
          return retryResult;
        }
        // Retry ran but postcheck or success failed
        repairSuccessFlag = false;
        return null;
      } catch {
        repairSuccessFlag = false;
        return null;
      }
    };

    // ── PREFLIGHT (DEFENSE) ──
    const preflight = preflightCheck(input);
    if (!preflight.valid) {
      incrementMetric('preflightFailures');

      // Phase 2: try deterministic repair before legacy repair
      const drResult = await tryDeterministicRepairAndRetry(input as Record<string, unknown>);
      if (drResult) return drResult;

      // Legacy scope-specific repair fallback
      incrementMetric('repairAttempts');
      const repairResult = repair(scope, input as Record<string, unknown>, { traceId: ctx.traceId });

      if (repairResult) {
        const repairedCtx = { ...ctx, input: repairResult.repairedInput };
        try {
          const result = await executorFn(repairedCtx);
          const event = createEvent(executorName, scope, module, 'repair', 'repaired_success', repairResult.repairedInput);
          logImmuneEvent(event);
          recordOutcome('repaired_success');
          await persistTelemetry();
          return result;
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'unknown error after repair';
          await escalate(executorName, scope, module, repairResult.repairedInput, { traceId: ctx.traceId }, errorMsg);
          recordOutcome('escalated');
          await persistTelemetry();
          return createSafeFailure(ctx.synergyId, `Repaired input still failed: ${errorMsg}`);
        }
      } else {
        await escalate(executorName, scope, module, input as Record<string, unknown>, { traceId: ctx.traceId }, preflight.reason ?? 'preflight failed');
        recordOutcome('escalated');
        await persistTelemetry();
        return createSafeFailure(ctx.synergyId, `Preflight failed: ${preflight.reason}`);
      }
    }

    // ── ACTION (OFFENSE) ──
    try {
      const result = await executorFn(ctx);

      // ── POSTCHECK ──
      const post = postcheck(result);
      if (!post.valid) {
        incrementMetric('preflightFailures');

        // Phase 2: try deterministic repair on postcheck failure
        const drResult = await tryDeterministicRepairAndRetry(input as Record<string, unknown>);
        if (drResult) return drResult;

        await escalate(executorName, scope, module, input as Record<string, unknown>, { traceId: ctx.traceId }, `Postcheck failed: ${post.reason}`);
        recordOutcome('escalated');
        await persistTelemetry();
        return createSafeFailure(ctx.synergyId, `Postcheck failed: ${post.reason}`);
      }

      recordOutcome('success');
      await persistTelemetry();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown execution error';

      // ── Phase 2: DETERMINISTIC REPAIR + SINGLE RETRY ──
      const drResult = await tryDeterministicRepairAndRetry(input as Record<string, unknown>);
      if (drResult) return drResult;

      // Legacy repair fallback
      incrementMetric('repairAttempts');
      const repairResult = repair(scope, input as Record<string, unknown>, { traceId: ctx.traceId }, errorMsg);

      if (repairResult) {
        const repairedCtx = { ...ctx, input: repairResult.repairedInput };
        try {
          const result = await executorFn(repairedCtx);
          const event = createEvent(executorName, scope, module, 'repair', 'repaired_success', repairResult.repairedInput);
          logImmuneEvent(event);
          recordOutcome('repaired_success');
          await persistTelemetry();
          return result;
        } catch (retryErr) {
          const retryMsg = retryErr instanceof Error ? retryErr.message : 'unknown';
          await escalate(executorName, scope, module, repairResult.repairedInput, { traceId: ctx.traceId }, retryMsg);
          recordOutcome('escalated');
          await persistTelemetry();
          return createSafeFailure(ctx.synergyId, `Repair failed on retry: ${retryMsg}`);
        }
      } else {
        await escalate(executorName, scope, module, input as Record<string, unknown>, { traceId: ctx.traceId }, errorMsg);
        recordOutcome('escalated');
        await persistTelemetry();
        return createSafeFailure(ctx.synergyId, `Executor failed: ${errorMsg}`);
      }
    }
  };
}

/** Escalate to the immune queue */
async function escalate(
  executor: string,
  scope: string,
  module: string,
  input: Record<string, unknown>,
  ctx: Record<string, unknown>,
  errorSummary: string,
): Promise<void> {
  incrementMetric('escalations');

  const event = createEvent(executor, scope, module, 'escalate', 'escalated', input, errorSummary);
  logImmuneEvent(event);

  const payload: EscalationPayload = {
    eventId: event.id,
    module,
    executor,
    scope,
    failingInput: input,
    context: ctx,
    errorSummary,
    suggestedFixHint: `Review ${executor} input validation for scope "${scope}"`,
    createdAt: new Date().toISOString(),
  };

  await enqueueEscalation(payload);
}

/** Create a safe failure result (no crash) */
function createSafeFailure(synergyId: string, error: string): SynergyResult {
  return {
    success: false,
    synergyId,
    error: `[immune] ${error}`,
    steps: [],
    totalDurationMs: 0,
    confidence: 0,
    enhancement: { speedMultiplier: 1, qualityGain: 0, costSavings: 0 },
  };
}
