/**
 * BRAIN Memory Index Engine
 * v10.8.1 ARCHITECT — Per-user indexed memory with metacognitive awareness
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
}

// Search result
export interface SearchResult {
  entry: IndexEntry;
  relevance: number;
  match_type: 'exact' | 'keyword' | 'semantic';
}

// Per-user index partition
interface UserIndex {
  memories: Map<string, IndexEntry>;
  keywords: Map<string, Set<string>>;
  contexts: Map<string, Set<string>>;
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
    });
  }
  return userIndexes.get(key)!;
}

/**
 * Build/rebuild the memory index for a specific user+agent
 */
export async function buildIndex(userId?: string, agentId?: string): Promise<{ indexed: number; duration: number }> {
  const startTime = Date.now();
  const idx = getOrCreateUserIndex(userId, agentId);
  
  // Clear this user's index
  idx.memories.clear();
  idx.keywords.clear();
  idx.contexts.clear();
  
  let indexed = 0;
  
  // Build query filters
  const buildQuery = (table: string) => {
    let q = supabase.from(table as any).select('id, content, context, value_score, access_count, created_at, user_id, agent_id');
    if (userId) q = q.eq('user_id', userId);
    if (agentId) q = q.eq('agent_id', agentId);
    return q.order('value_score', { ascending: false });
  };

  type MemoryRow = { id: string; content: string; context: string; value_score?: number; access_count?: number; created_at: string; user_id?: string; agent_id?: string };

  // Index hot memories
  const { data: hotRaw } = await buildQuery('brain_memory_hot').limit(500);
  const hotMemories = (hotRaw || []) as unknown as MemoryRow[];
  for (const memory of hotMemories) {
    indexMemory(memory, 'hot', idx);
    indexed++;
  }
  
  // Index warm memories
  const { data: warmRaw } = await buildQuery('brain_memory_warm').limit(1000);
  const warmMemories = (warmRaw || []) as unknown as MemoryRow[];
  for (const memory of warmMemories) {
    indexMemory(memory, 'warm', idx);
    indexed++;
  }
  
  // Log index build
  await supabase.from('brain_events').insert({
    module: 'brain',
    event_type: 'index.rebuilt',
    data: { indexed, duration: Date.now() - startTime, userId, agentId } as unknown as Record<string, never>,
    outcome: 'success',
  });
  
  return { indexed, duration: Date.now() - startTime };
}

/**
 * Index a single memory into a user partition
 */
function indexMemory(
  memory: { id: string; content: string; context: string; value_score?: number; access_count?: number; created_at: string; user_id?: string; agent_id?: string },
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
  }
): SearchResult[] {
  const idx = getOrCreateUserIndex(options?.userId, options?.agentId);
  const queryKeywords = extractKeywords(query);
  const limit = options?.limit ?? 20;
  const minScore = options?.minScore ?? 0;
  
  const candidates = new Map<string, { score: number; matchType: 'exact' | 'keyword' | 'semantic' }>();
  
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
 * Get index statistics for a specific user+agent
 */
export function getIndexStats(userId?: string, agentId?: string): {
  total_entries: number;
  by_tier: Record<string, number>;
  by_context: Record<string, number>;
  unique_keywords: number;
} {
  const idx = getOrCreateUserIndex(userId, agentId);
  const byTier: Record<string, number> = { hot: 0, warm: 0, cold: 0, archive: 0 };
  const byContext: Record<string, number> = {};
  
  for (const entry of idx.memories.values()) {
    byTier[entry.tier] = (byTier[entry.tier] || 0) + 1;
    byContext[entry.context] = (byContext[entry.context] || 0) + 1;
  }
  
  return {
    total_entries: idx.memories.size,
    by_tier: byTier,
    by_context: byContext,
    unique_keywords: idx.keywords.size,
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
