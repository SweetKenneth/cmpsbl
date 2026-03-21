/**
 * CORTEX Bottleneck Analysis — Pipeline Stage Performance Analysis
 * Identifies throughput bottlenecks, queue depth anomalies, and capacity saturation.
 * Aligned with CORTEX Node Deep Dive documentation.
 */

import { getSchedulerStats, getQueueState } from './pipelineScheduler';
import type { SubstrateModule } from '../substrate';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StageMetrics {
  stageId: string;
  module: SubstrateModule | string;
  throughput: number;        // tasks/sec
  queueDepth: number;        // pending tasks
  avgLatencyMs: number;      // average processing latency
  utilization: number;       // throughput / capacity (0-1)
  capacity: number;          // max tasks/sec
}

export interface BottleneckReport {
  timestamp: number;
  stages: StageMetrics[];
  bottleneck: StageMetrics | null;
  recommendation: string;
  overallUtilization: number;
  criticalPath: string[];
}

// ─── Stage Tracking ───────────────────────────────────────────────────────────

interface StageRecord {
  stageId: string;
  module: string;
  completions: number[];   // timestamps of completions (ring buffer)
  latencies: number[];     // recent latency samples
  pending: number;
  capacity: number;        // configured max throughput
}

const stages = new Map<string, StageRecord>();
const MAX_SAMPLES = 100;
const THROUGHPUT_WINDOW_MS = 60_000; // 1-minute throughput window

export function registerStage(stageId: string, module: string, capacity: number = 10): void {
  if (!stages.has(stageId)) {
    stages.set(stageId, {
      stageId,
      module,
      completions: [],
      latencies: [],
      pending: 0,
      capacity: Math.max(capacity, 1),
    });
  }
}

export function recordStageCompletion(stageId: string, latencyMs: number): void {
  const stage = stages.get(stageId);
  if (!stage) return;

  stage.completions.push(Date.now());
  if (stage.completions.length > MAX_SAMPLES) stage.completions.shift();

  stage.latencies.push(latencyMs);
  if (stage.latencies.length > MAX_SAMPLES) stage.latencies.shift();

  stage.pending = Math.max(0, stage.pending - 1);
}

export function recordStageEnqueue(stageId: string): void {
  const stage = stages.get(stageId);
  if (stage) stage.pending++;
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

function computeStageMetrics(stage: StageRecord): StageMetrics {
  const now = Date.now();
  const recentCompletions = stage.completions.filter(t => now - t < THROUGHPUT_WINDOW_MS);
  const throughput = recentCompletions.length / (THROUGHPUT_WINDOW_MS / 1000);

  const recentLatencies = stage.latencies.slice(-20);
  const avgLatencyMs = recentLatencies.length > 0
    ? recentLatencies.reduce((s, l) => s + l, 0) / recentLatencies.length
    : 0;

  const utilization = Math.min(throughput / stage.capacity, 1.0);

  return {
    stageId: stage.stageId,
    module: stage.module as SubstrateModule,
    throughput: Math.round(throughput * 100) / 100,
    queueDepth: stage.pending,
    avgLatencyMs: Math.round(avgLatencyMs),
    utilization: Math.round(utilization * 1000) / 1000,
    capacity: stage.capacity,
  };
}

/**
 * Run bottleneck analysis across all registered pipeline stages.
 * Bottleneck = highest utilization AND highest queue depth.
 */
export function analyzeBottlenecks(): BottleneckReport {
  const stageMetrics: StageMetrics[] = [];

  for (const stage of stages.values()) {
    stageMetrics.push(computeStageMetrics(stage));
  }

  // Also factor in pipeline scheduler state
  const schedulerStats = getSchedulerStats();
  const queueState = getQueueState();

  // Score each stage: utilization * 0.6 + normalized queue depth * 0.4
  let maxScore = 0;
  let bottleneck: StageMetrics | null = null;
  const maxQueueDepth = Math.max(1, ...stageMetrics.map(s => s.queueDepth));

  for (const metrics of stageMetrics) {
    const score = metrics.utilization * 0.6 + (metrics.queueDepth / maxQueueDepth) * 0.4;
    if (score > maxScore) {
      maxScore = score;
      bottleneck = metrics;
    }
  }

  // Generate recommendation
  let recommendation = 'All stages operating within capacity.';
  if (bottleneck) {
    if (bottleneck.utilization > 0.9) {
      recommendation = `Stage "${bottleneck.stageId}" (${bottleneck.module}) is at ${(bottleneck.utilization * 100).toFixed(0)}% utilization. Scale capacity or reduce input rate.`;
    } else if (bottleneck.queueDepth > 10) {
      recommendation = `Stage "${bottleneck.stageId}" has ${bottleneck.queueDepth} pending tasks. Consider increasing throughput or bypassing non-critical steps.`;
    } else if (bottleneck.avgLatencyMs > 5000) {
      recommendation = `Stage "${bottleneck.stageId}" averaging ${bottleneck.avgLatencyMs}ms latency. Investigate module performance.`;
    }
  }

  // Derive critical path (stages sorted by latency contribution)
  const criticalPath = [...stageMetrics]
    .sort((a, b) => b.avgLatencyMs - a.avgLatencyMs)
    .map(s => s.stageId);

  const overallUtilization = stageMetrics.length > 0
    ? stageMetrics.reduce((s, m) => s + m.utilization, 0) / stageMetrics.length
    : 0;

  return {
    timestamp: Date.now(),
    stages: stageMetrics,
    bottleneck,
    recommendation,
    overallUtilization: Math.round(overallUtilization * 1000) / 1000,
    criticalPath,
  };
}

/**
 * Get per-stage metrics for a specific stage.
 */
export function getStageMetrics(stageId: string): StageMetrics | null {
  const stage = stages.get(stageId);
  if (!stage) return null;
  return computeStageMetrics(stage);
}

/**
 * List all registered stages.
 */
export function listStages(): string[] {
  return Array.from(stages.keys());
}
