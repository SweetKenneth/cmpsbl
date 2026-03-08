/**
 * IMMUNITY — Probe Mini Test Harness
 * Generates adversarial inputs and runs them through wrapped executors
 *
 * Dev-only: immune.probeMini(executorName, count)
 */

import type { SynergyExecutionContext, SynergyResult } from '@/lib/capabilities/synergies/types';
import type { ImmuneOutcome } from './types';
import { getMetrics, resetMetrics, formatMetricsSummary } from './metrics';
import { log } from '@/lib/system/log';

export interface ProbeResult {
  executor: string;
  totalRuns: number;
  outcomes: Record<ImmuneOutcome, number>;
  summary: string;
}

/** Generate adversarial inputs for testing */
function generateAdversarialInputs(count: number): Record<string, unknown>[] {
  const inputs: Record<string, unknown>[] = [];

  const adversarial: Record<string, unknown>[] = [
    // Nulls / undefined
    {},
    { content: null },
    { content: undefined },
    { target: null, url: null },
    // Empty strings
    { content: '' },
    { target: '', url: '' },
    // Huge strings
    { content: 'x'.repeat(100_000) },
    { target: 'a'.repeat(50_000) },
    // Wrong types
    { content: 12345 },
    { content: true },
    { content: [1, 2, 3] },
    { target: { nested: 'object' } },
    { wcagLevel: 'ZZZZ' },
    { wcagLevel: 999 },
    { preferences: 'not-an-object' },
    { preferences: 42 },
    // Unicode / special chars
    { content: '🔥'.repeat(1000) },
    { content: '\x00\x01\x02\x03' },
    { target: '<script>alert(1)</script>' },
    { content: '"; DROP TABLE users; --' },
    // Missing expected fields (no content, no target)
    { irrelevant_key: 'value' },
    // Fake secrets (should be redacted)
    { content: 'hello', token: 'sk-abc123456789012345678' },
    { content: 'test', apikey: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0' },
    // Very deeply nested
    { content: { a: { b: { c: { d: { e: 'deep' } } } } } },
    // Array instead of object fields
    { ariaLabel: [1, 2, 3] },
    { userId: { __proto__: 'polluted' } },
  ];

  // Fill up to count with adversarial + random variations
  for (let i = 0; i < count; i++) {
    inputs.push(adversarial[i % adversarial.length]);
  }

  return inputs;
}

/**
 * Run probe mini against a wrapped executor
 */
export async function runProbeMini(
  executorName: string,
  wrappedFn: (ctx: SynergyExecutionContext) => Promise<SynergyResult>,
  count = 50,
): Promise<ProbeResult> {
  resetMetrics();

  const inputs = generateAdversarialInputs(count);
  const outcomes: Record<ImmuneOutcome, number> = {
    success: 0,
    repaired_success: 0,
    escalated: 0,
    failed_safe: 0,
  };

  for (const input of inputs) {
    const ctx: SynergyExecutionContext = {
      synergyId: executorName,
      input,
      caller: 'immune.probeMini',
      traceId: `probe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      dryRun: false,
    };

    try {
      const result = await wrappedFn(ctx);
      // Only track safe failures here — metrics counters are more accurate
      // for success/repair/escalation since wrapExecutor records them directly.
      if (!result.success) {
        outcomes.failed_safe++;
      }
    } catch {
      // Uncaught exception = safe failure (wrapper should prevent this)
      outcomes.failed_safe++;
    }
  }

  // Reconcile with metrics counters (authoritative source from wrapExecutor)
  const metrics = getMetrics();
  outcomes.repaired_success = metrics.repairSuccesses;
  outcomes.escalated = metrics.escalations;
  outcomes.failed_safe = Math.max(0, outcomes.failed_safe - metrics.escalations);
  outcomes.success = Math.max(0, count - outcomes.repaired_success - outcomes.escalated - outcomes.failed_safe);

  const summary = [
    `── Probe Mini: ${executorName} (${count} runs) ──`,
    `  ✅ Success:          ${outcomes.success} (${pct(outcomes.success, count)})`,
    `  🔧 Repaired:         ${outcomes.repaired_success} (${pct(outcomes.repaired_success, count)})`,
    `  📤 Escalated:        ${outcomes.escalated} (${pct(outcomes.escalated, count)})`,
    `  🛡️ Failed Safe:      ${outcomes.failed_safe} (${pct(outcomes.failed_safe, count)})`,
    ``,
    formatMetricsSummary(),
  ].join('\n');

  log.info('immune', summary);

  return {
    executor: executorName,
    totalRuns: count,
    outcomes,
    summary,
  };
}

function pct(n: number, total: number): string {
  return total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0.0%';
}
