/**
 * CMPSBL® BRAIN — Enhanced Semantic Recall
 * Embedding-based similarity search with cross-tier retrieval
 */

import { supabase } from '@/integrations/supabase/client';

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
 * Calculate cosine similarity between two text embeddings (simple word-based)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const normalize = (t: string) => t.toLowerCase().replace(/[^\w\s]/g, '');
  const words1 = normalize(text1).split(/\s+/).filter(Boolean);
  const words2 = normalize(text2).split(/\s+/).filter(Boolean);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Build freq map for text2 only, iterate text1 for dot product
  const freq2 = new Map<string, number>();
  for (const w of words2) freq2.set(w, (freq2.get(w) || 0) + 1);
  
  const freq1 = new Map<string, number>();
  for (const w of words1) freq1.set(w, (freq1.get(w) || 0) + 1);
  
  let dotProduct = 0;
  let mag1 = 0;
  for (const [word, count] of freq1) {
    mag1 += count * count;
    const f2 = freq2.get(word);
    if (f2) dotProduct += count * f2;
  }
  
  let mag2 = 0;
  for (const count of freq2.values()) mag2 += count * count;
  
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * N-gram based similarity for better phrase matching
 */
function ngramSimilarity(text1: string, text2: string, n: number = 3): number {
  const getNgrams = (text: string) => {
    const clean = text.toLowerCase().replace(/\s+/g, ' ');
    const grams = new Set<string>();
    for (let i = 0; i <= clean.length - n; i++) {
      grams.add(clean.slice(i, i + n));
    }
    return grams;
  };
  
  const grams1 = getNgrams(text1);
  const grams2 = getNgrams(text2);
  
  if (grams1.size === 0 || grams2.size === 0) return 0;
  
  // Count intersection without creating a third Set
  let intersectionCount = 0;
  for (const g of grams1) {
    if (grams2.has(g)) intersectionCount++;
  }
  const unionSize = grams1.size + grams2.size - intersectionCount;
  
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Combined similarity with weighting
 */
function calculateCombinedSimilarity(query: string, content: string): number {
  const wordSim = calculateTextSimilarity(query, content);
  const ngramSim = ngramSimilarity(query, content);
  
  // Weight n-gram higher for better phrase matching
  return wordSim * 0.4 + ngramSim * 0.6;
}

/**
 * Enhanced semantic recall with embedding similarity
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
    // Parallel fetch from all tiers
    let hotBuilder = tiers.includes('hot')
      ? supabase
          .from('brain_memory_hot')
          .select('id, content, context, value_score, access_count, created_at, last_used')
          .order('value_score', { ascending: false })
          .limit(100)
      : null;
    if (hotBuilder && context) hotBuilder = hotBuilder.eq('context', context);

    let warmBuilder = tiers.includes('warm')
      ? supabase
          .from('brain_memory_warm')
          .select('id, content, context, value_score, access_count, created_at, last_accessed')
          .order('value_score', { ascending: false })
          .limit(100)
      : null;
    if (warmBuilder && context) warmBuilder = warmBuilder.eq('context', context);

    let coldBuilder = tiers.includes('cold')
      ? supabase
          .from('brain_memory_cold')
          .select('id, summary, tags, value_score, access_count, created_at, last_accessed')
          .order('value_score', { ascending: false })
          .limit(100)
      : null;
    if (coldBuilder && context) coldBuilder = coldBuilder.contains('tags', { context });

    let glacierBuilder = tiers.includes('glacier')
      ? supabase
          .from('brain_memory_archive')
          .select('id, content, context, tags, value_score, access_count, created_at')
          .order('value_score', { ascending: false })
          .limit(50)
      : null;
    if (glacierBuilder && context) glacierBuilder = glacierBuilder.eq('context', context);
    
    const [hotResult, warmResult, coldResult, glacierResult] = await Promise.all([
      hotBuilder ? hotBuilder : Promise.resolve({ data: [] }),
      warmBuilder ? warmBuilder : Promise.resolve({ data: [] }),
      coldBuilder ? coldBuilder : Promise.resolve({ data: [] }),
      glacierBuilder ? glacierBuilder : Promise.resolve({ data: [] }),
    ]);
    
    // Process hot tier
    const hotData = hotResult.data || [];
    for (const item of hotData) {
      const similarity = calculateCombinedSimilarity(query, item.content || '');
      if (similarity >= minSimilarity) {
        let adjustedSimilarity = similarity;
        
        // Boost recent memories
        if (boostRecent && item.last_used) {
          const hoursSince = (Date.now() - new Date(item.last_used).getTime()) / 3600000;
          adjustedSimilarity *= 1 + Math.max(0, (24 - hoursSince) / 48);
        }
        
        results.push({
          id: item.id,
          content: item.content,
          tier: 'hot',
          similarity: adjustedSimilarity,
          context: item.context,
          valueScore: item.value_score || 0,
          accessCount: item.access_count || 0,
        });
      }
    }
    
    // Process warm tier
    const warmData = warmResult.data || [];
    for (const item of warmData) {
      const similarity = calculateCombinedSimilarity(query, item.content || '');
      if (similarity >= minSimilarity) {
        results.push({
          id: item.id,
          content: item.content,
          tier: 'warm',
          similarity,
          context: item.context,
          valueScore: item.value_score || 0,
          accessCount: item.access_count || 0,
        });
      }
    }
    
    // Process cold tier
    const coldData = coldResult.data || [];
    for (const item of coldData) {
      const similarity = calculateCombinedSimilarity(query, item.summary || '');
      if (similarity >= minSimilarity) {
        results.push({
          id: item.id,
          content: item.summary,
          tier: 'cold',
          similarity,
          context: (item.tags as any)?.context,
          valueScore: item.value_score || 0,
          accessCount: item.access_count || 0,
        });
      }
    }
    
    // Process glacier tier
    const glacierData = glacierResult.data || [];
    for (const item of glacierData) {
      const similarity = calculateCombinedSimilarity(query, item.content || '');
      if (similarity >= minSimilarity) {
        results.push({
          id: item.id,
          content: item.content,
          tier: 'glacier',
          similarity: similarity * 0.85, // Slight penalty for archived memories
          context: item.context || (item.tags as any)?.context,
          valueScore: item.value_score || 0,
          accessCount: item.access_count || 0,
        });
      }
    }
    
    // Sort by similarity and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
      
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
    // Fetch the source memory
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
    
    // Find related memories
    const related = await semanticRecall({
      query: content,
      limit: limit + 1, // +1 to exclude self
      context,
      minSimilarity: 0.3,
    });
    
    // Exclude the source memory
    return related.filter(m => m.id !== memoryId).slice(0, limit);
    
  } catch (error) {
    console.error('Error finding related memories:', error);
    return [];
  }
}

/**
 * Memory cluster detection - finds groups of related memories
 */
export async function detectMemoryClusters(
  minClusterSize: number = 3,
  similarityThreshold: number = 0.4
): Promise<Array<{ theme: string; memories: SemanticMatch[] }>> {
  try {
    // Get recent hot memories
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
        id: memory.id,
        content: memory.content,
        tier: 'hot',
        similarity: 1,
        context: memory.context,
        valueScore: memory.value_score || 0,
        accessCount: memory.access_count || 0,
      }];
      assigned.add(memory.id);
      
      // Find similar memories
      for (const other of memories) {
        if (assigned.has(other.id)) continue;
        
        const similarity = calculateCombinedSimilarity(memory.content, other.content);
        if (similarity >= similarityThreshold) {
          cluster.push({
            id: other.id,
            content: other.content,
            tier: 'hot',
            similarity,
            context: other.context,
            valueScore: other.value_score || 0,
            accessCount: other.access_count || 0,
          });
          assigned.add(other.id);
        }
      }
      
      if (cluster.length >= minClusterSize) {
        // Extract theme from the cluster
        const words = cluster
          .flatMap(m => m.content.toLowerCase().split(/\s+/))
          .filter(w => w.length > 4);
        
        const wordFreq: Record<string, number> = {};
        words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
        
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
