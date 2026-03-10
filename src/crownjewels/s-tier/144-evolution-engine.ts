/**
 * S-Tier 144 — Evolution Engine
 * ID: S-CJ102 | CJPI: 86 | Module: EVOLUTION
 * 
 * Core evolution engine for system-wide capability evolution.
 */

export interface EvolutionGenome {
  id: string;
  generation: number;
  genes: Record<string, number>;
  fitness: number;
  lineage: string[];
}

export interface EvolutionResult {
  generation: number;
  population: EvolutionGenome[];
  bestFitness: number;
  avgFitness: number;
  convergence: number;
}

export class EvolutionEngine {
  private population: EvolutionGenome[] = [];
  private generation = 0;
  private populationSize = 20;
  private mutationRate = 0.1;

  initialize(geneNames: string[]): void {
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      const genes: Record<string, number> = {};
      for (const name of geneNames) genes[name] = Math.random();
      this.population.push({
        id: crypto.randomUUID(), generation: 0,
        genes, fitness: 0, lineage: [],
      });
    }
  }

  evaluateFitness(fitnessFunction: (genes: Record<string, number>) => number): void {
    for (const genome of this.population) {
      genome.fitness = fitnessFunction(genome.genes);
    }
    this.population.sort((a, b) => b.fitness - a.fitness);
  }

  evolve(): EvolutionResult {
    this.generation++;
    const elite = this.population.slice(0, Math.ceil(this.populationSize * 0.2));
    const newPop: EvolutionGenome[] = [...elite];

    while (newPop.length < this.populationSize) {
      const parentA = elite[Math.floor(Math.random() * elite.length)];
      const parentB = elite[Math.floor(Math.random() * elite.length)];
      const childGenes: Record<string, number> = {};

      for (const key of Object.keys(parentA.genes)) {
        childGenes[key] = Math.random() < 0.5 ? parentA.genes[key] : parentB.genes[key];
        if (Math.random() < this.mutationRate) {
          childGenes[key] = Math.max(0, Math.min(1, childGenes[key] + (Math.random() - 0.5) * 0.2));
        }
      }

      newPop.push({
        id: crypto.randomUUID(), generation: this.generation,
        genes: childGenes, fitness: 0,
        lineage: [parentA.id, parentB.id],
      });
    }

    this.population = newPop;
    const fitnesses = this.population.map(g => g.fitness);
    const avg = fitnesses.reduce((s, f) => s + f, 0) / fitnesses.length;
    const std = Math.sqrt(fitnesses.reduce((s, f) => s + (f - avg) ** 2, 0) / fitnesses.length);

    return {
      generation: this.generation,
      population: [...this.population],
      bestFitness: fitnesses[0],
      avgFitness: avg,
      convergence: 1 - Math.min(1, std),
    };
  }

  getBest(): EvolutionGenome | null { return this.population[0] || null; }
}
