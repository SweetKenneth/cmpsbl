/**
 * S-Tier 216 — Freshness Arbitrage Engine
 * ID: S-HRV03 | CJPI: 91 | Module: HARVEST
 */
export class FreshnessArbitrageEngine {
  private sources: Map<string, { decayRate: number; lastHarvested: number; costPerHarvest: number }> = new Map();

  register(id: string, decayRate: number, costPerHarvest: number): void {
    this.sources.set(id, { decayRate, lastHarvested: 0, costPerHarvest });
  }

  prioritize(): { sourceId: string; staleness: number; priority: number }[] {
    const now = Date.now();
    return [...this.sources.entries()].map(([id, s]) => {
      const staleness = (now - s.lastHarvested) * s.decayRate;
      return { sourceId: id, staleness, priority: staleness / Math.max(0.01, s.costPerHarvest) };
    }).sort((a, b) => b.priority - a.priority);
  }

  markHarvested(id: string): void {
    const s = this.sources.get(id);
    if (s) s.lastHarvested = Date.now();
  }
}
