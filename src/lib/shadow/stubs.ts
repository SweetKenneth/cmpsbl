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
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { registerSynergyExecutor } from '@/lib/capabilities/synergies/registry';
import { wrapExecutor } from '@/immune/wrapExecutor';
import { log } from '@/lib/system/log';
import { validateInput } from '@/immune/schema-validator';

/** Marker so callers can detect stubs */
export const __shadow_stub__ = true;

/** Seeded PRNG for deterministic-ish but varied results per input */
function hashSeed(input: Record<string, unknown>, executor: string): number {
  const str = executor + JSON.stringify(input);
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
    // High confidence — repaired inputs with good defaults land here
    if (bucket < 95) return 'success';
    if (bucket < 98) return 'recoverable_error';
    return 'non_recoverable_error';
  } else if (confidence >= 0.6) {
    // Medium confidence — partially valid / shape_alien after repair
    if (bucket < 82) return 'success';
    if (bucket < 93) return 'recoverable_error';
    return 'non_recoverable_error';
  } else if (confidence >= 0.3) {
    if (bucket < 50) return 'success';
    if (bucket < 80) return 'recoverable_error';
    return 'non_recoverable_error';
  } else {
    if (bucket < 10) return 'success';
    if (bucket < 65) return 'recoverable_error';
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
    
    // #12: Use schema validation for graduated fidelity
    const report = validateInput(executorName, input);
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
 * Register shadow stub executors for all 5 pilot synergies.
 * Safe to call multiple times — only registers once.
 */
export function registerShadowStubs(): void {
  if (stubsRegistered) return;

  for (const name of PILOT_EXECUTORS) {
    try {
      const rawStub = createStubExecutor(name);
      const wrappedStub = wrapExecutor(rawStub, name, { module: 'INCLUSIVE', scope: 'shadow-probe' });
      registerSynergyExecutor(name, wrappedStub);
      log.info('shadow', `Stub executor registered (v3 graduated fidelity): ${name}`);
    } catch (err) {
      log.warn('shadow', `Failed to register stub for "${name}": ${(err as Error).message}`);
    }
  }

  stubsRegistered = true;
  log.info('shadow', `All shadow stubs registered (${PILOT_EXECUTORS.length} executors, graduated fidelity)`);
}
