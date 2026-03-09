/**
 * HARVEST CLM — Continuous Learning Module
 * Monitors data source health, job error rates, pipeline throughput,
 * and capacity utilization for autonomous self-healing.
 */

export interface HarvestCLMDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  metric?: number;
  threshold?: number;
  timestamp: number;
}

export interface HarvestCLMReport {
  diagnostics: HarvestCLMDiagnostic[];
  score: number;
  timestamp: number;
}

const THRESHOLDS = {
  /** Error rate above this triggers warning */
  HIGH_ERROR_RATE: 15,
  /** Critical error rate */
  CRITICAL_ERROR_RATE: 40,
  /** Sources in error or rate_limited state */
  DEGRADED_SOURCE_RATIO: 0.3,
  /** Stale source — not polled in over 5 min */
  STALE_POLL_MS: 300_000,
  /** Job store nearing capacity */
  JOB_CAPACITY_WARN: 450,
  JOB_CAPACITY_MAX: 500,
  /** Source store nearing capacity */
  SOURCE_CAPACITY_WARN: 85,
  SOURCE_CAPACITY_MAX: 100,
  /** Pipeline store nearing capacity */
  PIPELINE_CAPACITY_WARN: 40,
  PIPELINE_CAPACITY_MAX: 50,
  /** Minimum jobs for meaningful error rate */
  MIN_JOB_SAMPLE: 5,
  /** Pipelines in error state */
  PIPELINE_ERROR_THRESHOLD: 1,
};

interface HarvestStateShape {
  initialized: boolean;
  sources: Array<{ id: string; status: string; lastPolledAt: number | null; errorCount: number }>;
  jobs: Array<{ status: string; durationMs: number }>;
  pipelines: Array<{ id: string; status: string; totalRuns: number }>;
  totalJobs: number;
  errorRate: number;
}

export function runHarvestCLM(state: HarvestStateShape): HarvestCLMReport {
  const diagnostics: HarvestCLMDiagnostic[] = [];
  let deductions = 0;

  if (!state.initialized) {
    diagnostics.push({ id: 'harvest-not-init', severity: 'critical', category: 'lifecycle', message: 'HARVEST module not initialized', timestamp: Date.now() });
    return { diagnostics, score: 0, timestamp: Date.now() };
  }

  // 1. Job error rate
  if (state.errorRate >= THRESHOLDS.CRITICAL_ERROR_RATE) {
    diagnostics.push({ id: 'harvest-critical-errors', severity: 'critical', category: 'reliability', message: `Job error rate at ${state.errorRate}% (critical ≥${THRESHOLDS.CRITICAL_ERROR_RATE}%)`, metric: state.errorRate, threshold: THRESHOLDS.CRITICAL_ERROR_RATE, timestamp: Date.now() });
    deductions += 25;
  } else if (state.errorRate >= THRESHOLDS.HIGH_ERROR_RATE) {
    diagnostics.push({ id: 'harvest-high-errors', severity: 'warning', category: 'reliability', message: `Job error rate at ${state.errorRate}% (warn ≥${THRESHOLDS.HIGH_ERROR_RATE}%)`, metric: state.errorRate, threshold: THRESHOLDS.HIGH_ERROR_RATE, timestamp: Date.now() });
    deductions += 12;
  }

  // 2. Degraded sources
  const degradedSources = state.sources.filter(s => s.status === 'error' || s.status === 'rate_limited' || s.status === 'exhausted');
  if (state.sources.length > 0) {
    const ratio = degradedSources.length / state.sources.length;
    if (ratio >= THRESHOLDS.DEGRADED_SOURCE_RATIO) {
      diagnostics.push({ id: 'harvest-degraded-sources', severity: 'warning', category: 'sources', message: `${degradedSources.length}/${state.sources.length} sources degraded (${(ratio * 100).toFixed(0)}%)`, metric: ratio, threshold: THRESHOLDS.DEGRADED_SOURCE_RATIO, timestamp: Date.now() });
      deductions += 15;
    }
  }

  // 3. Stale sources (active but not polled recently)
  const now = Date.now();
  const staleSources = state.sources.filter(s => s.lastPolledAt !== null && (now - s.lastPolledAt) > THRESHOLDS.STALE_POLL_MS);
  if (staleSources.length > 0) {
    diagnostics.push({ id: 'harvest-stale-sources', severity: 'info', category: 'freshness', message: `${staleSources.length} source(s) not polled in >${Math.round(THRESHOLDS.STALE_POLL_MS / 60_000)}min`, metric: staleSources.length, timestamp: Date.now() });
    deductions += Math.min(staleSources.length * 2, 10);
  }

  // 4. Pipeline errors
  const errorPipelines = state.pipelines.filter(p => p.status === 'error');
  if (errorPipelines.length >= THRESHOLDS.PIPELINE_ERROR_THRESHOLD) {
    diagnostics.push({ id: 'harvest-pipeline-errors', severity: 'warning', category: 'pipelines', message: `${errorPipelines.length} ETL pipeline(s) in error state`, metric: errorPipelines.length, timestamp: Date.now() });
    deductions += Math.min(errorPipelines.length * 5, 15);
  }

  // 5. Job capacity
  const recentJobs = state.jobs.length;
  if (recentJobs >= THRESHOLDS.JOB_CAPACITY_WARN) {
    const severity = recentJobs >= THRESHOLDS.JOB_CAPACITY_MAX ? 'critical' : 'warning';
    diagnostics.push({ id: 'harvest-job-capacity', severity, category: 'capacity', message: `Job store at ${recentJobs}/${THRESHOLDS.JOB_CAPACITY_MAX}`, metric: recentJobs, threshold: THRESHOLDS.JOB_CAPACITY_MAX, timestamp: Date.now() });
    deductions += severity === 'critical' ? 15 : 5;
  }

  // 6. Source capacity
  if (state.sources.length >= THRESHOLDS.SOURCE_CAPACITY_WARN) {
    diagnostics.push({ id: 'harvest-source-capacity', severity: 'warning', category: 'capacity', message: `Source store at ${state.sources.length}/${THRESHOLDS.SOURCE_CAPACITY_MAX}`, metric: state.sources.length, threshold: THRESHOLDS.SOURCE_CAPACITY_MAX, timestamp: Date.now() });
    deductions += 5;
  }

  // 7. Pipeline capacity
  if (state.pipelines.length >= THRESHOLDS.PIPELINE_CAPACITY_WARN) {
    diagnostics.push({ id: 'harvest-pipeline-capacity', severity: 'warning', category: 'capacity', message: `Pipeline store at ${state.pipelines.length}/${THRESHOLDS.PIPELINE_CAPACITY_MAX}`, metric: state.pipelines.length, threshold: THRESHOLDS.PIPELINE_CAPACITY_MAX, timestamp: Date.now() });
    deductions += 5;
  }

  const score = Math.max(0, Math.min(100, 100 - deductions));
  return { diagnostics, score, timestamp: Date.now() };
}
