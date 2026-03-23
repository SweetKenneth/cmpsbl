/**
 * INCLUSIVE Ultimate — System 9: Compliance Report Generator
 * 
 * Produces audit-grade reports (VPAT-style) with executive summary,
 * per-criterion breakdown, remediation roadmap, and trend analysis.
 * Feeds into GOVERNANCE compliance gates.
 * 
 * @module inclusive/ultimate/complianceReportGenerator
 */

// ── Types ────────────────────────────────────────────────────────

export type ConformanceLevel = 'supports' | 'partially_supports' | 'does_not_support' | 'not_applicable' | 'not_evaluated';
export type ReportFormat = 'json' | 'markdown' | 'vpat';

export interface VpatEntry {
  criterion: string;
  criterionName: string;
  level: 'A' | 'AA' | 'AAA';
  conformance: ConformanceLevel;
  remarks: string;
}

export interface RemediationItem {
  priority: 'critical' | 'high' | 'medium' | 'low';
  criterion: string;
  description: string;
  estimatedEffort: 'hours' | 'days' | 'weeks';
  suggestedFix: string;
}

export interface ComplianceReport {
  id: string;
  target: string;
  format: ReportFormat;
  
  // Executive Summary
  executiveSummary: {
    overallScore: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    conformanceLevel: 'A' | 'AA' | 'AAA' | 'none';
    totalCriteria: number;
    criteriaMet: number;
    criticalIssues: number;
    improvementFromLast: number | null;
  };

  // VPAT-style entries
  vpatEntries: VpatEntry[];

  // Remediation Roadmap
  roadmap: RemediationItem[];

  // Trend Analysis
  trendAnalysis: {
    direction: 'improving' | 'stable' | 'degrading';
    scoreHistory: Array<{ score: number; date: string }>;
    projectedScore: number;
  };

  generatedAt: string;
}

// ── State ────────────────────────────────────────────────────────

const reportHistory: ComplianceReport[] = [];
const MAX_REPORTS = 100;

// ── Report Generation ────────────────────────────────────────────

function determineConformance(passRate: number): ConformanceLevel {
  if (passRate >= 1.0) return 'supports';
  if (passRate >= 0.7) return 'partially_supports';
  if (passRate > 0) return 'does_not_support';
  return 'not_evaluated';
}

function computeGrade(score: number): ComplianceReport['executiveSummary']['grade'] {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function determineConformanceLevel(entries: VpatEntry[]): 'A' | 'AA' | 'AAA' | 'none' {
  const aEntries = entries.filter(e => e.level === 'A');
  const aaEntries = entries.filter(e => e.level === 'AA');
  const aaaEntries = entries.filter(e => e.level === 'AAA');

  const allASupported = aEntries.every(e => e.conformance === 'supports' || e.conformance === 'not_applicable');
  const allAASupported = aaEntries.every(e => e.conformance === 'supports' || e.conformance === 'not_applicable');
  const allAAASupported = aaaEntries.every(e => e.conformance === 'supports' || e.conformance === 'not_applicable');

  if (allASupported && allAASupported && allAAASupported) return 'AAA';
  if (allASupported && allAASupported) return 'AA';
  if (allASupported) return 'A';
  return 'none';
}

// ── Core API ────────────────────────────────────────────────────

/** Generate a compliance report */
export function generateComplianceReport(
  target: string,
  scanResults: Array<{ criterion: string; name: string; level: 'A' | 'AA' | 'AAA'; passed: boolean; issues: string[] }>,
  format: ReportFormat = 'json',
): ComplianceReport {
  // Build VPAT entries
  const vpatEntries: VpatEntry[] = scanResults.map(r => ({
    criterion: r.criterion,
    criterionName: r.name,
    level: r.level,
    conformance: r.passed ? 'supports' : 'does_not_support',
    remarks: r.passed ? 'Meets requirements' : r.issues.join('; '),
  }));

  // Build remediation roadmap
  const failedEntries = scanResults.filter(r => !r.passed);
  const roadmap: RemediationItem[] = failedEntries.map(r => ({
    priority: r.level === 'A' ? 'critical' : r.level === 'AA' ? 'high' : 'medium',
    criterion: r.criterion,
    description: `Fix ${r.name} (${r.criterion})`,
    estimatedEffort: r.level === 'A' ? 'hours' : 'days',
    suggestedFix: r.issues[0] || `Address ${r.criterion} compliance`,
  }));

  // Sort roadmap by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  roadmap.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Calculate scores
  const totalCriteria = scanResults.length;
  const criteriaMet = scanResults.filter(r => r.passed).length;
  const overallScore = totalCriteria > 0 ? Math.round((criteriaMet / totalCriteria) * 100) : 100;
  const criticalIssues = failedEntries.filter(r => r.level === 'A').length;

  // Trend analysis from previous reports
  const previousReports = reportHistory.filter(r => r.target === target).slice(-10);
  const scoreHistory = previousReports.map(r => ({
    score: r.executiveSummary.overallScore,
    date: r.generatedAt,
  }));
  scoreHistory.push({ score: overallScore, date: new Date().toISOString() });

  const improvementFromLast = previousReports.length > 0
    ? overallScore - previousReports[previousReports.length - 1].executiveSummary.overallScore
    : null;

  let direction: 'improving' | 'stable' | 'degrading' = 'stable';
  if (improvementFromLast !== null) {
    if (improvementFromLast > 2) direction = 'improving';
    else if (improvementFromLast < -2) direction = 'degrading';
  }

  // Project future score (simple linear regression)
  const projectedScore = Math.min(100, Math.max(0, overallScore + (improvementFromLast || 0)));

  const report: ComplianceReport = {
    id: crypto.randomUUID(),
    target,
    format,
    executiveSummary: {
      overallScore,
      grade: computeGrade(overallScore),
      conformanceLevel: determineConformanceLevel(vpatEntries),
      totalCriteria,
      criteriaMet,
      criticalIssues,
      improvementFromLast,
    },
    vpatEntries,
    roadmap,
    trendAnalysis: {
      direction,
      scoreHistory,
      projectedScore,
    },
    generatedAt: new Date().toISOString(),
  };

  reportHistory.push(report);
  if (reportHistory.length > MAX_REPORTS) reportHistory.splice(0, reportHistory.length - MAX_REPORTS);

  return report;
}

/** Export report as markdown */
export function reportToMarkdown(report: ComplianceReport): string {
  const lines: string[] = [
    `# Accessibility Compliance Report`,
    `**Target:** ${report.target}`,
    `**Generated:** ${report.generatedAt}`,
    '',
    `## Executive Summary`,
    `- **Score:** ${report.executiveSummary.overallScore}/100 (Grade: ${report.executiveSummary.grade})`,
    `- **Conformance Level:** WCAG ${report.executiveSummary.conformanceLevel}`,
    `- **Criteria Met:** ${report.executiveSummary.criteriaMet}/${report.executiveSummary.totalCriteria}`,
    `- **Critical Issues:** ${report.executiveSummary.criticalIssues}`,
    report.executiveSummary.improvementFromLast !== null
      ? `- **Change:** ${report.executiveSummary.improvementFromLast > 0 ? '+' : ''}${report.executiveSummary.improvementFromLast} points`
      : '',
    '',
    `## VPAT Summary`,
    '| Criterion | Name | Level | Conformance | Remarks |',
    '|-----------|------|-------|-------------|---------|',
    ...report.vpatEntries.map(e => 
      `| ${e.criterion} | ${e.criterionName} | ${e.level} | ${e.conformance} | ${e.remarks} |`
    ),
    '',
    `## Remediation Roadmap`,
    ...report.roadmap.map((r, i) =>
      `${i + 1}. **[${r.priority.toUpperCase()}]** ${r.description} — Est: ${r.estimatedEffort}`
    ),
    '',
    `## Trend: ${report.trendAnalysis.direction}`,
    `Projected score: ${report.trendAnalysis.projectedScore}`,
  ];

  return lines.filter(l => l !== undefined).join('\n');
}

/** Get report generator health */
export function getReportHealth() {
  return {
    totalReports: reportHistory.length,
    avgScore: reportHistory.length > 0
      ? Math.round(reportHistory.reduce((s, r) => s + r.executiveSummary.overallScore, 0) / reportHistory.length)
      : 100,
    formatsUsed: [...new Set(reportHistory.map(r => r.format))].length,
  };
}

/** Reset */
export function resetReportGenerator(): void {
  reportHistory.length = 0;
}
