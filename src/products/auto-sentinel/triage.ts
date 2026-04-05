/**
 * AUTO-SENTINEL — Triage Module
 * Pattern: CJ-160 Self-Repair Engine
 *
 * Assesses detected issues for auto-fix viability.
 * Produces risk scores and repair strategies.
 */

import type {
  DetectedIssue,
  TriageResult,
  FixStrategy,
  IssueSeverity,
} from './types';

// ── Severity Weight Map ────────────────────────────────────────────────

const SEVERITY_RISK: Record<IssueSeverity, number> = {
  info: 5,
  low: 15,
  medium: 40,
  high: 70,
  critical: 95,
};

const SEVERITY_CONFIDENCE: Record<IssueSeverity, number> = {
  info: 95,
  low: 90,
  medium: 70,
  high: 45,
  critical: 20,
};

// ── Strategy Selection ─────────────────────────────────────────────────

function selectStrategy(issue: DetectedIssue): FixStrategy {
  switch (issue.category) {
    case 'dead_code':
    case 'unused_export':
      return 'remove';

    case 'circular_dependency':
    case 'type_inconsistency':
      return 'refactor';

    case 'missing_error_handling':
    case 'documentation_drift':
      return 'annotate';

    case 'stale_config':
    case 'dependency_health':
      return 'update';

    case 'security_smell':
      return 'isolate';

    case 'performance_anti_pattern':
      return issue.severity === 'high' || issue.severity === 'critical'
        ? 'refactor'
        : 'annotate';

    default:
      return 'skip';
  }
}

// ── Auto-fixability Heuristic ──────────────────────────────────────────

function isAutoFixable(issue: DetectedIssue, strategy: FixStrategy): boolean {
  // Never auto-fix security issues
  if (issue.category === 'security_smell') return false;

  // Only auto-fix if we have a suggested fix
  if (!issue.suggestedFix) return false;

  // Skip strategies are not auto-fixable by definition
  if (strategy === 'skip') return false;

  // Refactors above medium severity require human review
  if (strategy === 'refactor' && (issue.severity === 'high' || issue.severity === 'critical')) {
    return false;
  }

  return true;
}

// ── Recurrence Bonus ───────────────────────────────────────────────────

function recurrenceAdjustment(
  issue: DetectedIssue,
  previousFindings: DetectedIssue[],
): { riskDelta: number; confidenceDelta: number } {
  const priorOccurrences = previousFindings.filter(
    prev => prev.ruleId === issue.ruleId && prev.filePath === issue.filePath,
  ).length;

  if (priorOccurrences === 0) return { riskDelta: 0, confidenceDelta: 0 };

  // Recurring issues are lower risk to fix (well-understood) and higher confidence
  return {
    riskDelta: -Math.min(priorOccurrences * 5, 15),
    confidenceDelta: Math.min(priorOccurrences * 3, 10),
  };
}

// ── Triage Engine ──────────────────────────────────────────────────────

export function triageIssue(
  issue: DetectedIssue,
  previousFindings: DetectedIssue[] = [],
): TriageResult {
  const strategy = selectStrategy(issue);
  const baseRisk = SEVERITY_RISK[issue.severity];
  const baseConfidence = SEVERITY_CONFIDENCE[issue.severity];
  const { riskDelta, confidenceDelta } = recurrenceAdjustment(issue, previousFindings);

  const riskScore = Math.max(0, Math.min(100, baseRisk + riskDelta));
  const confidence = Math.max(0, Math.min(100, baseConfidence + confidenceDelta));
  const autoFixable = isAutoFixable(issue, strategy);

  return {
    issueId: issue.id,
    severity: issue.severity,
    riskScore,
    autoFixable,
    suggestedStrategy: strategy,
    confidence,
    rationale: buildRationale(issue, strategy, autoFixable, riskScore, confidence),
  };
}

export function triageAll(
  issues: DetectedIssue[],
  previousFindings: DetectedIssue[] = [],
): TriageResult[] {
  return issues.map(issue => triageIssue(issue, previousFindings));
}

// ── Rationale Builder ──────────────────────────────────────────────────

function buildRationale(
  issue: DetectedIssue,
  strategy: FixStrategy,
  autoFixable: boolean,
  risk: number,
  confidence: number,
): string {
  const parts: string[] = [];

  parts.push(`Category "${issue.category}" maps to "${strategy}" strategy.`);
  parts.push(`Risk: ${risk}/100, Confidence: ${confidence}/100.`);

  if (!autoFixable) {
    if (issue.category === 'security_smell') {
      parts.push('Security issues always require human review.');
    } else if (!issue.suggestedFix) {
      parts.push('No suggested fix available — manual review needed.');
    } else {
      parts.push('Severity/strategy combination exceeds auto-fix threshold.');
    }
  } else {
    parts.push('Issue qualifies for autonomous remediation.');
  }

  return parts.join(' ');
}
