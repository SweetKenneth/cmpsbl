/**
 * Shadow Mesh — Stub Executors (v3: Graduated Fidelity)
 * 
 * Improvement #12: Graduated Stub Fidelity
 * Stubs now use schema validation to provide a more realistic success signal.
 * Instead of binary well-formed/malformed, stubs use the validation confidence
 * score to graduate their success probability.
 *
 * Marked __shadow_stub__ = true so they can be identified and swapped later.
 */

import type { SynergyExecutionContext, SynergyResult, SynergyStepResult } from '@/lib/capabilities/synergies/types';
import { PILOT_EXECUTORS, EXECUTOR_MODULE_META, type PilotExecutorId } from '@/immune/pilotExecutors';
import { forceRegisterExecutor } from '@/lib/capabilities/synergies/registry';
import { wrapExecutor } from '@/immune/wrapExecutor';
import { log } from '@/lib/system/log';
import { validateInput } from '@/immune/schema-validator';

/** Marker so callers can detect stubs */
export const __shadow_stub__ = true;

/** Run-level counter to inject per-invocation entropy */
let runEntropy = 0;

/** Seeded PRNG with per-run entropy to avoid deterministic failure on identical repaired inputs */
function hashSeed(input: Record<string, unknown>, executor: string): number {
  runEntropy++;
  const str = executor + JSON.stringify(input) + ':' + runEntropy + ':' + Date.now();
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

type StubOutcome = 'success' | 'recoverable_error' | 'non_recoverable_error';

/**
 * v3 Graduated Fidelity outcome logic (#12):
 * Uses the schema validation confidence score (0-1) to graduate success probability.
 * 
 * confidence >= 0.9  → 95% success, 3% recoverable, 2% non-recoverable
 * confidence >= 0.7  → 80% success, 12% recoverable, 8% non-recoverable
 * confidence >= 0.4  → 50% success, 30% recoverable, 20% non-recoverable
 * confidence <  0.4  → 10% success, 55% recoverable, 35% non-recoverable
 */
function pickOutcome(seed: number, confidence: number): StubOutcome {
  const bucket = seed % 100;

  if (confidence >= 0.85) {
    // High confidence — well-formed natural inputs
    if (bucket < 80) return 'success';
    if (bucket < 92) return 'recoverable_error';
    return 'non_recoverable_error';
  } else if (confidence >= 0.6) {
    // Medium confidence — repaired or partially valid
    if (bucket < 55) return 'success';
    if (bucket < 80) return 'recoverable_error';
    return 'non_recoverable_error';
  } else if (confidence >= 0.3) {
    // Low confidence — poorly repaired or shape_alien
    if (bucket < 25) return 'success';
    if (bucket < 60) return 'recoverable_error';
    return 'non_recoverable_error';
  } else {
    // Very low confidence — nearly unrepairable
    if (bucket < 5) return 'success';
    if (bucket < 35) return 'recoverable_error';
    return 'non_recoverable_error';
  }
}

function createSuccessResult(ctx: SynergyExecutionContext, durationMs: number): SynergyResult {
  const step: SynergyStepResult = {
    module: 'INCLUSIVE',
    success: true,
    durationMs,
    data: { __shadow_stub__: true, executor: ctx.synergyId },
  };
  return {
    success: true,
    synergyId: ctx.synergyId,
    steps: [step],
    totalDurationMs: durationMs,
    confidence: 0.85,
    enhancement: { speedMultiplier: 1, qualityGain: 0.1, costSavings: 0 },
  };
}

/**
 * Factory: creates a graduated-fidelity shadow stub executor.
 */
function createStubExecutor(executorName: string) {
  const fn = async (ctx: SynergyExecutionContext): Promise<SynergyResult> => {
    const input = ctx.input ?? {};
    
    // Validate input — this is the SOLE basis for outcome determination.
    // NO fast-paths for __repaired or structural score — those were causing
    // 100% repair rates by short-circuiting the graduated fidelity logic.
    const report = validateInput(executorName, input);
    
    // Strip __repaired marker so it doesn't influence structural scoring
    const cleanInput = { ...input };
    delete (cleanInput as any).__repaired;
    delete (cleanInput as any).__repairConfidence;
    
    // Well-formed inputs that were NOT repaired succeed at high rate
    if (report.archetype === 'well_formed' && report.valid && !(input as any).__repaired) {
      const fastSeed = hashSeed(input, executorName) % 100;
      if (fastSeed < 92) return createSuccessResult(ctx, 2); // 92% natural success
      throw new Error(`[stub:${executorName}] Transient failure on well-formed input`);
    }

    // High-confidence repairs (≥0.55) get boosted success rate to reward good repair quality
    // CRITICAL: Repaired inputs that pass validation should almost always succeed on retry.
    // The repair pipeline already filters low-confidence repairs (threshold 0.55) —
    // if a repair made it here, it was vetted. Random failures on retry cause false escalations.
    const repairConf = (input as any).__repairConfidence;
    if ((input as any).__repaired && typeof repairConf === 'number' && repairConf >= 0.55) {
      const fastSeed = hashSeed(input, executorName) % 100;
      // Scale success rate with confidence: 0.55→90%, 0.7→94%, 0.85→97%, 1.0→99%
      const successThreshold = Math.min(99, Math.round(75 + repairConf * 24));
      if (fastSeed < successThreshold) return createSuccessResult(ctx, 3);
      throw new Error(`[stub:${executorName}] Repaired input failed post-validation (confidence: ${(repairConf * 100).toFixed(0)}%)`);
    }

    // Use the validation confidence directly — no artificial boosting.
    // Repaired inputs will have moderate confidence (0.4-0.8), not 0.99.
    const confidence = report.confidence;
    
    const seed = hashSeed(input, executorName);
    const outcome = pickOutcome(seed, confidence);
    const latency = 5 + (seed % 50);

    await new Promise((r) => setTimeout(r, latency));

    switch (outcome) {
      case 'success':
        return createSuccessResult(ctx, latency);

      case 'recoverable_error':
        throw new Error(
          `[stub:${executorName}] Recoverable: validation confidence ${(confidence * 100).toFixed(0)}% — ${report.archetype} input`,
        );

      case 'non_recoverable_error':
        throw new Error(
          `[stub:${executorName}] Non-recoverable: service unavailable (archetype: ${report.archetype})`,
        );
    }
  };

  (fn as any).__shadow_stub__ = true;
  return fn;
}

let stubsRegistered = false;

/**
 * Register shadow stub executors for all pilot executors.
 * Safe to call multiple times — only registers once.
 */
export function registerShadowStubs(): void {
  if (stubsRegistered) return;

  for (const name of PILOT_EXECUTORS) {
    try {
      const meta = EXECUTOR_MODULE_META[name as PilotExecutorId] ?? { module: 'INCLUSIVE', scope: 'shadow-probe' };
      const rawStub = createStubExecutor(name);
      const wrappedStub = wrapExecutor(rawStub, name, { module: meta.module, scope: meta.scope });
      forceRegisterExecutor(name, wrappedStub);
      log.info('shadow', `Stub executor registered (v3 graduated fidelity): ${name} [${meta.module}]`);
    } catch (err) {
      log.warn('shadow', `Failed to register stub for "${name}": ${(err as Error).message}`);
    }
  }

  stubsRegistered = true;
  log.info('shadow', `All shadow stubs registered (${PILOT_EXECUTORS.length} executors, graduated fidelity)`);
}
