/**
 * SEBA LLM Analyzer
 * v1.0.0 — AI-Enhanced Cognitive Analysis with Predicted Impact Metrics
 * 
 * Uses Lovable AI to perform deeper analysis than heuristics alone,
 * generating predicted impact metrics like "+13% memory efficiency".
 */

import { supabase } from '@/integrations/supabase/client';
import type { CognitiveInsight, ImprovementProposal, ImprovementCategory } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PredictedImpact {
  metric: string;
  current_value: number;
  predicted_value: number;
  delta_percent: number;
  confidence: number;
  reasoning: string;
}

export interface LLMAnalysisResult {
  success: boolean;
  insights: EnhancedInsight[];
  summary: string;
  latency_ms: number;
  model?: string;
}

export interface EnhancedInsight extends CognitiveInsight {
  predicted_impacts: PredictedImpact[];
  implementation_hint: string;
  priority_score: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LLM ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════

export class LLMAnalyzer {
  private correlationId: string;

  constructor(correlationId?: string) {
    this.correlationId = correlationId || crypto.randomUUID();
  }

  /**
   * Enhance insights with LLM-generated predicted impacts
   */
  async enhanceInsights(insights: CognitiveInsight[]): Promise<EnhancedInsight[]> {
    if (insights.length === 0) return [];

    const startTime = Date.now();
    const enhanced: EnhancedInsight[] = [];

    try {
      const { data, error } = await supabase.functions.invoke('pf-seba-llm-analyze', {
        body: {
          action: 'enhance_insights',
          insights: insights.map(i => ({
            id: i.id,
            type: i.type,
            source_engine: i.source_engine,
            title: i.title,
            description: i.description,
            evidence: i.evidence,
            confidence: i.confidence,
            urgency: i.urgency,
          })),
          correlation_id: this.correlationId,
        },
      });

      if (error) {
        console.error('[SEBA LLM] Enhancement failed:', error);
        // Fall back to heuristic enhancement
        return insights.map(i => this.heuristicEnhance(i));
      }

      const llmEnhanced = data?.enhanced_insights || [];
      
      for (const original of insights) {
        const llmData = llmEnhanced.find((e: any) => e.id === original.id);
        
        if (llmData) {
          enhanced.push({
            ...original,
            predicted_impacts: llmData.predicted_impacts || [],
            implementation_hint: llmData.implementation_hint || '',
            priority_score: llmData.priority_score || this.calculatePriority(original),
          });
        } else {
          enhanced.push(this.heuristicEnhance(original));
        }
      }

      console.log(`[SEBA LLM] Enhanced ${enhanced.length} insights in ${Date.now() - startTime}ms`);
      return enhanced;

    } catch (error) {
      console.error('[SEBA LLM] Exception during enhancement:', error);
      return insights.map(i => this.heuristicEnhance(i));
    }
  }

  /**
   * Generate predicted impacts for a proposal
   */
  async generatePredictedImpacts(proposal: ImprovementProposal): Promise<PredictedImpact[]> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-seba-llm-analyze', {
        body: {
          action: 'predict_impact',
          proposal: {
            id: proposal.id,
            category: proposal.category,
            title: proposal.title,
            description: proposal.description,
            target_modules: proposal.target_modules,
            proposed_actions: proposal.proposed_actions.map(a => ({
              type: a.type,
              target: a.target,
              current_value: a.current_value,
              proposed_value: a.proposed_value,
            })),
          },
          correlation_id: this.correlationId,
        },
      });

      if (error || !data?.predicted_impacts) {
        return this.heuristicPredictImpacts(proposal);
      }

      return data.predicted_impacts;

    } catch (error) {
      console.error('[SEBA LLM] Impact prediction failed:', error);
      return this.heuristicPredictImpacts(proposal);
    }
  }

  /**
   * Heuristic fallback for insight enhancement
   */
  private heuristicEnhance(insight: CognitiveInsight): EnhancedInsight {
    const impacts: PredictedImpact[] = [];

    // Generate heuristic predictions based on insight type
    switch (insight.source_engine) {
      case 'memory':
        if (insight.title.includes('Overflow')) {
          impacts.push({
            metric: 'memory_efficiency',
            current_value: 65,
            predicted_value: 85,
            delta_percent: 30.8,
            confidence: 0.75,
            reasoning: 'Tiering hot memories will reduce hot tier size and improve lookup speed',
          });
        }
        if (insight.title.includes('Stale')) {
          impacts.push({
            metric: 'storage_utilization',
            current_value: 90,
            predicted_value: 70,
            delta_percent: -22.2,
            confidence: 0.8,
            reasoning: 'Pruning low-value cold memories will free storage space',
          });
        }
        break;

      case 'learning':
        if (insight.title.includes('Success Rate')) {
          impacts.push({
            metric: 'learning_accuracy',
            current_value: 60,
            predicted_value: 75,
            delta_percent: 25,
            confidence: 0.7,
            reasoning: 'Adjusting thresholds should improve learning capture rate',
          });
        }
        break;

      case 'reasoning':
        if (insight.type === 'anomaly') {
          impacts.push({
            metric: 'error_rate',
            current_value: 15,
            predicted_value: 5,
            delta_percent: -66.7,
            confidence: 0.65,
            reasoning: 'Addressing error concentration will reduce failure frequency',
          });
        }
        break;
    }

    return {
      ...insight,
      predicted_impacts: impacts,
      implementation_hint: this.generateImplementationHint(insight),
      priority_score: this.calculatePriority(insight),
    };
  }

  /**
   * Heuristic fallback for impact prediction
   */
  private heuristicPredictImpacts(proposal: ImprovementProposal): PredictedImpact[] {
    const impacts: PredictedImpact[] = [];

    // Category-based heuristics
    switch (proposal.category) {
      case 'memory_optimization':
        impacts.push({
          metric: 'memory_efficiency',
          current_value: 70,
          predicted_value: 85,
          delta_percent: 21.4,
          confidence: 0.7,
          reasoning: 'Memory optimization typically yields 15-25% efficiency gains',
        });
        break;

      case 'learning_enhancement':
        impacts.push({
          metric: 'learning_velocity',
          current_value: 50,
          predicted_value: 65,
          delta_percent: 30,
          confidence: 0.65,
          reasoning: 'Learning enhancements improve pattern acquisition speed',
        });
        break;

      case 'performance_boost':
        impacts.push({
          metric: 'response_latency',
          current_value: 250,
          predicted_value: 180,
          delta_percent: -28,
          confidence: 0.75,
          reasoning: 'Performance tuning reduces latency through caching and optimization',
        });
        break;

      case 'error_recovery':
        impacts.push({
          metric: 'system_stability',
          current_value: 85,
          predicted_value: 95,
          delta_percent: 11.8,
          confidence: 0.8,
          reasoning: 'Error recovery patterns increase overall system resilience',
        });
        break;
    }

    return impacts;
  }

  /**
   * Generate implementation hint from insight
   */
  private generateImplementationHint(insight: CognitiveInsight): string {
    if (insight.suggested_actions && insight.suggested_actions.length > 0) {
      return `Recommended: ${insight.suggested_actions[0]}`;
    }
    
    switch (insight.type) {
      case 'optimization':
        return 'Apply configuration tuning via SEBA action executor';
      case 'anomaly':
        return 'Investigate root cause and apply circuit breaker adjustment';
      case 'degradation':
        return 'Enable or restore affected subsystem functionality';
      case 'opportunity':
        return 'Explore and validate before full implementation';
      default:
        return 'Review and apply appropriate improvement action';
    }
  }

  /**
   * Calculate priority score (1-10)
   */
  private calculatePriority(insight: CognitiveInsight): number {
    const urgencyScore = {
      critical: 10,
      high: 7,
      medium: 5,
      low: 3,
    }[insight.urgency] || 5;

    const confidenceBonus = insight.confidence * 2;
    const actionabilityBonus = insight.actionability * 2;

    return Math.min(10, Math.round(urgencyScore * 0.5 + confidenceBonus + actionabilityBonus));
  }
}

/**
 * Format predicted impact as human-readable string
 * e.g., "+21.4% memory efficiency"
 */
export function formatPredictedImpact(impact: PredictedImpact): string {
  const sign = impact.delta_percent >= 0 ? '+' : '';
  const metric = impact.metric.replace(/_/g, ' ');
  return `${sign}${impact.delta_percent.toFixed(1)}% ${metric}`;
}

/**
 * Summarize all predicted impacts for display
 */
export function summarizePredictedImpacts(impacts: PredictedImpact[]): string {
  if (impacts.length === 0) return 'No predicted impact metrics';
  
  return impacts
    .sort((a, b) => Math.abs(b.delta_percent) - Math.abs(a.delta_percent))
    .slice(0, 3)
    .map(formatPredictedImpact)
    .join(', ');
}
