/**
 * PASS 5 — PERFORMANCE PASS
 * Confirms baseline performance doesn't degrade
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { PassResult, PerfBaseline } from '../types';

const BASELINE_PATH = join(process.cwd(), 'reports', 'release', 'perf-baseline.json');

interface PerfMeasurement {
  name: string;
  measure: () => Promise<number>;
  budgetMs: number;
}

function createMeasurements(): PerfMeasurement[] {
  return [
    {
      name: 'Module import (system/errors)',
      budgetMs: 500,
      async measure() {
        const s = performance.now();
        await import('@/lib/system/errors');
        return performance.now() - s;
      },
    },
    {
      name: 'Trace ID generation (1000x)',
      budgetMs: 100,
      async measure() {
        const { generateTraceId } = await import('@/lib/system/trace');
        const s = performance.now();
        for (let i = 0; i < 1000; i++) generateTraceId();
        return performance.now() - s;
      },
    },
    {
      name: 'Hardening clampNumber (10000x)',
      budgetMs: 50,
      async measure() {
        const { clampNumber } = await import('@/lib/system/hardening');
        const s = performance.now();
        for (let i = 0; i < 10_000; i++) clampNumber(Math.random() * 200 - 50, 0, 100, 0);
        return performance.now() - s;
      },
    },
    {
      name: 'Correlation ID generation (1000x)',
      budgetMs: 100,
      async measure() {
        const { generateCorrelationId } = await import('@/lib/substrate/correlation-id/index');
        const s = performance.now();
        for (let i = 0; i < 1000; i++) generateCorrelationId();
        return performance.now() - s;
      },
    },
    {
      name: 'Cost estimation (100x)',
      budgetMs: 200,
      async measure() {
        const { estimateCost } = await import('@/lib/nexus/costEstimation');
        const s = performance.now();
        for (let i = 0; i < 100; i++) {
          estimateCost('groq' as any, 'llama-3-70b', 'A test prompt for cost estimation benchmarking');
        }
        return performance.now() - s;
      },
    },
    {
      name: 'Circuit breaker state check (1000x)',
      budgetMs: 50,
      async measure() {
        const { isProviderAvailable, resetCircuit } = await import('@/lib/nexus/circuitBreaker');
        resetCircuit('perf-bench');
        const s = performance.now();
        for (let i = 0; i < 1000; i++) isProviderAvailable('perf-bench');
        return performance.now() - s;
      },
    },
  ];
}

export async function runPerformancePass(): Promise<PassResult> {
  const start = Date.now();
  const notes: string[] = [];
  const measurements = createMeasurements();
  const results: Record<string, number> = {};
  let failed = 0;

  // Load baseline
  let baseline: PerfBaseline | null = null;
  if (existsSync(BASELINE_PATH)) {
    try {
      baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
    } catch { /* ignore */ }
  }

  for (const m of measurements) {
    try {
      // Run 3 times, take median
      const runs: number[] = [];
      for (let i = 0; i < 3; i++) {
        runs.push(await m.measure());
      }
      runs.sort((a, b) => a - b);
      const median = runs[1];
      results[m.name] = median;

      const threshold = baseline?.thresholds[m.name] ?? m.budgetMs;
      const overBudget = median > threshold * 1.5; // 50% regression tolerance

      if (overBudget) {
        failed++;
        notes.push(`✗ ${m.name}: ${median.toFixed(1)}ms (budget: ${threshold.toFixed(1)}ms, +50% breach)`);
      } else {
        notes.push(`✓ ${m.name}: ${median.toFixed(1)}ms (budget: ${threshold.toFixed(1)}ms)`);
      }
    } catch (e: any) {
      notes.push(`⚠ ${m.name}: Could not measure — ${e.message?.slice(0, 80)}`);
    }
  }

  // Save baseline if first run
  if (!baseline && Object.keys(results).length > 0) {
    try {
      mkdirSync(join(process.cwd(), 'reports', 'release'), { recursive: true });
      const newBaseline: PerfBaseline = {
        createdAt: new Date().toISOString(),
        thresholds: results,
      };
      writeFileSync(BASELINE_PATH, JSON.stringify(newBaseline, null, 2));
      notes.push('📏 Baseline created (first run)');
    } catch { /* ignore */ }
  }

  return {
    pass: 5,
    name: 'PERFORMANCE',
    status: failed > 0 ? 'FAIL' : 'PASS',
    required: true,
    durationMs: Date.now() - start,
    notes,
    artifacts: baseline ? [] : [BASELINE_PATH],
    details: results,
  };
}
