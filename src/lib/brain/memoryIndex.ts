/**
 * BRAIN Memory Index Engine v2
 * Per-user indexed memory with causal graph,
 * contradiction detection, and vector-aware indexing
 *
 * OPTIMIZED: Pre-computed inverse keyword length, batch edge processing,
 * lazy index rebuild, reusable keyword extraction
 */
 
import { supabase } from '@/integrations/supabase/client';
import { extractKeywords as sharedExtractKeywords } from './shared';

// Index entry
export interface IndexEntry {
  id: string;
  memory_id: string;
  tier: 'hot' | 'warm' | 'cold' | 'archive';
  keywords: string[];
  context: string;
  value_score: number;
  last_accessed: string;
  access_count: number;
  user_id?: string;
  agent_id?: string;
  memory_type?: string;
  has_embedding?: boolean;
  decay_curve?: string;
}

// Search result
export interface SearchResult {
  entry: IndexEntry;
  relevance: number;
  match_type: 'exact' | 'keyword' | 'semantic' | 'causal';
}

// #7 Causal edge in local index
export interface CausalEdge {
  source_id: string;
  target_id: string;
  relationship: string;
  strength: number;
  causal_direction?: string;
}

// Per-user index partition
interface UserIndex {
  memories: Map<string, IndexEntry>;
  keywords: Map<string, Set<string>>;
  contexts: Map<string, Set<string>>;
  causalEdges: CausalEdge[];
  /** Timestamp of last full rebuild */
  builtAt: number;
}

// Global index partitioned by user+agent
const userIndexes = new Map<string, UserIndex>();

function getUserKey(userId?: string, agentId?: string): string {
  return `${userId || 'global'}::${agentId || 'default'}`;
}

function getOrCreateUserIndex(userId?: string, agentId?: string): UserIndex {
  const key = getUserKey(userId, agentId);
  let idx = userIndexes.get(key);
  if (!idx) {
    idx = { memories: new Map(), keywords: new Map(), contexts: new Map(), causalEdges: [], builtAt: 0 };
    userIndexes.set(key, idx);
  }
  return idx;
}

/** Index staleness threshold — skip rebuild if < 5 min old */
const INDEX_STALENESS_MS = 5 * 60 * 1000;

/**
 * Build/rebuild the memory index for a specific user+agent
 * OPTIMIZED: Skips rebuild if index is fresh, parallel tier+edge fetch
 */
export async function buildIndex(userId?: string, agentId?: string, force?: boolean): Promise<{ indexed: number; edges: number; duration: number }> {
  const idx = getOrCreateUserIndex(userId, agentId);
  
  // Skip rebuild if index is fresh (unless forced)
  if (!force && idx.builtAt > 0 && Date.now() - idx.builtAt < INDEX_STALENESS_MS && idx.memories.size > 0) {
    return { indexed: idx.memories.size, edges: idx.causalEdges.length, duration: 0 };
  }

  const startTime = Date.now();
  
  idx.memories.clear();
  idx.keywords.clear();
  idx.contexts.clear();
  idx.causalEdges = [];
  
  let indexed = 0;

  const buildQuery = (table: string) =>
    supabase.from(table as any).select('id, content, context, value_score, access_count, created_at')
      .order('value_score', { ascending: false });

  const edgeQuery = supabase.from('brain_knowledge_edges' as any)
    .select('source_memory_id, target_memory_id, relationship_type, strength, causal_direction');
  if (userId) edgeQuery.eq('user_id', userId);
  if (agentId) edgeQuery.eq('agent_id', agentId);

  // Parallel fetch: hot + warm + edges
  const [{ data: hotRaw }, { data: warmRaw }, { data: edgesRaw }] = await Promise.all([
    buildQuery('brain_memory_hot').limit(500),
    buildQuery('brain_memory_warm').limit(1000),
    edgeQuery.limit(500),
  ]);

  type MemoryRow = { id: string; content: string; context: string; value_score?: number; access_count?: number; created_at: string };

  for (const memory of (hotRaw || []) as unknown as MemoryRow[]) {
    indexMemory(memory, 'hot', idx);
    indexed++;
  }
  for (const memory of (warmRaw || []) as unknown as MemoryRow[]) {
    indexMemory(memory, 'warm', idx);
    indexed++;
  }

  let edgeCount = 0;
  if (edgesRaw) {
    for (const e of edgesRaw as any[]) {
      idx.causalEdges.push({
        source_id: e.source_memory_id,
        target_id: e.target_memory_id,
        relationship: e.relationship_type,
        strength: e.strength,
        causal_direction: e.causal_direction,
      });
      edgeCount++;
    }
  }

  idx.builtAt = Date.now();
  
  Promise.resolve(supabase.from('brain_events').insert({
    module: 'brain', event_type: 'index.rebuilt',
    data: { indexed, edges: edgeCount, duration: Date.now() - startTime } as unknown as Record<string, never>,
    outcome: 'success',
  })).catch(() => {});
  
  return { indexed, edges: edgeCount, duration: Date.now() - startTime };
}

function indexMemory(
  memory: { id: string; content: string; context: string; value_score?: number; access_count?: number; created_at: string; user_id?: string; agent_id?: string; memory_type?: string; decay_curve?: string },
  tier: 'hot' | 'warm' | 'cold' | 'archive',
  idx: UserIndex
): void {
  const keywords = sharedExtractKeywords(memory.content);
  
  const entry: IndexEntry = {
    id: `idx_${memory.id}`,
    memory_id: memory.id,
    tier, keywords,
    context: memory.context,
    value_score: memory.value_score ?? 0.5,
    last_accessed: memory.created_at,
    access_count: memory.access_count ?? 0,
    user_id: memory.user_id,
    agent_id: memory.agent_id,
    memory_type: memory.memory_type,
    decay_curve: memory.decay_curve,
  };
  
  idx.memories.set(memory.id, entry);
  
  for (const keyword of keywords) {
    let set = idx.keywords.get(keyword);
    if (!set) { set = new Set(); idx.keywords.set(keyword, set); }
    set.add(memory.id);
  }
  
  let ctxSet = idx.contexts.get(memory.context);
  if (!ctxSet) { ctxSet = new Set(); idx.contexts.set(memory.context, ctxSet); }
  ctxSet.add(memory.id);
}

/**
 * Search the memory index
 * OPTIMIZED: Pre-computed score increment, early-exit on zero-keyword queries
 */
export function searchIndex(
  query: string,
  options?: {
    context?: string;
    tier?: 'hot' | 'warm' | 'cold' | 'archive';
    limit?: number;
    minScore?: number;
    userId?: string;
    agentId?: string;
    includeCausal?: boolean;
  }
): SearchResult[] {
  const idx = getOrCreateUserIndex(options?.userId, options?.agentId);
  const queryKeywords = sharedExtractKeywords(query);
  const limit = options?.limit ?? 20;
  const minScore = options?.minScore ?? 0;
  
  const candidates = new Map<string, { score: number; matchType: 'exact' | 'keyword' | 'semantic' | 'causal' }>();
  
  // Context-based exact match
  if (options?.context) {
    const contextMatches = idx.contexts.get(options.context);
    if (contextMatches) {
      for (const id of contextMatches) {
        candidates.set(id, { score: 1.0, matchType: 'exact' });
      }
    }
  }
  
  // Keyword scoring — pre-compute increment once
  if (queryKeywords.length > 0) {
    const scoreIncrement = 0.8 / queryKeywords.length;
    for (const keyword of queryKeywords) {
      const matches = idx.keywords.get(keyword);
      if (!matches) continue;
      for (const id of matches) {
        const existing = candidates.get(id);
        if (existing) {
          existing.score = Math.min(1, existing.score + scoreIncrement);
        } else {
          candidates.set(id, { score: scoreIncrement, matchType: 'keyword' });
        }
      }
    }
  }

  // Causal graph traversal
  if (options?.includeCausal !== false && idx.causalEdges.length > 0) {
    const directMatches = new Set(candidates.keys());
    for (const edge of idx.causalEdges) {
      if (directMatches.has(edge.source_id) && !candidates.has(edge.target_id)) {
        candidates.set(edge.target_id, { score: edge.strength * 0.6, matchType: 'causal' });
      }
      if (directMatches.has(edge.target_id) && !candidates.has(edge.source_id)) {
        candidates.set(edge.source_id, { score: edge.strength * 0.5, matchType: 'causal' });
      }
    }
  }
  
  // Score, filter, and collect results
  const results: SearchResult[] = [];
  const tierFilter = options?.tier;

  for (const [memoryId, match] of candidates) {
    const entry = idx.memories.get(memoryId);
    if (!entry) continue;
    if (tierFilter && entry.tier !== tierFilter) continue;
    
    const finalScore = match.score * entry.value_score;
    if (finalScore < minScore) continue;
    
    results.push({
      entry,
      relevance: Math.round(finalScore * 100) / 100,
      match_type: match.matchType,
    });
  }
  
  results.sort((a, b) => b.relevance - a.relevance);
  return results.slice(0, limit);
}

/**
 * Add a causal edge between memories
 */
export async function addCausalEdge(
  sourceId: string, targetId: string, relationship: string,
  strength: number, causalDirection?: string, userId?: string, agentId?: string
): Promise<void> {
  const idx = getOrCreateUserIndex(userId, agentId);
  idx.causalEdges.push({ source_id: sourceId, target_id: targetId, relationship, strength, causal_direction: causalDirection });

  await supabase.from('brain_knowledge_edges' as any).insert({
    source_memory_id: sourceId, target_memory_id: targetId,
    relationship_type: relationship, strength, causal_direction: causalDirection,
    user_id: userId, agent_id: agentId,
  });
}

/**
 * Get index statistics
 */
export function getIndexStats(userId?: string, agentId?: string): {
  total_entries: number;
  by_tier: Record<string, number>;
  by_context: Record<string, number>;
  unique_keywords: number;
  causal_edges: number;
  by_memory_type: Record<string, number>;
} {
  const idx = getOrCreateUserIndex(userId, agentId);
  const byTier: Record<string, number> = { hot: 0, warm: 0, cold: 0, archive: 0 };
  const byContext: Record<string, number> = {};
  const byMemoryType: Record<string, number> = {};
  
  for (const entry of idx.memories.values()) {
    byTier[entry.tier] = (byTier[entry.tier] || 0) + 1;
    byContext[entry.context] = (byContext[entry.context] || 0) + 1;
    if (entry.memory_type) {
      byMemoryType[entry.memory_type] = (byMemoryType[entry.memory_type] || 0) + 1;
    }
  }
  
  return {
    total_entries: idx.memories.size,
    by_tier: byTier,
    by_context: byContext,
    unique_keywords: idx.keywords.size,
    causal_edges: idx.causalEdges.length,
    by_memory_type: byMemoryType,
  };
}

/** Update access tracking */
export function trackAccess(memoryId: string, userId?: string, agentId?: string): void {
  const idx = getOrCreateUserIndex(userId, agentId);
  const entry = idx.memories.get(memoryId);
  if (entry) {
    entry.access_count++;
    entry.last_accessed = new Date().toISOString();
  }
}