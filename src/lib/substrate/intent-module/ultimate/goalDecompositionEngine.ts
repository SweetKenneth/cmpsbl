/**
 * INTENT Ultimate — System 2: Goal Decomposition Engine (DAG)
 * 
 * Breaks complex goals into dependency-ordered Directed Acyclic Graphs.
 * Detects parallelizable sub-goals, sequential dependencies, and conditional branches.
 * 
 * @module intent/ultimate/goalDecompositionEngine
 */

// ── Types ────────────────────────────────────────────────────────

export type GoalType = 'simple' | 'compound' | 'sequential' | 'conditional';
export type ActionStatus = 'pending' | 'ready' | 'executing' | 'completed' | 'failed' | 'skipped';

export interface ActionNode {
  id: string;
  label: string;
  targetNode: string;
  resolverId: string;
  input: Record<string, unknown>;
  dependencies: string[];
  status: ActionStatus;
  conditionFn?: string; // Serialized condition for conditional branches
  estimatedDurationMs: number;
  actualDurationMs?: number;
  output?: Record<string, unknown>;
  error?: string;
}

export interface ActionPlan {
  id: string;
  goalDescription: string;
  goalType: GoalType;
  actions: ActionNode[];
  parallelSets: string[][]; // Groups of action IDs that can run concurrently
  criticalPath: string[];
  estimatedTotalMs: number;
  status: 'planning' | 'ready' | 'executing' | 'completed' | 'failed' | 'rolled_back';
  createdAt: string;
  completedAt?: string;
}

// ── State ────────────────────────────────────────────────────────

const planRegistry: Map<string, ActionPlan> = new Map();
const MAX_PLANS = 200;

// ── DAG Operations ───────────────────────────────────────────────

/** Topological sort using Kahn's algorithm */
function topologicalSort(actions: ActionNode[]): string[] {
  const inDegree: Map<string, number> = new Map();
  const adjacency: Map<string, string[]> = new Map();

  for (const a of actions) {
    inDegree.set(a.id, a.dependencies.length);
    adjacency.set(a.id, []);
  }
  for (const a of actions) {
    for (const dep of a.dependencies) {
      const list = adjacency.get(dep);
      if (list) list.push(a.id);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of (adjacency.get(current) || [])) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return sorted;
}

/** Detect parallel execution sets from dependency graph */
function detectParallelSets(actions: ActionNode[]): string[][] {
  const sorted = topologicalSort(actions);
  const levels: Map<string, number> = new Map();

  for (const id of sorted) {
    const action = actions.find(a => a.id === id)!;
    if (action.dependencies.length === 0) {
      levels.set(id, 0);
    } else {
      const maxDepLevel = Math.max(...action.dependencies.map(d => levels.get(d) ?? 0));
      levels.set(id, maxDepLevel + 1);
    }
  }

  const sets: Map<number, string[]> = new Map();
  for (const [id, level] of levels) {
    if (!sets.has(level)) sets.set(level, []);
    sets.get(level)!.push(id);
  }

  return Array.from(sets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, ids]) => ids);
}

/** Find critical path (longest path through DAG) */
function findCriticalPath(actions: ActionNode[]): string[] {
  const sorted = topologicalSort(actions);
  const dist: Map<string, number> = new Map();
  const prev: Map<string, string | null> = new Map();

  for (const id of sorted) {
    dist.set(id, 0);
    prev.set(id, null);
  }

  for (const id of sorted) {
    const action = actions.find(a => a.id === id)!;
    const currentDist = dist.get(id)! + action.estimatedDurationMs;
    const actionMap = new Map(actions.map(a => [a.id, a]));
    for (const a of actions) {
      if (a.dependencies.includes(id)) {
        if (currentDist > dist.get(a.id)!) {
          dist.set(a.id, currentDist);
          prev.set(a.id, id);
        }
      }
    }
  }

  // Find the end node with longest distance
  let maxDist = 0;
  let endNode = sorted[sorted.length - 1];
  for (const [id, d] of dist) {
    const action = actions.find(a => a.id === id)!;
    const total = d + action.estimatedDurationMs;
    if (total >= maxDist) {
      maxDist = total;
      endNode = id;
    }
  }

  // Trace back
  const path: string[] = [];
  let current: string | null = endNode;
  while (current) {
    path.unshift(current);
    current = prev.get(current) ?? null;
  }
  return path;
}

/** Determine goal type from action structure */
function classifyGoalType(actions: ActionNode[]): GoalType {
  if (actions.length <= 1) return 'simple';
  const hasConditions = actions.some(a => a.conditionFn);
  if (hasConditions) return 'conditional';
  const hasDeps = actions.some(a => a.dependencies.length > 0);
  if (!hasDeps) return 'compound'; // All independent
  return 'sequential';
}

// ── Core API ────────────────────────────────────────────────────

/** Decompose a goal into an executable action plan */
export function decomposeGoal(
  goalDescription: string,
  actions: Omit<ActionNode, 'status' | 'id'>[],
): ActionPlan {
  const actionNodes: ActionNode[] = actions.map((a, i) => ({
    ...a,
    id: a.label ? `act_${a.label.toLowerCase().replace(/\s+/g, '_')}_${i}` : `act_${i}`,
    status: 'pending' as ActionStatus,
  }));

  const parallelSets = detectParallelSets(actionNodes);
  const criticalPath = findCriticalPath(actionNodes);
  const goalType = classifyGoalType(actionNodes);

  // Estimate total time based on critical path (parallel execution)
  const estimatedTotalMs = criticalPath.reduce((sum, id) => {
    const a = actionNodes.find(n => n.id === id);
    return sum + (a?.estimatedDurationMs || 0);
  }, 0);

  const plan: ActionPlan = {
    id: crypto.randomUUID(),
    goalDescription,
    goalType,
    actions: actionNodes,
    parallelSets,
    criticalPath,
    estimatedTotalMs,
    status: 'ready',
    createdAt: new Date().toISOString(),
  };

  // Store
  planRegistry.set(plan.id, plan);
  if (planRegistry.size > MAX_PLANS) {
    const oldest = planRegistry.keys().next().value;
    if (oldest) planRegistry.delete(oldest);
  }

  return plan;
}

/** Get ready actions (all dependencies satisfied) */
export function getReadyActions(planId: string): ActionNode[] {
  const plan = planRegistry.get(planId);
  if (!plan) return [];

  return plan.actions.filter(a => {
    if (a.status !== 'pending') return false;
    return a.dependencies.every(depId => {
      const dep = plan.actions.find(n => n.id === depId);
      return dep?.status === 'completed';
    });
  });
}

/** Mark action as completed or failed */
export function completeAction(
  planId: string,
  actionId: string,
  result: { success: boolean; output?: Record<string, unknown>; error?: string; durationMs: number },
): void {
  const plan = planRegistry.get(planId);
  if (!plan) return;

  const action = plan.actions.find(a => a.id === actionId);
  if (!action) return;

  action.status = result.success ? 'completed' : 'failed';
  action.output = result.output;
  action.error = result.error;
  action.actualDurationMs = result.durationMs;

  // Update plan status
  const allCompleted = plan.actions.every(a => a.status === 'completed' || a.status === 'skipped');
  const anyFailed = plan.actions.some(a => a.status === 'failed');

  if (allCompleted) {
    plan.status = 'completed';
    plan.completedAt = new Date().toISOString();
  } else if (anyFailed) {
    // Skip actions that depend on failed actions
    for (const a of plan.actions) {
      if (a.status === 'pending') {
        const hasFailed = a.dependencies.some(d => {
          const dep = plan.actions.find(n => n.id === d);
          return dep?.status === 'failed';
        });
        if (hasFailed) a.status = 'skipped';
      }
    }
    plan.status = 'failed';
  }
}

/** Get action plan */
export function getActionPlan(planId: string): ActionPlan | undefined {
  return planRegistry.get(planId);
}

/** Get all plans */
export function getAllPlans(): ActionPlan[] {
  return Array.from(planRegistry.values());
}

/** Get decomposition health */
export function getDecompositionHealth() {
  const plans = Array.from(planRegistry.values());
  const completed = plans.filter(p => p.status === 'completed');
  const failed = plans.filter(p => p.status === 'failed');

  return {
    totalPlans: plans.length,
    completedPlans: completed.length,
    failedPlans: failed.length,
    avgActionsPerPlan: plans.length > 0
      ? Math.round(plans.reduce((s, p) => s + p.actions.length, 0) / plans.length * 10) / 10
      : 0,
    successRate: plans.length > 0
      ? Math.round((completed.length / (completed.length + failed.length || 1)) * 100)
      : 100,
  };
}

/** Reset */
export function resetDecomposition(): void {
  planRegistry.clear();
}
