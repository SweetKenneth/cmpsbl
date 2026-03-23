/**
 * CORTEX — Bottleneck Analyzer
 * Real-time throughput/latency measurement per pipeline stage.
 */

export interface StageMetrics {
  stageId: string;
  throughput: number;         // tasks/sec
  capacity: number;           // max tasks/sec
  utilization: number;        // 0-1
  queueDepth: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  lastSampled: string;
}

export interface BottleneckReport {
  pipelineId: string;
  stages: StageMetrics[];
  bottleneck: BottleneckIdentification | null;
  recommendations: string[];
  analyzedAt: string;
}

export interface BottleneckIdentification {
  stageId: string;
  severity: 'minor' | 'moderate' | 'severe';
  score: number;              // 0-100
  factors: string[];
}

const latencyBuffers = new Map<string, number[]>();
const MAX_SAMPLES = 200;

export function recordStageLatency(stageId: string, latencyMs: number): void {
  const buffer = latencyBuffers.get(stageId) ?? [];
  buffer.push(latencyMs);
  if (buffer.length > MAX_SAMPLES) buffer.shift();
  latencyBuffers.set(stageId, buffer);
}

function percentile(sorted: number[], pct: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(sorted.length * pct) - 1;
  return sorted[Math.max(0, idx)];
}

export function analyzeBottlenecks(
  pipelineId: string,
  stages: StageMetrics[]
): BottleneckReport {
  let worstStage: BottleneckIdentification | null = null;
  let worstScore = 0;
  const recommendations: string[] = [];

  for (const stage of stages) {
    const factors: string[] = [];
    let score = 0;

    // Utilization factor (primary bottleneck signal)
    if (stage.utilization > 0.9) {
      score += 40;
      factors.push(`Near-capacity utilization: ${(stage.utilization * 100).toFixed(0)}%`);
    } else if (stage.utilization > 0.7) {
      score += 20;
      factors.push(`High utilization: ${(stage.utilization * 100).toFixed(0)}%`);
    }

    // Queue depth factor
    if (stage.queueDepth > 50) {
      score += 30;
      factors.push(`Deep queue: ${stage.queueDepth} pending`);
    } else if (stage.queueDepth > 20) {
      score += 15;
      factors.push(`Growing queue: ${stage.queueDepth} pending`);
    }

    // Latency factor
    if (stage.p95LatencyMs > 5000) {
      score += 20;
      factors.push(`High p95 latency: ${stage.p95LatencyMs}ms`);
    }

    // Error rate amplifies bottleneck
    if (stage.errorRate > 0.1) {
      score += 15;
      factors.push(`Error rate: ${(stage.errorRate * 100).toFixed(1)}%`);
    }

    if (score > worstScore) {
      worstScore = score;
      const severity = score >= 60 ? 'severe' : score >= 30 ? 'moderate' : 'minor';
      worstStage = { stageId: stage.stageId, severity, score: Math.min(100, score), factors };
    }
  }

  // Generate recommendations
  if (worstStage) {
    if (worstStage.severity === 'severe') {
      recommendations.push(`Scale capacity for stage '${worstStage.stageId}'`);
      recommendations.push(`Consider load shedding upstream of '${worstStage.stageId}'`);
    } else if (worstStage.severity === 'moderate') {
      recommendations.push(`Monitor stage '${worstStage.stageId}' — approaching capacity`);
      recommendations.push(`Prepare bypass route around '${worstStage.stageId}'`);
    }
  }

  // Check for balanced throughput
  const throughputs = stages.map(s => s.throughput).filter(t => t > 0);
  if (throughputs.length > 1) {
    const maxT = Math.max(...throughputs);
    const minT = Math.min(...throughputs);
    if (maxT > 0 && minT / maxT < 0.3) {
      recommendations.push('Throughput imbalance detected — consider rebalancing stage capacities');
    }
  }

  return {
    pipelineId,
    stages,
    bottleneck: worstStage,
    recommendations,
    analyzedAt: new Date().toISOString(),
  };
}
