/**
 * S-Tier 216 — Freshness Arbitrage Engine
 * ID: S-HRV03 | CJPI: 91 | Module: HARVEST
 *
 * Optimizes data harvesting by computing staleness-to-cost ratios,
 * scheduling harvests by priority, and tracking freshness SLAs.
 */

export interface HarvestSource {
  id: string;
  decayRate: number;
  lastHarvested: number;
  costPerHarvest: number;
  freshnessSlaSec: number | null;
  harvestCount: number;
  totalCost: number;
  lastValue: unknown;
}

export interface HarvestPriority {
  sourceId: string;
  staleness: number;
  priority: number;
  slaViolation: boolean;
  estimatedValue: number;
}

export class FreshnessArbitrageEngine {
  private sources: Map<string, HarvestSource> = new Map();
  private budget: number;
  private spent: number = 0;

  constructor(budget: number = Infinity) {
    this.budget = budget;
  }

  register(id: string, decayRate: number, costPerHarvest: number, freshnessSlaSec: number | null = null): void {
    this.sources.set(id, { id, decayRate, lastHarvested: 0, costPerHarvest, freshnessSlaSec, harvestCount: 0, totalCost: 0, lastValue: null });
  }

  prioritize(): HarvestPriority[] {
    const now = Date.now();
    return [...this.sources.values()].map(s => {
      const ageMs = now - s.lastHarvested;
      const staleness = ageMs * s.decayRate;
      const slaViolation = s.freshnessSlaSec !== null && ageMs > s.freshnessSlaSec * 1000;
      // Priority = staleness / cost, boosted for SLA violations
      const priority = (staleness / Math.max(0.01, s.costPerHarvest)) * (slaViolation ? 3 : 1);
      const estimatedValue = staleness * (slaViolation ? 2 : 1);

      return { sourceId: s.id, staleness, priority, slaViolation, estimatedValue };
    }).sort((a, b) => b.priority - a.priority);
  }

  harvest(id: string, value: unknown = null): { success: boolean; cost: number; remainingBudget: number } {
    const s = this.sources.get(id);
    if (!s) return { success: false, cost: 0, remainingBudget: this.budget - this.spent };

    if (this.spent + s.costPerHarvest > this.budget) {
      return { success: false, cost: 0, remainingBudget: this.budget - this.spent };
    }

    s.lastHarvested = Date.now();
    s.harvestCount++;
    s.totalCost += s.costPerHarvest;
    s.lastValue = value;
    this.spent += s.costPerHarvest;

    return { success: true, cost: s.costPerHarvest, remainingBudget: this.budget - this.spent };
  }

  markHarvested(id: string): void {
    const s = this.sources.get(id);
    if (s) { s.lastHarvested = Date.now(); s.harvestCount++; }
  }

  harvestTopN(n: number): string[] {
    const priorities = this.prioritize().slice(0, n);
    const harvested: string[] = [];
    for (const p of priorities) {
      const result = this.harvest(p.sourceId);
      if (result.success) harvested.push(p.sourceId);
    }
    return harvested;
  }

  getSlaViolations(): { sourceId: string; ageMs: number; slaSec: number }[] {
    const now = Date.now();
    return [...this.sources.values()]
      .filter(s => s.freshnessSlaSec !== null && (now - s.lastHarvested) > s.freshnessSlaSec * 1000)
      .map(s => ({ sourceId: s.id, ageMs: now - s.lastHarvested, slaSec: s.freshnessSlaSec! }));
  }

  getStats(): { sources: number; totalHarvests: number; totalSpent: number; slaViolations: number; remainingBudget: number } {
    return {
      sources: this.sources.size,
      totalHarvests: [...this.sources.values()].reduce((s, src) => s + src.harvestCount, 0),
      totalSpent: this.spent,
      slaViolations: this.getSlaViolations().length,
      remainingBudget: this.budget - this.spent,
    };
  }

  reset(): void {
    this.sources.clear();
    this.spent = 0;
  }
}
