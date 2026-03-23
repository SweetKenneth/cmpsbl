/**
 * REFLEX Ultimate — System 4: Edge Function Router
 * 
 * Routes decisions to the optimal edge node based on capability
 * matching, real-time latency, current load, and region affinity.
 * 
 * @module reflex/ultimate/edgeFunctionRouter
 */

// ── Types ────────────────────────────────────────────────────────

export interface RoutingPolicy {
  id: string;
  name: string;
  strategy: 'latency_first' | 'capacity_first' | 'round_robin' | 'sticky' | 'region_affinity';
  preferredRegions: string[];
  requiredCapabilities: string[];
  maxLatencyMs: number;
  fallbackEnabled: boolean;
}

export interface RoutingDecision {
  id: string;
  policyId: string;
  targetNodeId: string;
  targetRegion: string;
  strategy: RoutingPolicy['strategy'];
  selectionReason: string;
  candidatesEvaluated: number;
  selectedLatencyMs: number;
  timestamp: number;
}

export interface NodeCandidate {
  nodeId: string;
  region: string;
  latencyMs: number;
  capacityPercent: number;
  healthScore: number;
  hasCapabilities: boolean;
  score: number;               // Composite routing score
}

// ── State ────────────────────────────────────────────────────────

const policies: Map<string, RoutingPolicy> = new Map();
const routingLog: RoutingDecision[] = [];
const stickyBindings: Map<string, string> = new Map(); // triggerKey → nodeId
const roundRobinIndex = { value: 0 };
const MAX_LOG = 1000;

// ── Core API ────────────────────────────────────────────────────

/** Register a routing policy */
export function registerPolicy(policy: Omit<RoutingPolicy, 'id'>): RoutingPolicy {
  const full: RoutingPolicy = {
    ...policy,
    id: `rpol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
  policies.set(full.id, full);
  return full;
}

/** Route a decision to the best node */
export function routeDecision(
  policyId: string,
  availableNodes: Array<{ nodeId: string; region: string; latencyMs: number; capacityPercent: number; healthScore: number; capabilities: string[] }>,
  stickyKey?: string,
): RoutingDecision | null {
  const policy = policies.get(policyId);
  if (!policy) return null;
  if (availableNodes.length === 0) return null;

  // Filter by required capabilities
  let candidates = availableNodes.filter(n => {
    if (policy.requiredCapabilities.length === 0) return true;
    return policy.requiredCapabilities.every(cap => n.capabilities.includes(cap));
  });

  if (candidates.length === 0 && policy.fallbackEnabled) {
    candidates = availableNodes; // Fallback to any available
  }
  if (candidates.length === 0) return null;

  // Score candidates
  const scored: NodeCandidate[] = candidates.map(n => ({
    ...n,
    hasCapabilities: policy.requiredCapabilities.every(cap => n.capabilities.includes(cap)),
    score: computeScore(n, policy),
  }));

  // Apply strategy
  let selected: NodeCandidate;

  switch (policy.strategy) {
    case 'sticky': {
      if (stickyKey) {
        const bound = stickyBindings.get(stickyKey);
        const sticky = scored.find(n => n.nodeId === bound);
        if (sticky && sticky.healthScore > 30) {
          selected = sticky;
          break;
        }
      }
      selected = scored.sort((a, b) => b.score - a.score)[0];
      if (stickyKey) stickyBindings.set(stickyKey, selected.nodeId);
      break;
    }
    case 'round_robin': {
      selected = scored[roundRobinIndex.value % scored.length];
      roundRobinIndex.value++;
      break;
    }
    case 'region_affinity': {
      const preferred = scored.filter(n => policy.preferredRegions.includes(n.region));
      selected = preferred.length > 0
        ? preferred.sort((a, b) => b.score - a.score)[0]
        : scored.sort((a, b) => b.score - a.score)[0];
      break;
    }
    case 'capacity_first':
      selected = scored.sort((a, b) => a.capacityPercent - b.capacityPercent)[0];
      break;
    case 'latency_first':
    default:
      selected = scored.sort((a, b) => b.score - a.score)[0];
      break;
  }

  const decision: RoutingDecision = {
    id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    policyId: policy.id,
    targetNodeId: selected.nodeId,
    targetRegion: selected.region,
    strategy: policy.strategy,
    selectionReason: `Score: ${selected.score.toFixed(2)} (${policy.strategy})`,
    candidatesEvaluated: scored.length,
    selectedLatencyMs: selected.latencyMs,
    timestamp: Date.now(),
  };

  routingLog.push(decision);
  if (routingLog.length > MAX_LOG) routingLog.splice(0, routingLog.length - MAX_LOG);

  return decision;
}

function computeScore(
  node: { latencyMs: number; capacityPercent: number; healthScore: number; region: string },
  policy: RoutingPolicy,
): number {
  let score = 0;

  // Health: 40% weight
  score += (node.healthScore / 100) * 40;

  // Latency: 30% weight (inverse, lower is better)
  const latencyScore = Math.max(0, 1 - node.latencyMs / Math.max(policy.maxLatencyMs, 10));
  score += latencyScore * 30;

  // Capacity: 20% weight (lower utilization is better)
  score += ((100 - node.capacityPercent) / 100) * 20;

  // Region affinity: 10% bonus
  if (policy.preferredRegions.includes(node.region)) score += 10;

  return Math.round(score * 100) / 100;
}

// ── Query ────────────────────────────────────────────────────────

export function getPolicy(policyId: string): RoutingPolicy | undefined { return policies.get(policyId); }
export function getAllPolicies(): RoutingPolicy[] { return Array.from(policies.values()); }
export function getRoutingLog(count?: number): RoutingDecision[] {
  return count ? routingLog.slice(-count) : [...routingLog];
}

export function getEdgeRouterHealth() {
  const recent = routingLog.slice(-100);
  return {
    totalPolicies: policies.size,
    totalRoutings: routingLog.length,
    avgCandidatesEvaluated: recent.length > 0
      ? Math.round(recent.reduce((s, r) => s + r.candidatesEvaluated, 0) / recent.length * 10) / 10
      : 0,
    avgSelectedLatencyMs: recent.length > 0
      ? Math.round(recent.reduce((s, r) => s + r.selectedLatencyMs, 0) / recent.length * 100) / 100
      : 0,
    stickyBindings: stickyBindings.size,
  };
}

export function resetEdgeRouter(): void {
  policies.clear();
  routingLog.length = 0;
  stickyBindings.clear();
  roundRobinIndex.value = 0;
}
