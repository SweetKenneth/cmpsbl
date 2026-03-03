/**
 * PFV Port → Cost-Aware Model Selector
 * Complexity-based model mapping, batching heuristics, performance tracking
 * Benefits: NEXUS, ECONOMY
 * Source: PromptFluid-Vision brain/costTracker.ts
 */

import { supabase } from '@/integrations/supabase/client';

export interface ModelCost {
  model: string;
  provider: string;
  costPerToken: number;
  avgLatency: number;
  successRate: number;
}

/**
 * Substrate-native model cost registry
 * Routes through NEXUS — no direct Lovable AI usage
 */
export const MODEL_COSTS: ModelCost[] = [
  { model: 'nexus/flash', provider: 'nexus', costPerToken: 0.0000005, avgLatency: 300, successRate: 0.98 },
  { model: 'nexus/pro', provider: 'nexus', costPerToken: 0.000003, avgLatency: 800, successRate: 0.99 },
  { model: 'groq/llama-3.1-70b', provider: 'groq', costPerToken: 0.00000059, avgLatency: 200, successRate: 0.95 },
  { model: 'anthropic/claude-sonnet', provider: 'anthropic', costPerToken: 0.000003, avgLatency: 800, successRate: 0.99 },
  { model: 'openai/gpt-4o', provider: 'openai', costPerToken: 0.0000025, avgLatency: 600, successRate: 0.97 },
];

/**
 * Get cheapest viable model for given complexity
 */
export function getCheapestModel(
  complexity: 'low' | 'medium' | 'high',
  requiresSearch: boolean = false
): ModelCost {
  if (requiresSearch) {
    return MODEL_COSTS.find(m => m.provider === 'nexus') || MODEL_COSTS[0];
  }

  const viableProviders: Record<string, string[]> = {
    low: ['nexus', 'groq'],
    medium: ['nexus', 'groq', 'openai'],
    high: ['anthropic', 'openai'],
  };

  const viable = MODEL_COSTS.filter(m => viableProviders[complexity].includes(m.provider));

  viable.sort((a, b) => {
    const diff = a.costPerToken - b.costPerToken;
    return Math.abs(diff) < 0.0000001 ? b.successRate - a.successRate : diff;
  });

  return viable[0] || MODEL_COSTS[0];
}

/**
 * Calculate cost for token usage
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const mc = MODEL_COSTS.find(m => m.model === model);
  return mc ? (inputTokens + outputTokens) * mc.costPerToken : 0;
}

/**
 * Assess task complexity from content + context
 */
export function assessComplexity(content: string, context: string): 'low' | 'medium' | 'high' {
  if (context === 'code') {
    if (content.includes('architecture') || content.includes('refactor')) return 'high';
    if (content.includes('function') || content.includes('implement')) return 'medium';
    return 'low';
  }
  if (context === 'plan') return 'high';
  if (context === 'doc') return 'medium';
  if (content.length > 2000) return 'high';
  if (content.length > 500) return 'medium';
  return 'low';
}

/**
 * Determine if tasks should be batched to save tokens
 */
export function shouldBatchTasks(tasks: { content?: string }[]): boolean {
  if (tasks.length < 3) return false;
  const totalTokens = tasks.reduce((sum, t) => sum + (t.content?.length || 0) / 4, 0);
  return totalTokens < 2000;
}

/**
 * Log model performance feedback
 */
export async function logModelFeedback(
  requestId: string,
  model: string,
  tokensUsed: number,
  successRating: number,
  reason?: string
): Promise<void> {
  try {
    await supabase.from('brain_feedback').insert({
      request_id: requestId,
      model,
      tokens_used: tokensUsed,
      success_rating: successRating,
      reason_for_rating: reason,
    });
  } catch (err) {
    console.error('[COST-SELECTOR] Feedback log error:', err);
  }
}

/**
 * Get model performance stats over a period
 */
export async function getModelStats(model: string, days: number = 30) {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const { data, error } = await supabase
      .from('brain_feedback')
      .select('tokens_used, success_rating')
      .eq('model', model)
      .gte('created_at', cutoff.toISOString());

    if (error || !data?.length) return null;

    const totalTokens = data.reduce((s, r) => s + (r.tokens_used || 0), 0);
    const totalRating = data.reduce((s, r) => s + (r.success_rating || 0), 0);
    const mc = MODEL_COSTS.find(m => m.model === model);

    return {
      avgTokens: totalTokens / data.length,
      avgRating: totalRating / data.length,
      totalCalls: data.length,
      estimatedCost: mc ? totalTokens * mc.costPerToken : 0,
    };
  } catch {
    return null;
  }
}
