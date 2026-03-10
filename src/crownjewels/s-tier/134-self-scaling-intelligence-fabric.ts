/**
 * S-Tier 134 — Self-Scaling Intelligence Fabric
 * ID: S-CJ92 | CJPI: 86 | Module: SYSTEM
 * 
 * Self-scaling compute fabric with demand prediction.
 */

export interface ScaleMetrics {
  currentLoad: number; // 0-1
  queueDepth: number;
  avgLatencyMs: number;
  activeWorkers: number;
  timestamp: string;
}

export interface ScaleDecision {
  id: string;
  direction: 'up' | 'down' | 'none';
  currentWorkers: number;
  targetWorkers: number;
  reason: string;
  predictedLoad: number;
  timestamp: string;
}

export class SelfScalingIntelligenceFabric {
  private history: ScaleMetrics[] = [];
  private minWorkers = 1;
  private maxWorkers = 100;
  private scaleUpThreshold = 0.75;
  private scaleDownThreshold = 0.3;
  private decisions: ScaleDecision[] = [];

  configure(opts: { min?: number; max?: number; upThreshold?: number; downThreshold?: number }): void {
    if (opts.min !== undefined) this.minWorkers = opts.min;
    if (opts.max !== undefined) this.maxWorkers = opts.max;
    if (opts.upThreshold !== undefined) this.scaleUpThreshold = opts.upThreshold;
    if (opts.downThreshold !== undefined) this.scaleDownThreshold = opts.downThreshold;
  }

  evaluate(metrics: ScaleMetrics): ScaleDecision {
    this.history.push(metrics);
    if (this.history.length > 60) this.history = this.history.slice(-60);

    const predictedLoad = this.predictLoad();
    let direction: ScaleDecision['direction'] = 'none';
    let targetWorkers = metrics.activeWorkers;
    let reason = 'Load within acceptable range';

    if (predictedLoad > this.scaleUpThreshold || metrics.queueDepth > metrics.activeWorkers * 10) {
      direction = 'up';
      const factor = Math.ceil(predictedLoad / this.scaleUpThreshold);
      targetWorkers = Math.min(this.maxWorkers, metrics.activeWorkers * factor);
      reason = `Predicted load ${(predictedLoad * 100).toFixed(0)}% exceeds threshold`;
    } else if (predictedLoad < this.scaleDownThreshold && metrics.queueDepth === 0) {
      direction = 'down';
      targetWorkers = Math.max(this.minWorkers, Math.ceil(metrics.activeWorkers * 0.5));
      reason = `Load ${(predictedLoad * 100).toFixed(0)}% below scale-down threshold`;
    }

    const decision: ScaleDecision = {
      id: crypto.randomUUID(), direction,
      currentWorkers: metrics.activeWorkers, targetWorkers,
      reason, predictedLoad, timestamp: new Date().toISOString(),
    };
    this.decisions.push(decision);
    return decision;
  }

  private predictLoad(): number {
    if (this.history.length < 3) return this.history[this.history.length - 1]?.currentLoad ?? 0;
    const recent = this.history.slice(-5);
    const trend = recent.slice(1).reduce((s, m, i) => s + (m.currentLoad - recent[i].currentLoad), 0) / (recent.length - 1);
    return Math.max(0, Math.min(1, recent[recent.length - 1].currentLoad + trend * 2));
  }

  getDecisions(): ScaleDecision[] { return [...this.decisions]; }
}
