/**
 * ENGINEER — Repair Strategy Ranker
 * Multi-criteria decision matrix ranking repair options by
 * impact, risk, cost, and historical success rate (EMA-weighted).
 * @module engineer/repairStrategyRanker
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface RepairStrategy {
  id: string;
  name: string;
  estimatedImpact: number;       // 0–100 (higher = more effective)
  riskLevel: number;             // 0–100 (lower = safer)
  estimatedCostMs: number;       // time cost in ms
  nodeId: string;
}

export interface RankedStrategy extends RepairStrategy {
  compositeScore: number;
  historicalSuccessRate: number;
  rank: number;
}

interface StrategyRecord {
  attempts: number;
  successes: number;
  emaRate: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const EMA_ALPHA = 0.3;
const WEIGHTS = {
  impact: 0.35,
  risk: 0.25,      // inverted: lower risk = higher score
  cost: 0.15,      // inverted: lower cost = higher score
  history: 0.25,
};

// ── State ──────────────────────────────────────────────────────────────────

const history = new Map<string, StrategyRecord>();

// ── Core ───────────────────────────────────────────────────────────────────

function getRecord(strategyId: string): StrategyRecord {
  if (!history.has(strategyId)) {
    history.set(strategyId, { attempts: 0, successes: 0, emaRate: 0.5 });
  }
  return history.get(strategyId)!;
}

export function recordOutcome(strategyId: string, success: boolean): void {
  const rec = getRecord(strategyId);
  rec.attempts++;
  if (success) rec.successes++;
  rec.emaRate = EMA_ALPHA * (success ? 1 : 0) + (1 - EMA_ALPHA) * rec.emaRate;
}

export function rankStrategies(strategies: RepairStrategy[]): RankedStrategy[] {
  if (strategies.length === 0) return [];

  const maxCost = Math.max(...strategies.map(s => s.estimatedCostMs), 1);

  const ranked: RankedStrategy[] = strategies.map(s => {
    const rec = getRecord(s.id);
    const impactNorm = s.estimatedImpact / 100;
    const riskNorm = 1 - s.riskLevel / 100;
    const costNorm = 1 - s.estimatedCostMs / maxCost;
    const historyNorm = rec.emaRate;

    const compositeScore =
      WEIGHTS.impact * impactNorm +
      WEIGHTS.risk * riskNorm +
      WEIGHTS.cost * costNorm +
      WEIGHTS.history * historyNorm;

    return {
      ...s,
      compositeScore: Math.round(compositeScore * 10000) / 100,
      historicalSuccessRate: Math.round(rec.emaRate * 100),
      rank: 0,
    };
  });

  ranked.sort((a, b) => b.compositeScore - a.compositeScore);
  ranked.forEach((r, i) => { r.rank = i + 1; });

  return ranked;
}

export function getBestStrategy(strategies: RepairStrategy[]): RankedStrategy | null {
  const ranked = rankStrategies(strategies);
  return ranked[0] ?? null;
}

export function getHistoricalStats(): Array<{ strategyId: string; attempts: number; emaRate: number }> {
  return Array.from(history.entries()).map(([id, rec]) => ({
    strategyId: id,
    attempts: rec.attempts,
    emaRate: Math.round(rec.emaRate * 100) / 100,
  }));
}

export function resetHistory(): void {
  history.clear();
}
