/**
 * SIMULATE Ultimate — System 6: A/B Scenario Comparator
 * 
 * Run two scenarios side-by-side with identical initial conditions
 * but different interventions. Statistical comparison with effect size
 * and recommendation engine.
 * 
 * @module simulate/ultimate/abScenarioComparator
 */

// ── Types ────────────────────────────────────────────────────────

export interface ABScenarioConfig {
  id: string;
  name: string;
  baseState: Record<string, number>;
  interventionA: { name: string; mutate: (state: Record<string, number>) => Record<string, number> };
  interventionB: { name: string; mutate: (state: Record<string, number>) => Record<string, number> };
  iterations: number;         // Monte Carlo iterations per arm
  targetMetrics: string[];    // Which metrics to compare
}

export interface ABComparisonResult {
  id: string;
  configId: string;
  name: string;
  interventionAName: string;
  interventionBName: string;

  metricsA: Record<string, { mean: number; stdDev: number; median: number }>;
  metricsB: Record<string, { mean: number; stdDev: number; median: number }>;

  effectSizes: Record<string, { cohensD: number; interpretation: 'negligible' | 'small' | 'medium' | 'large' }>;
  winner: Record<string, 'A' | 'B' | 'tie'>;
  overallRecommendation: 'A' | 'B' | 'inconclusive';
  confidence: number;  // 0-1

  iterations: number;
  computeTimeMs: number;
  comparedAt: string;
}

// ── State ────────────────────────────────────────────────────────

const comparisons: ABComparisonResult[] = [];
const MAX_COMPARISONS = 200;

// ── Helpers ──────────────────────────────────────────────────────

function computeStats(values: number[]): { mean: number; stdDev: number; median: number } {
  const n = values.length;
  if (n === 0) return { mean: 0, stdDev: 0, median: 0 };
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const sorted = [...values].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  return {
    mean: Math.round(mean * 10000) / 10000,
    stdDev: Math.round(Math.sqrt(variance) * 10000) / 10000,
    median: Math.round(median * 10000) / 10000,
  };
}

function cohensD(meanA: number, meanB: number, sdA: number, sdB: number): number {
  const pooledSD = Math.sqrt((sdA ** 2 + sdB ** 2) / 2);
  if (pooledSD === 0) return 0;
  return Math.round(Math.abs(meanA - meanB) / pooledSD * 10000) / 10000;
}

function interpretEffect(d: number): 'negligible' | 'small' | 'medium' | 'large' {
  if (d >= 0.8) return 'large';
  if (d >= 0.5) return 'medium';
  if (d >= 0.2) return 'small';
  return 'negligible';
}

// ── Core API ────────────────────────────────────────────────────

/** Run an A/B scenario comparison */
export function runABComparison(config: ABScenarioConfig): ABComparisonResult {
  const start = performance.now();

  // Collect metric outcomes per arm
  const armAMetrics: Record<string, number[]> = {};
  const armBMetrics: Record<string, number[]> = {};
  for (const m of config.targetMetrics) {
    armAMetrics[m] = [];
    armBMetrics[m] = [];
  }

  for (let i = 0; i < config.iterations; i++) {
    // Add small random noise to simulate stochastic outcomes
    const noise = () => 1 + (Math.random() - 0.5) * 0.1;

    const stateA = config.interventionA.mutate({ ...config.baseState });
    const stateB = config.interventionB.mutate({ ...config.baseState });

    for (const m of config.targetMetrics) {
      armAMetrics[m].push((stateA[m] ?? 0) * noise());
      armBMetrics[m].push((stateB[m] ?? 0) * noise());
    }
  }

  // Compute per-metric statistics
  const metricsA: ABComparisonResult['metricsA'] = {};
  const metricsB: ABComparisonResult['metricsB'] = {};
  const effectSizes: ABComparisonResult['effectSizes'] = {};
  const winner: ABComparisonResult['winner'] = {};

  let aWins = 0;
  let bWins = 0;

  for (const m of config.targetMetrics) {
    const statsA = computeStats(armAMetrics[m]);
    const statsB = computeStats(armBMetrics[m]);
    metricsA[m] = statsA;
    metricsB[m] = statsB;

    const d = cohensD(statsA.mean, statsB.mean, statsA.stdDev, statsB.stdDev);
    effectSizes[m] = { cohensD: d, interpretation: interpretEffect(d) };

    if (d < 0.2) {
      winner[m] = 'tie';
    } else if (statsA.mean >= statsB.mean) {
      winner[m] = 'A';
      aWins++;
    } else {
      winner[m] = 'B';
      bWins++;
    }
  }

  const overallRecommendation: 'A' | 'B' | 'inconclusive' =
    aWins > bWins ? 'A' :
    bWins > aWins ? 'B' : 'inconclusive';

  const totalMetrics = config.targetMetrics.length;
  const confidence = totalMetrics > 0
    ? Math.round((Math.max(aWins, bWins) / totalMetrics) * 1000) / 1000
    : 0;

  const result: ABComparisonResult = {
    id: crypto.randomUUID(),
    configId: config.id,
    name: config.name,
    interventionAName: config.interventionA.name,
    interventionBName: config.interventionB.name,
    metricsA, metricsB,
    effectSizes, winner,
    overallRecommendation,
    confidence,
    iterations: config.iterations,
    computeTimeMs: Math.round((performance.now() - start) * 100) / 100,
    comparedAt: new Date().toISOString(),
  };

  comparisons.push(result);
  if (comparisons.length > MAX_COMPARISONS) comparisons.splice(0, comparisons.length - MAX_COMPARISONS);

  return result;
}

export function getABComparisons(): ABComparisonResult[] { return [...comparisons]; }

export function getABComparatorHealth() {
  const recent = comparisons.slice(-30);
  return {
    totalComparisons: comparisons.length,
    avgConfidence: recent.length > 0
      ? Math.round(recent.reduce((s, r) => s + r.confidence, 0) / recent.length * 100)
      : 0,
    decisiveRate: recent.length > 0
      ? Math.round((recent.filter(r => r.overallRecommendation !== 'inconclusive').length / recent.length) * 100)
      : 0,
  };
}

export function resetABComparator(): void {
  comparisons.length = 0;
}
