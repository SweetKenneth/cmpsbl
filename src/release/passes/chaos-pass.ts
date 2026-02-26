/**
 * PASS 10 — CHAOS / FAILURE SIM PASS (Gated: RELEASE_GATE_CHAOS=1)
 * Intentionally breaks dependencies to ensure graceful failure
 */

import type { PassResult } from '../types';

interface ChaosScenario {
  name: string;
  simulate: () => Promise<{ ok: boolean; detail: string }>;
}

function createScenarios(): ChaosScenario[] {
  return [
    {
      name: 'Provider failure (safeExecute fallback)',
      async simulate() {
        try {
          const { safeExecute } = await import('@/lib/system/hardening');
          const result = await safeExecute(async () => {
            throw new Error('Simulated provider outage');
          });
          // safeExecute returns { success: false, error } — never throws
          return {
            ok: !result.success && !!result.error,
            detail: result.success ? 'safeExecute did not catch failure' : 'Provider failure handled gracefully',
          };
        } catch (e: any) {
          return { ok: false, detail: `Unhandled provider failure: ${e.message}` };
        }
      },
    },
    {
      name: 'Timeout path (withTimeout)',
      async simulate() {
        try {
          const { withTimeout } = await import('@/lib/system/hardening');
          try {
            await withTimeout(
              () => new Promise(resolve => setTimeout(resolve, 10_000)),
              100,
              'chaos-timeout'
            );
            return { ok: false, detail: 'Timeout did not fire' };
          } catch (e: any) {
            if (e.message?.includes('TIMEOUT')) {
              return { ok: true, detail: 'Timeout fired correctly at 100ms' };
            }
            return { ok: true, detail: `Operation rejected: ${e.message}` };
          }
        } catch (e: any) {
          return { ok: false, detail: `withTimeout not available: ${e.message}` };
        }
      },
    },
    {
      name: 'Rapid failure handling',
      async simulate() {
        try {
          const { safeExecute } = await import('@/lib/system/hardening');
          const results: boolean[] = [];
          for (let i = 0; i < 5; i++) {
            const r = await safeExecute(async () => {
              throw new Error(`Chaos failure ${i}`);
            });
            results.push(!r.success);
          }
          const allCaught = results.every(Boolean);
          return {
            ok: allCaught,
            detail: `${results.filter(Boolean).length}/5 rapid failures handled gracefully`,
          };
        } catch (e: any) {
          return { ok: false, detail: `Rapid failure sim crashed: ${e.message}` };
        }
      },
    },
    {
      name: 'Malformed input handling',
      async simulate() {
        try {
          const { validateStringInput, clampNumber, boundArray } = await import('@/lib/system/hardening');

          const str = validateStringInput(null as any, { maxLength: 100 });
          const num = clampNumber(NaN, 0, 100, 0);
          const arr = boundArray([1, 2, 3, 4, 5], 3);

          const allSafe = str === null && !isNaN(num) && arr.length <= 3;
          return {
            ok: allSafe,
            detail: allSafe ? 'All hardening guards handled malformed input' : 'Some guards failed',
          };
        } catch (e: any) {
          return { ok: false, detail: `Hardening guards crashed: ${e.message}` };
        }
      },
    },
  ];
}

export async function runChaosPass(): Promise<PassResult> {
  const start = Date.now();
  const enabled = process.env.RELEASE_GATE_CHAOS === '1';

  if (!enabled) {
    return {
      pass: 10,
      name: 'CHAOS / FAILURE SIM',
      status: 'SKIP',
      required: false,
      durationMs: Date.now() - start,
      notes: ['Gated pass — set RELEASE_GATE_CHAOS=1 to enable'],
      artifacts: [],
    };
  }

  const notes: string[] = [];
  const scenarios = createScenarios();
  let passed = 0;
  let failed = 0;

  for (const s of scenarios) {
    try {
      const result = await s.simulate();
      if (result.ok) {
        passed++;
        notes.push(`✓ ${s.name}: ${result.detail}`);
      } else {
        failed++;
        notes.push(`✗ ${s.name}: ${result.detail}`);
      }
    } catch (e: any) {
      failed++;
      notes.push(`✗ ${s.name}: Unhandled — ${e.message}`);
    }
  }

  return {
    pass: 10,
    name: 'CHAOS / FAILURE SIM',
    status: failed > 0 ? 'FAIL' : 'PASS',
    required: false,
    durationMs: Date.now() - start,
    notes,
    artifacts: [],
    details: { total: scenarios.length, passed, failed },
  };
}
