/**
 * VISION Performance-Correlated Debt (#18)
 * Cross-references live performance/error metrics from VISION
 * with scanner findings to prioritize debt that causes real user pain.
 */

import type { ComplexityReport } from '../debt/complexity-scoring';
import type { PerformanceReport } from '../debt/performance-predictor';

export interface PerformanceCorrelation {
  findingId: string;
  findingCategory: string;
  findingDescription: string;
  correlatedMetrics: {
    avgLatencyMs: number;
    p95LatencyMs: number;
    errorRate: number;
    requestsPerMinute: number;
  };
  impactScore: number; // 0-1, higher = more user pain
  targetArea: string;
  recommendation: string;
}

export interface PerformanceDebtReport {
  correlations: PerformanceCorrelation[];
  hotPaths: Array<{
    path: string;
    latencyMs: number;
    errorRate: number;
    relatedFindings: string[];
  }>;
  overallImpactScore: number;
  topOffenders: string[];
  generatedAt: string;
}

/**
 * Correlate scanner findings with VISION performance metrics
 */
export function correlatePerformanceDebt(
  visionMetrics: {
    endpoints: Array<{
      path: string;
      avgLatencyMs: number;
      p95LatencyMs: number;
      errorRate: number;
      rpm: number;
    }>;
    moduleHealth: Record<string, { status: string; errorRate: number; latencyMs: number }>;
  },
  scanFindings: Array<{
    id: string;
    category: string;
    description: string;
    affectedPaths: string[];
    severity: string;
  }>,
): PerformanceDebtReport {
  const correlations: PerformanceCorrelation[] = [];
  const pathToFindings = new Map<string, string[]>();

  for (const finding of scanFindings) {
    // Match finding's affected paths against live metrics
    for (const path of finding.affectedPaths) {
      const metric = visionMetrics.endpoints.find(e =>
        e.path === path || e.path.startsWith(path) || path.startsWith(e.path)
      );

      if (metric) {
        // Calculate impact: high latency + high traffic + errors = high impact
        const latencyFactor = Math.min(1, metric.p95LatencyMs / 5000);
        const errorFactor = Math.min(1, metric.errorRate * 10);
        const trafficFactor = Math.min(1, metric.rpm / 100);
        const impactScore = (latencyFactor * 0.4) + (errorFactor * 0.4) + (trafficFactor * 0.2);

        correlations.push({
          findingId: finding.id,
          findingCategory: finding.category,
          findingDescription: finding.description,
          correlatedMetrics: {
            avgLatencyMs: metric.avgLatencyMs,
            p95LatencyMs: metric.p95LatencyMs,
            errorRate: metric.errorRate,
            requestsPerMinute: metric.rpm,
          },
          impactScore,
          targetArea: path,
          recommendation: generateRecommendation(finding.category, metric, impactScore),
        });

        // Track paths → findings mapping
        if (!pathToFindings.has(path)) pathToFindings.set(path, []);
        pathToFindings.get(path)!.push(finding.id);
      }
    }
  }

  // Sort by impact
  correlations.sort((a, b) => b.impactScore - a.impactScore);

  // Build hot paths
  const hotPaths = visionMetrics.endpoints
    .filter(e => e.p95LatencyMs > 1000 || e.errorRate > 0.05)
    .map(e => ({
      path: e.path,
      latencyMs: e.p95LatencyMs,
      errorRate: e.errorRate,
      relatedFindings: pathToFindings.get(e.path) ?? [],
    }))
    .sort((a, b) => b.latencyMs - a.latencyMs);

  const overallImpactScore = correlations.length > 0
    ? correlations.reduce((sum, c) => sum + c.impactScore, 0) / correlations.length
    : 0;

  return {
    correlations,
    hotPaths,
    overallImpactScore,
    topOffenders: correlations.slice(0, 5).map(c => c.targetArea),
    generatedAt: new Date().toISOString(),
  };
}

function generateRecommendation(
  category: string,
  metric: { avgLatencyMs: number; errorRate: number; rpm: number },
  impact: number,
): string {
  if (impact > 0.8) {
    return `CRITICAL: This ${category} issue directly causes ${Math.round(metric.errorRate * 100)}% error rate at ${metric.rpm} RPM. Fix immediately.`;
  }
  if (impact > 0.5) {
    return `HIGH: ${category} issue contributes to ${metric.avgLatencyMs}ms avg latency. Prioritize in next sprint.`;
  }
  if (impact > 0.3) {
    return `MEDIUM: ${category} issue has measurable performance impact. Schedule for cleanup.`;
  }
  return `LOW: ${category} issue exists but has minimal observed performance impact.`;
}
