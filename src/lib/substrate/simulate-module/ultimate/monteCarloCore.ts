/**
 * SIMULATE Ultimate — System 1: Monte Carlo Simulation Core
 * 
 * Production-grade Monte Carlo engine with Welford's running variance,
 * convergence detection, seeded RNG for reproducibility, configurable
 * iteration counts (100–100,000), and early termination.
 * 
 * @module simulate/ultimate/monteCarloCore
 */

// ── Types ────────────────────────────────────────────────────────

export interface MonteCarloConfig {
  id: string;
  name: string;
  iterations: number;          // 100–100,000
  convergenceThreshold: number; // default 0.001
  seed?: number;               // for reproducibility
  model: (params: Record<string, number>, rng: () => number) => number;
  parameters: Record<string, number>;
}

export interface MonteCarloResult {
  id: string;
  configId: string;
  iterations: number;
  iterationsRun: number;
  converged: boolean;
  convergenceIteration: number | null;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: { p5: number; p10: number; p25: number; p50: number; p75: number; p90: number; p95: number; p99: number };
  confidenceIntervals: {
    ci90: [number, number];
    ci95: [number, number];
    ci99: [number, number];
  };
  distribution: { bucket: number; count: number }[];
  computeTimeMs: number;
  seed: number;
  timestamp: string;
}

// ── State ────────────────────────────────────────────────────────

const results: Map<string, MonteCarloResult> = new Map();
let totalSimulations = 0;
let totalIterationsRun = 0;
const MAX_RESULTS = 500;

// ── Seeded RNG ───────────────────────────────────────────────────

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

// ── Helpers ──────────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const low = Math.floor(idx);
  const high = Math.ceil(idx);
  if (low === high) return sorted[low];
  return sorted[low] + (sorted[high] - sorted[low]) * (idx - low);
}

function buildHistogram(values: number[], buckets: number = 25): { bucket: number; count: number }[] {
  if (values.length === 0) return [];
  const min = values[0];
  const max = values[values.length - 1];
  const range = max - min || 1;
  const width = range / buckets;
  const hist = Array.from({ length: buckets }, (_, i) => ({
    bucket: Math.round((min + i * width) * 1000) / 1000,
    count: 0,
  }));
  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / width), buckets - 1);
    hist[idx].count++;
  }
  return hist;
}

// ── Core API ────────────────────────────────────────────────────

/** Run a Monte Carlo simulation with convergence detection */
export function runMonteCarlo(config: MonteCarloConfig): MonteCarloResult {
  const start = performance.now();
  const seed = config.seed ?? Date.now();
  const rng = createSeededRng(seed);
  const outcomes: number[] = [];
  let converged = false;
  let convergenceIteration: number | null = null;

  // Welford's online algorithm
  let runMean = 0;
  let runM2 = 0;

  for (let i = 0; i < config.iterations; i++) {
    const result = config.model(config.parameters, rng);
    outcomes.push(result);

    const delta = result - runMean;
    runMean += delta / (i + 1);
    const delta2 = result - runMean;
    runM2 += delta * delta2;

    // Convergence check every 100 iterations after 500
    if (i > 500 && i % 100 === 0 && !converged) {
      const variance = runM2 / i;
      const coeffOfVar = Math.sqrt(variance) / Math.abs(runMean || 1);
      if (coeffOfVar < config.convergenceThreshold) {
        converged = true;
        convergenceIteration = i;
        break;
      }
    }
  }

  outcomes.sort((a, b) => a - b);
  const n = outcomes.length;
  const mean = outcomes.reduce((s, v) => s + v, 0) / n;
  const variance = outcomes.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  const p5 = percentile(outcomes, 5);
  const p10 = percentile(outcomes, 10);
  const p25 = percentile(outcomes, 25);
  const p50 = percentile(outcomes, 50);
  const p75 = percentile(outcomes, 75);
  const p90 = percentile(outcomes, 90);
  const p95 = percentile(outcomes, 95);
  const p99 = percentile(outcomes, 99);
  const p0_5 = percentile(outcomes, 0.5);
  const p99_5 = percentile(outcomes, 99.5);
  const p2_5 = percentile(outcomes, 2.5);
  const p97_5 = percentile(outcomes, 97.5);

  const mcResult: MonteCarloResult = {
    id: crypto.randomUUID(),
    configId: config.id,
    iterations: config.iterations,
    iterationsRun: n,
    converged,
    convergenceIteration,
    mean: Math.round(mean * 10000) / 10000,
    median: p50,
    stdDev: Math.round(stdDev * 10000) / 10000,
    min: outcomes[0],
    max: outcomes[n - 1],
    percentiles: { p5, p10, p25, p50, p75, p90, p95, p99 },
    confidenceIntervals: {
      ci90: [p5, p95],
      ci95: [p2_5, p97_5],
      ci99: [p0_5, p99_5],
    },
    distribution: buildHistogram(outcomes),
    computeTimeMs: Math.round((performance.now() - start) * 100) / 100,
    seed,
    timestamp: new Date().toISOString(),
  };

  results.set(mcResult.id, mcResult);
  if (results.size > MAX_RESULTS) {
    const oldest = results.keys().next().value;
    if (oldest) results.delete(oldest);
  }
  totalSimulations++;
  totalIterationsRun += n;

  return mcResult;
}

/** Get a specific result */
export function getMonteCarloResult(id: string): MonteCarloResult | undefined {
  return results.get(id);
}

/** Get engine health */
export function getMonteCarloHealth() {
  const allResults = Array.from(results.values());
  const convergedCount = allResults.filter(r => r.converged).length;
  return {
    totalSimulations,
    totalIterationsRun,
    convergenceRate: allResults.length > 0 ? Math.round((convergedCount / allResults.length) * 100) : 0,
    avgComputeTimeMs: allResults.length > 0
      ? Math.round(allResults.reduce((s, r) => s + r.computeTimeMs, 0) / allResults.length * 100) / 100
      : 0,
    cachedResults: results.size,
  };
}

/** Reset */
export function resetMonteCarlo(): void {
  results.clear();
  totalSimulations = 0;
  totalIterationsRun = 0;
}
