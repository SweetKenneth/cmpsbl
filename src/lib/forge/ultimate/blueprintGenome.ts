/**
 * FORGE Ultimate #1 — Blueprint Genome Engine
 * Structured DNA for every blueprint: module composition, resolver chain,
 * data flow pattern, complexity signature. Mutation breeding via crossover.
 */

// ── Types ──

export interface BlueprintGenome {
  id: string;
  blueprintId: string;
  modules: string[];
  resolverChain: string[];
  dataFlowPattern: 'pipeline' | 'fan_out' | 'fan_in' | 'saga' | 'cqrs' | 'event_driven' | 'request_reply';
  complexitySignature: number;    // 0-1
  lineageParents: string[];       // Genome IDs this was bred from
  generation: number;
  fitness: number;                // CJPI-derived, 0-100
  createdAt: number;
}

export interface GenomeSimilarity {
  genomeA: string;
  genomeB: string;
  jaccardModules: number;
  jaccardResolvers: number;
  overallSimilarity: number;
}

export interface CrossoverResult {
  childGenome: BlueprintGenome;
  parentA: string;
  parentB: string;
  crossoverPoint: number;
  novelModules: string[];
}

// ── State ──

const genomes = new Map<string, BlueprintGenome>();
let idCounter = 0;
let totalCrossovers = 0;

// ── Helpers ──

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

function complexityFromModules(modules: string[], resolvers: string[]): number {
  const base = Math.min(1, (modules.length * 0.1 + resolvers.length * 0.05));
  return Math.round(base * 1000) / 1000;
}

// ── Core ──

export function encodeGenome(blueprintId: string, modules: string[], resolverChain: string[], pattern: BlueprintGenome['dataFlowPattern'], fitness?: number): BlueprintGenome {
  const genome: BlueprintGenome = {
    id: `genome-${++idCounter}-${Date.now().toString(36)}`,
    blueprintId,
    modules: [...modules],
    resolverChain: [...resolverChain],
    dataFlowPattern: pattern,
    complexitySignature: complexityFromModules(modules, resolverChain),
    lineageParents: [],
    generation: 0,
    fitness: fitness ?? 50,
    createdAt: Date.now(),
  };
  genomes.set(genome.id, genome);
  return genome;
}

export function compareSimilarity(idA: string, idB: string): GenomeSimilarity | null {
  const a = genomes.get(idA);
  const b = genomes.get(idB);
  if (!a || !b) return null;

  const jm = jaccard(a.modules, b.modules);
  const jr = jaccard(a.resolverChain, b.resolverChain);
  return {
    genomeA: idA, genomeB: idB,
    jaccardModules: Math.round(jm * 1000) / 1000,
    jaccardResolvers: Math.round(jr * 1000) / 1000,
    overallSimilarity: Math.round(((jm + jr) / 2) * 1000) / 1000,
  };
}

export function crossover(parentAId: string, parentBId: string): CrossoverResult | null {
  const a = genomes.get(parentAId);
  const b = genomes.get(parentBId);
  if (!a || !b) return null;

  // Single-point crossover on modules
  const crossoverPoint = Math.floor(a.modules.length / 2);
  const childModules = [...new Set([...a.modules.slice(0, crossoverPoint), ...b.modules.slice(crossoverPoint)])];
  const childResolvers = [...new Set([...a.resolverChain.slice(0, Math.floor(a.resolverChain.length / 2)), ...b.resolverChain.slice(Math.floor(b.resolverChain.length / 2))])];

  const novelModules = childModules.filter(m => !a.modules.includes(m) && !b.modules.includes(m));

  const child = encodeGenome(
    `bred-${Date.now().toString(36)}`,
    childModules, childResolvers,
    Math.random() > 0.5 ? a.dataFlowPattern : b.dataFlowPattern,
    (a.fitness + b.fitness) / 2,
  );
  child.lineageParents = [parentAId, parentBId];
  child.generation = Math.max(a.generation, b.generation) + 1;

  totalCrossovers++;
  return { childGenome: child, parentA: parentAId, parentB: parentBId, crossoverPoint, novelModules };
}

export function findSimilar(genomeId: string, threshold: number = 0.7): GenomeSimilarity[] {
  const results: GenomeSimilarity[] = [];
  for (const other of genomes.keys()) {
    if (other === genomeId) continue;
    const sim = compareSimilarity(genomeId, other);
    if (sim && sim.overallSimilarity >= threshold) results.push(sim);
  }
  return results.sort((a, b) => b.overallSimilarity - a.overallSimilarity);
}

export function getGenome(id: string): BlueprintGenome | undefined { return genomes.get(id); }

export function getGenomeStats(): { total: number; avgFitness: number; totalCrossovers: number; maxGeneration: number } {
  const all = Array.from(genomes.values());
  return {
    total: all.length,
    avgFitness: all.length > 0 ? Math.round(all.reduce((s, g) => s + g.fitness, 0) / all.length) : 0,
    totalCrossovers,
    maxGeneration: all.length > 0 ? Math.max(...all.map(g => g.generation)) : 0,
  };
}

export function resetGenomeState(): void { genomes.clear(); idCounter = 0; totalCrossovers = 0; }
