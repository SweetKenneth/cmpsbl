/**
 * S-Tier 204 — Ethical Constraint Engine
 * ID: S-CON01 | CJPI: 91 | Module: CONSCIENCE
 */
export class EthicalConstraintEngine {
  private constraints: { id: string; policy: string; weight: number; harmThreshold: number }[] = [];

  addConstraint(policy: string, weight: number, harmThreshold: number): void {
    this.constraints.push({ id: crypto.randomUUID(), policy, weight, harmThreshold });
  }

  evaluate(action: string, harmPotential: number): { allowed: boolean; score: number; violations: string[] } {
    const violations: string[] = [];
    let score = 1;
    for (const c of this.constraints) {
      if (harmPotential > c.harmThreshold) { violations.push(c.policy); score -= c.weight * 0.2; }
    }
    return { allowed: violations.length === 0, score: Math.max(0, score), violations };
  }
}
