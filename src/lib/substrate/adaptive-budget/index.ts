/**
 * Adaptive Budget Allocation v1.1.0
 * Dynamically shifts token/cost budgets based on module activity and value
 * 
 * Fleet capacity (80% of raw free-tier RPD):
 *   Groq: 640 | Cerebras: 9,216 | SambaNova: 26 | Google AI Studio: 1,200
 *   DeepSeek: 79,999 | Together: 79,999 | OpenRouter×3: 384 
 *   Mistral Studio: 424 | Cohere Trial: 21 | Hyperbolic: 63,999
 *   Total governed RPD: ~235,908 → token pool scaled accordingly
 */

import { supabase } from '@/integrations/supabase/client';

export interface ModuleBudget {
  module: string;
  dailyTokenLimit: number;
  tokensUsedToday: number;
  utilizationRate: number;
  valueScore: number;     // 0-1, based on recent success
  adjustedLimit: number;  // After rebalancing
}

// 80% of estimated daily token capacity across all free-tier providers
// (~235k RPD × ~1500 avg tokens × 0.8 safety = ~282M, capped conservatively)
const BASE_DAILY_BUDGET = 250000; // Total daily token pool (governed at 80%)
const MODULE_LIST = [
  // Kernel
  'core', 'ripple', 'access',
  // Cognitive
  'brain', 'decode', 'dream',
  // Operational
  'defense', 'nexus', 'vision', 'encode',
  // Administrative
  'system', 'modernizer', 'integration', 'inclusive',
  // Orchestrator
  'cortex', 'atlas',
  // Infrastructure
  'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox',
];

/**
 * Calculate value scores from recent brain_events
 */
async function calculateValueScores(): Promise<Record<string, number>> {
  const scores: Record<string, number> = {};
  
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 48);
  
  const { data: events } = await supabase
    .from('brain_events')
    .select('module, outcome')
    .gte('created_at', cutoff.toISOString())
    .limit(1000);
  
  if (!events?.length) {
    // Equal distribution if no data
    for (const m of MODULE_LIST) scores[m] = 1 / MODULE_LIST.length;
    return scores;
  }
  
  const moduleCounts: Record<string, { total: number; success: number }> = {};
  
  for (const e of events) {
    if (!moduleCounts[e.module]) moduleCounts[e.module] = { total: 0, success: 0 };
    moduleCounts[e.module].total++;
    if (e.outcome === 'success') moduleCounts[e.module].success++;
  }
  
  // Score = activity_weight * success_rate
  let totalScore = 0;
  for (const m of MODULE_LIST) {
    const c = moduleCounts[m] || { total: 0, success: 0 };
    const activityWeight = Math.log2(c.total + 1);
    const successRate = c.total > 0 ? c.success / c.total : 0.5;
    scores[m] = activityWeight * successRate;
    totalScore += scores[m];
  }
  
  // Normalize
  if (totalScore > 0) {
    for (const m of MODULE_LIST) {
      scores[m] = scores[m] / totalScore;
    }
  }
  
  return scores;
}

/**
 * Get current budget allocations with adaptive rebalancing
 */
export async function getAdaptiveBudgets(): Promise<ModuleBudget[]> {
  const valueScores = await calculateValueScores();
  const basePer = Math.floor(BASE_DAILY_BUDGET / MODULE_LIST.length);
  
  // Get today's usage from ai_daily_quota
  const today = new Date().toISOString().split('T')[0];
  const { data: quotas } = await supabase
    .from('ai_daily_quota')
    .select('*')
    .eq('date', today);
  
  const usageMap: Record<string, number> = {};
  for (const q of quotas || []) {
    usageMap[q.provider] = (usageMap[q.provider] || 0) + (q.tokens_used || 0);
  }
  
  return MODULE_LIST.map(module => {
    const valueScore = valueScores[module] || 1 / MODULE_LIST.length;
    // Adaptive: shift up to 2x budget to high-value modules
    const adjustedLimit = Math.floor(basePer * (0.5 + valueScore * MODULE_LIST.length));
    const tokensUsed = usageMap[module] || 0;
    
    return {
      module,
      dailyTokenLimit: basePer,
      tokensUsedToday: tokensUsed,
      utilizationRate: basePer > 0 ? tokensUsed / basePer : 0,
      valueScore,
      adjustedLimit: Math.max(adjustedLimit, Math.floor(basePer * 0.3)), // Min 30% of base
    };
  });
}

/**
 * Check if a module has budget remaining
 */
export async function hasBudget(module: string): Promise<boolean> {
  const budgets = await getAdaptiveBudgets();
  const b = budgets.find(x => x.module === module);
  if (!b) return true; // Unknown module, allow
  return b.tokensUsedToday < b.adjustedLimit;
}
