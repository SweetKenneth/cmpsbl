/**
 * S-Tier 081 — Token Optimization Engine
 * CJPI: 92 | Node: NEXUS | ID: S-138
 *
 * Optimizes token budgets across multi-model workflows.
 * Trims prompts, manages context windows, and tracks token spend.
 */

export interface TokenBudget {
  modelId: string;
  maxTokens: number;
  usedTokens: number;
  reservedTokens: number;
}

export interface OptimizationResult {
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  savingsPct: number;
  techniques: string[];
}

const budgets = new Map<string, TokenBudget>();

export function setBudget(modelId: string, maxTokens: number): TokenBudget {
  const budget: TokenBudget = { modelId, maxTokens, usedTokens: 0, reservedTokens: 0 };
  budgets.set(modelId, budget);
  return budget;
}

export function consume(modelId: string, tokens: number): boolean {
  const budget = budgets.get(modelId);
  if (!budget) return true; // no budget = unlimited
  if (budget.usedTokens + tokens > budget.maxTokens - budget.reservedTokens) return false;
  budget.usedTokens += tokens;
  return true;
}

export function getRemainingTokens(modelId: string): number {
  const budget = budgets.get(modelId);
  if (!budget) return Infinity;
  return budget.maxTokens - budget.usedTokens - budget.reservedTokens;
}

/**
 * Simple token-count estimator (whitespace-split, ~1.3 tokens per word for English).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

/**
 * Trim text to fit within a token budget.
 */
export function trimToFit(text: string, maxTokens: number): OptimizationResult {
  const original = estimateTokens(text);
  if (original <= maxTokens) {
    return { originalTokens: original, optimizedTokens: original, savedTokens: 0, savingsPct: 0, techniques: [] };
  }

  const techniques: string[] = [];

  // 1. Remove redundant whitespace
  let optimized = text.replace(/\s+/g, ' ').trim();
  techniques.push('whitespace_normalization');

  // 2. Truncate from the middle if still too long
  const words = optimized.split(' ');
  const targetWords = Math.floor(maxTokens / 1.3);
  if (words.length > targetWords) {
    const keep = Math.floor(targetWords / 2);
    optimized = [...words.slice(0, keep), '…', ...words.slice(-keep)].join(' ');
    techniques.push('middle_truncation');
  }

  const optimizedTokens = estimateTokens(optimized);
  return {
    originalTokens: original,
    optimizedTokens,
    savedTokens: original - optimizedTokens,
    savingsPct: Math.round(((original - optimizedTokens) / original) * 100),
    techniques,
  };
}

export function getBudget(modelId: string): TokenBudget | null { return budgets.get(modelId) ?? null; }
export function resetBudget(modelId: string): void { const b = budgets.get(modelId); if (b) b.usedTokens = 0; }
