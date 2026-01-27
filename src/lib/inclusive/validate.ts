/**
 * INCLUSIVE Validation Engine
 * Validates repairs and ensures fixes don't introduce new issues
 */

import type { InclusiveScanResult, InclusiveRepair } from './types';
import { scanHTML, calculateScore } from './scan';

export interface ValidationResult {
  valid: boolean;
  original_score: number;
  new_score: number;
  score_improvement: number;
  issues_resolved: number;
  issues_introduced: number;
  warnings: string[];
}

/**
 * Validate that repairs improved accessibility without introducing new issues
 */
export function validateRepairs(
  originalHtml: string,
  repairedHtml: string,
  repairs: InclusiveRepair[],
  wcagLevel: 'A' | 'AA' | 'AAA' = 'AA'
): ValidationResult {
  const warnings: string[] = [];

  // Scan original
  const originalIssues = scanHTML(originalHtml, wcagLevel);
  const originalScore = calculateScore(originalIssues);

  // Scan repaired
  const newIssues = scanHTML(repairedHtml, wcagLevel);
  const newScore = calculateScore(newIssues);

  // Calculate metrics
  const scoreImprovement = newScore - originalScore;
  const issuesResolved = originalIssues.length - newIssues.length;

  // Check for new issues
  const originalTypes = new Set(originalIssues.map(i => i.type));
  const newTypes = newIssues.filter(i => !originalTypes.has(i.type));
  const issuesIntroduced = newTypes.length;

  // Validation checks
  let valid = true;

  if (issuesIntroduced > 0) {
    warnings.push(`${issuesIntroduced} new issue type(s) introduced by repairs`);
    valid = false;
  }

  if (scoreImprovement < 0) {
    warnings.push('Repairs decreased accessibility score');
    valid = false;
  }

  if (repairs.length > 0 && issuesResolved === 0) {
    warnings.push('Repairs applied but no issues were resolved');
  }

  // HTML structure validation
  if (!repairedHtml.includes('<!DOCTYPE') && originalHtml.includes('<!DOCTYPE')) {
    warnings.push('DOCTYPE declaration was removed');
    valid = false;
  }

  if ((repairedHtml.match(/<html/gi) || []).length !== 1) {
    warnings.push('Invalid HTML structure: incorrect number of <html> elements');
    valid = false;
  }

  return {
    valid,
    original_score: originalScore,
    new_score: newScore,
    score_improvement: scoreImprovement,
    issues_resolved: Math.max(0, issuesResolved),
    issues_introduced: issuesIntroduced,
    warnings,
  };
}

/**
 * Validate a template meets minimum accessibility requirements
 */
export function validateTemplate(
  html: string,
  minScore: number = 70,
  wcagLevel: 'A' | 'AA' | 'AAA' = 'AA'
): { approved: boolean; score: number; blockers: string[] } {
  const issues = scanHTML(html, wcagLevel);
  const score = calculateScore(issues);

  const blockers: string[] = [];

  // Critical issues are always blockers
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  criticalIssues.forEach(issue => {
    blockers.push(`[CRITICAL] ${issue.description} (WCAG ${issue.wcag_criterion})`);
  });

  if (score < minScore) {
    blockers.push(`Score ${score} is below minimum threshold of ${minScore}`);
  }

  return {
    approved: blockers.length === 0,
    score,
    blockers,
  };
}
