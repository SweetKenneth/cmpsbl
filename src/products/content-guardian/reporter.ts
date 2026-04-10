/**
 * CONTENT-GUARDIAN — Reporter (BEACON + METRIC primitives)
 * Generates reports with quality scores, brand compliance rates,
 * and performance attribution.
 */

import type {
  DetectedContentIssue,
  ContentTriageResult,
  ContentGovernanceDecision,
  RemediationAttempt,
  QualityScore,
  ContentGuardianReport,
  ContentGuardianFinding,
  PreventedContentIssue,
  GuardianRunStatus,
} from './types';

function findPreventedIssues(
  current: DetectedContentIssue[],
  previous: DetectedContentIssue[],
): PreventedContentIssue[] {
  const currentSet = new Set(current.map(i => `${i.contentId}:${i.category}`));
  return previous
    .filter(prev => !currentSet.has(`${prev.contentId}:${prev.category}`))
    .map(prev => ({
      contentId: prev.contentId,
      category: prev.category,
      description: `${prev.category} issue on content "${prev.contentId}" resolved since last run`,
      preventedBy: 'auto-remediation',
    }));
}

export function generateReport(
  runNumber: number,
  startedAt: string,
  issues: DetectedContentIssue[],
  triageResults: ContentTriageResult[],
  decisions: ContentGovernanceDecision[],
  remediations: RemediationAttempt[],
  qualityScores: QualityScore[],
  receiptHead: string | null,
  previousIssues: DetectedContentIssue[],
): ContentGuardianReport {
  const triageMap = new Map(triageResults.map(t => [t.issueId, t]));
  const decisionMap = new Map(decisions.map(d => [d.issueId, d]));
  const remediationMap = new Map(remediations.map(r => [r.issueId, r]));

  const findings: ContentGuardianFinding[] = issues.map(issue => ({
    issue,
    triage: triageMap.get(issue.id)!,
    decision: decisionMap.get(issue.id)!,
    remediation: remediationMap.get(issue.id) ?? null,
  }));

  const applied = remediations.filter(r => r.outcome === 'corrected').length;
  const blocked = remediations.filter(r => r.outcome === 'blocked').length;
  const failed = remediations.filter(r => r.outcome === 'failed').length;

  const brandIssues = issues.filter(i => i.category === 'brand_drift' || i.category === 'tone_deviation');
  const brandComplianceRate = qualityScores.length > 0
    ? Math.round(((qualityScores.length - brandIssues.length) / qualityScores.length) * 100)
    : 100;

  const averageQualityScore = qualityScores.length > 0
    ? Math.round(qualityScores.reduce((s, q) => s + q.overallScore, 0) / qualityScores.length)
    : 0;

  const status: GuardianRunStatus = failed > 0 ? 'completed_with_issues' : 'completed';

  return {
    runNumber,
    status,
    startedAt,
    completedAt: new Date().toISOString(),
    totalContentScanned: qualityScores.length,
    totalIssuesFound: issues.length,
    remediationsApplied: applied,
    contentBlocked: blocked,
    preventedIssues: findPreventedIssues(issues, previousIssues),
    findings,
    qualityScores,
    brandComplianceRate,
    averageQualityScore,
    receiptHead,
  };
}

// ── Lifecycle Bridge ───────────────────────────────────────────────────

/** Primitives exercised by Content-Guardian */
const CONTENT_GUARDIAN_PRIMITIVES = [
  'CRITIC', 'PALETTE', 'COMPLY', 'METRIC', 'PERSONA', 'STORYARC',
  'GOVERNANCE', 'CONSCIENCE', 'BEACON', 'COMPASS', 'AUDIT', 'SHADOW',
] as const;

/**
 * Build a lifecycle summary for this product's report.
 * Proves which primitives are activated at runtime.
 */
export function getLifecycleSummary() {
  const { buildReporterLifecycleSummary } = require('@/lib/capability-lifecycle/export-bridge');
  return buildReporterLifecycleSummary('content-guardian', CONTENT_GUARDIAN_PRIMITIVES);
}
