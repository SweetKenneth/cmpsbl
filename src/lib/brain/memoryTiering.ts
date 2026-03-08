/**
 * CMPSBL® BRAIN — Three-Tier Memory System
 * Client library for Hot → Warm → Cold memory management
 */

import { supabase } from '@/integrations/supabase/client';

export type MemoryTier = 'hot' | 'warm' | 'cold';

export interface Memory {
  id: string;
  content: string;
  context?: string;
  tier: MemoryTier;
  value_score: number;
  access_count: number;
  created_at: string;
  last_accessed?: string;
}

export interface TierStats {
  hot: { count: number; avgValueScore: number };
  warm: { count: number; avgValueScore: number };
  cold: { count: number; avgValueScore: number };
  total: number;
}

export interface TieringResult {
  success: boolean;
  operation: string;
  stats: {
    promoted_to_hot: number;
    demoted_to_warm: number;
    demoted_to_cold: number;
    pruned: number;
    rebalanced: number;
    errors: number;
  };
}

/**
 * Get current memory tier statistics
 */
export async function getTierStats(): Promise<TierStats> {
  try {
    const [hotCount, warmCount, coldCount, hotAvg, warmAvg, coldAvg] = await Promise.all([
      supabase.from('brain_memory_hot').select('*', { count: 'exact', head: true }),
      supabase.from('brain_memory_warm').select('*', { count: 'exact', head: true }),
      supabase.from('brain_memory_cold').select('*', { count: 'exact', head: true }),
      supabase.rpc('brain_avg_value_score', { p_table: 'brain_memory_hot' }).then(r => r.data).catch(() => null),
      supabase.rpc('brain_avg_value_score', { p_table: 'brain_memory_warm' }).then(r => r.data).catch(() => null),
      supabase.rpc('brain_avg_value_score', { p_table: 'brain_memory_cold' }).then(r => r.data).catch(() => null),
    ]);

    const hc = hotCount.count ?? 0;
    const wc = warmCount.count ?? 0;
    const cc = coldCount.count ?? 0;

    return {
      hot: { count: hc, avgValueScore: Number(hotAvg) || 0 },
      warm: { count: wc, avgValueScore: Number(warmAvg) || 0 },
      cold: { count: cc, avgValueScore: Number(coldAvg) || 0 },
      total: hc + wc + cc,
    };
  } catch (error) {
    console.error('Error getting tier stats:', error);
    return {
      hot: { count: 0, avgValueScore: 0 },
      warm: { count: 0, avgValueScore: 0 },
      cold: { count: 0, avgValueScore: 0 },
      total: 0,
    };
  }
}

/**
 * Trigger memory tiering rebalance
 */
export async function rebalanceMemory(
  operation: 'rebalance' | 'promote' | 'demote' | 'prune' = 'rebalance'
): Promise<TieringResult> {
  try {
    const { data, error } = await supabase.functions.invoke('pf-brain-memory-tiering', {
      body: { operation },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Memory tiering error:', error);
    return {
      success: false,
      operation,
      stats: {
        promoted_to_hot: 0,
        demoted_to_warm: 0,
        demoted_to_cold: 0,
        pruned: 0,
        rebalanced: 0,
        errors: 1,
      },
    };
  }
}

/**
 * Prune low-value memories
 */
export async function pruneMemories(options?: {
  tier?: MemoryTier | 'all';
  aggressive?: boolean;
  dryRun?: boolean;
}): Promise<{ success: boolean; stats: any }> {
  try {
    const { data, error } = await supabase.functions.invoke('pf-brain-memory-prune', {
      body: {
        tier: options?.tier || 'all',
        aggressive: options?.aggressive || false,
        dry_run: options?.dryRun || false,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Memory prune error:', error);
    return { success: false, stats: {} };
  }
}

/**
 * Search memories across all tiers
 */
export async function searchMemories(
  query: string,
  options?: {
    tiers?: MemoryTier[];
    limit?: number;
    minValueScore?: number;
    context?: string;
  }
): Promise<Memory[]> {
  const tiers = options?.tiers || ['hot', 'warm', 'cold'];
  const limit = options?.limit || 20;
  const minScore = options?.minValueScore || 0;
  const results: Memory[] = [];

  try {
    const queries = [];

    if (tiers.includes('hot')) {
      let q = supabase
        .from('brain_memory_hot')
        .select('id, content, context, value_score, access_count, created_at, last_used')
        .ilike('content', `%${query}%`)
        .gte('value_score', minScore)
        .order('value_score', { ascending: false })
        .limit(limit);
      
      if (options?.context) {
        q = q.eq('context', options.context);
      }
      queries.push(q);
    }

    if (tiers.includes('warm')) {
      let q = supabase
        .from('brain_memory_warm')
        .select('id, content, context, value_score, access_count, created_at, last_accessed')
        .ilike('content', `%${query}%`)
        .gte('value_score', minScore)
        .order('value_score', { ascending: false })
        .limit(limit);
      
      if (options?.context) {
        q = q.eq('context', options.context);
      }
      queries.push(q);
    }

    if (tiers.includes('cold')) {
      let q = supabase
        .from('brain_memory_cold')
        .select('id, summary, tags, value_score, access_count, created_at, last_accessed')
        .ilike('summary', `%${query}%`)
        .gte('value_score', minScore)
        .order('value_score', { ascending: false })
        .limit(limit);
      queries.push(q);
    }

    const responses = await Promise.all(queries);
    let tierIndex = 0;

    for (const tier of tiers) {
      const data = responses[tierIndex]?.data || [];
      for (const item of data) {
        results.push({
          id: item.id,
          content: item.content || item.summary,
          context: item.context || (item.tags as any)?.context,
          tier,
          value_score: item.value_score || 0,
          access_count: item.access_count || 0,
          created_at: item.created_at,
          last_accessed: item.last_used || item.last_accessed,
        });
      }
      tierIndex++;
    }

    // Sort by value score and limit
    return results
      .sort((a, b) => b.value_score - a.value_score)
      .slice(0, limit);
  } catch (error) {
    console.error('Memory search error:', error);
    return [];
  }
}

/**
 * Access a memory (boosts its value score)
 */
export async function accessMemory(memoryId: string, tier: MemoryTier): Promise<boolean> {
  try {
    const table = tier === 'hot' ? 'brain_memory_hot'
      : tier === 'warm' ? 'brain_memory_warm'
      : 'brain_memory_cold';

    const accessField = tier === 'hot' ? 'last_used' : 'last_accessed';

    // Get current access count first
    const { data: current } = await supabase
      .from(table)
      .select('access_count')
      .eq('id', memoryId)
      .single();

    const { error } = await supabase
      .from(table)
      .update({
        [accessField]: new Date().toISOString(),
        access_count: (current?.access_count || 0) + 1,
      })
      .eq('id', memoryId);

    return !error;
  } catch (error) {
    console.error('Memory access error:', error);
    return false;
  }
}

/**
 * Get tiering configuration
 */
export async function getTieringConfig(): Promise<Record<string, any>> {
  try {
    const { data } = await supabase
      .from('brain_tiering_config')
      .select('*');

    const config: Record<string, any> = {};
    for (const c of data || []) {
      config[c.tier_name] = c;
    }
    return config;
  } catch (error) {
    console.error('Error fetching tiering config:', error);
    return {};
  }
}

/**
 * Update tiering configuration
 */
export async function updateTieringConfig(
  tier: MemoryTier,
  updates: {
    max_entries?: number;
    min_value_score?: number;
    max_age_days?: number;
    prune_threshold?: number;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('brain_tiering_config')
      .update(updates)
      .eq('tier_name', tier);

    return !error;
  } catch (error) {
    console.error('Error updating tiering config:', error);
    return false;
  }
}

/**
 * Get recently pruned memories (for potential restoration)
 */
export async function getPrunedMemories(limit: number = 50): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('brain_memory_pruned')
      .select('*')
      .eq('can_restore', true)
      .gt('restore_until', new Date().toISOString())
      .order('pruned_at', { ascending: false })
      .limit(limit);

    return data || [];
  } catch (error) {
    console.error('Error fetching pruned memories:', error);
    return [];
  }
}

/**
 * Restore a pruned memory
 */
export async function restoreMemory(prunedId: string): Promise<boolean> {
  try {
    // Get the pruned record
    const { data: pruned } = await supabase
      .from('brain_memory_pruned')
      .select('*')
      .eq('id', prunedId)
      .single();

    if (!pruned || !pruned.can_restore) {
      return false;
    }

    // Restore to warm tier (safe middle ground)
    const { error: insertError } = await supabase
      .from('brain_memory_warm')
      .insert({
        content: pruned.content_preview, // Limited content from preview
        context: pruned.context,
        value_score: Math.max(0.35, (pruned.value_score || 0) + 0.1),
        tags: { restored: true, original_tier: pruned.original_tier },
        metadata: { restored_at: new Date().toISOString() },
      });

    if (insertError) throw insertError;

    // Mark as restored
    await supabase
      .from('brain_memory_pruned')
      .update({ can_restore: false })
      .eq('id', prunedId);

    return true;
  } catch (error) {
    console.error('Error restoring memory:', error);
    return false;
  }
}
