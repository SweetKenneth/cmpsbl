/**
 * CORE — Module Lifecycle Manager
 * Standardized state machine for all 40 primitives:
 * init → ready → running → degraded → shutdown
 * Ultimate Form v1.0.0
 */

export type LifecycleState = 'unregistered' | 'init' | 'ready' | 'running' | 'degraded' | 'shutdown';

export interface LifecycleEntry {
  moduleId: string;
  state: LifecycleState;
  lastTransition: string;
  transitionCount: number;
  healthScore: number;
  degradedReason?: string;
  uptimeMs: number;
  startedAt: string | null;
}

type TransitionCallback = (moduleId: string, from: LifecycleState, to: LifecycleState) => void;

// Valid transitions
const VALID_TRANSITIONS: Record<LifecycleState, LifecycleState[]> = {
  unregistered: ['init'],
  init: ['ready', 'shutdown'],
  ready: ['running', 'shutdown'],
  running: ['degraded', 'shutdown', 'ready'],
  degraded: ['running', 'shutdown', 'init'],
  shutdown: ['init'],
};

const modules = new Map<string, LifecycleEntry>();
const listeners: TransitionCallback[] = [];

/**
 * Register a module into the lifecycle system.
 */
export function registerModule(moduleId: string): LifecycleEntry {
  const entry: LifecycleEntry = {
    moduleId,
    state: 'unregistered',
    lastTransition: new Date().toISOString(),
    transitionCount: 0,
    healthScore: 0,
    uptimeMs: 0,
    startedAt: null,
  };
  modules.set(moduleId, entry);
  return entry;
}

/**
 * Transition a module to a new state.
 * Validates transition legality.
 */
export function transition(
  moduleId: string,
  to: LifecycleState,
  reason?: string
): { success: boolean; error?: string } {
  const entry = modules.get(moduleId);
  if (!entry) return { success: false, error: `Module ${moduleId} not registered` };

  const allowed = VALID_TRANSITIONS[entry.state];
  if (!allowed?.includes(to)) {
    return { success: false, error: `Invalid transition: ${entry.state} → ${to}` };
  }

  const from = entry.state;
  entry.state = to;
  entry.lastTransition = new Date().toISOString();
  entry.transitionCount++;

  if (to === 'running' && !entry.startedAt) {
    entry.startedAt = new Date().toISOString();
  }
  if (to === 'degraded') {
    entry.degradedReason = reason;
  }
  if (to === 'shutdown') {
    if (entry.startedAt) {
      entry.uptimeMs += Date.now() - new Date(entry.startedAt).getTime();
    }
    entry.startedAt = null;
  }

  // Notify listeners
  for (const cb of listeners) {
    try { cb(moduleId, from, to); } catch { /* no-op */ }
  }

  return { success: true };
}

/**
 * Update health score and auto-degrade if below threshold.
 */
export function updateHealth(moduleId: string, healthScore: number): void {
  const entry = modules.get(moduleId);
  if (!entry) return;

  entry.healthScore = Math.max(0, Math.min(100, healthScore));

  if (entry.state === 'running' && entry.healthScore < 30) {
    transition(moduleId, 'degraded', `Health dropped to ${entry.healthScore}`);
  } else if (entry.state === 'degraded' && entry.healthScore >= 70) {
    transition(moduleId, 'running');
  }
}

export function onTransition(cb: TransitionCallback): () => void {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getModuleState(moduleId: string): LifecycleEntry | undefined {
  return modules.get(moduleId);
}

export function getAllModuleStates(): LifecycleEntry[] {
  return Array.from(modules.values());
}

export function getModulesByState(state: LifecycleState): string[] {
  return Array.from(modules.entries())
    .filter(([, e]) => e.state === state)
    .map(([id]) => id);
}

export function getSystemSummary(): {
  total: number;
  running: number;
  degraded: number;
  shutdown: number;
  avgHealth: number;
} {
  const all = Array.from(modules.values());
  const running = all.filter(m => m.state === 'running').length;
  const degraded = all.filter(m => m.state === 'degraded').length;
  const shutdown = all.filter(m => m.state === 'shutdown').length;
  const avgHealth = all.length > 0
    ? Math.round(all.reduce((s, m) => s + m.healthScore, 0) / all.length)
    : 0;

  return { total: all.length, running, degraded, shutdown, avgHealth };
}
