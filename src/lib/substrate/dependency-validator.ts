/**
 * Dependency Validator — Validates module boot order and circular deps
 * Ensures substrate modules initialize in correct sequence
 */

interface ModuleDep {
  id: string;
  requires: string[];
  optional?: string[];
}

interface ValidationResult {
  valid: boolean;
  order: string[];
  cycles: string[][];
  missing: Array<{ module: string; dependency: string }>;
}

export function validateDependencies(modules: ModuleDep[]): ValidationResult {
  const graph = new Map<string, string[]>();
  const allIds = new Set(modules.map(m => m.id));
  const missing: Array<{ module: string; dependency: string }> = [];

  for (const m of modules) {
    graph.set(m.id, m.requires);
    for (const dep of m.requires) {
      if (!allIds.has(dep)) missing.push({ module: m.id, dependency: dep });
    }
  }

  // Detect cycles via DFS
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const dep of graph.get(node) || []) {
      dfs(dep, [...path, node]);
    }
    stack.delete(node);
  }

  for (const id of allIds) dfs(id, []);

  // Topological sort (Kahn's)
  const inDegree = new Map<string, number>();
  for (const id of allIds) inDegree.set(id, 0);
  for (const [, deps] of graph) {
    for (const dep of deps) {
      if (inDegree.has(dep)) inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length) {
    const node = queue.shift()!;
    order.push(node);
    for (const [id, deps] of graph) {
      if (deps.includes(node)) {
        inDegree.set(id, (inDegree.get(id) || 1) - 1);
        if (inDegree.get(id) === 0) queue.push(id);
      }
    }
  }

  return {
    valid: cycles.length === 0 && missing.length === 0,
    order,
    cycles,
    missing,
  };
}

/** Quick check for a single module's readiness */
export function canBoot(moduleId: string, booted: Set<string>, modules: ModuleDep[]): boolean {
  const mod = modules.find(m => m.id === moduleId);
  if (!mod) return false;
  return mod.requires.every(dep => booted.has(dep));
}
