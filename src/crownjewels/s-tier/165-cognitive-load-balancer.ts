/**
 * S-Tier 165 — Cognitive Load Balancer
 * ID: S-CJ123 | CJPI: 85 | Module: CORTEX
 * Balances cognitive load across processing pipelines.
 */

export interface CognitivePipeline {
  id: string;
  name: string;
  capacity: number;
  currentLoad: number;
  latencyMs: number;
  errorRate: number;
}

export class CognitiveLoadBalancer {
  private pipelines: Map<string, CognitivePipeline> = new Map();

  register(pipeline: CognitivePipeline): void { this.pipelines.set(pipeline.id, pipeline); }

  route(taskWeight: number): string | null {
    const available = [...this.pipelines.values()]
      .filter(p => p.currentLoad + taskWeight <= p.capacity)
      .sort((a, b) => {
        const scoreA = (1 - a.currentLoad / a.capacity) * (1 - a.errorRate) * (1000 / (a.latencyMs + 1));
        const scoreB = (1 - b.currentLoad / b.capacity) * (1 - b.errorRate) * (1000 / (b.latencyMs + 1));
        return scoreB - scoreA;
      });
    if (available.length === 0) return null;
    available[0].currentLoad += taskWeight;
    return available[0].id;
  }

  release(pipelineId: string, weight: number): void {
    const p = this.pipelines.get(pipelineId);
    if (p) p.currentLoad = Math.max(0, p.currentLoad - weight);
  }

  getLoadDistribution(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [id, p] of this.pipelines) result[id] = p.currentLoad / p.capacity;
    return result;
  }
}
