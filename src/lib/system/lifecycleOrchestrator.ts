/**
 * Lifecycle Orchestrator — SYSTEM v9.0.0
 * Manages node lifecycle transitions (boot → ready → degraded → maintenance → shutdown)
 * with dependency-aware sequencing across all 40 primitives.
 */

// --- Types ---

export type NodeLifecycleState =
  | 'uninitialized'
  | 'booting'
  | 'ready'
  | 'degraded'
  | 'maintenance'
  | 'shutting_down'
  | 'offline';

export interface NodeLifecycleEntry {
  nodeId: string;
  state: NodeLifecycleState;
  dependencies: string[];
  lastTransition: number;
  transitionCount: number;
  healthScore: number; // 0-100
  error?: string;
}

export interface LifecycleTransitionEvent {
  nodeId: string;
  fromState: NodeLifecycleState;
  toState: NodeLifecycleState;
  timestamp: number;
  reason: string;
  duration?: number;
}

// --- Constants ---

const VALID_STATE_TRANSITIONS: Record<NodeLifecycleState, NodeLifecycleState[]> = {
  uninitialized: ['booting'],
  booting: ['ready', 'degraded', 'offline'],
  ready: ['degraded', 'maintenance', 'shutting_down'],
  degraded: ['ready', 'maintenance', 'shutting_down'],
  maintenance: ['booting', 'shutting_down'],
  shutting_down: ['offline'],
  offline: ['booting'],
};

const MAX_EVENTS = 500;

// --- State ---

const registry: Map<string, NodeLifecycleEntry> = new Map();
const events: LifecycleTransitionEvent[] = [];

// --- Core ---

export function registerNode(nodeId: string, dependencies: string[] = []): void {
  if (registry.has(nodeId)) return;
  registry.set(nodeId, {
    nodeId,
    state: 'uninitialized',
    dependencies,
    lastTransition: Date.now(),
    transitionCount: 0,
    healthScore: 0,
  });
}

export function transitionNode(
  nodeId: string,
  toState: NodeLifecycleState,
  reason: string = 'manual'
): { success: boolean; error?: string } {
  const entry = registry.get(nodeId);
  if (!entry) return { success: false, error: `Node ${nodeId} not registered` };

  const allowed = VALID_STATE_TRANSITIONS[entry.state];
  if (!allowed.includes(toState)) {
    return { success: false, error: `Invalid transition: ${entry.state} → ${toState}` };
  }

  // Dependency check for booting
  if (toState === 'booting' || toState === 'ready') {
    for (const dep of entry.dependencies) {
      const depEntry = registry.get(dep);
      if (!depEntry || (depEntry.state !== 'ready' && depEntry.state !== 'degraded')) {
        return { success: false, error: `Dependency ${dep} not ready (state: ${depEntry?.state ?? 'missing'})` };
      }
    }
  }

  const fromState = entry.state;
  const now = Date.now();

  events.push({
    nodeId,
    fromState,
    toState,
    timestamp: now,
    reason,
    duration: now - entry.lastTransition,
  });
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);

  entry.state = toState;
  entry.lastTransition = now;
  entry.transitionCount++;

  if (toState === 'ready') entry.healthScore = 100;
  else if (toState === 'degraded') entry.healthScore = Math.min(entry.healthScore, 50);
  else if (toState === 'offline') entry.healthScore = 0;

  return { success: true };
}

export function bootSequence(orderedNodeIds: string[]): { booted: string[]; failed: string[] } {
  const booted: string[] = [];
  const failed: string[] = [];

  for (const nodeId of orderedNodeIds) {
    const bootResult = transitionNode(nodeId, 'booting', 'boot_sequence');
    if (!bootResult.success) {
      failed.push(nodeId);
      continue;
    }

    const readyResult = transitionNode(nodeId, 'ready', 'boot_sequence');
    if (!readyResult.success) {
      transitionNode(nodeId, 'degraded', 'boot_failed');
      failed.push(nodeId);
    } else {
      booted.push(nodeId);
    }
  }

  return { booted, failed };
}

export function shutdownSequence(orderedNodeIds: string[]): { shutdown: string[]; failed: string[] } {
  const shutdown: string[] = [];
  const failed: string[] = [];

  // Reverse order for shutdown
  const reversed = [...orderedNodeIds].reverse();
  for (const nodeId of reversed) {
    const entry = registry.get(nodeId);
    if (!entry || entry.state === 'offline' || entry.state === 'uninitialized') continue;

    const result = transitionNode(nodeId, 'shutting_down', 'shutdown_sequence');
    if (result.success) {
      transitionNode(nodeId, 'offline', 'shutdown_sequence');
      shutdown.push(nodeId);
    } else {
      failed.push(nodeId);
    }
  }

  return { shutdown, failed };
}

export function getNodeState(nodeId: string): NodeLifecycleEntry | null {
  const entry = registry.get(nodeId);
  return entry ? { ...entry } : null;
}

export function getAllNodeStates(): NodeLifecycleEntry[] {
  return [...registry.values()].map(e => ({ ...e }));
}

export function getNodesByState(state: NodeLifecycleState): string[] {
  return [...registry.values()].filter(e => e.state === state).map(e => e.nodeId);
}

export function getEvents(): LifecycleTransitionEvent[] {
  return [...events];
}

export function updateNodeHealth(nodeId: string, score: number): void {
  const entry = registry.get(nodeId);
  if (!entry) return;
  entry.healthScore = Math.max(0, Math.min(100, score));

  // Auto-transition if health drops
  if (entry.healthScore < 30 && entry.state === 'ready') {
    transitionNode(nodeId, 'degraded', 'health_drop');
  }
}

export function clearLifecycleState(): void {
  registry.clear();
  events.length = 0;
}
