/**
 * CMPSBL® BRAIN — Cost Tracker
 * Logs token usage per model and optimizes routing for cost efficiency
 */

import { supabase } from '@/integrations/supabase/client';

export interface ModelCost {
  model: string;
  provider: 'groq' | 'cerebras' | 'together' | 'deepseek' | 'hyperbolic';
  costPerToken: number;
  avgLatency: number;
  successRate: number;
}

export const MODEL_COSTS: ModelCost[] = [
  { model: 'groq/llama-3.3-70b', provider: 'groq', costPerToken: 0, avgLatency: 150, successRate: 0.98 },
  { model: 'cerebras/llama-3.3-70b', provider: 'cerebras', costPerToken: 0, avgLatency: 200, successRate: 0.96 },
  { model: 'together/llama-3.1-70b-turbo', provider: 'together', costPerToken: 0, avgLatency: 250, successRate: 0.95 },
  { model: 'deepseek/deepseek-chat', provider: 'deepseek', costPerToken: 0, avgLatency: 300, successRate: 0.94 },
  { model: 'hyperbolic/llama-3.1-70b', provider: 'hyperbolic', costPerToken: 0, avgLatency: 350, successRate: 0.92 },
];

/**
 * Get the cheapest viable model for a given task complexity
 */
export function getCheapestModel(
  complexity: 'low' | 'medium' | 'high',
  requiresSearch: boolean = false
): ModelCost {
  if (requiresSearch) {
    return MODEL_COSTS.find(m => m.provider === 'together') || MODEL_COSTS[0];
  }
  
  const complexityMap = {
    low: ['groq', 'cerebras'],
    medium: ['groq', 'cerebras', 'together'],
    high: ['together', 'deepseek', 'hyperbolic'],
  };
  
  const viableProviders = complexityMap[complexity];
  const viableModels = MODEL_COSTS.filter(m => viableProviders.includes(m.provider));
  
  // Sort by cost, then by success rate
  viableModels.sort((a, b) => {
    const costDiff = a.costPerToken - b.costPerToken;
    if (Math.abs(costDiff) < 0.0000001) {
      return b.successRate - a.successRate;
    }
    return costDiff;
  });
  
  return viableModels[0] || MODEL_COSTS[0];
}

/**
 * Calculate cost for a given token count
 */
export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const modelCost = MODEL_COSTS.find(m => m.model === model);
  if (!modelCost) return 0;
  
  return (inputTokens + outputTokens) * modelCost.costPerToken;
}

/**
 * Log feedback for model performance
 */
export async function logModelFeedback(
  requestId: string,
  model: string,
  tokensUsed: number,
  successRating: number,
  reason?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('brain_feedback')
      .insert({
        request_id: requestId,
        model,
        tokens_used: tokensUsed,
        success_rating: successRating,
        reason_for_rating: reason,
      });
    
    if (error) {
      console.error('Failed to log model feedback:', error);
    }
  } catch (err) {
    console.error('Error logging feedback:', err);
  }
}

/**
 * Get model performance statistics
 */
export async function getModelStats(
  model: string,
  days: number = 30
): Promise<{
  avgTokens: number;
  avgRating: number;
  totalCalls: number;
  estimatedCost: number;
} | null> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('brain_feedback')
      .select('tokens_used, success_rating')
      .eq('model', model)
      .gte('created_at', cutoffDate.toISOString());
    
    if (error || !data || data.length === 0) {
      return null;
    }
    
    const totalTokens = data.reduce((sum, row) => sum + (row.tokens_used || 0), 0);
    const totalRating = data.reduce((sum, row) => sum + (row.success_rating || 0), 0);
    
    const modelCost = MODEL_COSTS.find(m => m.model === model);
    const estimatedCost = modelCost ? totalTokens * modelCost.costPerToken : 0;
    
    return {
      avgTokens: totalTokens / data.length,
      avgRating: totalRating / data.length,
      totalCalls: data.length,
      estimatedCost,
    };
  } catch (err) {
    console.error('Error getting model stats:', err);
    return null;
  }
}

/**
 * Determine task complexity from content
 */
export function assessComplexity(content: string, context: string): 'low' | 'medium' | 'high' {
  const length = content.length;
  
  // Context-based complexity
  if (context === 'code') {
    if (content.includes('architecture') || content.includes('refactor')) return 'high';
    if (content.includes('function') || content.includes('implement')) return 'medium';
    return 'low';
  }
  
  if (context === 'plan') return 'high';
  if (context === 'doc') return 'medium';
  
  // Length-based fallback
  if (length > 2000) return 'high';
  if (length > 500) return 'medium';
  return 'low';
}

/**
 * Batch small tasks to save tokens
 */
export function shouldBatchTask(tasks: any[]): boolean {
  if (tasks.length < 3) return false;
  
  const totalTokens = tasks.reduce((sum, task) => {
    return sum + (task.content?.length || 0) / 4; // Rough token estimate
  }, 0);
  
  // Batch if total is under 2000 tokens
  return totalTokens < 2000;
}
