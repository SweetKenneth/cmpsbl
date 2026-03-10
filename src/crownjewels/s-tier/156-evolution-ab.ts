/**
 * S-Tier 156 — Evolution A/B
 * ID: S-CJ114 | CJPI: 85 | Module: EVOLUTION
 * A/B testing framework for system evolution experiments.
 */

export interface Experiment {
  id: string;
  name: string;
  variants: { id: string; name: string; weight: number; metrics: Record<string, number> }[];
  status: 'draft' | 'running' | 'concluded';
  winner?: string;
  startedAt?: string;
  concludedAt?: string;
  sampleSize: number;
}

export class EvolutionAB {
  private experiments: Map<string, Experiment> = new Map();

  create(name: string, variantNames: string[]): Experiment {
    const exp: Experiment = {
      id: crypto.randomUUID(), name, sampleSize: 0, status: 'draft',
      variants: variantNames.map(n => ({ id: crypto.randomUUID(), name: n, weight: 1 / variantNames.length, metrics: {} })),
    };
    this.experiments.set(exp.id, exp);
    return exp;
  }

  start(expId: string): boolean {
    const exp = this.experiments.get(expId);
    if (!exp || exp.status !== 'draft') return false;
    exp.status = 'running';
    exp.startedAt = new Date().toISOString();
    return true;
  }

  recordMetric(expId: string, variantId: string, metric: string, value: number): void {
    const exp = this.experiments.get(expId);
    if (!exp || exp.status !== 'running') return;
    const variant = exp.variants.find(v => v.id === variantId);
    if (!variant) return;
    variant.metrics[metric] = (variant.metrics[metric] ?? 0) + value;
    exp.sampleSize++;
  }

  conclude(expId: string, primaryMetric: string): string | null {
    const exp = this.experiments.get(expId);
    if (!exp || exp.status !== 'running') return null;
    exp.status = 'concluded';
    exp.concludedAt = new Date().toISOString();
    const best = exp.variants.reduce((a, b) => (a.metrics[primaryMetric] ?? 0) > (b.metrics[primaryMetric] ?? 0) ? a : b);
    exp.winner = best.id;
    return best.id;
  }

  getExperiments(): Experiment[] { return [...this.experiments.values()]; }
}
