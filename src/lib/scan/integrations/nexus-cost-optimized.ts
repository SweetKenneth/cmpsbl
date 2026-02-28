/**
 * NEXUS Cost-Optimized Scanning (#9)
 * Triages scan analysis: cheap models for initial assessment,
 * expensive models only for deep dives on confirmed issues.
 */

import { canSpend, recordSpend, getBudgetStatus } from '@/lib/nexus/budgetGovernance';
import { estimateTokenCost } from '@/lib/nexus/costEstimation';
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

/**
 * Scan depth tiers — each progressively more expensive
 */
const DEPTH_TIERS: Record<ScanDepth, CostTier> = {
  triage: {
    depth: 'triage',
    maxTokens: 500,
    providerPreference: 'cheapest',
    description: 'Quick classification: is this a real issue? (fastest free-tier model)',
  },
  standard: {
    depth: 'standard',
    maxTokens: 2000,
    providerPreference: 'balanced',
    description: 'Standard analysis with fix suggestion (balanced model)',
  },
  deep: {
    depth: 'deep',
    maxTokens: 6000,
    providerPreference: 'best',
    description: 'Deep analysis with root cause + multiple fix paths (best model)',
  },
  forensic: {
    depth: 'forensic',
    maxTokens: 12000,
    providerPreference: 'best',
    description: 'Full forensic trace with dependency impact analysis (best model, max context)',
  },
};

const DEPTH_ORDER: ScanDepth[] = ['triage', 'standard', 'deep', 'forensic'];

/**
 * Severity → starting depth mapping
 * Critical issues skip triage and start at standard/deep
 */
const SEVERITY_START_DEPTH: Record<string, ScanDepth> = {
  critical: 'deep',
  high: 'standard',
  medium: 'triage',
  low: 'triage',
  info: 'triage',
};

/**
 * Plan cost-optimized analysis for a finding
 */
export function planCostOptimizedScan(
  category: ScanCategory,
  severity: string,
  currentDepth?: ScanDepth,
): CostOptimizedPlan {
  const startDepth = currentDepth ?? SEVERITY_START_DEPTH[severity] ?? 'triage';
  const tier = DEPTH_TIERS[startDepth];
  const budgetStatus = getBudgetStatus();
  
  const estimatedCost = estimateTokenCost(tier.maxTokens, 'text');
  const canAfford = canSpend(estimatedCost);

  // Determine next escalation depth
  const currentIndex = DEPTH_ORDER.indexOf(startDepth);
  const nextDepth = currentIndex < DEPTH_ORDER.length - 1 ? DEPTH_ORDER[currentIndex + 1] : null;

  // Should we escalate? Only if triage found something real
  let shouldEscalate = false;
  let escalationReason: string | null = null;

  if (severity === 'critical' && startDepth === 'triage') {
    shouldEscalate = true;
    escalationReason = 'Critical severity finding requires deeper analysis';
  } else if (severity === 'high' && startDepth === 'triage') {
    shouldEscalate = true;
    escalationReason = 'High severity finding confirmed at triage, escalating';
  }

  // Budget gate: don't escalate if we can't afford it
  if (shouldEscalate && nextDepth) {
    const nextTier = DEPTH_TIERS[nextDepth];
    const nextCost = estimateTokenCost(nextTier.maxTokens, 'text');
    if (!canSpend(nextCost)) {
      shouldEscalate = false;
      escalationReason = `Budget insufficient for ${nextDepth} depth (need ${nextCost} millicents)`;
    }
  }

  return {
    category,
    currentDepth: startDepth,
    nextDepth,
    estimatedCostMillicents: estimatedCost,
    budgetRemaining: budgetStatus.remaining,
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
export function allocateScanBudget(
  categories: Array<{ category: ScanCategory; severity: string }>,
): {
  plans: CostOptimizedPlan[];
  totalEstimatedCost: number;
  budgetSufficient: boolean;
  categoriesDeferred: ScanCategory[];
} {
  const budgetStatus = getBudgetStatus();
  let runningCost = 0;
  const plans: CostOptimizedPlan[] = [];
  const deferred: ScanCategory[] = [];

  // Sort by severity (critical first) to prioritize budget
  const sorted = [...categories].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return (order[a.severity as keyof typeof order] ?? 4) - (order[b.severity as keyof typeof order] ?? 4);
  });

  for (const { category, severity } of sorted) {
    const plan = planCostOptimizedScan(category, severity);
    
    if (runningCost + plan.estimatedCostMillicents <= budgetStatus.remaining) {
      plans.push(plan);
      runningCost += plan.estimatedCostMillicents;
    } else {
      // Can't afford — defer to triage only
      const triagePlan = planCostOptimizedScan(category, severity, 'triage');
      if (runningCost + triagePlan.estimatedCostMillicents <= budgetStatus.remaining) {
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
export function recordScanCost(
  category: ScanCategory,
  depth: ScanDepth,
  actualTokens: number,
): void {
  const cost = estimateTokenCost(actualTokens, 'text');
  recordSpend(cost, `scan_${category}_${depth}`);
}
