/**
 * ECHO Module — Simulation & Digital Twin Engine
 * Model real-world systems, run what-if scenarios at scale
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

export interface DigitalTwin {
  id: string;
  name: string;
  entityType: string;
  state: Record<string, number>;
  parameters: Record<string, number>;
  history: TwinSnapshot[];
  createdAt: number;
  lastSyncedAt: number;
}

export interface TwinSnapshot {
  timestamp: number;
  state: Record<string, number>;
  delta: Record<string, number>;
}

export interface Scenario {
  id: string;
  twinId: string;
  name: string;
  interventions: Intervention[];
  results: ScenarioResult | null;
  status: 'pending' | 'running' | 'complete' | 'failed';
  createdAt: number;
}

export interface Intervention {
  parameter: string;
  operation: 'set' | 'multiply' | 'add';
  value: number;
  atStep: number;
}

export interface ScenarioResult {
  steps: number;
  finalState: Record<string, number>;
  trajectory: Record<string, number[]>;
  divergenceFromBaseline: number;
  insights: string[];
}

export interface EchoModuleState {
  initialized: boolean;
  twins: DigitalTwin[];
  scenarios: Scenario[];
  totalSimulations: number;
  totalTwins: number;
  avgDivergence: number;
}

const state: EchoModuleState = {
  initialized: false,
  twins: [],
  scenarios: [],
  totalSimulations: 0,
  totalTwins: 0,
  avgDivergence: 0,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

export function initEcho(): void {
  emitStarted('echo', 'init', {});
  try {
    initCircuitBreaker('echo', { failureThreshold: 5, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('echo', '1.0.0');
    hardening = createModuleHardening('echo', { maxConcurrent: 8, rateLimit: 50, healthThreshold: 30 });
    state.initialized = true;
    hardening.startAutoRestore(() => getEchoHealth(), () => { state.avgDivergence = 0; }, 30_000);
    hardening.snapshot(state);
    emitSucceeded('echo', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('echo', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function createTwin(name: string, entityType: string, initialState: Record<string, number>, parameters: Record<string, number> = {}): DigitalTwin {
  const twin: DigitalTwin = {
    id: `twin-${Date.now()}-${state.totalTwins}`, name,
    entityType: validateStringInput(entityType, { maxLength: 100 }) ?? 'generic',
    state: { ...initialState }, parameters: { ...parameters },
    history: [{ timestamp: Date.now(), state: { ...initialState }, delta: {} }],
    createdAt: Date.now(), lastSyncedAt: Date.now(),
  };

  if (state.twins.length >= 100) state.twins.shift();
  state.twins.push(twin);
  state.totalTwins++;
  emit({ module: 'echo', event_type: 'twin_created', outcome: 'succeeded', data: { id: twin.id, type: entityType } });
  return twin;
}

export function syncTwin(twinId: string, realWorldState: Record<string, number>): DigitalTwin | null {
  const twin = state.twins.find(t => t.id === twinId);
  if (!twin) return null;

  const delta: Record<string, number> = {};
  for (const [key, value] of Object.entries(realWorldState)) {
    delta[key] = value - (twin.state[key] ?? 0);
    twin.state[key] = value;
  }

  if (twin.history.length >= 500) twin.history.shift();
  twin.history.push({ timestamp: Date.now(), state: { ...twin.state }, delta });
  twin.lastSyncedAt = Date.now();
  return twin;
}

export function runScenario(twinId: string, name: string, interventions: Intervention[], steps: number = 100): Scenario {
  const twin = state.twins.find(t => t.id === twinId);
  const scenario: Scenario = {
    id: `scn-${Date.now()}-${state.totalSimulations}`, twinId, name, interventions,
    results: null, status: 'pending', createdAt: Date.now(),
  };

  if (!twin) {
    scenario.status = 'failed';
    return scenario;
  }

  const { result } = withResilienceSync('echo', () => {
    scenario.status = 'running';
    const safeSteps = clampNumber(steps, 1, 10_000, 100);
    const simState = { ...twin.state };
    const trajectory: Record<string, number[]> = {};

    for (const key of Object.keys(simState)) trajectory[key] = [];

    for (let step = 0; step < safeSteps; step++) {
      // Apply interventions at specified steps
      for (const intv of interventions) {
        if (intv.atStep === step && simState[intv.parameter] !== undefined) {
          switch (intv.operation) {
            case 'set': simState[intv.parameter] = intv.value; break;
            case 'multiply': simState[intv.parameter] *= intv.value; break;
            case 'add': simState[intv.parameter] += intv.value; break;
          }
        }
      }

      // Natural evolution (simple decay + interaction)
      for (const key of Object.keys(simState)) {
        const rate = twin.parameters[`${key}_rate`] ?? 0;
        simState[key] += rate;
        trajectory[key].push(simState[key]);
      }
    }

    // Calculate divergence from baseline
    let divergence = 0;
    for (const key of Object.keys(twin.state)) {
      divergence += Math.abs((simState[key] ?? 0) - (twin.state[key] ?? 0));
    }
    divergence /= Object.keys(twin.state).length || 1;

    scenario.results = {
      steps: safeSteps, finalState: { ...simState }, trajectory, divergenceFromBaseline: divergence,
      insights: divergence > 10 ? ['High divergence detected — scenario significantly alters system state'] : ['Scenario within normal operating bounds'],
    };
    scenario.status = 'complete';

    if (state.scenarios.length >= 200) state.scenarios.shift();
    state.scenarios.push(scenario);
    state.totalSimulations++;
    recalculate();

    emit({ module: 'echo', event_type: 'scenario_complete', outcome: 'succeeded', data: { id: scenario.id, divergence } });
    return scenario;
  }, scenario, 'run_scenario');

  return result;
}

function recalculate(): void {
  const completed = state.scenarios.filter(s => s.results).slice(-20);
  state.avgDivergence = completed.length > 0 ? completed.reduce((s, sc) => s + (sc.results?.divergenceFromBaseline ?? 0), 0) / completed.length : 0;
}

export function getEchoState(): EchoModuleState { return { ...state }; }
export function getEchoHealth(): number { if (!state.initialized) return 0; if (hardening?.isDegraded()) return 40; return 100; }
export function getEchoResilience() { return getModuleResilienceReport('echo', getEchoHealth()); }
export function getEchoEngine() { return moduleEngine; }
export function getEchoHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeEchoEngine(v: string) { if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); } return moduleEngine; }
