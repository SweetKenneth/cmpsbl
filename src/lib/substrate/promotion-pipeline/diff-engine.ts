/**
 * Diff Engine — Compares two snapshots and produces a structured diff
 */

import { supabase } from '@/integrations/supabase/client';
import type { SystemSnapshot, SystemDiff, DiffSummary } from './types';

/** Generate diff between two snapshots */
export function computeDiff(from: SystemSnapshot, to: SystemSnapshot): DiffSummary {
  const fm = from.metrics_json ?? {};
  const tm = to.metrics_json ?? {};

  const fromRules = fm.rule_count ?? 0;
  const toRules = tm.rule_count ?? 0;
  const fromPromoted = fm.promoted ?? 0;
  const toPromoted = tm.promoted ?? 0;

  return {
    rules_added: Math.max(0, toRules - fromRules),
    rules_removed: Math.max(0, fromRules - toRules),
    rules_modified: Math.abs(toPromoted - fromPromoted),
    executor_health_delta: (tm.avg_success_rate ?? 0) - (fm.avg_success_rate ?? 0),
    success_rate_delta: (tm.latest_metrics?.success_rate ?? 0) - (fm.latest_metrics?.success_rate ?? 0),
    escalation_delta: (tm.latest_metrics?.escalation_rate ?? 0) - (fm.latest_metrics?.escalation_rate ?? 0),
    latency_delta: (tm.latest_metrics?.latency_p95 ?? 0) - (fm.latest_metrics?.latency_p95 ?? 0),
    cost_delta: (tm.latest_metrics?.cost_index ?? 0) - (fm.latest_metrics?.cost_index ?? 0),
  };
}

/** Store a diff in the database */
export async function storeDiff(
  shadowRunId: string,
  fromSnapshot: SystemSnapshot,
  toSnapshot: SystemSnapshot
): Promise<SystemDiff | null> {
  const summary = computeDiff(fromSnapshot, toSnapshot);
  
  const patchText = [
    `--- Snapshot ${fromSnapshot.id.slice(0, 8)} (${fromSnapshot.type})`,
    `+++ Snapshot ${toSnapshot.id.slice(0, 8)} (${toSnapshot.type})`,
    `Rules: ${summary.rules_added} added, ${summary.rules_removed} removed, ${summary.rules_modified} modified`,
    `Success Rate Δ: ${(summary.success_rate_delta * 100).toFixed(2)}%`,
    `Escalation Δ: ${(summary.escalation_delta * 100).toFixed(2)}%`,
    `Latency Δ: ${(summary.latency_delta * 100).toFixed(2)}%`,
    `Cost Δ: ${(summary.cost_delta * 100).toFixed(2)}%`,
    `Executor Health Δ: ${(summary.executor_health_delta * 100).toFixed(2)}%`,
  ].join('\n');

  const { data, error } = await supabase.from('system_diffs').insert({
    shadow_run_id: shadowRunId,
    from_snapshot_id: fromSnapshot.id,
    to_snapshot_id: toSnapshot.id,
    diff_summary_json: summary,
    diff_patch_text: patchText,
  } as any).select().single() as any;

  if (error) {
    console.error('[Diff] Store failed:', error);
    return null;
  }
  return data;
}

/** Get recent diffs */
export async function getRecentDiffs(limit = 10): Promise<SystemDiff[]> {
  const { data } = await supabase
    .from('system_diffs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit) as any;
  return data ?? [];
}
