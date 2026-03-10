/**
 * S-Tier 051 — Goal Tracking Engine
 * CJPI: 93 | Node: INTENT | ID: S-127
 *
 * Tracks multi-step user goals with progress milestones.
 * Integrates with INTENT disambiguation to map conversations to goals.
 */

export interface Goal {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'abandoned';
  milestones: Milestone[];
  createdAt: number;
  completedAt: number | null;
  progress: number; // 0-100
}

export interface Milestone {
  id: string;
  label: string;
  completed: boolean;
  completedAt: number | null;
}

const goals = new Map<string, Goal>();
let goalSeq = 0;
let msSeq = 0;

export function createGoal(title: string, milestoneLabels: string[] = []): Goal {
  const goal: Goal = {
    id: `goal-${++goalSeq}`,
    title,
    status: 'active',
    milestones: milestoneLabels.map(label => ({
      id: `ms-${++msSeq}`,
      label,
      completed: false,
      completedAt: null,
    })),
    createdAt: Date.now(),
    completedAt: null,
    progress: 0,
  };
  goals.set(goal.id, goal);
  return goal;
}

export function completeMilestone(goalId: string, milestoneId: string): Goal {
  const goal = goals.get(goalId);
  if (!goal) throw new Error(`Goal ${goalId} not found`);
  const ms = goal.milestones.find(m => m.id === milestoneId);
  if (!ms) throw new Error(`Milestone ${milestoneId} not found`);
  ms.completed = true;
  ms.completedAt = Date.now();

  const completed = goal.milestones.filter(m => m.completed).length;
  goal.progress = goal.milestones.length > 0 ? Math.round((completed / goal.milestones.length) * 100) : 100;

  if (goal.progress === 100) {
    goal.status = 'completed';
    goal.completedAt = Date.now();
  }
  return goal;
}

export function abandonGoal(goalId: string): void {
  const goal = goals.get(goalId);
  if (goal) goal.status = 'abandoned';
}

export function getGoal(goalId: string): Goal | null {
  return goals.get(goalId) ?? null;
}

export function listGoals(status?: Goal['status']): Goal[] {
  const all = [...goals.values()];
  return status ? all.filter(g => g.status === status) : all;
}
