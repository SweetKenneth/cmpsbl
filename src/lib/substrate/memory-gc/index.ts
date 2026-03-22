/**
 * Memory Decay & Garbage Collection — v1.0.0
 * Auto-archives stale memories, prevents recall dilution,
 * and enforces tier capacity limits.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DecayConfig {
  hot_max_age_hours: number;       // Max hours in hot without access → demote
  warm_max_age_days: number;       // Max days in warm without access → demote
  cold_max_age_days: number;       // Max days in cold → archive/purge
  hot_max_entries: number;         // Max hot entries before forced eviction
  warm_max_entries: number;        // Max warm entries before forced eviction
  min_access_count_to_protect: number; // Entries with ≥ this many accesses are immune
  decay_rate: number;              // Priority/value_score decay per cycle (0-1)
}

export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  hot_max_age_hours: 24,          // Entries idle >24h decay
  warm_max_age_days: 7,           // Entries idle >7d decay
  cold_max_age_days: 30,          // Entries >30d archived/purged
  hot_max_entries: 500,           // Aligned with auto-tiering & pruner (500)
  warm_max_entries: 10_000,       // Aligned with auto-tiering & pruner (10K)
  min_access_count_to_protect: 3, // High-value entries immune to decay
  decay_rate: 0.12,               // Balanced decay per cycle
};

export interface GCResult {
  cycle_id: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  hot_decayed: number;
  hot_demoted: number;
  warm_decayed: number;
  warm_demoted: number;
  cold_archived: number;
  total_processed: number;
  errors: number;
}

// ═══════════════════════════════════════════════════════════════
// DECAY ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Run a full memory decay and GC cycle
 */
export async function runMemoryGC(
  config: Partial<DecayConfig> = {}
): Promise<GCResult> {
  const cfg = { ...DEFAULT_DECAY_CONFIG, ...config };
  const cycleId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const start = Date.now();
  let errors = 0;

  // 1. Decay hot tier priorities
  const hotDecayed = await decayHotPriorities(cfg);

  // 2. Demote stale hot entries to warm
  const hotDemoted = await demoteStaleHot(cfg);

  // 3. Decay warm tier value scores
  const warmDecayed = await decayWarmScores(cfg);

  // 4. Demote stale warm entries to cold
  const warmDemoted = await demoteStaleWarm(cfg);

  // 5. Archive old cold entries
  const coldArchived = await archiveOldCold(cfg);

  // 6. Enforce capacity limits
  const evicted = await enforceCapacityLimits(cfg);

  const result: GCResult = {
    cycle_id: cycleId,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    duration_ms: Date.now() - start,
    hot_decayed: hotDecayed,
    hot_demoted: hotDemoted + evicted.hotEvicted,
    warm_decayed: warmDecayed,
    warm_demoted: warmDemoted + evicted.warmEvicted,
    cold_archived: coldArchived,
    total_processed: hotDecayed + hotDemoted + warmDecayed + warmDemoted + coldArchived + evicted.hotEvicted + evicted.warmEvicted,
    errors,
  };

  // Log GC cycle
  await supabase.from('brain_events').insert({
    module: 'brain',
    event_type: 'memory_gc_cycle',
    data: result as any,
    outcome: errors === 0 ? 'success' : 'partial',
  });

  return result;
}

/** Decay priority of hot entries that haven't been accessed recently */
async function decayHotPriorities(cfg: DecayConfig): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - cfg.hot_max_age_hours * 3600000 / 2).toISOString();
    
    const { data: stale } = await supabase
      .from('brain_memory_hot')
      .select('id, priority, access_count')
      .lt('last_used', cutoff)
      .lt('access_count', cfg.min_access_count_to_protect)
      .limit(100);

    if (!stale || stale.length === 0) return 0;

    let decayed = 0;
    for (const entry of stale) {
      const newPriority = Math.max(1, Math.round((entry.priority || 5) * (1 - cfg.decay_rate)));
      if (newPriority < (entry.priority || 5)) {
        await supabase.from('brain_memory_hot')
          .update({ priority: newPriority })
          .eq('id', entry.id);
        decayed++;
      }
    }
    return decayed;
  } catch { return 0; }
}

/** Demote stale hot entries to warm tier */
async function demoteStaleHot(cfg: DecayConfig): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - cfg.hot_max_age_hours * 3600000).toISOString();

    const { data: stale } = await supabase
      .from('brain_memory_hot')
      .select('id, content, context, tags, priority, access_count')
      .lt('last_used', cutoff)
      .lte('priority', 3) // Only demote low priority
      .lt('access_count', cfg.min_access_count_to_protect)
      .limit(50);

    if (!stale || stale.length === 0) return 0;

    let demoted = 0;
    for (const entry of stale) {
      // Insert into warm
      const { error: insertErr } = await supabase.from('brain_memory_warm').insert({
        content: (entry as any).content,
        context: (entry as any).context,
        tags: (entry as any).tags,
        value_score: ((entry as any).priority || 5) / 10,
        access_count: (entry as any).access_count || 0,
        source_module: 'memory_gc',
        metadata: { demoted_from: 'hot', demoted_at: new Date().toISOString() },
      } as any);

      if (!insertErr) {
        demoted++;
      }
    }

    // Batch-delete demoted entries from hot
    if (demoted > 0) {
      const demotedIds = stale.slice(0, demoted).map(e => e.id);
      await supabase.from('brain_memory_hot').delete().in('id', demotedIds);
    }
    return demoted;
  } catch { return 0; }
}

/** Decay warm tier value scores */
async function decayWarmScores(cfg: DecayConfig): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - cfg.warm_max_age_days * 86400000 / 2).toISOString();

    const { data: stale } = await supabase
      .from('brain_memory_warm')
      .select('id, value_score, access_count')
      .lt('last_accessed', cutoff)
      .lt('access_count', cfg.min_access_count_to_protect)
      .limit(100);

    if (!stale || stale.length === 0) return 0;

    let decayed = 0;
    for (const entry of stale) {
      const newScore = Math.max(0, (entry.value_score || 0.5) * (1 - cfg.decay_rate));
      await supabase.from('brain_memory_warm')
        .update({ value_score: newScore })
        .eq('id', entry.id);
      decayed++;
    }
    return decayed;
  } catch { return 0; }
}

/** Demote stale warm entries to cold */
async function demoteStaleWarm(cfg: DecayConfig): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - cfg.warm_max_age_days * 86400000).toISOString();

    const { data: stale } = await supabase
      .from('brain_memory_warm')
      .select('id, content, context, tags, value_score')
      .lt('last_accessed', cutoff)
      .lte('value_score', 0.3)
      .limit(50);

    if (!stale || stale.length === 0) return 0;

    let demoted = 0;
    for (const entry of stale) {
      // FIX: tags on brain_memory_cold is string[] not object
      const existingTags = Array.isArray(entry.tags) ? (entry.tags as string[]) : [];
      const { error: insertErr } = await supabase.from('brain_memory_cold').insert({
        summary: ((entry as any).content || '').slice(0, 500),
        tags: [...existingTags, 'demoted_from_warm'],
        value_score: (entry as any).value_score || 0,
        source_module: 'memory_gc',
        category: (entry as any).context || 'general',
      } as any);

      if (!insertErr) {
        demoted++;
      }
    }

    // Batch-delete demoted entries from warm
    if (demoted > 0) {
      const demotedIds = stale.slice(0, demoted).map(e => e.id);
      await supabase.from('brain_memory_warm').delete().in('id', demotedIds);
    }
    return demoted;
  } catch { return 0; }
}

/** Archive old cold entries (remove from active query) */
async function archiveOldCold(cfg: DecayConfig): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - cfg.cold_max_age_days * 86400000).toISOString();

    const { data: old } = await supabase
      .from('brain_memory_cold')
      .select('id')
      .lt('created_at', cutoff)
      .lte('value_score', 0.1)
      .limit(50);

    if (!old || old.length === 0) return 0;

    // Just remove them — they're cold and worthless
    const ids = old.map(e => e.id);
    const { error } = await supabase.from('brain_memory_cold').delete().in('id', ids);
    return error ? 0 : ids.length;
  } catch { return 0; }
}

/** Enforce max capacity per tier */
async function enforceCapacityLimits(cfg: DecayConfig): Promise<{ hotEvicted: number; warmEvicted: number }> {
  let hotEvicted = 0;
  let warmEvicted = 0;

  try {
    // Hot tier
    const { count: hotCount } = await supabase
      .from('brain_memory_hot')
      .select('id', { count: 'exact', head: true });

    if (hotCount && hotCount > cfg.hot_max_entries) {
      const excess = hotCount - cfg.hot_max_entries;
      const { data: lowest } = await supabase
        .from('brain_memory_hot')
        .select('id')
        .order('priority', { ascending: true })
        .order('last_used', { ascending: true })
        .limit(excess);

      if (lowest) {
        const ids = lowest.map(e => e.id);
        await supabase.from('brain_memory_hot').delete().in('id', ids);
        hotEvicted = ids.length;
      }
    }

    // Warm tier
    const { count: warmCount } = await supabase
      .from('brain_memory_warm')
      .select('id', { count: 'exact', head: true });

    if (warmCount && warmCount > cfg.warm_max_entries) {
      const excess = warmCount - cfg.warm_max_entries;
      const { data: lowest } = await supabase
        .from('brain_memory_warm')
        .select('id')
        .order('value_score', { ascending: true })
        .limit(excess);

      if (lowest) {
        const ids = lowest.map(e => e.id);
        await supabase.from('brain_memory_warm').delete().in('id', ids);
        warmEvicted = ids.length;
      }
    }
  } catch { /* best effort */ }

  return { hotEvicted, warmEvicted };
}

/**
 * Get memory decay statistics
 */
export async function getDecayStats(): Promise<{
  hot_stale_count: number;
  warm_stale_count: number;
  cold_archivable: number;
  hot_utilization: string;
  warm_utilization: string;
}> {
  const cfg = DEFAULT_DECAY_CONFIG;

  const [hotStale, warmStale, coldOld, hotCount, warmCount] = await Promise.all([
    supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true })
      .lt('last_used', new Date(Date.now() - cfg.hot_max_age_hours * 3600000).toISOString()),
    supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true })
      .lt('last_accessed', new Date(Date.now() - cfg.warm_max_age_days * 86400000).toISOString()),
    supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true })
      .lt('created_at', new Date(Date.now() - cfg.cold_max_age_days * 86400000).toISOString()),
    supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
  ]);

  return {
    hot_stale_count: hotStale.count || 0,
    warm_stale_count: warmStale.count || 0,
    cold_archivable: coldOld.count || 0,
    hot_utilization: `${hotCount.count || 0}/${cfg.hot_max_entries}`,
    warm_utilization: `${warmCount.count || 0}/${cfg.warm_max_entries}`,
  };
}
