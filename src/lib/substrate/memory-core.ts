/**
 * Cognitive Memory Core
 * Unified Memory Lifecycle Module
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

export type MemoryTier = 'hot' | 'warm' | 'cold' | 'glacier';
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
    glacier: { capacity: number; current: number };
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
// UNIFIED SALIENCE SCORER
// Single authoritative salience calculation used by all retrieval paths.
// Covers: confidence, frequency, user reinforcement, cross-module consensus,
//         recency decay, type weighting, attention focus — as a weighted composite.
// ═══════════════════════════════════════════════════════════════════════════════

export interface SalienceInput {
  /** Memory confidence score (0-1) */
  confidence: number;
  /** How many times this memory has been accessed */
  access_count: number;
  /** ISO timestamp of memory creation */
  created_at: string;
  /** ISO timestamp of last access/use (null = never re-accessed) */
  last_accessed?: string | null;
  /** Memory type for type-weighting */
  memory_type: MemoryType;
  /** Number of times user/system explicitly reinforced this memory (SM-2 repetitions) */
  reinforcement_count?: number;
  /** How many distinct modules have referenced this memory (BRAIN, DREAM, CLM, VISION, etc.) */
  cross_module_refs?: number;
  /** Current attention focus weight (0 = not focused, 1 = primary focus) */
  attention_weight?: number;
  /** Optional context string for keyword-relevance scoring */
  query_context?: string;
  /** The memory content (for keyword matching against query_context) */
  content?: string;
}

export interface SalienceResult {
  /** Final composite score 0-1 */
  score: number;
  /** Individual factor contributions (for debugging/telemetry) */
  factors: {
    confidence: number;
    recency: number;
    frequency: number;
    reinforcement: number;
    cross_module: number;
    type_weight: number;
    attention: number;
    relevance: number;
  };
}

/** Salience factor weights — tuned to balance recall vs precision */
const SALIENCE_WEIGHTS = {
  confidence:    0.20,  // How reliable is this memory?
  recency:       0.18,  // How recent? (exponential decay)
  frequency:     0.12,  // How often accessed?
  reinforcement: 0.15,  // User/system reinforcement (SM-2 signal)
  cross_module:  0.10,  // Cross-module consensus (DREAM, VISION, CLM agree)
  type_weight:   0.10,  // Intrinsic type importance
  attention:     0.08,  // Current attention focus boost
  relevance:     0.07,  // Keyword relevance to active query
};

/** Type-based intrinsic importance — how critical is this category of knowledge? */
const TYPE_IMPORTANCE: Record<MemoryType, number> = {
  doctrine: 0.95,
  doctrine_integrated: 1.0,
  template: 0.75,
  heuristic: 0.70,
  error_pattern: 0.65,
  preference: 0.60,
  reflection: 0.50,
  insight: 0.50,
  conversation: 0.40,
  dream: 0.35,
  general: 0.30,
};

/**
 * Unified salience calculation — the ONLY salience function in the substrate.
 * All retrieval paths (attention mechanism, brain enhancements, memory core)
 * MUST use this function instead of rolling their own.
 */
export function calculateSalience(input: SalienceInput): SalienceResult {
  // 1. Confidence (direct pass-through, clamped)
  const confidence = Math.min(1, Math.max(0, input.confidence));

  // 2. Recency decay — exponential decay with 30-day half-life
  const ageMs = Date.now() - new Date(input.created_at).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recency = Math.exp(-ageDays / 30);

  // 3. Frequency — logarithmic (diminishing returns past ~50 accesses)
  const frequency = Math.min(1, Math.log(Math.max(1, input.access_count) + 1) / Math.log(51));

  // 4. User reinforcement — SM-2 repetition signal with diminishing returns
  const reps = input.reinforcement_count ?? 0;
  const reinforcement = Math.min(1, reps > 0 ? 0.3 + 0.7 * (1 - Math.exp(-reps / 5)) : 0);

  // 5. Cross-module consensus — how many modules have independently referenced this?
  //    2+ modules agreeing is a strong signal; 4+ is near-certainty
  const refs = input.cross_module_refs ?? 0;
  const cross_module = Math.min(1, refs / 4);

  // 6. Type weighting
  const type_weight = TYPE_IMPORTANCE[input.memory_type] ?? 0.4;

  // 7. Attention focus boost
  const attention = Math.min(1, input.attention_weight ?? 0);

  // 8. Query relevance — keyword overlap if context provided
  let relevance = 0;
  if (input.query_context && input.content) {
    const queryWords = new Set(input.query_context.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    if (queryWords.size > 0) {
      const contentWords = input.content.toLowerCase().split(/\s+/);
      const overlap = contentWords.filter(w => queryWords.has(w)).length;
      relevance = Math.min(1, overlap / queryWords.size);
    }
  }

  // Weighted composite
  const score =
    confidence    * SALIENCE_WEIGHTS.confidence +
    recency       * SALIENCE_WEIGHTS.recency +
    frequency     * SALIENCE_WEIGHTS.frequency +
    reinforcement * SALIENCE_WEIGHTS.reinforcement +
    cross_module  * SALIENCE_WEIGHTS.cross_module +
    type_weight   * SALIENCE_WEIGHTS.type_weight +
    attention     * SALIENCE_WEIGHTS.attention +
    relevance     * SALIENCE_WEIGHTS.relevance;

  return {
    score: Math.min(1, Math.max(0, score)),
    factors: { confidence, recency, frequency, reinforcement, cross_module, type_weight, attention, relevance },
  };
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
      // ── Noise Gate ────────────────────────────────────────────────────────
      // Reject content that is too short, empty, or low-signal
      const trimmed = content.trim();
      if (trimmed.length < 20) {
        return { stage: 'ingest', success: false, error: 'Content too short (min 20 chars)' };
      }
      // Reject if content is mostly punctuation/whitespace (noise ratio > 60%)
      const alphaCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
      if (alphaCount / trimmed.length < 0.4) {
        return { stage: 'ingest', success: false, error: 'Content is mostly noise (low alpha ratio)' };
      }
      // Reject repetitive content (same 4-char chunk repeated > 5 times)
      const chunks = new Set<string>();
      for (let i = 0; i < Math.min(trimmed.length - 3, 200); i += 4) {
        chunks.add(trimmed.slice(i, i + 4).toLowerCase());
      }
      if (trimmed.length > 80 && chunks.size < 5) {
        return { stage: 'ingest', success: false, error: 'Content is repetitive' };
      }

      // ── Dedup Guard ──────────────────────────────────────────────────────
      // Check for similar content already in hot tier (trigram or prefix match)
      const contentPrefix = content.slice(0, 120);
      const sanitizedPrefix = contentPrefix.replace(/[%_\\]/g, '');
      const { data: existing } = await supabase
        .from('brain_memory_hot')
        .select('id, access_count')
        .ilike('content', `${sanitizedPrefix}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        // Duplicate found — boost existing instead of inserting
        const currentCount = (existing[0] as any).access_count ?? 0;
        await supabase
          .from('brain_memory_hot')
          .update({ access_count: currentCount + 1 })
          .eq('id', existing[0].id);

        return {
          stage: 'ingest',
          success: true,
          memory_id: existing[0].id,
          metadata: { deduplicated: true, existing_id: existing[0].id },
        };
      }

      // ── Capacity Guard ───────────────────────────────────────────────────
      // Calculate initial importance based on content characteristics
      const importance = this.calculateImportance(content, type, confidence);
      let tier = this.determineTier(importance);

      // If targeting hot, check capacity first
      if (tier === 'hot') {
        const { count } = await supabase
          .from('brain_memory_hot')
          .select('id', { count: 'exact', head: true });

        const HOT_CAPACITY = 500;
        if ((count ?? 0) >= HOT_CAPACITY * 0.8) {
          // Hot tier at/near capacity — downgrade to warm
          tier = 'warm';
          console.warn(`[MemoryCore] Hot tier at ${count}/${HOT_CAPACITY} — routing to warm`);
        }
      }

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

      // Use type assertion for dynamic table access
      let memoryId: string | undefined;

      if (tier === 'hot') {
        const insertData = {
          content: entry.content,
          memory_type: entry.memory_type || 'general',
          value_score: entry.confidence || 0.7,
          importance_score: entry.importance_score || 0.5,
          access_count: entry.access_count || 0,
          tags: entry.tags || [],
          metadata: entry.metadata || {},
          source_module: (entry.metadata?.source as string) || 'memory_core',
          category: (entry.metadata?.category as string) || 'general',
        };
        const { data, error } = await supabase
          .from('brain_memory_hot')
          .insert(insertData as any)
          .select('id')
          .single();
        if (error) throw error;
        memoryId = data?.id;
      } else if (tier === 'warm') {
        const insertData = {
          content: entry.content,
          memory_type: entry.memory_type || 'general',
          value_score: entry.confidence || 0.7,
          salience_score: entry.importance_score || 0.5,
          access_count: entry.access_count || 0,
          tags: entry.tags || [],
          metadata: entry.metadata || {},
          source_module: (entry.metadata?.source as string) || 'memory_core',
          category: (entry.metadata?.category as string) || 'general',
        };
        const { data, error } = await supabase
          .from('brain_memory_warm')
          .insert(insertData as any)
          .select('id')
          .single();
        if (error) throw error;
        memoryId = data?.id;
      } else {
        // Cold tier uses 'summary' not 'content', 'value_score' not 'confidence', 'source_module' not 'source'
        const insertData = {
          summary: entry.content || '',
          memory_type: entry.memory_type || 'general',
          value_score: entry.confidence || 0.7,
          salience_score: entry.importance_score || 0.5,
          access_count: entry.access_count || 0,
          tags: entry.tags || [],
          source_module: (entry.metadata?.source as string) || 'memory_core',
          category: (entry.metadata?.category as string) || 'general',
        };
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

      // Hot tier uses 'value_score' not 'confidence'
      const { data: memories, error } = await supabase
        .from('brain_memory_hot')
        .select('id, content, context, value_score, memory_type, tags, created_at, importance_score')
        .gte('value_score', minConfidence)
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
        : ['brain_memory_hot', 'brain_memory_warm', 'brain_memory_cold', 'brain_memory_archive'];

      // Build all query promises in parallel
      const strategies: ('fulltext' | 'pattern')[] = 
        strategy === 'hybrid' ? ['fulltext', 'pattern'] : [strategy === 'fulltext' ? 'fulltext' : 'pattern'];

      const queryPromises: Promise<{ data: any[] | null; table: string }>[] = [];
      for (const strat of strategies) {
        for (const table of tablesToSearch) {
          const perTableLimit = strat === 'fulltext' 
            ? Math.ceil(limit / tablesToSearch.length) 
            : limit;
          queryPromises.push(
            this.queryTable(table, queryText, strat, perTableLimit)
              .then(r => ({ data: r.data, table }))
              .catch(() => ({ data: null, table }))
          );
        }
      }

      const queryResults = await Promise.all(queryPromises);
      const seenIds = new Set<string>();

      for (const { data, table } of queryResults) {
        if (!data) continue;
        const mapped = this.mapToMemoryEntry(data, table);
        for (const entry of mapped) {
          if (!seenIds.has(entry.id!)) {
            seenIds.add(entry.id!);
            results.push(entry);
          }
        }
      }

      // Filter by type if specified
      let filtered = type 
        ? results.filter(r => r.memory_type === type)
        : results;

      // Filter by confidence threshold
      filtered = filtered.filter(r => r.confidence >= threshold);

      // Sort using unified salience scorer for consistency
      filtered.sort((a, b) => {
        const salienceA = calculateSalience({
          confidence: a.confidence,
          access_count: a.access_count,
          created_at: a.created_at || new Date().toISOString(),
          memory_type: a.memory_type,
          content: a.content,
          query_context: queryText,
        });
        const salienceB = calculateSalience({
          confidence: b.confidence,
          access_count: b.access_count,
          created_at: b.created_at || new Date().toISOString(),
          memory_type: b.memory_type,
          content: b.content,
          query_context: queryText,
        });
        return salienceB.score - salienceA.score;
      });

      // Limit results
      const finalResults = filtered.slice(0, limit);

      // ── Recall Feedback Bridge ─────────────────────────────────────────
      // Track recall hit/miss in brain_memory_meta for metacognitive tuning
      const hit = finalResults.length > 0;
      try {
        await supabase.rpc('track_memory_recall', {
          p_user_id: null,  // System-level recall
          p_agent_id: 'substrate',
          p_hit: hit,
        });
      } catch {
        // Metacognition tracking is non-critical
      }

      // Bump access timestamps on retrieved memories (fire-and-forget with error isolation)
      if (finalResults.length > 0) {
        const hotIds = finalResults.filter(m => m.tier === 'hot').map(m => m.id).filter(Boolean);
        const warmIds = finalResults.filter(m => m.tier === 'warm').map(m => m.id).filter(Boolean);
        
        const touchPromises: Promise<void>[] = [];
        if (hotIds.length > 0) {
          touchPromises.push(
            Promise.resolve(
              supabase.from('brain_memory_hot')
                .update({ last_used: new Date().toISOString() } as any)
                .in('id', hotIds)
            ).then(() => {})
          );
        }
        if (warmIds.length > 0) {
          touchPromises.push(
            Promise.resolve(
              supabase.from('brain_memory_warm')
                .update({ last_accessed: new Date().toISOString() } as any)
                .in('id', warmIds)
            ).then(() => {})
          );
        }
        // Await in parallel, catch all to prevent recall failure
        Promise.allSettled(touchPromises).catch(() => {});
      }

      return {
        stage: 'retrieve',
        success: true,
        memories: finalResults,
        metadata: { 
          total_found: results.length, 
          returned: finalResults.length, 
          strategy,
          threshold,
          recall_hit: hit,
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
    // Sanitize pattern input to prevent PostgREST injection
    const sanitized = queryText.replace(/[%_\\]/g, '');
    // Sanitize full-text search input — strip tsquery special chars
    const sanitizedFts = queryText.replace(/[!&|:*()\\<>'"]/g, ' ').trim();
    
    if (table === 'brain_memory_hot') {
      const cols = 'id, content, context, value_score, access_count, created_at, memory_type, tags, source_module, category, importance_score';
      if (strategy === 'fulltext' && sanitizedFts.length > 0) {
        return supabase.from('brain_memory_hot').select(cols).textSearch('content', sanitizedFts).limit(limit);
      }
      return supabase.from('brain_memory_hot').select(cols).ilike('content', `%${sanitized}%`).limit(limit);
    } else if (table === 'brain_memory_warm') {
      const cols = 'id, content, context, value_score, access_count, created_at, memory_type, tags, source_module, category, salience_score';
      if (strategy === 'fulltext' && sanitizedFts.length > 0) {
        return supabase.from('brain_memory_warm').select(cols).textSearch('content', sanitizedFts).limit(limit);
      }
      return supabase.from('brain_memory_warm').select(cols).ilike('content', `%${sanitized}%`).limit(limit);
    } else if (table === 'brain_memory_archive') {
      // Glacier tier
      const cols = 'id, content, context, tags, value_score, access_count, created_at';
      if (strategy === 'fulltext' && sanitizedFts.length > 0) {
        return supabase.from('brain_memory_archive').select(cols).textSearch('content', sanitizedFts).limit(limit);
      }
      return supabase.from('brain_memory_archive').select(cols).ilike('content', `%${sanitized}%`).limit(limit);
    } else {
      // Cold tier uses 'summary' column, not 'content'
      const cols = 'id, summary, tags, value_score, access_count, created_at, memory_type, source_module, category, salience_score';
      if (strategy === 'fulltext' && sanitizedFts.length > 0) {
        return supabase.from('brain_memory_cold').select(cols).textSearch('summary', sanitizedFts).limit(limit);
      }
      return supabase.from('brain_memory_cold').select(cols).ilike('summary', `%${sanitized}%`).limit(limit);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async getState(): Promise<MemoryStateSchema> {
    try {
      const [hotCount, warmCount, coldCount, glacierCount] = await Promise.all([
        supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
        supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
        supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
        supabase.from('brain_memory_archive').select('id', { count: 'exact', head: true }),
      ]);

      return {
        short_term: {
          capacity: 50,
          current: 0, // Session-based, not persisted
          ttl_seconds: 1800,
        },
        long_term: {
          hot: { capacity: 500, current: hotCount.count || 0 },
          warm: { capacity: 10000, current: warmCount.count || 0 },
          cold: { capacity: 10000, current: coldCount.count || 0 },
          glacier: { capacity: 50000, current: glacierCount.count || 0 },
        },
        latent: {
          pending_reflection: 0,
          pending_consolidation: 0,
        },
      };
    } catch {
      return {
        short_term: { capacity: 50, current: 0, ttl_seconds: 1800 },
        long_term: {
          hot: { capacity: 500, current: 0 },
          warm: { capacity: 10000, current: 0 },
          cold: { capacity: 10000, current: 0 },
          glacier: { capacity: 50000, current: 0 },
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
  // AUTO-DEGRADATION: Warm → Cold demotion for stale memories
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Demote warm memories that haven't been accessed in `staleDays` to cold tier.
   * Should be called periodically (e.g., during prune/dream cycles).
   */
  async autoDegradeStaleMemories(staleDays: number = 14): Promise<{ demoted: number; errors: number }> {
    const cutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000).toISOString();
    let demoted = 0;
    let errors = 0;

    try {
      // Find warm memories not accessed since cutoff
      // brain_memory_warm uses salience_score/value_score (not confidence/importance_score)
      const { data: stale } = await supabase
        .from('brain_memory_warm')
        .select('id, content, memory_type, salience_score, value_score, tags, metadata, context')
        .or(`last_accessed.is.null,last_accessed.lt.${cutoff}`)
        .lt('created_at', cutoff)
        .limit(50) as any; // Type assertion needed for dynamic column access

      if (!stale || stale.length === 0) return { demoted: 0, errors: 0 };

      for (const mem of stale as any[]) {
        try {
          // Insert into cold with decayed scores — only delete from warm on success
          // Cold tier uses 'summary' not 'content', 'value_score' not 'confidence', 'source_module' not 'source'
          const { error: insertErr } = await supabase.from('brain_memory_cold').insert({
            summary: mem.content,
            memory_type: mem.memory_type || 'general',
            value_score: Math.max(0.1, ((mem.salience_score as number) || 0.5) * 0.8),
            salience_score: Math.max(0.1, ((mem.value_score as number) || 0.3) * 0.7),
            tags: [...((mem.tags as string[]) || []), 'auto_demoted'],
            source_module: 'auto_degradation',
            category: (mem.metadata as any)?.category || 'general',
          } as any);

          if (!insertErr) {
            demoted++;
          } else {
            errors++;
          }
        } catch {
          errors++;
        }
      }

      // Batch-delete successfully demoted entries from warm in one call
      if (demoted > 0) {
        const demotedIds = (stale as any[]).slice(0, demoted).map((m: any) => m.id);
        try {
          await supabase.from('brain_memory_warm').delete().in('id', demotedIds);
        } catch {
          // If batch delete fails, entries remain in warm (safe — cold has copies)
          console.warn('[MemoryCore] Batch warm cleanup failed — entries may be duplicated');
        }
      }

      // Log demotion event
      if (demoted > 0) {
        try {
          await supabase.from('brain_events').insert({
            event_type: 'memory_auto_degradation',
            module: 'memory',
            outcome: 'success',
            data: { demoted, errors, staleDays, cutoff } as any,
          } as any);
        } catch { /* non-critical */ }
      }
    } catch (err) {
      console.error('[MemoryCore] Auto-degradation failed:', err);
    }

    return { demoted, errors };
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
    // Delegate to the unified salience calculator for consistency.
    // At ingestion time we don't have access_count, reinforcement, or cross-module refs yet,
    // so those default to 0 — the score is driven by confidence + type + content signals.
    const result = calculateSalience({
      confidence,
      access_count: 0,
      created_at: new Date().toISOString(),  // brand new memory
      memory_type: type,
      reinforcement_count: 0,
      cross_module_refs: 0,
      content,
    });
    return result.score;
  }

  private determineTier(importance: number): MemoryTier {
    // Very tight hot threshold — only critical memories go to hot
    if (importance > 0.85) return 'hot';    // ← tightened from 0.72
    if (importance > 0.40) return 'warm';   // ← tightened from 0.35
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
      glacier: 'brain_memory_archive',
    };
    return tableMap[tier];
  }

  private mapToMemoryEntry(data: any[], table: string): MemoryEntry[] {
    const tierFromTable = (t: string): MemoryTier => {
      if (t.includes('hot')) return 'hot';
      if (t.includes('warm')) return 'warm';
      if (t.includes('archive')) return 'glacier';
      return 'cold';
    };

    const tier = tierFromTable(table);
    const isCold = tier === 'cold';

    return data.map(d => ({
      id: d.id,
      content: isCold ? (d.summary || '') : (d.content || ''),
      memory_type: d.memory_type || 'general',
      tier,
      state: d.state || this.determineState(tier),
      confidence: d.value_score || d.confidence || 0.5,
      access_count: d.access_count || 0,
      importance_score: d.importance_score || d.salience_score || 0.5,
      tags: d.tags || [],
      metadata: d.metadata || {},
      created_at: d.created_at,
      last_accessed: d.last_accessed || d.last_used,
      source: d.source_module,
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

    // reflect() now selects value_score, so use that for confidence
    const avgConfidence = memories.reduce((sum, m) => sum + (m.value_score || 0.5), 0) / memories.length;
    insights.push(`• Average memory confidence: ${(avgConfidence * 100).toFixed(1)}%`);

    // Identify high-priority items
    const highPriority = memories.filter(m => (m.importance_score || 0) > 0.7);
    if (highPriority.length > 0) {
      insights.push(`• ${highPriority.length} high-priority memories flagged for attention`);
    }

    return insights;
  }

  /**
   * Purge all memories ingested from a specific source.
   * Used to force a clean slate so the system relearns from fresh knowledge banks.
   */
  async purgeBySource(source: string): Promise<{ success: boolean; purged: number }> {
    try {
      const tiers = ['brain_memory_hot', 'brain_memory_warm', 'brain_memory_cold'] as const;

      // Count and delete across all tiers in parallel
      const results = await Promise.allSettled(
        tiers.map(async (tier) => {
          const { count } = await (supabase as any)
            .from(tier)
            .select('id', { count: 'exact', head: true })
            .eq('source_module', source);

          await (supabase as any).from(tier).delete().eq('source_module', source);
          return count ?? 0;
        })
      );

      const totalPurged = results.reduce(
        (sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0), 0
      );

      console.log(`[MemoryCore] Purged ${totalPurged} memories from source_module: ${source}`);
      return { success: true, purged: totalPurged };
    } catch (err) {
      console.error('[MemoryCore] Purge failed:', err);
      return { success: false, purged: 0 };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const memoryCore = MemoryCoreClient.getInstance();

// Re-export for convenience
export { MemoryCoreClient };
