/**
 * Telemetry Contract + Aggregator — Sanity Tests
 * These tests enforce the correct formulas so they never silently drift.
 */

import { describe, it, expect } from 'vitest';
import { aggregateRows, aggregatePerExecutor, type RawMetricsRow } from '../aggregate-core';
import { formatRate, validateMetricsRow } from '../contract';

function makeRow(overrides: Partial<RawMetricsRow> = {}): RawMetricsRow {
  return {
    executor: 'test-executor',
    total_runs: 0,
    repair_successes: 0,
    escalations: 0,
    safe_failures: 0,
    repair_attempted: false,
    repair_success: false,
    retry_attempted: false,
    ...overrides,
  };
}

describe('aggregateRows', () => {
  it('Case A: 100 runs, 5 repairs, 0 escalations, 1 retry => attemptRate=5%, success=100%', () => {
    const rows: RawMetricsRow[] = [
      makeRow({ total_runs: 100, repair_successes: 5, escalations: 0, safe_failures: 40 }),
    ];
    const result = aggregateRows(rows);

    expect(result.totalRuns).toBe(100);
    expect(result.repairAttempts).toBe(5); // successes + escalations
    expect(result.repairSuccesses).toBe(5);
    expect(result.repairAttemptRate).toBeCloseTo(5, 1);
    expect(result.repairSuccessPct).toBeCloseTo(100, 1);
    expect(result.retryRate).toBeCloseTo(5, 1); // retries = repair_successes
  });

  it('Case B: shadow mesh probes should aggregate independently', () => {
    const shadowRows = [
      makeRow({ executor: 'shadow-exec', total_runs: 50, repair_successes: 2, escalations: 1, safe_failures: 20 }),
    ];
    const baselineRows: RawMetricsRow[] = [];

    const shadow = aggregateRows(shadowRows);
    const baseline = aggregateRows(baselineRows);

    // Shadow should have values
    expect(shadow.totalRuns).toBe(50);
    expect(shadow.repairAttempts).toBe(3);

    // Baseline should be empty
    expect(baseline.totalRuns).toBe(0);
    expect(baseline.repairAttemptRate).toBeNull();
    expect(baseline.repairSuccessPct).toBeNull();
  });

  it('Case C: no repair attempts => successPct should be null', () => {
    const rows = [makeRow({ total_runs: 50, repair_successes: 0, escalations: 0, safe_failures: 10 })];
    const result = aggregateRows(rows);

    expect(result.repairAttempts).toBe(0);
    expect(result.repairSuccessPct).toBeNull();
    expect(result.repairAttemptRate).toBeCloseTo(0, 1);
  });

  it('zero runs => all rates null', () => {
    const result = aggregateRows([]);
    expect(result.repairAttemptRate).toBeNull();
    expect(result.repairSuccessPct).toBeNull();
    expect(result.retryRate).toBeNull();
  });

  it('safe_failures never count as repair attempts', () => {
    const rows = [makeRow({ total_runs: 100, repair_successes: 0, escalations: 0, safe_failures: 80 })];
    const result = aggregateRows(rows);
    expect(result.repairAttempts).toBe(0);
    expect(result.repairAttemptRate).toBeCloseTo(0, 1);
  });
});

describe('aggregatePerExecutor', () => {
  it('groups by executor correctly', () => {
    const rows = [
      makeRow({ executor: 'A', total_runs: 50, repair_successes: 2, escalations: 1, safe_failures: 10 }),
      makeRow({ executor: 'A', total_runs: 50, repair_successes: 3, escalations: 0, safe_failures: 15 }),
      makeRow({ executor: 'B', total_runs: 100, repair_successes: 0, escalations: 0, safe_failures: 30 }),
    ];

    const result = aggregatePerExecutor(rows);
    expect(result).toHaveLength(2);

    const execA = result.find(e => e.executor === 'A')!;
    expect(execA.totalRuns).toBe(100);
    expect(execA.repairAttempts).toBe(6); // 2+3 successes + 1 escalation
    expect(execA.repairSuccesses).toBe(5);
    expect(execA.repairRate).toBeCloseTo(83.3, 0);

    const execB = result.find(e => e.executor === 'B')!;
    expect(execB.repairAttempts).toBe(0);
    expect(execB.repairRate).toBeNull();
  });
});

describe('formatRate', () => {
  it('null => "—"', () => {
    expect(formatRate(null)).toBe('—');
  });

  it('number => formatted', () => {
    expect(formatRate(85.714)).toBe('85.7%');
    expect(formatRate(0)).toBe('0.0%');
    expect(formatRate(100)).toBe('100.0%');
  });
});

describe('validateMetricsRow', () => {
  it('valid row passes', () => {
    const row = makeRow({ total_runs: 10 });
    expect(validateMetricsRow(row)).not.toBeNull();
  });

  it('invalid row returns null', () => {
    expect(validateMetricsRow({ executor: 123 })).toBeNull();
    expect(validateMetricsRow(null)).toBeNull();
  });
});
