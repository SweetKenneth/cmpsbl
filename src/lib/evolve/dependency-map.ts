/**
 * Proposal Dependency Mapping
 * Tracks dependencies between evolution proposals to prevent
 * out-of-order application and orphaned changes.
 */

export interface ProposalNode {
  id: string;
  title: string;
  dependsOn: string[];
  status: 'pending' | 'applied' | 'failed' | 'skipped';
  createdAt: number;
}

export interface DependencyGraph {
  nodes: ProposalNode[];
  edges: Array<{ from: string; to: string }>;
  rootNodes: string[];
  leafNodes: string[];
}

export interface ApplicationOrder {
  ordered: string[];
  blocked: Array<{ id: string; missingDeps: string[] }>;
  cycles: string[][];
}

const proposals = new Map<string, ProposalNode>();

export function registerProposal(
  id: string,
  title: string,
  dependsOn: string[] = [],
): ProposalNode {
  const node: ProposalNode = {
    id,
    title,
    dependsOn,
    status: 'pending',
    createdAt: Date.now(),
  };
  proposals.set(id, node);
  return node;
}

export function markApplied(id: string): boolean {
  const node = proposals.get(id);
  if (!node) return false;
  node.status = 'applied';
  return true;
}

export function markFailed(id: string): boolean {
  const node = proposals.get(id);
  if (!node) return false;
  node.status = 'failed';
  return true;
}

export function canApply(id: string): { allowed: boolean; blockedBy: string[] } {
  const node = proposals.get(id);
  if (!node) return { allowed: false, blockedBy: ['not_found'] };

  const blockedBy: string[] = [];
  for (const depId of node.dependsOn) {
    const dep = proposals.get(depId);
    if (!dep || dep.status !== 'applied') {
      blockedBy.push(depId);
    }
  }

  return { allowed: blockedBy.length === 0, blockedBy };
}

function detectCycles(): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(nodeId: string, path: string[]): void {
    if (stack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      if (cycleStart >= 0) cycles.push(path.slice(cycleStart));
      return;
    }
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    stack.add(nodeId);
    const node = proposals.get(nodeId);
    if (node) {
      for (const dep of node.dependsOn) {
        dfs(dep, [...path, nodeId]);
      }
    }
    stack.delete(nodeId);
  }

  for (const id of proposals.keys()) dfs(id, []);
  return cycles;
}

export function getApplicationOrder(): ApplicationOrder {
  const ordered: string[] = [];
  const blocked: Array<{ id: string; missingDeps: string[] }> = [];
  const resolved = new Set<string>();
  const cycles = detectCycles();

  // Topological sort
  let changed = true;
  while (changed) {
    changed = false;
    for (const [id, node] of proposals) {
      if (resolved.has(id)) continue;
      if (node.status === 'applied') {
        resolved.add(id);
        continue;
      }
      const allDepsResolved = node.dependsOn.every(
        d => resolved.has(d) || proposals.get(d)?.status === 'applied',
      );
      if (allDepsResolved) {
        ordered.push(id);
        resolved.add(id);
        changed = true;
      }
    }
  }

  // Remaining are blocked
  for (const [id, node] of proposals) {
    if (!resolved.has(id) && node.status !== 'applied') {
      const missingDeps = node.dependsOn.filter(
        d => !resolved.has(d) && proposals.get(d)?.status !== 'applied',
      );
      blocked.push({ id, missingDeps });
    }
  }

  return { ordered, blocked, cycles };
}

export function getDependencyGraph(): DependencyGraph {
  const nodes = Array.from(proposals.values());
  const edges: Array<{ from: string; to: string }> = [];
  const hasParent = new Set<string>();
  const isParent = new Set<string>();

  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      edges.push({ from: dep, to: node.id });
      hasParent.add(node.id);
      isParent.add(dep);
    }
  }

  return {
    nodes,
    edges,
    rootNodes: nodes.filter(n => !hasParent.has(n.id)).map(n => n.id),
    leafNodes: nodes.filter(n => !isParent.has(n.id)).map(n => n.id),
  };
}

export function clearProposals(): void {
  proposals.clear();
}
