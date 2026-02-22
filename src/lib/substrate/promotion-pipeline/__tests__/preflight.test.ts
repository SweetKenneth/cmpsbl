import { describe, it, expect } from 'vitest';
import { runPreflight } from '../preflight';
import type { DiffSummary, IntegrityScanRun } from '../types';

function makeDiff(overrides: Partial<DiffSummary> = {}): DiffSummary {
  return {
    rules_added: 2, rules_removed: 0, rules_modified: 1,
    executor_health_delta: 0.05, success_rate_delta: 0.02,
    escalation_delta: 0.01, latency_delta: 0.05, cost_delta: 0.1,
    ...overrides,
  };
}

function makeScan(overrides: Partial<IntegrityScanRun> = {}): IntegrityScanRun {
  return {
    id: 's1', mode: 'pre_promote', errors_found: 0, warnings_found: 1,
    health_score: 85, duration_ms: 500, created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('preflight', () => {
  it('passes when all thresholds met', () => {
    const result = runPreflight(makeDiff(), makeScan(), 0.85);
    expect(result.passed).toBe(true);
    expect(result.checks.every(c => c.passed)).toBe(true);
  });

  it('blocks on low success rate', () => {
    const result = runPreflight(makeDiff(), makeScan(), 0.4);
    expect(result.passed).toBe(false);
    expect(result.checks.find(c => c.name === 'Rule Success Rate')?.passed).toBe(false);
  });

  it('blocks on high escalation delta', () => {
    const result = runPreflight(makeDiff({ escalation_delta: 0.15 }), makeScan(), 0.85);
    expect(result.passed).toBe(false);
    expect(result.checks.find(c => c.name === 'Escalation Delta')?.passed).toBe(false);
  });

  it('blocks on high latency delta', () => {
    const result = runPreflight(makeDiff({ latency_delta: 0.25 }), makeScan(), 0.85);
    expect(result.passed).toBe(false);
  });

  it('blocks on high cost delta', () => {
    const result = runPreflight(makeDiff({ cost_delta: 0.30 }), makeScan(), 0.85);
    expect(result.passed).toBe(false);
  });

  it('blocks on low integrity score', () => {
    const result = runPreflight(makeDiff(), makeScan({ health_score: 50 }), 0.85);
    expect(result.passed).toBe(false);
  });

  it('blocks on critical errors', () => {
    const result = runPreflight(makeDiff(), makeScan({ errors_found: 2 }), 0.85);
    expect(result.passed).toBe(false);
  });

  it('multiple failures all reported', () => {
    const result = runPreflight(
      makeDiff({ escalation_delta: 0.15, latency_delta: 0.25 }),
      makeScan({ health_score: 50, errors_found: 3 }),
      0.4
    );
    expect(result.passed).toBe(false);
    const failedCount = result.checks.filter(c => !c.passed).length;
    expect(failedCount).toBeGreaterThanOrEqual(4);
  });

  it('blocks on low executor health', () => {
    const result = runPreflight(makeDiff(), makeScan(), 0.85, 0.3);
    expect(result.passed).toBe(false);
    expect(result.checks.find(c => c.name === 'Executor Health')?.passed).toBe(false);
  });

  it('passes executor health when above threshold', () => {
    const result = runPreflight(makeDiff(), makeScan(), 0.85, 0.75);
    expect(result.passed).toBe(true);
  });

  it('skips executor health check when not provided', () => {
    const result = runPreflight(makeDiff(), makeScan(), 0.85);
    expect(result.checks.find(c => c.name === 'Executor Health')).toBeUndefined();
  });
});
