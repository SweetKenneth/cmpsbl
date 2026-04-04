/**
 * S-Tier 201 — Progressive Migration Orchestrator
 * ID: S-MOD03 | CJPI: 92 | Module: EVOLUTION
 *
 * Orchestrates canary → rolling → full migrations with health checks,
 * automatic rollback on threshold breaches, and migration analytics.
 */

export type MigrationStatus = 'planned' | 'canary' | 'rolling' | 'complete' | 'rolled_back' | 'paused';

export interface Migration {
  id: string;
  source: string;
  target: string;
  progress: number;
  status: MigrationStatus;
  healthScore: number;
  startedAt: number | null;
  completedAt: number | null;
  rollbackReason: string | null;
  checkpoints: { progress: number; healthScore: number; timestamp: number }[];
}

export class ProgressiveMigrationOrchestrator {
  private migrations: Map<string, Migration> = new Map();
  private healthThreshold: number;
  private canaryThreshold: number;

  constructor(healthThreshold: number = 0.9, canaryThreshold: number = 0.05) {
    this.healthThreshold = healthThreshold;
    this.canaryThreshold = canaryThreshold;
  }

  plan(id: string, source: string, target: string): void {
    this.migrations.set(id, {
      id, source, target, progress: 0, status: 'planned',
      healthScore: 1, startedAt: null, completedAt: null,
      rollbackReason: null, checkpoints: [],
    });
  }

  advance(id: string, increment: number, healthScore: number = 1): { success: boolean; status: MigrationStatus; reason?: string } {
    const m = this.migrations.get(id);
    if (!m || m.status === 'complete' || m.status === 'rolled_back') {
      return { success: false, status: m?.status ?? 'planned', reason: 'Migration not advanceable' };
    }

    m.healthScore = healthScore;

    // Auto-rollback on health degradation
    if (healthScore < this.healthThreshold) {
      this.rollback(id, `Health score ${healthScore.toFixed(2)} below threshold ${this.healthThreshold}`);
      return { success: false, status: 'rolled_back', reason: m.rollbackReason ?? undefined };
    }

    if (!m.startedAt) m.startedAt = Date.now();
    m.progress = Math.min(1, m.progress + increment);

    // Stage transitions
    if (m.progress <= this.canaryThreshold) {
      m.status = 'canary';
    } else if (m.progress < 1) {
      m.status = 'rolling';
    } else {
      m.status = 'complete';
      m.completedAt = Date.now();
    }

    m.checkpoints.push({ progress: m.progress, healthScore, timestamp: Date.now() });
    if (m.checkpoints.length > 100) m.checkpoints = m.checkpoints.slice(-100);

    return { success: true, status: m.status };
  }

  pause(id: string): boolean {
    const m = this.migrations.get(id);
    if (!m || m.status === 'complete' || m.status === 'rolled_back') return false;
    m.status = 'paused';
    return true;
  }

  resume(id: string): boolean {
    const m = this.migrations.get(id);
    if (!m || m.status !== 'paused') return false;
    m.status = m.progress <= this.canaryThreshold ? 'canary' : 'rolling';
    return true;
  }

  rollback(id: string, reason: string = 'Manual rollback'): boolean {
    const m = this.migrations.get(id);
    if (!m) return false;
    m.status = 'rolled_back';
    m.progress = 0;
    m.rollbackReason = reason;
    m.completedAt = Date.now();
    return true;
  }

  getMigration(id: string): Migration | null {
    const m = this.migrations.get(id);
    return m ? { ...m, checkpoints: [...m.checkpoints] } : null;
  }

  getMigrations(statusFilter?: MigrationStatus): Migration[] {
    const all = [...this.migrations.values()];
    return (statusFilter ? all.filter(m => m.status === statusFilter) : all)
      .map(m => ({ ...m, checkpoints: [...m.checkpoints] }));
  }

  getStats(): { total: number; active: number; completed: number; rolledBack: number; avgDurationMs: number } {
    const all = [...this.migrations.values()];
    const completed = all.filter(m => m.status === 'complete');
    const avgMs = completed.length > 0
      ? completed.reduce((s, m) => s + ((m.completedAt ?? 0) - (m.startedAt ?? 0)), 0) / completed.length
      : 0;
    return {
      total: all.length,
      active: all.filter(m => ['canary', 'rolling', 'paused'].includes(m.status)).length,
      completed: completed.length,
      rolledBack: all.filter(m => m.status === 'rolled_back').length,
      avgDurationMs: avgMs,
    };
  }

  reset(): void {
    this.migrations.clear();
  }
}
