/**
 * #25 — Progressive Disclosure Reports
 * Generate three report tiers: Executive Summary, Technical Report, and Raw Telemetry.
 */

export interface ProgressiveReport {
  executive: ExecutiveSummary;
  technical: TechnicalReport;
  telemetry: RawTelemetry;
  generatedAt: string;
}

export interface ExecutiveSummary {
  overallGrade: string;
  healthScore: number;
  criticalIssues: number;
  topRisks: Array<{ title: string; impact: string; urgency: 'immediate' | 'short_term' | 'long_term' }>;
  quickWins: Array<{ title: string; estimatedEffort: string; impact: string }>;
  trendDirection: 'improving' | 'stable' | 'declining';
  oneLiner: string;
}

export interface TechnicalReport {
  security: SectionReport;
  performance: SectionReport;
  maintainability: SectionReport;
  reliability: SectionReport;
  accessibility: SectionReport;
  findings: Array<{
    id: string;
    severity: string;
    category: string;
    title: string;
    description: string;
    file: string;
    before?: string;
    after?: string;
    effort: string;
  }>;
  totalFindings: number;
  bySeverity: Record<string, number>;
}

export interface SectionReport {
  score: number;
  grade: string;
  findings: number;
  topIssue: string | null;
}

export interface RawTelemetry {
  scanDurationMs: number;
  probesExecuted: number;
  filesScanned: number;
  linesAnalyzed: number;
  patternsChecked: number;
  findings: unknown[];
  metadata: Record<string, unknown>;
}

/**
 * Generate a progressive disclosure report from scan results
 */
export function generateProgressiveReport(
  scanResults: {
    findings: Array<{
      id: string;
      severity: string;
      category: string;
      title: string;
      description: string;
      file: string;
      effort?: string;
      before?: string;
      after?: string;
    }>;
    scores: Record<string, number>;
    metadata: {
      durationMs: number;
      filesScanned: number;
      linesAnalyzed: number;
      probesExecuted: number;
      patternsChecked: number;
    };
  },
  previousScore?: number
): ProgressiveReport {
  const { findings, scores, metadata } = scanResults;

  // --- Executive Summary ---
  const criticalIssues = findings.filter(f => f.severity === 'critical').length;
  const highIssues = findings.filter(f => f.severity === 'high').length;
  
  const healthScore = Math.round(
    (Object.values(scores).reduce((s, v) => s + v, 0) / Math.max(Object.keys(scores).length, 1))
  );

  const overallGrade = healthScore >= 90 ? 'A' : healthScore >= 75 ? 'B' : healthScore >= 60 ? 'C' : healthScore >= 40 ? 'D' : 'F';

  const topRisks = findings
    .filter(f => f.severity === 'critical' || f.severity === 'high')
    .slice(0, 5)
    .map(f => ({
      title: f.title,
      impact: f.category,
      urgency: (f.severity === 'critical' ? 'immediate' : 'short_term') as 'immediate' | 'short_term',
    }));

  const quickWins = findings
    .filter(f => f.effort === 'trivial' || f.effort === 'small')
    .slice(0, 5)
    .map(f => ({
      title: f.title,
      estimatedEffort: f.effort || 'small',
      impact: f.category,
    }));

  const trendDirection: ExecutiveSummary['trendDirection'] = 
    previousScore === undefined ? 'stable' :
    healthScore > previousScore ? 'improving' :
    healthScore < previousScore ? 'declining' : 'stable';

  const oneLiner = criticalIssues > 0
    ? `${criticalIssues} critical issue(s) require immediate attention.`
    : highIssues > 0
    ? `System is stable with ${highIssues} high-priority improvement(s) available.`
    : `System health is strong at ${healthScore}%. No critical issues detected.`;

  // --- Technical Report ---
  const categories = ['security', 'performance', 'maintainability', 'reliability', 'accessibility'];
  const sections: Record<string, SectionReport> = {};
  
  for (const cat of categories) {
    const catFindings = findings.filter(f => f.category === cat);
    sections[cat] = {
      score: scores[cat] || 0,
      grade: (scores[cat] || 0) >= 90 ? 'A' : (scores[cat] || 0) >= 75 ? 'B' : (scores[cat] || 0) >= 60 ? 'C' : (scores[cat] || 0) >= 40 ? 'D' : 'F',
      findings: catFindings.length,
      topIssue: catFindings[0]?.title || null,
    };
  }

  const bySeverity: Record<string, number> = {};
  for (const f of findings) {
    bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
  }

  return {
    executive: {
      overallGrade,
      healthScore,
      criticalIssues,
      topRisks,
      quickWins,
      trendDirection,
      oneLiner,
    },
    technical: {
      security: sections.security || { score: 0, grade: 'F', findings: 0, topIssue: null },
      performance: sections.performance || { score: 0, grade: 'F', findings: 0, topIssue: null },
      maintainability: sections.maintainability || { score: 0, grade: 'F', findings: 0, topIssue: null },
      reliability: sections.reliability || { score: 0, grade: 'F', findings: 0, topIssue: null },
      accessibility: sections.accessibility || { score: 0, grade: 'F', findings: 0, topIssue: null },
      findings: findings.map(f => ({
        id: f.id,
        severity: f.severity,
        category: f.category,
        title: f.title,
        description: f.description,
        file: f.file,
        before: f.before,
        after: f.after,
        effort: f.effort || 'medium',
      })),
      totalFindings: findings.length,
      bySeverity,
    },
    telemetry: {
      scanDurationMs: metadata.durationMs,
      probesExecuted: metadata.probesExecuted,
      filesScanned: metadata.filesScanned,
      linesAnalyzed: metadata.linesAnalyzed,
      patternsChecked: metadata.patternsChecked,
      findings,
      metadata: metadata as unknown as Record<string, unknown>,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Format executive summary as markdown
 */
export function formatExecutiveMarkdown(summary: ExecutiveSummary): string {
  const lines: string[] = [
    `# Scan Report — Grade: ${summary.overallGrade}`,
    '',
    `> ${summary.oneLiner}`,
    '',
    `**Health Score:** ${summary.healthScore}/100 | **Trend:** ${summary.trendDirection} | **Critical Issues:** ${summary.criticalIssues}`,
    '',
  ];

  if (summary.topRisks.length > 0) {
    lines.push('## Top Risks');
    for (const risk of summary.topRisks) {
      lines.push(`- **[${risk.urgency.toUpperCase()}]** ${risk.title} _(${risk.impact})_`);
    }
    lines.push('');
  }

  if (summary.quickWins.length > 0) {
    lines.push('## Quick Wins');
    for (const win of summary.quickWins) {
      lines.push(`- ${win.title} _(${win.estimatedEffort} effort, ${win.impact} impact)_`);
    }
  }

  return lines.join('\n');
}
