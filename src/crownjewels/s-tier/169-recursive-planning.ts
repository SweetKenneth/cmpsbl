/**
 * S-Tier 169 — Recursive Planning
 * ID: S-CJ127 | CJPI: 85 | Module: CORTEX
 * Recursive planning with depth-limited search and pruning.
 */

export interface PlanNode {
  id: string;
  action: string;
  cost: number;
  expectedValue: number;
  children: PlanNode[];
  depth: number;
}

export class RecursivePlanner {
  private maxDepth = 5;
  private pruneThreshold = 0.2;

  setLimits(maxDepth: number, pruneThreshold: number): void {
    this.maxDepth = maxDepth;
    this.pruneThreshold = pruneThreshold;
  }

  plan(actions: { action: string; cost: number; value: number; branches: number }[], depth = 0): PlanNode[] {
    if (depth >= this.maxDepth) return [];
    return actions
      .filter(a => a.value / Math.max(1, a.cost) > this.pruneThreshold)
      .map(a => ({
        id: crypto.randomUUID(),
        action: a.action, cost: a.cost, expectedValue: a.value,
        depth,
        children: this.plan(
          actions.map(sub => ({ ...sub, value: sub.value * 0.8 })),
          depth + 1
        ).slice(0, a.branches),
      }))
      .sort((a, b) => b.expectedValue - a.expectedValue);
  }

  findBestPath(root: PlanNode[]): string[] {
    let best: string[] = [];
    let bestValue = -Infinity;
    const dfs = (nodes: PlanNode[], path: string[], value: number) => {
      if (nodes.length === 0 && value > bestValue) { best = [...path]; bestValue = value; return; }
      for (const n of nodes) dfs(n.children, [...path, n.action], value + n.expectedValue - n.cost);
    };
    dfs(root, [], 0);
    return best;
  }
}
