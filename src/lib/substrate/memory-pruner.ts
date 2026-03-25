/**
 * Emergency Memory Pruner — Rapid Tier Normalization
 * 
 * Prunes overflooded brain_memory_* tiers back to safe capacity.
 * Keeps highest-value entries, purges noise and CLM spam.
 * 
 * Capacity targets:
 *   HOT:  500 entries
 *   WARM: 10,000 entries
 *   COLD: 10,000 entries
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
  glacier: PruneResult;
  events_purged: number;
  total_purged: number;
  started_at: string;
  completed_at: string;
}

const CAPACITY = {
  hot: 500,
  warm: 10000,
  cold: 10000,
  glacier: 50000,
} as const;

/**
 * Generic tier pruner — eliminates code duplication across hot/warm/cold/glacier.
 */
async function pruneTier(
  table: string,
  tierName: string,
  capacity: number,
  clmSources?: string[],
): Promise<PruneResult> {
  const start = Date.now();
  const { count: before } = await (supabase
    .from(table as any)
    .select('id', { count: 'exact', head: true }));

  const currentCount = before ?? 0;
  if (currentCount <= capacity) {
    return { tier: tierName, before: currentCount, after: currentCount, purged: 0, duration_ms: Date.now() - start };
  }

  let purged = 0;
  const excess = currentCount - capacity;
  const batchSize = 500;

  // Phase 1: Delete CLM spam by source (if applicable)
  if (clmSources) {
    for (const source of clmSources) {
      if (purged >= excess) break;
      try {
        const { data: ids } = await (supabase
          .from(table as any)
          .select('id')
          .eq('source_module', source)
          .order('created_at', { ascending: true })
          .limit(Math.min(batchSize, excess - purged)));

        if (ids && ids.length > 0) {
          await (supabase.from(table as any).delete() as any).in('id', ids.map((r: any) => r.id));
          purged += ids.length;
        }
      } catch { /* continue */ }
    }
  }

  // Phase 2: Delete lowest value_score entries
  while (purged < excess) {
    try {
      const { data: ids } = await (supabase
        .from(table as any)
        .select('id')
        .order('value_score', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(Math.min(batchSize, excess - purged)));

      if (!ids || ids.length === 0) break;
      await (supabase.from(table as any).delete() as any).in('id', ids.map((r: any) => r.id));
      purged += ids.length;
    } catch { break; }
  }

  const { count: after } = await (supabase
    .from(table as any)
    .select('id', { count: 'exact', head: true }));

  return { tier: tierName, before: currentCount, after: after ?? 0, purged, duration_ms: Date.now() - start };
}

const CLM_SOURCES_HOT = [
  'clm-memory', 'clm-relay', 'clm-identity', 'clm-economy',
  'clm-audit', 'clm-sandbox', 'clm-encode-internal', 'clm-encode',
  'legacy.remember', 'learning_engine', 'encode', 'memory_core.reflect',
];

const CLM_SOURCES_WARM = [
  'clm-memory', 'clm-relay', 'clm-identity', 'clm-economy',
  'clm-audit', 'clm-sandbox', 'clm-encode-internal', 'learning_engine',
];

/**
 * Purge stale brain_events — tiered retention:
 *   High-volume CLM telemetry: 3 days
 *   Standard events: 7 days
 */
async function purgeStaleBrainEvents(): Promise<number> {
  let totalPurged = 0;

  // Phase 1: High-volume telemetry events — 3-day retention
  const telemetryCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const highVolumeTypes = ['deep_think', 'technical_learning_cycle', 'module_learning_insight', 'brain_status_check', 'clm_server_cycle', 'agent_clm_cycle', 'memory_gc_cycle', 'auto_tiering_enforced', 'memory_tiering'];

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

  const [hot, warm, cold, glacier, events_purged] = await Promise.all([
    pruneTier('brain_memory_hot', 'hot', CAPACITY.hot, CLM_SOURCES_HOT),
    pruneTier('brain_memory_warm', 'warm', CAPACITY.warm, CLM_SOURCES_WARM),
    pruneTier('brain_memory_cold', 'cold', CAPACITY.cold),
    pruneTier('brain_memory_archive', 'glacier', CAPACITY.glacier),
    purgeStaleBrainEvents(),
  ]);

  const total_purged = hot.purged + warm.purged + cold.purged + glacier.purged + events_purged;
  const completed_at = new Date().toISOString();

  console.log(`[MemoryPruner] ✅ Emergency prune complete:
    HOT:     ${hot.before} → ${hot.after} (purged ${hot.purged})
    WARM:    ${warm.before} → ${warm.after} (purged ${warm.purged})
    COLD:    ${cold.before} → ${cold.after} (purged ${cold.purged})
    GLACIER: ${glacier.before} → ${glacier.after} (purged ${glacier.purged})
    EVENTS:  purged ${events_purged}
    TOTAL:   ${total_purged} entries removed`);

  try {
    await supabase.from('brain_events').insert({
      module: 'memory',
      event_type: 'emergency_prune',
      outcome: 'success',
      data: { hot, warm, cold, glacier, events_purged, total_purged } as any,
    });
  } catch { /* non-critical */ }

  return { hot, warm, cold, glacier, events_purged, total_purged, started_at, completed_at };
}

/**
 * Prune glacier tier to capacity limit.
 */
async function pruneGlacier(capacity: number): Promise<PruneResult> {
  const start = Date.now();
  const { count: before } = await supabase
    .from('brain_memory_archive')
    .select('id', { count: 'exact', head: true });

  const currentCount = before ?? 0;
  if (currentCount <= capacity) {
    return { tier: 'glacier', before: currentCount, after: currentCount, purged: 0, duration_ms: Date.now() - start };
  }

  let purged = 0;
  const excess = currentCount - capacity;

  while (purged < excess) {
    try {
      const { data: ids } = await supabase
        .from('brain_memory_archive')
        .select('id')
        .order('value_score', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(Math.min(500, excess - purged));

      if (!ids || ids.length === 0) break;
      await supabase.from('brain_memory_archive').delete().in('id', ids.map(r => r.id));
      purged += ids.length;
    } catch { break; }
  }

  const { count: after } = await supabase
    .from('brain_memory_archive')
    .select('id', { count: 'exact', head: true });

  return { tier: 'glacier', before: currentCount, after: after ?? 0, purged, duration_ms: Date.now() - start };
}

/** Get current tier counts for monitoring */
export async function getTierCounts(): Promise<{ hot: number; warm: number; cold: number; glacier: number; events: number; capacities: typeof CAPACITY }> {
  const [h, w, c, g, e] = await Promise.all([
    supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_archive').select('id', { count: 'exact', head: true }),
    supabase.from('brain_events').select('id', { count: 'exact', head: true }),
  ]);

  return {
    hot: h.count ?? 0,
    warm: w.count ?? 0,
    cold: c.count ?? 0,
    glacier: g.count ?? 0,
    events: e.count ?? 0,
    capacities: CAPACITY,
  };
}
