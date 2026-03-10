/**
 * S-Tier 175 — Goal Decomposition Engine
 * ID: S-CJ133 | CJPI: 85 | Module: CORTEX
 * Decomposes high-level goals into actionable sub-tasks.
 */

export interface Goal {
  id: string;
  description: string;
  parentId?: string;
  subGoals: string[];
  status: 'pending' | 'active' | 'complete' | 'blocked';
  progress: number;
}

export class GoalDecompositionEngine {
  private goals: Map<string, Goal> = new Map();

  addGoal(description: string, parentId?: string): Goal {
    const goal: Goal = {
      id: crypto.randomUUID(), description, parentId,
      subGoals: [], status: 'pending', progress: 0,
    };
    this.goals.set(goal.id, goal);
    if (parentId) {
      const parent = this.goals.get(parentId);
      if (parent) parent.subGoals.push(goal.id);
    }
    return goal;
  }

  decompose(goalId: string, subDescriptions: string[]): Goal[] {
    const subs = subDescriptions.map(d => this.addGoal(d, goalId));
    return subs;
  }

  complete(goalId: string): void {
    const goal = this.goals.get(goalId);
    if (!goal) return;
    goal.status = 'complete';
    goal.progress = 1;
    if (goal.parentId) this.updateParentProgress(goal.parentId);
  }

  private updateParentProgress(parentId: string): void {
    const parent = this.goals.get(parentId);
    if (!parent || parent.subGoals.length === 0) return;
    const subs = parent.subGoals.map(id => this.goals.get(id)).filter(Boolean) as Goal[];
    parent.progress = subs.reduce((s, g) => s + g.progress, 0) / subs.length;
    if (parent.progress >= 1) parent.status = 'complete';
    if (parent.parentId) this.updateParentProgress(parent.parentId);
  }

  getTree(rootId: string): Goal | null { return this.goals.get(rootId) ?? null; }
  getRoots(): Goal[] { return [...this.goals.values()].filter(g => !g.parentId); }
}
