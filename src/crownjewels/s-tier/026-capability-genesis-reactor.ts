/**
 * S-Tier Crown Jewel #168 — Forge-Evolution Capability Genesis Reactor
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 168 | CJPI: 95 | Version: 1.0.0
 * Module: FORGE×EVOLUTION | Type: Architecture (Cross-Module)
 * Signature: 13a4b5c7
 *
 * Closed-loop capability creation where FORGE synthesizes capabilities
 * and EVOLUTION pressure-tests them through fitness evaluation.
 */

type GenesisState = 'seeded' | 'synthesizing' | 'testing' | 'fit' | 'unfit' | 'promoted' | 'archived';

interface CapabilityGenome {
  id: string;
  name: string;
  parentIds: string[];
  generation: number;
  modules: string[];
  traits: Record<string, number>; // trait name → strength (0-1)
  fitnessScore: number;
  state: GenesisState;
  createdAt: number;
  mutations: GenomeMutation[];
}

interface GenomeMutation {
  trait: string;
  previousValue: number;
  newValue: number;
  mutationType: 'drift' | 'crossover' | 'insertion' | 'deletion';
  generation: number;
}

interface FitnessEvaluation {
  genomeId: string;
  scores: {
    performance: number;    // 0-100
    reliability: number;    // 0-100
    composability: number;  // 0-100
    novelty: number;        // 0-100
  };
  composite: number;
  passThreshold: boolean;
  evaluatedAt: number;
}

interface GenerationReport {
  generation: number;
  populationSize: number;
  avgFitness: number;
  bestGenome: string;
  bestFitness: number;
  promoted: number;
  culled: number;
}

export function createGenesisReactor(config: {
  populationCap?: number;
  fitnessThreshold?: number;
  mutationRate?: number;
} = {}) {
  const genomes = new Map<string, CapabilityGenome>();
  const evaluations = new Map<string, FitnessEvaluation>();
  const generationReports: GenerationReport[] = [];

  const populationCap = config.populationCap ?? 100;
  const fitnessThreshold = config.fitnessThreshold ?? 65;
  const mutationRate = config.mutationRate ?? 0.15;

  let currentGeneration = 0;
  let idCounter = 0;
  const nextId = () => `gen-${Date.now()}-${++idCounter}`;

  function seed(params: {
    name: string;
    modules: string[];
    traits: Record<string, number>;
  }): CapabilityGenome {
    const genome: CapabilityGenome = {
      id: nextId(),
      name: params.name,
      parentIds: [],
      generation: currentGeneration,
      modules: params.modules,
      traits: { ...params.traits },
      fitnessScore: 0,
      state: 'seeded',
      createdAt: Date.now(),
      mutations: [],
    };
    genomes.set(genome.id, genome);
    return genome;
  }

  function mutate(genomeId: string): CapabilityGenome | null {
    const parent = genomes.get(genomeId);
    if (!parent) return null;

    const child: CapabilityGenome = {
      id: nextId(),
      name: `${parent.name}-m${currentGeneration}`,
      parentIds: [parent.id],
      generation: currentGeneration,
      modules: [...parent.modules],
      traits: { ...parent.traits },
      fitnessScore: 0,
      state: 'synthesizing',
      createdAt: Date.now(),
      mutations: [],
    };

    // Apply random mutations
    for (const [trait, value] of Object.entries(child.traits)) {
      if (Math.random() < mutationRate) {
        const delta = (Math.random() - 0.5) * 0.3;
        const newValue = Math.max(0, Math.min(1, value + delta));
        child.mutations.push({
          trait,
          previousValue: value,
          newValue,
          mutationType: 'drift',
          generation: currentGeneration,
        });
        child.traits[trait] = newValue;
      }
    }

    // Occasional trait insertion
    if (Math.random() < mutationRate * 0.3) {
      const newTrait = `trait_${Date.now() % 1000}`;
      child.traits[newTrait] = Math.random();
      child.mutations.push({
        trait: newTrait,
        previousValue: 0,
        newValue: child.traits[newTrait],
        mutationType: 'insertion',
        generation: currentGeneration,
      });
    }

    genomes.set(child.id, child);
    return child;
  }

  function crossover(parentA: string, parentB: string): CapabilityGenome | null {
    const a = genomes.get(parentA);
    const b = genomes.get(parentB);
    if (!a || !b) return null;

    const traits: Record<string, number> = {};
    const allTraits = new Set([...Object.keys(a.traits), ...Object.keys(b.traits)]);

    for (const trait of allTraits) {
      const va = a.traits[trait] ?? 0;
      const vb = b.traits[trait] ?? 0;
      traits[trait] = Math.random() < 0.5 ? va : vb; // Uniform crossover
    }

    const child: CapabilityGenome = {
      id: nextId(),
      name: `${a.name}×${b.name}`,
      parentIds: [a.id, b.id],
      generation: currentGeneration,
      modules: [...new Set([...a.modules, ...b.modules])],
      traits,
      fitnessScore: 0,
      state: 'synthesizing',
      createdAt: Date.now(),
      mutations: Object.keys(traits).map(trait => ({
        trait,
        previousValue: a.traits[trait] ?? 0,
        newValue: traits[trait],
        mutationType: 'crossover' as const,
        generation: currentGeneration,
      })),
    };

    genomes.set(child.id, child);
    return child;
  }

  function evaluate(genomeId: string): FitnessEvaluation | null {
    const genome = genomes.get(genomeId);
    if (!genome) return null;

    const traitValues = Object.values(genome.traits);
    const avgTrait = traitValues.length > 0 ? traitValues.reduce((a, b) => a + b, 0) / traitValues.length : 0;

    const scores = {
      performance: Math.round(avgTrait * 100),
      reliability: Math.round((1 - (genome.mutations.length * 0.02)) * 100),
      composability: Math.round((genome.modules.length / 5) * 100),
      novelty: Math.round(Math.min(1, genome.generation / 10) * 100),
    };

    const composite = Math.round(
      scores.performance * 0.3 +
      scores.reliability * 0.3 +
      scores.composability * 0.2 +
      scores.novelty * 0.2
    );

    const evaluation: FitnessEvaluation = {
      genomeId,
      scores,
      composite,
      passThreshold: composite >= fitnessThreshold,
      evaluatedAt: Date.now(),
    };

    genome.fitnessScore = composite;
    genome.state = evaluation.passThreshold ? 'fit' : 'unfit';
    evaluations.set(genomeId, evaluation);

    return evaluation;
  }

  function runGeneration(): GenerationReport {
    currentGeneration++;
    const population = [...genomes.values()].filter(g => g.state !== 'archived' && g.state !== 'promoted');

    // Evaluate all
    for (const genome of population) {
      if (!evaluations.has(genome.id)) evaluate(genome.id);
    }

    // Sort by fitness
    population.sort((a, b) => b.fitnessScore - a.fitnessScore);

    // Promote top performers
    let promoted = 0;
    for (const genome of population.slice(0, 3)) {
      if (genome.fitnessScore >= fitnessThreshold) {
        genome.state = 'promoted';
        promoted++;
      }
    }

    // Cull bottom performers if over population cap
    let culled = 0;
    if (population.length > populationCap) {
      const toRemove = population.slice(populationCap);
      for (const genome of toRemove) {
        genome.state = 'archived';
        culled++;
      }
    }

    const report: GenerationReport = {
      generation: currentGeneration,
      populationSize: population.length,
      avgFitness: population.length > 0
        ? population.reduce((sum, g) => sum + g.fitnessScore, 0) / population.length
        : 0,
      bestGenome: population[0]?.id ?? '',
      bestFitness: population[0]?.fitnessScore ?? 0,
      promoted,
      culled,
    };

    generationReports.push(report);
    return report;
  }

  return {
    seed,
    mutate,
    crossover,
    evaluate,
    runGeneration,
    getGenome: (id: string) => genomes.get(id),
    getEvaluation: (id: string) => evaluations.get(id),
    listGenomes: (state?: GenesisState) => {
      const all = [...genomes.values()];
      return state ? all.filter(g => g.state === state) : all;
    },
    getGenerationReports: () => [...generationReports],
    getCurrentGeneration: () => currentGeneration,
    stats: () => ({
      totalGenomes: genomes.size,
      currentGeneration,
      promoted: [...genomes.values()].filter(g => g.state === 'promoted').length,
      avgFitness: generationReports.length > 0
        ? generationReports[generationReports.length - 1].avgFitness
        : 0,
    }),
  };
}
