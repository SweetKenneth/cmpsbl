/**
 * Cognitive Memory Core
 * v10.5.4 — ARCHITECT Epoch: Unified Memory Lifecycle Module
 * 
 * Merges all memory operations into a single authoritative module:
 * - Ingest: Capture raw input from all sources
 * - Store: Persist to appropriate tier (hot/warm/cold)
 * - Index: Build knowledge graph connections
 * - Reflect: Generate insights from accumulated memories
 * - Retrieve: Multi-strategy recall with semantic search
 * 
 * Backward-compatible aliases for legacy remember/recall/reflect commands.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type MemoryTier = 'hot' | 'warm' | 'cold';
export type MemoryState = 'short_term' | 'long_term' | 'latent';
export type MemoryType = 
  | 'doctrine' 
  | 'doctrine_integrated' 
  | 'reflection' 
  | 'preference' 
  | 'conversation' 
  | 'dream' 
  | 'general'
  | 'insight'
  | 'template'
  | 'heuristic'
  | 'error_pattern';

export type LifecycleStage = 'ingest' | 'store' | 'index' | 'reflect' | 'retrieve';

export interface MemoryEntry {
  id?: string;
  content: string;
  memory_type: MemoryType;
  tier: MemoryTier;
  state: MemoryState;
  confidence: number;
  access_count: number;
  importance_score: number;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at?: string;
  last_accessed?: string;
  source?: string;
}

export interface MemoryQuery {
  query: string;
  tier?: MemoryTier;
  type?: MemoryType;
  limit?: number;
  threshold?: number;
  strategy?: 'fulltext' | 'semantic' | 'pattern' | 'hybrid';
}

export interface MemoryStateSchema {
  short_term: {
    capacity: number;
    current: number;
    ttl_seconds: number;
  };
  long_term: {
    hot: { capacity: number; current: number };
    warm: { capacity: number; current: number };
    cold: { capacity: number; current: number };
  };
  latent: {
    pending_reflection: number;
    pending_consolidation: number;
  };
}

export interface LifecycleResult {
  stage: LifecycleStage;
  success: boolean;
  memory_id?: string;
  memories?: MemoryEntry[];
  insights?: string[];
  error?: string;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY CORE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class MemoryCoreClient {
  private static instance: MemoryCoreClient;

  private constructor() {}

  static getInstance(): MemoryCoreClient {
    if (!MemoryCoreClient.instance) {
      MemoryCoreClient.instance = new MemoryCoreClient();
    }
    return MemoryCoreClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 1: INGEST
  // Capture raw input from all sources
  // ═══════════════════════════════════════════════════════════════════════════

  async ingest(
    content: string,
    options: {
      type?: MemoryType;
      source?: string;
      confidence?: number;
      tags?: string[];
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<LifecycleResult> {
    const {
      type = 'general',
      source = 'memory_core',
      confidence = 0.7,
      tags = [],
      metadata = {},
    } = options;

    try {
      // Calculate initial importance based on content characteristics
      const importance = this.calculateImportance(content, type, confidence);
      const tier = this.determineTier(importance);
      const state = this.determineState(tier);

      const entry: Partial<MemoryEntry> = {
        content,
        memory_type: type,
        tier,
        state,
        confidence,
        access_count: 0,
        importance_score: importance,
        tags: [...tags, 'ingested'],
        metadata: { ...metadata, source, ingested_at: new Date().toISOString() },
      };

      // Store to appropriate table
      const result = await this.store(entry);

      return {
        stage: 'ingest',
        success: result.success,
        memory_id: result.memory_id,
        metadata: { tier, importance, state },
      };
    } catch (error) {
      return {
        stage: 'ingest',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 2: STORE
  // Persist to appropriate tier
  // ═══════════════════════════════════════════════════════════════════════════

  async store(entry: Partial<MemoryEntry>): Promise<LifecycleResult> {
    try {
      const tier = entry.tier || 'warm';

      // Prepare data for insertion
      const insertData = {
        content: entry.content,
        memory_type: entry.memory_type || 'general',
        confidence: entry.confidence || 0.7,
        importance_score: entry.importance_score || 0.5,
        access_count: entry.access_count || 0,
        tags: entry.tags || [],
        metadata: entry.metadata || {},
        source: (entry.metadata?.source as string) || 'memory_core',
      };

      // Use type assertion for dynamic table access
      let memoryId: string | undefined;

      if (tier === 'hot') {
        const { data, error } = await supabase
          .from('brain_memory_hot')
          .insert(insertData as any)
          .select('id')
          .single();
        if (error) throw error;
        memoryId = data?.id;
      } else if (tier === 'warm') {
        const { data, error } = await supabase
          .from('brain_memory_warm')
          .insert(insertData as any)
          .select('id')
          .single();
        if (error) throw error;
        memoryId = data?.id;
      } else {
        const { data, error } = await supabase
          .from('brain_memory_cold')
          .insert(insertData as any)
          .select('id')
          .single();
        if (error) throw error;
        memoryId = data?.id;
      }

      return {
        stage: 'store',
        success: true,
        memory_id: memoryId,
        metadata: { tier },
      };
    } catch (error) {
      return {
        stage: 'store',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 3: INDEX
  // Build knowledge graph connections
  // ═══════════════════════════════════════════════════════════════════════════

  async index(memoryId: string, options: {
    connectTo?: string[];
    relationType?: 'semantic' | 'causal' | 'temporal' | 'hierarchical' | 'associative';
    weight?: number;
  } = {}): Promise<LifecycleResult> {
    try {
      const { connectTo = [], relationType = 'associative', weight = 0.5 } = options;

      // Create graph edges if connections specified
      if (connectTo.length > 0) {
        const edges = connectTo.map(targetId => ({
          source_id: memoryId,
          target_id: targetId,
          relation_type: relationType,
          weight,
          created_at: new Date().toISOString(),
        }));

        // Try to insert edges, gracefully handle if table doesn't exist
        try {
          await supabase
            .from('brain_graph_edges')
            .insert(edges as any);
        } catch {
          console.warn('Graph indexing: Failed to insert edges');
        }
      }

      // Log indexing event to brain_events
      try {
        await supabase.from('brain_events').insert({
          event_type: 'memory_indexed',
          module: 'brain',
          metadata: { memory_id: memoryId, connections: connectTo.length, relation: relationType },
        } as any);
      } catch {
        // Event logging is non-critical
      }

      return {
        stage: 'index',
        success: true,
        memory_id: memoryId,
        metadata: { connections: connectTo.length, relationType },
      };
    } catch (error) {
      return {
        stage: 'index',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 4: REFLECT
  // Generate insights from accumulated memories
  // ═══════════════════════════════════════════════════════════════════════════

  async reflect(options: {
    scope?: 'session' | 'daily' | 'weekly';
    depth?: 'shallow' | 'standard' | 'deep';
    minConfidence?: number;
  } = {}): Promise<LifecycleResult> {
    const { scope = 'session', depth = 'standard', minConfidence = 0.5 } = options;

    try {
      // Get recent memories for reflection
      const limitMap = { shallow: 20, standard: 50, deep: 100 };
      const limit = limitMap[depth];

      const { data: memories, error } = await supabase
        .from('brain_memory_hot')
        .select('*')
        .gte('confidence', minConfidence)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Generate reflection insights
      const insights = this.synthesizeInsights(memories || [], scope);

      // Store reflection as a new memory
      if (insights.length > 0) {
        const reflectionContent = `[${scope.toUpperCase()} REFLECTION]\n${insights.join('\n')}`;
        
        await this.ingest(reflectionContent, {
          type: 'reflection',
          source: 'memory_core.reflect',
          confidence: 0.85,
          tags: ['reflection', scope, depth],
          metadata: { scope, depth, source_count: memories?.length || 0 },
        });
      }

      // Log reflection event
      try {
        await supabase.from('brain_events').insert({
          event_type: 'reflection_completed',
          module: 'brain',
          metadata: { scope, depth, insights_generated: insights.length, memories_processed: memories?.length || 0 },
        } as any);
      } catch {
        // Event logging is non-critical
      }

      return {
        stage: 'reflect',
        success: true,
        insights,
        metadata: { scope, depth, processed: memories?.length || 0 },
      };
    } catch (error) {
      return {
        stage: 'reflect',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 5: RETRIEVE
  // Multi-strategy recall with semantic search
  // ═══════════════════════════════════════════════════════════════════════════

  async retrieve(query: MemoryQuery): Promise<LifecycleResult> {
    const { 
      query: queryText, 
      tier, 
      type, 
      limit = 10, 
      threshold = 0.3,
      strategy = 'hybrid' 
    } = query;

    try {
      const results: MemoryEntry[] = [];

      // Determine which tables to search
      const tablesToSearch = tier 
        ? [this.getTableForTier(tier)] 
        : ['brain_memory_hot', 'brain_memory_warm', 'brain_memory_cold'];

      // Strategy 1: Full-text search (PostgreSQL websearch)
      if (strategy === 'fulltext' || strategy === 'hybrid') {
        for (const table of tablesToSearch) {
          try {
            const { data } = await this.queryTable(table, queryText, 'fulltext', Math.ceil(limit / tablesToSearch.length));
            if (data) results.push(...this.mapToMemoryEntry(data, table));
          } catch {
            // Continue with other tables
          }
        }
      }

      // Strategy 2: Pattern matching (ILIKE)
      if (strategy === 'pattern' || strategy === 'hybrid') {
        for (const table of tablesToSearch) {
          try {
            const { data } = await this.queryTable(table, queryText, 'pattern', limit);
            if (data) {
              const mapped = this.mapToMemoryEntry(data, table);
              // Avoid duplicates
              for (const entry of mapped) {
                if (!results.find(r => r.id === entry.id)) {
                  results.push(entry);
                }
              }
            }
          } catch {
            // Continue with other tables
          }
        }
      }

      // Filter by type if specified
      let filtered = type 
        ? results.filter(r => r.memory_type === type)
        : results;

      // Filter by confidence threshold
      filtered = filtered.filter(r => r.confidence >= threshold);

      // Sort by importance and recency
      filtered.sort((a, b) => {
        const scoreA = (a.importance_score || 0) * 0.6 + (a.access_count || 0) * 0.1 + a.confidence * 0.3;
        const scoreB = (b.importance_score || 0) * 0.6 + (b.access_count || 0) * 0.1 + b.confidence * 0.3;
        return scoreB - scoreA;
      });

      // Limit results
      const finalResults = filtered.slice(0, limit);

      return {
        stage: 'retrieve',
        success: true,
        memories: finalResults,
        metadata: { 
          total_found: results.length, 
          returned: finalResults.length, 
          strategy,
          threshold 
        },
      };
    } catch (error) {
      return {
        stage: 'retrieve',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        memories: [],
      };
    }
  }

  // Helper for querying specific tables
  private async queryTable(table: string, queryText: string, strategy: 'fulltext' | 'pattern', limit: number): Promise<{ data: any[] | null }> {
    if (table === 'brain_memory_hot') {
      if (strategy === 'fulltext') {
        return supabase.from('brain_memory_hot').select('*').textSearch('content', queryText).limit(limit);
      }
      return supabase.from('brain_memory_hot').select('*').ilike('content', `%${queryText}%`).limit(limit);
    } else if (table === 'brain_memory_warm') {
      if (strategy === 'fulltext') {
        return supabase.from('brain_memory_warm').select('*').textSearch('content', queryText).limit(limit);
      }
      return supabase.from('brain_memory_warm').select('*').ilike('content', `%${queryText}%`).limit(limit);
    } else {
      if (strategy === 'fulltext') {
        return supabase.from('brain_memory_cold').select('*').textSearch('content', queryText).limit(limit);
      }
      return supabase.from('brain_memory_cold').select('*').ilike('content', `%${queryText}%`).limit(limit);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async getState(): Promise<MemoryStateSchema> {
    try {
      const [hotCount, warmCount, coldCount] = await Promise.all([
        supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
        supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
        supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
      ]);

      return {
        short_term: {
          capacity: 100,
          current: 0, // Session-based, not persisted
          ttl_seconds: 3600,
        },
        long_term: {
          hot: { capacity: 500, current: hotCount.count || 0 },
          warm: { capacity: 2000, current: warmCount.count || 0 },
          cold: { capacity: 10000, current: coldCount.count || 0 },
        },
        latent: {
          pending_reflection: 0,
          pending_consolidation: 0,
        },
      };
    } catch {
      return {
        short_term: { capacity: 100, current: 0, ttl_seconds: 3600 },
        long_term: {
          hot: { capacity: 500, current: 0 },
          warm: { capacity: 2000, current: 0 },
          cold: { capacity: 10000, current: 0 },
        },
        latent: { pending_reflection: 0, pending_consolidation: 0 },
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKWARD-COMPATIBLE ALIASES
  // ═══════════════════════════════════════════════════════════════════════════

  /** @deprecated Use ingest() instead */
  async remember(
    content: string,
    memory_type: MemoryType,
    confidence?: number,
    metadata?: Record<string, unknown>
  ): Promise<LifecycleResult> {
    return this.ingest(content, { type: memory_type, confidence, metadata, source: 'legacy.remember' });
  }

  /** @deprecated Use retrieve() instead */
  async recall(query: string, limit?: number): Promise<LifecycleResult> {
    return this.retrieve({ query, limit, strategy: 'hybrid' });
  }

  /** @deprecated Use reflect() instead */
  async reflectLegacy(): Promise<LifecycleResult> {
    return this.reflect({ scope: 'daily', depth: 'standard' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL LIFECYCLE ORCHESTRATION
  // ═══════════════════════════════════════════════════════════════════════════

  async runFullCycle(content: string, options: {
    type?: MemoryType;
    source?: string;
    tags?: string[];
    autoIndex?: boolean;
    autoReflect?: boolean;
  } = {}): Promise<{ ingest: LifecycleResult; index?: LifecycleResult; reflect?: LifecycleResult }> {
    const { autoIndex = true, autoReflect = false, ...ingestOptions } = options;

    // Stage 1: Ingest
    const ingestResult = await this.ingest(content, ingestOptions);

    const result: { ingest: LifecycleResult; index?: LifecycleResult; reflect?: LifecycleResult } = {
      ingest: ingestResult,
    };

    // Stage 2: Index (if enabled and ingest succeeded)
    if (autoIndex && ingestResult.success && ingestResult.memory_id) {
      result.index = await this.index(ingestResult.memory_id);
    }

    // Stage 3: Reflect (if enabled)
    if (autoReflect) {
      result.reflect = await this.reflect({ scope: 'session', depth: 'shallow' });
    }

    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private calculateImportance(content: string, type: MemoryType, confidence: number): number {
    let score = confidence * 0.4;

    // Type-based scoring
    const typeScores: Record<MemoryType, number> = {
      doctrine: 0.9,
      doctrine_integrated: 0.95,
      reflection: 0.8,
      preference: 0.6,
      conversation: 0.4,
      dream: 0.7,
      general: 0.5,
      insight: 0.75,
      template: 0.7,
      heuristic: 0.65,
      error_pattern: 0.6,
    };
    score += (typeScores[type] || 0.5) * 0.3;

    // Content length factor (longer = potentially more important, with cap)
    const lengthFactor = Math.min(1, content.length / 1000);
    score += lengthFactor * 0.15;

    // Keyword detection (simple heuristic)
    const importantKeywords = ['critical', 'important', 'must', 'always', 'never', 'error', 'security'];
    const hasKeywords = importantKeywords.some(k => content.toLowerCase().includes(k));
    if (hasKeywords) score += 0.15;

    return Math.min(1, Math.max(0, score));
  }

  private determineTier(importance: number): MemoryTier {
    if (importance > 0.6) return 'hot';
    if (importance > 0.35) return 'warm';
    return 'cold';
  }

  private determineState(tier: MemoryTier): MemoryState {
    if (tier === 'hot') return 'short_term';
    if (tier === 'warm') return 'long_term';
    return 'latent';
  }

  private getTableForTier(tier: MemoryTier): string {
    const tableMap: Record<MemoryTier, string> = {
      hot: 'brain_memory_hot',
      warm: 'brain_memory_warm',
      cold: 'brain_memory_cold',
    };
    return tableMap[tier];
  }

  private mapToMemoryEntry(data: any[], table: string): MemoryEntry[] {
    const tierFromTable = (t: string): MemoryTier => {
      if (t.includes('hot')) return 'hot';
      if (t.includes('warm')) return 'warm';
      return 'cold';
    };

    return data.map(d => ({
      id: d.id,
      content: d.content,
      memory_type: d.memory_type || 'general',
      tier: tierFromTable(table),
      state: d.state || this.determineState(tierFromTable(table)),
      confidence: d.confidence || 0.5,
      access_count: d.access_count || 0,
      importance_score: d.importance_score || 0.5,
      tags: d.tags || [],
      metadata: d.metadata || {},
      created_at: d.created_at,
      last_accessed: d.last_accessed || d.last_used,
      source: d.source,
    }));
  }

  private synthesizeInsights(memories: any[], scope: string): string[] {
    if (memories.length === 0) return [];

    const insights: string[] = [];

    // Group by type
    const byType: Record<string, any[]> = {};
    for (const m of memories) {
      const type = m.memory_type || 'general';
      byType[type] = byType[type] || [];
      byType[type].push(m);
    }

    // Generate insights per type
    for (const [type, items] of Object.entries(byType)) {
      if (items.length >= 3) {
        insights.push(`• Observed ${items.length} ${type} memories in this ${scope} cycle`);
      }
    }

    // Calculate average confidence
    const avgConfidence = memories.reduce((sum, m) => sum + (m.confidence || 0.5), 0) / memories.length;
    insights.push(`• Average memory confidence: ${(avgConfidence * 100).toFixed(1)}%`);

    // Identify high-priority items
    const highPriority = memories.filter(m => (m.importance_score || 0) > 0.7);
    if (highPriority.length > 0) {
      insights.push(`• ${highPriority.length} high-priority memories flagged for attention`);
    }

    return insights;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const memoryCore = MemoryCoreClient.getInstance();

// Re-export for convenience
export { MemoryCoreClient };
