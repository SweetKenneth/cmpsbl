/**
 * Matrix Runtime Registry — Mutable Source of Truth for all 38 Nodes
 * 
 * Extends the read-only matrixNodeRegistry with runtime state management:
 * - Mutable health, breaker state, dependency tracking
 * - Telemetry channel registration per node
 * - Sector-level rollups and snapshot capabilities
 * 
 * All mutations go through controlled setters that emit bus signals.
 */

import {
  getNodeDefinitions,
  buildMatrixNodes,
  calculateIntegrity,
  type MatrixNode,
  type MatrixSector,
  type BreakerState,
  type MatrixIntegrityReport,
  updateBreakerState,
} from '@/lib/core/matrixNodeRegistry';
import type { SubstrateModuleName } from '@/lib/core/index';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RuntimeNodeState {
  id: SubstrateModuleName;
  health: number;
  breakerState: BreakerState;
  dependencies: SubstrateModuleName[];
  telemetryChannel: string | null;
  lastHeartbeat: number;
  opsCount: number;
  errorCount: number;
  metadata: Record<string, unknown>;
}

export type RegistryEvent =
  | { type: 'node.health_changed'; nodeId: SubstrateModuleName; prev: number; next: number }
  | { type: 'node.breaker_changed'; nodeId: SubstrateModuleName; prev: BreakerState; next: BreakerState }
  | { type: 'node.heartbeat'; nodeId: SubstrateModuleName; timestamp: number }
  | { type: 'registry.snapshot'; snapshot: MatrixSnapshot };

export interface MatrixSnapshot {
  id: string;
  timestamp: number;
  nodes: RuntimeNodeState[];
  integrity: MatrixIntegrityReport;
}

type RegistryListener = (event: RegistryEvent) => void;

// ═══════════════════════════════════════════════════════════════
// RUNTIME STATE
// ═══════════════════════════════════════════════════════════════

const runtimeStates = new Map<SubstrateModuleName, RuntimeNodeState>();
const listeners = new Set<RegistryListener>();
const snapshots: MatrixSnapshot[] = [];
const MAX_SNAPSHOTS = 50;

// ═══════════════════════════════════════════════════════════════
// DEPENDENCY MAP — delegates to the canonical MODULE_DEPENDENCIES in @/lib/core/index.ts
// ═══════════════════════════════════════════════════════════════

import { getModuleDependencies } from '@/lib/core/index';

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function ensureInitialized(): void {
  if (runtimeStates.size > 0) return;

  const defs = getNodeDefinitions();
  for (const def of defs) {
    const id = def.id as SubstrateModuleName;
    runtimeStates.set(id, {
      id,
      health: 100,
      breakerState: 'closed',
      dependencies: getModuleDependencies(id),
      telemetryChannel: `telemetry.${id}`,
      lastHeartbeat: Date.now(),
      opsCount: 0,
      errorCount: 0,
      metadata: {},
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/** Get runtime state for a single node */
export function getNodeState(id: SubstrateModuleName): RuntimeNodeState | null {
  ensureInitialized();
  return runtimeStates.get(id) || null;
}

/** Get all runtime node states */
export function getAllNodeStates(): RuntimeNodeState[] {
  ensureInitialized();
  return Array.from(runtimeStates.values());
}

/** Get nodes by sector */
export function getNodeStatesBySector(sector: MatrixSector): RuntimeNodeState[] {
  ensureInitialized();
  const sectorDefs = getNodeDefinitions().filter(d => d.sector === sector);
  return sectorDefs
    .map(d => runtimeStates.get(d.id as SubstrateModuleName))
    .filter(Boolean) as RuntimeNodeState[];
}

/** Update node health — emits event */
export function setNodeHealth(id: SubstrateModuleName, health: number): void {
  ensureInitialized();
  const state = runtimeStates.get(id);
  if (!state) return;

  const prev = state.health;
  state.health = Math.max(0, Math.min(100, health));
  
  if (prev !== state.health) {
    emit({ type: 'node.health_changed', nodeId: id, prev, next: state.health });
  }
}

/** Update node breaker state — syncs with core registry */
export function setNodeBreaker(id: SubstrateModuleName, breakerState: BreakerState, failures = 0): void {
  ensureInitialized();
  const state = runtimeStates.get(id);
  if (!state) return;

  const prev = state.breakerState;
  state.breakerState = breakerState;
  updateBreakerState(id, breakerState, failures);

  if (prev !== breakerState) {
    emit({ type: 'node.breaker_changed', nodeId: id, prev, next: breakerState });
  }
}

/** Record heartbeat for a node */
export function heartbeat(id: SubstrateModuleName): void {
  ensureInitialized();
  const state = runtimeStates.get(id);
  if (!state) return;

  state.lastHeartbeat = Date.now();
  emit({ type: 'node.heartbeat', nodeId: id, timestamp: state.lastHeartbeat });
}

/** Increment ops counter */
export function recordOp(id: SubstrateModuleName, isError = false): void {
  ensureInitialized();
  const state = runtimeStates.get(id);
  if (!state) return;

  state.opsCount++;
  if (isError) state.errorCount++;
  state.lastHeartbeat = Date.now();
}

/** Get full matrix integrity from current runtime states */
export function getMatrixIntegrity(): MatrixIntegrityReport {
  ensureInitialized();
  const healthMap: Record<string, number> = {};
  for (const [id, state] of runtimeStates) {
    healthMap[id] = state.health;
  }
  const nodes = buildMatrixNodes(healthMap);
  return calculateIntegrity(nodes);
}

/** Take a point-in-time snapshot */
export function takeSnapshot(): MatrixSnapshot {
  ensureInitialized();
  const snapshot: MatrixSnapshot = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    nodes: getAllNodeStates().map(n => ({ ...n })),
    integrity: getMatrixIntegrity(),
  };

  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.shift();

  emit({ type: 'registry.snapshot', snapshot });
  return snapshot;
}

/** Get recent snapshots */
export function getSnapshots(limit = 10): MatrixSnapshot[] {
  return snapshots.slice(-limit);
}

/** Check if all dependencies of a node are healthy */
export function areDependenciesHealthy(id: SubstrateModuleName, threshold = 50): boolean {
  ensureInitialized();
  const state = runtimeStates.get(id);
  if (!state) return false;

  return state.dependencies.every(depId => {
    const dep = runtimeStates.get(depId);
    return dep && dep.health >= threshold && dep.breakerState !== 'open';
  });
}

/** Subscribe to registry events */
export function onRegistryEvent(listener: RegistryListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL
// ═══════════════════════════════════════════════════════════════

function emit(event: RegistryEvent): void {
  for (const listener of listeners) {
    try { listener(event); } catch { /* swallow */ }
  }
}
