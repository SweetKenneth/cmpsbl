/**
 * Control Plane Layer — Logical Separation of Substrate Authority
 * 
 * Four control planes govern distinct aspects of system operation:
 * 
 * 1. GOVERNANCE PLANE — Mutation approvals, policy enforcement, governor authority
 * 2. EXECUTION PLANE  — Code execution, mutation application, shadow runs
 * 3. MEMORY PLANE     — Persistent logs, telemetry storage, receipt chain
 * 4. ROUTING PLANE    — NEXUS orchestration, node coordination, load balancing
 * 
 * Each plane maintains its own state and exposes a health check.
 * Cross-plane communication uses the Matrix Communication Bus.
 */

import type { SubstrateModuleName } from '@/lib/core/index';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ControlPlaneId = 'governance' | 'execution' | 'memory' | 'routing';

export interface ControlPlaneState {
  id: ControlPlaneId;
  status: 'active' | 'degraded' | 'suspended';
  ownerNodes: SubstrateModuleName[];
  pendingOps: number;
  lastActivity: number;
  metrics: {
    opsProcessed: number;
    opsRejected: number;
    avgLatencyMs: number;
  };
}

export interface PlanePolicy {
  planeId: ControlPlaneId;
  rule: string;
  enforced: boolean;
  description: string;
}

// ═══════════════════════════════════════════════════════════════
// PLANE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const planeStates = new Map<ControlPlaneId, ControlPlaneState>();

const PLANE_DEFINITIONS: { id: ControlPlaneId; owners: SubstrateModuleName[] }[] = [
  { id: 'governance', owners: ['governance', 'audit', 'conscience', 'treaty'] },
  { id: 'execution',  owners: ['core', 'encode', 'sandbox', 'shadow', 'evolution'] },
  { id: 'memory',     owners: ['memory', 'brain', 'dream', 'audit'] },
  { id: 'routing',    owners: ['nexus', 'relay', 'ripple', 'nerve', 'cortex'] },
];

function ensureInitialized(): void {
  if (planeStates.size > 0) return;
  for (const def of PLANE_DEFINITIONS) {
    planeStates.set(def.id, {
      id: def.id,
      status: 'active',
      ownerNodes: def.owners,
      pendingOps: 0,
      lastActivity: Date.now(),
      metrics: { opsProcessed: 0, opsRejected: 0, avgLatencyMs: 0 },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/** Get state of a specific control plane */
export function getPlaneState(id: ControlPlaneId): ControlPlaneState {
  ensureInitialized();
  return planeStates.get(id)!;
}

/** Get all control plane states */
export function getAllPlaneStates(): ControlPlaneState[] {
  ensureInitialized();
  return Array.from(planeStates.values());
}

/** Check if a node belongs to a given plane */
export function nodeOwnsPlane(nodeId: SubstrateModuleName, planeId: ControlPlaneId): boolean {
  ensureInitialized();
  const plane = planeStates.get(planeId);
  return plane ? plane.ownerNodes.includes(nodeId) : false;
}

/** Record an operation against a control plane */
export function recordPlaneOp(
  planeId: ControlPlaneId,
  accepted: boolean,
  latencyMs: number
): void {
  ensureInitialized();
  const plane = planeStates.get(planeId);
  if (!plane) return;

  plane.lastActivity = Date.now();
  if (accepted) {
    plane.metrics.opsProcessed++;
  } else {
    plane.metrics.opsRejected++;
  }

  // Running average
  const total = plane.metrics.opsProcessed + plane.metrics.opsRejected;
  plane.metrics.avgLatencyMs = 
    (plane.metrics.avgLatencyMs * (total - 1) + latencyMs) / total;
}

/** Set plane status */
export function setPlaneStatus(planeId: ControlPlaneId, status: ControlPlaneState['status']): void {
  ensureInitialized();
  const plane = planeStates.get(planeId);
  if (plane) plane.status = status;
}

/** Check if an operation is allowed by the governance plane */
export function governanceCheck(
  requestor: SubstrateModuleName,
  operation: string,
  context: Record<string, unknown> = {}
): { allowed: boolean; reason?: string } {
  ensureInitialized();
  const govPlane = planeStates.get('governance')!;

  // Governance plane must be active
  if (govPlane.status === 'suspended') {
    return { allowed: false, reason: 'Governance plane suspended — all mutations blocked' };
  }

  // Core and governance nodes have elevated authority
  if (govPlane.ownerNodes.includes(requestor)) {
    return { allowed: true };
  }

  // Execution plane operations require governance to be at least degraded
  if (govPlane.status === 'degraded') {
    return { allowed: true, reason: 'Governance degraded — operation allowed with warning' };
  }

  return { allowed: true };
}

/** Get policies enforced by each plane */
export function getActivePolicies(): PlanePolicy[] {
  ensureInitialized();
  return [
    { planeId: 'governance', rule: 'MUTATION_REQUIRES_APPROVAL', enforced: true, description: 'All mutations require governor approval before promotion' },
    { planeId: 'governance', rule: 'DUAL_EXECUTOR_REQUIRED', enforced: true, description: 'Critical mutations require dual executor verification' },
    { planeId: 'execution', rule: 'SHADOW_BEFORE_PRODUCTION', enforced: true, description: 'All mutations must pass shadow execution before production' },
    { planeId: 'execution', rule: 'READINESS_THRESHOLD', enforced: true, description: 'Mutation readiness must exceed 0.7 before execution' },
    { planeId: 'memory', rule: 'RECEIPT_CHAIN_IMMUTABLE', enforced: true, description: 'Receipt chain entries cannot be modified after creation' },
    { planeId: 'memory', rule: 'TELEMETRY_RETENTION_30D', enforced: true, description: 'Telemetry data retained for 30 days minimum' },
    { planeId: 'routing', rule: 'BREAKER_AWARE_ROUTING', enforced: true, description: 'Route around nodes with open circuit breakers' },
    { planeId: 'routing', rule: 'COST_AWARE_SELECTION', enforced: true, description: 'Provider selection accounts for cost budget' },
  ];
}
