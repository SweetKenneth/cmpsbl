/**
 * DAG Dependency Sequencer — EVOLUTION v9.0.0
 * Topological ordering of mutation proposals based on inter-module dependencies.
 */

// --- Types ---

export interface MutationNode {
  id: string;
  impactedModules: string[];
  dependencies: string[]; // proposal IDs this must wait for
  priority: number; // lower = higher priority
}

export interface SequenceResult {
  ordered: string[][]; // groups of parallelizable proposal IDs
  hasCycle: boolean;
  cycleParticipants: string[];
  totalGroups: number;
}

// --- Core ---

export function sequenceMutations(nodes: MutationNode[]): SequenceResult {
  const nodeMap = new Map<string, MutationNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const n of nodes) {
    if (!inDegree.has(n.id)) inDegree.set(n.id, 0);
    if (!adjacency.has(n.id)) adjacency.set(n.id, []);

    for (const dep of n.dependencies) {
      if (!nodeMap.has(dep)) continue;
      const adj = adjacency.get(dep) || [];
      adj.push(n.id);
      adjacency.set(dep, adj);
      inDegree.set(n.id, (inDegree.get(n.id) || 0) + 1);
    }
  }

  // Kahn's algorithm — level-grouped
  const groups: string[][] = [];
  const completed = new Set<string>();
  const remaining = new Set(nodes.map(n => n.id));

  while (remaining.size > 0) {
    const ready = [...remaining].filter(id => {
      const deps = nodeMap.get(id)?.dependencies || [];
      return deps.every(d => !nodeMap.has(d) || completed.has(d));
    });

    if (ready.length === 0) {
      return {
        ordered: groups,
        hasCycle: true,
        cycleParticipants: [...remaining],
        totalGroups: groups.length,
      };
    }

    // Sort within group by priority
    ready.sort((a, b) => (nodeMap.get(a)?.priority || 0) - (nodeMap.get(b)?.priority || 0));
    groups.push(ready);

    for (const id of ready) {
      completed.add(id);
      remaining.delete(id);
    }
  }

  return {
    ordered: groups,
    hasCycle: false,
    cycleParticipants: [],
    totalGroups: groups.length,
  };
}

export function detectModuleConflicts(nodes: MutationNode[]): Array<{ nodeA: string; nodeB: string; sharedModules: string[] }> {
  const conflicts: Array<{ nodeA: string; nodeB: string; sharedModules: string[] }> = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = nodes[i].impactedModules.filter(m => nodes[j].impactedModules.includes(m));
      if (shared.length > 0) {
        conflicts.push({ nodeA: nodes[i].id, nodeB: nodes[j].id, sharedModules: shared });
      }
    }
  }

  return conflicts;
}

export function computeCriticalPath(nodes: MutationNode[]): string[] {
  const result = sequenceMutations(nodes);
  if (result.hasCycle) return [];

  // Critical path = longest chain through the DAG
  const nodeMap = new Map<string, MutationNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const longestPath = new Map<string, number>();
  const predecessor = new Map<string, string | null>();

  for (const group of result.ordered) {
    for (const id of group) {
      const node = nodeMap.get(id)!;
      let maxPrev = 0;
      let bestPred: string | null = null;

      for (const dep of node.dependencies) {
        const prev = longestPath.get(dep) || 0;
        if (prev + 1 > maxPrev) {
          maxPrev = prev + 1;
          bestPred = dep;
        }
      }

      longestPath.set(id, maxPrev);
      predecessor.set(id, bestPred);
    }
  }

  // Find terminal node with longest path
  let maxLen = 0;
  let terminal = '';
  for (const [id, len] of longestPath) {
    if (len >= maxLen) { maxLen = len; terminal = id; }
  }

  // Trace back
  const path: string[] = [];
  let current: string | null = terminal;
  while (current) {
    path.unshift(current);
    current = predecessor.get(current) ?? null;
  }

  return path;
}
