/**
 * S-Tier 150 — Self Governance
 * ID: S-CJ108 | CJPI: 85 | Module: GOVERNANCE
 * Self-governing system with adaptive rule evolution.
 */

export interface GovernanceRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  weight: number;
  enabled: boolean;
  successCount: number;
  failureCount: number;
}

export class SelfGovernance {
  private rules: Map<string, GovernanceRule> = new Map();

  addRule(rule: GovernanceRule): void { this.rules.set(rule.id, rule); }

  evaluate(context: Record<string, unknown>): GovernanceRule[] {
    return [...this.rules.values()]
      .filter(r => r.enabled)
      .sort((a, b) => b.weight - a.weight);
  }

  recordOutcome(ruleId: string, success: boolean): void {
    const rule = this.rules.get(ruleId);
    if (!rule) return;
    if (success) { rule.successCount++; rule.weight = Math.min(1, rule.weight + 0.01); }
    else { rule.failureCount++; rule.weight = Math.max(0, rule.weight - 0.02); }
    if (rule.weight < 0.1 && rule.failureCount > 10) rule.enabled = false;
  }

  getEffectiveness(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [id, r] of this.rules) {
      const total = r.successCount + r.failureCount;
      result[id] = total > 0 ? r.successCount / total : 0;
    }
    return result;
  }

  getRules(): GovernanceRule[] { return [...this.rules.values()]; }
}
