/**
 * Telemetry Recorder — Records system metrics to history table
 * Computes all metrics including encode_assist_rate, latency_p95, cost_index.
 */

import { supabase } from '@/integrations/supabase/client';
import type { SystemMetricsPoint } from './types';

/** Record current system metrics snapshot */
export async function recordMetrics(): Promise<void> {
  try {
    // Gather current state in parallel
    const [rulesRes, metricsRes, promotionsRes, invocationsRes, encodeRes] = await Promise.all([
      supabase.from('immunity_rules').select('status, success_rate, confidence').limit(500) as any,
      supabase.from('immune_metrics').select('total_runs, safe_fails, escalations, repairs_attempted, repairs_succeeded').limit(500) as any,
      supabase.from('production_promotions').select('status, rollback_triggered').order('created_at', { ascending: false }).limit(100) as any,
      supabase.from('immunity_rule_invocations').select('duration_ms, cost_units')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('duration_ms', { ascending: false }).limit(500) as any,
      // ENCODE assist: count escalations that were resolved
      supabase.from('immunity_rule_conflicts').select('resolution')
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(200) as any,
    ]);

    const rules = rulesRes.data ?? [];
    const metrics = metricsRes.data ?? [];
    const promotions = promotionsRes.data ?? [];
    const invocations = invocationsRes.data ?? [];
    const encodeConflicts = encodeRes.data ?? [];

    const rollbackCount = promotions.filter((p: any) => p.rollback_triggered === true).length;

    // Aggregate
    const totalRuns = metrics.reduce((s: number, m: any) => s + (m.total_runs ?? 0), 0);
    const safeFails = metrics.reduce((s: number, m: any) => s + (m.safe_fails ?? 0), 0);
    const escalations = metrics.reduce((s: number, m: any) => s + (m.escalations ?? 0), 0);
    const repairsAttempted = metrics.reduce((s: number, m: any) => s + (m.repairs_attempted ?? 0), 0);

    const successRate = totalRuns > 0 ? (totalRuns - safeFails - escalations) / totalRuns : null;
    const escalationRate = totalRuns > 0 ? escalations / totalRuns : null;

    // ENCODE assist rate: ratio of resolved conflicts to total conflicts
    const resolvedConflicts = encodeConflicts.filter((c: any) => c.resolution && c.resolution !== 'unresolved').length;
    const encodeAssistRate = encodeConflicts.length > 0 ? resolvedConflicts / encodeConflicts.length : null;

    const promoted = rules.filter((r: any) => r.status === 'promoted').length;
    const retired = rules.filter((r: any) => r.status === 'retired').length;
    const avgHealth = rules.length > 0
      ? rules.reduce((s: number, r: any) => s + (r.success_rate ?? 0), 0) / rules.length
      : null;

    // Latency P95: compute from invocations
    let latencyP95: number | null = null;
    if (invocations.length > 0) {
      const durations = invocations.map((i: any) => i.duration_ms ?? 0).sort((a: number, b: number) => a - b);
      const idx = Math.ceil(durations.length * 0.95) - 1;
      latencyP95 = durations[Math.min(idx, durations.length - 1)];
    }

    // Cost index: average cost_units across recent invocations
    let costIndex: number | null = null;
    if (invocations.length > 0) {
      const totalCost = invocations.reduce((s: number, i: any) => s + (i.cost_units ?? 0), 0);
      costIndex = totalCost / invocations.length;
    }

    // Get latest integrity score
    const { data: latestScan } = await supabase
      .from('integrity_scan_runs')
      .select('health_score')
      .order('created_at', { ascending: false })
      .limit(1) as any;

    await supabase.from('system_metrics_history').insert({
      success_rate: successRate,
      escalation_rate: escalationRate,
      encode_assist_rate: encodeAssistRate,
      avg_executor_health: avgHealth,
      rule_count: rules.length,
      promoted_rule_count: promoted,
      retired_rule_count: retired,
      rollback_count: rollbackCount,
      latency_p95: latencyP95,
      cost_index: costIndex,
      integrity_health_score: latestScan?.[0]?.health_score ?? null,
    } as any);
  } catch (err) {
    console.error('[Telemetry] recordMetrics failed:', err);
  }
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
