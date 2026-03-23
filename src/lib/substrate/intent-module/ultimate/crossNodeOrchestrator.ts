/**
 * INTENT Ultimate — System 9: Cross-Node Orchestration Protocol
 * 
 * INTENT doesn't just classify — it orchestrates. Knows which nodes have capacity,
 * which are degraded, and routes accordingly. Integrates with NERVE and CORTEX.
 * 
 * @module intent/ultimate/crossNodeOrchestrator
 */

// ── Types ────────────────────────────────────────────────────────

export type NodeStatus = 'healthy' | 'degraded' | 'overloaded' | 'offline';

export interface NodeCapacity {
  nodeId: string;
  status: NodeStatus;
  healthScore: number; // 0-100
  currentLoad: number; // 0-100 percent
  queueDepth: number;
  avgLatencyMs: number;
  lastUpdated: string;
}

export interface RouteDecision {
  id: string;
  intentType: string;
  candidateNodes: string[];
  selectedNode: string;
  reason: string;
  fallbackNodes: string[];
  confidenceScore: number;
  decidedAt: string;
}

export interface OrchestrationPlan {
  id: string;
  intentId: string;
  routes: RouteDecision[];
  parallelGroups: string[][]; // Groups of routes that can execute concurrently
  estimatedTotalMs: number;
  status: 'planned' | 'executing' | 'completed' | 'degraded';
  createdAt: string;
}

// ── State ────────────────────────────────────────────────────────

const nodeCapacities: Map<string, NodeCapacity> = new Map();
const routeHistory: RouteDecision[] = [];
const orchestrationPlans: Map<string, OrchestrationPlan> = new Map();
const MAX_HISTORY = 500;
const MAX_PLANS = 200;

// ── Node-Intent Affinity Map ─────────────────────────────────────

const NODE_CAPABILITIES: Record<string, string[]> = {
  BRAIN:       ['analysis', 'reasoning', 'learning', 'knowledge_synthesis'],
  MEMORY:      ['query', 'context_retrieval', 'storage'],
  CORTEX:      ['orchestration', 'pipeline_management'],
  DEFENSE:     ['security', 'threat_analysis', 'monitoring'],
  ORACLE:      ['prediction', 'forecasting', 'simulation'],
  DECODE:      ['parsing', 'nlu', 'conversation'],
  ENCODE:      ['generation', 'code_synthesis', 'mutation'],
  NERVE:       ['signaling', 'health_monitoring', 'backpressure'],
  EVOLUTION:   ['adaptation', 'mutation', 'upgrade'],
  DREAM:       ['consolidation', 'heuristic_refinement'],
  FORGE:       ['discovery', 'artifact_creation'],
  PHANTOM:     ['privacy', 'anonymization', 'data_protection'],
  SHADOW:      ['session_management', 'covert_ops'],
  IMMUNITY:    ['threat_response', 'quarantine', 'healing'],
  GOVERNANCE:  ['policy', 'approval', 'compliance'],
  AUDIT:       ['logging', 'chain_verification', 'forensics'],
  OBSERVER:    ['telemetry', 'anomaly_detection'],
  COMPASS:     ['trend_analysis', 'spatial_reasoning'],
  ATLAS:       ['capability_registry', 'knowledge_map'],
  HARVEST:     ['data_ingestion', 'etl'],
  IDENTITY:    ['authentication', 'trust_scoring'],
  RELAY:       ['message_routing', 'channel_management'],
  SANDBOX:     ['isolated_execution', 'experimentation'],
  INTEGRATION: ['external_apis', 'protocol_bridging'],
  MEDIC:       ['diagnostics', 'repair', 'triage'],
  ENGINEER:    ['optimization', 'maintenance', 'refactoring'],
};

// ── Core API ────────────────────────────────────────────────────

/** Update node capacity information */
export function updateNodeCapacity(
  nodeId: string,
  status: NodeStatus,
  healthScore: number,
  currentLoad: number,
  queueDepth: number = 0,
  avgLatencyMs: number = 50,
): void {
  nodeCapacities.set(nodeId, {
    nodeId,
    status,
    healthScore: Math.max(0, Math.min(100, healthScore)),
    currentLoad: Math.max(0, Math.min(100, currentLoad)),
    queueDepth,
    avgLatencyMs,
    lastUpdated: new Date().toISOString(),
  });
}

/** Route an intent to the best available node(s) */
export function routeIntent(intentType: string, requiredCapabilities: string[] = []): RouteDecision {
  // Find candidate nodes
  const candidates: Array<{ nodeId: string; score: number }> = [];

  for (const [nodeId, capabilities] of Object.entries(NODE_CAPABILITIES)) {
    const capabilityMatch = requiredCapabilities.length === 0
      || requiredCapabilities.some(cap => capabilities.includes(cap));
    if (!capabilityMatch) continue;

    const capacity = nodeCapacities.get(nodeId);
    const health = capacity?.healthScore ?? 80;
    const load = capacity?.currentLoad ?? 30;
    const status = capacity?.status ?? 'healthy';

    if (status === 'offline') continue;

    // Composite score: capability match + health + capacity
    let score = 50;
    const matchedCaps = requiredCapabilities.filter(c => capabilities.includes(c)).length;
    score += (matchedCaps / Math.max(1, requiredCapabilities.length)) * 30;
    score += (health / 100) * 15;
    score -= (load / 100) * 10;
    if (status === 'degraded') score -= 15;
    if (status === 'overloaded') score -= 30;

    candidates.push({ nodeId, score: Math.round(score) });
  }

  candidates.sort((a, b) => b.score - a.score);

  const selected = candidates[0]?.nodeId || 'CORTEX'; // Fallback to CORTEX
  const fallbacks = candidates.slice(1, 4).map(c => c.nodeId);

  const decision: RouteDecision = {
    id: crypto.randomUUID(),
    intentType,
    candidateNodes: candidates.map(c => c.nodeId),
    selectedNode: selected,
    reason: `Best match: ${selected} (score: ${candidates[0]?.score || 0}) from ${candidates.length} candidates`,
    fallbackNodes: fallbacks,
    confidenceScore: candidates.length > 0 ? candidates[0].score / 100 : 0,
    decidedAt: new Date().toISOString(),
  };

  routeHistory.push(decision);
  if (routeHistory.length > MAX_HISTORY) routeHistory.splice(0, routeHistory.length - MAX_HISTORY);

  return decision;
}

/** Create an orchestration plan for a multi-node intent */
export function createOrchestrationPlan(
  intentId: string,
  routes: RouteDecision[],
): OrchestrationPlan {
  // Detect parallel groups (routes to different nodes can run concurrently)
  const nodeGroups: Map<string, RouteDecision[]> = new Map();
  for (const route of routes) {
    const key = route.selectedNode;
    if (!nodeGroups.has(key)) nodeGroups.set(key, []);
    nodeGroups.get(key)!.push(route);
  }

  const parallelGroups = Array.from(nodeGroups.values()).map(group => group.map(r => r.id));

  const plan: OrchestrationPlan = {
    id: crypto.randomUUID(),
    intentId,
    routes,
    parallelGroups,
    estimatedTotalMs: routes.length * 100, // Rough estimate
    status: 'planned',
    createdAt: new Date().toISOString(),
  };

  orchestrationPlans.set(plan.id, plan);
  if (orchestrationPlans.size > MAX_PLANS) {
    const oldest = orchestrationPlans.keys().next().value;
    if (oldest) orchestrationPlans.delete(oldest);
  }

  return plan;
}

/** Get route history */
export function getRouteHistory(): RouteDecision[] {
  return [...routeHistory];
}

/** Get orchestrator health */
export function getOrchestratorHealth() {
  const healthy = Array.from(nodeCapacities.values()).filter(n => n.status === 'healthy').length;
  const total = nodeCapacities.size || Object.keys(NODE_CAPABILITIES).length;

  return {
    knownNodes: nodeCapacities.size,
    healthyNodes: healthy,
    degradedNodes: Array.from(nodeCapacities.values()).filter(n => n.status === 'degraded').length,
    totalRoutes: routeHistory.length,
    activePlans: Array.from(orchestrationPlans.values()).filter(p => p.status === 'executing').length,
    networkHealth: total > 0 ? Math.round((healthy / total) * 100) : 100,
  };
}

/** Reset */
export function resetOrchestrator(): void {
  nodeCapacities.clear();
  routeHistory.length = 0;
  orchestrationPlans.clear();
}
