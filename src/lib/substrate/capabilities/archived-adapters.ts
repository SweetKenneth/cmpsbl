/**
 * Archived Edge Function Adapters
 * v6.9.1 — Wires 10 archived functions into the capability engine
 * 
 * These adapters provide TypeScript interfaces to the legacy edge functions
 * that have been integrated into the substrate architecture.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// ADAPTER TYPES
// ============================================================================

export interface HypothesisTestResult {
  primary_hypothesis: string;
  if_then_scenarios: Array<{ if: string; then: string; probability: number }>;
  counter_scenarios: Array<{ scenario: string; probability: number }>;
  evidence_required: string[];
  confidence_score: number;
  recommendation: 'proceed' | 'test_further' | 'reject';
}

export interface SystemsReasoningResult {
  root_causes: string[];
  dependencies: { upstream: string[]; downstream: string[] };
  bottlenecks: string[];
  cascading_effects: string[];
  fix_priorities: string[];
}

export interface SelfCritiqueResult {
  clarity: number;
  accuracy: number;
  aesthetics: number;
  completeness: number;
  overall: number;
  improvements: string[];
  revised_output: string | null;
  quality_passed: boolean;
}

export interface PatternFusionResult {
  domain_1_patterns: string[];
  domain_2_patterns: string[];
  fusion_concepts: string[];
  novel_solutions: string[];
  best_solution: {
    solution: string;
    originality_score: number;
    implementation: string;
  };
}

export interface AnomalyDetectionResult {
  anomalies: Array<{
    event_id: string;
    timestamp: string;
    risk_score: number;
    action: string;
    ip_address: string;
    anomaly_score: number;
    confidence: number;
  }>;
  total_anomalies: number;
  baseline_events: number;
  statistics: {
    avg_risk_score: string;
    std_dev_risk_score: string;
    avg_requests_per_hour: string;
    unique_fingerprints: number;
  };
}

export interface ResilienceMonitorResult {
  ok: boolean;
  errors_analyzed: number;
  fixes_proposed: number;
  auto_applied: number;
}

export interface TemporalScoreResult {
  ranked_memories: Array<{
    id: string;
    content: string;
    age_months: number;
    freshness_score: number;
    temporal_priority: 'high' | 'medium' | 'contextual';
  }>;
  temporal_stats: {
    high_priority: number;
    medium_priority: number;
    contextual: number;
  };
}

export interface EthicalBoundaryResult {
  legal_risk: 'low' | 'medium' | 'high' | 'critical';
  reputation_risk: 'low' | 'medium' | 'high' | 'critical';
  ethical_concerns: string[];
  compliance_status: 'compliant' | 'grey_area' | 'non_compliant';
  alternative_paths: string[];
  proceed_recommendation: 'yes' | 'with_caution' | 'no';
  reasoning: string;
}

export interface ImprovementEngineResult {
  ok: boolean;
  domain: string;
  study: {
    domain: string;
    internal_functions: string[];
    external_sources: string[];
    priority_score: number;
    recommendation: string;
    estimated_impact: string;
    dev_time_estimate: string;
  };
  analysis: {
    top_function: string;
    integration_approach: string;
    expected_benefit: string;
    priority_score: number;
    dev_hours: string;
    dependencies: string[];
    cascade_insight: string;
  };
}

export interface CuriosityReflectResult {
  success: boolean;
  reflected: number;
  archived: number;
  total_analyzed: number;
}

// ============================================================================
// ADAPTER FUNCTIONS
// ============================================================================

/**
 * 1. Hypothesis Validation — Tests claims with IF-THEN scenarios
 */
export async function invokeHypothesisTest(
  claim: string,
  strategy?: string,
  context?: Record<string, unknown>
): Promise<{ success: boolean; hypothesis_test: HypothesisTestResult; provider?: string }> {
  const { data, error } = await supabase.functions.invoke('pf-brain-hypothesis-test', {
    body: { claim, strategy, context },
  });
  
  if (error) throw new Error(`Hypothesis test failed: ${error.message}`);
  return data;
}

/**
 * 2. Systems Causal Analysis — Maps multi-layer dependencies
 */
export async function invokeSystemsReasoning(
  system: string,
  issue: string
): Promise<{ success: boolean; analysis: SystemsReasoningResult; provider?: string }> {
  const { data, error } = await supabase.functions.invoke('pf-brain-systems-reasoning', {
    body: { system, issue },
  });
  
  if (error) throw new Error(`Systems reasoning failed: ${error.message}`);
  return data;
}

/**
 * 3. Autonomous Quality Review — Self-critiques outputs
 */
export async function invokeSelfCritique(
  output: string,
  outputType?: string,
  taskContext?: Record<string, unknown>
): Promise<{ success: boolean; critique: SelfCritiqueResult; final_output: string }> {
  const { data, error } = await supabase.functions.invoke('pf-brain-self-critique', {
    body: { output, output_type: outputType, task_context: taskContext },
  });
  
  if (error) throw new Error(`Self-critique failed: ${error.message}`);
  return data;
}

/**
 * 4. Pattern Fusion Synthesis — Merges cross-domain insights
 */
export async function invokePatternFusion(
  problem: string,
  domain1: string,
  domain2: string
): Promise<{ success: boolean; fusion: PatternFusionResult; provider?: string }> {
  const { data, error } = await supabase.functions.invoke('pf-brain-pattern-fusion', {
    body: { problem, domain_1: domain1, domain_2: domain2 },
  });
  
  if (error) throw new Error(`Pattern fusion failed: ${error.message}`);
  return data;
}

/**
 * 5. Behavioral Drift Detection — Statistical anomaly analysis
 */
export async function invokeAnomalyDetection(
  lookbackHours: number = 24
): Promise<AnomalyDetectionResult> {
  const { data, error } = await supabase.functions.invoke('pf-defense-anomaly-detection', {
    body: { lookbackHours },
  });
  
  if (error) throw new Error(`Anomaly detection failed: ${error.message}`);
  return data;
}

/**
 * 6. Resilience Orchestration — Auto-heal failures
 */
export async function invokeResilienceMonitor(): Promise<ResilienceMonitorResult> {
  const { data, error } = await supabase.functions.invoke('pf-resilience-monitor', {
    body: {},
  });
  
  if (error) throw new Error(`Resilience monitor failed: ${error.message}`);
  return data;
}

/**
 * 7. Temporal Memory Scoring — Time-weighted relevance
 */
export async function invokeTemporalScore(
  query: string,
  contextType?: string
): Promise<{ success: boolean } & TemporalScoreResult> {
  const { data, error } = await supabase.functions.invoke('pf-brain-temporal-score', {
    body: { query, context_type: contextType },
  });
  
  if (error) throw new Error(`Temporal scoring failed: ${error.message}`);
  return data;
}

/**
 * 8. Ethical Guardrails — Risk evaluation before action
 */
export async function invokeEthicalBoundary(
  proposedAction: string,
  context?: Record<string, unknown>
): Promise<{ success: boolean; ethical_analysis: EthicalBoundaryResult }> {
  const { data, error } = await supabase.functions.invoke('pf-brain-ethical-boundary', {
    body: { proposed_action: proposedAction, context },
  });
  
  if (error) throw new Error(`Ethical boundary check failed: ${error.message}`);
  return data;
}

/**
 * 9. Continuous Improvement Engine — Generate upgrade proposals
 */
export async function invokeImprovementEngine(
  focusDomain?: string,
  force?: boolean
): Promise<ImprovementEngineResult> {
  const { data, error } = await supabase.functions.invoke('pf-cascade-improvement-engine', {
    body: { focus_domain: focusDomain, force },
  });
  
  if (error) throw new Error(`Improvement engine failed: ${error.message}`);
  return data;
}

/**
 * 10. Active Learning Triggers — Curiosity-driven exploration
 */
export async function invokeCuriosityReflect(
  forceReflection?: boolean,
  minCuriosityScore?: number
): Promise<CuriosityReflectResult> {
  const { data, error } = await supabase.functions.invoke('pf-brain-curiosity-reflect', {
    body: { force_reflection: forceReflection, min_curiosity_score: minCuriosityScore },
  });
  
  if (error) throw new Error(`Curiosity reflection failed: ${error.message}`);
  return data;
}

// ============================================================================
// UNIFIED ADAPTER MAP
// ============================================================================

export const archivedAdapters = {
  hypothesisTest: invokeHypothesisTest,
  systemsReasoning: invokeSystemsReasoning,
  selfCritique: invokeSelfCritique,
  patternFusion: invokePatternFusion,
  anomalyDetection: invokeAnomalyDetection,
  resilienceMonitor: invokeResilienceMonitor,
  temporalScore: invokeTemporalScore,
  ethicalBoundary: invokeEthicalBoundary,
  improvementEngine: invokeImprovementEngine,
  curiosityReflect: invokeCuriosityReflect,
};

export default archivedAdapters;
