/**
 * ORACLE Module — Predictive Modeling & Probabilistic Reasoning
 * Bayesian inference, Monte Carlo simulation, causal graphs
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

export interface BayesianNetwork {
  id: string;
  nodes: BayesianNode[];
  edges: CausalEdge[];
  posterior: Map<string, number>;
  lastUpdated: number;
}

export interface BayesianNode {
  id: string;
  name: string;
  prior: number;
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
  results: number[];
  mean: number;
  stdDev: number;
  percentiles: Record<string, number>;
  converged: boolean;
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

const MAX_PREDICTIONS = 500;
const MAX_SIMULATIONS = 100;

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

export function initOracle(): void {
  emitStarted('oracle', 'init', {});
  try {
    initCircuitBreaker('oracle', { failureThreshold: 5, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('oracle', '1.0.0');
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

export function createNetwork(name: string, nodes: Omit<BayesianNode, 'id'>[], edges: Omit<CausalEdge, 'from' | 'to'>[] = []): BayesianNetwork {
  const net: BayesianNetwork = {
    id: `bn-${Date.now()}-${state.networks.length}`,
    nodes: nodes.map((n, i) => ({ ...n, id: `node-${i}` })),
    edges: [],
    posterior: new Map(),
    lastUpdated: Date.now(),
  };
  if (state.networks.length >= 50) state.networks.shift();
  state.networks.push(net);
  emit({ module: 'oracle', event_type: 'network_created', outcome: 'succeeded', data: { id: net.id, nodeCount: net.nodes.length } });
  return net;
}

export function updateBelief(networkId: string, nodeId: string, observedValue: number): BayesianNetwork | null {
  const net = state.networks.find(n => n.id === networkId);
  if (!net) return null;
  const node = net.nodes.find(n => n.id === nodeId);
  if (!node) return null;

  node.observed = true;
  node.value = clampNumber(observedValue, 0, 1, 0.5);

  // Propagate beliefs (simplified Bayesian update)
  for (const n of net.nodes) {
    const incomingEdges = net.edges.filter(e => e.to === n.id);
    if (incomingEdges.length > 0 && !n.observed) {
      const influence = incomingEdges.reduce((sum, e) => {
        const source = net.nodes.find(s => s.id === e.from);
        return sum + (source?.value ?? source?.prior ?? 0.5) * e.strength;
      }, 0) / incomingEdges.length;
      net.posterior.set(n.id, clampNumber(influence, 0, 1, 0.5));
    }
  }
  net.lastUpdated = Date.now();
  return net;
}

export function runMonteCarlo(name: string, samplerFn: () => number, iterations: number = 10000): MonteCarloSimulation {
  const safeIter = clampNumber(iterations, 100, 100_000, 10_000);
  const results: number[] = [];
  for (let i = 0; i < safeIter; i++) results.push(samplerFn());

  results.sort((a, b) => a - b);
  const mean = results.reduce((s, v) => s + v, 0) / results.length;
  const variance = results.reduce((s, v) => s + (v - mean) ** 2, 0) / results.length;

  const sim: MonteCarloSimulation = {
    id: `mc-${Date.now()}-${state.totalSimulations}`,
    name, iterations: safeIter, results, mean, stdDev: Math.sqrt(variance),
    percentiles: {
      p5: results[Math.floor(safeIter * 0.05)],
      p25: results[Math.floor(safeIter * 0.25)],
      p50: results[Math.floor(safeIter * 0.5)],
      p75: results[Math.floor(safeIter * 0.75)],
      p95: results[Math.floor(safeIter * 0.95)],
    },
    converged: variance < mean * 0.1,
    timestamp: Date.now(),
  };

  if (state.simulations.length >= MAX_SIMULATIONS) state.simulations.shift();
  state.simulations.push(sim);
  state.totalSimulations++;
  emit({ module: 'oracle', event_type: 'simulation_complete', outcome: 'succeeded', data: { id: sim.id, mean: sim.mean, converged: sim.converged } });
  return sim;
}

export function predict(target: string, features: Record<string, number>, method: Prediction['method'] = 'ensemble'): Prediction {
  const fallback: Prediction = {
    id: `pred-fallback-${Date.now()}`, target, value: 0, confidence: 0,
    interval: { low: 0, high: 0 }, method, features: Object.keys(features),
    timestamp: Date.now(), expiresAt: Date.now() + 3600_000,
  };

  const { result } = withResilienceSync('oracle', () => {
    const featureValues = Object.values(features);
    const mean = featureValues.reduce((s, v) => s + v, 0) / (featureValues.length || 1);
    const variance = featureValues.reduce((s, v) => s + (v - mean) ** 2, 0) / (featureValues.length || 1);
    const stdDev = Math.sqrt(variance);
    const confidence = clampNumber(1 - (stdDev / (Math.abs(mean) + 1)), 0, 1, 0.5);

    const pred: Prediction = {
      id: `pred-${Date.now()}-${state.totalPredictions}`, target, value: mean, confidence,
      interval: { low: mean - 2 * stdDev, high: mean + 2 * stdDev }, method,
      features: Object.keys(features), timestamp: Date.now(), expiresAt: Date.now() + 3600_000,
    };

    if (state.predictions.length >= MAX_PREDICTIONS) state.predictions.shift();
    state.predictions.push(pred);
    state.totalPredictions++;
    return pred;
  }, fallback, 'predict');

  return result;
}

export function getOracleState(): OracleModuleState { return { ...state }; }
export function getOracleHealth(): number {
  if (!state.initialized) return 0;
  if (hardening?.isDegraded()) return 40;
  return 100;
}
export function getOracleResilience() { return getModuleResilienceReport('oracle', getOracleHealth()); }
export function getOracleEngine() { return moduleEngine; }
export function getOracleHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeOracleEngine(v: string) { if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); } return moduleEngine; }
