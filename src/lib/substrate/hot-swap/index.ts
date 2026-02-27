/**
 * Hot-Swap Engine Deployment
 * Zero-downtime engine replacement at runtime
 * 
 * Manages engine lifecycle transitions (load → warm → active → drain → unload)
 * without service interruption. Uses shadow instances for safe cutover.
 */

export type EnginePhase = 'loading' | 'warming' | 'active' | 'draining' | 'unloaded';

export interface EngineInstance {
  id: string;
  engineId: string;
  version: string;
  phase: EnginePhase;
  loadedAt: number;
  activatedAt: number | null;
  requestsInFlight: number;
  healthScore: number;
}

export interface SwapPlan {
  id: string;
  sourceEngine: string;
  sourceVersion: string;
  targetVersion: string;
  strategy: 'blue-green' | 'canary' | 'rolling';
  status: 'pending' | 'executing' | 'completed' | 'rolled_back';
  createdAt: number;
  completedAt: number | null;
}

const activeEngines = new Map<string, EngineInstance>();
const swapHistory: SwapPlan[] = [];

/**
 * Register a new engine instance
 */
export function registerEngine(engineId: string, version: string): EngineInstance {
  const instance: EngineInstance = {
    id: `${engineId}-${version}-${Date.now()}`,
    engineId,
    version,
    phase: 'loading',
    loadedAt: Date.now(),
    activatedAt: null,
    requestsInFlight: 0,
    healthScore: 100,
  };
  activeEngines.set(instance.id, instance);
  return instance;
}

/**
 * Transition an engine through deployment phases
 */
export function transitionEngine(instanceId: string, targetPhase: EnginePhase): EngineInstance | null {
  const instance = activeEngines.get(instanceId);
  if (!instance) return null;

  const validTransitions: Record<EnginePhase, EnginePhase[]> = {
    loading: ['warming', 'unloaded'],
    warming: ['active', 'unloaded'],
    active: ['draining', 'unloaded'],
    draining: ['unloaded'],
    unloaded: [],
  };

  if (!validTransitions[instance.phase].includes(targetPhase)) {
    return null;
  }

  instance.phase = targetPhase;
  if (targetPhase === 'active') {
    instance.activatedAt = Date.now();
  }
  if (targetPhase === 'unloaded') {
    activeEngines.delete(instanceId);
  }

  return instance;
}

/**
 * Create a hot-swap plan
 */
export function createSwapPlan(
  engineId: string,
  sourceVersion: string,
  targetVersion: string,
  strategy: SwapPlan['strategy'] = 'blue-green'
): SwapPlan {
  const plan: SwapPlan = {
    id: `swap-${Date.now()}`,
    sourceEngine: engineId,
    sourceVersion,
    targetVersion,
    strategy,
    status: 'pending',
    createdAt: Date.now(),
    completedAt: null,
  };
  swapHistory.push(plan);
  return plan;
}

/**
 * Execute a swap plan (blue-green strategy)
 */
export function executeSwap(planId: string): SwapPlan | null {
  const plan = swapHistory.find(p => p.id === planId);
  if (!plan || plan.status !== 'pending') return null;

  plan.status = 'executing';

  // Register new version
  const newInstance = registerEngine(plan.sourceEngine, plan.targetVersion);
  transitionEngine(newInstance.id, 'warming');
  transitionEngine(newInstance.id, 'active');

  // Drain old instances
  for (const [id, inst] of activeEngines) {
    if (inst.engineId === plan.sourceEngine && inst.version === plan.sourceVersion) {
      transitionEngine(id, 'draining');
      transitionEngine(id, 'unloaded');
    }
  }

  plan.status = 'completed';
  plan.completedAt = Date.now();
  return plan;
}

/** Get active engines */
export function getActiveEngines(): EngineInstance[] {
  return Array.from(activeEngines.values());
}

/** Get swap history */
export function getSwapHistory(): SwapPlan[] {
  return [...swapHistory];
}

/** Get engine by ID */
export function getEngine(instanceId: string): EngineInstance | undefined {
  return activeEngines.get(instanceId);
}
