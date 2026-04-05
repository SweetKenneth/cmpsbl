/**
 * DEP-GUARDIAN — Triage Module (COMPASS primitive)
 * Pattern: CJ-160 Self-Repair Engine (severity assessment)
 *
 * Priority-ranks detected issues using confidence-weighted scoring,
 * severity ordering, and recurrence detection.
 */

import type {
  DetectedDepIssue,
  TriageResult,
  UpgradeStrategy,
  DepSeverity,
} from './types';

// ── Severity Weights (COMPASS: severity ordering) ──────────────────────

const SEVERITY_ORDER: Record<DepSeverity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

const CATEGORY_RISK: Record<string, number> = {
  vulnerability: 0.95,
  license_violation: 0.85,
  breaking_change: 0.70,
  deprecation: 0.60,
  staleness: 0.50,
  phantom_dep: 0.40,
  duplicate: 0.25,
  size_bloat: 0.20,
};

// ── Strategy Selection ─────────────────────────────────────────────────

function selectStrategy(issue: DetectedDepIssue): UpgradeStrategy {
  switch (issue.category) {
    case 'vulnerability':
      return 'patch';
    case 'staleness':
      return 'minor';
    case 'breaking_change':
      return 'major';
    case 'license_violation':
      return 'replace';
    case 'deprecation':
      return 'replace';
    case 'size_bloat':
      return 'replace';
    case 'duplicate':
      return 'remove';
    case 'phantom_dep':
      return 'remove';
    default:
      return 'skip';
  }
}

// ── Triage Engine ──────────────────────────────────────────────────────

export function triageIssue(
  issue: DetectedDepIssue,
  previousFindings: DetectedDepIssue[],
): TriageResult {
  const severityOrder = SEVERITY_ORDER[issue.severity];
  const categoryRisk = CATEGORY_RISK[issue.category] ?? 0.5;
  const strategy = selectStrategy(issue);

  // COMPASS: confidence weighting — higher for well-known categories
  const confidenceScore = categoryRisk * 0.7 + (severityOrder / 5) * 0.3;

  // Recurrence detection
  const recurrent = previousFindings.some(
    prev => prev.depName === issue.depName && prev.category === issue.category,
  );

  // Risk score: severity × category risk × recurrence multiplier
  const recurrenceMultiplier = recurrent ? 1.3 : 1.0;
  const riskScore = Math.min(1, (severityOrder / 5) * categoryRisk * recurrenceMultiplier);

  // Priority: weighted composite for triage routing
  const priorityScore = riskScore * 0.5 + confidenceScore * 0.3 + (recurrent ? 0.2 : 0);

  // Auto-upgradeable: only safe strategies with low risk
  const autoUpgradeable =
    (strategy === 'patch' || strategy === 'minor' || strategy === 'remove') &&
    riskScore < 0.7;

  return {
    issueId: issue.id,
    priorityScore: Math.round(priorityScore * 100) / 100,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    riskScore: Math.round(riskScore * 100) / 100,
    suggestedStrategy: strategy,
    autoUpgradeable,
    recurrent,
    severityOrder,
  };
}

export function triageAll(
  issues: DetectedDepIssue[],
  previousFindings: DetectedDepIssue[],
): TriageResult[] {
  return issues
    .map(issue => triageIssue(issue, previousFindings))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
