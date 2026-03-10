/**
 * S-Tier 093 — Adaptive Load Balancer
 * ID: S-84 | CJPI: 90 | Module: CORTEX
 * 
 * Load balancing with adaptive weight adjustment based on real-time performance.
 */

export interface Endpoint {
  id: string;
  weight: number;
  currentLoad: number;
  maxCapacity: number;
  avgLatencyMs: number;
  errorRate: number;
  isHealthy: boolean;
}

export interface BalancerConfig {
  strategy: 'weighted_round_robin' | 'least_connections' | 'adaptive';
  healthCheckIntervalMs: number;
  weightDecayFactor: number;
  minWeight: number;
  maxWeight: number;
}

const DEFAULT_CONFIG: BalancerConfig = {
  strategy: 'adaptive',
  healthCheckIntervalMs: 5000,
  weightDecayFactor: 0.95,
  minWeight: 0.1,
  maxWeight: 10,
};

export class AdaptiveLoadBalancer {
  private endpoints: Map<string, Endpoint> = new Map();
  private config: BalancerConfig;
  private roundRobinIndex = 0;

  constructor(config: Partial<BalancerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  registerEndpoint(ep: Endpoint): void {
    this.endpoints.set(ep.id, { ...ep });
  }

  removeEndpoint(id: string): void {
    this.endpoints.delete(id);
  }

  selectEndpoint(): Endpoint | null {
    const healthy = [...this.endpoints.values()].filter(e => e.isHealthy);
    if (healthy.length === 0) return null;

    switch (this.config.strategy) {
      case 'least_connections':
        return healthy.reduce((best, ep) =>
          (ep.currentLoad / ep.maxCapacity) < (best.currentLoad / best.maxCapacity) ? ep : best
        );

      case 'adaptive': {
        // Score = weight * (1 - errorRate) * (1 - load%) / latency
        const scored = healthy.map(ep => ({
          endpoint: ep,
          score: ep.weight * (1 - ep.errorRate) *
            (1 - ep.currentLoad / ep.maxCapacity) /
            Math.max(1, ep.avgLatencyMs / 100),
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored[0]?.endpoint || null;
      }

      case 'weighted_round_robin':
      default: {
        const totalWeight = healthy.reduce((s, e) => s + e.weight, 0);
        let target = this.roundRobinIndex % totalWeight;
        this.roundRobinIndex++;
        for (const ep of healthy) {
          target -= ep.weight;
          if (target <= 0) return ep;
        }
        return healthy[0];
      }
    }
  }

  adaptWeights(): void {
    for (const [, ep] of this.endpoints) {
      const perfScore = (1 - ep.errorRate) / Math.max(1, ep.avgLatencyMs / 100);
      const newWeight = Math.max(
        this.config.minWeight,
        Math.min(this.config.maxWeight,
          ep.weight * this.config.weightDecayFactor + perfScore * (1 - this.config.weightDecayFactor)
        )
      );
      ep.weight = newWeight;
    }
  }

  getStats() {
    return [...this.endpoints.values()].map(e => ({
      id: e.id,
      weight: e.weight.toFixed(3),
      load: `${((e.currentLoad / e.maxCapacity) * 100).toFixed(1)}%`,
      healthy: e.isHealthy,
    }));
  }
}
