/**
 * S-Tier 168 — Meta-Reasoning
 * ID: S-CJ126 | CJPI: 85 | Module: BRAIN
 *
 * Reasons about reasoning strategies: selects optimal approaches based
 * on problem type, tracks outcomes, computes expected value for strategy
 * selection, and detects strategy fatigue.
 */

export interface ReasoningStrategy {
  id: string;
  name: string;
  suitableFor: string[];
  avgDurationMs: number;
  successRate: number;
  usageCount: number;
  lastUsed: number;
  costWeight: number;
}

export interface StrategySelection {
  strategy: ReasoningStrategy;
  expectedValue: number;
  reason: string;
  alternatives: { id: string; expectedValue: number }[];
}

export interface StrategyOutcome {
  strategyId: string;
  durationMs: number;
  success: boolean;
  problemType: string;
  timestamp: number;
}

export class MetaReasoning {
  private strategies: Map<string, ReasoningStrategy> = new Map();
  private outcomes: StrategyOutcome[] = [];
  private readonly maxOutcomes: number;

  constructor(maxOutcomes: number = 2000) {
    this.maxOutcomes = maxOutcomes;
  }

  register(strategy: Omit<ReasoningStrategy, 'lastUsed' | 'costWeight'> & { costWeight?: number }): void {
    this.strategies.set(strategy.id, { ...strategy, lastUsed: 0, costWeight: strategy.costWeight ?? 1 });
  }

  select(problemType: string, timeBudgetMs: number): StrategySelection | null {
    const candidates = [...this.strategies.values()]
      .filter(s => s.suitableFor.includes(problemType) && s.avgDurationMs <= timeBudgetMs);

    if (candidates.length === 0) return null;

    // Compute expected value: success_rate * (1 / cost_weight) * time_efficiency
    const scored = candidates.map(s => {
      const timeEfficiency = 1 - (s.avgDurationMs / timeBudgetMs);
      const recencyPenalty = s.lastUsed > 0 && Date.now() - s.lastUsed < 5000 ? 0.9 : 1; // Avoid immediate re-use
      const expectedValue = s.successRate * (1 / s.costWeight) * timeEfficiency * recencyPenalty;
      return { strategy: s, expectedValue };
    }).sort((a, b) => b.expectedValue - a.expectedValue);

    const selected = scored[0];
    selected.strategy.lastUsed = Date.now();

    return {
      strategy: { ...selected.strategy },
      expectedValue: selected.expectedValue,
      reason: `Best EV (${selected.expectedValue.toFixed(3)}) for ${problemType} within ${timeBudgetMs}ms budget`,
      alternatives: scored.slice(1, 4).map(s => ({ id: s.strategy.id, expectedValue: s.expectedValue })),
    };
  }

  recordOutcome(strategyId: string, durationMs: number, success: boolean, problemType: string = 'unknown'): void {
    const s = this.strategies.get(strategyId);
    if (!s) return;

    // Exponential moving average for stability
    const alpha = Math.min(0.3, 2 / (s.usageCount + 1));
    s.usageCount++;
    s.avgDurationMs = s.avgDurationMs * (1 - alpha) + durationMs * alpha;
    s.successRate = s.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;

    this.outcomes.push({ strategyId, durationMs, success, problemType, timestamp: Date.now() });
    if (this.outcomes.length > this.maxOutcomes) this.outcomes.shift();
  }

  detectFatigue(strategyId: string, windowMs: number = 600000): { fatigued: boolean; recentUsage: number; successTrend: 'improving' | 'degrading' | 'stable' } {
    const cutoff = Date.now() - windowMs;
    const recent = this.outcomes.filter(o => o.strategyId === strategyId && o.timestamp > cutoff);

    if (recent.length < 5) return { fatigued: false, recentUsage: recent.length, successTrend: 'stable' };

    const half = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, half);
    const secondHalf = recent.slice(half);
    const firstRate = firstHalf.filter(o => o.success).length / firstHalf.length;
    const secondRate = secondHalf.filter(o => o.success).length / secondHalf.length;

    const trend: 'improving' | 'degrading' | 'stable' = secondRate - firstRate > 0.1 ? 'improving' : secondRate - firstRate < -0.1 ? 'degrading' : 'stable';
    const fatigued = trend === 'degrading' && recent.length > 10;

    return { fatigued, recentUsage: recent.length, successTrend: trend };
  }

  getStrategies(): ReasoningStrategy[] {
    return [...this.strategies.values()].map(s => ({ ...s }));
  }

  getStrategiesByProblemType(problemType: string): ReasoningStrategy[] {
    return [...this.strategies.values()].filter(s => s.suitableFor.includes(problemType));
  }

  getStats(): { strategies: number; totalOutcomes: number; avgSuccessRate: number; problemTypes: number } {
    const strats = [...this.strategies.values()];
    const avgRate = strats.length > 0 ? strats.reduce((s, st) => s + st.successRate, 0) / strats.length : 0;
    const problemTypes = new Set(this.outcomes.map(o => o.problemType));
    return { strategies: strats.length, totalOutcomes: this.outcomes.length, avgSuccessRate: avgRate, problemTypes: problemTypes.size };
  }

  reset(): void {
    this.strategies.clear();
    this.outcomes = [];
  }
}
