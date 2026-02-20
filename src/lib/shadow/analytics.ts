/**
 * Shadow Mesh — Analytics Aggregator
 * Queries immune_metrics and immune_escalations for admin dashboard
 * Phase 2: includes repair telemetry aggregation
 */

import { supabase } from '@/integrations/supabase/client';

export interface MetricRow {
  executor: string;
  total_runs: number;
  repairs: number;
  escalations: number;
  safe_fails: number;
  /** Phase 2 repair telemetry */
  repair_attempts: number;
  repair_successes: number;
  retries: number;
}

export interface EscalationRow {
  executor: string;
  severity: string;
  scope: string;
  created_at: string;
  status: string;
}

export interface RepairKPIs {
  repair_attempt_rate: number;  // repair_attempted / total_runs
  repair_success_rate: number;  // repair_success / repair_attempted
  retry_rate: number;           // retry_attempted / total_runs
}

export interface ShadowMeshAnalyticsData {
  metrics: MetricRow[];
  recentEscalations: EscalationRow[];
  repairKPIs: RepairKPIs;
}

export async function getShadowMeshAnalytics(): Promise<ShadowMeshAnalyticsData> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  // Fetch raw metrics from last 6h (including Phase 2 columns)
  const { data: rawMetrics } = await supabase
    .from('immune_metrics')
    .select('executor, total_runs, repair_successes, escalations, safe_failures, repair_attempted, repair_success, retry_attempted')
    .gte('run_at', sixHoursAgo);

  // Aggregate by executor client-side
  const byExecutor = new Map<string, MetricRow>();
  let totalRunsAll = 0;
  let totalRepairAttempts = 0;
  let totalRepairSuccesses = 0;
  let totalRetries = 0;

  for (const row of (rawMetrics ?? []) as any[]) {
    totalRunsAll += row.total_runs ?? 0;
    if (row.repair_attempted) totalRepairAttempts += row.total_runs ?? 0;
    if (row.repair_success) totalRepairSuccesses += row.total_runs ?? 0;
    if (row.retry_attempted) totalRetries += row.total_runs ?? 0;

    const existing = byExecutor.get(row.executor);
    if (existing) {
      existing.total_runs += row.total_runs;
      existing.repairs += row.repair_successes;
      existing.escalations += row.escalations;
      existing.safe_fails += row.safe_failures;
      existing.repair_attempts += row.repair_attempted ? (row.total_runs ?? 0) : 0;
      existing.repair_successes += row.repair_success ? (row.total_runs ?? 0) : 0;
      existing.retries += row.retry_attempted ? (row.total_runs ?? 0) : 0;
    } else {
      byExecutor.set(row.executor, {
        executor: row.executor,
        total_runs: row.total_runs,
        repairs: row.repair_successes,
        escalations: row.escalations,
        safe_fails: row.safe_failures,
        repair_attempts: row.repair_attempted ? (row.total_runs ?? 0) : 0,
        repair_successes: row.repair_success ? (row.total_runs ?? 0) : 0,
        retries: row.retry_attempted ? (row.total_runs ?? 0) : 0,
      });
    }
  }

  // Fetch recent escalations
  const { data: recentEscalations } = await supabase
    .from('immune_escalations')
    .select('executor, severity, scope, created_at, status')
    .order('created_at', { ascending: false })
    .limit(10);

  const repairKPIs: RepairKPIs = {
    repair_attempt_rate: totalRunsAll > 0 ? totalRepairAttempts / totalRunsAll : 0,
    repair_success_rate: totalRepairAttempts > 0 ? totalRepairSuccesses / totalRepairAttempts : 0,
    retry_rate: totalRunsAll > 0 ? totalRetries / totalRunsAll : 0,
  };

  return {
    metrics: Array.from(byExecutor.values()),
    recentEscalations: (recentEscalations ?? []) as EscalationRow[],
    repairKPIs,
  };
}
