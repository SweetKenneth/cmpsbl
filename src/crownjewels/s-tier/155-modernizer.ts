/**
 * S-Tier 155 — EVOLUTION
 * ID: S-CJ113 | CJPI: 85 | Module: EVOLUTION
 * Automated modernization engine for legacy system transformation.
 */

export interface LegacyComponent {
  id: string;
  name: string;
  technology: string;
  age: number; // months
  dependents: number;
  complexity: number; // 1-10
  modernizationCost: number;
  modernizationBenefit: number;
}

export interface ModernizationPlan {
  id: string;
  components: { componentId: string; strategy: 'rewrite' | 'wrap' | 'replace' | 'retire'; priority: number }[];
  estimatedEffort: number;
  expectedROI: number;
  generatedAt: string;
}

export class Modernizer {
  private components: Map<string, LegacyComponent> = new Map();

  register(component: LegacyComponent): void { this.components.set(component.id, component); }

  generatePlan(): ModernizationPlan {
    const scored = [...this.components.values()].map(c => {
      const urgency = c.age / 12 * c.complexity;
      const roi = c.modernizationBenefit / Math.max(1, c.modernizationCost);
      const strategy: 'rewrite' | 'wrap' | 'replace' | 'retire' =
        c.complexity > 7 ? 'replace' : c.dependents > 5 ? 'wrap' : c.age > 36 ? 'retire' : 'rewrite';
      return { componentId: c.id, strategy, priority: urgency * roi };
    }).sort((a, b) => b.priority - a.priority);

    return {
      id: crypto.randomUUID(),
      components: scored,
      estimatedEffort: scored.reduce((s, c) => s + (this.components.get(c.componentId)?.modernizationCost ?? 0), 0),
      expectedROI: scored.reduce((s, c) => s + (this.components.get(c.componentId)?.modernizationBenefit ?? 0), 0),
      generatedAt: new Date().toISOString(),
    };
  }

  getDebtScore(): number {
    const components = [...this.components.values()];
    if (components.length === 0) return 0;
    return components.reduce((s, c) => s + c.age * c.complexity / 120, 0) / components.length;
  }
}
