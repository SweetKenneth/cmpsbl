/**
 * CORE — Dependency Graph Resolver
 * DAG-based module dependency resolution with cycle detection.
 * Ensures boot/shutdown ordering is safe.
 * Ultimate Form v1.0.0
 */

export interface GraphNode {
  id: string;
  dependencies: string[];
  dependents: string[];
  depth: number;       // Distance from root
  critical: boolean;   // On critical path
}

export interface DependencyGraph {
  nodes: Map<string, GraphNode>;
  roots: string[];
  leaves: string[];
  criticalPath: string[];
  hasCycles: boolean;
  cycleDetails: string[][] | null;
}

/**
 * Build a dependency graph from module declarations.
 */
export function buildDependencyGraph(
  modules: Array<{ id: string; dependencies: string[] }>
): DependencyGraph {
  const nodes = new Map<string, GraphNode>();

  // Initialize nodes
  for (const mod of modules) {
    nodes.set(mod.id, {
      id: mod.id,
      dependencies: [...mod.dependencies],
      dependents: [],
      depth: 0,
      critical: false,
    });
  }

  // Build reverse edges (dependents)
  for (const mod of modules) {
    for (const dep of mod.dependencies) {
      const depNode = nodes.get(dep);
      if (depNode) {
        depNode.dependents.push(mod.id);
      }
    }
  }

  // Detect cycles
  const cycles = detectCycles(nodes);

  // Calculate depths via BFS from roots
  const roots = Array.from(nodes.values())
    .filter(n => n.dependencies.length === 0)
    .map(n => n.id);

  const leaves = Array.from(nodes.values())
    .filter(n => n.dependents.length === 0)
    .map(n => n.id);

  if (cycles.length === 0) {
    calculateDepths(nodes, roots);
  }

  // Find critical path (longest path from root to leaf)
  const criticalPath = findCriticalPath(nodes, roots, leaves);
  for (const id of criticalPath) {
    const node = nodes.get(id);
    if (node) node.critical = true;
  }

  return {
    nodes,
    roots,
    leaves,
    criticalPath,
    hasCycles: cycles.length > 0,
    cycleDetails: cycles.length > 0 ? cycles : null,
  };
}

/**
 * Detect cycles using DFS with coloring.
 */
function detectCycles(nodes: Map<string, GraphNode>): string[][] {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  const parent = new Map<string, string | null>();
  const cycles: string[][] = [];

  for (const id of nodes.keys()) color.set(id, WHITE);

  function dfs(u: string): void {
    color.set(u, GRAY);
    const node = nodes.get(u);
    if (!node) return;

    for (const v of node.dependencies) {
      if (color.get(v) === GRAY) {
        // Found cycle — reconstruct
        const cycle: string[] = [v];
        let curr = u;
        while (curr !== v) {
          cycle.push(curr);
          curr = parent.get(curr) || v;
        }
        cycle.push(v);
        cycles.push(cycle.reverse());
      } else if (color.get(v) === WHITE) {
        parent.set(v, u);
        dfs(v);
      }
    }
    color.set(u, BLACK);
  }

  for (const id of nodes.keys()) {
    if (color.get(id) === WHITE) dfs(id);
  }

  return cycles;
}

/**
 * Calculate depths via BFS from roots.
 */
function calculateDepths(nodes: Map<string, GraphNode>, roots: string[]): void {
  const queue = [...roots];
  const visited = new Set<string>();

  for (const r of roots) {
    const node = nodes.get(r);
    if (node) node.depth = 0;
    visited.add(r);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = nodes.get(current)!;

    for (const depId of node.dependents) {
      const dep = nodes.get(depId);
      if (dep) {
        dep.depth = Math.max(dep.depth, node.depth + 1);
        if (!visited.has(depId)) {
          visited.add(depId);
          queue.push(depId);
        }
      }
    }
  }
}

/**
 * Find the critical (longest) path through the graph.
 */
function findCriticalPath(
  nodes: Map<string, GraphNode>,
  roots: string[],
  leaves: string[]
): string[] {
  if (roots.length === 0 || leaves.length === 0) return [];

  let longestPath: string[] = [];

  function dfs(current: string, path: string[]): void {
    path.push(current);
    const node = nodes.get(current);

    if (!node || node.dependents.length === 0) {
      if (path.length > longestPath.length) {
        longestPath = [...path];
      }
    } else {
      for (const dep of node.dependents) {
        dfs(dep, path);
      }
    }
    path.pop();
  }

  for (const root of roots) dfs(root, []);
  return longestPath;
}

/**
 * Get topological boot order (safe startup sequence).
 */
export function getBootOrder(graph: DependencyGraph): string[] {
  if (graph.hasCycles) return [];

  const order: string[] = [];
  const visited = new Set<string>();

  function visit(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);
    const node = graph.nodes.get(id);
    if (!node) return;
    for (const dep of node.dependencies) visit(dep);
    order.push(id);
  }

  for (const id of graph.nodes.keys()) visit(id);
  return order;
}

/**
 * Get reverse topological shutdown order.
 */
export function getShutdownOrder(graph: DependencyGraph): string[] {
  return getBootOrder(graph).reverse();
}

/**
 * Get impact analysis: which modules are affected if a module fails.
 */
export function getImpactAnalysis(graph: DependencyGraph, failedModuleId: string): string[] {
  const affected = new Set<string>();

  function propagate(id: string): void {
    const node = graph.nodes.get(id);
    if (!node) return;
    for (const dep of node.dependents) {
      if (!affected.has(dep)) {
        affected.add(dep);
        propagate(dep);
      }
    }
  }

  propagate(failedModuleId);
  return Array.from(affected);
}
