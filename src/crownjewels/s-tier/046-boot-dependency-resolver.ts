/**
 * S-Tier 046 — Boot Dependency Resolver
 * CJPI: 93 | Node: SYSTEM | ID: S-108
 *
 * Topological sort for module boot dependencies.
 * Ensures correct initialization order and detects circular dependencies.
 */

export interface BootDependency {
  module: string;
  dependsOn: string[];
}

export interface BootOrder {
  order: string[];
  stages: string[][];  // parallelizable groups
  circular: string[] | null;
}

export function resolveBootOrder(deps: BootDependency[]): BootOrder {
  const graph = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  // Initialize
  for (const d of deps) {
    if (!graph.has(d.module)) graph.set(d.module, new Set());
    if (!inDegree.has(d.module)) inDegree.set(d.module, 0);
    for (const dep of d.dependsOn) {
      if (!graph.has(dep)) graph.set(dep, new Set());
      if (!inDegree.has(dep)) inDegree.set(dep, 0);
      graph.get(dep)!.add(d.module);
      inDegree.set(d.module, (inDegree.get(d.module) ?? 0) + 1);
    }
  }

  // Kahn's algorithm with stage grouping
  const order: string[] = [];
  const stages: string[][] = [];
  let queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([m]) => m);

  while (queue.length) {
    stages.push([...queue]);
    order.push(...queue);
    const nextQueue: string[] = [];
    for (const node of queue) {
      for (const dependent of graph.get(node) ?? []) {
        const newDeg = (inDegree.get(dependent) ?? 1) - 1;
        inDegree.set(dependent, newDeg);
        if (newDeg === 0) nextQueue.push(dependent);
      }
    }
    queue = nextQueue;
  }

  // Circular detection
  const allModules = [...inDegree.keys()];
  const circular = allModules.length !== order.length
    ? allModules.filter(m => !order.includes(m))
    : null;

  return { order, stages, circular };
}
