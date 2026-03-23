/**
 * ORACLE Ultimate #3 — Scenario Simulation Engine
 * Monte Carlo "what-if" analysis with convergence detection.
 * Outputs probability distributions, not single-point estimates.
 */

// ── Types ──

export type ScenarioTemplate = 'node_failure' | 'traffic_spike' | 'security_breach' | 'upgrade_rollout' | 'capacity_exhaust' | 'custom';

export interface ScenarioConfig {
  id: string;
  name: string;
  template: ScenarioTemplate;
  iterations: number;          // default 10000
  convergenceThreshold: number; // default 0.001
  parameters: Record<string, number>;
  model: (params: Record<string, number>, rng: () => number) => number;
}

export interface SimulationOutcome {
  scenarioId: string;
  iterations: number;
  iterationsRun: number;
  converged: boolean;
  convergenceIteration: number | null;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: { p5: number; p25: number; p50: number; p75: number; p95: number };
  confidenceIntervals: {
    ci90: [number, number];
    ci95: [number, number];
    ci99: [number, number];
  };
  distribution: { bucket: number; count: number }[];
  computeTimeMs: number;
}

// ── State ──

const results = new Map<string, SimulationOutcome>();
let totalSimulations = 0;
let totalIterationsRun = 0;

// ── Helpers ──

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const low = Math.floor(idx);
  const high = Math.ceil(idx);
  if (low === high) return sorted[low];
  return sorted[low] + (sorted[high] - sorted[low]) * (idx - low);
}

function buildHistogram(values: number[], buckets: number = 20): { bucket: number; count: number }[] {
  if (values.length === 0) return [];
  const min = values[0];
  const max = values[values.length - 1];
  const range = max - min || 1;
  const bucketWidth = range / buckets;
  const histogram = new Array(buckets).fill(0).map((_, i) => ({
    bucket: Math.round((min + i * bucketWidth) * 1000) / 1000,
    count: 0,
  }));
  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / bucketWidth), buckets - 1);
    histogram[idx].count++;
  }
  return histogram;
}

// ── Core ──

export function runScenario(config: ScenarioConfig): SimulationOutcome {
  const start = performance.now();
  const rng = seededRng(Date.now());
  const outcomes: number[] = [];
  let converged = false;
  let convergenceIteration: number | null = null;

  // Running variance tracking (Welford's algorithm)
  let runMean = 0;
  let runM2 = 0;

  for (let i = 0; i < config.iterations; i++) {
    const result = config.model(config.parameters, rng);
    outcomes.push(result);

    // Welford update
    const delta = result - runMean;
    runMean += delta / (i + 1);
    const delta2 = result - runMean;
    runM2 += delta * delta2;

    // Check convergence every 100 iterations after first 500
    if (i > 500 && i % 100 === 0 && !converged) {
      const variance = runM2 / i;
      if (variance < config.convergenceThreshold) {
        converged = true;
        convergenceIteration = i;
        break; // Early termination
      }
    }
  }

  // Sort for percentile calculations
  outcomes.sort((a, b) => a - b);
  const n = outcomes.length;
  const mean = outcomes.reduce((s, v) => s + v, 0) / n;
  const variance = outcomes.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  const p5 = percentile(outcomes, 5);
  const p25 = percentile(outcomes, 25);
  const p50 = percentile(outcomes, 50);
  const p75 = percentile(outcomes, 75);
  const p95 = percentile(outcomes, 95);
  const p0_5 = percentile(outcomes, 0.5);
  const p99_5 = percentile(outcomes, 99.5);
  const p2_5 = percentile(outcomes, 2.5);
  const p97_5 = percentile(outcomes, 97.5);

  const outcome: SimulationOutcome = {
    scenarioId: config.id,
    iterations: config.iterations,
    iterationsRun: n,
    converged,
    convergenceIteration,
    mean: Math.round(mean * 10000) / 10000,
    median: p50,
    stdDev: Math.round(stdDev * 10000) / 10000,
    min: outcomes[0],
    max: outcomes[n - 1],
    percentiles: { p5, p25, p50, p75, p95 },
    confidenceIntervals: {
      ci90: [p5, p95],
      ci95: [p2_5, p97_5],
      ci99: [p0_5, p99_5],
    },
    distribution: buildHistogram(outcomes),
    computeTimeMs: performance.now() - start,
  };

  results.set(config.id, outcome);
  totalSimulations++;
  totalIterationsRun += n;
  return outcome;
}

export function getScenarioResult(id: string): SimulationOutcome | undefined {
  return results.get(id);
}

export function getSimulationStats(): { totalSimulations: number; totalIterationsRun: number; avgConvergenceRate: number } {
  const convergedCount = Array.from(results.values()).filter(r => r.converged).length;
  return {
    totalSimulations,
    totalIterationsRun,
    avgConvergenceRate: results.size > 0 ? convergedCount / results.size : 0,
  };
}

export function resetSimulationState(): void {
  results.clear();
  totalSimulations = 0;
  totalIterationsRun = 0;
}
