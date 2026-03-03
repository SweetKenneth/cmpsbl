/**
 * PASS 3 — INTEGRATION PASS
 * Verifies key cross-module flows work end-to-end
 */

import type { PassResult } from '../types';

interface IntegrationTest {
  name: string;
  run: () => Promise<{ ok: boolean; note: string }>;
}

function createTests(): IntegrationTest[] {
  return [
    {
      name: 'Event emission pipeline (RIPPLE)',
      async run() {
        try {
          const { emit } = await import('@/lib/substrate/events/emit');
          await emit({ module: 'integration-test', event_type: 'release-gate:smoke', outcome: 'started', data: { test: true } });
          return { ok: true, note: 'Event emitted without error' };
        } catch (e: any) {
          return { ok: false, note: `RIPPLE emission failed: ${e.message}` };
        }
      },
    },
    {
      name: 'Safe execution wrapper',
      async run() {
        try {
          const { safeExecute } = await import('@/lib/system/hardening');
          const result = await safeExecute(async () => 42);
          return {
            ok: result.success && result.data === 42,
            note: result.success ? 'safeExecute returned correct value' : `Unexpected: ${result.error}`,
          };
        } catch (e: any) {
          return { ok: false, note: `safeExecute failed: ${e.message}` };
        }
      },
    },
    {
      name: 'Hardening utilities (withTimeout)',
      async run() {
        try {
          const { withTimeout } = await import('@/lib/system/hardening');
          const val = await withTimeout(() => Promise.resolve('ok'), 5000);
          return { ok: val === 'ok', note: 'withTimeout resolved correctly' };
        } catch (e: any) {
          return { ok: false, note: `withTimeout failed: ${e.message}` };
        }
      },
    },
    {
      name: 'Terminal registry validation',
      async run() {
        try {
          const { validateRegistry } = await import('@/lib/terminal/validate-registry');
          const result = validateRegistry([]);
          return {
            ok: result.valid !== false,
            note: `Registry: ${result.valid ? 'valid' : 'invalid'}`,
          };
        } catch (e: any) {
          return { ok: false, note: `Registry validation error: ${e.message}` };
        }
      },
    },
    {
      name: 'Error system (createAppError)',
      async run() {
        try {
          const { createAppError, fromError } = await import('@/lib/system/errors');
          const err = createAppError('INTERNAL_ERROR', 'integration smoke', {}, 'test-trace');
          const wrapped = fromError(new Error('boom'), 'MODULE_ERROR', 'test-trace');
          return {
            ok: err.code === 'INTERNAL_ERROR' && wrapped.code === 'MODULE_ERROR',
            note: 'Error creation + wrapping works',
          };
        } catch (e: any) {
          return { ok: false, note: `Error system failed: ${e.message}` };
        }
      },
    },
    {
      name: 'Retry utility',
      async run() {
        try {
          const { withRetry, RetryPresets } = await import('@/lib/system/retry');
          let attempts = 0;
          const result = await withRetry(async () => {
            attempts++;
            if (attempts < 2) throw new Error('transient');
            return 'success';
          }, RetryPresets.fast, 'integration-test');
          return { ok: result === 'success', note: `Retry succeeded after ${attempts} attempts` };
        } catch (e: any) {
          return { ok: false, note: `Retry utility failed: ${e.message}` };
        }
      },
    },
    // === NEW: NEXUS circuit breaker integration ===
    {
      name: 'NEXUS circuit breaker lifecycle',
      async run() {
        try {
          const { isProviderAvailable, recordFailure, resetCircuit, updateCircuitConfig } = await import('@/lib/nexus/circuitBreaker');
          updateCircuitConfig({ failure_threshold: 3, cooldown_ms: 50 });
          resetCircuit('integration-test-provider');
          
          // Should be available initially
          if (!isProviderAvailable('integration-test-provider')) {
            return { ok: false, note: 'Provider not available on fresh circuit' };
          }
          
          // Trip the breaker
          for (let i = 0; i < 3; i++) recordFailure('integration-test-provider');
          if (isProviderAvailable('integration-test-provider')) {
            return { ok: false, note: 'Circuit did not open after threshold' };
          }
          
          resetCircuit('integration-test-provider');
          return { ok: true, note: 'Circuit breaker open/reset lifecycle verified' };
        } catch (e: any) {
          return { ok: false, note: `Circuit breaker test failed: ${e.message}` };
        }
      },
    },
    // === NEW: Correlation ID propagation ===
    {
      name: 'Correlation ID context propagation',
      async run() {
        try {
          const { createContext, forkContext, extractHeaders, cleanupContexts } = await import('@/lib/substrate/correlation-id/index');
          const root = createContext('GATE', 'release-check');
          const child = forkContext(root, 'CHILD', 'sub-op');
          const headers = extractHeaders(child);
          
          const ok = !!headers['x-correlation-id'] && !!headers['x-root-id'] && child.rootId === root.rootId;
          cleanupContexts(0);
          return { ok, note: ok ? 'Correlation ID propagates root→child→headers' : 'Propagation broken' };
        } catch (e: any) {
          return { ok: false, note: `Correlation ID failed: ${e.message}` };
        }
      },
    },
    // === NEW: Cost ceiling gate ===
    {
      name: 'NEXUS cost ceiling enforcement',
      async run() {
        try {
          const { setCostCeilingConfig, getCostCeilingConfig } = await import('@/lib/nexus/cost-ceiling');
          setCostCeilingConfig({ dailyLimit: 500000 });
          const cfg = getCostCeilingConfig();
          const ok = cfg.dailyLimit === 500000;
          setCostCeilingConfig({}); // reset
          return { ok, note: ok ? 'Cost ceiling config set/get verified' : 'Config not stored' };
        } catch (e: any) {
          return { ok: false, note: `Cost ceiling failed: ${e.message}` };
        }
      },
    },
  ];
}

export async function runIntegrationPass(): Promise<PassResult> {
  const start = Date.now();
  const notes: string[] = [];
  const tests = createTests();
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.run();
      if (result.ok) {
        passed++;
        notes.push(`✓ ${test.name}: ${result.note}`);
      } else {
        failed++;
        notes.push(`✗ ${test.name}: ${result.note}`);
      }
    } catch (e: any) {
      failed++;
      notes.push(`✗ ${test.name}: Uncaught — ${e.message}`);
    }
  }

  return {
    pass: 3,
    name: 'INTEGRATION',
    status: failed > 0 ? 'FAIL' : 'PASS',
    required: true,
    durationMs: Date.now() - start,
    notes,
    artifacts: [],
    details: { total: tests.length, passed, failed },
  };
}
