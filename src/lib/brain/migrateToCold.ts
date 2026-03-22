/**
 * CMPSBL® BRAIN — Cold Migration v3
 * Cron task that compresses & archives stale hot/warm data
 * v3: Parallel tier phases, batched operations, compact metadata keys
 */

import { supabase } from '@/integrations/supabase/client';
import { compressMemories } from './compressMemory';
import { compressForStorage, classifyImportance, shouldPreserveIndefinitely, compactMetadata } from '@/lib/memory/content-dedup';

export interface MigrationStats {
  checked: number;
  migrated: number;
  compressed: number;
  errors: number;
}

/**
 * Migrate stale memories from hot/warm to cold tier
 * OPTIMIZED: Parallel tier phases, batched deletes
 */
export async function migrateStaleMemories(
  inactiveDays: number = 90
): Promise<MigrationStats> {
  const stats: MigrationStats = { checked: 0, migrated: 0, compressed: 0, errors: 0 };
  
  try {
    const hotCutoff = new Date();
    hotCutoff.setDate(hotCutoff.getDate() - inactiveDays);
    const warmCutoff = new Date();
    warmCutoff.setDate(warmCutoff.getDate() - Math.max(60, inactiveDays - 30));

    // Parallel fetch both tiers
    const [hotResult, warmResult] = await Promise.allSettled([
      supabase.from('brain_memory_hot')
        .select('id, content, context, value_score, access_count, created_at, last_used, source_module, category, tags, embedding, goal_ref')
        .lt('last_used', hotCutoff.toISOString())
        .order('last_used', { ascending: true })
        .limit(1000),
      supabase.from('brain_memory_warm')
        .select('id, content, context, value_score, access_count, created_at, source_module, category, memory_type')
        .or(`last_accessed.lt.${warmCutoff.toISOString()},last_accessed.is.null`)
        .lt('created_at', warmCutoff.toISOString())
        .lt('value_score', 0.3)
        .order('value_score', { ascending: true })
        .limit(500),
    ]);

    // Process both tiers in parallel
    const phases: Promise<void>[] = [];

    if (hotResult.status === 'fulfilled') {
      const staleHot = (hotResult.value as any)?.data;
      if (staleHot?.length > 0) {
        stats.checked += staleHot.length;
        phases.push(migrateGroup(staleHot, 'brain_memory_hot', stats));
      }
    } else { stats.errors++; }

    if (warmResult.status === 'fulfilled') {
      const staleWarm = (warmResult.value as any)?.data;
      if (staleWarm?.length > 0) {
        stats.checked += staleWarm.length;
        phases.push(migrateWarmBatch(staleWarm, stats));
      }
    } else { stats.errors++; }

    await Promise.allSettled(phases);

    // Fire-and-forget event log
    supabase.from('brain_events').insert({
      module: 'brain', event_type: 'cold_migration',
      data: stats as any,
      outcome: stats.errors === 0 ? 'success' : 'partial',
    }).then(() => {}, () => {});
    
    return stats;
  } catch (err) {
    console.error('Migration error:', err);
    stats.errors++;
    return stats;
  }
}

/**
 * Batch migrate warm memories to cold — single pass with importance filtering
 */
async function migrateWarmBatch(memories: any[], stats: MigrationStats): Promise<void> {
  const coldInserts: any[] = [];
  const warmDeleteIds: string[] = [];
  const boostPromises: Promise<any>[] = [];

  for (const mem of memories) {
    const importance = classifyImportance(
      mem.content, mem.context || 'general', mem.value_score || 0, 0
    );

    if (shouldPreserveIndefinitely(importance)) {
      boostPromises.push(
        Promise.resolve(supabase.from('brain_memory_warm')
          .update({ value_score: Math.max(0.5, mem.value_score || 0.3) })
          .eq('id', mem.id))
      );
      continue;
    }

    const { compressed, ratio } = compressForStorage(mem.content, mem.context === 'code');

    coldInserts.push({
      summary: compressed, source_refs: [mem.id],
      compression_level: Math.round(ratio),
      source_module: mem.source_module || 'general',
      category: mem.category || 'uncategorized',
      value_score: mem.value_score,
      tags: { ctx: mem.context, mf: 'warm', imp: importance, cr: ratio },
    });

    warmDeleteIds.push(mem.id);
  }

  // Fire boosts non-blocking
  if (boostPromises.length > 0) Promise.allSettled(boostPromises).catch(() => {});

  if (coldInserts.length > 0) {
    const { error } = await supabase.from('brain_memory_cold').insert(coldInserts as any[]);

    if (!error) {
      // Parallel batch deletes
      const chunks = [];
      for (let i = 0; i < warmDeleteIds.length; i += 100) {
        chunks.push(
          Promise.resolve(supabase.from('brain_memory_warm').delete().in('id', warmDeleteIds.slice(i, i + 100)))
        );
      }
      await Promise.allSettled(chunks);
      stats.migrated += warmDeleteIds.length;
    } else {
      stats.errors += coldInserts.length;
    }
  }
}

/**
 * Migrate a group of memories from source tier to cold
 * OPTIMIZED: Parallel batch compression, batched single-memory migrations for code
 */
async function migrateGroup(
  memories: any[],
  sourceTable: string,
  stats: MigrationStats
): Promise<void> {
  // Group by context for compression
  const contextGroups = new Map<string, typeof memories>();
  for (const memory of memories) {
    const ctx = memory.context || 'general';
    const group = contextGroups.get(ctx);
    if (group) group.push(memory);
    else contextGroups.set(ctx, [memory]);
  }
  
  // Process all context groups in parallel
  const groupPromises: Promise<void>[] = [];

  for (const [context, group] of contextGroups) {
    groupPromises.push((async () => {
      try {
        if (context === 'code') {
          // Code: batch migrate without compression
          await migrateCodeBatch(group, sourceTable, stats);
        } else {
          // Compress in batches of 5
          const sourceTier = sourceTable === 'brain_memory_warm' ? 'warm' : 'hot';
          for (let i = 0; i < group.length; i += 5) {
            const batch = group.slice(i, i + 5);
            const batchIds = batch.map((m: any) => m.id);
            
            const compressed = await compressMemories(batchIds, sourceTier);
            
            if (compressed) {
              const { error } = await supabase
                .from('brain_memory_cold')
                .insert({
                  summary: compressed.summary,
                  source_refs: compressed.sourceRefs as any,
                  compression_level: compressed.compressionLevel,
                  source_module: batch[0]?.source_module || 'general',
                  category: batch[0]?.category || context,
                  tags: { ctx: context, cnt: batch.length, mf: sourceTable.replace('brain_memory_', '') } as any,
                });
              
              if (!error) {
                await Promise.resolve(supabase.from(sourceTable as any).delete().in('id', batchIds));
                stats.migrated += batch.length;
                stats.compressed++;
              } else {
                stats.errors++;
              }
            } else {
              stats.errors++;
            }
          }
        }
      } catch (err) {
        console.error(`Error migrating ${context} memories:`, err);
        stats.errors++;
      }
    })());
  }

  await Promise.allSettled(groupPromises);
}

/**
 * Batch migrate code memories — single bulk insert + bulk delete
 */
async function migrateCodeBatch(memories: any[], sourceTable: string, stats: MigrationStats): Promise<void> {
  const coldInserts = memories.map(mem => ({
    summary: mem.content,
    source_refs: [mem.id],
    embedding: mem.embedding ? mem.embedding.slice(0, 512) : null,
    compression_level: 0,
    source_module: mem.source_module || 'general',
    category: mem.category || 'uncategorized',
    tags: { ctx: mem.context, gr: mem.goal_ref } as any,
  }));

  const { error } = await supabase.from('brain_memory_cold').insert(coldInserts as any[]);
  
  if (!error) {
    const ids = memories.map((m: any) => m.id);
    const chunks = [];
    for (let i = 0; i < ids.length; i += 100) {
      chunks.push(Promise.resolve(supabase.from(sourceTable as any).delete().in('id', ids.slice(i, i + 100))));
    }
    await Promise.allSettled(chunks);
    stats.migrated += memories.length;
  } else {
    stats.errors += memories.length;
  }
}

/**
 * Get migration statistics for dashboard
 */
export async function getMigrationStats(days: number = 30): Promise<{
  totalMigrated: number;
  totalCompressed: number;
  avgCompressionRatio: number;
  lastMigration: string | null;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const { data: events } = await supabase
      .from('brain_events')
      .select('data, created_at')
      .eq('event_type', 'cold_migration')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (!events || events.length === 0) {
      return { totalMigrated: 0, totalCompressed: 0, avgCompressionRatio: 0, lastMigration: null };
    }
    
    let totalMigrated = 0, totalCompressed = 0;
    for (const e of events) {
      totalMigrated += (e.data as any)?.migrated || 0;
      totalCompressed += (e.data as any)?.compressed || 0;
    }
    
    return {
      totalMigrated, totalCompressed,
      avgCompressionRatio: totalMigrated > 0 ? totalCompressed / totalMigrated : 0,
      lastMigration: events[0].created_at,
    };
  } catch (err) {
    console.error('Error getting migration stats:', err);
    return { totalMigrated: 0, totalCompressed: 0, avgCompressionRatio: 0, lastMigration: null };
  }
}