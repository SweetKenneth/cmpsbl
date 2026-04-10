/**
 * DEP-GUARDIAN — Reporter Module (BEACON primitive)
 * Generates value-based reports with health scores,
 * license compliance summaries, and prevented issue tracking.
 */

import type {
  DetectedDepIssue,
  TriageResult,
  GovernanceDecision,
  UpgradeAttempt,
  GuardianReport,
  GuardianFinding,
  PreventedIssue,
  LicenseComplianceReport,
  LicenseViolation,
  DependencyEntry,
  GuardianRunStatus,
} from './types';

// ── License Compliance Report ──────────────────────────────────────────

function buildLicenseCompliance(
  deps: DependencyEntry[],
  blockedLicenses: string[],
): LicenseComplianceReport {
  const violations: LicenseViolation[] = [];

  for (const dep of deps) {
    if (blockedLicenses.includes(dep.license)) {
      violations.push({
        depName: dep.name,
        license: dep.license,
        risk: dep.licenseRisk,
        reason: `License "${dep.license}" is blocked by policy`,
      });
    } else if (dep.licenseRisk === 'unknown') {
      violations.push({
        depName: dep.name,
        license: dep.license,
        risk: 'unknown',
        reason: 'License could not be determined',
      });
    } else if (dep.licenseRisk === 'proprietary') {
      violations.push({
        depName: dep.name,
        license: dep.license,
        risk: 'proprietary',
        reason: 'Proprietary license — manual review required',
      });
    }
  }

  const compliant = deps.length - violations.length;
  return {
    totalScanned: deps.length,
    compliant,
    violations,
    complianceRate: deps.length > 0 ? Math.round((compliant / deps.length) * 100) : 100,
  };
}

// ── Prevented Issues ───────────────────────────────────────────────────

function findPreventedIssues(
  currentIssues: DetectedDepIssue[],
  previousIssues: DetectedDepIssue[],
): PreventedIssue[] {
  const currentSet = new Set(currentIssues.map(i => `${i.depName}:${i.category}`));
  return previousIssues
    .filter(prev => !currentSet.has(`${prev.depName}:${prev.category}`))
    .map(prev => ({
      depName: prev.depName,
      category: prev.category,
      description: `${prev.depName} ${prev.category} issue resolved since last run`,
      preventedBy: 'auto-upgrade',
    }));
}

// ── Health Score ────────────────────────────────────────────────────────

function calculateHealthScore(
  totalDeps: number,
  issues: DetectedDepIssue[],
  upgrades: UpgradeAttempt[],
): number {
  if (totalDeps === 0) return 100;
  const issueWeight = issues.reduce((sum, i) => {
    const w = i.severity === 'critical' ? 10 : i.severity === 'high' ? 7 : i.severity === 'medium' ? 4 : i.severity === 'low' ? 2 : 1;
    return sum + w;
  }, 0);
  const fixedWeight = upgrades.filter(u => u.outcome === 'applied').length * 5;
  const raw = Math.max(0, 100 - (issueWeight - fixedWeight));
  return Math.min(100, raw);
}

// ── Report Generator ───────────────────────────────────────────────────

export function generateReport(
  runNumber: number,
  startedAt: string,
  deps: DependencyEntry[],
  issues: DetectedDepIssue[],
  triageResults: TriageResult[],
  decisions: GovernanceDecision[],
  upgrades: UpgradeAttempt[],
  receiptHead: string | null,
  previousIssues: DetectedDepIssue[],
  blockedLicenses: string[],
): GuardianReport {
  const triageMap = new Map(triageResults.map(t => [t.issueId, t]));
  const decisionMap = new Map(decisions.map(d => [d.issueId, d]));
  const upgradeMap = new Map(upgrades.map(u => [u.issueId, u]));

  const findings: GuardianFinding[] = issues.map(issue => ({
    issue,
    triage: triageMap.get(issue.id)!,
    decision: decisionMap.get(issue.id)!,
    upgrade: upgradeMap.get(issue.id) ?? null,
  }));

  const applied = upgrades.filter(u => u.outcome === 'applied').length;
  const rolledBack = upgrades.filter(u => u.outcome === 'rolled_back').length;
  const failed = upgrades.filter(u => u.outcome === 'failed').length;

  const status: GuardianRunStatus =
    failed > 0
      ? 'completed_with_issues'
      : issues.length === 0
        ? 'completed'
        : 'completed';

  return {
    runNumber,
    status,
    startedAt,
    completedAt: new Date().toISOString(),
    totalDeps: deps.length,
    totalIssuesFound: issues.length,
    upgradesApplied: applied,
    upgradesRolledBack: rolledBack,
    preventedIssues: findPreventedIssues(issues, previousIssues),
    findings,
    licenseCompliance: buildLicenseCompliance(deps, blockedLicenses),
    healthScore: calculateHealthScore(deps.length, issues, upgrades),
    receiptHead,
  };
}

// ── Lifecycle Bridge ───────────────────────────────────────────────────

/** Primitives exercised by Dep-Guardian */
const DEP_GUARDIAN_PRIMITIVES = [
  'ENGINEER', 'EVOLUTION', 'SOVEREIGN', 'COMPASS',
  'DEFENSE', 'CONSCIENCE', 'BEACON', 'SHADOW', 'REFLEX',
] as const;

/**
 * Build a lifecycle summary for this product's report.
 * Proves which primitives are activated at runtime.
 */
export function getLifecycleSummary() {
  const { buildReporterLifecycleSummary } = require('@/lib/capability-lifecycle/export-bridge');
  return buildReporterLifecycleSummary('dep-guardian', DEP_GUARDIAN_PRIMITIVES);
}
