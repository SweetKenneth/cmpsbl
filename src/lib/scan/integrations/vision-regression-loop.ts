/**
 * VISION Regression Detection Loop (#22)
 * Post-fix metrics gate: after a scanner fix is applied,
 * monitor VISION metrics to confirm improvement (not regression).
 */

import { detectRegression, type EvolutionDeltaPoint, type RegressionReport } from '@/lib/evolve/regression-detection';

export interface PostFixMetricsSnapshot {
  timestamp: number;
  findingId: string;
  fixId: string;
  metrics: {
    errorRate: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    memoryUsageMb: number;
    requestSuccessRate: number;
  };
}

export interface RegressionGateResult {
  findingId: string;
  fixId: string;
  passed: boolean;
  verdict: 'improved' | 'stable' | 'regressed' | 'insufficient_data';
  deltas: {
    errorRateDelta: number;
    latencyDelta: number;
    successRateDelta: number;
  };
  regressionReport: RegressionReport | null;
  recommendation: string;
  monitoringDurationMs: number;
}

/**
 * Compare pre-fix and post-fix metrics to determine if fix was effective
 */
export function evaluateFixEffectiveness(
  preFix: PostFixMetricsSnapshot,
  postFix: PostFixMetricsSnapshot,
): RegressionGateResult {
  const duration = postFix.timestamp - preFix.timestamp;
  
  const errorRateDelta = postFix.metrics.errorRate - preFix.metrics.errorRate;
  const latencyDelta = postFix.metrics.avgLatencyMs - preFix.metrics.avgLatencyMs;
  const successRateDelta = postFix.metrics.requestSuccessRate - preFix.metrics.requestSuccessRate;

  // Build delta points for regression detection
  const deltas: EvolutionDeltaPoint[] = [
    {
      proposalId: preFix.fixId,
      timestamp: preFix.timestamp,
      healthDelta: 0,
      auditDelta: 0,
      debtDelta: 0,
      entropyDelta: 0,
    },
    {
      proposalId: postFix.fixId,
      timestamp: postFix.timestamp,
      healthDelta: -errorRateDelta * 100,   // error decrease = health increase
      auditDelta: 0,
      debtDelta: latencyDelta > 0 ? latencyDelta / 100 : 0, // latency increase = debt
      entropyDelta: Math.abs(errorRateDelta) + Math.abs(latencyDelta / 1000),
    },
  ];

  const regressionReport = detectRegression(deltas);

  // Determine verdict
  let verdict: RegressionGateResult['verdict'];
  let passed: boolean;
  let recommendation: string;

  if (errorRateDelta < -0.01 && latencyDelta <= 0) {
    verdict = 'improved';
    passed = true;
    recommendation = 'Fix confirmed effective. Error rate and latency improved.';
  } else if (Math.abs(errorRateDelta) <= 0.01 && Math.abs(latencyDelta) <= 50) {
    verdict = 'stable';
    passed = true;
    recommendation = 'Fix applied without regression. Metrics stable.';
  } else if (errorRateDelta > 0.05 || latencyDelta > 200) {
    verdict = 'regressed';
    passed = false;
    recommendation = `REGRESSION DETECTED: Error rate ${errorRateDelta > 0 ? '+' : ''}${(errorRateDelta * 100).toFixed(1)}%, latency ${latencyDelta > 0 ? '+' : ''}${latencyDelta.toFixed(0)}ms. Consider rollback.`;
  } else {
    verdict = 'stable';
    passed = true;
    recommendation = 'Marginal changes within acceptable thresholds.';
  }

  return {
    findingId: preFix.findingId,
    fixId: preFix.fixId,
    passed,
    verdict,
    deltas: { errorRateDelta, latencyDelta, successRateDelta },
    regressionReport,
    recommendation,
    monitoringDurationMs: duration,
  };
}

/**
 * Create a monitoring window that collects snapshots for regression detection
 */
export function createRegressionMonitor(
  findingId: string,
  fixId: string,
  windowMs: number = 300_000, // 5 minutes default
): {
  addSnapshot: (metrics: PostFixMetricsSnapshot['metrics']) => void;
  evaluate: () => RegressionGateResult;
  isReady: () => boolean;
} {
  const snapshots: PostFixMetricsSnapshot[] = [];
  const startTime = Date.now();

  return {
    addSnapshot(metrics) {
      snapshots.push({
        timestamp: Date.now(),
        findingId,
        fixId,
        metrics,
      });
    },

    isReady() {
      return Date.now() - startTime >= windowMs && snapshots.length >= 2;
    },

    evaluate(): RegressionGateResult {
      if (snapshots.length < 2) {
        return {
          findingId,
          fixId,
          passed: false,
          verdict: 'insufficient_data',
          deltas: { errorRateDelta: 0, latencyDelta: 0, successRateDelta: 0 },
          regressionReport: null,
          recommendation: `Need at least 2 snapshots (have ${snapshots.length}). Continue monitoring.`,
          monitoringDurationMs: Date.now() - startTime,
        };
      }

      return evaluateFixEffectiveness(snapshots[0], snapshots[snapshots.length - 1]);
    },
  };
}

/**
 * Batch evaluate multiple fixes
 */
export function batchEvaluateFixes(
  fixResults: Array<{ preFix: PostFixMetricsSnapshot; postFix: PostFixMetricsSnapshot }>,
): {
  results: RegressionGateResult[];
  passRate: number;
  regressionCount: number;
  summary: string;
} {
  const results = fixResults.map(({ preFix, postFix }) =>
    evaluateFixEffectiveness(preFix, postFix)
  );

  const passCount = results.filter(r => r.passed).length;
  const regressionCount = results.filter(r => r.verdict === 'regressed').length;
  const passRate = results.length > 0 ? passCount / results.length : 0;

  const summary = regressionCount > 0
    ? `⚠️ ${regressionCount}/${results.length} fixes caused regressions. Review before promoting.`
    : `✅ All ${results.length} fixes passed regression gate (${Math.round(passRate * 100)}% pass rate).`;

  return { results, passRate, regressionCount, summary };
}
