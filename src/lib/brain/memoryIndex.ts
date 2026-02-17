/**
 * BRAIN Memory Index Engine
 * v10.5.4 ARCHITECT — Fast memory lookup with semantic indexing
 */
 
 import { supabase } from '@/integrations/supabase/client';
 
 // Index entry
 export interface IndexEntry {
   id: string;
   memory_id: string;
   tier: 'hot' | 'warm' | 'cold';
   keywords: string[];
   context: string;
   value_score: number;
   last_accessed: string;
   access_count: number;
 }
 
 // Search result
 export interface SearchResult {
   entry: IndexEntry;
   relevance: number;
   match_type: 'exact' | 'keyword' | 'semantic';
 }
 
 // In-memory index for fast lookups
 const memoryIndex = new Map<string, IndexEntry>();
 const keywordIndex = new Map<string, Set<string>>(); // keyword -> memory_ids
 const contextIndex = new Map<string, Set<string>>(); // context -> memory_ids
 
 /**
  * Build/rebuild the memory index
  */
 export async function buildIndex(): Promise<{ indexed: number; duration: number }> {
   const startTime = Date.now();
   
   // Clear existing index
   memoryIndex.clear();
   keywordIndex.clear();
   contextIndex.clear();
   
   let indexed = 0;
   
   // Index hot memories
   const { data: hotMemories } = await supabase
     .from('brain_memory_hot')
     .select('id, content, context, value_score, access_count, created_at')
     .order('value_score', { ascending: false })
     .limit(500);
   
   for (const memory of hotMemories || []) {
     indexMemory(memory, 'hot');
     indexed++;
   }
   
   // Index warm memories
   const { data: warmMemories } = await supabase
     .from('brain_memory_warm')
     .select('id, content, context, value_score, access_count, created_at')
     .order('value_score', { ascending: false })
     .limit(1000);
   
   for (const memory of warmMemories || []) {
     indexMemory(memory, 'warm');
     indexed++;
   }
   
   // Log index build
   await supabase.from('brain_events').insert({
     module: 'brain',
     event_type: 'index.rebuilt',
     data: { indexed, duration: Date.now() - startTime } as unknown as Record<string, never>,
     outcome: 'success',
   });
   
   return { indexed, duration: Date.now() - startTime };
 }
 
 /**
  * Index a single memory
  */
 function indexMemory(
   memory: { id: string; content: string; context: string; value_score?: number; access_count?: number; created_at: string },
   tier: 'hot' | 'warm' | 'cold'
 ): void {
   // Extract keywords from content
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
   };
   
   // Add to main index
   memoryIndex.set(memory.id, entry);
   
   // Add to keyword index
   for (const keyword of keywords) {
     if (!keywordIndex.has(keyword)) {
       keywordIndex.set(keyword, new Set());
     }
     keywordIndex.get(keyword)!.add(memory.id);
   }
   
   // Add to context index
   if (!contextIndex.has(memory.context)) {
     contextIndex.set(memory.context, new Set());
   }
   contextIndex.get(memory.context)!.add(memory.id);
 }
 
 /**
  * Search the memory index
  */
 export function searchIndex(
   query: string,
   options?: {
     context?: string;
     tier?: 'hot' | 'warm' | 'cold';
     limit?: number;
     minScore?: number;
   }
 ): SearchResult[] {
   const queryKeywords = extractKeywords(query);
   const limit = options?.limit ?? 20;
   const minScore = options?.minScore ?? 0;
   
   const candidates = new Map<string, { score: number; matchType: 'exact' | 'keyword' | 'semantic' }>();
   
   // Exact match on context
   if (options?.context) {
     const contextMatches = contextIndex.get(options.context);
     if (contextMatches) {
       for (const id of contextMatches) {
         candidates.set(id, { score: 1.0, matchType: 'exact' });
       }
     }
   }
   
   // Keyword matching
   for (const keyword of queryKeywords) {
     const matches = keywordIndex.get(keyword);
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
   
   // Filter and sort results
   const results: SearchResult[] = [];
   
   for (const [memoryId, match] of candidates) {
     const entry = memoryIndex.get(memoryId);
     if (!entry) continue;
     
     // Apply tier filter
     if (options?.tier && entry.tier !== options.tier) continue;
     
     // Apply score filter
     const finalScore = match.score * entry.value_score;
     if (finalScore < minScore) continue;
     
     results.push({
       entry,
       relevance: Math.round(finalScore * 100) / 100,
       match_type: match.matchType,
     });
   }
   
   // Sort by relevance
   results.sort((a, b) => b.relevance - a.relevance);
   
   return results.slice(0, limit);
 }
 
 /**
  * Get index statistics
  */
 export function getIndexStats(): {
   total_entries: number;
   by_tier: Record<string, number>;
   by_context: Record<string, number>;
   unique_keywords: number;
 } {
   const byTier: Record<string, number> = { hot: 0, warm: 0, cold: 0 };
   const byContext: Record<string, number> = {};
   
   for (const entry of memoryIndex.values()) {
     byTier[entry.tier] = (byTier[entry.tier] || 0) + 1;
     byContext[entry.context] = (byContext[entry.context] || 0) + 1;
   }
   
   return {
     total_entries: memoryIndex.size,
     by_tier: byTier,
     by_context: byContext,
     unique_keywords: keywordIndex.size,
   };
 }
 
 /**
  * Extract keywords from text
  */
 function extractKeywords(text: string): string[] {
   // Tokenize and normalize
   const words = text
     .toLowerCase()
     .replace(/[^a-z0-9\s]/g, ' ')
     .split(/\s+/)
     .filter(w => w.length > 2);
   
   // Remove common stop words
   const stopWords = new Set([
     'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
     'had', 'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been',
     'this', 'that', 'with', 'they', 'from', 'what', 'which', 'their',
   ]);
   
   const keywords = words.filter(w => !stopWords.has(w));
   
   // Return unique keywords
   return [...new Set(keywords)];
 }
 
 /**
  * Update access tracking for a memory
  */
 export function trackAccess(memoryId: string): void {
   const entry = memoryIndex.get(memoryId);
   if (entry) {
     entry.access_count++;
     entry.last_accessed = new Date().toISOString();
   }
 }