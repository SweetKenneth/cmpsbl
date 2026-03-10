/**
 * S-Tier 197 — Breach Penalty Calculator
 * ID: S-TRT02 | CJPI: 92 | Module: TREATY
 */
export class BreachPenaltyCalculator {
  private contracts: Map<string, { parties: string[]; sla: Record<string, number>; penaltyRate: number }> = new Map();
  private breaches: { contractId: string; metric: string; actual: number; threshold: number; penalty: number; timestamp: string }[] = [];

  registerContract(id: string, parties: string[], sla: Record<string, number>, penaltyRate: number): void {
    this.contracts.set(id, { parties, sla, penaltyRate });
  }

  evaluateBreach(contractId: string, metrics: Record<string, number>): { breached: boolean; penalties: { metric: string; penalty: number }[] } {
    const contract = this.contracts.get(contractId);
    if (!contract) return { breached: false, penalties: [] };
    const penalties: { metric: string; penalty: number }[] = [];
    for (const [metric, threshold] of Object.entries(contract.sla)) {
      const actual = metrics[metric] ?? 0;
      if (actual < threshold) {
        const severity = (threshold - actual) / threshold;
        const penalty = severity * contract.penaltyRate;
        penalties.push({ metric, penalty });
        this.breaches.push({ contractId, metric, actual, threshold, penalty, timestamp: new Date().toISOString() });
      }
    }
    return { breached: penalties.length > 0, penalties };
  }

  getBreachHistory(): typeof this.breaches { return [...this.breaches]; }
}
