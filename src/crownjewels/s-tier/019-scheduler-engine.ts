/**
 * S-Tier Crown Jewel #19 — BRAIK Scheduler Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 19 | CJPI: 91 | Module: BRAIK | Type: Architecture
 *
 * Deferred execution engine with interval scheduling, cron-like
 * recurrence, retry with backoff, dead-letter queue, priority
 * ordering, concurrency control, and execution telemetry.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'dead_lettered' | 'cancelled';

export interface Job<T = unknown> {
  id: string;
  name: string;
  payload: T;
  status: JobStatus;
  priority: number;
  scheduledAt: number;
  startedAt?: number;
  completedAt?: number;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  result?: unknown;
  recurring?: { intervalMs: number; maxRuns?: number; runCount: number };
  createdAt: number;
}

export interface SchedulerConfig {
  maxConcurrency?: number;
  defaultMaxAttempts?: number;
  retryDelayMs?: number;
  retryBackoffMultiplier?: number;
  maxRetryDelayMs?: number;
  onDeadLetter?: (job: Job) => void;
}

export function createScheduler(config: SchedulerConfig = {}) {
  const {
    maxConcurrency = 5,
    defaultMaxAttempts = 3,
    retryDelayMs = 1000,
    retryBackoffMultiplier = 2,
    maxRetryDelayMs = 60_000,
    onDeadLetter,
  } = config;

  const queue: Job[] = [];
  const deadLetter: Job[] = [];
  const handlers = new Map<string, (payload: any) => Promise<unknown>>();
  let running = 0;
  let processing = false;
  let totalCompleted = 0;
  let totalFailed = 0;

  // ── Job Registration ─────────────────────────────────────────────

  function registerHandler(name: string, handler: (payload: any) => Promise<unknown>) {
    handlers.set(name, handler);
  }

  function schedule<T>(name: string, payload: T, opts?: {
    delay?: number;
    priority?: number;
    maxAttempts?: number;
    recurring?: { intervalMs: number; maxRuns?: number };
  }): Job<T> {
    const job: Job<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      payload,
      status: 'pending',
      priority: opts?.priority ?? 0,
      scheduledAt: Date.now() + (opts?.delay ?? 0),
      attempts: 0,
      maxAttempts: opts?.maxAttempts ?? defaultMaxAttempts,
      recurring: opts?.recurring ? { ...opts.recurring, runCount: 0 } : undefined,
      createdAt: Date.now(),
    };
    queue.push(job as Job);
    queue.sort((a, b) => b.priority - a.priority || a.scheduledAt - b.scheduledAt);
    return job;
  }

  function cancel(jobId: string): boolean {
    const job = queue.find(j => j.id === jobId);
    if (!job || job.status === 'running') return false;
    job.status = 'cancelled';
    return true;
  }

  // ── Processing ───────────────────────────────────────────────────

  async function tick(): Promise<number> {
    if (processing) return 0;
    processing = true;
    let processed = 0;
    const now = Date.now();

    const ready = queue.filter(j => j.status === 'pending' && j.scheduledAt <= now);
    const toRun = ready.slice(0, maxConcurrency - running);

    const executions = toRun.map(async job => {
      const handler = handlers.get(job.name);
      if (!handler) {
        job.status = 'failed';
        job.lastError = `No handler registered for '${job.name}'`;
        moveToDead(job);
        return;
      }

      job.status = 'running';
      job.startedAt = Date.now();
      job.attempts++;
      running++;

      try {
        job.result = await handler(job.payload);
        job.status = 'completed';
        job.completedAt = Date.now();
        totalCompleted++;
        processed++;

        // Handle recurring
        if (job.recurring) {
          job.recurring.runCount++;
          if (!job.recurring.maxRuns || job.recurring.runCount < job.recurring.maxRuns) {
            job.status = 'pending';
            job.scheduledAt = Date.now() + job.recurring.intervalMs;
            job.result = undefined;
            job.startedAt = undefined;
            job.completedAt = undefined;
          }
        }
      } catch (err) {
        job.lastError = err instanceof Error ? err.message : String(err);
        if (job.attempts >= job.maxAttempts) {
          job.status = 'failed';
          totalFailed++;
          moveToDead(job);
        } else {
          const delay = Math.min(
            retryDelayMs * Math.pow(retryBackoffMultiplier, job.attempts - 1),
            maxRetryDelayMs,
          );
          job.status = 'pending';
          job.scheduledAt = Date.now() + delay;
        }
      } finally {
        running--;
      }
    });

    await Promise.allSettled(executions);
    processing = false;
    return processed;
  }

  function moveToDead(job: Job) {
    const idx = queue.indexOf(job);
    if (idx >= 0) queue.splice(idx, 1);
    job.status = 'dead_lettered';
    deadLetter.push(job);
    onDeadLetter?.(job);
  }

  // ── Retry Dead Letters ───────────────────────────────────────────

  function retryDeadLetter(jobId: string): boolean {
    const idx = deadLetter.findIndex(j => j.id === jobId);
    if (idx < 0) return false;
    const job = deadLetter.splice(idx, 1)[0];
    job.status = 'pending';
    job.attempts = 0;
    job.scheduledAt = Date.now();
    job.lastError = undefined;
    queue.push(job);
    return true;
  }

  // ── Stats ────────────────────────────────────────────────────────

  function getStats() {
    return {
      pending: queue.filter(j => j.status === 'pending').length,
      running,
      completed: totalCompleted,
      failed: totalFailed,
      deadLettered: deadLetter.length,
      queueSize: queue.length,
      handlers: handlers.size,
    };
  }

  return {
    registerHandler, schedule, cancel, tick,
    retryDeadLetter, getStats,
    get queue() { return [...queue]; },
    get deadLetter() { return [...deadLetter]; },
  };
}
