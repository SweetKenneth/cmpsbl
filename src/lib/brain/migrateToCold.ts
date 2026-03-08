/**
 * CMPSBL® BRAIN — Cold Migration
 * Cron task that compresses & archives stale hot data
 */

import { supabase } from '@/integrations/supabase/client';
import { compressMemories } from './compressMemory';

export interface MigrationStats {
  checked: number;
  migrated: number;
  compressed: number;
  errors: number;
}

/**
 * Migrate stale memories from hot to cold tier
 * Runs as cron job to archive data inactive for 90+ days
 */
export async function migrateStaleMemories(
  inactiveDays: number = 90
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    checked: 0,
    migrated: 0,
    compressed: 0,
    errors: 0,
  };
  
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
    
    // ═══ Phase 1: Hot → Cold (stale hot memories) ═══
    const { data: staleHot, error: hotError } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .lt('last_used', cutoffDate.toISOString())
      .order('last_used', { ascending: true })
      .limit(1000);
    
    if (hotError) {
      console.error('Error fetching stale hot memories:', hotError);
      stats.errors++;
    } else if (staleHot && staleHot.length > 0) {
      stats.checked += staleHot.length;
      await migrateGroup(staleHot, 'brain_memory_hot', stats);
    }

    // ═══ Phase 2: Warm → Cold (stale warm memories — 60-day threshold) ═══
    const warmCutoff = new Date();
    warmCutoff.setDate(warmCutoff.getDate() - Math.max(60, inactiveDays - 30));
    
    const { data: staleWarm, error: warmError } = await supabase
      .from('brain_memory_warm')
      .select('*')
      .or(`last_accessed.lt.${warmCutoff.toISOString()},last_accessed.is.null`)
      .lt('created_at', warmCutoff.toISOString())
      .lt('value_score', 0.3)
      .order('value_score', { ascending: true })
      .limit(500);

    if (warmError) {
      console.error('Error fetching stale warm memories:', warmError);
      stats.errors++;
    } else if (staleWarm && staleWarm.length > 0) {
      stats.checked += staleWarm.length;
      
      for (const memory of staleWarm) {
        try {
          const { error: insertError } = await supabase
            .from('brain_memory_cold')
            .insert({
              summary: memory.content,
              source_refs: [memory.id],
              compression_level: 2,
              source_module: memory.source_module || 'general',
              category: memory.category || 'uncategorized',
              tags: {
                context: memory.context,
                archived: true,
                migrated_from: 'warm',
                migrated_at: new Date().toISOString(),
              },
              value_score: memory.value_score,
            });
          
          if (!insertError) {
            await supabase.from('brain_memory_warm').delete().eq('id', memory.id);
            stats.migrated++;
          } else {
            stats.errors++;
          }
        } catch {
          stats.errors++;
        }
      }
    }

    console.log('Migration complete:', stats);
    
    // Log migration event
    try {
      await supabase.from('brain_events').insert({
        module: 'brain',
        event_type: 'cold_migration',
        data: stats as any,
        outcome: stats.errors === 0 ? 'success' : 'partial',
      });
    } catch (logError) {
      console.error('Failed to log migration event:', logError);
    }
    
    return stats;
  } catch (err) {
    console.error('Migration error:', err);
    stats.errors++;
    return stats;
  }
}

/**
 * Migrate a group of memories from source tier to cold
 */
async function migrateGroup(
  memories: any[],
  sourceTable: string,
  stats: MigrationStats
): Promise<void> {
  // Group by context for compression
  const groupedByContext: Record<string, typeof memories> = {};
  for (const memory of memories) {
    const ctx = memory.context || 'general';
    if (!groupedByContext[ctx]) groupedByContext[ctx] = [];
    groupedByContext[ctx].push(memory);
  }
  
  for (const [context, group] of Object.entries(groupedByContext)) {
    try {
      if (context === 'code') {
        // Code: preserve raw
        for (const memory of group) {
          const success = await migrateSingleMemory(memory, 0);
          if (success) stats.migrated++;
          else stats.errors++;
        }
      } else {
        // Compress in batches of 5
        for (let i = 0; i < group.length; i += 5) {
          const batch = group.slice(i, i + 5);
          const batchIds = batch.map(m => m.id);
          
          const sourceTier = sourceTable === 'brain_memory_warm' ? 'warm' : 'hot';
          const compressed = await compressMemories(batchIds, sourceTier);
          
          if (compressed) {
            const { error: insertError } = await supabase
              .from('brain_memory_cold')
              .insert({
                summary: compressed.summary,
                source_refs: compressed.sourceRefs as any,
                compression_level: compressed.compressionLevel,
                source_module: batch[0]?.source_module || 'general',
                category: batch[0]?.category || context,
                tags: {
                  context,
                  archived: true,
                  original_count: batch.length,
                  migrated_from: sourceTable.replace('brain_memory_', ''),
                  migrated_at: new Date().toISOString(),
                } as any,
              });
            
            if (!insertError) {
              await supabase.from(sourceTable as any).delete().in('id', batchIds);
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
  }
}

/**
 * Migrate a single memory without compression
 */
async function migrateSingleMemory(
  memory: any,
  compressionLevel: number
): Promise<boolean> {
  try {
    const { error: insertError } = await supabase
      .from('brain_memory_cold')
      .insert({
        summary: memory.content,
        source_refs: [memory.id],
        embedding: memory.embedding ? memory.embedding.slice(0, 512) : null,
        compression_level: compressionLevel,
        source_module: memory.source_module || 'general',
        category: memory.category || 'uncategorized',
        tags: {
          ...memory.tags,
          context: memory.context,
          archived: true,
          migrated_at: new Date().toISOString(),
          goal_ref: memory.goal_ref,
        },
      });
    
    if (insertError) {
      console.error('Error inserting cold memory:', insertError);
      return false;
    }
    
    // Delete from hot
    const { error: deleteError } = await supabase
      .from('brain_memory_hot')
      .delete()
      .eq('id', memory.id);
    
    if (deleteError) {
      console.error('Error deleting hot memory:', deleteError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error migrating single memory:', err);
    return false;
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
      return {
        totalMigrated: 0,
        totalCompressed: 0,
        avgCompressionRatio: 0,
        lastMigration: null,
      };
    }
    
    const totalMigrated = events.reduce((sum, e) => {
      const migrated = (e.data as any)?.migrated || 0;
      return sum + migrated;
    }, 0);
    
    const totalCompressed = events.reduce((sum, e) => {
      const compressed = (e.data as any)?.compressed || 0;
      return sum + compressed;
    }, 0);
    
    return {
      totalMigrated,
      totalCompressed,
      avgCompressionRatio: totalMigrated > 0 ? totalCompressed / totalMigrated : 0,
      lastMigration: events[0].created_at,
    };
  } catch (err) {
    console.error('Error getting migration stats:', err);
    return {
      totalMigrated: 0,
      totalCompressed: 0,
      avgCompressionRatio: 0,
      lastMigration: null,
    };
  }
}
