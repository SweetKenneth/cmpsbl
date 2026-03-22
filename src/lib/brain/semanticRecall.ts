/**
 * CMPSBL® BRAIN — Enhanced Semantic Recall v2
 * Embedding-based similarity search with cross-tier retrieval
 * 
 * OPTIMIZED: Dynamic over-fetch based on tier, early termination on high matches,
 * cached similarity computations for cluster detection.
 */

import { supabase } from '@/integrations/supabase/client';
import { combinedSimilarity, tokenizeToSet, jaccardSimilarity, HOT_SELECT, WARM_SELECT, COLD_SELECT, GLACIER_SELECT } from './shared';

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

/** Tier-specific over-fetch ratios — hot/warm are cheaper to scan */
const TIER_FETCH_LIMITS: Record<string, number> = {
  hot: 80, warm: 80, cold: 60, glacier: 40,
};

/**
 * Enhanced semantic recall with embedding similarity
 * OPTIMIZED: Dynamic fetch limits, early-exit on perfect matches
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
    const builders: Array<{ tier: 'hot' | 'warm' | 'cold' | 'glacier'; query: any; contentField: string; relevanceMult: number }> = [];

    if (tiers.includes('hot')) {
      let q = supabase.from('brain_memory_hot').select(HOT_SELECT)
        .order('value_score', { ascending: false }).limit(TIER_FETCH_LIMITS.hot);
      if (context) q = q.eq('context', context);
      builders.push({ tier: 'hot', query: q, contentField: 'content', relevanceMult: 1.0 });
    }
    if (tiers.includes('warm')) {
      let q = supabase.from('brain_memory_warm').select(WARM_SELECT)
        .order('value_score', { ascending: false }).limit(TIER_FETCH_LIMITS.warm);
      if (context) q = q.eq('context', context);
      builders.push({ tier: 'warm', query: q, contentField: 'content', relevanceMult: 1.0 });
    }
    if (tiers.includes('cold')) {
      let q = supabase.from('brain_memory_cold').select(COLD_SELECT)
        .order('value_score', { ascending: false }).limit(TIER_FETCH_LIMITS.cold);
      if (context) q = q.contains('tags', { context });
      builders.push({ tier: 'cold', query: q, contentField: 'summary', relevanceMult: 1.0 });
    }
    if (tiers.includes('glacier')) {
      let q = supabase.from('brain_memory_archive').select(GLACIER_SELECT)
        .order('value_score', { ascending: false }).limit(TIER_FETCH_LIMITS.glacier);
      if (context) q = q.eq('context', context);
      builders.push({ tier: 'glacier', query: q, contentField: 'content', relevanceMult: 0.85 });
    }

    // Parallel fetch ALL tiers
    const responses = await Promise.all(builders.map(b => b.query));

    const nowMs = Date.now();
    let perfectCount = 0;
    const maxPerfect = limit; // Early exit if we already have enough high-quality matches

    for (let i = 0; i < builders.length; i++) {
      if (perfectCount >= maxPerfect) break;

      const { tier, contentField, relevanceMult } = builders[i];
      const data = (responses[i] as any)?.data || [];

      for (const item of data) {
        const text = item[contentField] || '';
        let similarity = combinedSimilarity(query, text) * relevanceMult;
        if (similarity < minSimilarity) continue;

        // Recency boost for hot tier
        if (boostRecent && tier === 'hot' && item.last_used) {
          const hoursSince = (nowMs - new Date(item.last_used).getTime()) / 3600000;
          if (hoursSince < 24) similarity *= 1 + (24 - hoursSince) / 48;
        }

        if (similarity >= 0.9) perfectCount++;

        results.push({
          id: item.id, content: text, tier, similarity,
          context: item.context || (item.tags as any)?.context,
          valueScore: item.value_score || 0,
          accessCount: item.access_count || 0,
        });
      }
    }

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
    
    return semanticRecall({
      query: (source as any)[contentField],
      limit: limit + 1,
      context: (source as any).context,
      minSimilarity: 0.3,
    }).then(results => results.filter(m => m.id !== memoryId).slice(0, limit));
    
  } catch (error) {
    console.error('Error finding related memories:', error);
    return [];
  }
}

/**
 * Memory cluster detection - finds groups of related memories
 * OPTIMIZED: Pre-tokenize + Jaccard (O(min(m,n))) instead of combinedSimilarity per pair
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
    
    // Pre-tokenize all memories for O(1) reuse
    const tokenized = memories.map(m => ({
      ...m,
      tokens: tokenizeToSet(m.content),
    }));

    const clusters: Array<{ theme: string; memories: SemanticMatch[] }> = [];
    const assigned = new Set<string>();
    
    for (const memory of tokenized) {
      if (assigned.has(memory.id)) continue;
      
      const cluster: Array<typeof tokenized[0] & { similarity: number }> = [
        { ...memory, similarity: 1 }
      ];
      assigned.add(memory.id);
      
      for (const other of tokenized) {
        if (assigned.has(other.id)) continue;
        const similarity = jaccardSimilarity(memory.tokens, other.tokens);
        if (similarity >= similarityThreshold) {
          cluster.push({ ...other, similarity });
          assigned.add(other.id);
        }
      }
      
      if (cluster.length >= minClusterSize) {
        // Extract theme from word frequencies — inline without extra Map
        const wordFreq: Record<string, number> = {};
        for (const m of cluster) {
          for (const w of m.tokens) {
            if (w.length > 4) wordFreq[w] = (wordFreq[w] || 0) + 1;
          }
        }
        
        // Partial sort for top 3
        const entries = Object.entries(wordFreq);
        for (let i = 0; i < 3 && i < entries.length; i++) {
          let maxIdx = i;
          for (let j = i + 1; j < entries.length; j++) {
            if (entries[j][1] > entries[maxIdx][1]) maxIdx = j;
          }
          if (maxIdx !== i) { const tmp = entries[i]; entries[i] = entries[maxIdx]; entries[maxIdx] = tmp; }
        }
        const topWords = entries.slice(0, 3).map(([w]) => w);
        
        clusters.push({
          theme: topWords.join(', ') || 'general',
          memories: cluster
            .sort((a, b) => b.similarity - a.similarity)
            .map(m => ({
              id: m.id, content: m.content, tier: 'hot' as const,
              similarity: m.similarity, context: m.context,
              valueScore: m.value_score || 0, accessCount: m.access_count || 0,
            })),
        });
      }
    }
    
    return clusters;
  } catch (error) {
    console.error('Cluster detection error:', error);
    return [];
  }
}