/**
 * S-Tier 174 — Adversarial Simulation
 * ID: S-CJ132 | CJPI: 85 | Module: DEFENSE
 * Adversarial attack simulation for defense hardening.
 */

export interface AttackScenario {
  id: string;
  name: string;
  vector: string;
  complexity: number;
  steps: string[];
}

export interface SimulationResult {
  id: string;
  scenarioId: string;
  defended: boolean;
  breachedAt?: string;
  defenseScore: number;
  weaknesses: string[];
  runAt: string;
}

export class AdversarialSimulation {
  private scenarios: Map<string, AttackScenario> = new Map();
  private results: SimulationResult[] = [];

  addScenario(scenario: AttackScenario): void { this.scenarios.set(scenario.id, scenario); }

  simulate(scenarioId: string, defenseCapabilities: string[]): SimulationResult {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) throw new Error('Scenario not found');
    const coverage = defenseCapabilities.length / Math.max(1, scenario.steps.length);
    const defended = coverage > 0.7 && Math.random() < coverage;
    const weaknesses = scenario.steps.filter(() => Math.random() > coverage);
    const result: SimulationResult = {
      id: crypto.randomUUID(), scenarioId, defended, defenseScore: coverage,
      weaknesses, runAt: new Date().toISOString(),
      ...(defended ? {} : { breachedAt: scenario.steps[Math.floor(Math.random() * scenario.steps.length)] }),
    };
    this.results.push(result);
    return result;
  }

  getVulnerabilities(): string[] {
    const weakMap = new Map<string, number>();
    for (const r of this.results) for (const w of r.weaknesses) weakMap.set(w, (weakMap.get(w) ?? 0) + 1);
    return [...weakMap.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w);
  }

  getDefenseScore(): number {
    if (this.results.length === 0) return 0;
    return this.results.reduce((s, r) => s + r.defenseScore, 0) / this.results.length;
  }
}
