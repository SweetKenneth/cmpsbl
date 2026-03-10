/**
 * S-Tier 184 — Classifier Library
 * ID: S-CJ142 | CJPI: 85 | Module: BRAIN
 * Extensible classification library with pluggable strategies.
 */

export interface ClassifierStrategy {
  id: string;
  name: string;
  classify: (input: Record<string, number>) => string;
  accuracy: number;
  trainedOn: number;
}

export interface ClassificationResult {
  input: Record<string, number>;
  label: string;
  confidence: number;
  strategyUsed: string;
  classifiedAt: string;
}

export class ClassifierLibrary {
  private strategies: Map<string, ClassifierStrategy> = new Map();
  private results: ClassificationResult[] = [];

  register(strategy: ClassifierStrategy): void { this.strategies.set(strategy.id, strategy); }

  classify(input: Record<string, number>, strategyId?: string): ClassificationResult {
    const strategy = strategyId
      ? this.strategies.get(strategyId)
      : [...this.strategies.values()].sort((a, b) => b.accuracy - a.accuracy)[0];

    if (!strategy) throw new Error('No classifier strategy available');

    const label = strategy.classify(input);
    const result: ClassificationResult = {
      input, label, confidence: strategy.accuracy,
      strategyUsed: strategy.id, classifiedAt: new Date().toISOString(),
    };
    this.results.push(result);
    if (this.results.length > 1000) this.results = this.results.slice(-1000);
    return result;
  }

  ensemble(input: Record<string, number>): { label: string; agreement: number } {
    const votes = new Map<string, number>();
    for (const strategy of this.strategies.values()) {
      const label = strategy.classify(input);
      votes.set(label, (votes.get(label) ?? 0) + strategy.accuracy);
    }
    const sorted = [...votes.entries()].sort((a, b) => b[1] - a[1]);
    const totalWeight = [...votes.values()].reduce((s, v) => s + v, 0);
    return { label: sorted[0]?.[0] ?? 'unknown', agreement: (sorted[0]?.[1] ?? 0) / Math.max(1, totalWeight) };
  }

  getStrategies(): ClassifierStrategy[] { return [...this.strategies.values()]; }
}
