/**
 * REFLEX Ultimate — System 1: Edge Node Fleet Manager
 * 
 * Register, monitor, and load-balance across edge processing nodes.
 * Health scoring per node, auto-failover, region-aware routing,
 * and fleet-wide capacity planning.
 * 
 * @module reflex/ultimate/edgeFleetManager
 */

// ── Types ────────────────────────────────────────────────────────

export type EdgeNodeStatus = 'online' | 'degraded' | 'overloaded' | 'draining' | 'offline';

export interface EdgeFleetNode {
  id: string;
  name: string;
  region: string;
  status: EdgeNodeStatus;
  capabilities: string[];
  healthScore: number;         // 0-100
  latencyMs: number;
  throughputPerSec: number;
  capacityPercent: number;
  decisionsProcessed: number;
  failureCount: number;
  lastHeartbeat: number;
  registeredAt: number;
}

export interface FleetMetrics {
  totalNodes: number;
  onlineNodes: number;
  degradedNodes: number;
  offlineNodes: number;
  avgHealthScore: number;
  avgLatencyMs: number;
  totalCapacity: number;
  fleetUtilization: number;   // 0-100
}

// ── State ────────────────────────────────────────────────────────

const fleet: Map<string, EdgeFleetNode> = new Map();
const MAX_FLEET = 200;
const HEARTBEAT_TIMEOUT_MS = 30_000;
const DEGRADATION_THRESHOLD = 50;

// ── Core API ────────────────────────────────────────────────────

/** Register an edge node in the fleet */
export function registerEdgeNode(
  name: string,
  region: string,
  capabilities: string[] = [],
): EdgeFleetNode {
  const node: EdgeFleetNode = {
    id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name, region, capabilities,
    status: 'online',
    healthScore: 100,
    latencyMs: 1 + Math.random() * 5,
    throughputPerSec: 0,
    capacityPercent: 0,
    decisionsProcessed: 0,
    failureCount: 0,
    lastHeartbeat: Date.now(),
    registeredAt: Date.now(),
  };

  fleet.set(node.id, node);
  if (fleet.size > MAX_FLEET) {
    const oldest = fleet.keys().next().value;
    if (oldest) fleet.delete(oldest);
  }

  return node;
}

/** Update a node's heartbeat with metrics */
export function updateHeartbeat(
  nodeId: string,
  metrics: { latencyMs?: number; capacityPercent?: number; throughputPerSec?: number },
): EdgeFleetNode | null {
  const node = fleet.get(nodeId);
  if (!node) return null;

  node.lastHeartbeat = Date.now();
  if (metrics.latencyMs !== undefined) node.latencyMs = metrics.latencyMs;
  if (metrics.capacityPercent !== undefined) node.capacityPercent = metrics.capacityPercent;
  if (metrics.throughputPerSec !== undefined) node.throughputPerSec = metrics.throughputPerSec;

  // Recalculate health
  node.healthScore = computeNodeHealth(node);
  node.status = deriveStatus(node);

  return node;
}

/** Select the best node for a decision (capability-aware, load-balanced) */
export function selectBestNode(requiredCapability?: string): EdgeFleetNode | null {
  refreshStaleNodes();

  let candidates = Array.from(fleet.values()).filter(n => n.status === 'online' || n.status === 'degraded');
  if (requiredCapability) {
    candidates = candidates.filter(n => n.capabilities.includes(requiredCapability));
  }
  if (candidates.length === 0) return null;

  // Sort by: health (desc), then latency (asc), then capacity (asc)
  candidates.sort((a, b) => {
    const healthDiff = b.healthScore - a.healthScore;
    if (Math.abs(healthDiff) > 10) return healthDiff;
    const latDiff = a.latencyMs - b.latencyMs;
    if (Math.abs(latDiff) > 1) return latDiff;
    return a.capacityPercent - b.capacityPercent;
  });

  return candidates[0];
}

/** Record a failure on a node */
export function recordNodeFailure(nodeId: string): void {
  const node = fleet.get(nodeId);
  if (!node) return;
  node.failureCount++;
  node.healthScore = Math.max(0, node.healthScore - 15);
  node.status = deriveStatus(node);
}

/** Drain a node (stop routing to it, let existing work finish) */
export function drainNode(nodeId: string): boolean {
  const node = fleet.get(nodeId);
  if (!node) return false;
  node.status = 'draining';
  return true;
}

/** Remove a node from the fleet */
export function deregisterNode(nodeId: string): boolean {
  return fleet.delete(nodeId);
}

// ── Health ───────────────────────────────────────────────────────

function computeNodeHealth(node: EdgeFleetNode): number {
  let health = 100;
  // Latency penalty: >10ms loses points
  if (node.latencyMs > 10) health -= Math.min(30, (node.latencyMs - 10) * 2);
  // Capacity penalty
  if (node.capacityPercent > 80) health -= (node.capacityPercent - 80) * 2;
  // Failure penalty
  health -= Math.min(30, node.failureCount * 5);
  // Heartbeat staleness
  const staleness = Date.now() - node.lastHeartbeat;
  if (staleness > HEARTBEAT_TIMEOUT_MS / 2) health -= 10;
  if (staleness > HEARTBEAT_TIMEOUT_MS) health -= 30;

  return Math.max(0, Math.min(100, Math.round(health)));
}

function deriveStatus(node: EdgeFleetNode): EdgeNodeStatus {
  if (node.status === 'draining') return 'draining';
  if (Date.now() - node.lastHeartbeat > HEARTBEAT_TIMEOUT_MS) return 'offline';
  if (node.healthScore < 20) return 'offline';
  if (node.healthScore < DEGRADATION_THRESHOLD) return 'degraded';
  if (node.capacityPercent > 90) return 'overloaded';
  return 'online';
}

function refreshStaleNodes(): void {
  for (const node of fleet.values()) {
    if (node.status !== 'draining') {
      node.status = deriveStatus(node);
    }
  }
}

// ── Query ────────────────────────────────────────────────────────

export function getFleetNode(nodeId: string): EdgeFleetNode | undefined { return fleet.get(nodeId); }
export function getAllFleetNodes(): EdgeFleetNode[] { return Array.from(fleet.values()); }
export function getNodesByRegion(region: string): EdgeFleetNode[] {
  return Array.from(fleet.values()).filter(n => n.region === region);
}

export function getFleetMetrics(): FleetMetrics {
  const nodes = Array.from(fleet.values());
  refreshStaleNodes();
  const online = nodes.filter(n => n.status === 'online');
  const degraded = nodes.filter(n => n.status === 'degraded');
  const offline = nodes.filter(n => n.status === 'offline');

  return {
    totalNodes: nodes.length,
    onlineNodes: online.length,
    degradedNodes: degraded.length,
    offlineNodes: offline.length,
    avgHealthScore: nodes.length > 0 ? Math.round(nodes.reduce((s, n) => s + n.healthScore, 0) / nodes.length) : 0,
    avgLatencyMs: online.length > 0 ? Math.round(online.reduce((s, n) => s + n.latencyMs, 0) / online.length * 100) / 100 : 0,
    totalCapacity: nodes.length * 100,
    fleetUtilization: nodes.length > 0 ? Math.round(nodes.reduce((s, n) => s + n.capacityPercent, 0) / nodes.length) : 0,
  };
}

export function getFleetManagerHealth() {
  const metrics = getFleetMetrics();
  return {
    ...metrics,
    healthScore: metrics.totalNodes > 0
      ? Math.round((metrics.onlineNodes / metrics.totalNodes) * 100)
      : 0,
  };
}

export function resetFleetManager(): void { fleet.clear(); }
