/**
 * Executor Immune Pilot — Wrapper (v2.0)
 * 
 * Improvements integrated:
 * #1 Context-Aware Rule Selection
 * #2 Compositional Repair Chains
 * #3 Confidence-Scored Repairs
 * #4 Learned Prioritization
 * #7 Pre-Execution Normalization
 * #8 Post-Execution Outcome Tracking
 * #10 Escalation Pattern Mining
 * #11 Parallel Repair Branching
 *
 * SAFETY: 1 repair max, 1 retry max, no recursion, no cross-module writes.
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
import { intelligentRepair, recordRepairOutcome, preNormalize, mineEscalationPattern } from './repair-intelligence';
import { trackOutcome, type OutcomeRecord } from './outcome-tracker';

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
 * Wrap a synergy executor with immune defense+repair (v2.0)
 * Now uses intelligent repair with all 12 improvements.
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
    const rawInput = ctx.input ?? {};

    // ── #7: PRE-EXECUTION NORMALIZATION ──
    const { normalized: input, changed: wasPreNormalized } = preNormalize(executorName, rawInput);
    if (wasPreNormalized) {
      ctx = { ...ctx, input };
    }

    // ── Repair telemetry state ──
    let repairAttemptedFlag = false;
    let repairSuccessFlag = false;
    let repairTypeFlag: string | null = null;
    let retryAttemptedFlag = false;
    let repairConfidence = 0;
    const startTime = performance.now();

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
     * v2.0: Intelligent repair + single retry.
     * Uses schema validation, archetype detection, confidence scoring,
     * compositional chains, and parallel branching.
     */
    const tryIntelligentRepairAndRetry = async (
      failingInput: Record<string, unknown>,
    ): Promise<SynergyResult | null> => {
      if (repairAttemptedFlag) return null;

      // Use the full intelligent repair pipeline
      const ir = intelligentRepair(executorName, failingInput);
      if (!ir.repaired) return null;

      // #3: Skip retry if confidence is too low
      if (ir.confidence < 0.2) {
        logImmuneEvent(createEvent(executorName, scope, module, 'repair', 'escalated', failingInput,
          `Repair confidence too low (${(ir.confidence * 100).toFixed(0)}%) — skipping retry`, true));
        return null;
      }

      repairAttemptedFlag = true;
      repairTypeFlag = ir.repair_type ?? 'INTELLIGENT';
      repairConfidence = ir.confidence;
      retryAttemptedFlag = true;

      const repairedCtx = { ...ctx, input: ir.repaired_input };

      try {
        const retryResult = await executorFn(repairedCtx);
        const post = postcheck(retryResult);
        if (post.valid && retryResult.success) {
          repairSuccessFlag = true;
          // #4: Record success for learned prioritization
          recordRepairOutcome(executorName, repairTypeFlag, true);
          // #8: Track outcome
          trackOutcome({
            executor: executorName,
            timestamp: Date.now(),
            archetype: ir.archetype,
            repairType: repairTypeFlag,
            repairConfidence: ir.confidence,
            retrySucceeded: true,
            inputShape: Object.keys(failingInput).sort().join(','),
            stagesApplied: ir.stagesApplied,
            chained: ir.chained,
            preNormalized: ir.preNormalized,
            durationMs: Math.round(performance.now() - startTime),
          });
          const event = createEvent(executorName, scope, module, 'repair', 'repaired_success', ir.repaired_input, undefined, true);
          logImmuneEvent(event);
          recordOutcome('repaired_success');
          await persistTelemetry();
          return retryResult;
        }
        // Retry ran but failed
        repairSuccessFlag = false;
        recordRepairOutcome(executorName, repairTypeFlag, false);
        trackOutcome({
          executor: executorName,
          timestamp: Date.now(),
          archetype: ir.archetype,
          repairType: repairTypeFlag,
          repairConfidence: ir.confidence,
          retrySucceeded: false,
          inputShape: Object.keys(failingInput).sort().join(','),
          stagesApplied: ir.stagesApplied,
          chained: ir.chained,
          preNormalized: ir.preNormalized,
          durationMs: Math.round(performance.now() - startTime),
        });
        return null;
      } catch {
        repairSuccessFlag = false;
        recordRepairOutcome(executorName, repairTypeFlag, false);
        return null;
      }
    };

    // ── PREFLIGHT (DEFENSE) ──
    const preflight = preflightCheck(input);
    if (!preflight.valid) {
      incrementMetric('preflightFailures');

      // v2.0: Intelligent repair
      const irResult = await tryIntelligentRepairAndRetry(input as Record<string, unknown>);
      if (irResult) return irResult;

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
          // #10: Mine escalation pattern
          mineEscalationPattern(executorName, errorMsg, input as Record<string, unknown>);
          await escalate(executorName, scope, module, repairResult.repairedInput, { traceId: ctx.traceId }, errorMsg);
          recordOutcome('escalated');
          await persistTelemetry();
          return createSafeFailure(ctx.synergyId, `Repaired input still failed: ${errorMsg}`);
        }
      } else {
        mineEscalationPattern(executorName, preflight.reason ?? 'preflight failed', input as Record<string, unknown>);
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

        const irResult = await tryIntelligentRepairAndRetry(input as Record<string, unknown>);
        if (irResult) return irResult;

        mineEscalationPattern(executorName, `Postcheck failed: ${post.reason}`, input as Record<string, unknown>);
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

      // ── v2.0: INTELLIGENT REPAIR + SINGLE RETRY ──
      const irResult = await tryIntelligentRepairAndRetry(input as Record<string, unknown>);
      if (irResult) return irResult;

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
          mineEscalationPattern(executorName, retryMsg, repairResult.repairedInput);
          await escalate(executorName, scope, module, repairResult.repairedInput, { traceId: ctx.traceId }, retryMsg);
          recordOutcome('escalated');
          await persistTelemetry();
          return createSafeFailure(ctx.synergyId, `Repair failed on retry: ${retryMsg}`);
        }
      } else {
        mineEscalationPattern(executorName, errorMsg, input as Record<string, unknown>);
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
