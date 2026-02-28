/**
 * Entropy Budget Engine (Per-Tenant)
 * Enforces maximum disorder thresholds per subscriber.
 * Blocks evolution if a tenant exceeds their entropy budget.
 */

export interface EntropyBudget {
  tenantId: string;
  maxEntropyScore: number;
  maxEntropyGrowthPerCycle: number;
  warningThreshold: number;
  currentEntropy: number;
  cyclesOverBudget: number;
  lastUpdated: number;
}

export interface BudgetCheck {
  allowed: boolean;
  tenantId: string;
  currentEntropy: number;
  budget: number;
  remaining: number;
  status: 'within_budget' | 'warning' | 'exceeded' | 'blocked';
  message: string;
}

const budgets = new Map<string, EntropyBudget>();

const DEFAULT_BUDGET = {
  maxEntropyScore: 0.7,
  maxEntropyGrowthPerCycle: 0.1,
  warningThreshold: 0.5,
};

export function setEntropyBudget(
  tenantId: string,
  config: Partial<Pick<EntropyBudget, 'maxEntropyScore' | 'maxEntropyGrowthPerCycle' | 'warningThreshold'>>,
): EntropyBudget {
  const existing = budgets.get(tenantId);
  const budget: EntropyBudget = {
    tenantId,
    maxEntropyScore: config.maxEntropyScore ?? existing?.maxEntropyScore ?? DEFAULT_BUDGET.maxEntropyScore,
    maxEntropyGrowthPerCycle: config.maxEntropyGrowthPerCycle ?? existing?.maxEntropyGrowthPerCycle ?? DEFAULT_BUDGET.maxEntropyGrowthPerCycle,
    warningThreshold: config.warningThreshold ?? existing?.warningThreshold ?? DEFAULT_BUDGET.warningThreshold,
    currentEntropy: existing?.currentEntropy ?? 0,
    cyclesOverBudget: existing?.cyclesOverBudget ?? 0,
    lastUpdated: Date.now(),
  };
  budgets.set(tenantId, budget);
  return budget;
}

export function checkEntropyBudget(tenantId: string, proposedEntropy: number): BudgetCheck {
  const budget = budgets.get(tenantId) ?? {
    tenantId,
    ...DEFAULT_BUDGET,
    currentEntropy: 0,
    cyclesOverBudget: 0,
    lastUpdated: Date.now(),
  };

  const remaining = budget.maxEntropyScore - proposedEntropy;
  const growth = proposedEntropy - budget.currentEntropy;

  // Blocked: 3+ consecutive cycles over budget
  if (budget.cyclesOverBudget >= 3 && proposedEntropy > budget.maxEntropyScore) {
    return {
      allowed: false,
      tenantId,
      currentEntropy: proposedEntropy,
      budget: budget.maxEntropyScore,
      remaining,
      status: 'blocked',
      message: `Entropy budget exhausted. ${budget.cyclesOverBudget} consecutive cycles over limit. Evolution blocked until entropy is reduced.`,
    };
  }

  // Exceeded: over max
  if (proposedEntropy > budget.maxEntropyScore) {
    return {
      allowed: true, // allow but warn (soft limit until 3 cycles)
      tenantId,
      currentEntropy: proposedEntropy,
      budget: budget.maxEntropyScore,
      remaining,
      status: 'exceeded',
      message: `Entropy ${proposedEntropy.toFixed(3)} exceeds budget ${budget.maxEntropyScore}. ${3 - budget.cyclesOverBudget - 1} cycles remaining before block.`,
    };
  }

  // Growth too fast
  if (growth > budget.maxEntropyGrowthPerCycle) {
    return {
      allowed: true,
      tenantId,
      currentEntropy: proposedEntropy,
      budget: budget.maxEntropyScore,
      remaining,
      status: 'warning',
      message: `Entropy growth ${growth.toFixed(3)} exceeds per-cycle limit ${budget.maxEntropyGrowthPerCycle}.`,
    };
  }

  // Warning threshold
  if (proposedEntropy > budget.warningThreshold) {
    return {
      allowed: true,
      tenantId,
      currentEntropy: proposedEntropy,
      budget: budget.maxEntropyScore,
      remaining,
      status: 'warning',
      message: `Entropy ${proposedEntropy.toFixed(3)} approaching budget limit ${budget.maxEntropyScore}.`,
    };
  }

  return {
    allowed: true,
    tenantId,
    currentEntropy: proposedEntropy,
    budget: budget.maxEntropyScore,
    remaining,
    status: 'within_budget',
    message: 'Entropy within budget.',
  };
}

export function recordEntropyUsage(tenantId: string, entropy: number): void {
  const budget = budgets.get(tenantId);
  if (!budget) {
    budgets.set(tenantId, {
      tenantId,
      ...DEFAULT_BUDGET,
      currentEntropy: entropy,
      cyclesOverBudget: entropy > DEFAULT_BUDGET.maxEntropyScore ? 1 : 0,
      lastUpdated: Date.now(),
    });
    return;
  }

  if (entropy > budget.maxEntropyScore) {
    budget.cyclesOverBudget++;
  } else {
    budget.cyclesOverBudget = 0;
  }
  budget.currentEntropy = entropy;
  budget.lastUpdated = Date.now();
}

export function getEntropyBudget(tenantId: string): EntropyBudget | null {
  return budgets.get(tenantId) ?? null;
}

export function getAllEntropyBudgets(): EntropyBudget[] {
  return Array.from(budgets.values());
}
