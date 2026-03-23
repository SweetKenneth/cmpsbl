/**
 * CORTEX — DAG Execution Engine
 * Topological sort, parallel group detection, dependency gates.
 */

export interface DAGNode {
  id: string;
  dependencies: string[];
  execute: () => Promise<DAGNodeResult>;
  priority?: 'critical' | 'normal' | 'low';
  timeoutMs?: number;
}

export interface DAGNodeResult {
  nodeId: string;
  status: 'success' | 'failed' | 'skipped' | 'timeout';
  durationMs: number;
  output?: unknown;
  error?: string;
}

export interface DAGExecutionResult {
  pipelineId: string;
  status: 'completed' | 'partial' | 'failed';
  totalDurationMs: number;
  stages: DAGNodeResult[];
  parallelGroups: number;
  criticalPath: string[];
}

interface InternalNode extends DAGNode {
  inDegree: number;
  dependents: string[];
}

function topologicalSort(nodes: Map<string, InternalNode>): string[][] {
  const groups: string[][] = [];
  const remaining = new Map(nodes);
  const completed = new Set<string>();

  while (remaining.size > 0) {
    const ready: string[] = [];
    for (const [id, node] of remaining) {
      if (node.dependencies.every(d => completed.has(d))) {
        ready.push(id);
      }
    }

    if (ready.length === 0) {
      const cycleNodes = Array.from(remaining.keys());
      throw new Error(`Cycle detected in DAG: ${cycleNodes.join(', ')}`);
    }

    // Sort within group by priority
    ready.sort((a, b) => {
      const pa = remaining.get(a)?.priority ?? 'normal';
      const pb = remaining.get(b)?.priority ?? 'normal';
      const order = { critical: 0, normal: 1, low: 2 };
      return order[pa] - order[pb];
    });

    groups.push(ready);
    for (const id of ready) {
      completed.add(id);
      remaining.delete(id);
    }
  }

  return groups;
}

function findCriticalPath(nodes: Map<string, InternalNode>, results: Map<string, number>): string[] {
  const longestPath = new Map<string, { length: number; path: string[] }>();

  function dfs(nodeId: string): { length: number; path: string[] } {
    if (longestPath.has(nodeId)) return longestPath.get(nodeId)!;

    const node = nodes.get(nodeId);
    if (!node) return { length: 0, path: [] };

    const duration = results.get(nodeId) ?? 0;

    if (node.dependencies.length === 0) {
      const result = { length: duration, path: [nodeId] };
      longestPath.set(nodeId, result);
      return result;
    }

    let maxDep = { length: 0, path: [] as string[] };
    for (const depId of node.dependencies) {
      const depResult = dfs(depId);
      if (depResult.length > maxDep.length) {
        maxDep = depResult;
      }
    }

    const result = { length: maxDep.length + duration, path: [...maxDep.path, nodeId] };
    longestPath.set(nodeId, result);
    return result;
  }

  let criticalPath = { length: 0, path: [] as string[] };
  for (const nodeId of nodes.keys()) {
    const p = dfs(nodeId);
    if (p.length > criticalPath.length) criticalPath = p;
  }

  return criticalPath.path;
}

export async function executeDAG(
  pipelineId: string,
  nodes: DAGNode[]
): Promise<DAGExecutionResult> {
  const start = Date.now();
  const nodeMap = new Map<string, InternalNode>();

  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, inDegree: 0, dependents: [] });
  }

  // Build reverse edges
  for (const node of nodes) {
    for (const dep of node.dependencies) {
      const depNode = nodeMap.get(dep);
      if (depNode) depNode.dependents.push(node.id);
      const n = nodeMap.get(node.id);
      if (n) n.inDegree++;
    }
  }

  const groups = topologicalSort(nodeMap);
  const results: DAGNodeResult[] = [];
  const durations = new Map<string, number>();
  const failedNodes = new Set<string>();

  for (const group of groups) {
    const groupPromises = group.map(async (nodeId): Promise<DAGNodeResult> => {
      const node = nodeMap.get(nodeId)!;

      // Skip if any dependency failed (unless critical)
      const depFailed = node.dependencies.some(d => failedNodes.has(d));
      if (depFailed && node.priority !== 'critical') {
        return { nodeId, status: 'skipped', durationMs: 0, error: 'Dependency failed' };
      }

      const nodeStart = Date.now();
      try {
        const timeout = node.timeoutMs ?? 30_000;
        const result = await Promise.race([
          node.execute(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
          ),
        ]);
        return result;
      } catch (e: any) {
        failedNodes.add(nodeId);
        const dur = Date.now() - nodeStart;
        durations.set(nodeId, dur);
        return {
          nodeId,
          status: e.message === 'Timeout' ? 'timeout' : 'failed',
          durationMs: dur,
          error: e.message,
        };
      }
    });

    const groupResults = await Promise.all(groupPromises);
    for (const r of groupResults) {
      durations.set(r.nodeId, r.durationMs);
      results.push(r);
    }
  }

  const criticalPath = findCriticalPath(nodeMap, durations);
  const allSuccess = results.every(r => r.status === 'success' || r.status === 'skipped');
  const anyFail = results.some(r => r.status === 'failed' || r.status === 'timeout');

  return {
    pipelineId,
    status: allSuccess ? 'completed' : anyFail ? 'failed' : 'partial',
    totalDurationMs: Date.now() - start,
    stages: results,
    parallelGroups: groups.length,
    criticalPath,
  };
}
