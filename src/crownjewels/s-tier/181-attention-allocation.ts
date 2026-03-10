/**
 * S-Tier 181 — Attention Allocation
 * ID: S-CJ139 | CJPI: 85 | Module: CORTEX
 * Dynamic attention allocation across competing cognitive tasks.
 */

export interface AttentionTarget {
  id: string;
  label: string;
  priority: number;
  urgency: number;
  allocatedWeight: number;
  lastUpdated: number;
}

export class AttentionAllocation {
  private targets: Map<string, AttentionTarget> = new Map();
  private totalBudget = 1.0;

  addTarget(label: string, priority: number, urgency: number): AttentionTarget {
    const target: AttentionTarget = {
      id: crypto.randomUUID(), label, priority, urgency,
      allocatedWeight: 0, lastUpdated: Date.now(),
    };
    this.targets.set(target.id, target);
    this.rebalance();
    return target;
  }

  updateUrgency(targetId: string, urgency: number): void {
    const t = this.targets.get(targetId);
    if (!t) return;
    t.urgency = urgency;
    t.lastUpdated = Date.now();
    this.rebalance();
  }

  private rebalance(): void {
    const targets = [...this.targets.values()];
    const totalScore = targets.reduce((s, t) => s + t.priority * t.urgency, 0);
    if (totalScore === 0) return;
    for (const t of targets) {
      t.allocatedWeight = (t.priority * t.urgency / totalScore) * this.totalBudget;
    }
  }

  removeTarget(targetId: string): void {
    this.targets.delete(targetId);
    this.rebalance();
  }

  getAllocations(): AttentionTarget[] {
    return [...this.targets.values()].sort((a, b) => b.allocatedWeight - a.allocatedWeight);
  }

  getTopFocus(): AttentionTarget | null {
    return this.getAllocations()[0] ?? null;
  }
}
