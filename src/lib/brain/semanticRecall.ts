/**
 * CMPSBL® BRAIN — Enhanced Semantic Recall
 * Embedding-based similarity search with cross-tier retrieval
 * 
 * OPTIMIZED: Uses shared similarity functions, parallelized all tier queries,
 * unified per-tier processing into a single helper.
 */

import { supabase } from '@/integrations/supabase/client';
import { combinedSimilarity, HOT_SELECT, WARM_SELECT, COLD_SELECT, GLACIER_SELECT } from './shared';

export interface SemanticMatch {
  id: string;
  content: string;
  tier: 'hot' | 'warm' | 'cold' | 'glacier';
  similarity: number;
  context?: string;
  valueScore: number;
  accessCount: number;
}

export interface RecallOptions {
  query: string;
  limit?: number;
  tiers?: ('hot' | 'warm' | 'cold' | 'glacier')[];
  minSimilarity?: number;
  boostRecent?: boolean;
  context?: string;
}

/**
 * Enhanced semantic recall with embedding similarity
 * OPTIMIZED: Single processTier helper eliminates 4x duplicated loops
 */
export async function semanticRecall(options: RecallOptions): Promise<SemanticMatch[]> {
  const {
    query,
    limit = 20,
    tiers = ['hot', 'warm', 'cold', 'glacier'],
    minSimilarity = 0.15,
    boostRecent = true,
    context,
  } = options;
  
  const results: SemanticMatch[] = [];
  
  try {
    // Build all tier queries conditionally
    const builders: Array<{ tier: 'hot' | 'warm' | 'cold' | 'glacier'; query: any; contentField: string; relevanceMult: number }> = [];

    if (tiers.includes('hot')) {
      let q = supabase.from('brain_memory_hot').select(HOT_SELECT)
        .order('value_score', { ascending: false }).limit(100);
      if (context) q = q.eq('context', context);
      builders.push({ tier: 'hot', query: q, contentField: 'content', relevanceMult: 1.0 });
    }
    if (tiers.includes('warm')) {
      let q = supabase.from('brain_memory_warm').select(WARM_SELECT)
        .order('value_score', { ascending: false }).limit(100);
      if (context) q = q.eq('context', context);
      builders.push({ tier: 'warm', query: q, contentField: 'content', relevanceMult: 1.0 });
    }
    if (tiers.includes('cold')) {
      let q = supabase.from('brain_memory_cold').select(COLD_SELECT)
        .order('value_score', { ascending: false }).limit(100);
      if (context) q = q.contains('tags', { context });
      builders.push({ tier: 'cold', query: q, contentField: 'summary', relevanceMult: 1.0 });
    }
    if (tiers.includes('glacier')) {
      let q = supabase.from('brain_memory_archive').select(GLACIER_SELECT)
        .order('value_score', { ascending: false }).limit(50);
      if (context) q = q.eq('context', context);
      builders.push({ tier: 'glacier', query: q, contentField: 'content', relevanceMult: 0.85 });
    }

    // Parallel fetch ALL tiers at once
    const responses = await Promise.all(builders.map(b => b.query));

    // Unified processing — single loop handles all tiers
    const nowMs = Date.now();
    for (let i = 0; i < builders.length; i++) {
      const { tier, contentField, relevanceMult } = builders[i];
      const data = (responses[i] as any)?.data || [];

      for (const item of data) {
        const text = item[contentField] || '';
        let similarity = combinedSimilarity(query, text) * relevanceMult;
        if (similarity < minSimilarity) continue;

        // Recency boost for hot tier
        if (boostRecent && tier === 'hot' && item.last_used) {
          const hoursSince = (nowMs - new Date(item.last_used).getTime()) / 3600000;
          similarity *= 1 + Math.max(0, (24 - hoursSince) / 48);
        }

        results.push({
          id: item.id,
          content: text,
          tier,
          similarity,
          context: item.context || (item.tags as any)?.context,
          valueScore: item.value_score || 0,
          accessCount: item.access_count || 0,
        });
      }
    }

    // Sort by similarity and return top results
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
      
  } catch (error) {
    console.error('Semantic recall error:', error);
    return [];
  }
}

/**
 * Get related memories based on a source memory
 */
export async function getRelatedMemories(
  memoryId: string,
  tier: 'hot' | 'warm' | 'cold',
  limit: number = 5
): Promise<SemanticMatch[]> {
  try {
    const table = tier === 'hot' ? 'brain_memory_hot'
      : tier === 'warm' ? 'brain_memory_warm'
      : 'brain_memory_cold';
    
    const contentField = tier === 'cold' ? 'summary' : 'content';
    
    const { data: source } = await supabase
      .from(table)
      .select(`${contentField}, context`)
      .eq('id', memoryId)
      .single();
    
    if (!source) return [];
    
    const content = (source as any)[contentField];
    const context = (source as any).context;
    
    const related = await semanticRecall({
      query: content,
      limit: limit + 1,
      context,
      minSimilarity: 0.3,
    });
    
    return related.filter(m => m.id !== memoryId).slice(0, limit);
    
  } catch (error) {
    console.error('Error finding related memories:', error);
    return [];
  }
}

/**
 * Memory cluster detection - finds groups of related memories
 * OPTIMIZED: Uses shared combinedSimilarity
 */
export async function detectMemoryClusters(
  minClusterSize: number = 3,
  similarityThreshold: number = 0.4
): Promise<Array<{ theme: string; memories: SemanticMatch[] }>> {
  try {
    const { data: memories } = await supabase
      .from('brain_memory_hot')
      .select('id, content, context, value_score, access_count')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (!memories || memories.length < minClusterSize) return [];
    
    const clusters: Array<{ theme: string; memories: SemanticMatch[] }> = [];
    const assigned = new Set<string>();
    
    for (const memory of memories) {
      if (assigned.has(memory.id)) continue;
      
      const cluster: SemanticMatch[] = [{
        id: memory.id, content: memory.content, tier: 'hot',
        similarity: 1, context: memory.context,
        valueScore: memory.value_score || 0, accessCount: memory.access_count || 0,
      }];
      assigned.add(memory.id);
      
      for (const other of memories) {
        if (assigned.has(other.id)) continue;
        const similarity = combinedSimilarity(memory.content, other.content);
        if (similarity >= similarityThreshold) {
          cluster.push({
            id: other.id, content: other.content, tier: 'hot',
            similarity, context: other.context,
            valueScore: other.value_score || 0, accessCount: other.access_count || 0,
          });
          assigned.add(other.id);
        }
      }
      
      if (cluster.length >= minClusterSize) {
        const wordFreq: Record<string, number> = {};
        for (const m of cluster) {
          for (const w of m.content.toLowerCase().split(/\s+/)) {
            if (w.length > 4) wordFreq[w] = (wordFreq[w] || 0) + 1;
          }
        }
        const topWords = Object.entries(wordFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([w]) => w);
        
        clusters.push({
          theme: topWords.join(', ') || 'general',
          memories: cluster.sort((a, b) => b.similarity - a.similarity),
        });
      }
    }
    
    return clusters;
  } catch (error) {
    console.error('Cluster detection error:', error);
    return [];
  }
}
