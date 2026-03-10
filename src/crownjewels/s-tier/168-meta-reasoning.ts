/**
 * S-Tier 168 — Meta-Reasoning
 * ID: S-CJ126 | CJPI: 85 | Module: BRAIN
 * Reasoning about reasoning strategies for optimal problem solving.
 */

export interface ReasoningStrategy {
  id: string;
  name: string;
  suitableFor: string[];
  avgDurationMs: number;
  successRate: number;
  usageCount: number;
}

export class MetaReasoning {
  private strategies: Map<string, ReasoningStrategy> = new Map();

  register(strategy: ReasoningStrategy): void { this.strategies.set(strategy.id, strategy); }

  select(problemType: string, timebudgetMs: number): ReasoningStrategy | null {
    const candidates = [...this.strategies.values()]
      .filter(s => s.suitableFor.includes(problemType) && s.avgDurationMs <= timebudgetMs)
      .sort((a, b) => b.successRate - a.successRate);
    return candidates[0] ?? null;
  }

  recordOutcome(strategyId: string, durationMs: number, success: boolean): void {
    const s = this.strategies.get(strategyId);
    if (!s) return;
    s.usageCount++;
    s.avgDurationMs = (s.avgDurationMs * (s.usageCount - 1) + durationMs) / s.usageCount;
    s.successRate = (s.successRate * (s.usageCount - 1) + (success ? 1 : 0)) / s.usageCount;
  }

  getStrategies(): ReasoningStrategy[] { return [...this.strategies.values()]; }
}
