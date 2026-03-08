/**
 * IMMUNITY — Metrics
 * Simple in-memory counters for observability
 */

import type { ImmuneOutcome } from './types';

export interface ImmuneMetrics {
  totalRuns: number;
  preflightFailures: number;
  repairAttempts: number;
  repairSuccesses: number;
  escalations: number;
  safeFailures: number;
}

const counters: ImmuneMetrics = {
  totalRuns: 0,
  preflightFailures: 0,
  repairAttempts: 0,
  repairSuccesses: 0,
  escalations: 0,
  safeFailures: 0,
};

export function incrementMetric(key: keyof ImmuneMetrics, by = 1): void {
  counters[key] += by;
}

export function recordOutcome(outcome: ImmuneOutcome): void {
  counters.totalRuns++;
  switch (outcome) {
    case 'repaired_success':
      counters.repairSuccesses++;
      break;
    case 'escalated':
      counters.escalations++;
      break;
    case 'failed_safe':
      counters.safeFailures++;
      break;
    // 'success' just increments totalRuns
  }
}

export function getMetrics(): Readonly<ImmuneMetrics> {
  return { ...counters };
}

export function resetMetrics(): void {
  counters.totalRuns = 0;
  counters.preflightFailures = 0;
  counters.repairAttempts = 0;
  counters.repairSuccesses = 0;
  counters.escalations = 0;
  counters.safeFailures = 0;
}

export function formatMetricsSummary(): string {
  const m = counters;
  const repairRate = m.repairAttempts > 0
    ? ((m.repairSuccesses / m.repairAttempts) * 100).toFixed(1)
    : '0.0';
  const successRate = m.totalRuns > 0
    ? (((m.totalRuns - m.escalations - m.safeFailures) / m.totalRuns) * 100).toFixed(1)
    : '0.0';

  return [
    `── Immune Pilot Metrics ──`,
    `  Total runs:        ${m.totalRuns}`,
    `  Preflight fails:   ${m.preflightFailures}`,
    `  Repair attempts:   ${m.repairAttempts}`,
    `  Repair successes:  ${m.repairSuccesses} (${repairRate}%)`,
    `  Escalations:       ${m.escalations}`,
    `  Safe failures:     ${m.safeFailures}`,
    `  Success rate:      ${successRate}%`,
  ].join('\n');
}
