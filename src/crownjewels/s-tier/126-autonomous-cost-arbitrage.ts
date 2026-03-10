/**
 * S-Tier 126 — Autonomous Cost Arbitrage
 * ID: S-CJ84 | CJPI: 87 | Module: ECONOMY
 * 
 * Automated cost arbitrage across providers and regions.
 */

export interface ProviderPricing {
  providerId: string;
  region: string;
  costPerUnit: number;
  latencyMs: number;
  qualityScore: number; // 0-1
  available: boolean;
}

export interface ArbitrageOpportunity {
  id: string;
  fromProvider: string;
  toProvider: string;
  savingsPercent: number;
  qualityDelta: number;
  latencyDelta: number;
  recommended: boolean;
}

export class AutonomousCostArbitrage {
  private providers: ProviderPricing[] = [];

  updatePricing(pricing: ProviderPricing): void {
    const idx = this.providers.findIndex(p => p.providerId === pricing.providerId && p.region === pricing.region);
    if (idx >= 0) this.providers[idx] = pricing;
    else this.providers.push(pricing);
  }

  findOpportunities(currentProviderId: string, constraints?: { maxLatencyMs?: number; minQuality?: number }): ArbitrageOpportunity[] {
    const current = this.providers.find(p => p.providerId === currentProviderId && p.available);
    if (!current) return [];

    return this.providers
      .filter(p => p.providerId !== currentProviderId && p.available)
      .filter(p => {
        if (constraints?.maxLatencyMs && p.latencyMs > constraints.maxLatencyMs) return false;
        if (constraints?.minQuality && p.qualityScore < constraints.minQuality) return false;
        return true;
      })
      .map(p => ({
        id: crypto.randomUUID(),
        fromProvider: currentProviderId,
        toProvider: p.providerId,
        savingsPercent: ((current.costPerUnit - p.costPerUnit) / current.costPerUnit) * 100,
        qualityDelta: p.qualityScore - current.qualityScore,
        latencyDelta: p.latencyMs - current.latencyMs,
        recommended: p.costPerUnit < current.costPerUnit && p.qualityScore >= current.qualityScore * 0.9,
      }))
      .filter(o => o.savingsPercent > 0)
      .sort((a, b) => b.savingsPercent - a.savingsPercent);
  }

  getBestProvider(constraints?: { maxLatencyMs?: number; minQuality?: number }): ProviderPricing | null {
    return this.providers
      .filter(p => p.available)
      .filter(p => {
        if (constraints?.maxLatencyMs && p.latencyMs > constraints.maxLatencyMs) return false;
        if (constraints?.minQuality && p.qualityScore < constraints.minQuality) return false;
        return true;
      })
      .sort((a, b) => {
        const scoreA = (1 - a.costPerUnit / 100) * 0.5 + a.qualityScore * 0.3 + (1 - a.latencyMs / 5000) * 0.2;
        const scoreB = (1 - b.costPerUnit / 100) * 0.5 + b.qualityScore * 0.3 + (1 - b.latencyMs / 5000) * 0.2;
        return scoreB - scoreA;
      })[0] || null;
  }
}
