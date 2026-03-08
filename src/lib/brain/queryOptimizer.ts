 /**
  * BRAIN Query Optimizer
  * v7.5.0 — Intelligent memory query planning and caching
  */
 
 import { supabase } from '@/integrations/supabase/client';
 
 // Query execution plan
 export interface QueryPlan {
   planId: string;
   strategy: 'index_scan' | 'full_scan' | 'hybrid' | 'cached';
   estimatedCost: number;
   estimatedRows: number;
   indexes_used: string[];
   cache_hit: boolean;
   parallelizable: boolean;
 }
 
 // Query cache entry
 interface CacheEntry {
   result: unknown;
   timestamp: number;
   hits: number;
   cost: number;
 }
 
 // Query statistics
 export interface QueryStats {
   totalQueries: number;
   cacheHits: number;
   cacheMisses: number;
   avgExecutionMs: number;
   slowQueries: number;
   indexUsage: Record<string, number>;
 }
 
 // In-memory query cache with LRU eviction
 const queryCache = new Map<string, CacheEntry>();
 const MAX_CACHE_SIZE = 500;
 const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
 
 // Query statistics
 let queryStats: QueryStats = {
   totalQueries: 0,
   cacheHits: 0,
   cacheMisses: 0,
   avgExecutionMs: 0,
   slowQueries: 0,
   indexUsage: {},
 };
 
 /**
  * Generate a cache key for a query
  */
 function generateCacheKey(query: string, params: Record<string, unknown>): string {
   return `${query}:${JSON.stringify(params)}`;
 }
 
 /**
  * Evict oldest entries when cache is full
  */
 function evictOldestEntries(): void {
   if (queryCache.size >= MAX_CACHE_SIZE) {
     const entries = Array.from(queryCache.entries())
       .sort((a, b) => a[1].timestamp - b[1].timestamp);
     
     const toEvict = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
     toEvict.forEach(([key]) => queryCache.delete(key));
   }
 }
 
 /**
  * Plan a memory query for optimal execution
  */
 export function planQuery(
   query: string,
   options?: {
     tiers?: ('hot' | 'warm' | 'cold')[];
     limit?: number;
     useCache?: boolean;
   }
 ): QueryPlan {
   const cacheKey = generateCacheKey(query, options || {});
   const cached = queryCache.get(cacheKey);
   
   if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
     return {
       planId: `plan_${Date.now()}`,
       strategy: 'cached',
       estimatedCost: 0.1,
       estimatedRows: Array.isArray(cached.result) ? cached.result.length : 1,
       indexes_used: [],
       cache_hit: true,
       parallelizable: false,
     };
   }
   
   // Analyze query complexity
   const hasWildcard = query.includes('*') || query.includes('%');
   const queryLength = query.length;
   const tiers = options?.tiers || ['hot', 'warm', 'cold'];
   
   let strategy: QueryPlan['strategy'] = 'index_scan';
   let estimatedCost = 1;
   
   if (hasWildcard && queryLength < 5) {
     strategy = 'full_scan';
     estimatedCost = 10 * tiers.length;
   } else if (tiers.length === 1) {
     strategy = 'index_scan';
     estimatedCost = 1;
   } else {
     strategy = 'hybrid';
     estimatedCost = 2 * tiers.length;
   }
   
   return {
     planId: `plan_${Date.now()}`,
     strategy,
     estimatedCost,
     estimatedRows: options?.limit || 100,
     indexes_used: strategy !== 'full_scan' ? ['content_idx', 'context_idx'] : [],
     cache_hit: false,
     parallelizable: tiers.length > 1,
   };
 }
 
 /**
  * Execute an optimized query with caching
  */
 export async function executeOptimizedQuery<T>(
   queryFn: () => Promise<T>,
   cacheKey: string,
   options?: { ttlMs?: number; forceRefresh?: boolean }
 ): Promise<{ result: T; fromCache: boolean; executionMs: number }> {
   const start = Date.now();
   queryStats.totalQueries++;
   
   // Check cache first
   if (!options?.forceRefresh) {
     const cached = queryCache.get(cacheKey);
     const ttl = options?.ttlMs || CACHE_TTL_MS;
     
     if (cached && Date.now() - cached.timestamp < ttl) {
       queryStats.cacheHits++;
       cached.hits++;
       return {
         result: cached.result as T,
         fromCache: true,
         executionMs: Date.now() - start,
       };
     }
   }
   
   queryStats.cacheMisses++;
   
   // Execute query
   const result = await queryFn();
   const executionMs = Date.now() - start;
   
   // Update stats
   queryStats.avgExecutionMs = 
     (queryStats.avgExecutionMs * (queryStats.totalQueries - 1) + executionMs) / 
     queryStats.totalQueries;
   
   if (executionMs > 1000) {
     queryStats.slowQueries++;
   }
   
   // Cache result
   evictOldestEntries();
   queryCache.set(cacheKey, {
     result,
     timestamp: Date.now(),
     hits: 0,
     cost: executionMs,
   });
   
   return { result, fromCache: false, executionMs };
 }
 
 /**
  * Pre-warm cache with common queries
  */
 export async function prewarmCache(queries: Array<{
   key: string;
   fn: () => Promise<unknown>;
 }>): Promise<{ warmed: number; failed: number }> {
   let warmed = 0;
   let failed = 0;
   
  const results = await Promise.allSettled(
    queries.map(query => executeOptimizedQuery(query.fn, query.key))
  );
  for (const r of results) {
    if (r.status === 'fulfilled') warmed++;
    else failed++;
  }
   
   return { warmed, failed };
 }
 
 /**
  * Invalidate cache entries by pattern
  */
 export function invalidateCache(pattern?: string): number {
   if (!pattern) {
     const count = queryCache.size;
     queryCache.clear();
     return count;
   }
   
   let invalidated = 0;
   for (const key of queryCache.keys()) {
     if (key.includes(pattern)) {
       queryCache.delete(key);
       invalidated++;
     }
   }
   
   return invalidated;
 }
 
 /**
  * Get query optimizer statistics
  */
 export function getQueryStats(): QueryStats & { cacheSize: number; hitRate: number } {
   const total = queryStats.cacheHits + queryStats.cacheMisses;
   return {
     ...queryStats,
     cacheSize: queryCache.size,
     hitRate: total > 0 ? queryStats.cacheHits / total : 0,
   };
 }
 
 /**
  * Analyze query patterns for optimization recommendations
  */
 export function analyzeQueryPatterns(): {
   recommendations: string[];
   hotQueries: Array<{ key: string; hits: number }>;
   slowPatterns: string[];
 } {
   const recommendations: string[] = [];
   const hotQueries: Array<{ key: string; hits: number }> = [];
   const slowPatterns: string[] = [];
   
   // Find hot queries
   for (const [key, entry] of queryCache.entries()) {
     if (entry.hits > 10) {
       hotQueries.push({ key: key.substring(0, 50), hits: entry.hits });
     }
     if (entry.cost > 1000) {
       slowPatterns.push(key.substring(0, 50));
     }
   }
   
   // Generate recommendations
    const totalCacheOps = queryStats.cacheHits + queryStats.cacheMisses;
    if (totalCacheOps > 0 && queryStats.cacheHits / totalCacheOps < 0.5) {
      recommendations.push('Consider increasing cache TTL for frequently accessed data');
    }
   
   if (queryStats.slowQueries > queryStats.totalQueries * 0.1) {
     recommendations.push('Review slow queries - consider adding indexes');
   }
   
   if (hotQueries.length > MAX_CACHE_SIZE * 0.8) {
     recommendations.push('Increase cache size to accommodate hot query patterns');
   }
   
   return { recommendations, hotQueries, slowPatterns };
 }
 
 /**
  * Reset query statistics
  */
 export function resetQueryStats(): void {
   queryStats = {
     totalQueries: 0,
     cacheHits: 0,
     cacheMisses: 0,
     avgExecutionMs: 0,
     slowQueries: 0,
     indexUsage: {},
   };
 }