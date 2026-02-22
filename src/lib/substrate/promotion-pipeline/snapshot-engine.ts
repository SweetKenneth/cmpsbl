/**
 * Snapshot Engine — Captures system state for diff + rollback
 */

import { supabase } from '@/integrations/supabase/client';
import type { SnapshotType, SystemSnapshot } from './types';

/** Generate a deterministic hash from object */
function hashObject(obj: any): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(8, '0');
}

/** Capture a snapshot of current system state */
export async function captureSnapshot(type: SnapshotType): Promise<SystemSnapshot | null> {
  // Gather current metrics
  const [rulesRes, metricsRes] = await Promise.all([
    supabase.from('immunity_rules').select('id, rule_key, status, confidence, success_rate').limit(500) as any,
    supabase.from('system_metrics_history').select('*').order('recorded_at', { ascending: false }).limit(1) as any,
  ]);

  const rules = rulesRes.data ?? [];
  const latestMetrics = metricsRes.data?.[0] ?? {};

  const ruleHash = hashObject(rules.map((r: any) => ({ k: r.rule_key, s: r.status, c: r.confidence })));
  const executorHash = hashObject(rules.map((r: any) => r.rule_key).sort());
  const commitHash = hashObject({ ts: Date.now(), type });

  const { data, error } = await supabase.from('system_snapshots').insert({
    type,
    commit_hash: commitHash,
    executor_hash: executorHash,
    rule_hash: ruleHash,
    file_manifest_hash: hashObject({ files: rules.length }),
    metrics_json: {
      rule_count: rules.length,
      promoted: rules.filter((r: any) => r.status === 'promoted').length,
      avg_confidence: rules.length > 0 ? rules.reduce((s: number, r: any) => s + (r.confidence ?? 0), 0) / rules.length : 0,
      avg_success_rate: rules.length > 0 ? rules.reduce((s: number, r: any) => s + (r.success_rate ?? 0), 0) / rules.length : 0,
      latest_metrics: latestMetrics,
    },
  } as any).select().single() as any;

  if (error) {
    console.error('[Snapshot] Capture failed:', error);
    return null;
  }
  return data;
}

/** Get latest snapshot by type */
export async function getLatestSnapshot(type: SnapshotType): Promise<SystemSnapshot | null> {
  const { data } = await supabase
    .from('system_snapshots')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1) as any;
  return data?.[0] ?? null;
}
