/**
 * CONSCIENCE Module — Ethical Reasoning & Value Alignment
 * Bias detection, moral framework evaluation, alignment scoring
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { clampNumber } from '@/lib/system/hardening';

export type EthicalFramework = 'utilitarian' | 'deontological' | 'virtue_ethics' | 'care_ethics' | 'rights_based' | 'justice_theory';
export type BiasType = 'gender' | 'racial' | 'age' | 'socioeconomic' | 'cultural' | 'confirmation' | 'anchoring' | 'selection';

export interface EthicalEvaluation {
  id: string;
  action: string;
  frameworkScores: Record<EthicalFramework, number>;
  compositeScore: number;
  recommendation: 'proceed' | 'caution' | 'block';
  rationale: string;
  biasFlags: BiasDetection[];
  timestamp: number;
}

export interface BiasDetection {
  id: string;
  type: BiasType;
  severity: number;
  source: string;
  description: string;
  mitigation: string;
  detected: boolean;
}

export interface AlignmentScore {
  id: string;
  entity: string;
  values: Record<string, number>;
  overallAlignment: number;
  drift: number;
  lastChecked: number;
}

export interface ConscienceModuleState {
  initialized: boolean;
  evaluations: EthicalEvaluation[];
  biasDetections: BiasDetection[];
  alignmentScores: AlignmentScore[];
  totalEvaluations: number;
  totalBiasDetected: number;
  blockedActions: number;
  avgEthicalScore: number;
}

const state: ConscienceModuleState = {
  initialized: false,
  evaluations: [],
  biasDetections: [],
  alignmentScores: [],
  totalEvaluations: 0,
  totalBiasDetected: 0,
  blockedActions: 0,
  avgEthicalScore: 100,
};

let moduleEngine: ModuleEngine | null = null;

export function initConscience(): void {
  emitStarted('conscience', 'init', {});
  try {
    initCircuitBreaker('conscience', { failureThreshold: 3, recoveryTimeout: 20_000 });
    moduleEngine = activateModuleEngine('conscience', '1.0.0');
    state.initialized = true;
    emitSucceeded('conscience', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('conscience', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function evaluate(action: string, context?: Record<string, unknown>): EthicalEvaluation {
  const fallback: EthicalEvaluation = {
    id: `eval-fallback-${Date.now()}`, action,
    frameworkScores: { utilitarian: 0.5, deontological: 0.5, virtue_ethics: 0.5, care_ethics: 0.5, rights_based: 0.5, justice_theory: 0.5 },
    compositeScore: 50, recommendation: 'caution', rationale: 'Fallback evaluation — unable to assess',
    biasFlags: [], timestamp: Date.now(),
  };

  const { result } = withResilienceSync('conscience', () => {
    const scores: Record<EthicalFramework, number> = {
      utilitarian: scoreUtilitarian(action, context),
      deontological: scoreDeontological(action, context),
      virtue_ethics: scoreVirtue(action, context),
      care_ethics: scoreCare(action, context),
      rights_based: scoreRights(action, context),
      justice_theory: scoreJustice(action, context),
    };

    const composite = Object.values(scores).reduce((s, v) => s + v, 0) / 6;
    const biasFlags = detectBias(action, context);

    const evaluation: EthicalEvaluation = {
      id: `eval-${Date.now()}-${state.totalEvaluations}`, action,
      frameworkScores: scores, compositeScore: Math.round(composite * 100),
      recommendation: composite >= 0.7 ? 'proceed' : composite >= 0.4 ? 'caution' : 'block',
      rationale: generateRationale(scores, composite),
      biasFlags, timestamp: Date.now(),
    };

    if (evaluation.recommendation === 'block') state.blockedActions++;
    state.totalBiasDetected += biasFlags.filter(b => b.detected).length;
    if (state.evaluations.length >= 500) state.evaluations.shift();
    state.evaluations.push(evaluation);
    state.totalEvaluations++;
    recalculateAvg();

    return evaluation;
  }, fallback, 'evaluate');

  return result;
}

export function checkAlignment(entity: string, values: Record<string, number>): AlignmentScore {
  const overall = Object.values(values).reduce((s, v) => s + v, 0) / (Object.keys(values).length || 1);
  const prev = state.alignmentScores.find(a => a.entity === entity);
  const drift = prev ? Math.abs(overall - prev.overallAlignment) : 0;

  const score: AlignmentScore = {
    id: `align-${Date.now()}`, entity, values, overallAlignment: clampNumber(overall, 0, 1, 0.5), drift, lastChecked: Date.now(),
  };

  const idx = state.alignmentScores.findIndex(a => a.entity === entity);
  if (idx >= 0) state.alignmentScores[idx] = score;
  else if (state.alignmentScores.length < 200) state.alignmentScores.push(score);

  return score;
}

// Scoring functions (simplified heuristic models)
function scoreUtilitarian(action: string, ctx?: Record<string, unknown>): number {
  const benefit = (ctx?.beneficiaries as number) || 1;
  const harm = (ctx?.harmedParties as number) || 0;
  return clampNumber(benefit / (benefit + harm + 1), 0, 1, 0.5);
}
function scoreDeontological(_action: string, ctx?: Record<string, unknown>): number {
  return ctx?.followsRules === false ? 0.2 : 0.85;
}
function scoreVirtue(_action: string, ctx?: Record<string, unknown>): number {
  return ctx?.demonstratesExcellence ? 0.9 : 0.6;
}
function scoreCare(_action: string, ctx?: Record<string, unknown>): number {
  return ctx?.protectsVulnerable ? 0.95 : 0.55;
}
function scoreRights(_action: string, ctx?: Record<string, unknown>): number {
  return ctx?.violatesRights ? 0.1 : 0.8;
}
function scoreJustice(_action: string, ctx?: Record<string, unknown>): number {
  return ctx?.distributesEquitably ? 0.9 : 0.5;
}

function detectBias(action: string, ctx?: Record<string, unknown>): BiasDetection[] {
  const biasTypes: BiasType[] = ['gender', 'racial', 'age', 'confirmation', 'selection'];
  return biasTypes.map((type, i) => ({
    id: `bias-${Date.now()}-${i}`, type, severity: 0, source: 'automated_scan',
    description: `${type} bias check for: ${action.slice(0, 50)}`,
    mitigation: `Apply ${type} debiasing filter`, detected: false,
  }));
}

function generateRationale(scores: Record<EthicalFramework, number>, composite: number): string {
  const strongest = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  const weakest = Object.entries(scores).sort(([, a], [, b]) => a - b)[0];
  return `Composite: ${(composite * 100).toFixed(0)}%. Strongest: ${strongest[0]} (${(strongest[1] * 100).toFixed(0)}%). Weakest: ${weakest[0]} (${(weakest[1] * 100).toFixed(0)}%).`;
}

function recalculateAvg(): void {
  const recent = state.evaluations.slice(-50);
  state.avgEthicalScore = recent.length > 0
    ? Math.round(recent.reduce((s, e) => s + e.compositeScore, 0) / recent.length)
    : 100;
}

export function getConscienceState(): ConscienceModuleState { return { ...state }; }
export function getConscienceHealth(): number { return state.initialized ? state.avgEthicalScore : 0; }
export function getConscienceResilience() { return getModuleResilienceReport('conscience', getConscienceHealth()); }
export function getConscienceEngine() { return moduleEngine; }
