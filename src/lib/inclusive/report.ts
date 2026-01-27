/**
 * INCLUSIVE Report Generator
 * @origin(cmptbl) — Report structure from pf-access-report
 */

import type { InclusiveIssue, InclusiveReport, IssueSeverity } from './types';

/**
 * Calculate grade from score
 */
export function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Generate accessibility report
 */
export function generateReport(target: string, issues: InclusiveIssue[], score: number): InclusiveReport {
  // Count by severity
  const severityCounts: Record<IssueSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  issues.forEach(issue => {
    severityCounts[issue.severity]++;
  });

  // Group by WCAG criterion
  const issuesByWcag: Record<string, InclusiveIssue[]> = {};
  issues.forEach(issue => {
    if (!issuesByWcag[issue.wcag_criterion]) {
      issuesByWcag[issue.wcag_criterion] = [];
    }
    issuesByWcag[issue.wcag_criterion].push(issue);
  });

  // Generate recommendations
  const recommendations = generateRecommendations(issues);

  return {
    target,
    summary: {
      total_issues: issues.length,
      critical_count: severityCounts.critical,
      high_count: severityCounts.high,
      medium_count: severityCounts.medium,
      low_count: severityCounts.low,
      score,
      grade: calculateGrade(score),
    },
    issues_by_wcag: issuesByWcag,
    recommendations,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Generate prioritized recommendations
 */
function generateRecommendations(issues: InclusiveIssue[]): string[] {
  const recommendations: string[] = [];

  // Prioritize critical issues
  const critical = issues.filter(i => i.severity === 'critical');
  if (critical.length > 0) {
    recommendations.push(
      `🚨 Address ${critical.length} critical issue(s) immediately: ${critical.map(i => i.type).join(', ')}`
    );
  }

  // High priority
  const high = issues.filter(i => i.severity === 'high');
  if (high.length > 0) {
    recommendations.push(
      `⚠️ Fix ${high.length} high-priority issue(s) for WCAG compliance`
    );
  }

  // Auto-fixable
  const autoFixable = issues.filter(i => i.auto_fixable);
  if (autoFixable.length > 0) {
    recommendations.push(
      `🔧 ${autoFixable.length} issue(s) can be auto-fixed with inclusive.repair()`
    );
  }

  // Specific suggestions
  if (issues.some(i => i.type === 'missing-alt-text')) {
    recommendations.push('📷 Use AI-generated alt text for images via Nexus module');
  }

  if (issues.some(i => i.type.includes('contrast'))) {
    recommendations.push('🎨 Review color contrast using a contrast checker tool');
  }

  if (issues.some(i => i.type === 'missing-labels')) {
    recommendations.push('📝 Associate all form inputs with <label> elements');
  }

  return recommendations;
}

/**
 * Format report as Markdown
 */
export function formatReportAsMarkdown(report: InclusiveReport): string {
  const lines: string[] = [
    `# Accessibility Report`,
    ``,
    `**Target:** ${report.target}`,
    `**Generated:** ${report.generated_at}`,
    ``,
    `## Summary`,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Score | ${report.summary.score}/100 |`,
    `| Grade | ${report.summary.grade} |`,
    `| Total Issues | ${report.summary.total_issues} |`,
    `| Critical | ${report.summary.critical_count} |`,
    `| High | ${report.summary.high_count} |`,
    `| Medium | ${report.summary.medium_count} |`,
    `| Low | ${report.summary.low_count} |`,
    ``,
  ];

  if (report.recommendations.length > 0) {
    lines.push(`## Recommendations`);
    lines.push(``);
    report.recommendations.forEach(rec => {
      lines.push(`- ${rec}`);
    });
    lines.push(``);
  }

  if (Object.keys(report.issues_by_wcag).length > 0) {
    lines.push(`## Issues by WCAG Criterion`);
    lines.push(``);
    
    Object.entries(report.issues_by_wcag).forEach(([wcag, issues]) => {
      lines.push(`### WCAG ${wcag}`);
      lines.push(``);
      issues.forEach(issue => {
        lines.push(`- **${issue.type}** (${issue.severity}): ${issue.description}`);
        if (issue.suggestion) {
          lines.push(`  - Suggestion: ${issue.suggestion}`);
        }
      });
      lines.push(``);
    });
  }

  return lines.join('\n');
}
