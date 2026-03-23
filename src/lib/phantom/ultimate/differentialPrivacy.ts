/**
 * PHANTOM Ultimate — Differential Privacy Engine
 * Mathematical ε-δ privacy guarantees on aggregate queries.
 * Tracks cumulative privacy budget and auto-blocks when exhausted.
 */

export interface PrivacyQuery {
  id: string;
  datasetId: string;
  queryType: 'count' | 'sum' | 'mean' | 'histogram' | 'percentile';
  epsilon: number;          // privacy cost of this query
  delta: number;            // failure probability
  sensitivity: number;      // query sensitivity
  noiseMechanism: 'laplace' | 'gaussian';
  rawResult: number;
  noisyResult: number;
  noiseAdded: number;
  timestamp: number;
}

export interface DatasetBudget {
  datasetId: string;
  totalEpsilon: number;     // allocated budget
  consumedEpsilon: number;  // spent so far
  remainingEpsilon: number;
  queryCount: number;
  lastQueryAt: number;
  exhausted: boolean;
}

export interface DPStats {
  totalQueries: number;
  totalDatasets: number;
  avgEpsilonPerQuery: number;
  exhaustedDatasets: number;
  blockedQueries: number;
}

const MAX_QUERIES = 2000;
const DEFAULT_BUDGET = 10.0;  // total epsilon budget per dataset

const budgets = new Map<string, DatasetBudget>();
const queryLog: PrivacyQuery[] = [];
let blockedCount = 0;

function laplaceNoise(sensitivity: number, epsilon: number): number {
  const scale = sensitivity / epsilon;
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

function gaussianNoise(sensitivity: number, epsilon: number, delta: number): number {
  const sigma = sensitivity * Math.sqrt(2 * Math.log(1.25 / delta)) / epsilon;
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  return sigma * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function allocateBudget(datasetId: string, totalEpsilon: number = DEFAULT_BUDGET): DatasetBudget {
  const budget: DatasetBudget = {
    datasetId, totalEpsilon, consumedEpsilon: 0,
    remainingEpsilon: totalEpsilon, queryCount: 0,
    lastQueryAt: 0, exhausted: false,
  };
  budgets.set(datasetId, budget);
  return budget;
}

export function privateQuery(
  datasetId: string, queryType: PrivacyQuery['queryType'],
  rawResult: number, sensitivity: number, epsilon: number,
  delta: number = 1e-5, mechanism: 'laplace' | 'gaussian' = 'laplace'
): PrivacyQuery | null {
  let budget = budgets.get(datasetId);
  if (!budget) budget = allocateBudget(datasetId);

  // Check budget
  if (budget.consumedEpsilon + epsilon > budget.totalEpsilon) {
    blockedCount++;
    return null; // budget exhausted
  }

  // Add calibrated noise
  const noise = mechanism === 'laplace'
    ? laplaceNoise(sensitivity, epsilon)
    : gaussianNoise(sensitivity, epsilon, delta);

  const noisyResult = rawResult + noise;

  // Account for budget
  budget.consumedEpsilon += epsilon;
  budget.remainingEpsilon = budget.totalEpsilon - budget.consumedEpsilon;
  budget.queryCount++;
  budget.lastQueryAt = Date.now();
  budget.exhausted = budget.remainingEpsilon <= 0;

  const query: PrivacyQuery = {
    id: `dpq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    datasetId, queryType, epsilon, delta, sensitivity,
    noiseMechanism: mechanism, rawResult, noisyResult,
    noiseAdded: noise, timestamp: Date.now(),
  };

  if (queryLog.length >= MAX_QUERIES) queryLog.shift();
  queryLog.push(query);
  return query;
}

export function getBudget(datasetId: string): DatasetBudget | null {
  return budgets.get(datasetId) ?? null;
}

export function getDPStats(): DPStats {
  const all = [...budgets.values()];
  return {
    totalQueries: queryLog.length,
    totalDatasets: all.length,
    avgEpsilonPerQuery: queryLog.length > 0 ? queryLog.reduce((s, q) => s + q.epsilon, 0) / queryLog.length : 0,
    exhaustedDatasets: all.filter(b => b.exhausted).length,
    blockedQueries: blockedCount,
  };
}

export function resetDPState(): void { budgets.clear(); queryLog.length = 0; blockedCount = 0; }
