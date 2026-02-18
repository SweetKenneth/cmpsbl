/**
 * Executor Immune Pilot — Wrapper
 * Wraps a synergy executor with defense (preflight), repair, and escalation
 *
 * Controlled by shadow_mesh_enabled system flag (DB-backed, admin-toggled).
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
import { incrementMetric, recordOutcome } from './metrics';

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
  // Check for absurdly large payloads (> 1MB serialized)
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

    // ── PREFLIGHT (DEFENSE) ──
    const preflight = preflightCheck(input);
    if (!preflight.valid) {
      incrementMetric('preflightFailures');

      // Attempt repair
      incrementMetric('repairAttempts');
      const repairResult = repair(scope, input as Record<string, unknown>, { traceId: ctx.traceId });
      
      if (repairResult) {
        // Retry with repaired input
        const repairedCtx = { ...ctx, input: repairResult.repairedInput };
        try {
          const result = await executorFn(repairedCtx);
          const event = createEvent(executorName, scope, module, 'repair', 'repaired_success', repairResult.repairedInput);
          logImmuneEvent(event);
          recordOutcome('repaired_success');
          return result;
        } catch (err) {
          // Repair succeeded but executor still failed — escalate
          const errorMsg = err instanceof Error ? err.message : 'unknown error after repair';
          await escalate(executorName, scope, module, repairResult.repairedInput, { traceId: ctx.traceId }, errorMsg);
          recordOutcome('escalated');
          return createSafeFailure(ctx.synergyId, `Repaired input still failed: ${errorMsg}`);
        }
      } else {
        // No repair available — escalate
        await escalate(executorName, scope, module, input as Record<string, unknown>, { traceId: ctx.traceId }, preflight.reason ?? 'preflight failed');
        recordOutcome('escalated');
        return createSafeFailure(ctx.synergyId, `Preflight failed: ${preflight.reason}`);
      }
    }

    // ── ACTION (OFFENSE) ──
    try {
      const result = await executorFn(ctx);

      // ── POSTCHECK ──
      const post = postcheck(result);
      if (!post.valid) {
        incrementMetric('preflightFailures'); // count as a detected failure
        await escalate(executorName, scope, module, input as Record<string, unknown>, { traceId: ctx.traceId }, `Postcheck failed: ${post.reason}`);
        recordOutcome('escalated');
        return createSafeFailure(ctx.synergyId, `Postcheck failed: ${post.reason}`);
      }

      recordOutcome('success');
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown execution error';

      // ── REPAIR ATTEMPT (ONE SHOT) ──
      incrementMetric('repairAttempts');
      const repairResult = repair(scope, input as Record<string, unknown>, { traceId: ctx.traceId }, errorMsg);

      if (repairResult) {
        const repairedCtx = { ...ctx, input: repairResult.repairedInput };
        try {
          const result = await executorFn(repairedCtx);
          const event = createEvent(executorName, scope, module, 'repair', 'repaired_success', repairResult.repairedInput);
          logImmuneEvent(event);
          recordOutcome('repaired_success');
          return result;
        } catch (retryErr) {
          const retryMsg = retryErr instanceof Error ? retryErr.message : 'unknown';
          await escalate(executorName, scope, module, repairResult.repairedInput, { traceId: ctx.traceId }, retryMsg);
          recordOutcome('escalated');
          return createSafeFailure(ctx.synergyId, `Repair failed on retry: ${retryMsg}`);
        }
      } else {
        // No repair — escalate
        await escalate(executorName, scope, module, input as Record<string, unknown>, { traceId: ctx.traceId }, errorMsg);
        recordOutcome('escalated');
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
