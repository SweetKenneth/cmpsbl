/**
 * Reasoning Engine — Unified Higher-Order Reasoning
 * Reasoning Compression
 * 
 * Merges:
 * - brain.causal → causal_mapping
 * - brain.systems_reason → dependency_analysis
 * - brain.hypothesis_test → hypothesis_generation + hypothesis_validation
 * 
 * Lifecycle: causal_mapping → dependency_analysis → hypothesis_generation → hypothesis_validation → impact_projection
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ReasoningStage = 
  | 'causal_mapping'
  | 'dependency_analysis'
  | 'hypothesis_generation'
  | 'hypothesis_validation'
  | 'impact_projection';

export interface ReasoningState {
  current_stage: ReasoningStage;
  active_hypotheses: number;
  validated_conclusions: number;
  causal_chains: number;
  impact_projections: number;
  confidence_threshold: number;
  last_reasoning_at: string | null;
}

export interface CausalLink {
  cause: string;
  effect: string;
  confidence: number;
  evidence_refs: string[];
}

export interface Hypothesis {
  id: string;
  statement: string;
  confidence: number;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  status: 'pending' | 'validated' | 'rejected' | 'uncertain';
}

export interface ReasoningResult {
  success: boolean;
  stage: ReasoningStage;
  result?: {
    causal_links?: CausalLink[];
    dependencies?: Array<{ source: string; target: string; weight: number }>;
    hypotheses?: Hypothesis[];
    validation?: { hypothesis_id: string; passed: boolean; confidence: number };
    impact?: { scenario: string; probability: number; severity: number };
  };
  processing_time_ms: number;
  error?: string;
}

export interface ReasoningInput {
  context: string;
  domain?: string;
  depth?: 'shallow' | 'standard' | 'deep';
  constraints?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// REASONING ENGINE CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

export class ReasoningEngineClient {
  private static instance: ReasoningEngineClient;

  private constructor() {}

  static getInstance(): ReasoningEngineClient {
    if (!ReasoningEngineClient.instance) {
      ReasoningEngineClient.instance = new ReasoningEngineClient();
    }
    return ReasoningEngineClient.instance;
  }

  // ═══ STATE MANAGEMENT ═══

  async getState(): Promise<ReasoningState> {
    const { data: events } = await supabase
      .from('brain_events')
      .select('event_type, outcome, created_at')
      .eq('module', 'reasoning_engine')
      .order('created_at', { ascending: false })
      .limit(100);

    // Single-pass aggregation
    let hypotheses = 0, validated = 0, causalMaps = 0, impacts = 0;
    const lastEvent = events?.[0];

    for (const e of events || []) {
      switch (e.event_type) {
        case 'hypothesis_generated': hypotheses++; break;
        case 'hypothesis_validated': if (e.outcome === 'success') validated++; break;
        case 'causal_mapped': causalMaps++; break;
        case 'impact_projected': impacts++; break;
      }
    }

    return {
      current_stage: 'causal_mapping',
      active_hypotheses: hypotheses,
      validated_conclusions: validated,
      causal_chains: causalMaps,
      impact_projections: impacts,
      confidence_threshold: 0.7,
      last_reasoning_at: lastEvent?.created_at || null,
    };
  }

  // ═══ STAGE 1: CAUSAL MAPPING ═══
  // Maps cause-effect relationships from context

  async causalMapping(input: ReasoningInput): Promise<ReasoningResult> {
    const startTime = Date.now();

    try {
      // Extract causal patterns from context
      const causalLinks: CausalLink[] = this.extractCausalPatterns(input.context);

      // Log reasoning event
      await supabase.from('brain_events').insert({
        module: 'reasoning_engine',
        event_type: 'causal_mapped',
        data: { 
          context_length: input.context.length,
          links_found: causalLinks.length,
          domain: input.domain,
        },
        outcome: causalLinks.length > 0 ? 'success' : 'no_patterns',
      });

      return {
        success: true,
        stage: 'causal_mapping',
        result: { causal_links: causalLinks },
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        stage: 'causal_mapping',
        error: error instanceof Error ? error.message : 'Causal mapping failed',
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  private extractCausalPatterns(context: string): CausalLink[] {
    // Pattern recognition for causal relationships
    const patterns = [
      /(\w+(?:\s+\w+)*)\s+(?:causes?|leads?\s+to|results?\s+in)\s+(\w+(?:\s+\w+)*)/gi,
      /(?:because\s+of|due\s+to)\s+(\w+(?:\s+\w+)*),?\s+(\w+(?:\s+\w+)*)/gi,
      /(\w+(?:\s+\w+)*)\s+→\s+(\w+(?:\s+\w+)*)/gi,
    ];

    const links: CausalLink[] = [];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(context)) !== null) {
        links.push({
          cause: match[1].trim(),
          effect: match[2].trim(),
          confidence: 0.7,
          evidence_refs: [context.slice(Math.max(0, match.index - 50), match.index + match[0].length + 50)],
        });
      }
    }

    return links;
  }

  // ═══ STAGE 2: DEPENDENCY ANALYSIS ═══
  // Maps system dependencies and relationships

  async dependencyAnalysis(input: ReasoningInput): Promise<ReasoningResult> {
    const startTime = Date.now();

    try {
      const dependencies = this.analyzeDependencies(input.context);

      await supabase.from('brain_events').insert({
        module: 'reasoning_engine',
        event_type: 'dependencies_analyzed',
        data: { 
          dependencies_found: dependencies.length,
          depth: input.depth || 'standard',
        },
        outcome: 'success',
      });

      return {
        success: true,
        stage: 'dependency_analysis',
        result: { dependencies },
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        stage: 'dependency_analysis',
        error: error instanceof Error ? error.message : 'Dependency analysis failed',
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  private analyzeDependencies(context: string): Array<{ source: string; target: string; weight: number }> {
    const deps: Array<{ source: string; target: string; weight: number }> = [];
    
    // Extract dependency patterns
    const patterns = [
      /(\w+)\s+(?:depends\s+on|requires|needs)\s+(\w+)/gi,
      /(\w+)\s+←\s+(\w+)/gi,
      /(\w+)\s+uses\s+(\w+)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(context)) !== null) {
        deps.push({
          source: match[1],
          target: match[2],
          weight: 0.8,
        });
      }
    }

    return deps;
  }

  // ═══ STAGE 3: HYPOTHESIS GENERATION ═══

  async hypothesisGeneration(input: ReasoningInput): Promise<ReasoningResult> {
    const startTime = Date.now();

    try {
      const hypotheses = this.generateHypotheses(input.context, input.domain);

      await supabase.from('brain_events').insert({
        module: 'reasoning_engine',
        event_type: 'hypothesis_generated',
        data: { 
          hypotheses_generated: hypotheses.length,
          domain: input.domain,
        },
        outcome: 'success',
      });

      return {
        success: true,
        stage: 'hypothesis_generation',
        result: { hypotheses },
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        stage: 'hypothesis_generation',
        error: error instanceof Error ? error.message : 'Hypothesis generation failed',
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  private generateHypotheses(context: string, domain?: string): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    // Generate hypothesis from context patterns
    const statements = context.split(/[.!?]/).filter(s => s.trim().length > 20);
    
    for (const statement of statements.slice(0, 5)) {
      hypotheses.push({
        id: crypto.randomUUID(),
        statement: `Hypothesis: ${statement.trim()} may indicate ${domain || 'system'} behavior`,
        confidence: 0.5 + Math.random() * 0.3,
        supporting_evidence: [],
        contradicting_evidence: [],
        status: 'pending',
      });
    }

    return hypotheses;
  }

  // ═══ STAGE 4: HYPOTHESIS VALIDATION ═══

  async hypothesisValidation(hypothesis: Hypothesis): Promise<ReasoningResult> {
    const startTime = Date.now();

    try {
      // Validate against existing knowledge
      const { data: memories } = await supabase
        .from('brain_memories')
        .select('content, confidence')
        .textSearch('content', hypothesis.statement.split(' ').slice(0, 5).join(' | '))
        .limit(10);

      const supporting = memories?.filter(m => (m.confidence || 0) > 0.6) || [];
      const contradicting = memories?.filter(m => (m.confidence || 0) < 0.4) || [];

      const validated = supporting.length > contradicting.length;
      const confidence = Math.min(0.95, 0.5 + (supporting.length - contradicting.length) * 0.1);

      hypothesis.supporting_evidence = supporting.map(m => m.content?.substring(0, 100) || '');
      hypothesis.contradicting_evidence = contradicting.map(m => m.content?.substring(0, 100) || '');
      hypothesis.status = validated ? 'validated' : (confidence > 0.4 ? 'uncertain' : 'rejected');
      hypothesis.confidence = confidence;

      await supabase.from('brain_events').insert({
        module: 'reasoning_engine',
        event_type: 'hypothesis_validated',
        data: { 
          hypothesis_id: hypothesis.id,
          supporting: supporting.length,
          contradicting: contradicting.length,
          confidence,
        },
        outcome: validated ? 'success' : 'rejected',
      });

      return {
        success: true,
        stage: 'hypothesis_validation',
        result: {
          validation: {
            hypothesis_id: hypothesis.id,
            passed: validated,
            confidence,
          },
        },
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        stage: 'hypothesis_validation',
        error: error instanceof Error ? error.message : 'Validation failed',
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  // ═══ STAGE 5: IMPACT PROJECTION ═══

  async impactProjection(scenario: string, causalLinks: CausalLink[]): Promise<ReasoningResult> {
    const startTime = Date.now();

    try {
      // Project impact based on causal chain
      const relevantLinks = causalLinks.filter(l => 
        scenario.toLowerCase().includes(l.cause.toLowerCase()) ||
        scenario.toLowerCase().includes(l.effect.toLowerCase())
      );

      const probability = Math.min(0.95, 0.3 + relevantLinks.length * 0.15);
      const severity = Math.min(10, 3 + relevantLinks.length * 2);

      await supabase.from('brain_events').insert({
        module: 'reasoning_engine',
        event_type: 'impact_projected',
        data: { 
          scenario,
          causal_links_used: relevantLinks.length,
          probability,
          severity,
        },
        outcome: 'success',
      });

      return {
        success: true,
        stage: 'impact_projection',
        result: {
          impact: { scenario, probability, severity },
        },
        processing_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        stage: 'impact_projection',
        error: error instanceof Error ? error.message : 'Impact projection failed',
        processing_time_ms: Date.now() - startTime,
      };
    }
  }

  // ═══ FULL CYCLE ═══

  async runCycle(input: ReasoningInput): Promise<{
    success: boolean;
    stages: ReasoningResult[];
    total_time_ms: number;
  }> {
    const startTime = Date.now();
    const stages: ReasoningResult[] = [];

    // Stage 1+2: Causal Mapping and Dependency Analysis are independent — run in parallel
    const [causalResult, depResult] = await Promise.all([
      this.causalMapping(input),
      this.dependencyAnalysis(input),
    ]);
    stages.push(causalResult, depResult);

    // Stage 3: Hypothesis Generation
    const hypResult = await this.hypothesisGeneration(input);
    stages.push(hypResult);

    // Stage 4: Validate first hypothesis if any
    if (hypResult.result?.hypotheses?.length) {
      const valResult = await this.hypothesisValidation(hypResult.result.hypotheses[0]);
      stages.push(valResult);
    }

    // Stage 5: Impact Projection
    if (causalResult.result?.causal_links?.length) {
      const impResult = await this.impactProjection(input.context, causalResult.result.causal_links);
      stages.push(impResult);
    }

    return {
      success: stages.every(s => s.success),
      stages,
      total_time_ms: Date.now() - startTime,
    };
  }

  // ═══ LEGACY ALIASES ═══

  /** @deprecated Use causalMapping() instead */
  async causal(context: string): Promise<ReasoningResult> {
    console.warn('Deprecation: brain.causal() is aliased to reasoningEngine.causalMapping()');
    return this.causalMapping({ context });
  }

  /** @deprecated Use dependencyAnalysis() instead */
  async systemsReason(context: string): Promise<ReasoningResult> {
    console.warn('Deprecation: brain.systems_reason() is aliased to reasoningEngine.dependencyAnalysis()');
    return this.dependencyAnalysis({ context });
  }

  /** @deprecated Use hypothesisGeneration() + hypothesisValidation() instead */
  async hypothesisTest(hypothesis: string): Promise<ReasoningResult> {
    console.warn('Deprecation: brain.hypothesis_test() is aliased to reasoningEngine.hypothesisValidation()');
    const hypObj: Hypothesis = {
      id: crypto.randomUUID(),
      statement: hypothesis,
      confidence: 0.5,
      supporting_evidence: [],
      contradicting_evidence: [],
      status: 'pending',
    };
    return this.hypothesisValidation(hypObj);
  }
}

// Singleton export
export const reasoningEngine = ReasoningEngineClient.getInstance();
