/**
 * Smart Retention Policy — Never forget important events & learnings
 * 
 * Implements tiered retention that:
 * 1. NEVER deletes critical learnings, errors, doctrines, or high-value patterns
 * 2. Aggressively compresses low-value noise to glacier
 * 3. Consolidates medium-value memories into compact summaries
 * 4. Tracks what was learned and when for permanent retrieval
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
  /** Days before medium memories are compressed (default: 30) */
  compressAfterDays: number;
  /** Days before low memories are archived to glacier (default: 14) */
  archiveAfterDays: number;
  /** Days before noise is pruned (default: 7) */
  pruneNoiseAfterDays: number;
  /** Max entries per tier before forced eviction */
  hotLimit: number;
  warmLimit: number;
  coldLimit: number;
  /** Enable dry run (no actual deletes) */
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

/**
 * Run the smart retention policy across all tiers.
 * This is the main entry point for auto-maintenance.
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
    // Phase 1: Process hot tier — demote stale non-critical memories
    await processHotTier(cfg, stats);

    // Phase 2: Process warm tier — compress or archive aged memories
    await processWarmTier(cfg, stats);

    // Phase 3: Process cold tier — archive noise to glacier
    await processColdTier(cfg, stats);

    // Phase 4: Compact glacier metadata
    await compactGlacierMetadata(stats);

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
async function processHotTier(cfg: RetentionConfig, stats: RetentionStats): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7); // Hot memories older than 7 days evaluated

  const { data: memories } = await supabase
    .from('brain_memory_hot')
    .select('id, content, context, value_score, access_count, created_at, last_used, memory_type, tags, metadata')
    .lt('last_used', cutoff.toISOString())
    .order('value_score', { ascending: true })
    .limit(200);

  if (!memories || memories.length === 0) return;

  const warmInserts: any[] = [];
  const hotDeleteIds: string[] = [];

  for (const mem of memories) {
    const importance = classifyImportance(
      mem.content, 
      mem.memory_type || mem.context || 'general',
      mem.value_score || 0,
      mem.access_count || 0
    );

    if (shouldPreserveIndefinitely(importance)) {
      stats.preserved++;
      // Boost value score to prevent future demotion attempts
      if ((mem.value_score || 0) < 0.8) {
        supabase.from('brain_memory_hot')
          .update({ value_score: 0.85 })
          .eq('id', mem.id)
          .then(() => {}, () => {});
      }
      continue;
    }

    // Demote to warm with compressed content
    const isCode = mem.context === 'code';
    const { compressed, ratio } = compressForStorage(mem.content, isCode);
    const compactMeta = mem.metadata ? compactMetadata(mem.metadata as Record<string, unknown>) : {};

    warmInserts.push({
      content: compressed,
      context: mem.context,
      value_score: Math.max(0.2, (mem.value_score || 0.3) * 0.8),
      memory_type: mem.memory_type || 'general',
      source_module: 'retention_policy',
      category: mem.context || 'uncategorized',
      tags: Array.isArray(mem.tags) ? mem.tags : ['demoted'],
      metadata: {
        ...compactMeta,
        importance,
        compression_ratio: ratio,
        demoted_from: 'hot',
        demoted_at: new Date().toISOString(),
      },
    });

    hotDeleteIds.push(mem.id);
    stats.compressed++;
    stats.spaceSavedBytes += mem.content.length - compressed.length;
  }

  if (!cfg.dryRun && warmInserts.length > 0) {
    const { error: insertErr } = await supabase
      .from('brain_memory_warm')
      .insert(warmInserts as any[]);

    if (!insertErr) {
      for (let i = 0; i < hotDeleteIds.length; i += 100) {
        await supabase.from('brain_memory_hot')
          .delete()
          .in('id', hotDeleteIds.slice(i, i + 100));
      }
    }
  }
}

/**
 * Process warm tier: compress aged memories, archive low-value
 */
async function processWarmTier(cfg: RetentionConfig, stats: RetentionStats): Promise<void> {
  const compressCutoff = new Date();
  compressCutoff.setDate(compressCutoff.getDate() - cfg.compressAfterDays);

  const archiveCutoff = new Date();
  archiveCutoff.setDate(archiveCutoff.getDate() - cfg.archiveAfterDays);

  const { data: memories } = await supabase
    .from('brain_memory_warm')
    .select('id, content, context, value_score, access_count, created_at, last_accessed, memory_type, tags, metadata')
    .lt('created_at', compressCutoff.toISOString())
    .order('value_score', { ascending: true })
    .limit(300);

  if (!memories || memories.length === 0) return;

  const coldInserts: any[] = [];
  const warmDeleteIds: string[] = [];

  for (const mem of memories) {
    const importance = classifyImportance(
      mem.content,
      mem.memory_type || mem.context || 'general',
      mem.value_score || 0,
      mem.access_count || 0
    );

    if (shouldPreserveIndefinitely(importance)) {
      stats.preserved++;
      continue;
    }

    const isCode = mem.context === 'code';
    const { compressed, ratio } = compressForStorage(mem.content, isCode);

    coldInserts.push({
      summary: compressed,
      source_refs: [mem.id],
      compression_level: Math.round(ratio),
      value_score: mem.value_score || 0.2,
      source_module: 'retention_policy',
      category: mem.context || 'uncategorized',
      tags: {
        importance,
        original_type: mem.memory_type,
        context: mem.context,
        archived_at: new Date().toISOString(),
        compression_ratio: ratio,
      },
    });

    warmDeleteIds.push(mem.id);
    stats.archived++;
    stats.spaceSavedBytes += mem.content.length - compressed.length;
  }

  if (!cfg.dryRun && coldInserts.length > 0) {
    const { error } = await supabase
      .from('brain_memory_cold')
      .insert(coldInserts as any[]);

    if (!error) {
      for (let i = 0; i < warmDeleteIds.length; i += 100) {
        await supabase.from('brain_memory_warm')
          .delete()
          .in('id', warmDeleteIds.slice(i, i + 100));
      }
    }
  }
}

/**
 * Process cold tier: prune noise, keep everything else
 */
async function processColdTier(cfg: RetentionConfig, stats: RetentionStats): Promise<void> {
  const pruneCutoff = new Date();
  pruneCutoff.setDate(pruneCutoff.getDate() - 90); // 90 days in cold = evaluate

  const { data: memories } = await supabase
    .from('brain_memory_cold')
    .select('id, summary, value_score, access_count, created_at, tags')
    .lt('created_at', pruneCutoff.toISOString())
    .lt('value_score', 0.15)
    .order('value_score', { ascending: true })
    .limit(200);

  if (!memories || memories.length === 0) return;

  const glacierInserts: any[] = [];
  const coldDeleteIds: string[] = [];

  for (const mem of memories) {
    const importance = classifyImportance(
      mem.summary || '',
      ((mem.tags as any)?.original_type) || 'general',
      mem.value_score || 0,
      mem.access_count || 0
    );

    if (shouldPreserveIndefinitely(importance)) {
      stats.preserved++;
      continue;
    }

    // Ultra-compress for glacier
    const { compressed } = compressForStorage(mem.summary || '', false);

    glacierInserts.push({
      content: compressed,
      source_tier: 'cold',
      archived_reason: 'retention_policy_prune',
      value_score: mem.value_score || 0,
      tags: {
        importance,
        original_cold_id: mem.id,
        glaciered_at: new Date().toISOString(),
      },
    });

    coldDeleteIds.push(mem.id);
    stats.pruned++;
    stats.spaceSavedBytes += (mem.summary?.length || 0) - compressed.length;
  }

  if (!cfg.dryRun && glacierInserts.length > 0) {
    const { error } = await supabase
      .from('brain_memory_archive')
      .insert(glacierInserts as any[]);

    if (!error) {
      for (let i = 0; i < coldDeleteIds.length; i += 100) {
        await supabase.from('brain_memory_cold')
          .delete()
          .in('id', coldDeleteIds.slice(i, i + 100));
      }
    }
  }
}

/**
 * Compact glacier metadata — strip redundant fields from archived memories
 */
async function compactGlacierMetadata(stats: RetentionStats): Promise<void> {
  try {
    const { data: archives } = await supabase
      .from('brain_memory_archive')
      .select('id, tags, content')
      .not('tags', 'is', null)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!archives || archives.length === 0) return;

    let compacted = 0;
    for (const arch of archives) {
      if (!arch.tags || typeof arch.tags !== 'object') continue;
      const original = JSON.stringify(arch.tags);
      const compact = compactMetadata(arch.tags as Record<string, unknown>);
      const compactStr = JSON.stringify(compact);
      
      if (compactStr.length < original.length * 0.8) {
        await supabase
          .from('brain_memory_archive')
          .update({ tags: compact as any })
          .eq('id', arch.id);
        compacted++;
        stats.spaceSavedBytes += original.length - compactStr.length;
      }
    }

    if (compacted > 0) {
      stats.compressed += compacted;
    }
  } catch {
    // Non-critical
  }
}
