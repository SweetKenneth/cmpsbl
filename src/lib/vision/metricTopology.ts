/**
 * CMPSBL® VISION — Metric Topology Mapping
 * Dependency graph showing how metrics influence each other.
 * E.g., latency spike → error rate → SLA breach chain.
 */

export interface TopologyNode {
  id: string;
  metric: string;
  module: string;
  currentValue: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface TopologyEdge {
  from: string;
  to: string;
  relationship: 'causes' | 'correlates' | 'feeds';
  strength: number; // 0-1
  lagMs: number; // typical lag between cause and effect
  observedCount: number;
}

export interface TopologyGraph {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  criticalPaths: string[][]; // ordered node IDs forming critical dependency chains
  updatedAt: string;
}

// Bounded stores
const MAX_NODES = 200;
const MAX_EDGES = 1000;
const nodes = new Map<string, TopologyNode>();
const edges = new Map<string, TopologyEdge>();

// Observation buffer for automatic edge discovery
const MAX_OBS_BUFFER = 500;
const observationBuffer: Array<{ metric: string; module: string; value: number; ts: number }> = [];

/**
 * Register a metric node in the topology
 */
export function registerNode(metric: string, module: string, currentValue: number = 0): TopologyNode {
  const id = `${module}:${metric}`;
  const status: TopologyNode['status'] =
    currentValue > 90 ? 'critical' :
    currentValue > 70 ? 'warning' : 'normal';

  const node: TopologyNode = { id, metric, module, currentValue, status };

  if (nodes.size >= MAX_NODES && !nodes.has(id)) {
    const oldest = nodes.keys().next().value;
    if (oldest) nodes.delete(oldest);
  }
  nodes.set(id, node);
  return node;
}

/**
 * Define an explicit dependency edge
 */
export function defineEdge(
  fromMetric: string,
  fromModule: string,
  toMetric: string,
  toModule: string,
  relationship: TopologyEdge['relationship'] = 'causes',
  lagMs: number = 0
): TopologyEdge {
  const fromId = `${fromModule}:${fromMetric}`;
  const toId = `${toModule}:${toMetric}`;
  const key = `${fromId}→${toId}`;

  const existing = edges.get(key);
  if (existing) {
    existing.observedCount++;
    existing.strength = Math.min(1, existing.strength + 0.02);
    return existing;
  }

  const edge: TopologyEdge = {
    from: fromId,
    to: toId,
    relationship,
    strength: 0.5,
    lagMs,
    observedCount: 1,
  };

  if (edges.size >= MAX_EDGES) {
    // Evict weakest edge
    let weakestKey = '';
    let weakestStrength = Infinity;
    for (const [k, e] of edges) {
      if (e.strength < weakestStrength) { weakestStrength = e.strength; weakestKey = k; }
    }
    if (weakestKey) edges.delete(weakestKey);
  }
  edges.set(key, edge);
  return edge;
}

/**
 * Observe a metric value for automatic topology discovery
 */
export function observeMetric(metric: string, module: string, value: number): void {
  const ts = Date.now();
  observationBuffer.push({ metric, module, value, ts });
  if (observationBuffer.length > MAX_OBS_BUFFER) {
    observationBuffer.splice(0, Math.floor(MAX_OBS_BUFFER * 0.1));
  }

  registerNode(metric, module, value);
}

/**
 * Auto-discover edges from observation patterns
 * Looks for temporal co-occurrence of spikes
 */
export function discoverEdges(windowMs: number = 60_000): TopologyEdge[] {
  const cutoff = Date.now() - windowMs;
  const recent = observationBuffer.filter(o => o.ts >= cutoff);
  const discovered: TopologyEdge[] = [];

  // Find metric pairs that spike within close temporal proximity
  for (let i = 0; i < recent.length; i++) {
    for (let j = i + 1; j < recent.length; j++) {
      const a = recent[i];
      const b = recent[j];
      if (a.metric === b.metric && a.module === b.module) continue;

      const lag = Math.abs(a.ts - b.ts);
      if (lag > 30_000) continue; // Only correlate within 30s

      // Both elevated? (above 70 as heuristic)
      if (a.value > 70 && b.value > 70) {
        const edge = a.ts < b.ts
          ? defineEdge(a.metric, a.module, b.metric, b.module, 'correlates', lag)
          : defineEdge(b.metric, b.module, a.metric, a.module, 'correlates', lag);
        discovered.push(edge);
      }
    }
  }

  return discovered;
}

/**
 * Build the full topology graph
 */
export function getTopology(): TopologyGraph {
  const allNodes = Array.from(nodes.values());
  const allEdges = Array.from(edges.values());

  // Find critical paths (chains of edges involving critical/warning nodes)
  const criticalPaths: string[][] = [];
  const criticalNodes = allNodes.filter(n => n.status === 'critical' || n.status === 'warning');

  for (const startNode of criticalNodes) {
    const path = tracePath(startNode.id, allEdges, new Set());
    if (path.length >= 2) criticalPaths.push(path);
  }

  return {
    nodes: allNodes,
    edges: allEdges,
    criticalPaths,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Trace a dependency path from a node
 */
function tracePath(nodeId: string, allEdges: TopologyEdge[], visited: Set<string>): string[] {
  if (visited.has(nodeId)) return []; // Prevent cycles
  visited.add(nodeId);

  const outgoing = allEdges.filter(e => e.from === nodeId && e.strength > 0.3);
  if (outgoing.length === 0) return [nodeId];

  // Follow strongest edge
  outgoing.sort((a, b) => b.strength - a.strength);
  const next = outgoing[0].to;
  return [nodeId, ...tracePath(next, allEdges, visited)];
}

/**
 * Get topology stats
 */
export function getTopologyStats(): {
  nodeCount: number;
  edgeCount: number;
  criticalNodes: number;
  avgEdgeStrength: number;
} {
  const allEdges = Array.from(edges.values());
  const criticalCount = Array.from(nodes.values()).filter(n => n.status === 'critical').length;
  const avgStrength = allEdges.length > 0
    ? Math.round((allEdges.reduce((sum, e) => sum + e.strength, 0) / allEdges.length) * 100) / 100
    : 0;

  return {
    nodeCount: nodes.size,
    edgeCount: edges.size,
    criticalNodes: criticalCount,
    avgEdgeStrength: avgStrength,
  };
}
