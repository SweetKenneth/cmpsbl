/**
 * Telemetry Recorder — Records system metrics to history table
 */

import { supabase } from '@/integrations/supabase/client';
import type { SystemMetricsPoint } from './types';

/** Record current system metrics snapshot */
export async function recordMetrics(): Promise<void> {
  // Gather current state
  const [rulesRes, metricsRes, promotionsRes] = await Promise.all([
    supabase.from('immunity_rules').select('status, success_rate, confidence').limit(500) as any,
    supabase.from('immune_metrics').select('total_runs, safe_fails, escalations, repairs_attempted, repairs_succeeded').limit(500) as any,
    supabase.from('production_promotions').select('status').eq('rollback_triggered', true).limit(100) as any,
  ]);

  const rules = rulesRes.data ?? [];
  const metrics = metricsRes.data ?? [];
  const rollbackCount = (promotionsRes.data ?? []).length;

  // Aggregate
  const totalRuns = metrics.reduce((s: number, m: any) => s + (m.total_runs ?? 0), 0);
  const safeFails = metrics.reduce((s: number, m: any) => s + (m.safe_fails ?? 0), 0);
  const escalations = metrics.reduce((s: number, m: any) => s + (m.escalations ?? 0), 0);

  const successRate = totalRuns > 0 ? (totalRuns - safeFails - escalations) / totalRuns : null;
  const escalationRate = totalRuns > 0 ? escalations / totalRuns : null;

  const promoted = rules.filter((r: any) => r.status === 'promoted').length;
  const retired = rules.filter((r: any) => r.status === 'retired').length;
  const avgHealth = rules.length > 0 
    ? rules.reduce((s: number, r: any) => s + (r.success_rate ?? 0), 0) / rules.length 
    : null;

  // Get latest integrity score
  const { data: latestScan } = await supabase
    .from('integrity_scan_runs')
    .select('health_score')
    .order('created_at', { ascending: false })
    .limit(1) as any;

  await supabase.from('system_metrics_history').insert({
    success_rate: successRate,
    escalation_rate: escalationRate,
    encode_assist_rate: null,
    avg_executor_health: avgHealth,
    rule_count: rules.length,
    promoted_rule_count: promoted,
    retired_rule_count: retired,
    rollback_count: rollbackCount,
    latency_p95: null,
    cost_index: null,
    integrity_health_score: latestScan?.[0]?.health_score ?? null,
  } as any);
}

/** Get metrics history for a time range */
export async function getMetricsHistory(hours: number): Promise<SystemMetricsPoint[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('system_metrics_history')
    .select('*')
    .gte('recorded_at', since)
    .order('recorded_at') as any;
  return data ?? [];
}
