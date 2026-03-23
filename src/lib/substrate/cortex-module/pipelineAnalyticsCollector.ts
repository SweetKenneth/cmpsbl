/**
 * CORTEX — Pipeline Analytics Collector
 * Per-stage execution metrics: retries, consumption, timing.
 */

export interface StageExecution {
  stageId: string;
  pipelineId: string;
  startedAt: number;
  completedAt: number;
  durationMs: number;
  status: 'success' | 'failed' | 'timeout' | 'skipped';
  retryCount: number;
  resourceConsumption: ResourceConsumption;
  error?: string;
}

export interface ResourceConsumption {
  cpuMs: number;
  memoryMb: number;
  networkCallCount: number;
  tokensUsed: number;
}

export interface PipelineAnalytics {
  pipelineId: string;
  totalExecutions: number;
  avgDurationMs: number;
  p95DurationMs: number;
  successRate: number;
  avgRetryRate: number;
  totalResourceConsumption: ResourceConsumption;
  stageBreakdown: StageAnalytics[];
  windowStart: string;
  windowEnd: string;
}

export interface StageAnalytics {
  stageId: string;
  executions: number;
  avgDurationMs: number;
  successRate: number;
  avgRetries: number;
  avgCpuMs: number;
  avgTokens: number;
}

const executionLog: StageExecution[] = [];
const MAX_LOG_SIZE = 5000;

export function recordStageExecution(execution: StageExecution): void {
  executionLog.push(execution);
  if (executionLog.length > MAX_LOG_SIZE) {
    executionLog.splice(0, executionLog.length - MAX_LOG_SIZE);
  }
}

export function getPipelineAnalytics(
  pipelineId: string,
  windowMs = 3600_000
): PipelineAnalytics {
  const cutoff = Date.now() - windowMs;
  const relevant = executionLog.filter(
    e => e.pipelineId === pipelineId && e.startedAt >= cutoff
  );

  if (relevant.length === 0) {
    return {
      pipelineId,
      totalExecutions: 0,
      avgDurationMs: 0,
      p95DurationMs: 0,
      successRate: 1,
      avgRetryRate: 0,
      totalResourceConsumption: { cpuMs: 0, memoryMb: 0, networkCallCount: 0, tokensUsed: 0 },
      stageBreakdown: [],
      windowStart: new Date(cutoff).toISOString(),
      windowEnd: new Date().toISOString(),
    };
  }

  const durations = relevant.map(e => e.durationMs).sort((a, b) => a - b);
  const successes = relevant.filter(e => e.status === 'success').length;

  const totalRes: ResourceConsumption = {
    cpuMs: relevant.reduce((s, e) => s + e.resourceConsumption.cpuMs, 0),
    memoryMb: relevant.reduce((s, e) => s + e.resourceConsumption.memoryMb, 0),
    networkCallCount: relevant.reduce((s, e) => s + e.resourceConsumption.networkCallCount, 0),
    tokensUsed: relevant.reduce((s, e) => s + e.resourceConsumption.tokensUsed, 0),
  };

  // Stage breakdown
  const stageMap = new Map<string, StageExecution[]>();
  for (const e of relevant) {
    const arr = stageMap.get(e.stageId) ?? [];
    arr.push(e);
    stageMap.set(e.stageId, arr);
  }

  const stageBreakdown: StageAnalytics[] = Array.from(stageMap.entries()).map(([stageId, execs]) => ({
    stageId,
    executions: execs.length,
    avgDurationMs: Math.round(execs.reduce((s, e) => s + e.durationMs, 0) / execs.length),
    successRate: execs.filter(e => e.status === 'success').length / execs.length,
    avgRetries: execs.reduce((s, e) => s + e.retryCount, 0) / execs.length,
    avgCpuMs: Math.round(execs.reduce((s, e) => s + e.resourceConsumption.cpuMs, 0) / execs.length),
    avgTokens: Math.round(execs.reduce((s, e) => s + e.resourceConsumption.tokensUsed, 0) / execs.length),
  }));

  return {
    pipelineId,
    totalExecutions: relevant.length,
    avgDurationMs: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    p95DurationMs: durations[Math.ceil(durations.length * 0.95) - 1] ?? 0,
    successRate: successes / relevant.length,
    avgRetryRate: relevant.reduce((s, e) => s + e.retryCount, 0) / relevant.length,
    totalResourceConsumption: totalRes,
    stageBreakdown,
    windowStart: new Date(cutoff).toISOString(),
    windowEnd: new Date().toISOString(),
  };
}

export function getGlobalAnalytics(windowMs = 3600_000): PipelineAnalytics[] {
  const cutoff = Date.now() - windowMs;
  const pipelineIds = new Set(
    executionLog.filter(e => e.startedAt >= cutoff).map(e => e.pipelineId)
  );
  return Array.from(pipelineIds).map(id => getPipelineAnalytics(id, windowMs));
}

export function clearAnalytics(): void {
  executionLog.length = 0;
}
