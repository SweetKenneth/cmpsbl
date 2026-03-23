/**
 * CORTEX — Cascade Failure Predictor
 * Analyzes dependency chains for risk scoring, triggers rerouting at >80%.
 */

export interface NodeHealthSnapshot {
  nodeId: string;
  healthScore: number;       // 0-100
  errorRate: number;          // 0-1
  latencyMs: number;
  circuitState: 'closed' | 'open' | 'half-open';
  backpressure: number;      // 0-1
  lastUpdated: string;
}

export interface CascadeRiskResult {
  pipelineId: string;
  overallRisk: number;        // 0-100
  criticalPathRisk: number;
  shouldReroute: boolean;
  shouldShedLoad: boolean;
  riskNodes: CascadeRiskNode[];
  recommendation: string;
  assessedAt: string;
}

export interface CascadeRiskNode {
  nodeId: string;
  riskScore: number;
  chainDepth: number;
  dependentCount: number;
  factors: string[];
}

const REROUTE_THRESHOLD = 80;
const SHED_THRESHOLD = 90;

export function assessCascadeRisk(
  pipelineId: string,
  dependencyChain: string[][],
  healthSnapshots: Map<string, NodeHealthSnapshot>
): CascadeRiskResult {
  const riskNodes: CascadeRiskNode[] = [];
  let maxRisk = 0;
  let criticalPathRisk = 0;

  for (let depth = 0; depth < dependencyChain.length; depth++) {
    const group = dependencyChain[depth];
    const depthFactor = 1 + depth * 0.15; // deeper = more dangerous

    for (const nodeId of group) {
      const health = healthSnapshots.get(nodeId);
      if (!health) continue;

      const factors: string[] = [];
      let nodeRisk = 0;

      // Circuit state risk
      if (health.circuitState === 'open') {
        nodeRisk += 40;
        factors.push('Circuit OPEN');
      } else if (health.circuitState === 'half-open') {
        nodeRisk += 20;
        factors.push('Circuit HALF-OPEN');
      }

      // Error rate risk
      if (health.errorRate > 0.5) {
        nodeRisk += 30;
        factors.push(`High error rate: ${(health.errorRate * 100).toFixed(0)}%`);
      } else if (health.errorRate > 0.2) {
        nodeRisk += 15;
        factors.push(`Elevated error rate: ${(health.errorRate * 100).toFixed(0)}%`);
      }

      // Backpressure risk
      if (health.backpressure > 0.8) {
        nodeRisk += 20;
        factors.push(`Severe backpressure: ${(health.backpressure * 100).toFixed(0)}%`);
      } else if (health.backpressure > 0.5) {
        nodeRisk += 10;
        factors.push(`Backpressure: ${(health.backpressure * 100).toFixed(0)}%`);
      }

      // Latency risk
      if (health.latencyMs > 5000) {
        nodeRisk += 15;
        factors.push(`High latency: ${health.latencyMs}ms`);
      }

      // Health score inversion
      if (health.healthScore < 30) {
        nodeRisk += 20;
        factors.push(`Low health: ${health.healthScore}`);
      }

      // Apply depth factor
      const adjustedRisk = Math.min(100, Math.round(nodeRisk * depthFactor));
      const dependentCount = dependencyChain.slice(depth + 1)
        .reduce((c, g) => c + g.length, 0);

      riskNodes.push({
        nodeId,
        riskScore: adjustedRisk,
        chainDepth: depth,
        dependentCount,
        factors,
      });

      if (adjustedRisk > maxRisk) maxRisk = adjustedRisk;
      if (depth === dependencyChain.length - 1) {
        criticalPathRisk = Math.max(criticalPathRisk, adjustedRisk);
      }
    }
  }

  const overallRisk = Math.round(
    riskNodes.reduce((sum, n) => sum + n.riskScore * (1 + n.dependentCount * 0.1), 0) /
    Math.max(1, riskNodes.length)
  );

  const shouldReroute = overallRisk >= REROUTE_THRESHOLD;
  const shouldShedLoad = overallRisk >= SHED_THRESHOLD;

  let recommendation = 'Pipeline healthy — proceed normally';
  if (shouldShedLoad) {
    recommendation = 'CRITICAL: Shed non-essential load immediately, reroute critical tasks';
  } else if (shouldReroute) {
    recommendation = 'WARNING: Reroute to alternate paths, monitor closely';
  } else if (overallRisk > 50) {
    recommendation = 'CAUTION: Elevated risk, prepare fallback routes';
  }

  return {
    pipelineId,
    overallRisk: Math.min(100, overallRisk),
    criticalPathRisk,
    shouldReroute,
    shouldShedLoad,
    riskNodes: riskNodes.sort((a, b) => b.riskScore - a.riskScore),
    recommendation,
    assessedAt: new Date().toISOString(),
  };
}
