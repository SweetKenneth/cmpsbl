/**
 * Emergency Memory Pruner — Rapid Tier Normalization
 * 
 * Prunes overflooded brain_memory_* tiers back to safe capacity.
 * Keeps highest-value entries, purges noise and CLM spam.
 * 
 * Capacity targets:
 *   HOT:  200 entries (down from 500 — tighter is better)
 *   WARM: 1000 entries (down from 2000)
 *   COLD: 5000 entries (down from 10000)
 */

import { supabase } from '@/integrations/supabase/client';

export interface PruneResult {
  tier: string;
  before: number;
  after: number;
  purged: number;
  duration_ms: number;
}

export interface FullPruneResult {
  hot: PruneResult;
  warm: PruneResult;
  cold: PruneResult;
  events_purged: number;
  total_purged: number;
  started_at: string;
  completed_at: string;
}

const CAPACITY = {
  hot: 200,
  warm: 1000,
  cold: 5000,
} as const;

/**
 * Prune hot tier to capacity limit.
 */
async function pruneHot(capacity: number): Promise<PruneResult> {
  const start = Date.now();
  const { count: before } = await supabase
    .from('brain_memory_hot')
    .select('id', { count: 'exact', head: true });

  const currentCount = before ?? 0;
  if (currentCount <= capacity) {
    return { tier: 'hot', before: currentCount, after: currentCount, purged: 0, duration_ms: Date.now() - start };
  }

  let purged = 0;
  const excess = currentCount - capacity;

  // Phase 1: Delete CLM spam by source
  const clmSources = [
    'clm-memory', 'clm-relay', 'clm-identity', 'clm-economy',
    'clm-audit', 'clm-sandbox', 'clm-encode-internal', 'clm-encode',
    'legacy.remember', 'learning_engine', 'encode', 'memory_core.reflect',
  ];

  for (const source of clmSources) {
    if (purged >= excess) break;
    try {
      const { data: ids } = await (supabase as any)
        .from('brain_memory_hot')
        .select('id')
        .eq('source', source)
        .order('created_at', { ascending: true })
        .limit(Math.min(500, excess - purged));

      if (ids && ids.length > 0) {
        await supabase.from('brain_memory_hot').delete().in('id', ids.map((r: any) => r.id));
        purged += ids.length;
      }
    } catch { /* continue */ }
  }

  // Phase 2: Delete lowest-priority entries if still over
  while (purged < excess) {
    try {
      const { data: ids } = await supabase
        .from('brain_memory_hot')
        .select('id')
        .order('priority' as any, { ascending: true })
        .order('created_at', { ascending: true })
        .limit(Math.min(500, excess - purged));

      if (!ids || ids.length === 0) break;
      await supabase.from('brain_memory_hot').delete().in('id', ids.map(r => r.id));
      purged += ids.length;
    } catch { break; }
  }

  const { count: after } = await supabase
    .from('brain_memory_hot')
    .select('id', { count: 'exact', head: true });

  return { tier: 'hot', before: currentCount, after: after ?? 0, purged, duration_ms: Date.now() - start };
}

/**
 * Prune warm tier to capacity limit.
 */
async function pruneWarm(capacity: number): Promise<PruneResult> {
  const start = Date.now();
  const { count: before } = await supabase
    .from('brain_memory_warm')
    .select('id', { count: 'exact', head: true });

  const currentCount = before ?? 0;
  if (currentCount <= capacity) {
    return { tier: 'warm', before: currentCount, after: currentCount, purged: 0, duration_ms: Date.now() - start };
  }

  let purged = 0;
  const excess = currentCount - capacity;

  // Phase 1: Delete CLM spam
  const clmSources = [
    'clm-memory', 'clm-relay', 'clm-identity', 'clm-economy',
    'clm-audit', 'clm-sandbox', 'clm-encode-internal', 'learning_engine',
  ];

  for (const source of clmSources) {
    if (purged >= excess) break;
    try {
      const { data: ids } = await (supabase as any)
        .from('brain_memory_warm')
        .select('id')
        .eq('source', source)
        .order('created_at', { ascending: true })
        .limit(Math.min(500, excess - purged));

      if (ids && ids.length > 0) {
        await supabase.from('brain_memory_warm').delete().in('id', ids.map((r: any) => r.id));
        purged += ids.length;
      }
    } catch { /* continue */ }
  }

  // Phase 2: Delete lowest value_score entries
  while (purged < excess) {
    try {
      const { data: ids } = await supabase
        .from('brain_memory_warm')
        .select('id')
        .order('value_score' as any, { ascending: true })
        .limit(Math.min(500, excess - purged));

      if (!ids || ids.length === 0) break;
      await supabase.from('brain_memory_warm').delete().in('id', ids.map(r => r.id));
      purged += ids.length;
    } catch { break; }
  }

  const { count: after } = await supabase
    .from('brain_memory_warm')
    .select('id', { count: 'exact', head: true });

  return { tier: 'warm', before: currentCount, after: after ?? 0, purged, duration_ms: Date.now() - start };
}

/**
 * Prune cold tier to capacity limit.
 */
async function pruneCold(capacity: number): Promise<PruneResult> {
  const start = Date.now();
  const { count: before } = await supabase
    .from('brain_memory_cold')
    .select('id', { count: 'exact', head: true });

  const currentCount = before ?? 0;
  if (currentCount <= capacity) {
    return { tier: 'cold', before: currentCount, after: currentCount, purged: 0, duration_ms: Date.now() - start };
  }

  let purged = 0;
  const excess = currentCount - capacity;

  // Delete oldest/lowest value entries
  while (purged < excess) {
    try {
      const { data: ids } = await supabase
        .from('brain_memory_cold')
        .select('id')
        .order('value_score' as any, { ascending: true })
        .order('created_at', { ascending: true })
        .limit(Math.min(500, excess - purged));

      if (!ids || ids.length === 0) break;
      await supabase.from('brain_memory_cold').delete().in('id', ids.map(r => r.id));
      purged += ids.length;
    } catch { break; }
  }

  const { count: after } = await supabase
    .from('brain_memory_cold')
    .select('id', { count: 'exact', head: true });

  return { tier: 'cold', before: currentCount, after: after ?? 0, purged, duration_ms: Date.now() - start };
}

/**
 * Purge stale brain_events — tiered retention:
 *   High-volume CLM telemetry: 3 days
 *   Standard events: 7 days
 */
async function purgeStaleBrainEvents(): Promise<number> {
  let totalPurged = 0;

  // Phase 1: High-volume telemetry events — 3-day retention
  const telemetryCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const highVolumeTypes = ['deep_think', 'technical_learning_cycle', 'module_learning_insight', 'brain_status_check', 'clm_server_cycle'];

  for (let batch = 0; batch < 20; batch++) {
    try {
      const { data: ids } = await supabase
        .from('brain_events')
        .select('id')
        .in('event_type', highVolumeTypes)
        .lt('created_at', telemetryCutoff)
        .limit(1000);

      if (!ids || ids.length === 0) break;
      await supabase.from('brain_events').delete().in('id', ids.map(r => r.id));
      totalPurged += ids.length;
    } catch { break; }
  }

  // Phase 2: All other events — 7-day retention
  const standardCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  for (let batch = 0; batch < 10; batch++) {
    try {
      const { data: ids } = await supabase
        .from('brain_events')
        .select('id')
        .lt('created_at', standardCutoff)
        .limit(1000);

      if (!ids || ids.length === 0) break;
      await supabase.from('brain_events').delete().in('id', ids.map(r => r.id));
      totalPurged += ids.length;
    } catch { break; }
  }

  return totalPurged;
}

/**
 * Run full emergency prune across all tiers.
 */
export async function runEmergencyPrune(): Promise<FullPruneResult> {
  const started_at = new Date().toISOString();
  console.log('[MemoryPruner] 🚨 Starting emergency prune...');

  const [hot, warm, cold, events_purged] = await Promise.all([
    pruneHot(CAPACITY.hot),
    pruneWarm(CAPACITY.warm),
    pruneCold(CAPACITY.cold),
    purgeStaleBrainEvents(),
  ]);

  const total_purged = hot.purged + warm.purged + cold.purged + events_purged;
  const completed_at = new Date().toISOString();

  console.log(`[MemoryPruner] ✅ Emergency prune complete:
    HOT:  ${hot.before} → ${hot.after} (purged ${hot.purged})
    WARM: ${warm.before} → ${warm.after} (purged ${warm.purged})
    COLD: ${cold.before} → ${cold.after} (purged ${cold.purged})
    EVENTS: purged ${events_purged}
    TOTAL: ${total_purged} entries removed`);

  try {
    await supabase.from('brain_events').insert({
      module: 'memory',
      event_type: 'emergency_prune',
      outcome: 'success',
      data: { hot, warm, cold, events_purged, total_purged } as any,
    });
  } catch { /* non-critical */ }

  return { hot, warm, cold, events_purged, total_purged, started_at, completed_at };
}

/** Get current tier counts for monitoring */
export async function getTierCounts(): Promise<{ hot: number; warm: number; cold: number; events: number; capacities: typeof CAPACITY }> {
  const [h, w, c, e] = await Promise.all([
    supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
    supabase.from('brain_events').select('id', { count: 'exact', head: true }),
  ]);

  return {
    hot: h.count ?? 0,
    warm: w.count ?? 0,
    cold: c.count ?? 0,
    events: e.count ?? 0,
    capacities: CAPACITY,
  };
}
