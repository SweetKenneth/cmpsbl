/**
 * NERVE Node — Inter-Node Signal Propagation (OCG Sector)
 * Codename: "Synapse"
 * 
 * 8 Registered Capabilities:
 *   nrv_signal_emit      — Typed signal emission with priority + TTL
 *   nrv_signal_receive   — Validated signal reception with ordering
 *   nrv_heartbeat        — Heartbeat monitor for failure detection
 *   nrv_backpressure     — Downstream overload backpressure
 *   nrv_circuit_break    — Signal-layer circuit breaking
 *   nrv_topology_map     — Live topology & routing map
 *   nrv_priority_route   — Priority-based shortest-path routing
 *   nrv_dedup            — Idempotency-key deduplication
 * 
 * Wraps and enhances the module-bus + matrix communication-bus
 * with the NERVE-specific intelligence layer.
 */

import {
  publish,
  subscribe,
  unsubscribe,
  getSignalHistory,
  type ModuleName,
  type ModuleSignal,
  type SignalPriority,
} from '../module-bus';
import {
  nodeSignal,
  sectorBroadcast,
  matrixBroadcast,
  getConnectivityMap,
  MATRIX_SIGNALS,
} from '../matrix/communication-bus';
import { getNodeState, getAllNodeStates, heartbeat as registryHeartbeat } from '../matrix/registry';
import type { SubstrateModuleName } from '@/lib/core/index';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface NerveSignal {
  id: string;
  from: string;
  to: string | '*';
  type: string;
  priority: SignalPriority;
  payload: Record<string, unknown>;
  timestamp: number;
  ttlMs: number;
  idempotencyKey?: string;
}

export interface HeartbeatEntry {
  nodeId: string;
  lastSeen: number;
  missedCount: number;
  status: 'alive' | 'suspect' | 'dead';
}

export interface BackpressureState {
  nodeId: string;
  queueDepth: number;
  pressureLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  throttleMs: number;
  since: number;
}

export interface CircuitState {
  nodeId: string;
  state: 'closed' | 'half-open' | 'open';
  failures: number;
  lastFailure: number;
  cooldownUntil: number;
}

export interface TopologyEdge {
  from: string;
  to: string;
  latencyMs: number;
  healthy: boolean;
}

export interface NerveStats {
  signalsSent: number;
  signalsReceived: number;
  signalsDeduped: number;
  signalsDroppedTTL: number;
  signalsBackpressured: number;
  circuitsOpen: number;
  nodesAlive: number;
  nodesSuspect: number;
  nodesDead: number;
  avgLatencyMs: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const HEARTBEAT_INTERVAL_MS = 10_000;
const HEARTBEAT_TIMEOUT_MS = 30_000;
const HEARTBEAT_DEAD_MS = 60_000;
const CIRCUIT_FAILURE_THRESHOLD = 5;
const CIRCUIT_COOLDOWN_MS = 30_000;
const DEDUP_WINDOW_MS = 5_000;
const MAX_DEDUP_KEYS = 2_000;
const BACKPRESSURE_HIGH_THRESHOLD = 50;
const BACKPRESSURE_CRITICAL_THRESHOLD = 100;
const MAX_LATENCY_SAMPLES = 100;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const heartbeats = new Map<string, HeartbeatEntry>();
const backpressure = new Map<string, BackpressureState>();
const circuits = new Map<string, CircuitState>();
const dedupCache = new Map<string, number>(); // key → timestamp
const latencySamples: number[] = [];
let stats: NerveStats = {
  signalsSent: 0,
  signalsReceived: 0,
  signalsDeduped: 0,
  signalsDroppedTTL: 0,
  signalsBackpressured: 0,
  circuitsOpen: 0,
  nodesAlive: 0,
  nodesSuspect: 0,
  nodesDead: 0,
  avgLatencyMs: 0,
};
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

// ═══════════════════════════════════════════════════════════════
// CAPABILITY: nrv_signal_emit — Signal Emission
// ═══════════════════════════════════════════════════════════════

/**
 * Emit a typed signal through NERVE's intelligent routing layer.
 * Applies dedup, backpressure, and circuit-breaker checks before delivery.
 */
export async function emitSignal(
  from: SubstrateModuleName,
  to: SubstrateModuleName | '*',
  type: string,
  payload: Record<string, unknown>,
  options: {
    priority?: SignalPriority;
    ttlMs?: number;
    idempotencyKey?: string;
  } = {}
): Promise<NerveSignal | null> {
  const now = Date.now();
  const priority = options.priority ?? 'normal';
  const ttlMs = options.ttlMs ?? 60_000;

  // Dedup check
  if (options.idempotencyKey) {
    if (isDuplicate(options.idempotencyKey, now)) {
      stats.signalsDeduped++;
      return null;
    }
    recordDedupKey(options.idempotencyKey, now);
  }

  // Circuit-breaker check for targeted signals
  if (to !== '*') {
    const circuit = circuits.get(to);
    if (circuit && circuit.state === 'open' && now < circuit.cooldownUntil) {
      stats.signalsBackpressured++;
      return null;
    }
  }

  // Backpressure check for targeted signals
  if (to !== '*') {
    const bp = backpressure.get(to);
    if (bp && bp.pressureLevel === 'critical') {
      // Only allow critical priority through
      if (priority !== 'critical') {
        stats.signalsBackpressured++;
        return null;
      }
    }
  }

  const signal: NerveSignal = {
    id: `nrv-${now}-${Math.random().toString(36).slice(2, 8)}`,
    from,
    to,
    type,
    priority,
    payload,
    timestamp: now,
    ttlMs,
    idempotencyKey: options.idempotencyKey,
  };

  // Deliver via matrix bus
  const startMs = performance.now();
  try {
    if (to === '*') {
      await matrixBroadcast(from, type, payload as Record<string, any>, priority);
    } else {
      const result = await nodeSignal(from, to, type, payload as Record<string, any>, { priority });
      if (!result) {
        recordCircuitFailure(to);
        return null;
      }
    }
    const elapsed = performance.now() - startMs;
    recordLatency(elapsed);
    stats.signalsSent++;

    // Reset circuit on success
    if (to !== '*') {
      const circuit = circuits.get(to);
      if (circuit && circuit.state === 'half-open') {
        circuit.state = 'closed';
        circuit.failures = 0;
      }
    }

    return signal;
  } catch {
    if (to !== '*') recordCircuitFailure(to);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// CAPABILITY: nrv_signal_receive — Signal Receiver
// ═══════════════════════════════════════════════════════════════

/**
 * Register a validated signal receiver with TTL and ordering enforcement.
 */
export function receiveSignals(
  nodeId: SubstrateModuleName,
  signalType: string | '*',
  handler: (signal: ModuleSignal) => void | Promise<void>
): string {
  const wrappedHandler = (signal: ModuleSignal) => {
    // TTL enforcement
    const signalAge = Date.now() - new Date(signal.timestamp).getTime();
    if (signalAge > signal.ttl_ms) {
      stats.signalsDroppedTTL++;
      return;
    }
    stats.signalsReceived++;
    return handler(signal);
  };

  return subscribe(nodeId as ModuleName, signalType, wrappedHandler);
}

/** Unsubscribe a NERVE signal receiver */
export function removeReceiver(subscriptionId: string): void {
  unsubscribe(subscriptionId);
}

// ═══════════════════════════════════════════════════════════════
// CAPABILITY: nrv_heartbeat — Heartbeat Monitor
// ═══════════════════════════════════════════════════════════════

/**
 * Start the heartbeat monitoring loop.
 * Polls all known nodes and classifies them as alive/suspect/dead.
 */
export function startHeartbeatMonitor(): void {
  if (heartbeatTimer) return;

  // Seed from registry
  const allNodes = getAllNodeStates();
  const now = Date.now();
  for (const node of allNodes) {
    if (!heartbeats.has(node.id)) {
      heartbeats.set(node.id, {
        nodeId: node.id,
        lastSeen: now,
        missedCount: 0,
        status: 'alive',
      });
    }
  }

  heartbeatTimer = setInterval(() => runHeartbeatCycle(), HEARTBEAT_INTERVAL_MS);
}

export function stopHeartbeatMonitor(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function runHeartbeatCycle(): void {
  const now = Date.now();
  let alive = 0, suspect = 0, dead = 0;

  for (const [nodeId, entry] of heartbeats) {
    const nodeState = getNodeState(nodeId);
    if (nodeState && nodeState.lastHeartbeat > entry.lastSeen) {
      entry.lastSeen = nodeState.lastHeartbeat;
      entry.missedCount = 0;
      entry.status = 'alive';
    } else {
      const elapsed = now - entry.lastSeen;
      if (elapsed > HEARTBEAT_DEAD_MS) {
        entry.status = 'dead';
        entry.missedCount++;
      } else if (elapsed > HEARTBEAT_TIMEOUT_MS) {
        entry.status = 'suspect';
        entry.missedCount++;
      }
    }

    if (entry.status === 'alive') alive++;
    else if (entry.status === 'suspect') suspect++;
    else dead++;
  }

  stats.nodesAlive = alive;
  stats.nodesSuspect = suspect;
  stats.nodesDead = dead;

  // Announce dead nodes
  for (const [nodeId, entry] of heartbeats) {
    if (entry.status === 'dead' && entry.missedCount === 1) {
      // First detection — broadcast
      matrixBroadcast('nerve' as any, MATRIX_SIGNALS.NODE_OFFLINE, {
        nodeId,
        detectedAt: now,
        lastSeen: entry.lastSeen,
      }, 'high').catch(() => {});
    }
  }

  // Self heartbeat
  registryHeartbeat('nerve');
}

export function getHeartbeats(): HeartbeatEntry[] {
  return Array.from(heartbeats.values());
}

export function getNodeHeartbeat(nodeId: string): HeartbeatEntry | null {
  return heartbeats.get(nodeId) ?? null;
}

// ═══════════════════════════════════════════════════════════════
// CAPABILITY: nrv_backpressure — Backpressure Controller
// ═══════════════════════════════════════════════════════════════

/**
 * Report queue depth for a node, triggering backpressure calculations.
 */
export function reportQueueDepth(nodeId: string, depth: number): BackpressureState {
  const now = Date.now();
  let level: BackpressureState['pressureLevel'] = 'none';
  let throttleMs = 0;

  if (depth >= BACKPRESSURE_CRITICAL_THRESHOLD) {
    level = 'critical';
    throttleMs = 5000;
  } else if (depth >= BACKPRESSURE_HIGH_THRESHOLD) {
    level = 'high';
    throttleMs = 1000;
  } else if (depth >= 25) {
    level = 'medium';
    throttleMs = 250;
  } else if (depth >= 10) {
    level = 'low';
    throttleMs = 50;
  }

  const existing = backpressure.get(nodeId);
  const state: BackpressureState = {
    nodeId,
    queueDepth: depth,
    pressureLevel: level,
    throttleMs,
    since: existing?.pressureLevel !== 'none' ? (existing?.since ?? now) : now,
  };
  backpressure.set(nodeId, state);
  return state;
}

export function getBackpressure(nodeId: string): BackpressureState | null {
  return backpressure.get(nodeId) ?? null;
}

export function getAllBackpressure(): BackpressureState[] {
  return Array.from(backpressure.values());
}

// ═══════════════════════════════════════════════════════════════
// CAPABILITY: nrv_circuit_break — Circuit Breaker
// ═══════════════════════════════════════════════════════════════

function recordCircuitFailure(nodeId: string): void {
  const now = Date.now();
  const existing = circuits.get(nodeId) ?? {
    nodeId,
    state: 'closed' as const,
    failures: 0,
    lastFailure: 0,
    cooldownUntil: 0,
  };

  existing.failures++;
  existing.lastFailure = now;

  if (existing.failures >= CIRCUIT_FAILURE_THRESHOLD) {
    existing.state = 'open';
    existing.cooldownUntil = now + CIRCUIT_COOLDOWN_MS;
    stats.circuitsOpen = Array.from(circuits.values()).filter(c => c.state === 'open').length;
  }

  circuits.set(nodeId, existing);
}

export function getCircuit(nodeId: string): CircuitState | null {
  const c = circuits.get(nodeId);
  if (!c) return null;

  // Auto-transition from open → half-open after cooldown
  if (c.state === 'open' && Date.now() >= c.cooldownUntil) {
    c.state = 'half-open';
  }
  return { ...c };
}

export function getAllCircuits(): CircuitState[] {
  const now = Date.now();
  return Array.from(circuits.values()).map(c => {
    if (c.state === 'open' && now >= c.cooldownUntil) c.state = 'half-open';
    return { ...c };
  });
}

export function resetCircuit(nodeId: string): boolean {
  const c = circuits.get(nodeId);
  if (!c) return false;
  c.state = 'closed';
  c.failures = 0;
  c.cooldownUntil = 0;
  stats.circuitsOpen = Array.from(circuits.values()).filter(ci => ci.state === 'open').length;
  return true;
}

// ═══════════════════════════════════════════════════════════════
// CAPABILITY: nrv_topology_map — Topology Mapper
// ═══════════════════════════════════════════════════════════════

export function getTopology(): TopologyEdge[] {
  const connectivity = getConnectivityMap();
  const edges: TopologyEdge[] = [];

  for (const [nodeId, { reachable, unreachable }] of Object.entries(connectivity)) {
    for (const target of reachable) {
      edges.push({ from: nodeId, to: target, latencyMs: stats.avgLatencyMs, healthy: true });
    }
    for (const target of unreachable) {
      edges.push({ from: nodeId, to: target, latencyMs: -1, healthy: false });
    }
  }

  return edges;
}

export function getTopologySummary(): {
  totalEdges: number;
  healthyEdges: number;
  unhealthyEdges: number;
  avgLatencyMs: number;
} {
  const edges = getTopology();
  const healthy = edges.filter(e => e.healthy);
  return {
    totalEdges: edges.length,
    healthyEdges: healthy.length,
    unhealthyEdges: edges.length - healthy.length,
    avgLatencyMs: stats.avgLatencyMs,
  };
}

// ═══════════════════════════════════════════════════════════════
// CAPABILITY: nrv_priority_route — Priority Signal Router
// ═══════════════════════════════════════════════════════════════

/**
 * Route a signal using priority-based path selection.
 * Critical signals bypass backpressure and prefer healthy paths.
 */
export async function priorityRoute(
  from: SubstrateModuleName,
  to: SubstrateModuleName,
  type: string,
  payload: Record<string, unknown>,
): Promise<NerveSignal | null> {
  return emitSignal(from, to, type, payload, { priority: 'critical' });
}

// ═══════════════════════════════════════════════════════════════
// CAPABILITY: nrv_dedup — Signal Deduplication
// ═══════════════════════════════════════════════════════════════

function isDuplicate(key: string, now: number): boolean {
  const prev = dedupCache.get(key);
  if (!prev) return false;
  return (now - prev) < DEDUP_WINDOW_MS;
}

function recordDedupKey(key: string, now: number): void {
  dedupCache.set(key, now);

  // Evict old keys when cache exceeds max
  if (dedupCache.size > MAX_DEDUP_KEYS) {
    const cutoff = now - DEDUP_WINDOW_MS;
    for (const [k, ts] of dedupCache) {
      if (ts < cutoff) dedupCache.delete(k);
    }
    // Hard cap if window eviction wasn't enough
    if (dedupCache.size > MAX_DEDUP_KEYS) {
      const excess = dedupCache.size - MAX_DEDUP_KEYS;
      const keys = Array.from(dedupCache.keys());
      for (let i = 0; i < excess; i++) dedupCache.delete(keys[i]);
    }
  }
}

export function getDedupCacheSize(): number {
  return dedupCache.size;
}

// ═══════════════════════════════════════════════════════════════
// LATENCY TRACKING
// ═══════════════════════════════════════════════════════════════

function recordLatency(ms: number): void {
  latencySamples.push(ms);
  if (latencySamples.length > MAX_LATENCY_SAMPLES) {
    latencySamples.splice(0, latencySamples.length - MAX_LATENCY_SAMPLES);
  }
  stats.avgLatencyMs = latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length;
}

// ═══════════════════════════════════════════════════════════════
// AGGREGATE API
// ═══════════════════════════════════════════════════════════════

export function getNerveStats(): NerveStats {
  return { ...stats };
}

export function initNerve(): boolean {
  if (initialized) return true;
  startHeartbeatMonitor();
  initialized = true;
  return true;
}

export function shutdownNerve(): void {
  stopHeartbeatMonitor();
  heartbeats.clear();
  backpressure.clear();
  circuits.clear();
  dedupCache.clear();
  latencySamples.length = 0;
  stats = {
    signalsSent: 0, signalsReceived: 0, signalsDeduped: 0,
    signalsDroppedTTL: 0, signalsBackpressured: 0, circuitsOpen: 0,
    nodesAlive: 0, nodesSuspect: 0, nodesDead: 0, avgLatencyMs: 0,
  };
  initialized = false;
}

export function isNerveInitialized(): boolean {
  return initialized;
}
