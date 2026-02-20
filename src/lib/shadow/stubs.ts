/**
 * Shadow Mesh — Stub Executors
 * Lightweight mock executors for the 5 pilot synergies.
 * Shadow-only, never exposed publicly.
 *
 * v2: Input-quality-aware — stubs succeed when the input is well-formed
 * (e.g. after deterministic repair), so repair success rates accurately
 * reflect pipeline effectiveness. Only a small % of runs simulate
 * truly non-recoverable infrastructure failures.
 *
 * Marked __shadow_stub__ = true so they can be identified and swapped later.
 */

import type { SynergyExecutionContext, SynergyResult, SynergyStepResult } from '@/lib/capabilities/synergies/types';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { registerSynergyExecutor } from '@/lib/capabilities/synergies/registry';
import { wrapExecutor } from '@/immune/wrapExecutor';
import { log } from '@/lib/system/log';

/** Marker so callers can detect stubs */
export const __shadow_stub__ = true;

/**
 * Expected keys that indicate a well-formed pilot executor input.
 * If at least one is present AND is a non-empty string, the input is "valid".
 */
const QUALITY_KEYS = ['content', 'url', 'domain', 'userId', 'wcagLevel', 'ariaLabel', 'target'] as const;

/**
 * Check if an input is well-formed enough for a pilot executor to succeed.
 * This is the key change: stubs now respect input quality so that the
 * deterministic repair pipeline's work is reflected in outcomes.
 */
function isInputWellFormed(input: Record<string, unknown>): boolean {
  if (!input || typeof input !== 'object') return false;
  const keys = Object.keys(input);
  if (keys.length === 0) return false;

  // Must have at least one recognized key with a non-empty string value
  const hasQualityKey = QUALITY_KEYS.some(k => {
    const v = input[k];
    return typeof v === 'string' && v.length > 0 && v !== '' && !v.startsWith('[empty:');
  });

  // All values must be primitives or stringified (no raw objects/arrays)
  const allPrimitive = keys.every(k => {
    const v = input[k];
    return v === null || v === undefined || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
  });

  return hasQualityKey && allPrimitive;
}

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
 * v2 outcome logic:
 * - Well-formed input → 90% success, 5% recoverable, 5% non-recoverable (infra sim)
 * - Malformed input   → 15% success, 55% recoverable, 30% non-recoverable
 *
 * This means when the 39-rule deterministic repair fixes malformed inputs
 * into well-formed ones, the retry will succeed ~90% of the time.
 */
function pickOutcome(seed: number, wellFormed: boolean): StubOutcome {
  const bucket = seed % 20;
  if (wellFormed) {
    // Well-formed: 18/20 success, 1/20 recoverable, 1/20 non-recoverable
    if (bucket < 18) return 'success';
    if (bucket < 19) return 'recoverable_error';
    return 'non_recoverable_error';
  } else {
    // Malformed: 3/20 success, 11/20 recoverable, 6/20 non-recoverable
    if (bucket < 3) return 'success';
    if (bucket < 14) return 'recoverable_error';
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
 * Factory: creates a shadow stub executor for a given pilot name.
 */
function createStubExecutor(executorName: string) {
  const fn = async (ctx: SynergyExecutionContext): Promise<SynergyResult> => {
    const input = ctx.input ?? {};
    const wellFormed = isInputWellFormed(input);
    const seed = hashSeed(input, executorName);
    const outcome = pickOutcome(seed, wellFormed);
    const latency = 5 + (seed % 50); // 5-54 ms simulated

    // Small async delay to simulate real work
    await new Promise((r) => setTimeout(r, latency));

    switch (outcome) {
      case 'success':
        return createSuccessResult(ctx, latency);

      case 'recoverable_error':
        // Throw an error the immune wrapper can attempt to repair
        throw new Error(
          `[stub:${executorName}] Recoverable validation failure — input shape mismatch`,
        );

      case 'non_recoverable_error':
        // Throw a hard error that should escalate
        throw new Error(
          `[stub:${executorName}] Non-recoverable: service unavailable simulation`,
        );
    }
  };

  // Tag the function so it's identifiable
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
      // Wrap with immune wrapper so deterministic repair + retry fires during probes
      const wrappedStub = wrapExecutor(rawStub, name, { module: 'INCLUSIVE', scope: 'shadow-probe' });
      registerSynergyExecutor(name, wrappedStub);
      log.info('shadow', `Stub executor registered (immune-wrapped): ${name}`);
    } catch (err) {
      // If the synergy definition doesn't exist, skip gracefully
      log.warn('shadow', `Failed to register stub for "${name}": ${(err as Error).message}`);
    }
  }

  stubsRegistered = true;
  log.info('shadow', `All shadow stubs registered (${PILOT_EXECUTORS.length} executors)`);
}
