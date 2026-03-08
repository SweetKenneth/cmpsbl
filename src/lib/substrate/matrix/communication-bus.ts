/**
 * Matrix Communication Bus — Topology-Aware Node Signaling
 * 
 * Extends the module-bus with matrix-topology awareness:
 * - Node-to-node signaling with dependency validation
 * - Sector-scoped broadcasts
 * - Telemetry channel routing
 * - Health signal aggregation
 * 
 * All signals flow through the existing module-bus infrastructure
 * but gain matrix-level routing intelligence.
 */

import {
  publish as busPublish,
  subscribe as busSubscribe,
  unsubscribe as busUnsubscribe,
  type ModuleName,
  type SignalPriority,
  type ModuleSignal,
} from '../module-bus';
import {
  getNodeState,
  getAllNodeStates,
  onRegistryEvent,
  type RuntimeNodeState,
} from './registry';
import { getNodesBySector, type MatrixSector } from '@/lib/core/matrixNodeRegistry';
import type { SubstrateModuleName } from '@/lib/core/index';

// ═══════════════════════════════════════════════════════════════
// MATRIX SIGNAL TYPES
// ═══════════════════════════════════════════════════════════════

export const MATRIX_SIGNALS = {
  // Node lifecycle
  NODE_ONLINE: 'matrix.node.online',
  NODE_OFFLINE: 'matrix.node.offline',
  NODE_DEGRADED: 'matrix.node.degraded',

  // Telemetry
  TELEMETRY_REPORT: 'matrix.telemetry.report',
  TELEMETRY_ANOMALY: 'matrix.telemetry.anomaly',

  // Mutation lifecycle
  MUTATION_PROPOSED: 'matrix.mutation.proposed',
  MUTATION_SHADOW_START: 'matrix.mutation.shadow_start',
  MUTATION_SHADOW_RESULT: 'matrix.mutation.shadow_result',
  MUTATION_PROMOTED: 'matrix.mutation.promoted',
  MUTATION_REJECTED: 'matrix.mutation.rejected',
  MUTATION_ROLLED_BACK: 'matrix.mutation.rolled_back',
  MUTATION_SHADOW_EXECUTE: 'matrix.mutation.shadow_execute',

  // Health
  HEALTH_CHECK_REQUEST: 'matrix.health.check',
  HEALTH_CHECK_RESPONSE: 'matrix.health.response',

  // Governor
  GOVERNOR_APPROVAL_REQUEST: 'matrix.governor.approval_request',
  GOVERNOR_APPROVAL_GRANTED: 'matrix.governor.approval_granted',
  GOVERNOR_APPROVAL_DENIED: 'matrix.governor.approval_denied',
  GOVERNOR_VETO: 'matrix.governor.veto',
} as const;

// ═══════════════════════════════════════════════════════════════
// SECTOR BROADCAST
// ═══════════════════════════════════════════════════════════════

/**
 * Broadcast a signal to all nodes in a specific sector.
 */
export async function sectorBroadcast(
  from: SubstrateModuleName,
  sector: MatrixSector,
  type: string,
  payload: Record<string, any>,
  priority: SignalPriority = 'normal'
): Promise<ModuleSignal[]> {
  const sectorNodes = getNodesBySector(sector);
  const signals: ModuleSignal[] = [];

  for (const node of sectorNodes) {
    if (node.id === from) continue; // Don't signal self
    const nodeId = node.id as ModuleName;
    try {
      const signal = await busPublish(from as ModuleName, type, {
        ...payload,
        _sector: sector,
        _broadcast: true,
      }, { to: nodeId, priority });
      signals.push(signal);
    } catch { /* skip unreachable nodes */ }
  }

  return signals;
}

/**
 * Send a direct node-to-node signal with dependency validation.
 * Returns null if the target node is unreachable (breaker open).
 */
export async function nodeSignal(
  from: SubstrateModuleName,
  to: SubstrateModuleName,
  type: string,
  payload: Record<string, any>,
  options: { priority?: SignalPriority; persist?: boolean } = {}
): Promise<ModuleSignal | null> {
  const targetState = getNodeState(to);
  if (targetState && targetState.breakerState === 'open') {
    // Target node is unreachable — don't attempt delivery
    return null;
  }

  return busPublish(from as ModuleName, type, payload, {
    to: to as ModuleName,
    priority: options.priority || 'normal',
    persist: options.persist,
  });
}

/**
 * Broadcast to all nodes.
 */
export async function matrixBroadcast(
  from: SubstrateModuleName,
  type: string,
  payload: Record<string, any>,
  priority: SignalPriority = 'normal'
): Promise<ModuleSignal> {
  return busPublish(from as ModuleName, type, payload, {
    to: '*',
    priority,
  });
}

/**
 * Subscribe to matrix signals on behalf of a node.
 */
export function matrixSubscribe(
  nodeId: SubstrateModuleName,
  signalType: string | '*',
  handler: (signal: ModuleSignal) => void | Promise<void>
): string {
  return busSubscribe(nodeId as ModuleName, signalType, handler);
}

/** Unsubscribe a matrix subscription */
export { busUnsubscribe as matrixUnsubscribe };

// ═══════════════════════════════════════════════════════════════
// HEALTH SIGNAL AGGREGATION
// ═══════════════════════════════════════════════════════════════

/**
 * Request health checks from all nodes in a sector.
 */
export async function requestSectorHealth(
  requestor: SubstrateModuleName,
  sector: MatrixSector
): Promise<void> {
  await sectorBroadcast(
    requestor,
    sector,
    MATRIX_SIGNALS.HEALTH_CHECK_REQUEST,
    { requestor, requested_at: Date.now() },
    'high'
  );
}

/**
 * Get connectivity map — which nodes can reach which.
 */
export function getConnectivityMap(): Record<string, { reachable: string[]; unreachable: string[] }> {
  const allNodes = getAllNodeStates();
  const map: Record<string, { reachable: string[]; unreachable: string[] }> = {};

  // Build a lookup once to avoid N×M getNodeState calls (each returns a defensive copy)
  const stateIndex = new Map<string, RuntimeNodeState>();
  for (const node of allNodes) stateIndex.set(node.id, node);

  for (const node of allNodes) {
    const reachable: string[] = [];
    const unreachable: string[] = [];

    for (const dep of node.dependencies) {
      const depState = stateIndex.get(dep);
      if (depState && depState.breakerState !== 'open' && depState.health > 0) {
        reachable.push(dep);
      } else {
        unreachable.push(dep);
      }
    }

    map[node.id] = { reachable, unreachable };
  }

  return map;
}
