/**
 * S-Tier 178 — Homeostatic Regulator
 * ID: S-CJ136 | CJPI: 85 | Module: CORE
 * Maintains system homeostasis through feedback loop regulation.
 */

export interface HomeostaticVariable {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  tolerance: number;
  correctionRate: number;
}

export class HomeostaticRegulator {
  private variables: Map<string, HomeostaticVariable> = new Map();

  register(variable: HomeostaticVariable): void { this.variables.set(variable.id, variable); }

  update(variableId: string, value: number): { corrected: boolean; adjustment: number } {
    const v = this.variables.get(variableId);
    if (!v) return { corrected: false, adjustment: 0 };
    v.currentValue = value;
    const deviation = v.currentValue - v.targetValue;
    if (Math.abs(deviation) <= v.tolerance) return { corrected: false, adjustment: 0 };
    const adjustment = -deviation * v.correctionRate;
    v.currentValue += adjustment;
    return { corrected: true, adjustment };
  }

  regulate(): { variable: string; deviation: number; adjustment: number }[] {
    const adjustments: { variable: string; deviation: number; adjustment: number }[] = [];
    for (const [id, v] of this.variables) {
      const deviation = v.currentValue - v.targetValue;
      if (Math.abs(deviation) > v.tolerance) {
        const adj = -deviation * v.correctionRate;
        v.currentValue += adj;
        adjustments.push({ variable: id, deviation, adjustment: adj });
      }
    }
    return adjustments;
  }

  getHealth(): number {
    const vars = [...this.variables.values()];
    if (vars.length === 0) return 1;
    return 1 - vars.reduce((s, v) => s + Math.abs(v.currentValue - v.targetValue) / Math.max(1, v.targetValue), 0) / vars.length;
  }
}
