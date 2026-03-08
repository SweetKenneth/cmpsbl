/**
 * BRAIN Memory Index Engine
 * v10.9.0 ARCHITECT — Per-user indexed memory with causal graph,
 * contradiction detection, and vector-aware indexing
 */
 
import { supabase } from '@/integrations/supabase/client';

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
  causalEdges: CausalEdge[]; // #7
}

// Global index partitioned by user+agent
const userIndexes = new Map<string, UserIndex>();

function getUserKey(userId?: string, agentId?: string): string {
  return `${userId || 'global'}::${agentId || 'default'}`;
}

function getOrCreateUserIndex(userId?: string, agentId?: string): UserIndex {
  const key = getUserKey(userId, agentId);
  if (!userIndexes.has(key)) {
    userIndexes.set(key, {
      memories: new Map(),
      keywords: new Map(),
      contexts: new Map(),
      causalEdges: [],
    });
  }
  return userIndexes.get(key)!;
}

/**
 * Build/rebuild the memory index for a specific user+agent
 */
export async function buildIndex(userId?: string, agentId?: string): Promise<{ indexed: number; edges: number; duration: number }> {
  const startTime = Date.now();
  const idx = getOrCreateUserIndex(userId, agentId);
  
  idx.memories.clear();
  idx.keywords.clear();
  idx.contexts.clear();
  idx.causalEdges = [];
  
  let indexed = 0;
  
  const buildQuery = (table: string) => {
    let q = supabase.from(table as any).select('id, content, context, value_score, access_count, created_at');
    return q.order('value_score', { ascending: false });
  };

  type MemoryRow = { id: string; content: string; context: string; value_score?: number; access_count?: number; created_at: string; user_id?: string; agent_id?: string; memory_type?: string; decay_curve?: string };

  // Parallel fetch hot + warm memories
  const [{ data: hotRaw }, { data: warmRaw }] = await Promise.all([
    buildQuery('brain_memory_hot').limit(500),
    buildQuery('brain_memory_warm').limit(1000),
  ]);

  for (const memory of (hotRaw || []) as unknown as MemoryRow[]) {
    indexMemory(memory, 'hot', idx);
    indexed++;
  }
  for (const memory of (warmRaw || []) as unknown as MemoryRow[]) {
    indexMemory(memory, 'warm', idx);
    indexed++;
  }

  // #7: Load causal edges
  let edgeCount = 0;
  const edgeQuery = supabase.from('brain_knowledge_edges' as any)
    .select('source_memory_id, target_memory_id, relationship_type, strength, causal_direction');
  if (userId) edgeQuery.eq('user_id', userId);
  if (agentId) edgeQuery.eq('agent_id', agentId);
  
  const { data: edgesRaw } = await edgeQuery.limit(500);
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
  
  await supabase.from('brain_events').insert({
    module: 'brain',
    event_type: 'index.rebuilt',
    data: { indexed, edges: edgeCount, duration: Date.now() - startTime, userId, agentId } as unknown as Record<string, never>,
    outcome: 'success',
  });
  
  return { indexed, edges: edgeCount, duration: Date.now() - startTime };
}

function indexMemory(
  memory: { id: string; content: string; context: string; value_score?: number; access_count?: number; created_at: string; user_id?: string; agent_id?: string; memory_type?: string; decay_curve?: string },
  tier: 'hot' | 'warm' | 'cold' | 'archive',
  idx: UserIndex
): void {
  const keywords = extractKeywords(memory.content);
  
  const entry: IndexEntry = {
    id: `idx_${memory.id}`,
    memory_id: memory.id,
    tier,
    keywords,
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
    if (!idx.keywords.has(keyword)) idx.keywords.set(keyword, new Set());
    idx.keywords.get(keyword)!.add(memory.id);
  }
  
  if (!idx.contexts.has(memory.context)) idx.contexts.set(memory.context, new Set());
  idx.contexts.get(memory.context)!.add(memory.id);
}

/**
 * Search the memory index for a specific user+agent
 * #7: Includes causal graph traversal
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
  const queryKeywords = extractKeywords(query);
  const limit = options?.limit ?? 20;
  const minScore = options?.minScore ?? 0;
  
  const candidates = new Map<string, { score: number; matchType: 'exact' | 'keyword' | 'semantic' | 'causal' }>();
  
  // Exact match on context
  if (options?.context) {
    const contextMatches = idx.contexts.get(options.context);
    if (contextMatches) {
      for (const id of contextMatches) {
        candidates.set(id, { score: 1.0, matchType: 'exact' });
      }
    }
  }
  
  // Keyword matching
  for (const keyword of queryKeywords) {
    const matches = idx.keywords.get(keyword);
    if (matches) {
      for (const id of matches) {
        const existing = candidates.get(id);
        const keywordScore = 0.8 / queryKeywords.length;
        if (existing) {
          existing.score = Math.min(1, existing.score + keywordScore);
        } else {
          candidates.set(id, { score: keywordScore, matchType: 'keyword' });
        }
      }
    }
  }

  // #7: Causal graph traversal — find causally linked memories
  if (options?.includeCausal !== false) {
    const directMatches = new Set(candidates.keys());
    for (const edge of idx.causalEdges) {
      if (directMatches.has(edge.source_id) && !candidates.has(edge.target_id)) {
        candidates.set(edge.target_id, {
          score: edge.strength * 0.6,
          matchType: 'causal',
        });
      }
      if (directMatches.has(edge.target_id) && !candidates.has(edge.source_id)) {
        candidates.set(edge.source_id, {
          score: edge.strength * 0.5,
          matchType: 'causal',
        });
      }
    }
  }
  
  // Filter and sort
  const results: SearchResult[] = [];
  for (const [memoryId, match] of candidates) {
    const entry = idx.memories.get(memoryId);
    if (!entry) continue;
    if (options?.tier && entry.tier !== options.tier) continue;
    
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
 * #7: Add a causal edge between memories
 */
export async function addCausalEdge(
  sourceId: string,
  targetId: string,
  relationship: string,
  strength: number,
  causalDirection?: string,
  userId?: string,
  agentId?: string
): Promise<void> {
  const idx = getOrCreateUserIndex(userId, agentId);
  
  idx.causalEdges.push({
    source_id: sourceId,
    target_id: targetId,
    relationship,
    strength,
    causal_direction: causalDirection,
  });

  await supabase.from('brain_knowledge_edges' as any).insert({
    source_memory_id: sourceId,
    target_memory_id: targetId,
    relationship_type: relationship,
    strength,
    causal_direction: causalDirection,
    user_id: userId,
    agent_id: agentId,
  });
}

/**
 * Get index statistics for a specific user+agent
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

/** Extract keywords from text */
function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
    'had', 'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been',
    'this', 'that', 'with', 'they', 'from', 'what', 'which', 'their',
  ]);
  
  return [...new Set(words.filter(w => !stopWords.has(w)))];
}

/** Update access tracking for a memory */
export function trackAccess(memoryId: string, userId?: string, agentId?: string): void {
  const idx = getOrCreateUserIndex(userId, agentId);
  const entry = idx.memories.get(memoryId);
  if (entry) {
    entry.access_count++;
    entry.last_accessed = new Date().toISOString();
  }
}
