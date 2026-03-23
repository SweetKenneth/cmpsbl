/**
 * ENGINEER — Resource Contention Arbitrator
 * Priority-weighted resource allocation with minimum guarantees (10% floor).
 * Starvation detection and CORTEX escalation.
 * @module engineer/resourceContentionArbitrator
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface ResourceRequest {
  nodeId: string;
  resourceType: 'cpu' | 'memory' | 'io' | 'network';
  requested: number;    // units requested
  priority: number;     // 1–10 (10 = highest)
  minRequired: number;  // hard minimum to function
}

export interface ResourceAllocation {
  nodeId: string;
  resourceType: string;
  requested: number;
  allocated: number;
  priority: number;
  starved: boolean;
  satisfactionPct: number;
}

export interface ArbitrationResult {
  allocations: ResourceAllocation[];
  totalRequested: number;
  totalAvailable: number;
  totalAllocated: number;
  starvationCount: number;
  escalations: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────

const MIN_GUARANTEE_PCT = 0.10; // 10% floor
const STARVATION_THRESHOLD = 3; // consecutive starved rounds before escalation

// ── State ──────────────────────────────────────────────────────────────────

const starvationCounters = new Map<string, number>();
const escalationLog: Array<{ nodeId: string; resourceType: string; timestamp: number }> = [];

// ── Core ───────────────────────────────────────────────────────────────────

export function arbitrate(
  requests: ResourceRequest[],
  availableCapacity: number,
): ArbitrationResult {
  const totalRequested = requests.reduce((s, r) => s + r.requested, 0);
  const escalations: string[] = [];

  // Phase 1: Guarantee minimums (10% of requested, or minRequired)
  const allocations: ResourceAllocation[] = requests.map(req => ({
    nodeId: req.nodeId,
    resourceType: req.resourceType,
    requested: req.requested,
    allocated: Math.max(req.minRequired, req.requested * MIN_GUARANTEE_PCT),
    priority: req.priority,
    starved: false,
    satisfactionPct: 0,
  }));

  let guaranteedTotal = allocations.reduce((s, a) => s + a.allocated, 0);

  // Phase 2: Distribute remaining capacity by priority weight
  const remaining = Math.max(0, availableCapacity - guaranteedTotal);
  if (remaining > 0) {
    const totalWeight = requests.reduce((s, r) => s + r.priority, 0);
    for (let i = 0; i < allocations.length; i++) {
      const req = requests[i];
      const share = totalWeight > 0 ? (req.priority / totalWeight) * remaining : 0;
      const additional = Math.min(share, req.requested - allocations[i].allocated);
      allocations[i].allocated += Math.max(0, additional);
    }
  }

  // Phase 3: Cap at available capacity
  let totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);
  if (totalAllocated > availableCapacity) {
    const scale = availableCapacity / totalAllocated;
    for (const a of allocations) {
      a.allocated = Math.round(a.allocated * scale * 100) / 100;
    }
    totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);
  }

  // Phase 4: Detect starvation
  for (const alloc of allocations) {
    alloc.satisfactionPct = alloc.requested > 0
      ? Math.round((alloc.allocated / alloc.requested) * 100)
      : 100;
    alloc.starved = alloc.allocated < (alloc.requested * 0.25);

    const key = `${alloc.nodeId}:${alloc.resourceType}`;
    if (alloc.starved) {
      const count = (starvationCounters.get(key) ?? 0) + 1;
      starvationCounters.set(key, count);
      if (count >= STARVATION_THRESHOLD) {
        escalations.push(`ESCALATE: ${alloc.nodeId} starved for ${alloc.resourceType} (${count} rounds)`);
        escalationLog.push({ nodeId: alloc.nodeId, resourceType: alloc.resourceType, timestamp: Date.now() });
      }
    } else {
      starvationCounters.delete(key);
    }
  }

  return {
    allocations,
    totalRequested,
    totalAvailable: availableCapacity,
    totalAllocated: Math.round(totalAllocated * 100) / 100,
    starvationCount: allocations.filter(a => a.starved).length,
    escalations,
  };
}

export function getEscalationLog() {
  return [...escalationLog];
}

export function resetArbitrator(): void {
  starvationCounters.clear();
  escalationLog.length = 0;
}
