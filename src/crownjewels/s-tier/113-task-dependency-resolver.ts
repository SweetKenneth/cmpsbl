/**
 * S-Tier 113 — Task Dependency Resolver
 * ID: S-94 | CJPI: 88 | Module: CORTEX
 * 
 * DAG-based task dependency resolution with parallel execution optimization.
 */

export interface TaskNode {
  id: string;
  name: string;
  dependencies: string[];
  estimatedDurationMs: number;
  status: 'pending' | 'ready' | 'running' | 'completed' | 'failed' | 'blocked';
}

export interface ExecutionPlan {
  layers: string[][]; // parallel execution layers
  criticalPath: string[];
  estimatedTotalMs: number;
  parallelism: number;
}

export class TaskDependencyResolver {
  private tasks: Map<string, TaskNode> = new Map();

  addTask(task: TaskNode): void {
    this.tasks.set(task.id, { ...task });
  }

  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (id: string, path: string[]): void => {
      if (stack.has(id)) {
        const cycleStart = path.indexOf(id);
        cycles.push(path.slice(cycleStart));
        return;
      }
      if (visited.has(id)) return;

      visited.add(id);
      stack.add(id);

      const task = this.tasks.get(id);
      if (task) {
        for (const dep of task.dependencies) {
          dfs(dep, [...path, id]);
        }
      }
      stack.delete(id);
    };

    for (const id of this.tasks.keys()) {
      dfs(id, []);
    }
    return cycles;
  }

  topologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    for (const [id, task] of this.tasks) {
      inDegree.set(id, task.dependencies.length);
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);

      for (const [id, task] of this.tasks) {
        if (task.dependencies.includes(current)) {
          inDegree.set(id, (inDegree.get(id) || 1) - 1);
          if (inDegree.get(id) === 0) queue.push(id);
        }
      }
    }

    return sorted;
  }

  buildExecutionPlan(): ExecutionPlan {
    const cycles = this.detectCycles();
    if (cycles.length > 0) throw new Error(`Circular dependencies: ${JSON.stringify(cycles)}`);

    const layers: string[][] = [];
    const completed = new Set<string>();
    const remaining = new Set(this.tasks.keys());

    while (remaining.size > 0) {
      const layer: string[] = [];
      for (const id of remaining) {
        const task = this.tasks.get(id)!;
        if (task.dependencies.every(d => completed.has(d))) {
          layer.push(id);
        }
      }

      if (layer.length === 0) break; // Safety exit

      for (const id of layer) {
        remaining.delete(id);
        completed.add(id);
      }
      layers.push(layer);
    }

    // Critical path: longest path through the DAG
    const criticalPath = this.findCriticalPath();
    const parallelism = Math.max(...layers.map(l => l.length), 1);
    const estimatedTotalMs = layers.reduce((total, layer) => {
      const layerMax = Math.max(...layer.map(id => this.tasks.get(id)?.estimatedDurationMs || 0));
      return total + layerMax;
    }, 0);

    return { layers, criticalPath, estimatedTotalMs, parallelism };
  }

  private findCriticalPath(): string[] {
    const dist = new Map<string, number>();
    const prev = new Map<string, string>();
    const sorted = this.topologicalSort();

    for (const id of sorted) dist.set(id, 0);

    for (const id of sorted) {
      const task = this.tasks.get(id)!;
      const currentDist = (dist.get(id) || 0) + task.estimatedDurationMs;

      for (const [otherId, otherTask] of this.tasks) {
        if (otherTask.dependencies.includes(id)) {
          if (currentDist > (dist.get(otherId) || 0)) {
            dist.set(otherId, currentDist);
            prev.set(otherId, id);
          }
        }
      }
    }

    // Find the end node with max distance
    let maxDist = 0;
    let endNode = sorted[0];
    for (const [id, d] of dist) {
      if (d > maxDist) { maxDist = d; endNode = id; }
    }

    // Trace back
    const path: string[] = [endNode];
    let current = endNode;
    while (prev.has(current)) {
      current = prev.get(current)!;
      path.unshift(current);
    }
    return path;
  }

  getReadyTasks(): TaskNode[] {
    const completed = new Set(
      [...this.tasks.values()].filter(t => t.status === 'completed').map(t => t.id)
    );
    return [...this.tasks.values()].filter(
      t => t.status === 'pending' && t.dependencies.every(d => completed.has(d))
    );
  }
}
