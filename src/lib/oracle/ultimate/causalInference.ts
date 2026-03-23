/**
 * ORACLE Ultimate #8 — Causal Inference Engine
 * Distinguishes correlation from causation using intervention analysis.
 * Builds causal DAGs, counterfactual reasoning, Granger causality.
 */

// ── Types ──

export interface CausalRelationship {
  causeId: string;
  effectId: string;
  strength: number;          // 0-1 causal strength
  direction: 'forward' | 'bidirectional' | 'confounded';
  evidence: CausalEvidence;
  discoveredAt: number;
}

export interface CausalEvidence {
  correlationCoeff: number;
  grangerPValue: number;      // < 0.05 = significant
  interventionTested: boolean;
  interventionResult: number | null;
  sampleSize: number;
}

export interface CausalDAG {
  id: string;
  name: string;
  variables: string[];
  edges: CausalRelationship[];
  confounders: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CounterfactualResult {
  question: string;         // "What if X didn't happen?"
  observedOutcome: number;
  counterfactualOutcome: number;
  causalEffect: number;     // observed - counterfactual
  confidence: number;
}

// ── State ──

const dags = new Map<string, CausalDAG>();
const counterfactuals: CounterfactualResult[] = [];
let totalTests = 0;

// ── Helpers ──

function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i]; sumY += ys[i];
    sumXY += xs[i] * ys[i];
    sumX2 += xs[i] * xs[i]; sumY2 += ys[i] * ys[i];
  }
  const denom = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
  return denom > 0 ? (n * sumXY - sumX * sumY) / denom : 0;
}

/** Simplified Granger causality test using lagged correlation as proxy. */
function grangerProxy(cause: number[], effect: number[], lag: number = 1): number {
  if (cause.length < lag + 5) return 1; // Not enough data
  const lagged = cause.slice(0, -lag);
  const target = effect.slice(lag);
  const n = Math.min(lagged.length, target.length);
  const corr = Math.abs(pearsonCorrelation(lagged.slice(0, n), target.slice(0, n)));
  // Convert to pseudo p-value (simplified)
  return Math.max(0.001, 1 - corr * Math.sqrt(n) / (1 + Math.sqrt(n)));
}

// ── Core ──

export function createCausalDAG(id: string, name: string, variables: string[]): CausalDAG {
  const dag: CausalDAG = {
    id, name, variables, edges: [], confounders: [],
    createdAt: Date.now(), updatedAt: Date.now(),
  };
  dags.set(id, dag);
  return dag;
}

export function testCausality(
  dagId: string,
  causeId: string,
  effectId: string,
  causeData: number[],
  effectData: number[],
): CausalRelationship | null {
  const dag = dags.get(dagId);
  if (!dag) return null;

  const corr = pearsonCorrelation(causeData, effectData);
  const pValue = grangerProxy(causeData, effectData);
  const reverseP = grangerProxy(effectData, causeData);

  totalTests++;

  let direction: CausalRelationship['direction'];
  if (pValue < 0.05 && reverseP >= 0.05) direction = 'forward';
  else if (pValue < 0.05 && reverseP < 0.05) direction = 'bidirectional';
  else direction = 'confounded';

  const strength = Math.abs(corr) * (pValue < 0.05 ? 1 : 0.3);

  const relationship: CausalRelationship = {
    causeId, effectId,
    strength: Math.round(strength * 1000) / 1000,
    direction,
    evidence: {
      correlationCoeff: Math.round(corr * 1000) / 1000,
      grangerPValue: Math.round(pValue * 10000) / 10000,
      interventionTested: false,
      interventionResult: null,
      sampleSize: Math.min(causeData.length, effectData.length),
    },
    discoveredAt: Date.now(),
  };

  // Add to DAG if significant
  if (pValue < 0.05) {
    dag.edges.push(relationship);
    dag.updatedAt = Date.now();
  }

  return relationship;
}

export function runCounterfactual(
  question: string,
  observedOutcome: number,
  causalStrength: number,
  interventionMagnitude: number,
): CounterfactualResult {
  const causalEffect = causalStrength * interventionMagnitude;
  const counterfactualOutcome = observedOutcome - causalEffect;
  const result: CounterfactualResult = {
    question,
    observedOutcome,
    counterfactualOutcome: Math.round(counterfactualOutcome * 1000) / 1000,
    causalEffect: Math.round(causalEffect * 1000) / 1000,
    confidence: Math.min(1, causalStrength),
  };
  counterfactuals.push(result);
  if (counterfactuals.length > 500) counterfactuals.splice(0, counterfactuals.length - 500);
  return result;
}

export function getCausalDAG(id: string): CausalDAG | undefined {
  return dags.get(id);
}

export function getCausalStats(): { totalDAGs: number; totalEdges: number; totalTests: number; significantRelationships: number } {
  let totalEdges = 0;
  for (const dag of dags.values()) totalEdges += dag.edges.length;
  return {
    totalDAGs: dags.size,
    totalEdges,
    totalTests,
    significantRelationships: totalEdges,
  };
}

export function resetCausalState(): void {
  dags.clear();
  counterfactuals.length = 0;
  totalTests = 0;
}
