/**
 * CMPSBL® BRAIN — Vector Search
 * Semantic retrieval across hot, warm & cold memory tiers
 */

import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  content: string;
  context: string;
  relevance: number;
  tier: 'hot' | 'warm' | 'cold' | 'glacier';
  tags?: Record<string, any>;
}

/**
 * Search across all four memory tiers (hot → warm → cold → glacier)
 * Optimized: parallel tier fetching for hot+warm, sequential fallback for cold+glacier
 */
export async function searchMemory(
  query: string,
  options: {
    limit?: number;
    minRelevance?: number;
    context?: string;
    includeCold?: boolean;
    includeGlacier?: boolean;
  } = {}
): Promise<SearchResult[]> {
  const {
    limit = 10,
    minRelevance = 0.7,
    context,
    includeCold = true,
    includeGlacier = false,
  } = options;
  
  // Parallel fetch hot + warm (most common path)
  const [hotResults, warmResults] = await Promise.all([
    searchTier('brain_memory_hot', 'hot', query, { limit, minRelevance, context }),
    searchTier('brain_memory_warm', 'warm', query, { limit, minRelevance: minRelevance * 0.9, context }),
  ]);
  
  let results: SearchResult[] = [...hotResults, ...warmResults];

  // Only fetch deeper tiers if we haven't filled the limit
  if (includeCold && results.length < limit) {
    const coldResults = await searchColdTier(query, {
      limit: limit - results.length,
      minRelevance: minRelevance * 0.8,
      context,
    });
    results.push(...coldResults);
  }
  
  // Glacier tier — only on explicit request or if still under limit
  if (includeGlacier && results.length < limit) {
    const glacierResults = await searchGlacierTier(query, {
      limit: limit - results.length,
      minRelevance: minRelevance * 0.7,
    });
    results.push(...glacierResults);
  }
  
  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);
  
  return results.slice(0, limit);
}

/**
 * Search hot or warm memory tier
 */
async function searchTier(
  table: 'brain_memory_hot' | 'brain_memory_warm',
  tier: 'hot' | 'warm',
  query: string,
  options: {
    limit: number;
    minRelevance: number;
    context?: string;
  }
): Promise<SearchResult[]> {
  try {
    const orderField = table === 'brain_memory_hot' ? 'last_used' : 'created_at';
    let queryBuilder = supabase
      .from(table)
      .select('id, content, context, tags, priority')
      .order('priority', { ascending: false })
      .order(orderField, { ascending: false })
      .limit(options.limit);
    
    if (options.context) {
      queryBuilder = queryBuilder.eq('context', options.context);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error || !data) {
      console.error(`${tier} tier search error:`, error);
      return [];
    }
    
    return data
      .map(memory => ({
        id: memory.id,
        content: memory.content,
        context: memory.context,
        relevance: calculateRelevance(query, memory.content),
        tier,
        tags: memory.tags as Record<string, any>,
      }))
      .filter(r => r.relevance >= options.minRelevance);
  } catch (err) {
    console.error(`Error searching ${tier} tier:`, err);
    return [];
  }
}

/**
 * Search cold memory tier
 */
async function searchColdTier(
  query: string,
  options: {
    limit: number;
    minRelevance: number;
    context?: string;
  }
): Promise<SearchResult[]> {
  try {
    let queryBuilder = supabase
      .from('brain_memory_cold')
      .select('id, summary, tags')
      .order('created_at', { ascending: false })
      .limit(options.limit * 2);
    
    if (options.context) {
      queryBuilder = queryBuilder.contains('tags', { context: options.context });
    }
    
    const { data, error } = await queryBuilder;
    
    if (error || !data) {
      console.error('Cold tier search error:', error);
      return [];
    }
    
    return data
      .map(memory => ({
        id: memory.id,
        content: memory.summary,
        context: (memory.tags as any)?.context || 'unknown',
        relevance: calculateRelevance(query, memory.summary),
        tier: 'cold' as const,
        tags: memory.tags as Record<string, any>,
      }))
      .filter(r => r.relevance >= options.minRelevance)
      .slice(0, options.limit);
  } catch (err) {
    console.error('Error searching cold tier:', err);
    return [];
  }
}

/**
 * Calculate relevance score between query and content
 */
function calculateRelevance(query: string, content: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const contentLower = content.toLowerCase();
  
  if (queryWords.length === 0) return 0;
  
  let matchCount = 0;
  let exactMatchBonus = 0;
  
  for (const word of queryWords) {
    if (contentLower.includes(word)) {
      matchCount++;
      
      if (contentLower.includes(query.toLowerCase())) {
        exactMatchBonus = 0.2;
      }
    }
  }
  
  const baseRelevance = matchCount / queryWords.length;
  return Math.min(baseRelevance + exactMatchBonus, 1.0);
}

/**
 * Update last_used timestamp for accessed memory
 */
export async function markMemoryAccessed(memoryId: string): Promise<void> {
  try {
    await supabase
      .from('brain_memory_hot')
      .update({ last_used: new Date().toISOString() })
      .eq('id', memoryId);
  } catch (err) {
    console.error('Error marking memory accessed:', err);
  }
}

/**
 * Get most frequently accessed memories
 */
export async function getTopAccessedMemories(limit: number = 100): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase
      .from('brain_memory_hot')
      .select('id, content, context, tags, priority, last_used')
      .order('last_used', { ascending: false })
      .limit(limit);
    
    if (error || !data) {
      return [];
    }
    
    return data.map(memory => ({
      id: memory.id,
      content: memory.content,
      context: memory.context || 'unknown',
      relevance: 1.0,
      tier: 'hot' as const,
      tags: memory.tags as Record<string, any>,
    }));
  } catch (err) {
    console.error('Error getting top accessed memories:', err);
    return [];
  }
}
