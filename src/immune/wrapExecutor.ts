/**
 * IMMUNITY — Executor Wrapper
 * 
 * Archetype-gated repair: Garbage inputs (empty_shell, shape_alien,
 * injection_attempt, oversized) safe-fail IMMEDIATELY without repair.
 * Only repairable archetypes (missing_required) trigger the repair pipeline,
 * keeping the repair attempt rate honest (<2%).
 *
 * Integrated capabilities:
 * - Context-Aware Rule Selection
 * - Compositional Repair Chains
 * - Confidence-Scored Repairs
 * - Learned Prioritization
 * - Pre-Execution Normalization
 * - Post-Execution Outcome Tracking
 * - Escalation Pattern Mining
 * - Parallel Repair Branching
 * - Archetype-Gated Repair
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
import { log } from '@/lib/system/log';
import { logImmuneEvent, redactContext } from './logger';
import { enqueueEscalation } from './queue';
import { repair } from './repairs';
import { deterministicRepair } from './deterministic-repair';
import { incrementMetric, recordOutcome } from './metrics';
// Metrics recording moved to batch level (runBatch.ts) to prevent per-execution DB spam
import { intelligentRepair, recordRepairOutcome, preNormalize, mineEscalationPattern } from './repair-intelligence';
import { trackOutcome, type OutcomeRecord } from './outcome-tracker';
import { captureEscalation, runLearningCycle } from './escalation-learning';
import { validateInput, type InputArchetype } from './schema-validator';
import { contributeRule, findApplicableRules, recordSharedRuleOutcome } from './shared-rule-registry';
import { emitIntelligenceEvent, hashSignature } from './metrics/emitIntelligenceEvent';
import type { IntelOutcome, IntelRepairType } from './metrics/intelligenceTypes';

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
 * #13: Archetype-Gated Repair
 * Only these archetypes are worth attempting repair on.
 * Everything else (empty_shell, shape_alien, injection_attempt, oversized)
 * should safe-fail immediately — they represent garbage inputs that the
 * system correctly rejects, not inputs that need fixing.
 */
const REPAIRABLE_ARCHETYPES: Set<InputArchetype> = new Set([
  'missing_required',
]);

function isRepairableArchetype(archetype: InputArchetype): boolean {
  return REPAIRABLE_ARCHETYPES.has(archetype);
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
 * Wrap a synergy executor with immune defense+repair.
 * Archetype-gated: only repairable archetypes trigger repair.
 * Garbage inputs safe-fail immediately, producing honest <2% repair rates.
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
    // Track escalation and safe-failure correctly
    let escalatedFlag = false;
    let safeFailFlag = false;
    const startTime = performance.now();

    // Intelligence event emitter — fires once at end, non-blocking
    const emitIntel = (outcome: IntelOutcome, errorMsg?: string, ruleId?: string | null, escSeverity?: string | null) => {
      try {
        emitIntelligenceEvent({
          executor_id: executorName,
          is_shadow_mesh: (ctx as any).isShadowProbe ?? false,
          mode: (ctx as any).isShadowProbe ? 'shadow_probe' : 'normal',
          outcome,
          repair_type: (repairTypeFlag as IntelRepairType) ?? null,
          rule_id: ruleId ?? null,
          failure_signature_hash: errorMsg ? hashSignature(executorName, errorMsg) : null,
          escalation_severity: escSeverity ?? null,
          duration_ms: Math.round(performance.now() - startTime),
          meta: { module, scope, preNormalized: wasPreNormalized },
        });
      } catch { /* never block */ }
    };

    // Telemetry is now recorded at batch level (runBatch.ts) — no per-execution DB writes

    /** Intelligent repair + single retry. */
    const tryIntelligentRepairAndRetry = async (
      failingInput: Record<string, unknown>,
    ): Promise<SynergyResult | null> => {
      if (repairAttemptedFlag) return null;

      // Check shared rules FIRST — learned fixes from other executors
      const applicableRules = findApplicableRules(executorName);
      let sharedRuleUsed: string | null = null;

      const ir = intelligentRepair(executorName, failingInput);
      if (!ir.repaired) {
        // If intelligent repair fails, check if a shared rule might help
        if (applicableRules.length > 0) {
          log.info('immune', `${executorName}: No local repair, but ${applicableRules.length} shared rules available`);
        }
        return null;
      }

      if (ir.confidence < 0.55) {
        logImmuneEvent(createEvent(executorName, scope, module, 'repair', 'escalated', failingInput,
          `Repair confidence too low (${(ir.confidence * 100).toFixed(0)}%) — escalating instead of retrying`, true));
        // Record failure against any applicable shared rules so they degrade
        for (const rule of applicableRules.slice(0, 3)) {
          recordSharedRuleOutcome(rule.id, executorName, false);
        }
        return null;
      }

      // Track which shared rule strategy matched this repair
      if (applicableRules.length > 0) {
        const matchingRule = applicableRules.find(r => r.repairStrategy === ir.repair_type);
        if (matchingRule) sharedRuleUsed = matchingRule.id;
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
          recordRepairOutcome(executorName, repairTypeFlag, true);
          // Record success against shared rule (reinforces the rule for this executor)
          if (sharedRuleUsed) {
            recordSharedRuleOutcome(sharedRuleUsed, executorName, true);
          }
          // Contribute successful repair to shared registry for cross-executor learning
          if (repairConfidence >= 0.6) {
            try {
              contributeRule(executorName, repairTypeFlag, ir.archetype, repairConfidence,
                `Auto-contributed from ${executorName} repair success (${repairTypeFlag})`);
            } catch { /* non-critical */ }
          }
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
          // metrics recorded at batch level
          // Annotate result so probe.ts can distinguish repaired success from natural success
          return { ...retryResult, error: '[immune] Repair succeeded' };
        }
        repairSuccessFlag = false;
        recordRepairOutcome(executorName, repairTypeFlag, false);
        // v3.1: Record failure against shared rule (degrades confidence, may trigger rollback)
        if (sharedRuleUsed) {
          recordSharedRuleOutcome(sharedRuleUsed, executorName, false);
        }
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
        // v3.1: Record failure against shared rule
        if (sharedRuleUsed) {
          recordSharedRuleOutcome(sharedRuleUsed, executorName, false);
        }
        return null;
      }
    };

    // ── PREFLIGHT (DEFENSE) ──
    const preflight = preflightCheck(input);
    if (!preflight.valid) {
      incrementMetric('preflightFailures');

      // #13: Classify the input archetype BEFORE attempting repair
      const report = validateInput(executorName, input as Record<string, unknown>);
      
      if (!isRepairableArchetype(report.archetype)) {
      // Garbage input — safe-fail immediately, no repair attempt
      safeFailFlag = true;
      recordOutcome('failed_safe');
      trackOutcome({
        executor: executorName,
        timestamp: Date.now(),
        archetype: report.archetype,
        repairType: null,
        repairConfidence: 0,
        retrySucceeded: false,
        inputShape: Object.keys(input as Record<string, unknown>).sort().join(','),
        stagesApplied: 0,
        chained: false,
        preNormalized: wasPreNormalized,
        durationMs: Math.round(performance.now() - startTime),
      });
      emitIntel('safe_fail', preflight.reason);
      return createSafeFailure(ctx.synergyId, `Preflight rejected (${report.archetype}): ${preflight.reason}`);
      }

      // Repairable archetype — attempt intelligent repair
      const irResult = await tryIntelligentRepairAndRetry(input as Record<string, unknown>);
      if (irResult) return irResult;

      incrementMetric('repairAttempts');
      const repairResult = repair(executorName, input as Record<string, unknown>, { traceId: ctx.traceId });

      if (repairResult) {
        const repairedCtx = { ...ctx, input: repairResult.repairedInput };
        try {
          const result = await executorFn(repairedCtx);
          const event = createEvent(executorName, scope, module, 'repair', 'repaired_success', repairResult.repairedInput);
          logImmuneEvent(event);
          recordOutcome('repaired_success');
          emitIntel('repaired_success');
          return { ...result, error: '[immune] Repair succeeded' };
        } catch (err) {
          // v3.2: Failed preflight repair+retry → safe-fail instead of escalate
          const errorMsg = err instanceof Error ? err.message : 'unknown error after repair';
          mineEscalationPattern(executorName, errorMsg, input as Record<string, unknown>);
          safeFailFlag = true;
          recordOutcome('failed_safe');
          emitIntel('safe_fail', errorMsg);
          return createSafeFailure(ctx.synergyId, `[immune] Safe-fail after preflight repair: ${errorMsg}`);
        }
      } else {
        // Repairable archetype but no repair strategy found — safe-fail (not escalate)
        safeFailFlag = true;
        recordOutcome('failed_safe');
        emitIntel('safe_fail', preflight.reason);
        return createSafeFailure(ctx.synergyId, `No repair strategy for ${report.archetype}: ${preflight.reason}`);
      }
    }

    // ── ACTION (OFFENSE) ──
    try {
      const result = await executorFn(ctx);

      // ── POSTCHECK ──
      const post = postcheck(result);
      if (!post.valid) {
        incrementMetric('preflightFailures'); // Reused counter — covers both pre/postcheck failures

        const irResult = await tryIntelligentRepairAndRetry(input as Record<string, unknown>);
        if (irResult) return irResult;

        mineEscalationPattern(executorName, `Postcheck failed: ${post.reason}`, input as Record<string, unknown>);
        escalatedFlag = true;
        await escalate(executorName, scope, module, input as Record<string, unknown>, { traceId: ctx.traceId }, `Postcheck failed: ${post.reason}`);
        recordOutcome('escalated');
        // metrics recorded at batch level
        emitIntel('escalation', `Postcheck failed: ${post.reason}`, null, 'high');
        return createSafeFailure(ctx.synergyId, `Postcheck failed: ${post.reason}`);
      }

      recordOutcome('success');
      trackOutcome({
        executor: executorName,
        timestamp: Date.now(),
        archetype: 'well_formed',
        repairType: null,
        repairConfidence: 1,
        retrySucceeded: true,
        inputShape: Object.keys(input as Record<string, unknown>).sort().join(','),
        stagesApplied: 0,
        chained: false,
        preNormalized: wasPreNormalized,
        durationMs: Math.round(performance.now() - startTime),
      });
      // metrics recorded at batch level
      emitIntel('success');
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'unknown execution error';

      // ── #13: ARCHETYPE-GATED REPAIR ──
      // Classify the input BEFORE attempting repair. If the input is garbage
      // (empty_shell, shape_alien, injection_attempt, oversized), safe-fail
      // immediately. Only repairable archetypes get repair attempts.
      const report = validateInput(executorName, input as Record<string, unknown>);
      
      if (!isRepairableArchetype(report.archetype)) {
        // Expected failure on garbage input — safe-fail, no repair, no escalation
        safeFailFlag = true;
        recordOutcome('failed_safe');
        trackOutcome({
          executor: executorName,
          timestamp: Date.now(),
          archetype: report.archetype,
          repairType: null,
          repairConfidence: 0,
          retrySucceeded: false,
          inputShape: Object.keys(input as Record<string, unknown>).sort().join(','),
          stagesApplied: 0,
          chained: false,
          preNormalized: wasPreNormalized,
          durationMs: Math.round(performance.now() - startTime),
        });
        emitIntel('safe_fail', errorMsg);
        return createSafeFailure(ctx.synergyId, `Safe-fail (${report.archetype}): ${errorMsg}`);
      }

      // ── Repairable archetype — attempt intelligent repair + single retry ──
      const irResult = await tryIntelligentRepairAndRetry(input as Record<string, unknown>);
      if (irResult) return irResult;

      // Legacy repair fallback
      incrementMetric('repairAttempts');
      const repairResult = repair(executorName, input as Record<string, unknown>, { traceId: ctx.traceId }, errorMsg);

      if (repairResult) {
        const repairedCtx = { ...ctx, input: repairResult.repairedInput };
        try {
          const result = await executorFn(repairedCtx);
          const event = createEvent(executorName, scope, module, 'repair', 'repaired_success', repairResult.repairedInput);
          logImmuneEvent(event);
          recordOutcome('repaired_success');
          emitIntel('repaired_success');
          return { ...result, error: '[immune] Repair succeeded' };
        } catch (retryErr) {
          // v3.2: Failed repair+retry → safe-fail instead of escalate.
          // The repair was attempted and failed — escalating just creates noise.
          // Only mine the pattern for future learning, don't flood the escalation queue.
          const retryMsg = retryErr instanceof Error ? retryErr.message : 'unknown';
          mineEscalationPattern(executorName, retryMsg, repairResult.repairedInput);
          safeFailFlag = true;
          recordOutcome('failed_safe');
          trackOutcome({
            executor: executorName,
            timestamp: Date.now(),
            archetype: report.archetype,
            repairType: 'LEGACY_REPAIR',
            repairConfidence: 0,
            retrySucceeded: false,
            inputShape: Object.keys(input as Record<string, unknown>).sort().join(','),
            stagesApplied: 1,
            chained: false,
            preNormalized: wasPreNormalized,
            durationMs: Math.round(performance.now() - startTime),
          });
          emitIntel('safe_fail', retryMsg);
          return createSafeFailure(ctx.synergyId, `[immune] Safe-fail after repair retry: ${retryMsg}`);
        }
      } else {
        // Repairable archetype but no strategy — safe-fail (not escalate)
        // v3.2: No repair strategy found is NOT worth escalating — it's expected
        // for adversarial inputs that happen to have a repairable archetype.
        safeFailFlag = true;
        recordOutcome('failed_safe');
        trackOutcome({
          executor: executorName,
          timestamp: Date.now(),
          archetype: report.archetype,
          repairType: null,
          repairConfidence: 0,
          retrySucceeded: false,
          inputShape: Object.keys(input as Record<string, unknown>).sort().join(','),
          stagesApplied: 0,
          chained: false,
          preNormalized: wasPreNormalized,
          durationMs: Math.round(performance.now() - startTime),
        });
        emitIntel('safe_fail', errorMsg);
        return createSafeFailure(ctx.synergyId, `[immune] No repair strategy for ${report.archetype}: ${errorMsg}`);
      }
    }
  };
}

/** Escalate to the immune queue with learning loop integration */
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

  // Phase 3: Capture escalation signal for learning loop
  const report = validateInput(executor, input);
  captureEscalation({
    executor,
    inputShape: Object.keys(input).sort().join(','),
    failureReason: errorSummary,
    archetype: report.archetype,
    deterministicApplied: null,
    legacyApplied: false,
    timestamp: Date.now(),
    failingInput: input,
  });

  // Run learning cycle periodically (lightweight — only processes eligible patterns)
  runLearningCycle();

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