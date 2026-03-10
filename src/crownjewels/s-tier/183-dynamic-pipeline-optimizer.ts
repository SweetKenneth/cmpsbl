/**
 * S-Tier 183 — Dynamic Pipeline Optimizer
 * ID: S-CJ141 | CJPI: 85 | Module: CORTEX
 * Optimizes pipeline configurations dynamically based on workload.
 */

export interface PipelineConfig {
  id: string;
  name: string;
  stages: string[];
  parallelism: number;
  batchSize: number;
  timeout: number;
}

export interface OptimizationResult {
  pipelineId: string;
  originalConfig: { parallelism: number; batchSize: number; timeout: number };
  optimizedConfig: { parallelism: number; batchSize: number; timeout: number };
  expectedImprovement: number;
  optimizedAt: string;
}

export class DynamicPipelineOptimizer {
  private pipelines: Map<string, PipelineConfig> = new Map();
  private metrics: Map<string, { throughput: number; latency: number; errorRate: number }[]> = new Map();

  register(config: PipelineConfig): void { this.pipelines.set(config.id, config); }

  recordMetrics(pipelineId: string, throughput: number, latency: number, errorRate: number): void {
    if (!this.metrics.has(pipelineId)) this.metrics.set(pipelineId, []);
    const arr = this.metrics.get(pipelineId)!;
    arr.push({ throughput, latency, errorRate });
    if (arr.length > 50) arr.shift();
  }

  optimize(pipelineId: string): OptimizationResult | null {
    const config = this.pipelines.get(pipelineId);
    const history = this.metrics.get(pipelineId);
    if (!config || !history || history.length < 5) return null;

    const avgThroughput = history.reduce((s, m) => s + m.throughput, 0) / history.length;
    const avgLatency = history.reduce((s, m) => s + m.latency, 0) / history.length;
    const avgErrorRate = history.reduce((s, m) => s + m.errorRate, 0) / history.length;

    const original = { parallelism: config.parallelism, batchSize: config.batchSize, timeout: config.timeout };
    if (avgLatency > config.timeout * 0.8) config.parallelism = Math.min(16, config.parallelism + 1);
    if (avgErrorRate > 0.05) config.batchSize = Math.max(1, Math.floor(config.batchSize * 0.8));
    if (avgThroughput > config.batchSize * config.parallelism * 0.9) config.batchSize = Math.min(1000, config.batchSize + 10);

    return {
      pipelineId, originalConfig: original,
      optimizedConfig: { parallelism: config.parallelism, batchSize: config.batchSize, timeout: config.timeout },
      expectedImprovement: 0.1, optimizedAt: new Date().toISOString(),
    };
  }
}
