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

export function registerModule(id: string, name: string, dependencies: string[] = []): ModuleNode {
  const node: ModuleNode = { id, name, dependencies, bootOrder: null, status: 'unloaded', loadTimeMs: null };
  graph.set(id, node);
  return node;
}

export function computeBootOrder(): { order: string[]; cycles: string[][] } {
  const visited = new Set<string>();
  const stack = new Set<string>();
  const order: string[] = [];
  const cycles: string[][] = [];

  function visit(nodeId: string, path: string[]): boolean {
    if (stack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      cycles.push(path.slice(cycleStart));
      return false;
    }
    if (visited.has(nodeId)) return true;

    stack.add(nodeId);
    const node = graph.get(nodeId);
    if (node) {
      for (const dep of node.dependencies) {
        visit(dep, [...path, nodeId]);
      }
    }
    stack.delete(nodeId);
    visited.add(nodeId);
    order.push(nodeId);
    return true;
  }

  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) visit(nodeId, []);
  }

  // Assign boot orders
  order.forEach((id, i) => {
    const node = graph.get(id);
    if (node) node.bootOrder = i;
  });

  return { order, cycles };
}

export function getDependents(moduleId: string): string[] {
  return Array.from(graph.values()).filter(n => n.dependencies.includes(moduleId)).map(n => n.id);
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
