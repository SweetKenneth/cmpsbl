/**
 * Smart Retention Policy — Never forget important events & learnings
 * 
 * OPTIMIZED: Parallel tier processing, batched deletes, compact metadata keys,
 * single-pass compression, and fire-and-forget value boosts.
 */

import { supabase } from '@/integrations/supabase/client';
import { classifyImportance, shouldPreserveIndefinitely, compressForStorage, compactMetadata, type ImportanceLevel } from './content-dedup';

export interface RetentionStats {
  preserved: number;
  compressed: number;
  archived: number;
  pruned: number;
  spaceSavedBytes: number;
  duration: number;
}

export interface RetentionConfig {
  compressAfterDays: number;
  archiveAfterDays: number;
  pruneNoiseAfterDays: number;
  hotLimit: number;
  warmLimit: number;
  coldLimit: number;
  dryRun: boolean;
}

const DEFAULT_CONFIG: RetentionConfig = {
  compressAfterDays: 30,
  archiveAfterDays: 14,
  pruneNoiseAfterDays: 7,
  hotLimit: 500,
  warmLimit: 10_000,
  coldLimit: 10_000,
  dryRun: false,
};

type TierStats = { preserved: number; compressed: number; archived: number; pruned: number; spaceSavedBytes: number };
const EMPTY_TIER_STATS = (): TierStats => ({ preserved: 0, compressed: 0, archived: 0, pruned: 0, spaceSavedBytes: 0 });

/**
 * Run the smart retention policy across all tiers.
 * OPTIMIZED: All independent tier phases run in parallel.
 */
export async function runRetentionPolicy(
  config: Partial<RetentionConfig> = {}
): Promise<RetentionStats> {
  const startTime = Date.now();
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const stats: RetentionStats = {
    preserved: 0, compressed: 0, archived: 0, pruned: 0,
    spaceSavedBytes: 0, duration: 0,
  };

  try {
    // All tier phases are independent — run in parallel
    const [hotStats, warmStats, coldStats] = await Promise.allSettled([
      processHotTier(cfg),
      processWarmTier(cfg),
      processColdTier(cfg),
    ]);

    for (const result of [hotStats, warmStats, coldStats]) {
      if (result.status === 'fulfilled') {
        const s = result.value;
        stats.preserved += s.preserved;
        stats.compressed += s.compressed;
        stats.archived += s.archived;
        stats.pruned += s.pruned;
        stats.spaceSavedBytes += s.spaceSavedBytes;
      }
    }

    // Glacier compaction depends on cold phase completing
    const glacierResult = await compactGlacierMetadata();
    stats.compressed += glacierResult.compressed;
    stats.spaceSavedBytes += glacierResult.spaceSavedBytes;

  } catch (error) {
    console.error('[Retention] Policy error:', error);
  }

  stats.duration = Date.now() - startTime;

  // Fire-and-forget telemetry
  supabase.from('brain_events').insert({
    module: 'memory',
    event_type: 'retention_policy.completed',
    data: stats as unknown as Record<string, never>,
    outcome: 'success',
  }).then(() => {}, () => {});

  return stats;
}

/**
 * Process hot tier: demote aged medium/low memories, preserve critical
 */
async function processHotTier(cfg: RetentionConfig): Promise<TierStats> {
  const stats = EMPTY_TIER_STATS();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const { data: memories } = await supabase
    .from('brain_memory_hot')
    .select('id, content, context, value_score, access_count, last_used, memory_type, tags, metadata')
    .lt('last_used', cutoff.toISOString())
    .order('value_score', { ascending: true })
    .limit(200);

  if (!memories || memories.length === 0) return stats;

  const warmInserts: any[] = [];
  const hotDeleteIds: string[] = [];
  const boostPromises: Promise<any>[] = [];

  for (const mem of memories) {
    const importance = classifyImportance(
      mem.content, mem.memory_type || mem.context || 'general',
      mem.value_score || 0, mem.access_count || 0
    );

    if (shouldPreserveIndefinitely(importance)) {
      stats.preserved++;
      if ((mem.value_score || 0) < 0.8) {
        boostPromises.push(
          supabase.from('brain_memory_hot').update({ value_score: 0.85 }).eq('id', mem.id).then()
        );
      }
      continue;
    }

    const { compressed, ratio } = compressForStorage(mem.content, mem.context === 'code');
    const compactMeta = mem.metadata ? compactMetadata(mem.metadata as Record<string, unknown>) : {};

    warmInserts.push({
      content: compressed, context: mem.context,
      value_score: Math.max(0.2, (mem.value_score || 0.3) * 0.8),
      memory_type: mem.memory_type || 'general', source_module: 'retention_policy',
      category: mem.context || 'uncategorized',
      tags: Array.isArray(mem.tags) ? mem.tags : ['demoted'],
      metadata: { ...compactMeta, imp: importance, cr: ratio, df: 'hot' },
    });

    hotDeleteIds.push(mem.id);
    stats.compressed++;
    stats.spaceSavedBytes += mem.content.length - compressed.length;
  }

  // Fire boosts in parallel, don't block
  if (boostPromises.length > 0) Promise.allSettled(boostPromises).catch(() => {});

  if (!cfg.dryRun && warmInserts.length > 0) {
    const { error: insertErr } = await supabase
      .from('brain_memory_warm').insert(warmInserts as any[]);

    if (!insertErr) {
      const chunks = [];
      for (let i = 0; i < hotDeleteIds.length; i += 100) {
        chunks.push(supabase.from('brain_memory_hot').delete().in('id', hotDeleteIds.slice(i, i + 100)));
      }
      await Promise.allSettled(chunks);
    }
  }
  return stats;
}

/**
 * Process warm tier: compress aged memories, archive low-value
 */
async function processWarmTier(cfg: RetentionConfig): Promise<TierStats> {
  const stats = EMPTY_TIER_STATS();
  const compressCutoff = new Date();
  compressCutoff.setDate(compressCutoff.getDate() - cfg.compressAfterDays);

  const { data: memories } = await supabase
    .from('brain_memory_warm')
    .select('id, content, context, value_score, access_count, created_at, memory_type')
    .lt('created_at', compressCutoff.toISOString())
    .order('value_score', { ascending: true })
    .limit(300);

  if (!memories || memories.length === 0) return stats;

  const coldInserts: any[] = [];
  const warmDeleteIds: string[] = [];

  for (const mem of memories) {
    const importance = classifyImportance(
      mem.content, mem.memory_type || mem.context || 'general',
      mem.value_score || 0, mem.access_count || 0
    );

    if (shouldPreserveIndefinitely(importance)) { stats.preserved++; continue; }

    const { compressed, ratio } = compressForStorage(mem.content, mem.context === 'code');

    coldInserts.push({
      summary: compressed, source_refs: [mem.id],
      compression_level: Math.round(ratio),
      value_score: mem.value_score || 0.2, source_module: 'retention_policy',
      category: mem.context || 'uncategorized',
      tags: { imp: importance, ot: mem.memory_type, ctx: mem.context, cr: ratio },
    });

    warmDeleteIds.push(mem.id);
    stats.archived++;
    stats.spaceSavedBytes += mem.content.length - compressed.length;
  }

  if (!cfg.dryRun && coldInserts.length > 0) {
    const { error } = await supabase.from('brain_memory_cold').insert(coldInserts as any[]);
    if (!error) {
      const chunks = [];
      for (let i = 0; i < warmDeleteIds.length; i += 100) {
        chunks.push(supabase.from('brain_memory_warm').delete().in('id', warmDeleteIds.slice(i, i + 100)));
      }
      await Promise.allSettled(chunks);
    }
  }
  return stats;
}

/**
 * Process cold tier: prune noise to glacier
 */
async function processColdTier(cfg: RetentionConfig): Promise<TierStats> {
  const stats = EMPTY_TIER_STATS();
  const pruneCutoff = new Date();
  pruneCutoff.setDate(pruneCutoff.getDate() - 90);

  const { data: memories } = await supabase
    .from('brain_memory_cold')
    .select('id, summary, value_score, access_count, tags')
    .lt('created_at', pruneCutoff.toISOString())
    .lt('value_score', 0.15)
    .order('value_score', { ascending: true })
    .limit(200);

  if (!memories || memories.length === 0) return stats;

  const glacierInserts: any[] = [];
  const coldDeleteIds: string[] = [];

  for (const mem of memories) {
    const importance = classifyImportance(
      mem.summary || '', ((mem.tags as any)?.ot || (mem.tags as any)?.original_type) || 'general',
      mem.value_score || 0, mem.access_count || 0
    );

    if (shouldPreserveIndefinitely(importance)) { stats.preserved++; continue; }

    const { compressed } = compressForStorage(mem.summary || '', false);

    glacierInserts.push({
      content: compressed, source_tier: 'cold',
      archived_reason: 'retention_prune',
      value_score: mem.value_score || 0,
      tags: { imp: importance, oid: mem.id },
    });

    coldDeleteIds.push(mem.id);
    stats.pruned++;
    stats.spaceSavedBytes += (mem.summary?.length || 0) - compressed.length;
  }

  if (!cfg.dryRun && glacierInserts.length > 0) {
    const { error } = await supabase.from('brain_memory_archive').insert(glacierInserts as any[]);
    if (!error) {
      const chunks = [];
      for (let i = 0; i < coldDeleteIds.length; i += 100) {
        chunks.push(supabase.from('brain_memory_cold').delete().in('id', coldDeleteIds.slice(i, i + 100)));
      }
      await Promise.allSettled(chunks);
    }
  }
  return stats;
}

/**
 * Compact glacier metadata — batch all updates in parallel
 */
async function compactGlacierMetadata(): Promise<{ compressed: number; spaceSavedBytes: number }> {
  let compressed = 0, spaceSavedBytes = 0;
  try {
    const { data: archives } = await supabase
      .from('brain_memory_archive')
      .select('id, tags')
      .not('tags', 'is', null)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!archives || archives.length === 0) return { compressed, spaceSavedBytes };

    const updates: Promise<any>[] = [];
    for (const arch of archives) {
      if (!arch.tags || typeof arch.tags !== 'object') continue;
      const original = JSON.stringify(arch.tags);
      const compact = compactMetadata(arch.tags as Record<string, unknown>);
      const compactStr = JSON.stringify(compact);
      
      if (compactStr.length < original.length * 0.8) {
        updates.push(
          supabase.from('brain_memory_archive').update({ tags: compact as any }).eq('id', arch.id)
        );
        compressed++;
        spaceSavedBytes += original.length - compactStr.length;
      }
    }
    if (updates.length > 0) await Promise.allSettled(updates);
  } catch {
    // Non-critical
  }
  return { compressed, spaceSavedBytes };
}