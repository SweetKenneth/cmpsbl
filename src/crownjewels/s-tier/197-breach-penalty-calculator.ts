/**
 * S-Tier 197 — Breach Penalty Calculator
 * ID: S-TRT02 | CJPI: 92 | Module: TREATY
 *
 * Evaluates SLA breaches with severity-weighted penalties, supports
 * escalation tiers, grace periods, and cumulative breach tracking.
 */

export interface Contract {
  id: string;
  parties: string[];
  sla: Record<string, number>;
  penaltyRate: number;
  gracePeriodMs: number;
  escalationMultipliers: number[];
}

export interface BreachRecord {
  contractId: string;
  metric: string;
  actual: number;
  threshold: number;
  penalty: number;
  escalationTier: number;
  timestamp: string;
}

export class BreachPenaltyCalculator {
  private contracts: Map<string, Contract> = new Map();
  private breaches: BreachRecord[] = [];
  private breachCounts: Map<string, number> = new Map();

  registerContract(id: string, parties: string[], sla: Record<string, number>, penaltyRate: number, gracePeriodMs: number = 0, escalationMultipliers: number[] = [1, 1.5, 2, 3]): void {
    this.contracts.set(id, { id, parties, sla, penaltyRate, gracePeriodMs, escalationMultipliers });
    this.breachCounts.set(id, 0);
  }

  evaluateBreach(contractId: string, metrics: Record<string, number>): { breached: boolean; penalties: { metric: string; penalty: number; escalationTier: number }[]; totalPenalty: number } {
    const contract = this.contracts.get(contractId);
    if (!contract) return { breached: false, penalties: [], totalPenalty: 0 };

    const penalties: { metric: string; penalty: number; escalationTier: number }[] = [];
    let totalPenalty = 0;

    for (const [metric, threshold] of Object.entries(contract.sla)) {
      const actual = metrics[metric] ?? 0;
      if (actual < threshold) {
        const severity = (threshold - actual) / threshold;
        const count = this.breachCounts.get(contractId) ?? 0;
        const escalationTier = Math.min(count, contract.escalationMultipliers.length - 1);
        const multiplier = contract.escalationMultipliers[escalationTier];
        const penalty = severity * contract.penaltyRate * multiplier;

        penalties.push({ metric, penalty, escalationTier });
        totalPenalty += penalty;
        this.breaches.push({ contractId, metric, actual, threshold, penalty, escalationTier, timestamp: new Date().toISOString() });
      }
    }

    if (penalties.length > 0) {
      this.breachCounts.set(contractId, (this.breachCounts.get(contractId) ?? 0) + 1);
    }

    if (this.breaches.length > 2000) this.breaches = this.breaches.slice(-2000);

    return { breached: penalties.length > 0, penalties, totalPenalty };
  }

  getBreachHistory(contractId?: string): BreachRecord[] {
    const history = [...this.breaches];
    return contractId ? history.filter(b => b.contractId === contractId) : history;
  }

  getCumulativePenalty(contractId: string): number {
    return this.breaches.filter(b => b.contractId === contractId).reduce((s, b) => s + b.penalty, 0);
  }

  getBreachFrequency(contractId: string, windowMs: number = 86400000): number {
    const cutoff = Date.now() - windowMs;
    return this.breaches.filter(b => b.contractId === contractId && new Date(b.timestamp).getTime() > cutoff).length;
  }

  getStats(): { contracts: number; totalBreaches: number; totalPenalties: number; mostBreachedMetric: string | null } {
    const metricCounts = new Map<string, number>();
    let totalPenalties = 0;
    for (const b of this.breaches) {
      metricCounts.set(b.metric, (metricCounts.get(b.metric) ?? 0) + 1);
      totalPenalties += b.penalty;
    }
    const mostBreached = [...metricCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    return { contracts: this.contracts.size, totalBreaches: this.breaches.length, totalPenalties, mostBreachedMetric: mostBreached?.[0] ?? null };
  }

  reset(): void {
    this.contracts.clear();
    this.breaches = [];
    this.breachCounts.clear();
  }
}
