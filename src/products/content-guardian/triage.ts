/**
 * CONTENT-GUARDIAN — Triage Module (COMPASS primitive)
 * Priority-ranks content issues using severity ordering,
 * confidence weighting, and recurrence detection.
 */

import type {
  DetectedContentIssue,
  ContentTriageResult,
  RemediationStrategy,
  ContentSeverity,
} from './types';

const SEVERITY_ORDER: Record<ContentSeverity, number> = {
  block: 4,
  violation: 3,
  warning: 2,
  info: 1,
};

const CATEGORY_RISK: Record<string, number> = {
  copyright_violation: 0.95,
  nsfw_detected: 0.95,
  platform_policy_breach: 0.85,
  ad_regulation_violation: 0.80,
  trademark_conflict: 0.75,
  brand_drift: 0.50,
  tone_deviation: 0.45,
  narrative_inconsistency: 0.40,
  audience_mismatch: 0.35,
  quality_below_threshold: 0.30,
};

function selectStrategy(issue: DetectedContentIssue): RemediationStrategy {
  switch (issue.category) {
    case 'brand_drift':
    case 'tone_deviation':
      return 'auto_correct';
    case 'copyright_violation':
    case 'nsfw_detected':
      return 'block_publish';
    case 'platform_policy_breach':
    case 'ad_regulation_violation':
      return 'flag_for_review';
    case 'trademark_conflict':
      return 'flag_for_review';
    case 'narrative_inconsistency':
      return 'suggest_alternative';
    case 'audience_mismatch':
      return 'adjust_targeting';
    case 'quality_below_threshold':
      return 'suggest_alternative';
    default:
      return 'skip';
  }
}

export function triageIssue(
  issue: DetectedContentIssue,
  previousFindings: DetectedContentIssue[],
): ContentTriageResult {
  const severityOrder = SEVERITY_ORDER[issue.severity];
  const categoryRisk = CATEGORY_RISK[issue.category] ?? 0.5;
  const strategy = selectStrategy(issue);

  const confidenceScore = categoryRisk * 0.7 + (severityOrder / 4) * 0.3;
  const recurrent = previousFindings.some(
    prev => prev.contentId === issue.contentId && prev.category === issue.category,
  );
  const recurrenceMultiplier = recurrent ? 1.3 : 1.0;
  const riskScore = Math.min(1, (severityOrder / 4) * categoryRisk * recurrenceMultiplier);
  const priorityScore = riskScore * 0.5 + confidenceScore * 0.3 + (recurrent ? 0.2 : 0);

  const autoRemediable =
    (strategy === 'auto_correct' || strategy === 'adjust_targeting') && riskScore < 0.6;

  return {
    issueId: issue.id,
    priorityScore: Math.round(priorityScore * 100) / 100,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    riskScore: Math.round(riskScore * 100) / 100,
    suggestedStrategy: strategy,
    autoRemediable,
    recurrent,
    severityOrder,
  };
}

export function triageAll(
  issues: DetectedContentIssue[],
  previousFindings: DetectedContentIssue[],
): ContentTriageResult[] {
  return issues
    .map(issue => triageIssue(issue, previousFindings))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
