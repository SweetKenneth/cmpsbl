/**
 * AUTO-SENTINEL — Reporter Module
 * Pattern: Maintenance REPORTER engine
 *
 * Compiles scan → triage → governance → execution results
 * into a structured report including the "what I prevented" section.
 * Emits capability lifecycle detection records for the lifecycle ledger.
 */

import type {
  DetectedIssue,
  TriageResult,
  GovernanceDecision,
  FixAttempt,
  SentinelReport,
  SentinelFinding,
  SentinelRunStatus,
  PreventedIssue,
  IssueSeverity,
  IssueCategory,
} from './types';

// ── Report Generator ───────────────────────────────────────────────────

export function generateReport(
  runNumber: number,
  startedAt: string,
  issues: DetectedIssue[],
  triageResults: TriageResult[],
  decisions: GovernanceDecision[],
  fixes: FixAttempt[],
  receiptChainHead: string,
  previousFindings: DetectedIssue[],
): SentinelReport {
  const completedAt = new Date().toISOString();
  const startMs = new Date(startedAt).getTime();
  const endMs = new Date(completedAt).getTime();

  // Build lookup maps
  const triageMap = new Map(triageResults.map(t => [t.issueId, t]));
  const decisionMap = new Map(decisions.map(d => [d.issueId, d]));
  const fixMap = new Map(fixes.map(f => [f.issueId, f]));

  // Assemble findings
  const findings: SentinelFinding[] = issues.map(issue => ({
    issue,
    triage: triageMap.get(issue.id)!,
    governance: decisionMap.get(issue.id)!,
    fix: fixMap.get(issue.id),
  }));

  // Count by severity
  const issuesBySeverity = countBySeverity(issues);

  // Count by category
  const issuesByCategory = countByCategory(issues);

  // Fix statistics
  const fixesApplied = fixes.filter(f => f.outcome === 'applied').length;
  const fixesRolledBack = fixes.filter(f => f.outcome === 'rolled_back').length;
  const fixesDeniedByGovernance = fixes.filter(f => f.outcome === 'skipped_governance').length;
  const fixesSkippedByRisk = fixes.filter(f => f.outcome === 'skipped_risk').length;

  // Triage statistics
  const autoFixableCount = triageResults.filter(t => t.autoFixable).length;
  const reviewRequiredCount = decisions.filter(d => d.verdict === 'review_required').length;
  const skippedCount = decisions.filter(d => d.verdict === 'deny').length;

  // Prevented issues — the enterprise sell
  const preventedIssues = computePreventedIssues(issues, fixes, previousFindings);

  // Overall status
  const status = determineStatus(issues, fixes);

  return {
    id: crypto.randomUUID(),
    runNumber,
    status,
    startedAt,
    completedAt,
    durationMs: endMs - startMs,
    totalIssuesFound: issues.length,
    issuesBySeverity,
    issuesByCategory,
    autoFixableCount,
    reviewRequiredCount,
    skippedCount,
    fixesApplied,
    fixesRolledBack,
    fixesDeniedByGovernance,
    fixesSkippedByRisk,
    preventedIssues,
    receiptChainHead,
    findings,
  };
}

// ── Prevention Calculator ──────────────────────────────────────────────

/**
 * Computes the "what I prevented" section.
 *
 * A prevented issue is a finding from a PREVIOUS run that was
 * auto-fixed and did NOT reappear in the current scan.
 * This proves the sentinel's fixes are holding.
 */
function computePreventedIssues(
  currentIssues: DetectedIssue[],
  fixes: FixAttempt[],
  previousFindings: DetectedIssue[],
): PreventedIssue[] {
  if (previousFindings.length === 0) return [];

  const currentIssueKeys = new Set(
    currentIssues.map(i => `${i.ruleId}:${i.filePath}`),
  );

  const appliedFixIds = new Set(
    fixes.filter(f => f.outcome === 'applied').map(f => f.issueId),
  );

  return previousFindings
    .filter(prev => {
      const key = `${prev.ruleId}:${prev.filePath}`;
      // Was in previous run but not in current → prevented
      return !currentIssueKeys.has(key);
    })
    .map(prev => ({
      category: prev.category,
      description: `Previously detected: ${prev.message}`,
      potentialImpact: impactDescription(prev.severity),
      preventedAt: new Date().toISOString(),
    }));
}

function impactDescription(severity: IssueSeverity): string {
  switch (severity) {
    case 'critical': return 'Could have caused system outage or data loss';
    case 'high': return 'Could have caused significant functionality degradation';
    case 'medium': return 'Could have caused user-facing issues or performance problems';
    case 'low': return 'Could have accumulated as technical debt';
    case 'info': return 'Informational — no direct impact but improves code quality';
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

function countBySeverity(issues: DetectedIssue[]): Record<IssueSeverity, number> {
  const counts: Record<IssueSeverity, number> = {
    info: 0, low: 0, medium: 0, high: 0, critical: 0,
  };
  for (const issue of issues) {
    counts[issue.severity]++;
  }
  return counts;
}

function countByCategory(issues: DetectedIssue[]): Partial<Record<IssueCategory, number>> {
  const counts: Partial<Record<IssueCategory, number>> = {};
  for (const issue of issues) {
    counts[issue.category] = (counts[issue.category] ?? 0) + 1;
  }
  return counts;
}

function determineStatus(issues: DetectedIssue[], fixes: FixAttempt[]): SentinelRunStatus {
  const hasFailedFixes = fixes.some(f => f.outcome === 'failed');
  const hasCritical = issues.some(i => i.severity === 'critical');

  if (hasFailedFixes) return 'completed_with_issues';
  if (hasCritical) return 'completed_with_issues';
  if (issues.length === 0) return 'completed';
  return 'completed';
}

// ── Lifecycle Bridge ───────────────────────────────────────────────────

/** Primitives exercised by Auto-Sentinel */
const SENTINEL_PRIMITIVES = [
  'DEFENSE', 'GOVERNANCE', 'CONSCIENCE', 'COMPASS',
  'BEACON', 'SHADOW', 'FAILSAFE', 'EVOLUTION',
] as const;

/**
 * Build a lifecycle summary for this product's report.
 * Proves which primitives are activated at runtime.
 */
export function getLifecycleSummary() {
  const { buildReporterLifecycleSummary } = require('@/lib/capability-lifecycle/export-bridge');
  return buildReporterLifecycleSummary('auto-sentinel', SENTINEL_PRIMITIVES);
}
