/**
 * REFLEX Ultimate — System 6: Edge State Synchronizer
 * 
 * Maintains eventual consistency across distributed edge nodes.
 * Vector clock ordering, conflict resolution, and state
 * reconciliation for multi-node edge deployments.
 * 
 * @module reflex/ultimate/edgeStateSynchronizer
 */

// ── Types ────────────────────────────────────────────────────────

export interface VectorClock {
  [nodeId: string]: number;
}

export interface StateVersion {
  id: string;
  nodeId: string;
  key: string;
  value: unknown;
  vectorClock: VectorClock;
  updatedAt: number;
}

export interface SyncConflict {
  id: string;
  key: string;
  versions: StateVersion[];
  resolvedValue: unknown | null;
  resolution: 'last_write_wins' | 'higher_clock' | 'merge' | 'unresolved';
  detectedAt: number;
  resolvedAt: number | null;
}

export interface SyncStatus {
  nodesInSync: number;
  nodesOutOfSync: number;
  pendingConflicts: number;
  totalSyncs: number;
  lastSyncAt: number | null;
}

// ── State ────────────────────────────────────────────────────────

const stateStore: Map<string, Map<string, StateVersion>> = new Map(); // nodeId → (key → version)
const conflicts: SyncConflict[] = [];
const MAX_CONFLICTS = 300;
let totalSyncs = 0;
let lastSyncAt: number | null = null;

// ── Vector Clock Operations ──────────────────────────────────────

function incrementClock(clock: VectorClock, nodeId: string): VectorClock {
  return { ...clock, [nodeId]: (clock[nodeId] || 0) + 1 };
}

function mergeClock(a: VectorClock, b: VectorClock): VectorClock {
  const merged: VectorClock = { ...a };
  for (const [key, val] of Object.entries(b)) {
    merged[key] = Math.max(merged[key] || 0, val);
  }
  return merged;
}

function compareClocks(a: VectorClock, b: VectorClock): 'before' | 'after' | 'concurrent' {
  let aBefore = false;
  let aAfter = false;
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const av = a[key] || 0;
    const bv = b[key] || 0;
    if (av < bv) aBefore = true;
    if (av > bv) aAfter = true;
  }

  if (aBefore && !aAfter) return 'before';
  if (aAfter && !aBefore) return 'after';
  return 'concurrent';
}

// ── Core API ────────────────────────────────────────────────────

/** Update state on a specific node */
export function updateState(nodeId: string, key: string, value: unknown): StateVersion {
  if (!stateStore.has(nodeId)) stateStore.set(nodeId, new Map());
  const nodeState = stateStore.get(nodeId)!;

  const existing = nodeState.get(key);
  const clock = existing
    ? incrementClock(existing.vectorClock, nodeId)
    : { [nodeId]: 1 };

  const version: StateVersion = {
    id: `sv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nodeId, key, value,
    vectorClock: clock,
    updatedAt: Date.now(),
  };

  nodeState.set(key, version);
  return version;
}

/** Synchronize a key across two nodes */
export function syncNodes(nodeA: string, nodeB: string, key: string): SyncConflict | null {
  const stateA = stateStore.get(nodeA)?.get(key);
  const stateB = stateStore.get(nodeB)?.get(key);

  totalSyncs++;
  lastSyncAt = Date.now();

  if (!stateA && !stateB) return null;
  if (!stateA) {
    // Copy B to A
    if (!stateStore.has(nodeA)) stateStore.set(nodeA, new Map());
    stateStore.get(nodeA)!.set(key, { ...stateB!, nodeId: nodeA });
    return null;
  }
  if (!stateB) {
    if (!stateStore.has(nodeB)) stateStore.set(nodeB, new Map());
    stateStore.get(nodeB)!.set(key, { ...stateA, nodeId: nodeB });
    return null;
  }

  const order = compareClocks(stateA.vectorClock, stateB.vectorClock);

  if (order === 'before') {
    // A is older, update A with B
    stateStore.get(nodeA)!.set(key, { ...stateB, nodeId: nodeA });
    return null;
  }
  if (order === 'after') {
    // B is older, update B with A
    stateStore.get(nodeB)!.set(key, { ...stateA, nodeId: nodeB });
    return null;
  }

  // Concurrent — conflict!
  const conflict: SyncConflict = {
    id: `conflict-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    key,
    versions: [stateA, stateB],
    resolvedValue: null,
    resolution: 'unresolved',
    detectedAt: Date.now(),
    resolvedAt: null,
  };

  // Auto-resolve: last-write-wins
  const winner = stateA.updatedAt >= stateB.updatedAt ? stateA : stateB;
  conflict.resolvedValue = winner.value;
  conflict.resolution = 'last_write_wins';
  conflict.resolvedAt = Date.now();

  const mergedClock = mergeClock(stateA.vectorClock, stateB.vectorClock);
  const resolved: StateVersion = { ...winner, vectorClock: incrementClock(mergedClock, winner.nodeId) };

  stateStore.get(nodeA)!.set(key, { ...resolved, nodeId: nodeA });
  stateStore.get(nodeB)!.set(key, { ...resolved, nodeId: nodeB });

  conflicts.push(conflict);
  if (conflicts.length > MAX_CONFLICTS) conflicts.splice(0, conflicts.length - MAX_CONFLICTS);

  return conflict;
}

/** Full sync between two nodes (all keys) */
export function fullSync(nodeA: string, nodeB: string): SyncConflict[] {
  const keysA = stateStore.get(nodeA) ? Array.from(stateStore.get(nodeA)!.keys()) : [];
  const keysB = stateStore.get(nodeB) ? Array.from(stateStore.get(nodeB)!.keys()) : [];
  const allKeys = new Set([...keysA, ...keysB]);
  const newConflicts: SyncConflict[] = [];

  for (const key of allKeys) {
    const conflict = syncNodes(nodeA, nodeB, key);
    if (conflict) newConflicts.push(conflict);
  }

  return newConflicts;
}

// ── Query ────────────────────────────────────────────────────────

export function getNodeState(nodeId: string): Map<string, StateVersion> | undefined {
  return stateStore.get(nodeId);
}

export function getSyncStatus(): SyncStatus {
  const nodeIds = Array.from(stateStore.keys());
  // Simple heuristic: nodes are "in sync" if they share the same keys
  let inSync = 0;
  let outOfSync = 0;

  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      const keysA = stateStore.get(nodeIds[i])!;
      const keysB = stateStore.get(nodeIds[j])!;
      let synced = true;
      for (const key of keysA.keys()) {
        const vB = keysB.get(key);
        if (!vB || compareClocks(keysA.get(key)!.vectorClock, vB.vectorClock) === 'concurrent') {
          synced = false;
          break;
        }
      }
      if (synced) inSync++;
      else outOfSync++;
    }
  }

  return {
    nodesInSync: inSync,
    nodesOutOfSync: outOfSync,
    pendingConflicts: conflicts.filter(c => c.resolution === 'unresolved').length,
    totalSyncs,
    lastSyncAt,
  };
}

export function getConflicts(): SyncConflict[] { return [...conflicts]; }

export function getSynchronizerHealth() {
  const status = getSyncStatus();
  return {
    nodesTracked: stateStore.size,
    totalSyncs,
    conflictsDetected: conflicts.length,
    pendingConflicts: status.pendingConflicts,
    syncHealth: stateStore.size > 0 && (status.nodesInSync + status.nodesOutOfSync) > 0
      ? Math.round((status.nodesInSync / (status.nodesInSync + status.nodesOutOfSync)) * 100)
      : 100,
  };
}

export function resetSynchronizer(): void {
  stateStore.clear();
  conflicts.length = 0;
  totalSyncs = 0;
  lastSyncAt = null;
}
