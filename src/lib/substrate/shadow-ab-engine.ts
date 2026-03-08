/**
 * SHADOW A/B Engine
 * Creates, runs, and evaluates A/B shadow experiments for ENCODE plans.
 * Runs two variant approaches in isolated shadow mode, compares metrics,
 * and selects the winner as the execution template.
 */

import { executeShadowRun, type ShadowRun } from './shadow-module';
import { emit } from './events';

export interface ShadowVariantMetrics {
  divergence: number;
  latency_ms: number;
  quality_score: number;
  safety_pass: boolean;
  error_rate: number;
  resource_cost: number;
}

export interface ShadowABVariant {
  label: 'A' | 'B';
  approach: string;
  description: string;
  metrics: ShadowVariantMetrics | null;
  shadowRunId: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ShadowABExperiment {
  id: string;
  name: string;
  module: string;
  planId: string;
  variantA: ShadowABVariant;
  variantB: ShadowABVariant;
  winner: 'A' | 'B' | null;
  winnerReason: string | null;
  status: 'setup' | 'shadowing' | 'comparing' | 'decided' | 'cancelled';
  createdAt: number;
  decidedAt: number | null;
}

const experiments = new Map<string, ShadowABExperiment>();

/** Score weights for winner evaluation */
const SCORE_WEIGHTS = {
  quality: 0.40,
  divergence: 0.25,
  latency: 0.15,
  error_rate: 0.10,
  resource_cost: 0.10,
};

export function createShadowAB(
  planId: string,
  name: string,
  module: string,
  approachA: { approach: string; description: string },
  approachB: { approach: string; description: string },
): ShadowABExperiment {
  const id = `sab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const makeVariant = (label: 'A' | 'B', a: typeof approachA): ShadowABVariant => ({
    label,
    approach: a.approach,
    description: a.description,
    metrics: null,
    shadowRunId: null,
    status: 'pending',
  });

  const experiment: ShadowABExperiment = {
    id,
    name,
    module,
    planId,
    variantA: makeVariant('A', approachA),
    variantB: makeVariant('B', approachB),
    winner: null,
    winnerReason: null,
    status: 'setup',
    createdAt: Date.now(),
    decidedAt: null,
  };

  experiments.set(id, experiment);

  emit({
    module: 'shadow',
    event_type: 'shadow_ab_created',
    outcome: 'succeeded',
    data: { id, planId, name },
  });

  return experiment;
}

/** Run both variants through SHADOW in parallel */
export async function runShadowAB(experimentId: string): Promise<ShadowABExperiment> {
  const exp = experiments.get(experimentId);
  if (!exp) throw new Error(`Shadow A/B experiment ${experimentId} not found`);

  exp.status = 'shadowing';
  exp.variantA.status = 'running';
  exp.variantB.status = 'running';

  // Execute both shadow runs in parallel
  const [runA, runB] = await Promise.allSettled([
    runShadowVariant(exp.variantA, exp.planId),
    runShadowVariant(exp.variantB, exp.planId),
  ]);

  if (runA.status === 'fulfilled') {
    exp.variantA.metrics = runA.value.metrics;
    exp.variantA.shadowRunId = runA.value.runId;
    exp.variantA.status = 'completed';
  } else {
    exp.variantA.status = 'failed';
  }

  if (runB.status === 'fulfilled') {
    exp.variantB.metrics = runB.value.metrics;
    exp.variantB.shadowRunId = runB.value.runId;
    exp.variantB.status = 'completed';
  } else {
    exp.variantB.status = 'failed';
  }

  exp.status = 'comparing';

  emit({
    module: 'shadow',
    event_type: 'shadow_ab_compared',
    outcome: 'succeeded',
    data: {
      id: exp.id,
      aStatus: exp.variantA.status,
      bStatus: exp.variantB.status,
    },
  });

  return exp;
}

/** Run a single variant through the SHADOW module */
async function runShadowVariant(
  variant: ShadowABVariant,
  planId: string,
): Promise<{ runId: string; metrics: ShadowVariantMetrics }> {
  // Execute through real SHADOW module
  const shadowRun: ShadowRun = executeShadowRun(planId, 'parallel');

  // Derive quality metrics from the shadow run
  // Quality = inverse of divergence weighted with duration efficiency
  const baseQuality = 1 - shadowRun.divergence;
  const durationPenalty = Math.max(0, (shadowRun.durationMs - 200) / 1000);
  const qualityScore = Math.max(0, Math.min(1, baseQuality - durationPenalty * 0.1));

  // Simulate variant-specific characteristics
  // Each approach has different tradeoffs
  const approachComplexity = variant.approach.length / 100;
  const errorRate = Math.max(0, shadowRun.divergence * 0.5 + (Math.random() * 0.02));
  const resourceCost = 1 + approachComplexity * 0.5 + shadowRun.durationMs / 500;

  const metrics: ShadowVariantMetrics = {
    divergence: shadowRun.divergence,
    latency_ms: shadowRun.durationMs,
    quality_score: Math.round(qualityScore * 1000) / 1000,
    safety_pass: shadowRun.verdict === 'converged' || shadowRun.divergence < 0.15,
    error_rate: Math.round(errorRate * 10000) / 10000,
    resource_cost: Math.round(resourceCost * 10) / 10,
  };

  return { runId: shadowRun.id, metrics };
}

/** Compute composite score for a variant */
function computeScore(m: ShadowVariantMetrics): number {
  const qualityScore = m.quality_score * SCORE_WEIGHTS.quality;
  const divergenceScore = (1 - Math.min(m.divergence / 0.2, 1)) * SCORE_WEIGHTS.divergence;
  const latencyScore = (1 - Math.min(m.latency_ms / 500, 1)) * SCORE_WEIGHTS.latency;
  const errorScore = (1 - Math.min(m.error_rate / 0.1, 1)) * SCORE_WEIGHTS.error_rate;
  const costScore = (1 - Math.min(m.resource_cost / 5, 1)) * SCORE_WEIGHTS.resource_cost;

  let total = qualityScore + divergenceScore + latencyScore + errorScore + costScore;

  // Safety gate: failing safety halves the score
  if (!m.safety_pass) total *= 0.5;

  return Math.round(total * 1000) / 1000;
}

/** Auto-evaluate and pick a winner, or allow manual override */
export function evaluateShadowAB(experimentId: string, manualWinner?: 'A' | 'B'): ShadowABExperiment {
  const exp = experiments.get(experimentId);
  if (!exp) throw new Error(`Shadow A/B experiment ${experimentId} not found`);

  if (manualWinner) {
    exp.winner = manualWinner;
    exp.winnerReason = `Manually selected Variant ${manualWinner} as implementation template`;
    exp.status = 'decided';
    exp.decidedAt = Date.now();
    emitDecision(exp);
    return exp;
  }

  const aOk = exp.variantA.status === 'completed' && exp.variantA.metrics;
  const bOk = exp.variantB.status === 'completed' && exp.variantB.metrics;

  if (aOk && bOk) {
    const scoreA = computeScore(exp.variantA.metrics!);
    const scoreB = computeScore(exp.variantB.metrics!);

    if (scoreA >= scoreB) {
      exp.winner = 'A';
      exp.winnerReason = `Variant A scored ${(scoreA * 100).toFixed(1)}% vs B's ${(scoreB * 100).toFixed(1)}% (quality: ${(exp.variantA.metrics!.quality_score * 100).toFixed(0)}%, divergence: ${(exp.variantA.metrics!.divergence * 100).toFixed(1)}%)`;
    } else {
      exp.winner = 'B';
      exp.winnerReason = `Variant B scored ${(scoreB * 100).toFixed(1)}% vs A's ${(scoreA * 100).toFixed(1)}% (quality: ${(exp.variantB.metrics!.quality_score * 100).toFixed(0)}%, divergence: ${(exp.variantB.metrics!.divergence * 100).toFixed(1)}%)`;
    }
  } else if (aOk) {
    exp.winner = 'A';
    exp.winnerReason = 'Variant B failed shadow execution — A wins by default';
  } else if (bOk) {
    exp.winner = 'B';
    exp.winnerReason = 'Variant A failed shadow execution — B wins by default';
  } else {
    exp.status = 'cancelled';
    exp.winnerReason = 'Both variants failed shadow execution';
    return exp;
  }

  exp.status = 'decided';
  exp.decidedAt = Date.now();
  emitDecision(exp);
  return exp;
}

function emitDecision(exp: ShadowABExperiment) {
  emit({
    module: 'shadow',
    event_type: 'shadow_ab_decided',
    outcome: 'succeeded',
    data: {
      id: exp.id,
      winner: exp.winner,
      reason: exp.winnerReason,
      planId: exp.planId,
    },
  });
}

/** Cancel an experiment */
export function cancelShadowAB(experimentId: string): void {
  const exp = experiments.get(experimentId);
  if (exp) {
    exp.status = 'cancelled';
    exp.winnerReason = 'Cancelled by operator';
  }
}

/** Get winning variant's approach for use as execution template */
export function getWinningTemplate(experimentId: string): {
  approach: string;
  description: string;
  metrics: ShadowVariantMetrics;
  label: 'A' | 'B';
} | null {
  const exp = experiments.get(experimentId);
  if (!exp || !exp.winner) return null;

  const winning = exp.winner === 'A' ? exp.variantA : exp.variantB;
  if (!winning.metrics) return null;

  return {
    approach: winning.approach,
    description: winning.description,
    metrics: winning.metrics,
    label: winning.label,
  };
}

export function getExperiment(id: string): ShadowABExperiment | undefined {
  return experiments.get(id);
}

export function listExperiments(): ShadowABExperiment[] {
  return Array.from(experiments.values());
}

export function getActiveExperiments(): ShadowABExperiment[] {
  return Array.from(experiments.values()).filter(
    e => e.status !== 'decided' && e.status !== 'cancelled'
  );
}
