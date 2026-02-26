/**
 * GOAL Snapshot Persistence Layer
 * 
 * Persists GOAL snapshots to the database for cross-session retention
 * and LNCHBL distribution sync.
 * 
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import type { MetricSnapshot } from './snapshotEngine';
import { getLatestSnapshot, getAllSnapshots } from './snapshotEngine';

/**
 * Persist the latest GOAL snapshot to the database.
 */
export async function persistLatestSnapshot(): Promise<{
  persisted: boolean;
  snapshotId: string | null;
  error: string | null;
}> {
  const snapshot = getLatestSnapshot();
  if (!snapshot) {
    return { persisted: false, snapshotId: null, error: 'No snapshot available' };
  }

  try {
    const { error } = await supabase.from('brain_maintenance_log' as any).insert({
      task_type: 'goal_snapshot',
      status: 'completed',
      duration_ms: 0,
      items_processed: Object.keys(snapshot.modules).length,
      metadata: {
        snapshot_id: snapshot.snapshotId,
        timestamp: snapshot.timestamp,
        system_health: snapshot.systemHealth,
        module_count: Object.keys(snapshot.modules).length,
        metric_count: snapshot.flatMetrics.length,
        modules_summary: Object.entries(snapshot.modules).map(([id, m]) => ({
          id,
          health: m.healthScore,
        })),
      },
    });

    if (error) {
      return { persisted: false, snapshotId: snapshot.snapshotId, error: error.message };
    }

    return { persisted: true, snapshotId: snapshot.snapshotId, error: null };
  } catch (e) {
    return { persisted: false, snapshotId: snapshot.snapshotId, error: String(e) };
  }
}

/**
 * Persist a batch of snapshots for LNCHBL sync packaging.
 */
export async function persistSnapshotBatch(maxSnapshots = 6): Promise<number> {
  const all = getAllSnapshots();
  const recent = all.slice(-maxSnapshots);
  let persisted = 0;

  for (const _snapshot of recent) {
    const result = await persistLatestSnapshot();
    if (result.persisted) persisted++;
  }

  return persisted;
}

/**
 * Load the most recent persisted snapshot from the database.
 */
export async function loadPersistedSnapshot(): Promise<MetricSnapshot | null> {
  const { data } = await supabase
    .from('brain_maintenance_log' as any)
    .select('metadata')
    .eq('task_type', 'goal_snapshot')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const record = data as any;
  if (!record?.metadata) return null;

  return {
    snapshotId: record.metadata.snapshot_id,
    timestamp: record.metadata.timestamp,
    modules: {},
    flatMetrics: [],
    systemHealth: record.metadata.system_health || 0,
  };
}
