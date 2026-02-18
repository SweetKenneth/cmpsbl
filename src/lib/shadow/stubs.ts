/**
 * Shadow Mesh — Stub Executors
 * Lightweight mock executors for the 5 pilot synergies.
 * Shadow-only, never exposed publicly.
 *
 * Each stub randomly: succeeds, throws recoverable, or throws non-recoverable.
 * Marked __shadow_stub__ = true so they can be identified and swapped later.
 */

import type { SynergyExecutionContext, SynergyResult, SynergyStepResult } from '@/lib/capabilities/synergies/types';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { registerSynergyExecutor } from '@/lib/capabilities/synergies/registry';
import { log } from '@/lib/system/log';

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

function pickOutcome(seed: number): StubOutcome {
  const bucket = seed % 10;
  // 40% success, 30% recoverable, 30% non-recoverable
  if (bucket < 4) return 'success';
  if (bucket < 7) return 'recoverable_error';
  return 'non_recoverable_error';
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
    const seed = hashSeed(ctx.input ?? {}, executorName);
    const outcome = pickOutcome(seed);
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
      registerSynergyExecutor(name, createStubExecutor(name));
      log.info('shadow', `Stub executor registered: ${name}`);
    } catch (err) {
      // If the synergy definition doesn't exist, skip gracefully
      log.warn('shadow', `Failed to register stub for "${name}": ${(err as Error).message}`);
    }
  }

  stubsRegistered = true;
  log.info('shadow', `All shadow stubs registered (${PILOT_EXECUTORS.length} executors)`);
}
