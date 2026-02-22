/**
 * Telemetry Aggregator — Pure Functions (no DB dependency)
 * Extracted so tests can import without triggering supabase client init.
 */

import type { AggregatedMetrics, ExecutorHealth } from './contract';

export interface RawMetricsRow {
  executor: string;
  total_runs: number;
  repair_successes: number;
  escalations: number;
  safe_failures: number;
  repair_attempted: boolean;
  repair_success: boolean;
  retry_attempted: boolean;
}

/**
 * Aggregate raw metrics rows into dashboard-ready shape.
 *
 * Repair attempts = repair_successes + escalations
 * (safe_failures are expected rejections, NOT repair attempts)
 */
export function aggregateRows(rows: RawMetricsRow[]): AggregatedMetrics {
  let totalRuns = 0;
  let repairSuccesses = 0;
  let escalations = 0;
  let safeFailures = 0;
  let retries = 0;

  for (const row of rows) {
    totalRuns += row.total_runs ?? 0;
    repairSuccesses += row.repair_successes ?? 0;
    escalations += row.escalations ?? 0;
    safeFailures += row.safe_failures ?? 0;
    retries += row.repair_successes ?? 0;
  }

  const repairAttempts = repairSuccesses + escalations;

  return {
    totalRuns,
    repairAttempts,
    repairSuccesses,
    escalations,
    safeFailures,
    retries,
    repairAttemptRate: totalRuns > 0 ? (repairAttempts / totalRuns) * 100 : null,
    repairSuccessPct: repairAttempts > 0 ? (repairSuccesses / repairAttempts) * 100 : null,
    retryRate: totalRuns > 0 ? (retries / totalRuns) * 100 : null,
  };
}

/**
 * Aggregate per-executor health from raw rows.
 */
export function aggregatePerExecutor(rows: RawMetricsRow[]): ExecutorHealth[] {
  const byExecutor = new Map<string, RawMetricsRow[]>();

  for (const row of rows) {
    const existing = byExecutor.get(row.executor) ?? [];
    existing.push(row);
    byExecutor.set(row.executor, existing);
  }

  return Array.from(byExecutor.entries()).map(([executor, eRows]) => {
    let totalRuns = 0, repairSuccesses = 0, escalations = 0, safeFailures = 0;
    for (const r of eRows) {
      totalRuns += r.total_runs ?? 0;
      repairSuccesses += r.repair_successes ?? 0;
      escalations += r.escalations ?? 0;
      safeFailures += r.safe_failures ?? 0;
    }
    const attempts = repairSuccesses + escalations;
    return {
      executor,
      totalRuns,
      repairAttempts: attempts,
      repairSuccesses,
      escalations,
      safeFailures,
      repairRate: attempts > 0 ? (repairSuccesses / attempts) * 100 : null,
    };
  });
}
