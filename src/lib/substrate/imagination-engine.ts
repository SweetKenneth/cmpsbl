/**
 * Imagination Engine
 * Unified Cognitive Imagination Module
 * 
 * Merges all generative/synthesis operations into a single authoritative module:
 * - Dream: Autonomous nocturnal processing
 * - Synthesize: Cross-domain cognitive synthesis
 * - Pattern Fusion: Merge insights from unrelated domains
 * 
 * Implements the imagination loop: latent_extraction → recombination → simulation → synthesis
 * 
 * Operates offline from live input and feeds outputs to Learning Engine.
 * Backward-compatible aliases for legacy dream/synthesize/pattern_fusion commands.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export type ImaginationStage = 'latent_extraction' | 'recombination' | 'simulation' | 'synthesis';

export interface ImaginationState {
  dreams_generated: number;
  syntheses_completed: number;
  fusions_created: number;
  creativity_index: number;
  last_dream_at: string | null;
  offline_mode: boolean;
}

export interface LatentContent {
  id: string;
  content: string;
  type: string;
  relevance: number;
  extracted_at: string;
}

export interface SynthesisOutput {
  content: string;
  type: 'dream' | 'insight' | 'fusion' | 'pattern';
  originality_score: number;
  source_domains: string[];
  metadata: Record<string, unknown>;
}

export interface ImaginationResult {
  stage: ImaginationStage;
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  output?: SynthesisOutput;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGINATION ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class ImaginationEngineClient {
  private static instance: ImaginationEngineClient;
  private state: ImaginationState = {
    dreams_generated: 0,
    syntheses_completed: 0,
    fusions_created: 0,
    creativity_index: 0.5,
    last_dream_at: null,
    offline_mode: true,
  };

  private constructor() {}

  static getInstance(): ImaginationEngineClient {
    if (!ImaginationEngineClient.instance) {
      ImaginationEngineClient.instance = new ImaginationEngineClient();
    }
    return ImaginationEngineClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 1: LATENT EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════

  async latentExtraction(options: { tier?: 'hot' | 'warm' | 'cold'; limit?: number; minAge?: number } = {}): Promise<ImaginationResult> {
    try {
      const { tier = 'warm', limit = 20, minAge = 24 } = options;
      const cutoff = new Date(Date.now() - minAge * 3600000).toISOString();

      // Query appropriate table
      let memories: any[] = [];
      
      if (tier === 'hot') {
        const { data } = await supabase.from('brain_memory_hot').select('id, content, memory_type, importance_score, created_at').lt('created_at', cutoff).order('importance_score', { ascending: false }).limit(limit);
        memories = data || [];
      } else if (tier === 'warm') {
        const { data } = await supabase.from('brain_memory_warm').select('id, content, memory_type, importance_score, created_at').lt('created_at', cutoff).order('importance_score', { ascending: false }).limit(limit);
        memories = data || [];
      } else {
        const { data } = await supabase.from('brain_memory_cold').select('id, content, memory_type, importance_score, created_at').lt('created_at', cutoff).order('importance_score', { ascending: false }).limit(limit);
        memories = data || [];
      }

      const latentContent: LatentContent[] = memories.map((m: any) => ({
        id: m.id,
        content: m.content || '',
        type: m.memory_type || 'general',
        relevance: m.importance_score || 0.5,
        extracted_at: new Date().toISOString(),
      }));

      await supabase.from('brain_events').insert({
        event_type: 'latent_extraction',
        module: 'brain',
        data: { tier, extracted: latentContent.length, min_age_hours: minAge },
      } as any);

      return {
        stage: 'latent_extraction',
        success: true,
        data: { latent_content: latentContent, count: latentContent.length },
      };
    } catch (error) {
      return {
        stage: 'latent_extraction',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 2: RECOMBINATION
  // ═══════════════════════════════════════════════════════════════════════════

  async recombination(latentContent: LatentContent[]): Promise<ImaginationResult> {
    try {
      if (latentContent.length < 2) {
        return { stage: 'recombination', success: false, error: 'Insufficient latent content for recombination (need at least 2)' };
      }

      const concepts: string[] = [];
      const sourceMemories: string[] = [];

      for (const item of latentContent) {
        // Avoid creating large temporary arrays with split+filter+slice
        let wordCount = 0;
        let start = 0;
        const content = item.content;
        for (let i = 0; i <= content.length && wordCount < 3; i++) {
          if (i === content.length || /\s/.test(content[i])) {
            const word = content.slice(start, i);
            if (word.length > 4) {
              concepts.push(word);
              wordCount++;
            }
            start = i + 1;
          }
        }
        sourceMemories.push(item.id);
      }

      const uniqueConcepts = [...new Set(concepts)];
      const noveltyScore = Math.min(1, uniqueConcepts.length / concepts.length + 0.3);

      this.state.creativity_index = (this.state.creativity_index + noveltyScore) / 2;

      await supabase.from('brain_events').insert({
        event_type: 'imagination_recombination',
        module: 'brain',
        data: { concepts_extracted: uniqueConcepts.length, novelty_score: noveltyScore },
      } as any);

      return {
        stage: 'recombination',
        success: true,
        data: { concepts: uniqueConcepts.slice(0, 10), novelty_score: noveltyScore, source_memories: sourceMemories },
      };
    } catch (error) {
      return { stage: 'recombination', success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 3: SIMULATION
  // ═══════════════════════════════════════════════════════════════════════════

  async simulation(recombinationData: Record<string, unknown>): Promise<ImaginationResult> {
    try {
      const concepts = (recombinationData.concepts as string[]) || [];
      const noveltyScore = (recombinationData.novelty_score as number) || 0.5;

      const scenario = `Exploring synthesis of: ${concepts.slice(0, 5).join(' + ')}`;
      const outcomes = [
        `Pattern integration: ${concepts[0] || 'unknown'} connects to ${concepts[1] || 'unknown'}`,
        `Emergent property: combining yields novel ${concepts[2] || 'insight'}`,
        `Cross-domain application: applicable to ${concepts[3] || 'general'} domain`,
      ];

      await supabase.from('brain_events').insert({
        event_type: 'imagination_simulation',
        module: 'brain',
        data: { scenario, outcomes_count: outcomes.length, confidence: noveltyScore * 0.8 },
      } as any);

      return {
        stage: 'simulation',
        success: true,
        data: { scenario, outcomes, confidence: noveltyScore * 0.8 },
      };
    } catch (error) {
      return { stage: 'simulation', success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 4: SYNTHESIS
  // ═══════════════════════════════════════════════════════════════════════════

  async synthesis(simulationData: Record<string, unknown>, options: { type?: 'dream' | 'insight' | 'fusion' | 'pattern'; persist?: boolean } = {}): Promise<ImaginationResult> {
    try {
      const { type = 'insight', persist = true } = options;
      const scenario = (simulationData.scenario as string) || '';
      const outcomes = (simulationData.outcomes as string[]) || [];
      const confidence = (simulationData.confidence as number) || 0.5;

      const content = `[IMAGINATION SYNTHESIS]\n${scenario}\n\nOutcomes:\n${outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;

      const output: SynthesisOutput = {
        content,
        type,
        originality_score: confidence * this.state.creativity_index,
        source_domains: [],
        metadata: { simulation_confidence: confidence, creativity_index: this.state.creativity_index, synthesized_at: new Date().toISOString() },
      };

      if (persist) {
        await supabase.from('brain_memory_hot').insert({
          content: output.content,
          memory_type: type === 'dream' ? 'dream' : 'insight',
          importance_score: output.originality_score,
          source: 'imagination_engine',
          metadata: output.metadata,
        } as any);
      }

      this.state.syntheses_completed++;

      await supabase.from('brain_events').insert({
        event_type: 'imagination_synthesis',
        module: 'brain',
        data: { type, originality_score: output.originality_score, persisted: persist },
      } as any);

      return { stage: 'synthesis', success: true, output };
    } catch (error) {
      return { stage: 'synthesis', success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL IMAGINATION CYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  async runCycle(options: { tier?: 'hot' | 'warm' | 'cold'; type?: 'dream' | 'insight' | 'fusion' | 'pattern' } = {}): Promise<{
    success: boolean;
    stages: ImaginationResult[];
    output?: SynthesisOutput;
  }> {
    const { tier = 'warm', type = 'insight' } = options;
    const stages: ImaginationResult[] = [];

    const extractionResult = await this.latentExtraction({ tier });
    stages.push(extractionResult);
    if (!extractionResult.success) return { success: false, stages };

    const latentContent = (extractionResult.data?.latent_content as LatentContent[]) || [];
    
    const recombinationResult = await this.recombination(latentContent);
    stages.push(recombinationResult);
    if (!recombinationResult.success) return { success: false, stages };

    const simulationResult = await this.simulation(recombinationResult.data || {});
    stages.push(simulationResult);
    if (!simulationResult.success) return { success: false, stages };

    const synthesisResult = await this.synthesis(simulationResult.data || {}, { type });
    stages.push(synthesisResult);

    return { success: synthesisResult.success, stages, output: synthesisResult.output };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DREAM CYCLE (wraps pf-dream-eater-cycle)
  // ═══════════════════════════════════════════════════════════════════════════

  async dream(options: { force?: boolean; send_email?: boolean } = {}): Promise<ImaginationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-dream-eater-cycle', { body: options });

      if (error) throw error;

      this.state.dreams_generated++;
      this.state.last_dream_at = new Date().toISOString();

      const dreamResult = data as { content?: string; mood?: string; insights?: string[] };

      return {
        stage: 'synthesis',
        success: true,
        data: dreamResult as unknown as Record<string, unknown>,
        output: {
          content: dreamResult.content || 'Dream cycle completed',
          type: 'dream',
          originality_score: 0.8,
          source_domains: ['dream_eater'],
          metadata: { mood: dreamResult.mood, insights: dreamResult.insights },
        },
      };
    } catch (error) {
      return { stage: 'synthesis', success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PATTERN FUSION (wraps pf-brain-pattern-fusion)
  // ═══════════════════════════════════════════════════════════════════════════

  async patternFusion(problem: string, domain_1: string, domain_2: string): Promise<ImaginationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-brain-pattern-fusion', {
        body: { problem, domain_1, domain_2 },
      });

      if (error) throw error;

      this.state.fusions_created++;

      const fusionResult = data as { fusion?: { best_solution?: { solution?: string; originality_score?: number }; fusion_concepts?: string[]; novel_solutions?: string[] }; provider?: string };
      const fusion = fusionResult.fusion || {};
      const bestSolution = fusion.best_solution || {};

      return {
        stage: 'synthesis',
        success: true,
        data: fusionResult as unknown as Record<string, unknown>,
        output: {
          content: bestSolution.solution || 'Fusion completed',
          type: 'fusion',
          originality_score: (bestSolution.originality_score || 50) / 100,
          source_domains: [domain_1, domain_2],
          metadata: { fusion_concepts: fusion.fusion_concepts, novel_solutions: fusion.novel_solutions, provider: fusionResult.provider },
        },
      };
    } catch (error) {
      return { stage: 'synthesis', success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE & METRICS
  // ═══════════════════════════════════════════════════════════════════════════

  getState(): ImaginationState {
    return { ...this.state };
  }

  setOfflineMode(enabled: boolean): void {
    this.state.offline_mode = enabled;
  }

  async getMetrics(): Promise<{ state: ImaginationState; recent_dreams: number; recent_fusions: number }> {
    const oneDayAgo = new Date(Date.now() - 24 * 3600000).toISOString();

    const [{ count: dreamsCount }, { count: fusionsCount }] = await Promise.all([
      supabase.from('brain_events').select('id', { count: 'exact', head: true }).eq('event_type', 'imagination_synthesis').gte('created_at', oneDayAgo),
      supabase.from('brain_events').select('id', { count: 'exact', head: true }).eq('event_type', 'domains_merged').gte('created_at', oneDayAgo),
    ]);

    return { state: this.state, recent_dreams: dreamsCount || 0, recent_fusions: fusionsCount || 0 };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY ALIASES (Backward Compatibility)
  // ═══════════════════════════════════════════════════════════════════════════

  /** @deprecated Use imaginationEngine.dream() instead */
  async dreamLegacy(): Promise<ImaginationResult> {
    console.warn('Deprecation: brain.dream() is aliased to imaginationEngine.dream()');
    return this.dream();
  }

  /** @deprecated Use imaginationEngine.runCycle() instead */
  async synthesize(): Promise<ImaginationResult> {
    console.warn('Deprecation: brain.synthesize() is aliased to imaginationEngine.runCycle()');
    const result = await this.runCycle({ type: 'insight' });
    return result.stages[result.stages.length - 1] || { stage: 'synthesis', success: false, error: 'No stages' };
  }

  /** @deprecated Use imaginationEngine.patternFusion() instead */
  async pattern_fusion(problem: string, domain_1: string, domain_2: string): Promise<ImaginationResult> {
    console.warn('Deprecation: brain.pattern_fusion() is aliased to imaginationEngine.patternFusion()');
    return this.patternFusion(problem, domain_1, domain_2);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const imaginationEngine = ImaginationEngineClient.getInstance();
export { ImaginationEngineClient };
