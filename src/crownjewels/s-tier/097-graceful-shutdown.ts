/**
 * S-Tier 097 — Graceful Shutdown Coordinator
 * ID: S-116 | CJPI: 90 | Module: SYSTEM
 * 
 * Coordinated shutdown across all nodes with drain, persist, and verify phases.
 */

export type ShutdownPhase = 'initiated' | 'draining' | 'persisting' | 'verifying' | 'terminated' | 'aborted';

export interface ShutdownTask {
  id: string;
  name: string;
  phase: 'drain' | 'persist' | 'verify';
  priority: number;
  timeoutMs: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  error?: string;
  durationMs?: number;
}

export interface ShutdownPlan {
  tasks: ShutdownTask[];
  maxShutdownMs: number;
  currentPhase: ShutdownPhase;
  startedAt: string | null;
  completedAt: string | null;
}

export class GracefulShutdownCoordinator {
  private tasks: ShutdownTask[] = [];
  private currentPhase: ShutdownPhase = 'initiated';
  private startedAt: string | null = null;
  private maxShutdownMs: number;

  constructor(maxShutdownMs = 30000) {
    this.maxShutdownMs = maxShutdownMs;
  }

  registerTask(task: Omit<ShutdownTask, 'status'>): void {
    this.tasks.push({ ...task, status: 'pending' });
  }

  getPlan(): ShutdownPlan {
    return {
      tasks: [...this.tasks].sort((a, b) => a.priority - b.priority),
      maxShutdownMs: this.maxShutdownMs,
      currentPhase: this.currentPhase,
      startedAt: this.startedAt,
      completedAt: this.currentPhase === 'terminated' ? new Date().toISOString() : null,
    };
  }

  executePhase(phase: 'drain' | 'persist' | 'verify'): ShutdownTask[] {
    const phaseTasks = this.tasks
      .filter(t => t.phase === phase && t.status === 'pending')
      .sort((a, b) => a.priority - b.priority);

    this.currentPhase = phase === 'drain' ? 'draining' : phase === 'persist' ? 'persisting' : 'verifying';

    for (const task of phaseTasks) {
      task.status = 'running';
      const start = Date.now();
      try {
        // Simulate execution
        task.status = 'completed';
        task.durationMs = Date.now() - start;
      } catch (err) {
        task.status = 'failed';
        task.error = err instanceof Error ? err.message : String(err);
        task.durationMs = Date.now() - start;
      }
    }

    return phaseTasks;
  }

  initiateShutdown(): ShutdownPlan {
    this.startedAt = new Date().toISOString();
    this.currentPhase = 'initiated';

    this.executePhase('drain');
    this.executePhase('persist');
    this.executePhase('verify');

    const allCompleted = this.tasks.every(t => t.status === 'completed' || t.status === 'skipped');
    this.currentPhase = allCompleted ? 'terminated' : 'aborted';

    return this.getPlan();
  }

  abort(): void {
    this.currentPhase = 'aborted';
    this.tasks.filter(t => t.status === 'pending' || t.status === 'running')
      .forEach(t => { t.status = 'skipped'; });
  }
}
