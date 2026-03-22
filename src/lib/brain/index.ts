/**
 * BRAIN Module — Cognitive Memory & Learning Engine
 * v10.5.4 ARCHITECT — Substrate Memory Core
 * 
 * Provides:
 * - Three-tier memory system (Hot → Warm → Cold)
 * - Semantic recall and vector search
 * - Memory compression and pruning
 * - Knowledge graph operations
 * - Learning and reflection cycles
 * - Cost tracking for cognitive operations
 */

// Re-export memory tiering system
export {
  type MemoryTier,
  type Memory,
  type TierStats,
  type TieringResult,
  getTierStats,
  rebalanceMemory,
  pruneMemories,
  searchMemories,
  accessMemory,
  getTieringConfig,
  updateTieringConfig,
  getPrunedMemories,
  restoreMemory,
} from './memoryTiering';

// Re-export semantic recall
export {
  type SemanticMatch,
  type RecallOptions,
  semanticRecall,
  getRelatedMemories,
  detectMemoryClusters,
} from './semanticRecall';

// Re-export compression engine
export {
  type CompressionConfig,
  type CompressedMemory,
  runBatchCompression,
  getCompressionStats,
} from './compressionEngine';

// Re-export knowledge graph
export {
  type GraphNode,
  type GraphEdge,
  type GraphStats,
  type GraphQueryResult,
  buildKnowledgeGraph,
  getGraphStats,
  queryGraph,
  getNodesByType,
  getClusterNodes,
  getClusters,
  findPath,
  getEdgesByType,
  addEdge,
  getHubNodes,
  searchNodes,
} from './knowledgeGraph';

// costTracker removed — superseded by NEXUS costEstimation + cost-ceiling

// Re-export context classifier
export {
  classifyContext,
} from './contextClassifier';

// Re-export reflection job
export {
  generateDailyReflection,
  getRecentReflections,
  getAllLessons,
} from './reflectionJob';

// Re-export consolidation engine
export * from './consolidation';

// Re-export batch operations
export * from './batchOperations';
 
 // Re-export query optimizer
 export * from './queryOptimizer';

// Re-export memory index
export * from './memoryIndex';

// Re-export attention mechanism
export * from './attentionMechanism';

import { supabase } from '@/integrations/supabase/client';
import type { TierStats, Memory } from './memoryTiering';
import { getTierStats, searchMemories as searchMemoriesFn } from './memoryTiering';

// ============ Core Brain Operations ============

export interface BrainEvent {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  module_source: string;
  created_at: string;
}

/**
 * Store a new memory
 */
export async function storeMemory(
  content: string,
  context: string,
  options?: {
    importance?: number;
    tags?: string[];
    ttl_days?: number;
  }
): Promise<{ success: boolean; memory_id?: string; tier?: string }> {
  try {
    const importance = options?.importance ?? 0.5;
    const tier = importance >= 0.8 ? 'hot' : importance < 0.3 ? 'cold' : 'warm';
    const sourceModule = context === 'code' ? 'engineering' : context === 'architecture' ? 'architecture' : 'general';
    const category = context || 'uncategorized';

    if (tier === 'cold') {
      const { data, error } = await supabase
        .from('brain_memory_cold')
        .insert({
          summary: content,
          tags: { context, user_tags: options?.tags || [] },
          value_score: importance,
          source_module: sourceModule,
          category,
        })
        .select('id')
        .single();
      if (error) throw error;
      return { success: true, memory_id: data?.id, tier };
    }

    const table = tier === 'hot' ? 'brain_memory_hot' : 'brain_memory_warm';
    const { data, error } = await supabase
      .from(table)
      .insert({
        content,
        context,
        value_score: importance,
        tags: options?.tags || [],
        metadata: { ttl_days: options?.ttl_days },
        source_module: sourceModule,
        category,
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, memory_id: data?.id, tier };
  } catch (error) {
    console.error('Error storing memory:', error);
    return { success: false };
  }
}
/**
 * Recall memories by context
 */
export async function recall(
  context: string,
  options?: {
    limit?: number;
    min_score?: number;
    tiers?: ('hot' | 'warm' | 'cold')[];
  }
): Promise<Memory[]> {
  return searchMemoriesFn(context, {
    tiers: options?.tiers,
    limit: options?.limit,
    minValueScore: options?.min_score,
  });
}

/**
 * Emit a brain event to the event bus
 */
export async function emitBrainEvent(
  eventType: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  try {
    const { error } = await supabase.from('brain_events').insert([{
      event_type: eventType,
      module: 'brain',
      data: payload as unknown as Record<string, never>,
    }]);

    return !error;
  } catch (error) {
    console.error('Error emitting brain event:', error);
    return false;
  }
}

/**
 * Get recent brain events
 */
export async function getBrainEvents(
  filter?: {
    event_type?: string;
    limit?: number;
  }
): Promise<BrainEvent[]> {
  try {
    let query = supabase
      .from('brain_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filter?.limit || 50);

    if (filter?.event_type) {
      query = query.eq('event_type', filter.event_type);
    }

    const { data } = await query;
    
    // Map database schema to BrainEvent interface
    return (data || []).map(row => ({
      id: row.id,
      event_type: row.event_type,
      payload: (row.data as Record<string, unknown>) || {},
      module_source: row.module,
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error('Error fetching brain events:', error);
    return [];
  }
}

// ============ Engine Bus Interface ============

export type EngineType = 'learning' | 'imagination' | 'reasoning' | 'governance' | 'telemetry' | 'state';

export interface EngineTask {
  engine: EngineType;
  operation: string;
  input: Record<string, unknown>;
  priority?: number;
}

export interface EngineResult {
  engine: EngineType;
  operation: string;
  success: boolean;
  output?: unknown;
  error?: string;
  duration_ms: number;
}

/**
 * Route a task through the engine bus
 */
export async function routeToEngine(task: EngineTask): Promise<EngineResult> {
  const startTime = Date.now();
  
  try {
    // In production, this would route to actual engine implementations
    const output = { processed: true, engine: task.engine, operation: task.operation };

    return {
      engine: task.engine,
      operation: task.operation,
      success: true,
      output,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    return {
      engine: task.engine,
      operation: task.operation,
      success: false,
      error: String(error),
      duration_ms: Date.now() - startTime,
    };
  }
}

// ============ Module Metadata ============

export const BRAIN_VERSION = '7.0.0';
export const BRAIN_CODENAME = 'Memoria';

export interface BrainStatus {
  version: string;
  tier_stats: TierStats;
  total_memories: number;
  active_engines: EngineType[];
}

export async function getBrainStatus(): Promise<BrainStatus> {
  const stats = await getTierStats();
  
  return {
    version: BRAIN_VERSION,
    tier_stats: stats,
    total_memories: stats.total,
    active_engines: ['learning', 'imagination', 'reasoning', 'governance', 'telemetry', 'state'],
  };
}
