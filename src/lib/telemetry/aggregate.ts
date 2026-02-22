/**
 * Telemetry Aggregator — DB Fetch + Dashboard Assembly
 * Re-exports pure functions from aggregate-core for convenience.
 */

import { supabase } from '@/integrations/supabase/client';
import type { AggregatedMetrics, TelemetryDashboardData } from './contract';
import { aggregateRows, aggregatePerExecutor, type RawMetricsRow } from './aggregate-core';

export { aggregateRows, aggregatePerExecutor, type RawMetricsRow } from './aggregate-core';

export async function fetchTelemetryDashboard(windowHours = 6): Promise<TelemetryDashboardData> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

  const [metricsRes, escalationsRes] = await Promise.allSettled([
    supabase
      .from('immune_metrics')
      .select('executor, total_runs, repair_successes, escalations, safe_failures, repair_attempted, repair_success, retry_attempted')
      .gte('run_at', since),
    supabase
      .from('immune_escalations')
      .select('executor, severity, scope, created_at, status')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const rawRows: RawMetricsRow[] = metricsRes.status === 'fulfilled'
    ? ((metricsRes.value.data ?? []) as any[])
    : [];

  const recentEscalations = escalationsRes.status === 'fulfilled'
    ? ((escalationsRes.value.data ?? []) as any[])
    : [];

  // All immune_metrics rows come from shadow probes (runBatch.ts)
  const shadow = aggregateRows(rawRows);
  const baseline: AggregatedMetrics = {
    totalRuns: 0, repairAttempts: 0, repairSuccesses: 0,
    escalations: 0, safeFailures: 0, retries: 0,
    repairAttemptRate: null, repairSuccessPct: null, retryRate: null,
  };

  return {
    baseline,
    shadow,
    executorHealth: aggregatePerExecutor(rawRows),
    recentEscalations,
    windowHours,
  };
}
