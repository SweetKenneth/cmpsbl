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
 * Prune a single tier to its capacity limit.
 * Keeps highest priority/value entries, deletes the rest.
 */
async function pruneTier(
  tier: 'hot' | 'warm' | 'cold',
  capacity: number
): Promise<PruneResult> {
  const start = Date.now();
  const table = `brain_memory_${tier}` as const;

  // Get current count
  const { count: before } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  const currentCount = before ?? 0;

  if (currentCount <= capacity) {
    return { tier, before: currentCount, after: currentCount, purged: 0, duration_ms: Date.now() - start };
  }

  const excess = currentCount - capacity;
  let purged = 0;

  // Phase 1: Purge CLM/learning spam first (typically the bulk of the flood)
  const clmSources = [
    'clm-memory', 'clm-relay', 'clm-identity', 'clm-economy', 
    'clm-audit', 'clm-sandbox', 'clm-encode-internal', 'clm-encode',
    'legacy.remember', 'learning_engine', 'encode', 'memory_core.reflect',
  ];

  for (const source of clmSources) {
    if (purged >= excess) break;
    const batchSize = Math.min(500, excess - purged);

    try {
      const { data: ids } = await supabase
        .from(table)
        .select('id')
        .eq('source' as any, source)
        .order('created_at', { ascending: true })
        .limit(batchSize);

      if (ids && ids.length > 0) {
        await supabase.from(table).delete().in('id', ids.map(r => r.id));
        purged += ids.length;
      }
    } catch {
      // Continue with next source
    }
  }

  // Phase 2: If still over capacity, delete lowest-value entries regardless of source
  if (purged < excess) {
    const remaining = excess - purged;
    // Process in batches of 500
    let batchesLeft = Math.ceil(remaining / 500);
    
    while (batchesLeft > 0 && purged < excess) {
      const batchSize = Math.min(500, excess - purged);
      
      try {
        let query;
        if (tier === 'hot') {
          query = supabase.from('brain_memory_hot')
            .select('id')
            .order('priority' as any, { ascending: true })
            .order('created_at', { ascending: true })
            .limit(batchSize);
        } else if (tier === 'warm') {
          query = supabase.from('brain_memory_warm')
            .select('id')
            .order('value_score' as any, { ascending: true })
            .order('created_at', { ascending: true })
            .limit(batchSize);
        } else {
          query = supabase.from('brain_memory_cold')
            .select('id')
            .order('value_score' as any, { ascending: true })
            .order('created_at', { ascending: true })
            .limit(batchSize);
        }

        const { data: ids } = await query;
        if (!ids || ids.length === 0) break;

        await supabase.from(table).delete().in('id', ids.map(r => r.id));
        purged += ids.length;
      } catch {
        break;
      }

      batchesLeft--;
    }
  }

  // Get final count
  const { count: after } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });

  return {
    tier,
    before: currentCount,
    after: after ?? 0,
    purged,
    duration_ms: Date.now() - start,
  };
}

/**
 * Purge stale brain_events older than 7 days to reduce noise.
 * Keeps recent events for operational debugging.
 */
async function purgeStaleBrainEvents(): Promise<number> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let totalPurged = 0;

  // Delete in batches — brain_events can be massive
  for (let batch = 0; batch < 20; batch++) {
    try {
      const { data: ids } = await supabase
        .from('brain_events')
        .select('id')
        .lt('created_at', cutoff)
        .limit(1000);

      if (!ids || ids.length === 0) break;

      await supabase.from('brain_events').delete().in('id', ids.map(r => r.id));
      totalPurged += ids.length;
    } catch {
      break;
    }
  }

  return totalPurged;
}

/**
 * Run full emergency prune across all tiers.
 * Call this to bring memory back to normal levels.
 */
export async function runEmergencyPrune(): Promise<FullPruneResult> {
  const started_at = new Date().toISOString();
  console.log('[MemoryPruner] 🚨 Starting emergency prune...');

  const [hot, warm, cold, events_purged] = await Promise.all([
    pruneTier('hot', CAPACITY.hot),
    pruneTier('warm', CAPACITY.warm),
    pruneTier('cold', CAPACITY.cold),
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

  // Log the prune event
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
