/**
 * PromptFluid Brain - Cold Migration
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
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
    
    // Find stale memories
    const { data: staleMemories, error: fetchError } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .lt('last_used', cutoffDate.toISOString())
      .order('last_used', { ascending: true })
      .limit(1000);
    
    if (fetchError) {
      console.error('Error fetching stale memories:', fetchError);
      stats.errors++;
      return stats;
    }
    
    if (!staleMemories || staleMemories.length === 0) {
      console.log('No stale memories to migrate');
      return stats;
    }
    
    stats.checked = staleMemories.length;
    console.log(`Found ${stats.checked} stale memories to migrate`);
    
    // Group by context for compression
    const groupedByContext: Record<string, typeof staleMemories> = {};
    
    for (const memory of staleMemories) {
      if (!groupedByContext[memory.context]) {
        groupedByContext[memory.context] = [];
      }
      groupedByContext[memory.context].push(memory);
    }
    
    // Migrate each group
    for (const [context, memories] of Object.entries(groupedByContext)) {
      try {
        // Code context: preserve raw, no compression
        if (context === 'code') {
          for (const memory of memories) {
            const success = await migrateSingleMemory(memory, 0);
            if (success) {
              stats.migrated++;
            } else {
              stats.errors++;
            }
          }
        } else {
          // Other contexts: compress in batches of 5
          for (let i = 0; i < memories.length; i += 5) {
            const batch = memories.slice(i, i + 5);
            const batchIds = batch.map(m => m.id);
            
            // Compress batch
            const compressed = await compressMemories(batchIds);
            
            if (compressed) {
              // Store compressed version in cold
              const { error: insertError } = await supabase
                .from('brain_memory_cold')
                .insert({
                  summary: compressed.summary,
                  source_refs: compressed.sourceRefs as any,
                  compression_level: compressed.compressionLevel,
                  tags: {
                    context,
                    archived: true,
                    original_count: batch.length,
                    migrated_at: new Date().toISOString(),
                  } as any,
                });
              
              if (!insertError) {
                // Delete from hot
                await supabase
                  .from('brain_memory_hot')
                  .delete()
                  .in('id', batchIds);
                
                stats.migrated += batch.length;
                stats.compressed++;
              } else {
                console.error('Error inserting compressed memory:', insertError);
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
    
    console.log('Migration complete:', stats);
    
    // Log migration event to brain_events if table exists
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
