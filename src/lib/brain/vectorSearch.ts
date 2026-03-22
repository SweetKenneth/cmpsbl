/**
 * CMPSBL® BRAIN — Vector Search
 * Semantic retrieval across hot, warm & cold memory tiers
 * 
 * OPTIMIZED: Uses shared wordMatchRelevance, parallelized all 4 tiers,
 * eliminated duplicate calculateRelevance implementations.
 */

import { supabase } from '@/integrations/supabase/client';
import { wordMatchRelevance } from './shared';

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
 * OPTIMIZED: Parallel fetch for all requested tiers instead of sequential fallback
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

  // Pre-compute query tokens once for all tiers
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return [];

  const nowMs = Date.now();

  // Build all tier queries — fetch all in parallel
  type TierConfig = { tier: 'hot' | 'warm' | 'cold' | 'glacier'; query: any; contentField: string; relevanceMult: number; minRel: number };
  const tiers: TierConfig[] = [];

  {
    let q = supabase.from('brain_memory_hot')
      .select('id, content, context, tags, value_score, last_used')
      .order('value_score', { ascending: false })
      .limit(limit * 2);
    if (context) q = q.eq('context', context);
    tiers.push({ tier: 'hot', query: q, contentField: 'content', relevanceMult: 1.0, minRel: minRelevance });
  }
  {
    let q = supabase.from('brain_memory_warm')
      .select('id, content, context, tags, value_score')
      .order('value_score', { ascending: false })
      .limit(limit * 2);
    if (context) q = q.eq('context', context);
    tiers.push({ tier: 'warm', query: q, contentField: 'content', relevanceMult: 1.0, minRel: minRelevance * 0.9 });
  }
  if (includeCold) {
    let q = supabase.from('brain_memory_cold')
      .select('id, summary, tags')
      .order('created_at', { ascending: false })
      .limit(limit * 2);
    if (context) q = q.contains('tags', { context });
    tiers.push({ tier: 'cold', query: q, contentField: 'summary', relevanceMult: 1.0, minRel: minRelevance * 0.8 });
  }
  if (includeGlacier) {
    tiers.push({
      tier: 'glacier',
      query: supabase.from('brain_memory_archive')
        .select('id, content, source_tier, archived_reason')
        .order('created_at', { ascending: false })
        .limit(limit * 3),
      contentField: 'content',
      relevanceMult: 0.85,
      minRel: minRelevance * 0.7,
    });
  }

  // Parallel fetch all tiers
  const responses = await Promise.all(tiers.map(t => t.query));

  const results: SearchResult[] = [];

  for (let i = 0; i < tiers.length; i++) {
    const { tier, contentField, relevanceMult, minRel } = tiers[i];
    const data = (responses[i] as any)?.data || [];

    for (const item of data) {
      const text = (item[contentField] || '').toLowerCase();
      let relevance = wordMatchRelevance(queryLower, queryWords, text) * relevanceMult;

      // Recency boost for hot tier
      if (tier === 'hot' && item.last_used) {
        const hoursSince = (nowMs - new Date(item.last_used).getTime()) / 3600000;
        if (hoursSince < 24) relevance *= 1 + (24 - hoursSince) / 48;
      }

      if (relevance < minRel) continue;

      results.push({
        id: item.id,
        content: item[contentField] || item.content || '',
        context: item.context || (item.tags as any)?.context || item.source_tier || 'unknown',
        relevance,
        tier,
        tags: item.tags as Record<string, any>,
      });
    }
  }

  results.sort((a, b) => b.relevance - a.relevance);
  return results.slice(0, limit);
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
    
    if (error || !data) return [];
    
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
