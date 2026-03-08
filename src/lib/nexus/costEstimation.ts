/**
 * NEXUS Cost Estimation Engine
 * Budget Governance & Predictive Pricing
 * 
 * Missing capability: Pre-request cost estimation and
 * budget-aware routing decisions.
 */

import { supabase } from '@/integrations/supabase/client';
import type { SupportedProvider } from './index';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CostEstimate {
  provider: SupportedProvider;
  model: string;
  estimatedCost: number; // in millicents
  inputTokens: number;
  outputTokens: number;
  confidence: number;
  breakdown: {
    inputCost: number;
    outputCost: number;
    overhead: number;
  };
}

export interface BudgetConfig {
  dailyLimit: number; // millicents
  monthlyLimit: number;
  perRequestLimit: number;
  warningThreshold: number; // 0-1
  alertThreshold: number;
  hardStop: boolean;
}

export interface BudgetStatus {
  dailySpent: number;
  dailyRemaining: number;
  monthlySpent: number;
  monthlyRemaining: number;
  isWithinBudget: boolean;
  warningLevel: 'none' | 'approaching' | 'critical' | 'exceeded';
  projectedDailySpend: number;
}

export interface CostReport {
  period: 'day' | 'week' | 'month';
  totalSpent: number;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
  byCategory: Record<string, number>;
  requestCount: number;
  avgCostPerRequest: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

// Provider pricing (millicents per 1K tokens)
const PROVIDER_PRICING: Record<string, { input: number; output: number }> = {
  groq: { input: 0.5, output: 1.0 },
  together: { input: 0.8, output: 1.5 },
  cerebras: { input: 0.3, output: 0.6 },
  openrouter: { input: 2.0, output: 4.0 },
  google: { input: 1.0, output: 2.0 },
  deepseek: { input: 0.5, output: 1.0 },
  mistral: { input: 0.5, output: 1.5 },
  cohere: { input: 0.4, output: 1.2 },
  hyperbolic: { input: 0.3, output: 0.8 },
  sambanova: { input: 0, output: 0 }, // Free tier
  stability: { input: 0, output: 50.0 }, // Per image
  fal: { input: 0, output: 30.0 }, // Per image
};

// Default budget config
const DEFAULT_BUDGET: BudgetConfig = {
  dailyLimit: 500000, // $5
  monthlyLimit: 10000000, // $100
  perRequestLimit: 50000, // $0.50
  warningThreshold: 0.7,
  alertThreshold: 0.9,
  hardStop: true,
};

// In-memory spending tracker (capped to prevent unbounded growth)
const MAX_TRACKER_ENTRIES = 60;
const spendingTracker = {
  daily: new Map<string, number>(),
  monthly: new Map<string, number>(),
};

function pruneTracker(map: Map<string, number>, maxEntries: number): void {
  if (map.size <= maxEntries) return;
  const sorted = [...map.keys()].sort();
  const toRemove = sorted.slice(0, map.size - maxEntries);
  toRemove.forEach(k => map.delete(k));
}

// ═══════════════════════════════════════════════════════════════════════════════
// COST ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate cost before making a request
 */
export function estimateCost(
  provider: SupportedProvider,
  model: string,
  inputText: string,
  expectedOutputTokens?: number
): CostEstimate {
  // Estimate input tokens (rough: 4 chars per token)
  const inputTokens = Math.ceil(inputText.length / 4);
  const outputTokens = expectedOutputTokens ?? Math.ceil(inputTokens * 1.5);

  const pricing = PROVIDER_PRICING[provider] || { input: 1.0, output: 2.0 };
  
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  const overhead = (inputCost + outputCost) * 0.05; // 5% overhead

  return {
    provider,
    model,
    estimatedCost: Math.ceil(inputCost + outputCost + overhead),
    inputTokens,
    outputTokens,
    confidence: 0.8,
    breakdown: {
      inputCost: Math.ceil(inputCost),
      outputCost: Math.ceil(outputCost),
      overhead: Math.ceil(overhead),
    },
  };
}

/**
 * Find cheapest provider for a task
 */
export function findCheapestProvider(
  taskType: 'text' | 'image' | 'code' | 'research',
  inputTokens: number,
  qualityRequirement: 'low' | 'medium' | 'high' = 'medium'
): { provider: SupportedProvider; estimatedCost: number } {
  const candidates: Array<{ provider: SupportedProvider; estimatedCost: number }> = [];

  for (const [provider, pricing] of Object.entries(PROVIDER_PRICING)) {
    // Skip providers that don't support the task type
    if (taskType === 'image' && !['stability', 'fal', 'google'].includes(provider)) {
      continue;
    }
    if (taskType !== 'image' && ['stability', 'fal'].includes(provider)) {
      continue;
    }

    const estimatedCost = (inputTokens / 1000) * pricing.input + (inputTokens * 1.5 / 1000) * pricing.output;
    candidates.push({ provider: provider as SupportedProvider, estimatedCost });
  }

  // Sort by cost and filter by quality
  candidates.sort((a, b) => a.estimatedCost - b.estimatedCost);

  // Quality filter
  if (qualityRequirement === 'high') {
    const highQuality = candidates.filter(c => 
      ['google', 'groq', 'deepseek', 'openrouter'].includes(c.provider)
    );
    return highQuality[0] || candidates[0];
  }

  return candidates[0];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET GOVERNANCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a request is within budget
 */
export async function checkBudget(
  estimatedCost: number,
  config: Partial<BudgetConfig> = {}
): Promise<{
  allowed: boolean;
  reason?: string;
  status: BudgetStatus;
}> {
  const mergedConfig = { ...DEFAULT_BUDGET, ...config };
  const status = await getBudgetStatus(mergedConfig);

  // Check per-request limit
  if (estimatedCost > mergedConfig.perRequestLimit) {
    return {
      allowed: false,
      reason: `Estimated cost (${estimatedCost / 1000}¢) exceeds per-request limit (${mergedConfig.perRequestLimit / 1000}¢)`,
      status,
    };
  }

  // Check daily limit
  if (status.dailyRemaining < estimatedCost && mergedConfig.hardStop) {
    return {
      allowed: false,
      reason: 'Daily budget exhausted',
      status,
    };
  }

  // Check monthly limit
  if (status.monthlyRemaining < estimatedCost && mergedConfig.hardStop) {
    return {
      allowed: false,
      reason: 'Monthly budget exhausted',
      status,
    };
  }

  return { allowed: true, status };
}

/**
 * Get current budget status
 */
export async function getBudgetStatus(
  config: Partial<BudgetConfig> = {}
): Promise<BudgetStatus> {
  const mergedConfig = { ...DEFAULT_BUDGET, ...config };
  
  const today = new Date().toISOString().split('T')[0];
  const month = today.substring(0, 7);

  // Get from tracker (in production, would query database)
  const dailySpent = spendingTracker.daily.get(today) ?? 0;
  const monthlySpent = spendingTracker.monthly.get(month) ?? 0;

  const dailyRemaining = Math.max(0, mergedConfig.dailyLimit - dailySpent);
  const monthlyRemaining = Math.max(0, mergedConfig.monthlyLimit - monthlySpent);

  const dailyUsageRatio = dailySpent / mergedConfig.dailyLimit;
  
  let warningLevel: BudgetStatus['warningLevel'] = 'none';
  if (dailyUsageRatio >= 1) {
    warningLevel = 'exceeded';
  } else if (dailyUsageRatio >= mergedConfig.alertThreshold) {
    warningLevel = 'critical';
  } else if (dailyUsageRatio >= mergedConfig.warningThreshold) {
    warningLevel = 'approaching';
  }

  // Project daily spend based on hourly rate
  const hour = new Date().getHours();
  const projectedDailySpend = hour > 0 ? (dailySpent / hour) * 24 : 0;

  return {
    dailySpent,
    dailyRemaining,
    monthlySpent,
    monthlyRemaining,
    isWithinBudget: dailyRemaining > 0 && monthlyRemaining > 0,
    warningLevel,
    projectedDailySpend: Math.ceil(projectedDailySpend),
  };
}

/**
 * Record actual spending
 */
export async function recordSpending(
  provider: string,
  model: string,
  actualCost: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const month = today.substring(0, 7);

  // Update trackers
  spendingTracker.daily.set(today, (spendingTracker.daily.get(today) ?? 0) + actualCost);
  spendingTracker.monthly.set(month, (spendingTracker.monthly.get(month) ?? 0) + actualCost);
  pruneTracker(spendingTracker.daily, MAX_TRACKER_ENTRIES);
  pruneTracker(spendingTracker.monthly, MAX_TRACKER_ENTRIES);

  // Log to database
  await supabase.from('brain_events').insert({
    module: 'nexus',
    event_type: 'cost.recorded',
    data: {
      provider,
      model,
      cost: actualCost,
      date: today,
      ...metadata,
    } as unknown as Record<string, never>,
    outcome: 'success',
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// COST REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate cost report for a period
 */
export async function generateCostReport(
  period: 'day' | 'week' | 'month'
): Promise<CostReport> {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  // Query only needed columns instead of SELECT *
  const { data: events } = await supabase
    .from('brain_events')
    .select('data, created_at')
    .eq('module', 'nexus')
    .eq('event_type', 'cost.recorded')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(1000);

  const byProvider: Record<string, number> = {};
  const byModel: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let totalSpent = 0;

  for (const event of events || []) {
    const data = event.data as any;
    const cost = data?.cost ?? 0;
    totalSpent += cost;

    if (data?.provider) {
      byProvider[data.provider] = (byProvider[data.provider] ?? 0) + cost;
    }
    if (data?.model) {
      byModel[data.model] = (byModel[data.model] ?? 0) + cost;
    }
    if (data?.category) {
      byCategory[data.category] = (byCategory[data.category] ?? 0) + cost;
    }
  }

  const requestCount = events?.length ?? 0;
  const avgCostPerRequest = requestCount > 0 ? totalSpent / requestCount : 0;

  return {
    period,
    totalSpent,
    byProvider,
    byModel,
    byCategory,
    requestCount,
    avgCostPerRequest: Math.ceil(avgCostPerRequest),
    trend: 'stable', // Would need historical comparison
  };
}

/**
 * Get cost optimization suggestions
 */
export function getCostOptimizations(
  report: CostReport
): Array<{ suggestion: string; potentialSavings: number }> {
  const suggestions: Array<{ suggestion: string; potentialSavings: number }> = [];

  // Check for expensive provider usage
  for (const [provider, cost] of Object.entries(report.byProvider)) {
     if (cost > report.totalSpent * 0.5 && provider !== 'groq') {
      suggestions.push({
        suggestion: `Consider using Nexus free-tier routing for compatible tasks instead of ${provider}`,
        potentialSavings: Math.ceil(cost * 0.3),
      });
    }
  }

  // Check for high per-request cost
  if (report.avgCostPerRequest > 10000) { // > 10 cents
    suggestions.push({
      suggestion: 'Average cost per request is high. Consider caching responses or using smaller models',
      potentialSavings: Math.ceil(report.totalSpent * 0.2),
    });
  }

  return suggestions;
}
