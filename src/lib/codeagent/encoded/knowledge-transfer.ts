/**
 * Brain → Encoded Knowledge Transfer Pipeline
 * 
 * Distills Brain memories into actionable code patterns for ENCODE.
 * This is the bridge that turns experience into implementation expertise.
 */

import { supabase } from '@/integrations/supabase/client';
import { EXPERT_PATTERNS, type ExpertPattern, type PatternCategory } from './expert-patterns';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface LearnedPattern {
  id: string;
  source: 'brain_memory' | 'execution_outcome' | 'seba_proposal' | 'manual';
  pattern_type: PatternCategory;
  content: string;
  confidence: number;
  times_applied: number;
  success_rate: number;
  created_at: string;
}

export interface TransferResult {
  patterns_transferred: number;
  patterns_enriched: number;
  new_heuristics: number;
  confidence_boost: number;
}

export interface TrainingAccelerationConfig {
  /** How many brain memories to scan per cycle */
  batchSize: number;
  /** Minimum confidence to transfer a pattern */
  minConfidence: number;
  /** How often to run transfer (ms) */
  intervalMs: number;
  /** Categories to prioritize */
  priorityCategories: PatternCategory[];
  /** Whether to use pattern compression (combine similar patterns) */
  enableCompression: boolean;
  /** Max patterns to hold in hot cache */
  hotCacheSize: number;
}

export const DEFAULT_ACCELERATION_CONFIG: TrainingAccelerationConfig = {
  batchSize: 50,
  minConfidence: 0.6,
  intervalMs: 10 * 60_000, // 10 minutes
  priorityCategories: ['edge_function', 'typescript_advanced', 'react_architecture', 'security'],
  enableCompression: true,
  hotCacheSize: 200,
};

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE EXTRACTION
// ═══════════════════════════════════════════════════════════════

/**
 * Extract code-relevant patterns from Brain memories
 */
export async function extractCodePatterns(
  config: Partial<TrainingAccelerationConfig> = {}
): Promise<LearnedPattern[]> {
  const { batchSize = 50, minConfidence = 0.6 } = { ...DEFAULT_ACCELERATION_CONFIG, ...config };

  try {
    // Fetch high-confidence brain memories related to code
    const { data: memories, error } = await supabase
      .from('brain_memories')
      .select('*')
      .gte('confidence', minConfidence)
      .in('memory_type', ['learned', 'heuristic', 'pattern'])
      .order('confidence', { ascending: false })
      .limit(batchSize);

    if (error || !memories) return [];

    // Convert brain memories to Encoded-digestible patterns
    return memories
      .filter(m => isCodeRelated(m.content))
      .map(m => ({
        id: m.id,
        source: 'brain_memory' as const,
        pattern_type: classifyPattern(m.content),
        content: m.content,
        confidence: m.confidence || 0.5,
        times_applied: 0,
        success_rate: 0,
        created_at: m.created_at,
      }));
  } catch (err) {
    console.error('Failed to extract code patterns:', err);
    return [];
  }
}

/**
 * Check if a memory is code-related
 */
function isCodeRelated(content: string): boolean {
  const codeIndicators = [
    'function', 'component', 'hook', 'query', 'mutation', 'edge function',
    'typescript', 'react', 'supabase', 'rls', 'policy', 'api', 'endpoint',
    'pattern', 'refactor', 'test', 'validation', 'error handling', 'performance',
    'security', 'database', 'schema', 'migration', 'type', 'interface',
    'import', 'export', 'async', 'await', 'promise', 'state', 'effect',
    'render', 'memo', 'callback', 'zustand', 'zod', 'tanstack',
  ];
  const lower = content.toLowerCase();
  return codeIndicators.some(indicator => lower.includes(indicator));
}

/**
 * Classify a pattern into a category based on content analysis
 */
function classifyPattern(content: string): PatternCategory {
  const lower = content.toLowerCase();
  
  const categorySignals: Record<PatternCategory, string[]> = {
    typescript_advanced: ['type', 'interface', 'generic', 'union', 'mapped', 'conditional', 'branded'],
    react_architecture: ['component', 'hook', 'render', 'state', 'effect', 'context', 'provider', 'suspense'],
    edge_function: ['edge function', 'serve', 'deno', 'cors', 'endpoint', 'handler'],
    error_handling: ['error', 'catch', 'throw', 'retry', 'fallback', 'boundary'],
    security: ['auth', 'rls', 'policy', 'validation', 'sanitize', 'permission', 'role'],
    performance: ['memo', 'lazy', 'virtual', 'debounce', 'throttle', 'cache', 'optimize'],
    state_management: ['zustand', 'store', 'reducer', 'state', 'dispatch', 'selector'],
    testing: ['test', 'describe', 'expect', 'mock', 'spy', 'assert', 'vitest'],
    database: ['query', 'insert', 'update', 'delete', 'migration', 'schema', 'index', 'upsert'],
    api_design: ['api', 'rest', 'pagination', 'cursor', 'rate limit', 'webhook'],
    refactoring: ['refactor', 'extract', 'simplify', 'decompose', 'inline', 'rename'],
    accessibility: ['aria', 'role', 'focus', 'keyboard', 'screen reader', 'wcag'],
  };

  let bestCategory: PatternCategory = 'typescript_advanced';
  let bestScore = 0;

  for (const [category, signals] of Object.entries(categorySignals) as [PatternCategory, string[]][]) {
    const score = signals.filter(s => lower.includes(s)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE TRANSFER
// ═══════════════════════════════════════════════════════════════

/**
 * Transfer learned patterns from Brain to Encoded's working memory
 */
export async function transferToEncoded(
  patterns: LearnedPattern[]
): Promise<TransferResult> {
  let transferred = 0;
  let enriched = 0;
  let newHeuristics = 0;

  for (const pattern of patterns) {
    try {
      // Check if pattern already exists in brain_memory_hot using a safe prefix match
      const safePrefix = pattern.content.slice(0, 50).replace(/[%_'"\\]/g, '');
      const { data: existing } = await supabase
        .from('brain_memory_hot')
        .select('id, access_count')
        .ilike('content', `%${safePrefix}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        // Enrich existing pattern with higher confidence
        await supabase
          .from('brain_memory_hot')
          .update({
            access_count: (existing[0].access_count || 0) + 1,
            last_accessed_at: new Date().toISOString(),
          })
          .eq('id', existing[0].id);
        enriched++;
      } else {
        // Insert as new hot memory for Encoded
        await supabase.from('brain_memory_hot').insert({
          content: pattern.content,
          category: `encoded_pattern:${pattern.pattern_type}`,
          priority: Math.round(pattern.confidence * 100),
          access_count: 0,
          metadata: {
            source: pattern.source,
            pattern_type: pattern.pattern_type,
            confidence: pattern.confidence,
            transferred_at: new Date().toISOString(),
          },
        });
        transferred++;
      }

      // Also store as a heuristic in brain_memories for long-term retention
      if (pattern.confidence >= 0.8) {
        await supabase.from('brain_memories').upsert({
          content: `[ENCODED_HEURISTIC] ${pattern.pattern_type}: ${pattern.content}`,
          memory_type: 'heuristic',
          source: 'encoded_transfer',
          confidence: pattern.confidence,
          metadata: {
            pattern_id: pattern.id,
            category: pattern.pattern_type,
            transferred_at: new Date().toISOString(),
          },
        });
        newHeuristics++;
      }
    } catch (err) {
      console.error('Transfer failed for pattern:', pattern.id, err);
    }
  }

  return {
    patterns_transferred: transferred,
    patterns_enriched: enriched,
    new_heuristics: newHeuristics,
    confidence_boost: patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
      : 0,
  };
}

// ═══════════════════════════════════════════════════════════════
// BATCH INGESTION — Seed expert patterns into Brain
// ═══════════════════════════════════════════════════════════════

/**
 * Ingest all expert patterns into Brain memory for Encoded to learn from.
 * This is the "fast-track" — directly loading curated expertise.
 */
export async function ingestExpertPatterns(): Promise<{
  ingested: number;
  skipped: number;
  errors: number;
}> {
  let ingested = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches of 10
  for (let i = 0; i < EXPERT_PATTERNS.length; i += 10) {
    const batch = EXPERT_PATTERNS.slice(i, i + 10);
    
    const memories = batch.map(p => ({
      content: formatPatternForMemory(p),
      memory_type: 'heuristic' as const,
      source: 'expert_pattern_library',
      confidence: 0.95, // High confidence — these are curated
      metadata: {
        pattern_id: p.id,
        category: p.category,
        tier: p.tier,
        complexity: p.complexity,
        ingested_at: new Date().toISOString(),
      },
    }));

    try {
      const { data, error } = await supabase
        .from('brain_memories')
        .upsert(memories, { onConflict: 'content' })
        .select();

      if (error) {
        // If upsert fails (no unique constraint on content), try insert
        const { data: inserted, error: insertErr } = await supabase
          .from('brain_memories')
          .insert(memories)
          .select();
        
        if (insertErr) {
          errors += batch.length;
        } else {
          ingested += inserted?.length || 0;
        }
      } else {
        ingested += data?.length || 0;
      }
    } catch {
      errors += batch.length;
    }
  }

  // Also load into hot memory for immediate access
  const hotEntries = EXPERT_PATTERNS.slice(0, 30).map(p => ({
    content: `[EXPERT] ${p.name}: ${p.description}. Template: ${p.template.slice(0, 200)}`,
    category: `encoded_expert:${p.category}`,
    priority: p.complexity * 10,
    access_count: 0,
    metadata: {
      pattern_id: p.id,
      tier: p.tier,
      anti_patterns: p.antiPatterns,
    },
  }));

  try {
    await supabase.from('brain_memory_hot').insert(hotEntries);
  } catch {
    // Non-fatal — hot cache is a performance optimization
  }

  return { ingested, skipped, errors };
}

/**
 * Format an expert pattern into a brain-digestible memory string
 */
function formatPatternForMemory(pattern: ExpertPattern): string {
  return [
    `[PATTERN:${pattern.id}] ${pattern.name} (${pattern.tier})`,
    `Category: ${pattern.category}`,
    `Description: ${pattern.description}`,
    `When to use: ${pattern.whenToUse}`,
    `Anti-patterns: ${pattern.antiPatterns.join('; ')}`,
    `Quality signals: ${pattern.qualitySignals.join('; ')}`,
    `Template:\n${pattern.template}`,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════
// TRAINING ACCELERATION STRATEGIES
// ═══════════════════════════════════════════════════════════════

/**
 * Run a full transfer cycle: Extract → Classify → Transfer → Report
 */
export async function runTransferCycle(
  config?: Partial<TrainingAccelerationConfig>
): Promise<TransferResult & { extracted: number }> {
  const patterns = await extractCodePatterns(config);
  const result = await transferToEncoded(patterns);
  
  return {
    ...result,
    extracted: patterns.length,
  };
}

/**
 * Get training acceleration recommendations
 */
export function getAccelerationStrategies(): {
  strategy: string;
  impact: string;
  implementation: string;
  risk: 'low' | 'medium' | 'high';
}[] {
  return [
    {
      strategy: 'Expert Pattern Ingestion',
      impact: 'Immediate: 40+ production patterns available in memory',
      implementation: 'Call ingestExpertPatterns() — one-time bulk load of curated patterns',
      risk: 'low',
    },
    {
      strategy: 'Increase CLM Batch Size',
      impact: '2-3x faster pattern acquisition per cycle',
      implementation: 'Set batchSize to 100+ in CLM scheduler config',
      risk: 'low',
    },
    {
      strategy: 'Multi-Model Learning',
      impact: 'Use Groq 8B (14.4K RPD) for volume, 70B for quality checks',
      implementation: 'Route CLM learning calls through groq-8b, verification through groq-70b',
      risk: 'low',
    },
    {
      strategy: 'Execution Outcome Feedback Loop',
      impact: 'Learn from every code generation — what worked, what failed',
      implementation: 'After each Encoded execution, call recordLearning() with outcome',
      risk: 'low',
    },
    {
      strategy: 'Pattern Compression',
      impact: 'Consolidate 10 similar patterns into 1 high-confidence heuristic',
      implementation: 'Enable compression in transfer config — reduces memory, increases recall speed',
      risk: 'medium',
    },
    {
      strategy: 'Cross-Module Learning',
      impact: 'SEBA proposals become Encoded training data automatically',
      implementation: 'Enable sebaIntegration in Encoded config — proposals feed learning pipeline',
      risk: 'medium',
    },
    {
      strategy: 'Parallel Curriculum Tracks',
      impact: '5x coverage by running TypeScript, React, Edge, Security, and Architecture tracks simultaneously',
      implementation: 'CLM scheduler runs multiple skill tracks in parallel instead of sequential',
      risk: 'medium',
    },
    {
      strategy: 'Shadow Execution Training',
      impact: 'Encoded practices on real proposals without applying changes',
      implementation: 'Run dry_run mode on SEBA proposals, grade output, learn from results',
      risk: 'low',
    },
  ];
}
