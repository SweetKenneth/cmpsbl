/**
 * NEXUS Cost-Optimized Scanning (#9)
 * Triages scan analysis: cheap models for initial assessment,
 * expensive models only for deep dives on confirmed issues.
 */

import { canSpend, recordSpend, getBudgetStatus } from '@/lib/nexus/budgetGovernance';
import { estimateCost } from '@/lib/nexus/costEstimation';
import type { ScanCategory } from './nexus-scan-routing';

export type ScanDepth = 'triage' | 'standard' | 'deep' | 'forensic';

interface CostTier {
  depth: ScanDepth;
  maxTokens: number;
  providerPreference: 'cheapest' | 'balanced' | 'best';
  description: string;
}

interface CostOptimizedPlan {
  category: ScanCategory;
  currentDepth: ScanDepth;
  nextDepth: ScanDepth | null;
  estimatedCostMillicents: number;
  budgetRemaining: number;
  shouldEscalate: boolean;
  escalationReason: string | null;
}

const DEPTH_TIERS: Record<ScanDepth, CostTier> = {
  triage: { depth: 'triage', maxTokens: 500, providerPreference: 'cheapest', description: 'Quick classification (fastest free-tier model)' },
  standard: { depth: 'standard', maxTokens: 2000, providerPreference: 'balanced', description: 'Standard analysis with fix suggestion' },
  deep: { depth: 'deep', maxTokens: 6000, providerPreference: 'best', description: 'Deep analysis with root cause + multiple fix paths' },
  forensic: { depth: 'forensic', maxTokens: 12000, providerPreference: 'best', description: 'Full forensic trace with dependency impact analysis' },
};

const DEPTH_ORDER: ScanDepth[] = ['triage', 'standard', 'deep', 'forensic'];

const SEVERITY_START_DEPTH: Record<string, ScanDepth> = {
  critical: 'deep',
  high: 'standard',
  medium: 'triage',
  low: 'triage',
  info: 'triage',
};

/** Estimate cost using token count and a dummy prompt */
function estimateTokenCost(maxTokens: number): number {
  const dummyPrompt = 'x'.repeat(maxTokens * 4); // ~4 chars per token
  const estimate = estimateCost('groq', 'default', dummyPrompt, maxTokens);
  return estimate.estimatedCost;
}

/**
 * Plan cost-optimized analysis for a finding
 */
export async function planCostOptimizedScan(
  category: ScanCategory,
  severity: string,
  currentDepth?: ScanDepth,
): Promise<CostOptimizedPlan> {
  const startDepth = currentDepth ?? SEVERITY_START_DEPTH[severity] ?? 'triage';
  const tier = DEPTH_TIERS[startDepth];
  const budgetStatus = await getBudgetStatus();
  
  const estimatedCost = estimateTokenCost(tier.maxTokens);
  const canAffordResult = await canSpend(estimatedCost);

  const currentIndex = DEPTH_ORDER.indexOf(startDepth);
  const nextDepth = currentIndex < DEPTH_ORDER.length - 1 ? DEPTH_ORDER[currentIndex + 1] : null;

  let shouldEscalate = false;
  let escalationReason: string | null = null;

  if (severity === 'critical' && startDepth === 'triage') {
    shouldEscalate = true;
    escalationReason = 'Critical severity finding requires deeper analysis';
  } else if (severity === 'high' && startDepth === 'triage') {
    shouldEscalate = true;
    escalationReason = 'High severity finding confirmed at triage, escalating';
  }

  if (shouldEscalate && nextDepth) {
    const nextCost = estimateTokenCost(DEPTH_TIERS[nextDepth].maxTokens);
    const nextCanAfford = await canSpend(nextCost);
    if (!nextCanAfford.allowed) {
      shouldEscalate = false;
      escalationReason = `Budget insufficient for ${nextDepth} depth (need ${nextCost} millicents)`;
    }
  }

  return {
    category,
    currentDepth: startDepth,
    nextDepth,
    estimatedCostMillicents: estimatedCost,
    budgetRemaining: budgetStatus.daily_remaining_cents,
    shouldEscalate,
    escalationReason,
  };
}

/**
 * Get the provider preference for a given depth
 */
export function getProviderPreference(depth: ScanDepth): CostTier['providerPreference'] {
  return DEPTH_TIERS[depth].providerPreference;
}

/**
 * Calculate total scan budget allocation across categories
 */
export async function allocateScanBudget(
  categories: Array<{ category: ScanCategory; severity: string }>,
): Promise<{
  plans: CostOptimizedPlan[];
  totalEstimatedCost: number;
  budgetSufficient: boolean;
  categoriesDeferred: ScanCategory[];
}> {
  const budgetStatus = await getBudgetStatus();
  let runningCost = 0;
  const plans: CostOptimizedPlan[] = [];
  const deferred: ScanCategory[] = [];

  const sorted = [...categories].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  for (const { category, severity } of sorted) {
    const plan = await planCostOptimizedScan(category, severity);
    
    if (runningCost + plan.estimatedCostMillicents <= budgetStatus.daily_remaining_cents) {
      plans.push(plan);
      runningCost += plan.estimatedCostMillicents;
    } else {
      const triagePlan = await planCostOptimizedScan(category, severity, 'triage');
      if (runningCost + triagePlan.estimatedCostMillicents <= budgetStatus.daily_remaining_cents) {
        plans.push(triagePlan);
        runningCost += triagePlan.estimatedCostMillicents;
      } else {
        deferred.push(category);
      }
    }
  }

  return {
    plans,
    totalEstimatedCost: runningCost,
    budgetSufficient: deferred.length === 0,
    categoriesDeferred: deferred,
  };
}

/**
 * Record scan cost after execution
 */
export function recordScanCost(category: ScanCategory, depth: ScanDepth, actualTokens: number): void {
  const cost = estimateTokenCost(actualTokens);
  recordSpend(cost, `scan_${category}_${depth}`);
}
