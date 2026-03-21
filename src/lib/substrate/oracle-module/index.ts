/**
 * ORACLE Module — Predictive Modeling & Probabilistic Reasoning
 * Bayesian inference, Monte Carlo simulation, causal graphs
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 *
 * Fixes:
 * - createNetwork now properly wires causal edges
 * - Convergence threshold aligned to documented 0.001
 * - Health score is multi-factor (confidence, convergence, staleness, capacity)
 * - Expired prediction pruning on read
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BayesianNetwork {
  id: string;
  name: string;
  nodes: BayesianNode[];
  edges: CausalEdge[];
  posterior: Map<string, number>;
  lastUpdated: number;
  version: number;
}

export interface BayesianNode {
  id: string;
  name: string;
  states: string[];
  prior: number[];
  posterior: number[];
  observed: boolean;
  value: number | null;
}

export interface CausalEdge {
  from: string;
  to: string;
  strength: number;
  direction: 'causal' | 'correlative' | 'confounded';
}

export interface MonteCarloSimulation {
  id: string;
  name: string;
  iterations: number;
  completedIterations: number;
  results: number[];
  mean: number;
  median: number;
  stdDev: number;
  percentiles: Record<string, number>;
  confidenceIntervals: {
    ci90: { low: number; high: number };
    ci95: { low: number; high: number };
    ci99: { low: number; high: number };
  };
  converged: boolean;
  convergenceIteration: number | null;
  timestamp: number;
}

export interface Prediction {
  id: string;
  target: string;
  value: number;
  confidence: number;
  interval: { low: number; high: number };
  method: 'bayesian' | 'montecarlo' | 'regression' | 'ensemble';
  features: string[];
  timestamp: number;
  expiresAt: number;
}

export interface OracleModuleState {
  initialized: boolean;
  networks: BayesianNetwork[];
  simulations: MonteCarloSimulation[];
  predictions: Prediction[];
  totalPredictions: number;
  accuracyScore: number;
  totalSimulations: number;
}

// ─── Constants (aligned with docs) ────────────────────────────────────────────

const MAX_PREDICTIONS = 500;
const MAX_SIMULATIONS = 100;
const MAX_NETWORKS = 50;
const DEFAULT_MC_ITERATIONS = 10_000;
const CONVERGENCE_THRESHOLD = 0.001;
const CONVERGENCE_WINDOW = 500;

// ─── State ────────────────────────────────────────────────────────────────────

const state: OracleModuleState = {
  initialized: false,
  networks: [],
  simulations: [],
  predictions: [],
  totalPredictions: 0,
  accuracyScore: 0,
  totalSimulations: 0,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initOracle(): void {
  emitStarted('oracle', 'init', {});
  try {
    initCircuitBreaker('oracle', { failureThreshold: 5, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('oracle', '2.0.0');
    hardening = createModuleHardening('oracle', { maxConcurrent: 15, rateLimit: 200, healthThreshold: 30 });
    state.initialized = true;
    hardening.startAutoRestore(() => getOracleHealth(), () => { state.accuracyScore = 0; }, 30_000);
    hardening.snapshot(state);
    emitSucceeded('oracle', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('oracle', 'init', err instanceof Error ? err.message : String(err));
  }
}

// ─── Bayesian Network ─────────────────────────────────────────────────────────

export function createNetwork(
  name: string,
  nodes: Omit<BayesianNode, 'id' | 'posterior' | 'observed' | 'value'>[],
  edges: Omit<CausalEdge, 'from' | 'to'>[] & { from: string; to: string }[] = [],
): BayesianNetwork {
  const builtNodes: BayesianNode[] = nodes.map((n, i) => ({
    ...n,
    id: n.name ? `node-${n.name.toLowerCase().replace(/\s+/g, '-')}` : `node-${i}`,
    posterior: [...(n.prior || [0.5])],
    observed: false,
    value: null,
  }));

  const nodeIds = new Set(builtNodes.map(n => n.id));

  // Wire edges — only accept edges where both endpoints exist
  const wiredEdges: CausalEdge[] = [];
  for (const e of edges) {
    const fromId = e.from.startsWith('node-') ? e.from : `node-${e.from.toLowerCase().replace(/\s+/g, '-')}`;
    const toId = e.to.startsWith('node-') ? e.to : `node-${e.to.toLowerCase().replace(/\s+/g, '-')}`;
    if (nodeIds.has(fromId) && nodeIds.has(toId) && fromId !== toId) {
      wiredEdges.push({
        from: fromId,
        to: toId,
        strength: clampNumber(e.strength ?? 0.5, 0, 1, 0.5),
        direction: e.direction ?? 'causal',
      });
    }
  }

  const net: BayesianNetwork = {
    id: `bn-${Date.now()}-${state.networks.length}`,
    name,
    nodes: builtNodes,
    edges: wiredEdges,
    posterior: new Map(),
    lastUpdated: Date.now(),
    version: 1,
  };

  if (state.networks.length >= MAX_NETWORKS) state.networks.shift();
  state.networks.push(net);
  emit({ module: 'oracle', event_type: 'network_created', outcome: 'succeeded', data: { id: net.id, nodeCount: net.nodes.length, edgeCount: wiredEdges.length } });
  return net;
}

// ─── Belief Propagation ───────────────────────────────────────────────────────

export function updateBelief(networkId: string, nodeId: string, observedValue: number): BayesianNetwork | null {
  const net = state.networks.find(n => n.id === networkId);
  if (!net) return null;
  const node = net.nodes.find(n => n.id === nodeId);
  if (!node) return null;

  node.observed = true;
  node.value = clampNumber(observedValue, 0, 1, 0.5);
  // Set posterior to the evidence value
  node.posterior = [node.value];

  // Propagate downstream through causal edges
  const visited = new Set<string>([nodeId]);
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const downstreamEdges = net.edges.filter(e => e.from === currentId);

    for (const edge of downstreamEdges) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);

      const targetNode = net.nodes.find(n => n.id === edge.to);
      if (!targetNode || targetNode.observed) continue;

      // Aggregate influence from all parent edges
      const parentEdges = net.edges.filter(e => e.to === edge.to);
      let totalInfluence = 0;
      let totalWeight = 0;

      for (const pe of parentEdges) {
        const parent = net.nodes.find(n => n.id === pe.from);
        if (!parent) continue;
        const parentVal = parent.observed ? (parent.value ?? 0.5) : (parent.posterior[0] ?? parent.prior[0] ?? 0.5);
        totalInfluence += parentVal * pe.strength;
        totalWeight += pe.strength;
      }

      const posterior = totalWeight > 0 ? clampNumber(totalInfluence / totalWeight, 0, 1, 0.5) : targetNode.prior[0] ?? 0.5;
      targetNode.posterior = [posterior];
      net.posterior.set(edge.to, posterior);
      queue.push(edge.to);
    }
  }

  net.lastUpdated = Date.now();
  net.version++;
  emit({ module: 'oracle', event_type: 'belief_updated', outcome: 'succeeded', data: { networkId, nodeId, version: net.version } });
  return net;
}

// ─── Monte Carlo Simulation ──────────────────────────────────────────────────

export function runMonteCarlo(name: string, samplerFn: () => number, iterations: number = DEFAULT_MC_ITERATIONS): MonteCarloSimulation {
  const safeIter = clampNumber(iterations, 100, 100_000, DEFAULT_MC_ITERATIONS);
  const results: number[] = [];
  let converged = false;
  let convergenceIteration: number | null = null;

  for (let i = 0; i < safeIter; i++) {
    results.push(samplerFn());

    // Early convergence detection every CONVERGENCE_WINDOW iterations
    if (!converged && i > 0 && i % CONVERGENCE_WINDOW === 0 && results.length >= CONVERGENCE_WINDOW * 2) {
      const recentSlice = results.slice(-CONVERGENCE_WINDOW);
      const prevSlice = results.slice(-CONVERGENCE_WINDOW * 2, -CONVERGENCE_WINDOW);
      const recentMean = recentSlice.reduce((s, v) => s + v, 0) / recentSlice.length;
      const prevMean = prevSlice.reduce((s, v) => s + v, 0) / prevSlice.length;
      const recentVar = recentSlice.reduce((s, v) => s + (v - recentMean) ** 2, 0) / recentSlice.length;

      if (recentVar < CONVERGENCE_THRESHOLD && Math.abs(recentMean - prevMean) < CONVERGENCE_THRESHOLD) {
        converged = true;
        convergenceIteration = i;
        break; // Early termination — saves compute
      }
    }
  }

  results.sort((a, b) => a - b);
  const len = results.length;
  const mean = results.reduce((s, v) => s + v, 0) / len;
  const variance = results.reduce((s, v) => s + (v - mean) ** 2, 0) / len;
  const stdDev = Math.sqrt(variance);
  const median = len % 2 === 0 ? (results[len / 2 - 1] + results[len / 2]) / 2 : results[Math.floor(len / 2)];

  // Confidence intervals
  const zScores = { ci90: 1.645, ci95: 1.96, ci99: 2.576 };
  const se = stdDev / Math.sqrt(len);

  const sim: MonteCarloSimulation = {
    id: `mc-${Date.now()}-${state.totalSimulations}`,
    name,
    iterations: safeIter,
    completedIterations: results.length,
    results,
    mean,
    median,
    stdDev,
    percentiles: {
      p5: results[Math.floor(len * 0.05)] ?? 0,
      p25: results[Math.floor(len * 0.25)] ?? 0,
      p50: median,
      p75: results[Math.floor(len * 0.75)] ?? 0,
      p95: results[Math.floor(len * 0.95)] ?? 0,
    },
    confidenceIntervals: {
      ci90: { low: mean - zScores.ci90 * se, high: mean + zScores.ci90 * se },
      ci95: { low: mean - zScores.ci95 * se, high: mean + zScores.ci95 * se },
      ci99: { low: mean - zScores.ci99 * se, high: mean + zScores.ci99 * se },
    },
    converged: converged || variance < CONVERGENCE_THRESHOLD,
    convergenceIteration,
    timestamp: Date.now(),
  };

  if (state.simulations.length >= MAX_SIMULATIONS) state.simulations.shift();
  state.simulations.push(sim);
  state.totalSimulations++;
  emit({ module: 'oracle', event_type: 'simulation_complete', outcome: 'succeeded', data: { id: sim.id, mean: sim.mean, converged: sim.converged, earlyStop: convergenceIteration !== null } });
  return sim;
}

// ─── Prediction ──────────────────────────────────────────────────────────────

export function predict(target: string, features: Record<string, number>, method: Prediction['method'] = 'ensemble'): Prediction {
  // Prune expired predictions on every predict call
  const now = Date.now();
  state.predictions = state.predictions.filter(p => p.expiresAt > now);

  const fallback: Prediction = {
    id: `pred-fallback-${now}`, target, value: 0, confidence: 0,
    interval: { low: 0, high: 0 }, method, features: Object.keys(features),
    timestamp: now, expiresAt: now + 3600_000,
  };

  const { result } = withResilienceSync('oracle', () => {
    const featureValues = Object.values(features);
    const n = featureValues.length || 1;
    const mean = featureValues.reduce((s, v) => s + v, 0) / n;
    const variance = featureValues.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);

    // Confidence: lower variance relative to mean = higher confidence
    const cv = Math.abs(mean) > 0.001 ? stdDev / Math.abs(mean) : stdDev;
    const confidence = clampNumber(1 / (1 + cv), 0, 1, 0.5);

    const pred: Prediction = {
      id: `pred-${now}-${state.totalPredictions}`, target, value: mean, confidence,
      interval: { low: mean - 2 * stdDev, high: mean + 2 * stdDev }, method,
      features: Object.keys(features), timestamp: now, expiresAt: now + 3600_000,
    };

    if (state.predictions.length >= MAX_PREDICTIONS) state.predictions.shift();
    state.predictions.push(pred);
    state.totalPredictions++;
    return pred;
  }, fallback, 'predict');

  return result;
}

// ─── Health (multi-factor) ────────────────────────────────────────────────────

export function getOracleHealth(): number {
  if (!state.initialized) return 0;
  if (hardening?.isDegraded()) return 40;

  let score = 100;
  const now = Date.now();

  // Factor 1: Prediction confidence (weight: 25)
  const recentPreds = state.predictions.slice(-30);
  if (recentPreds.length > 0) {
    const avgConf = recentPreds.reduce((s, p) => s + p.confidence, 0) / recentPreds.length;
    score -= Math.round((1 - avgConf) * 25);
  }

  // Factor 2: Simulation convergence rate (weight: 25)
  const recentSims = state.simulations.slice(-20);
  if (recentSims.length > 0) {
    const convRate = recentSims.filter(s => s.converged).length / recentSims.length;
    score -= Math.round((1 - convRate) * 25);
  }

  // Factor 3: Network freshness (weight: 20)
  if (state.networks.length > 0) {
    const staleNets = state.networks.filter(n => now - n.lastUpdated > 3600_000).length;
    const staleRatio = staleNets / state.networks.length;
    score -= Math.round(staleRatio * 20);
  }

  // Factor 4: Capacity headroom (weight: 15)
  const capacityUsed = state.predictions.length / MAX_PREDICTIONS;
  if (capacityUsed > 0.9) score -= 15;
  else if (capacityUsed > 0.7) score -= 8;

  // Factor 5: Expired prediction ratio (weight: 15)
  const expired = state.predictions.filter(p => p.expiresAt < now).length;
  if (state.predictions.length > 0) {
    const expiredRatio = expired / state.predictions.length;
    score -= Math.round(expiredRatio * 15);
  }

  return clampNumber(score, 0, 100, 50);
}

// ─── Accessors ────────────────────────────────────────────────────────────────

export function getOracleState(): OracleModuleState { return { ...state }; }
export function getOracleResilience() { return getModuleResilienceReport('oracle', getOracleHealth()); }
export function getOracleEngine() { return moduleEngine; }
export function getOracleHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeOracleEngine(v: string) {
  if (moduleEngine && hardening) {
    hardening.snapshot(state);
    moduleEngine = hardening.upgradeEngine(moduleEngine, v);
  }
  return moduleEngine;
}
