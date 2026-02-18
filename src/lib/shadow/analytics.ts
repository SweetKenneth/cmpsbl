/**
 * Shadow Mesh — Analytics Aggregator
 * Queries immune_metrics and immune_escalations for admin dashboard
 */

import { supabase } from '@/integrations/supabase/client';

export interface MetricRow {
  executor: string;
  total_runs: number;
  repairs: number;
  escalations: number;
  safe_fails: number;
}

export interface EscalationRow {
  executor: string;
  severity: string;
  scope: string;
  created_at: string;
  status: string;
}

export interface ShadowMeshAnalyticsData {
  metrics: MetricRow[];
  recentEscalations: EscalationRow[];
}

export async function getShadowMeshAnalytics(): Promise<ShadowMeshAnalyticsData> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  // Fetch raw metrics from last 6h
  const { data: rawMetrics } = await supabase
    .from('immune_metrics')
    .select('executor, total_runs, repair_successes, escalations, safe_failures')
    .gte('run_at', sixHoursAgo);

  // Aggregate by executor client-side
  const byExecutor = new Map<string, MetricRow>();
  for (const row of rawMetrics ?? []) {
    const existing = byExecutor.get(row.executor);
    if (existing) {
      existing.total_runs += row.total_runs;
      existing.repairs += row.repair_successes;
      existing.escalations += row.escalations;
      existing.safe_fails += row.safe_failures;
    } else {
      byExecutor.set(row.executor, {
        executor: row.executor,
        total_runs: row.total_runs,
        repairs: row.repair_successes,
        escalations: row.escalations,
        safe_fails: row.safe_failures,
      });
    }
  }

  // Fetch recent escalations
  const { data: recentEscalations } = await supabase
    .from('immune_escalations')
    .select('executor, severity, scope, created_at, status')
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    metrics: Array.from(byExecutor.values()),
    recentEscalations: (recentEscalations ?? []) as EscalationRow[],
  };
}
