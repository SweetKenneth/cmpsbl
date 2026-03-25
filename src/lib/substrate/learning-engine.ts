/**
 * Learning Engine
 * Unified Cognitive Learning Module
 * 
 * Merges all learning operations into a single authoritative module:
 * - Train: Active learning from external sources
 * - Optimize: Memory compression and cleanup
 * - Reinforce: Strengthen memory weights based on outcomes
 * 
 * Implements the learning loop: input → feedback → adjustment → reinforcement → stabilization
 * 
 * Backward-compatible aliases for legacy train/optimize/reinforce commands.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type LearningStage = 'input' | 'feedback' | 'adjustment' | 'reinforcement' | 'stabilization';

export interface LearningState {
  short_term_gain: number;
  long_term_gain: number;
  decay_rate: number;
  reinforcement_weight: number;
  active_sessions: number;
  total_cycles: number;
  last_cycle_at: string | null;
}

export interface LearningInput {
  content: string;
  source?: string;
  topic?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface FeedbackSignal {
  memory_id?: string;
  outcome: 'positive' | 'negative' | 'neutral';
  score: number;
  context?: string;
}

export interface LearningResult {
  stage: LearningStage;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  metrics?: {
    gain: number;
    memories_affected: number;
    confidence_delta: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARNING ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class LearningEngineClient {
  private static instance: LearningEngineClient;
  private state: LearningState = {
    short_term_gain: 0,
    long_term_gain: 0,
    decay_rate: 0.05,
    reinforcement_weight: 1.0,
    active_sessions: 0,
    total_cycles: 0,
    last_cycle_at: null,
  };

  private constructor() {}

  static getInstance(): LearningEngineClient {
    if (!LearningEngineClient.instance) {
      LearningEngineClient.instance = new LearningEngineClient();
    }
    return LearningEngineClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 1: INPUT
  // ═══════════════════════════════════════════════════════════════════════════

  async input(data: LearningInput): Promise<LearningResult> {
    try {
      const { content, source = 'learning_engine', topic, confidence = 0.7, metadata = {} } = data;

      await supabase.from('brain_events').insert([{
        event_type: 'learning_input',
        module: 'brain',
        data: { source, topic, confidence, content_length: content.length },
      }]);

      // Route through Memory module's salience-gated ingestion instead of direct hot insert.
      // This ensures CLM learnings are tiered by importance, deduplicated, and capacity-checked.
      const { memoryCore } = await import('./memory-core');
      
      const isCLMSource = source.startsWith('clm') || source === 'learning_engine';
      
      const result = await memoryCore.ingest(content, {
        type: 'insight',
        source,
        confidence: isCLMSource ? Math.min(confidence, 0.55) : confidence, // Cap CLM confidence to bias toward warm
        tags: ['learning', ...(topic ? [topic] : [])],
        metadata: { ...metadata, topic, learning_stage: 'input', clm_routed: isCLMSource },
      });

      this.state.active_sessions++;

      return {
        stage: 'input',
        success: result.success,
        data: { memory_id: result.memory_id, tier: result.metadata?.tier },
        metrics: { gain: 0, memories_affected: 1, confidence_delta: 0 },
      };
    } catch (error) {
      return {
        stage: 'input',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 2: FEEDBACK
  // ═══════════════════════════════════════════════════════════════════════════

  async feedback(signal: FeedbackSignal): Promise<LearningResult> {
    try {
      const { memory_id, outcome, score, context } = signal;

      await supabase.from('brain_events').insert([{
        event_type: 'learning_feedback',
        module: 'brain',
        data: { memory_id, outcome, score, context },
      }]);

      const gain = outcome === 'positive' ? score * 0.1 : outcome === 'negative' ? -score * 0.05 : 0;
      this.state.short_term_gain += gain;

      return {
        stage: 'feedback',
        success: true,
        data: { outcome, gain },
        metrics: { gain, memories_affected: memory_id ? 1 : 0, confidence_delta: gain },
      };
    } catch (error) {
      return {
        stage: 'feedback',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 3: ADJUSTMENT
  // ═══════════════════════════════════════════════════════════════════════════

  async adjustment(options: { lookbackHours?: number; minScore?: number } = {}): Promise<LearningResult> {
    try {
      const { lookbackHours = 24, minScore = 0.3 } = options;
      const lookbackTime = new Date(Date.now() - lookbackHours * 3600000).toISOString();

      const { data: events } = await supabase
        .from('brain_events')
        .select('data')
        .eq('event_type', 'learning_feedback')
        .gte('created_at', lookbackTime)
        .order('created_at', { ascending: false })
        .limit(500);

      let adjustments = 0;
      let totalDelta = 0;

      for (const event of events || []) {
        const meta = (event.data as Record<string, unknown>) || {};
        if (meta?.memory_id && Math.abs((meta?.score as number) || 0) >= minScore) {
          adjustments++;
          totalDelta += meta.outcome === 'positive' ? 0.05 : meta.outcome === 'negative' ? -0.05 : 0;
        }
      }

      return {
        stage: 'adjustment',
        success: true,
        data: { adjustments, events_processed: events?.length || 0 },
        metrics: { gain: totalDelta, memories_affected: adjustments, confidence_delta: totalDelta / Math.max(1, adjustments) },
      };
    } catch (error) {
      return {
        stage: 'adjustment',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 4: REINFORCEMENT (wraps pf-brain-reinforce)
  // ═══════════════════════════════════════════════════════════════════════════

  async reinforcement(options: { lookbackHours?: number; minOutcomeScore?: number } = {}): Promise<LearningResult> {
    try {
      const { lookbackHours = 24, minOutcomeScore = 0.5 } = options;

      const { data, error } = await supabase.functions.invoke('pf-brain-reinforce', {
        body: { lookbackHours, minOutcomeScore },
      });

      if (error) throw error;

      const result = data as { reinforced: number; logs_processed: number; adjustment_factor?: number };
      
      this.state.long_term_gain += (result.reinforced || 0) * 0.01;
      this.state.reinforcement_weight = Math.min(2.0, this.state.reinforcement_weight + 0.01);

      return {
        stage: 'reinforcement',
        success: true,
        data: result as unknown as Record<string, unknown>,
        metrics: { 
          gain: (result.reinforced || 0) * 0.01, 
          memories_affected: result.reinforced || 0, 
          confidence_delta: result.adjustment_factor || 0,
        },
      };
    } catch (error) {
      return {
        stage: 'reinforcement',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 5: STABILIZATION (wraps pf-brain-optimize)
  // ═══════════════════════════════════════════════════════════════════════════

  async stabilization(): Promise<LearningResult> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-brain-optimize', {
        body: {},
      });

      if (error) throw error;

      const optResult = data as { deleted: number; decayed: number; total_optimized: number };

      const decayedGain = this.state.short_term_gain * (1 - this.state.decay_rate);
      this.state.long_term_gain += decayedGain * 0.1;
      this.state.short_term_gain = 0;
      this.state.total_cycles++;
      this.state.last_cycle_at = new Date().toISOString();

      await supabase.from('brain_events').insert([{
        event_type: 'learning_stabilization',
        module: 'brain',
        data: JSON.parse(JSON.stringify({ optimization: optResult, state: this.state })),
      }]);

      return {
        stage: 'stabilization',
        success: true,
        data: { optimization: optResult, state: this.state },
        metrics: { gain: this.state.long_term_gain, memories_affected: optResult.total_optimized || 0, confidence_delta: 0 },
      };
    } catch (error) {
      return {
        stage: 'stabilization',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL LEARNING CYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  async runCycle(input?: LearningInput): Promise<{
    success: boolean;
    stages: LearningResult[];
    totalGain: number;
    memoriesAffected: number;
  }> {
    const stages: LearningResult[] = [];
    let totalGain = 0;
    let memoriesAffected = 0;

    const accum = (r: LearningResult) => {
      stages.push(r);
      totalGain += r.metrics?.gain || 0;
      memoriesAffected += r.metrics?.memories_affected || 0;
    };

    // Stage 1: Input (must complete before adjustment reads its events)
    if (input) accum(await this.input(input));

    // Stage 2+3: Adjustment and Reinforcement are independent — run in parallel
    const [adjustmentResult, reinforcementResult] = await Promise.all([
      this.adjustment(),
      this.reinforcement(),
    ]);
    accum(adjustmentResult);
    accum(reinforcementResult);

    // Stage 4: Stabilization depends on prior state updates
    accum(await this.stabilization());

    return { success: stages.every(s => s.success), stages, totalGain, memoriesAffected };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE & METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  getState(): LearningState {
    return { ...this.state };
  }

  async getMetrics(): Promise<{ state: LearningState; recentCycles: number; totalMemoriesProcessed: number }> {
    const { count } = await supabase
      .from('brain_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'learning_stabilization');

    return { state: this.state, recentCycles: this.state.total_cycles, totalMemoriesProcessed: count || 0 };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY ALIASES (Backward Compatibility)
  // ═══════════════════════════════════════════════════════════════════════════

  /** @deprecated Use learningEngine.input() instead */
  async train(content: string, topic?: string): Promise<LearningResult> {
    console.warn('Deprecation: brain.train() is aliased to learningEngine.input()');
    return this.input({ content, topic, source: 'legacy_train' });
  }

  /** @deprecated Use learningEngine.stabilization() instead */
  async optimize(): Promise<LearningResult> {
    console.warn('Deprecation: brain.optimize() is aliased to learningEngine.stabilization()');
    return this.stabilization();
  }

  /** @deprecated Use learningEngine.reinforcement() instead */
  async reinforce(memory_id?: string, boost?: number): Promise<LearningResult> {
    console.warn('Deprecation: brain.reinforce() is aliased to learningEngine.reinforcement()');
    if (memory_id) {
      await this.feedback({ memory_id, outcome: 'positive', score: boost || 0.5 });
    }
    return this.reinforcement();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const learningEngine = LearningEngineClient.getInstance();
export { LearningEngineClient };
