/**
 * S-Tier 127 — Value-Weighted Reasoning Router
 * ID: S-CJ85 | CJPI: 87 | Module: NEXUS
 * 
 * Routes reasoning tasks based on value-weighted cost analysis.
 */

export interface ReasoningTask {
  id: string;
  complexity: number; // 0-1
  valuePotential: number; // expected value in units
  urgency: number; // 0-1
  requiredCapabilities: string[];
}

export interface ReasoningProvider {
  id: string;
  name: string;
  costPerToken: number;
  qualityScore: number;
  capabilities: string[];
  maxTokens: number;
  available: boolean;
}

export interface RoutingDecision {
  taskId: string;
  providerId: string;
  estimatedCost: number;
  expectedValue: number;
  roi: number;
  reasoning: string;
}

export class ValueWeightedReasoningRouter {
  private providers: ReasoningProvider[] = [];

  registerProvider(provider: ReasoningProvider): void {
    this.providers.push(provider);
  }

  route(task: ReasoningTask): RoutingDecision | null {
    const eligible = this.providers.filter(p => {
      if (!p.available) return false;
      return task.requiredCapabilities.every(c => p.capabilities.includes(c));
    });

    if (eligible.length === 0) return null;

    // Score each provider by ROI
    const scored = eligible.map(p => {
      const estimatedTokens = Math.ceil(task.complexity * p.maxTokens * 0.5);
      const estimatedCost = estimatedTokens * p.costPerToken;
      const expectedQualityMultiplier = p.qualityScore * (1 + task.complexity * 0.5);
      const expectedValue = task.valuePotential * expectedQualityMultiplier;
      const roi = estimatedCost > 0 ? (expectedValue - estimatedCost) / estimatedCost : expectedValue;

      return { provider: p, estimatedCost, expectedValue, roi, estimatedTokens };
    });

    // For urgent tasks, weight quality higher; for normal, weight ROI higher
    scored.sort((a, b) => {
      if (task.urgency > 0.8) {
        return b.provider.qualityScore - a.provider.qualityScore;
      }
      return b.roi - a.roi;
    });

    const best = scored[0];
    return {
      taskId: task.id,
      providerId: best.provider.id,
      estimatedCost: best.estimatedCost,
      expectedValue: best.expectedValue,
      roi: best.roi,
      reasoning: task.urgency > 0.8
        ? `Urgent: selected ${best.provider.name} for quality (${best.provider.qualityScore})`
        : `ROI-optimized: ${best.provider.name} with ROI ${best.roi.toFixed(2)}`,
    };
  }
}
