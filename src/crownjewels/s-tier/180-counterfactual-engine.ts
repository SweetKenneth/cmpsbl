/**
 * S-Tier 180 — Counterfactual Engine
 * ID: S-CJ138 | CJPI: 85 | Module: DREAM
 * What-if analysis engine for counterfactual reasoning.
 */

export interface CounterfactualScenario {
  id: string;
  question: string;
  alteredVariables: Record<string, unknown>;
  predictedOutcome: Record<string, unknown>;
  actualOutcome?: Record<string, unknown>;
  divergenceScore?: number;
  generatedAt: string;
}

export class CounterfactualEngine {
  private scenarios: CounterfactualScenario[] = [];

  whatIf(question: string, alteredVariables: Record<string, unknown>, baseOutcome: Record<string, number>): CounterfactualScenario {
    const predicted: Record<string, number> = {};
    for (const [key, value] of Object.entries(baseOutcome)) {
      const alteration = Object.keys(alteredVariables).length * 0.1;
      predicted[key] = value * (1 + (Math.random() - 0.5) * alteration);
    }

    const scenario: CounterfactualScenario = {
      id: crypto.randomUUID(), question, alteredVariables,
      predictedOutcome: predicted, generatedAt: new Date().toISOString(),
    };
    this.scenarios.push(scenario);
    return scenario;
  }

  validate(scenarioId: string, actualOutcome: Record<string, number>): number {
    const s = this.scenarios.find(sc => sc.id === scenarioId);
    if (!s) return 0;
    s.actualOutcome = actualOutcome;
    const predicted = s.predictedOutcome as Record<string, number>;
    const keys = Object.keys(predicted);
    if (keys.length === 0) return 0;
    const divergence = keys.reduce((sum, k) => sum + Math.abs((predicted[k] - (actualOutcome[k] ?? 0)) / Math.max(1, predicted[k])), 0) / keys.length;
    s.divergenceScore = divergence;
    return 1 - divergence;
  }

  getScenarios(): CounterfactualScenario[] { return [...this.scenarios]; }
}
