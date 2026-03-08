/**
 * Module Dependency Graph
 * Runtime dependency resolution and boot ordering
 * 
 * Maintains the module dependency DAG, detects circular dependencies,
 * and computes optimal boot order via topological sort.
 */

export interface ModuleNode {
  id: string;
  name: string;
  dependencies: string[];
  bootOrder: number | null;
  status: 'unloaded' | 'loading' | 'ready' | 'failed';
  loadTimeMs: number | null;
}

const graph = new Map<string, ModuleNode>();

/** Clear all registered modules — essential for test isolation and HMR */
export function clearGraph(): void {
  graph.clear();
  dependentsIndex = null;
}

/** Get current graph size */
export function getGraphSize(): number {
  return graph.size;
}

export function registerModule(id: string, name: string, dependencies: string[] = []): ModuleNode {
  // Warn on unknown dependencies (non-fatal; they may be registered later)
  for (const dep of dependencies) {
    if (!graph.has(dep)) {
      console.warn(`[dependency-graph] Module "${name}" declares dependency on unregistered module "${dep}"`);
    }
  }
  const node: ModuleNode = { id, name, dependencies, bootOrder: null, status: 'unloaded', loadTimeMs: null };
  graph.set(id, node);
  // Invalidate reverse-dependency cache when graph changes
  dependentsIndex = null;
  return node;
}

export function computeBootOrder(): { order: string[]; cycles: string[][] } {
  const visited = new Set<string>();
  const stack = new Set<string>();
  const order: string[] = [];
  const cycles: string[][] = [];
  const inCycle = new Set<string>();

  function visit(nodeId: string, path: string[]): boolean {
    if (stack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      const cycle = path.slice(cycleStart);
      cycles.push(cycle);
      cycle.forEach(id => inCycle.add(id));
      return false;
    }
    if (visited.has(nodeId)) return true;

    stack.add(nodeId);
    const node = graph.get(nodeId);
    let hasCycle = false;
    if (node) {
      for (const dep of node.dependencies) {
        if (!visit(dep, [...path, nodeId])) {
          hasCycle = true;
        }
      }
    }
    stack.delete(nodeId);
    visited.add(nodeId);
    // Only add to boot order if not part of a cycle
    if (!hasCycle && !inCycle.has(nodeId)) {
      order.push(nodeId);
    }
    return !hasCycle;
  }

  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) visit(nodeId, []);
  }

  // Assign boot orders
  order.forEach((id, i) => {
    const node = graph.get(id);
    if (node) node.bootOrder = i;
  });

  // Mark cyclic nodes as failed
  for (const id of inCycle) {
    const node = graph.get(id);
    if (node) {
      node.status = 'failed';
      node.bootOrder = null;
    }
  }

  return { order, cycles };
}

// Precomputed reverse-dependency index; rebuilt on each computeBootOrder call
let dependentsIndex: Map<string, string[]> | null = null;

function ensureDependentsIndex(): Map<string, string[]> {
  if (dependentsIndex) return dependentsIndex;
  const idx = new Map<string, string[]>();
  for (const [id] of graph) idx.set(id, []);
  for (const [id, node] of graph) {
    for (const dep of node.dependencies) {
      idx.get(dep)?.push(id);
    }
  }
  dependentsIndex = idx;
  return idx;
}

export function getDependents(moduleId: string): string[] {
  const idx = ensureDependentsIndex();
  return [...(idx.get(moduleId) || [])];
}

export function getTransitiveDependencies(moduleId: string): string[] {
  const result = new Set<string>();
  const queue = [moduleId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = graph.get(current);
    if (node) {
      for (const dep of node.dependencies) {
        if (!result.has(dep)) {
          result.add(dep);
          queue.push(dep);
        }
      }
    }
  }
  return Array.from(result);
}

export function setModuleStatus(moduleId: string, status: ModuleNode['status'], loadTimeMs?: number): void {
  const node = graph.get(moduleId);
  if (node) {
    node.status = status;
    if (loadTimeMs !== undefined) node.loadTimeMs = loadTimeMs;
  }
}

export function getModules(): ModuleNode[] { return Array.from(graph.values()); }
export function getModule(id: string): ModuleNode | undefined { return graph.get(id); }
export function getReadyModules(): ModuleNode[] { return Array.from(graph.values()).filter(n => n.status === 'ready'); }
export function getFailedModules(): ModuleNode[] { return Array.from(graph.values()).filter(n => n.status === 'failed'); }
