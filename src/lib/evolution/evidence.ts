/**
 * Evolution Evidence Bundle — Required for every proposal
 */

export interface EvidenceBundle {
  tests: TestEvidence;
  diff_stats: DiffStats;
  telemetry_deltas: TelemetryDelta[];
  security_scan: SecurityScanResult;
  rollback_plan_id: string;
  impacted_surface: string[];
}

export interface TestEvidence {
  total_tests: number;
  passed: number;
  failed: number;
  coverage_pct: number;
  new_tests_added: number;
}

export interface DiffStats {
  files_changed: number;
  lines_added: number;
  lines_removed: number;
  new_code_paths: number;
}

export interface TelemetryDelta {
  metric: string;
  before: number;
  after: number;
  delta_pct: number;
}

export interface SecurityScanResult {
  passed: boolean;
  vulnerabilities_found: number;
  severity_high: number;
  severity_medium: number;
  severity_low: number;
  scan_timestamp: string;
}

/** Validate that an evidence bundle meets minimum requirements */
export function validateEvidenceBundle(bundle: EvidenceBundle): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!bundle.rollback_plan_id) errors.push('Missing rollback plan');
  if (bundle.tests.total_tests === 0) errors.push('No tests provided');
  if (bundle.tests.failed > 0) errors.push(`${bundle.tests.failed} test(s) failing`);
  if (bundle.impacted_surface.length === 0) errors.push('No impacted surface declared');
  if (!bundle.security_scan.passed) errors.push('Security scan not passed');

  return { valid: errors.length === 0, errors };
}

/** Compute novelty score from diff stats */
export function computeNoveltyScore(diff: DiffStats): number {
  const sizeFactor = Math.min((diff.lines_added + diff.lines_removed) / 500, 1);
  const pathFactor = Math.min(diff.new_code_paths / 10, 1);
  const fileFactor = Math.min(diff.files_changed / 20, 1);
  return (sizeFactor * 0.4 + pathFactor * 0.4 + fileFactor * 0.2);
}
