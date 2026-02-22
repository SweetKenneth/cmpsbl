/**
 * Longitudinal Telemetry — System Metrics History
 * Records metrics on promote, rollback, and periodically.
 * Supports 24h / 7d / 30d views.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface MetricsSnapshot {
  success_rate: number;
  escalation_rate: number;
  encode_assist_rate: number;
  avg_executor_health: number;
  rule_count: number;
  promoted_rule_count: number;
  retired_rule_count: number;
  rollback_count: number;
  latency_p95: number;
  cost_index: number;
  integrity_health_score: number;
}

export type TimeWindow = '24h' | '7d' | '30d';

// ═══════════════════════════════════════════════════════════════
// RECORD METRICS
// ═══════════════════════════════════════════════════════════════

export async function recordMetricsSnapshot(snapshot?: Partial<MetricsSnapshot>): Promise<void> {
  try {
    // Gather live metrics
    const metrics = await gatherCurrentMetrics();
    const merged = { ...metrics, ...snapshot };

    await supabase.from('system_metrics_history').insert({
      success_rate: merged.success_rate ?? 0,
      escalation_rate: merged.escalation_rate ?? 0,
      encode_assist_rate: merged.encode_assist_rate ?? 0,
      avg_executor_health: merged.avg_executor_health ?? 0,
      rule_count: merged.rule_count ?? 0,
      promoted_rule_count: merged.promoted_rule_count ?? 0,
      retired_rule_count: merged.retired_rule_count ?? 0,
      rollback_count: merged.rollback_count ?? 0,
      latency_p95: merged.latency_p95 ?? 0,
      cost_index: merged.cost_index ?? 0,
      integrity_health_score: merged.integrity_health_score ?? 100,
    });
  } catch (e) {
    console.warn('[MetricsHistory] Recording failed:', e);
  }
}

async function gatherCurrentMetrics(): Promise<Partial<MetricsSnapshot>> {
  const metrics: Partial<MetricsSnapshot> = {};

  try {
    // Success rate from immune_metrics
    const { data: immuneData } = await supabase
      .from('immune_metrics')
      .select('total_runs, safe_failures, escalations')
      .limit(50);

    if (immuneData && immuneData.length > 0) {
      const totalRuns = immuneData.reduce((s, m) => s + (m.total_runs ?? 0), 0);
      const totalFailures = immuneData.reduce(
        (s, m) => s + (m.safe_failures ?? 0) + (m.escalations ?? 0), 0
      );
      metrics.success_rate = totalRuns > 0 ? ((totalRuns - totalFailures) / totalRuns) * 100 : 100;
      metrics.avg_executor_health = metrics.success_rate;
    }

    // Escalation rate
    const { data: escalations } = await supabase
      .from('immune_escalations')
      .select('id')
      .gte('created_at', new Date(Date.now() - 86400000).toISOString());

    const { data: events } = await supabase
      .from('brain_events')
      .select('id')
      .gte('created_at', new Date(Date.now() - 86400000).toISOString())
      .limit(1000);

    const totalEvents = events?.length || 1;
    metrics.escalation_rate = ((escalations?.length || 0) / totalEvents) * 100;

    // Rollback count
    const { data: rollbacks } = await supabase
      .from('production_promotions')
      .select('id')
      .eq('rollback_triggered', true);
    metrics.rollback_count = rollbacks?.length || 0;

  } catch {
    // non-blocking
  }

  return metrics;
}

// ═══════════════════════════════════════════════════════════════
// QUERY METRICS
// ═══════════════════════════════════════════════════════════════

function getWindowStart(window: TimeWindow): string {
  const now = Date.now();
  const ms = window === '24h' ? 86400000 : window === '7d' ? 604800000 : 2592000000;
  return new Date(now - ms).toISOString();
}

export async function getMetricsHistory(window: TimeWindow = '7d'): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('system_metrics_history')
      .select('*')
      .gte('recorded_at', getWindowStart(window))
      .order('recorded_at', { ascending: true })
      .limit(500);
    return data || [];
  } catch {
    return [];
  }
}

export async function getLatestMetrics(): Promise<MetricsSnapshot | null> {
  try {
    const { data } = await supabase
      .from('system_metrics_history')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
    return data || null;
  } catch {
    return null;
  }
}

/**
 * Export metrics as JSON
 */
export async function exportMetricsJSON(window: TimeWindow = '7d'): Promise<string> {
  const history = await getMetricsHistory(window);
  return JSON.stringify({
    exported_at: new Date().toISOString(),
    window,
    data_points: history.length,
    metrics: history,
  }, null, 2);
}

/**
 * Export metrics as CSV
 */
export async function exportMetricsCSV(window: TimeWindow = '7d'): Promise<string> {
  const history = await getMetricsHistory(window);
  if (history.length === 0) return '';

  const headers = Object.keys(history[0]);
  const rows = history.map(row => headers.map(h => row[h] ?? '').join(','));
  return [headers.join(','), ...rows].join('\n');
}
