/**
 * Scheduled Task Runner (Cron)
 * Client-side cron scheduler for recurring substrate tasks
 * 
 * Manages GC, health checks, DREAM cycles, brain optimization,
 * and any other recurring system operations without manual intervention.
 */

export interface CronJob {
  id: string;
  name: string;
  schedule: string; // cron-like: '*/15m', '*/1h', '*/6h', '*/24h'
  handler: () => Promise<unknown>;
  enabled: boolean;
  lastRunAt: number | null;
  nextRunAt: number;
  runCount: number;
  lastResult: 'success' | 'error' | 'pending' | null;
  lastError: string | null;
  tier: 'free' | 'builder' | 'pro' | 'enterprise';
  module: string;
  tags: string[];
}

export interface CronRunResult {
  jobId: string;
  jobName: string;
  success: boolean;
  durationMs: number;
  output?: unknown;
  error?: string;
  timestamp: number;
}

export interface CronStats {
  totalJobs: number;
  enabledJobs: number;
  runningJobs: number;
  totalRuns: number;
  successRate: number;
  lastRunAt: number | null;
  nextRunAt: number | null;
}

type CronInterval = '*/1m' | '*/5m' | '*/15m' | '*/30m' | '*/1h' | '*/6h' | '*/12h' | '*/24h';

const INTERVAL_MS: Record<CronInterval, number> = {
  '*/1m': 60_000,
  '*/5m': 300_000,
  '*/15m': 900_000,
  '*/30m': 1_800_000,
  '*/1h': 3_600_000,
  '*/6h': 21_600_000,
  '*/12h': 43_200_000,
  '*/24h': 86_400_000,
};

function parseInterval(schedule: string): number {
  return INTERVAL_MS[schedule as CronInterval] || 900_000; // default 15m
}

class CronRunner {
  private static instance: CronRunner;
  private jobs = new Map<string, CronJob>();
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private runHistory: CronRunResult[] = [];
  private running = new Set<string>();
  private started = false;

  private constructor() {}

  static getInstance(): CronRunner {
    if (!CronRunner.instance) {
      CronRunner.instance = new CronRunner();
    }
    return CronRunner.instance;
  }

  /** Register a recurring job */
  register(config: {
    id: string;
    name: string;
    schedule: CronInterval | string;
    handler: () => Promise<unknown>;
    module: string;
    tier?: 'free' | 'builder' | 'pro' | 'enterprise';
    tags?: string[];
    enabled?: boolean;
  }): CronJob {
    const intervalMs = parseInterval(config.schedule);
    const job: CronJob = {
      id: config.id,
      name: config.name,
      schedule: config.schedule,
      handler: config.handler,
      enabled: config.enabled ?? true,
      lastRunAt: null,
      nextRunAt: Date.now() + intervalMs,
      runCount: 0,
      lastResult: null,
      lastError: null,
      tier: config.tier || 'free',
      module: config.module,
      tags: config.tags || [],
    };

    this.jobs.set(config.id, job);
    
    if (this.started && job.enabled) {
      this.scheduleJob(job);
    }

    return job;
  }

  /** Start the cron runner — begins executing all enabled jobs */
  start(): void {
    if (this.started) return;
    this.started = true;

    for (const job of this.jobs.values()) {
      if (job.enabled) {
        this.scheduleJob(job);
      }
    }
  }

  /** Stop all scheduled jobs */
  stop(): void {
    this.started = false;
    for (const [id, timer] of this.timers) {
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  /** Enable a job */
  enable(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.enabled = true;
    if (this.started) this.scheduleJob(job);
    return true;
  }

  /** Disable a job */
  disable(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.enabled = false;
    const timer = this.timers.get(jobId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(jobId);
    }
    return true;
  }

  /** Manually trigger a job now */
  async trigger(jobId: string): Promise<CronRunResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return { jobId, jobName: 'unknown', success: false, durationMs: 0, error: 'Job not found', timestamp: Date.now() };
    }
    return this.executeJob(job);
  }

  /** Get all registered jobs */
  list(): CronJob[] {
    return Array.from(this.jobs.values());
  }

  /** Get a specific job */
  get(jobId: string): CronJob | undefined {
    return this.jobs.get(jobId);
  }

  /** Remove a job */
  remove(jobId: string): boolean {
    this.disable(jobId);
    return this.jobs.delete(jobId);
  }

  /** Get run history */
  history(limit = 50): CronRunResult[] {
    return this.runHistory.slice(-limit);
  }

  /** Get cron stats */
  stats(): CronStats {
    const jobs = Array.from(this.jobs.values());
    const successRuns = this.runHistory.filter(r => r.success).length;
    
    return {
      totalJobs: jobs.length,
      enabledJobs: jobs.filter(j => j.enabled).length,
      runningJobs: this.running.size,
      totalRuns: this.runHistory.length,
      successRate: this.runHistory.length > 0 ? (successRuns / this.runHistory.length) * 100 : 100,
      lastRunAt: jobs.reduce((max, j) => Math.max(max, j.lastRunAt || 0), 0) || null,
      nextRunAt: jobs
        .filter(j => j.enabled)
        .reduce((min, j) => Math.min(min, j.nextRunAt), Infinity) || null,
    };
  }

  /** Check if runner is active */
  isRunning(): boolean {
    return this.started;
  }

  private scheduleJob(job: CronJob): void {
    // Clear existing timer
    const existing = this.timers.get(job.id);
    if (existing) clearInterval(existing);

    const intervalMs = parseInterval(job.schedule);
    
    const timer = setInterval(() => {
      if (job.enabled && !this.running.has(job.id)) {
        this.executeJob(job);
      }
    }, intervalMs);

    this.timers.set(job.id, timer);
  }

  private async executeJob(job: CronJob): Promise<CronRunResult> {
    if (this.running.has(job.id)) {
      return { jobId: job.id, jobName: job.name, success: false, durationMs: 0, error: 'Already running', timestamp: Date.now() };
    }

    this.running.add(job.id);
    const start = Date.now();

    try {
      const output = await job.handler();
      const durationMs = Date.now() - start;
      
      job.lastRunAt = Date.now();
      job.nextRunAt = Date.now() + parseInterval(job.schedule);
      job.runCount++;
      job.lastResult = 'success';
      job.lastError = null;

      const result: CronRunResult = { jobId: job.id, jobName: job.name, success: true, durationMs, output, timestamp: Date.now() };
      this.runHistory.push(result);
      if (this.runHistory.length > 200) this.runHistory.shift();
      
      return result;
    } catch (err) {
      const durationMs = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : String(err);
      
      job.lastRunAt = Date.now();
      job.nextRunAt = Date.now() + parseInterval(job.schedule);
      job.runCount++;
      job.lastResult = 'error';
      job.lastError = errorMsg;

      const result: CronRunResult = { jobId: job.id, jobName: job.name, success: false, durationMs, error: errorMsg, timestamp: Date.now() };
      this.runHistory.push(result);
      if (this.runHistory.length > 200) this.runHistory.shift();
      
      return result;
    } finally {
      this.running.delete(job.id);
    }
  }
}

export const cronRunner = CronRunner.getInstance();

/** Register default substrate cron jobs */
export function registerDefaultCronJobs(): void {
  // Memory GC — every 6 hours
  cronRunner.register({
    id: 'memory-gc',
    name: 'Memory Garbage Collection',
    schedule: '*/6h',
    module: 'brain',
    tier: 'free',
    tags: ['maintenance', 'memory'],
    handler: async () => {
      const { substrate } = await import('@/lib/substrate');
      const result = await substrate.invoke({ module: 'brain', action: 'optimize', payload: { mode: 'standard' } });
      return result.data || { cleaned: 0 };
    },
  });

  // Health check — every 15 minutes
  cronRunner.register({
    id: 'health-check',
    name: 'System Health Check',
    schedule: '*/15m',
    module: 'vision',
    tier: 'free',
    tags: ['health', 'monitoring'],
    handler: async () => {
      const { substrate } = await import('@/lib/substrate');
      const result = await substrate.invoke({ module: 'vision', action: 'pulse' });
      return result.data;
    },
  });

  // Dream cycle — every 24 hours
  cronRunner.register({
    id: 'dream-cycle',
    name: 'Dream Processing Cycle',
    schedule: '*/24h',
    module: 'dream',
    tier: 'builder',
    tags: ['cognitive', 'dream'],
    handler: async () => {
      const { substrate } = await import('@/lib/substrate');
      const result = await substrate.invoke({ module: 'dream', action: 'cycle' });
      return result.data;
    },
  });

  // Brain optimization — every 12 hours
  cronRunner.register({
    id: 'brain-optimize',
    name: 'Brain Memory Optimization',
    schedule: '*/12h',
    module: 'brain',
    tier: 'builder',
    tags: ['cognitive', 'optimization'],
    handler: async () => {
      const { substrate } = await import('@/lib/substrate');
      const result = await substrate.invoke({ module: 'brain', action: 'optimize' });
      return result.data;
    },
  });

  // Rate limit cleanup — every 1 hour
  cronRunner.register({
    id: 'rate-limit-cleanup',
    name: 'Rate Limit Bucket Cleanup',
    schedule: '*/1h',
    module: 'defense',
    tier: 'free',
    tags: ['maintenance', 'security'],
    handler: async () => {
      const { persistentRateLimiter } = await import('@/lib/substrate/persistent-rate-limit');
      return persistentRateLimiter.cleanup();
    },
  });

  // Capability analytics flush — every 30 minutes
  cronRunner.register({
    id: 'analytics-flush',
    name: 'Capability Analytics Flush',
    schedule: '*/30m',
    module: 'system',
    tier: 'pro',
    tags: ['analytics', 'telemetry'],
    handler: async () => {
      const { capabilityAnalytics } = await import('@/lib/substrate/capability-analytics');
      return capabilityAnalytics.flush();
    },
  });
}
