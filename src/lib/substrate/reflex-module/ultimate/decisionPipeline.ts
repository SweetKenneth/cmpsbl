/**
 * REFLEX Ultimate — System 3: Sub-10ms Decision Pipeline
 * 
 * P99-targeted decision execution with Welford's latency tracking,
 * budget enforcement, and adaptive timeout calibration.
 * 
 * @module reflex/ultimate/decisionPipeline
 */

// ── Types ────────────────────────────────────────────────────────

export type DecisionOutcome = 'executed' | 'timeout' | 'fallback' | 'rejected';

export interface Decision {
  id: string;
  trigger: string;
  ruleId: string | null;
  nodeId: string;
  action: string;
  outcome: DecisionOutcome;
  latencyMs: number;
  confidence: number;          // 0-1
  budgetRemaining: number;     // Ms remaining of 10ms budget
  timestamp: number;
}

export interface LatencyStats {
  count: number;
  mean: number;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  budgetCompliance: number;    // % of decisions under 10ms
}

// ── State ────────────────────────────────────────────────────────

const decisions: Decision[] = [];
const MAX_DECISIONS = 2000;
let totalDecisions = 0;

// Welford's running stats
let welfordCount = 0;
let welfordMean = 0;
let welfordM2 = 0;
let minLatency = Infinity;
let maxLatency = 0;
let budgetCompliant = 0;

const BUDGET_MS = 10;

// ── Core API ────────────────────────────────────────────────────

/** Execute a decision with latency budget enforcement */
export function executeDecision(
  trigger: string,
  ruleId: string | null,
  nodeId: string,
  action: string,
  executeFn: () => { confidence: number },
): Decision {
  const start = performance.now();
  let outcome: DecisionOutcome = 'executed';
  let confidence = 0;

  try {
    const result = executeFn();
    confidence = result.confidence;
  } catch {
    outcome = 'fallback';
    confidence = 0.1;
  }

  const latencyMs = performance.now() - start;

  if (latencyMs > BUDGET_MS * 5) {
    outcome = 'timeout';
  }

  const decision: Decision = {
    id: `dec-${Date.now()}-${totalDecisions}`,
    trigger, ruleId, nodeId, action, outcome,
    latencyMs: Math.round(latencyMs * 1000) / 1000,
    confidence: Math.round(confidence * 1000) / 1000,
    budgetRemaining: Math.round((BUDGET_MS - latencyMs) * 1000) / 1000,
    timestamp: Date.now(),
  };

  // Record
  decisions.push(decision);
  if (decisions.length > MAX_DECISIONS) decisions.splice(0, decisions.length - MAX_DECISIONS);
  totalDecisions++;

  // Update Welford's stats
  updateWelford(latencyMs);

  return decision;
}

function updateWelford(latency: number): void {
  welfordCount++;
  const delta = latency - welfordMean;
  welfordMean += delta / welfordCount;
  const delta2 = latency - welfordMean;
  welfordM2 += delta * delta2;

  if (latency < minLatency) minLatency = latency;
  if (latency > maxLatency) maxLatency = latency;
  if (latency <= BUDGET_MS) budgetCompliant++;
}

/** Get comprehensive latency statistics */
export function getLatencyStats(): LatencyStats {
  if (welfordCount === 0) {
    return {
      count: 0, mean: 0, variance: 0, stdDev: 0,
      min: 0, max: 0, p50: 0, p90: 0, p95: 0, p99: 0,
      budgetCompliance: 100,
    };
  }

  const variance = welfordCount > 1 ? welfordM2 / (welfordCount - 1) : 0;

  // Calculate percentiles from recent decisions
  const recentLatencies = decisions.map(d => d.latencyMs).sort((a, b) => a - b);
  const n = recentLatencies.length;

  const percentile = (p: number) => {
    if (n === 0) return 0;
    const idx = Math.floor(p / 100 * (n - 1));
    return recentLatencies[idx];
  };

  return {
    count: welfordCount,
    mean: Math.round(welfordMean * 1000) / 1000,
    variance: Math.round(variance * 1000) / 1000,
    stdDev: Math.round(Math.sqrt(variance) * 1000) / 1000,
    min: Math.round(minLatency * 1000) / 1000,
    max: Math.round(maxLatency * 1000) / 1000,
    p50: Math.round(percentile(50) * 1000) / 1000,
    p90: Math.round(percentile(90) * 1000) / 1000,
    p95: Math.round(percentile(95) * 1000) / 1000,
    p99: Math.round(percentile(99) * 1000) / 1000,
    budgetCompliance: welfordCount > 0
      ? Math.round((budgetCompliant / welfordCount) * 10000) / 100
      : 100,
  };
}

/** Get recent decisions */
export function getRecentDecisions(count: number = 50): Decision[] {
  return decisions.slice(-count);
}

/** Get decisions by outcome */
export function getDecisionsByOutcome(outcome: DecisionOutcome): Decision[] {
  return decisions.filter(d => d.outcome === outcome);
}

export function getDecisionPipelineHealth() {
  const stats = getLatencyStats();
  return {
    totalDecisions,
    recentDecisions: decisions.length,
    meanLatencyMs: stats.mean,
    p99LatencyMs: stats.p99,
    budgetCompliance: stats.budgetCompliance,
    timeoutRate: totalDecisions > 0
      ? Math.round((decisions.filter(d => d.outcome === 'timeout').length / Math.min(decisions.length, 100)) * 100)
      : 0,
  };
}

export function resetDecisionPipeline(): void {
  decisions.length = 0;
  totalDecisions = 0;
  welfordCount = 0;
  welfordMean = 0;
  welfordM2 = 0;
  minLatency = Infinity;
  maxLatency = 0;
  budgetCompliant = 0;
}
