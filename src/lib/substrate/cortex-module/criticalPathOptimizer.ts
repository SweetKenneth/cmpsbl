/**
 * CORTEX — Critical Path Optimizer
 * Dynamically prioritizes resources along the longest dependency chain.
 */

export interface PathNode {
  id: string;
  estimatedDurationMs: number;
  actualDurationMs?: number;
  dependencies: string[];
  resourceAllocation: number;  // 0-1
}

export interface CriticalPathAnalysis {
  criticalPath: string[];
  criticalDurationMs: number;
  nonCriticalBranches: string[][];
  slackPerNode: Map<string, number>;
  optimizations: PathOptimization[];
}

export interface PathOptimization {
  nodeId: string;
  action: 'boost' | 'deprioritize' | 'parallelize';
  reason: string;
  expectedSavingsMs: number;
}

export function analyzeCriticalPath(nodes: PathNode[]): CriticalPathAnalysis {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Calculate earliest start and finish times
  const earliestStart = new Map<string, number>();
  const earliestFinish = new Map<string, number>();

  function calcEarliest(nodeId: string): number {
    if (earliestFinish.has(nodeId)) return earliestFinish.get(nodeId)!;
    const node = nodeMap.get(nodeId)!;
    const es = node.dependencies.length === 0
      ? 0
      : Math.max(...node.dependencies.map(d => calcEarliest(d)));
    const duration = node.actualDurationMs ?? node.estimatedDurationMs;
    earliestStart.set(nodeId, es);
    earliestFinish.set(nodeId, es + duration);
    return es + duration;
  }

  for (const n of nodes) calcEarliest(n.id);

  // Find total project duration
  const totalDuration = Math.max(...Array.from(earliestFinish.values()));

  // Calculate latest start/finish (backward pass)
  const latestFinish = new Map<string, number>();
  const latestStart = new Map<string, number>();

  // Find terminal nodes
  const hasDependent = new Set<string>();
  for (const n of nodes) {
    for (const d of n.dependencies) hasDependent.add(d);
  }
  const terminals = nodes.filter(n => !hasDependent.has(n.id));

  function calcLatest(nodeId: string): number {
    if (latestStart.has(nodeId)) return latestStart.get(nodeId)!;
    const node = nodeMap.get(nodeId)!;
    const duration = node.actualDurationMs ?? node.estimatedDurationMs;

    const dependents = nodes.filter(n => n.dependencies.includes(nodeId));
    const lf = dependents.length === 0
      ? totalDuration
      : Math.min(...dependents.map(d => calcLatest(d.id)));

    latestFinish.set(nodeId, lf);
    latestStart.set(nodeId, lf - duration);
    return lf - duration;
  }

  for (const n of nodes) calcLatest(n.id);

  // Calculate slack
  const slackPerNode = new Map<string, number>();
  for (const n of nodes) {
    const slack = (latestStart.get(n.id) ?? 0) - (earliestStart.get(n.id) ?? 0);
    slackPerNode.set(n.id, slack);
  }

  // Critical path = nodes with zero slack
  const criticalPath = nodes
    .filter(n => (slackPerNode.get(n.id) ?? 0) === 0)
    .sort((a, b) => (earliestStart.get(a.id) ?? 0) - (earliestStart.get(b.id) ?? 0))
    .map(n => n.id);

  const criticalDurationMs = criticalPath.reduce((sum, id) => {
    const n = nodeMap.get(id)!;
    return sum + (n.actualDurationMs ?? n.estimatedDurationMs);
  }, 0);

  // Non-critical branches
  const nonCriticalNodes = nodes.filter(n => !criticalPath.includes(n.id));
  const nonCriticalBranches: string[][] = [];
  if (nonCriticalNodes.length > 0) {
    nonCriticalBranches.push(nonCriticalNodes.map(n => n.id));
  }

  // Generate optimizations
  const optimizations: PathOptimization[] = [];

  for (const nodeId of criticalPath) {
    const node = nodeMap.get(nodeId)!;
    if (node.resourceAllocation < 0.8) {
      optimizations.push({
        nodeId,
        action: 'boost',
        reason: 'Critical path node under-resourced',
        expectedSavingsMs: Math.round((node.actualDurationMs ?? node.estimatedDurationMs) * 0.2),
      });
    }
  }

  for (const n of nonCriticalNodes) {
    const slack = slackPerNode.get(n.id) ?? 0;
    if (slack > 5000 && n.resourceAllocation > 0.5) {
      optimizations.push({
        nodeId: n.id,
        action: 'deprioritize',
        reason: `High slack (${slack}ms) — resources can be redirected to critical path`,
        expectedSavingsMs: 0,
      });
    }
  }

  return {
    criticalPath,
    criticalDurationMs,
    nonCriticalBranches,
    slackPerNode,
    optimizations,
  };
}
