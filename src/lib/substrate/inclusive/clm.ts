/**
 * INCLUSIVE CLM — Continuous Learning Module
 * Monitors scan scores, regression frequency, repair effectiveness,
 * coverage gaps, and capacity utilization.
 */

export interface InclusiveCLMDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  metric?: number;
  threshold?: number;
  timestamp: number;
}

export interface InclusiveCLMReport {
  diagnostics: InclusiveCLMDiagnostic[];
  score: number;
  timestamp: number;
}

const THRESHOLDS = {
  LOW_AVG_SCORE: 70,
  CRITICAL_AVG_SCORE: 40,
  HIGH_REGRESSIONS: 3,
  LOW_COVERAGE: 30,
  SCAN_CAPACITY_WARN: 170,
  SCAN_CAPACITY_MAX: 200,
  REPAIR_FAILURE_RATE: 0.3,
  MIN_SCAN_SAMPLE: 3,
  CRITICAL_ISSUE_RATIO: 0.3,
};

interface InclusiveStateShape {
  initialized: boolean;
  scans: Array<{ score: number; issues: Array<{ severity: string }> }>;
  repairs: Array<{ fixesApplied: number; fixesFailed: number }>;
  totalScans: number;
  avgScore: number;
  coveragePercent: number;
  regressionCount: number;
}

export function runInclusiveCLM(state: InclusiveStateShape): InclusiveCLMReport {
  const diagnostics: InclusiveCLMDiagnostic[] = [];
  let deductions = 0;

  if (!state.initialized) {
    diagnostics.push({ id: 'incl-not-init', severity: 'critical', category: 'lifecycle', message: 'INCLUSIVE module not initialized', timestamp: Date.now() });
    return { diagnostics, score: 0, timestamp: Date.now() };
  }

  // 1. Average score
  if (state.totalScans >= THRESHOLDS.MIN_SCAN_SAMPLE) {
    if (state.avgScore < THRESHOLDS.CRITICAL_AVG_SCORE) {
      diagnostics.push({ id: 'incl-critical-score', severity: 'critical', category: 'quality', message: `Avg accessibility score ${state.avgScore}% critically low`, metric: state.avgScore, threshold: THRESHOLDS.CRITICAL_AVG_SCORE, timestamp: Date.now() });
      deductions += 25;
    } else if (state.avgScore < THRESHOLDS.LOW_AVG_SCORE) {
      diagnostics.push({ id: 'incl-low-score', severity: 'warning', category: 'quality', message: `Avg accessibility score ${state.avgScore}% below ${THRESHOLDS.LOW_AVG_SCORE}%`, metric: state.avgScore, threshold: THRESHOLDS.LOW_AVG_SCORE, timestamp: Date.now() });
      deductions += 12;
    }
  }

  // 2. Regressions
  if (state.regressionCount >= THRESHOLDS.HIGH_REGRESSIONS) {
    diagnostics.push({ id: 'incl-regressions', severity: 'warning', category: 'stability', message: `${state.regressionCount} score regressions detected`, metric: state.regressionCount, threshold: THRESHOLDS.HIGH_REGRESSIONS, timestamp: Date.now() });
    deductions += 10;
  }

  // 3. Coverage
  if (state.coveragePercent < THRESHOLDS.LOW_COVERAGE && state.totalScans >= THRESHOLDS.MIN_SCAN_SAMPLE) {
    diagnostics.push({ id: 'incl-low-coverage', severity: 'info', category: 'coverage', message: `Coverage at ${state.coveragePercent}% — expand scan targets`, metric: state.coveragePercent, threshold: THRESHOLDS.LOW_COVERAGE, timestamp: Date.now() });
    deductions += 5;
  }

  // 4. Repair failure rate
  const recentRepairs = state.repairs.slice(-20);
  if (recentRepairs.length >= 3) {
    const totalFixes = recentRepairs.reduce((s, r) => s + r.fixesApplied + r.fixesFailed, 0);
    const totalFailed = recentRepairs.reduce((s, r) => s + r.fixesFailed, 0);
    const failRate = totalFixes > 0 ? totalFailed / totalFixes : 0;
    if (failRate >= THRESHOLDS.REPAIR_FAILURE_RATE) {
      diagnostics.push({ id: 'incl-repair-failures', severity: 'warning', category: 'repair', message: `Repair failure rate ${(failRate * 100).toFixed(0)}%`, metric: failRate, threshold: THRESHOLDS.REPAIR_FAILURE_RATE, timestamp: Date.now() });
      deductions += 10;
    }
  }

  // 5. Critical issue ratio in recent scans
  const recentScans = state.scans.slice(-10);
  if (recentScans.length >= THRESHOLDS.MIN_SCAN_SAMPLE) {
    const allIssues = recentScans.flatMap(s => s.issues);
    const criticals = allIssues.filter(i => i.severity === 'critical').length;
    const ratio = allIssues.length > 0 ? criticals / allIssues.length : 0;
    if (ratio >= THRESHOLDS.CRITICAL_ISSUE_RATIO) {
      diagnostics.push({ id: 'incl-critical-issues', severity: 'warning', category: 'severity', message: `${(ratio * 100).toFixed(0)}% of issues are critical severity`, metric: ratio, threshold: THRESHOLDS.CRITICAL_ISSUE_RATIO, timestamp: Date.now() });
      deductions += 10;
    }
  }

  // 6. Scan capacity
  if (state.scans.length >= THRESHOLDS.SCAN_CAPACITY_WARN) {
    const severity = state.scans.length >= THRESHOLDS.SCAN_CAPACITY_MAX ? 'critical' : 'warning';
    diagnostics.push({ id: 'incl-capacity', severity, category: 'capacity', message: `Scan store at ${state.scans.length}/${THRESHOLDS.SCAN_CAPACITY_MAX}`, metric: state.scans.length, threshold: THRESHOLDS.SCAN_CAPACITY_MAX, timestamp: Date.now() });
    deductions += severity === 'critical' ? 10 : 5;
  }

  const score = Math.max(0, Math.min(100, 100 - deductions));
  return { diagnostics, score, timestamp: Date.now() };
}
