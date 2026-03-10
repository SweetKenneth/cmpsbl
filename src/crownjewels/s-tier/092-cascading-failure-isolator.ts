/**
 * S-Tier 092 — Cascading Failure Isolator
 * ID: S-83 | CJPI: 90 | Module: MEDIC
 * 
 * Isolates failing nodes to prevent cascade propagation across the system.
 */

export interface NodeHealth {
  nodeId: string;
  status: 'healthy' | 'degraded' | 'failing' | 'isolated';
  errorRate: number;
  latencyMs: number;
  dependencies: string[];
  dependents: string[];
  lastHealthCheck: string;
}

export interface IsolationAction {
  nodeId: string;
  action: 'isolate' | 'throttle' | 'redirect' | 'shed_load';
  reason: string;
  blastRadius: string[];
  timestamp: string;
}

export interface CascadeAnalysis {
  originNode: string;
  affectedNodes: string[];
  isolationPlan: IsolationAction[];
  estimatedRecoveryMs: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const ERROR_RATE_THRESHOLD = 0.3;
const LATENCY_THRESHOLD_MS = 5000;

export function buildDependencyGraph(nodes: NodeHealth[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  for (const node of nodes) {
    graph.set(node.nodeId, new Set(node.dependents));
  }
  return graph;
}

export function calculateBlastRadius(
  failingNodeId: string,
  graph: Map<string, Set<string>>,
  visited = new Set<string>()
): string[] {
  if (visited.has(failingNodeId)) return [];
  visited.add(failingNodeId);

  const dependents = graph.get(failingNodeId) || new Set();
  const affected: string[] = [...dependents];

  for (const dep of dependents) {
    affected.push(...calculateBlastRadius(dep, graph, visited));
  }

  return [...new Set(affected)];
}

export function analyzeCascadeRisk(nodes: NodeHealth[]): CascadeAnalysis[] {
  const graph = buildDependencyGraph(nodes);
  const analyses: CascadeAnalysis[] = [];

  const failingNodes = nodes.filter(
    n => n.errorRate > ERROR_RATE_THRESHOLD || n.latencyMs > LATENCY_THRESHOLD_MS
  );

  for (const node of failingNodes) {
    const blastRadius = calculateBlastRadius(node.nodeId, graph);
    const severity: CascadeAnalysis['severity'] =
      blastRadius.length > 10 ? 'critical' :
      blastRadius.length > 5 ? 'high' :
      blastRadius.length > 2 ? 'medium' : 'low';

    const plan: IsolationAction[] = [{
      nodeId: node.nodeId,
      action: severity === 'critical' ? 'isolate' : 'throttle',
      reason: `Error rate ${(node.errorRate * 100).toFixed(1)}%, latency ${node.latencyMs}ms`,
      blastRadius,
      timestamp: new Date().toISOString(),
    }];

    analyses.push({
      originNode: node.nodeId,
      affectedNodes: blastRadius,
      isolationPlan: plan,
      estimatedRecoveryMs: blastRadius.length * 1000,
      severity,
    });
  }

  return analyses.sort((a, b) => {
    const sev = { critical: 0, high: 1, medium: 2, low: 3 };
    return sev[a.severity] - sev[b.severity];
  });
}
