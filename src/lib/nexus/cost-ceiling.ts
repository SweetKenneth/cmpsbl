/**
 * NEXUS Cost Ceiling — Hard enforcement layer
 * Gap Analysis P0: Prevents runaway AI spend.
 * 
 * Wraps NEXUS router calls to enforce daily/monthly budget caps
 * before any request reaches a provider.
 */

import { checkBudget, estimateCost, recordSpending, type BudgetConfig } from './costEstimation';
import type { SupportedProvider } from './index';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/** Override budget config — can be loaded from system_flags */
let activeConfig: Partial<BudgetConfig> = {};

export function setCostCeilingConfig(config: Partial<BudgetConfig>): void {
  activeConfig = config;
}

export function getCostCeilingConfig(): Partial<BudgetConfig> {
  return { ...activeConfig };
}

// ═══════════════════════════════════════════════════════════════
// ENFORCEMENT
// ═══════════════════════════════════════════════════════════════

export interface CostGateResult {
  allowed: boolean;
  reason?: string;
  estimatedCost: number;
  dailyRemaining: number;
  monthlyRemaining: number;
}

/**
 * Pre-flight cost gate — call BEFORE any NEXUS provider invocation.
 * Returns whether the request is allowed based on budget constraints.
 */
export async function costGate(
  provider: SupportedProvider,
  model: string,
  inputText: string,
  expectedOutputTokens?: number,
): Promise<CostGateResult> {
  const estimate = estimateCost(provider, model, inputText, expectedOutputTokens);
  const budget = await checkBudget(estimate.estimatedCost, activeConfig);

  return {
    allowed: budget.allowed,
    reason: budget.reason,
    estimatedCost: estimate.estimatedCost,
    dailyRemaining: budget.status.dailyRemaining,
    monthlyRemaining: budget.status.monthlyRemaining,
  };
}

/**
 * Post-request cost recording — call AFTER provider response received.
 */
export async function recordCost(
  provider: string,
  model: string,
  actualCost: number,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await recordSpending(provider, model, actualCost, metadata);
}

/**
 * Wrap a NEXUS call with cost ceiling enforcement.
 * Throws if budget is exceeded and hardStop is enabled.
 */
export async function withCostCeiling<T>(
  provider: SupportedProvider,
  model: string,
  inputText: string,
  executor: () => Promise<T>,
  opts?: { expectedOutputTokens?: number; category?: string },
): Promise<T> {
  const gate = await costGate(provider, model, inputText, opts?.expectedOutputTokens);

  if (!gate.allowed) {
    throw new CostCeilingError(gate.reason || 'Budget exceeded', gate);
  }

  const start = performance.now();
  const result = await executor();
  const duration = performance.now() - start;

  // Record actual cost (use estimate as proxy — real cost comes from provider)
  await recordCost(provider, model, gate.estimatedCost, {
    category: opts?.category || 'nexus',
    duration_ms: Math.round(duration),
  });

  return result;
}

// ═══════════════════════════════════════════════════════════════
// ERROR CLASS
// ═══════════════════════════════════════════════════════════════

export class CostCeilingError extends Error {
  constructor(
    message: string,
    public gate: CostGateResult,
  ) {
    super(`[NEXUS Cost Ceiling] ${message}`);
    this.name = 'CostCeilingError';
  }
}
