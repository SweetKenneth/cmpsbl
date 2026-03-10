/**
 * S-Tier 122 — Autonomy Rollback Authority
 * ID: S-CJ80 | CJPI: 87 | Module: GOVERNANCE
 * 
 * Rollback authority for autonomous decisions that exceed safety bounds.
 */

export interface RollbackTarget {
  id: string;
  type: 'decision' | 'action' | 'mutation' | 'deployment';
  description: string;
  timestamp: string;
  stateSnapshot: Record<string, unknown>;
  reversible: boolean;
}

export interface RollbackExecution {
  id: string;
  targetId: string;
  reason: string;
  initiatedBy: 'auto' | 'governor' | 'manual';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  stateRestored: boolean;
}

export interface SafetyBound {
  metric: string;
  minValue?: number;
  maxValue?: number;
  action: 'warn' | 'rollback' | 'halt';
}

export class AutonomyRollbackAuthority {
  private targets: Map<string, RollbackTarget> = new Map();
  private executions: RollbackExecution[] = [];
  private bounds: SafetyBound[] = [];

  checkpoint(target: RollbackTarget): void {
    this.targets.set(target.id, target);
  }

  addBound(bound: SafetyBound): void {
    this.bounds.push(bound);
  }

  checkBounds(metrics: Record<string, number>): { violated: SafetyBound[]; action: 'none' | 'warn' | 'rollback' | 'halt' } {
    const violated: SafetyBound[] = [];
    for (const bound of this.bounds) {
      const value = metrics[bound.metric];
      if (value === undefined) continue;
      if (bound.minValue !== undefined && value < bound.minValue) violated.push(bound);
      if (bound.maxValue !== undefined && value > bound.maxValue) violated.push(bound);
    }
    if (violated.length === 0) return { violated: [], action: 'none' };
    const severity = violated.some(b => b.action === 'halt') ? 'halt'
      : violated.some(b => b.action === 'rollback') ? 'rollback' : 'warn';
    return { violated, action: severity };
  }

  rollback(targetId: string, reason: string, initiatedBy: RollbackExecution['initiatedBy'] = 'auto'): RollbackExecution {
    const target = this.targets.get(targetId);
    const execution: RollbackExecution = {
      id: crypto.randomUUID(),
      targetId,
      reason,
      initiatedBy,
      status: target?.reversible ? 'completed' : 'failed',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      stateRestored: !!target?.reversible,
    };
    this.executions.push(execution);
    return execution;
  }

  getHistory(): RollbackExecution[] { return [...this.executions]; }
  getCheckpoints(): RollbackTarget[] { return [...this.targets.values()]; }
}
