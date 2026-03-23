/**
 * AUDIT — Governance Report Generator
 * Produces structured compliance and audit summary reports
 * (finding counts, risk distribution, trend analysis) for ATLAS.
 * @module audit/governanceReportGenerator
 * @version 9.0.0 — Sentinel
 */

import type { AuditReceipt } from '../receipts';
import type { AuditReport } from '../audit-types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface GovernanceReport {
  id: string;
  generatedAt: string;
  period: { start: string; end: string };
  chainHealth: {
    length: number;
    verified: boolean;
    headHash: string;
  };
  receiptSummary: {
    total: number;
    byType: Record<string, number>;
    byActor: Record<string, number>;
    avgPerDay: number;
  };
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    anomalyCount: number;
    complianceViolations: number;
    highRiskActions: number;
  };
  auditFindings?: {
    fatal: number;
    error: number;
    warn: number;
    info: number;
    passed: boolean;
  };
  trends: {
    receiptVelocity: number;    // per hour
    riskTrend: 'improving' | 'stable' | 'degrading';
  };
}

// ── State ──────────────────────────────────────────────────────────────────

const reportHistory: GovernanceReport[] = [];
const MAX_REPORTS = 50;

// ── Core ───────────────────────────────────────────────────────────────────

export function generateGovernanceReport(
  receipts: AuditReceipt[],
  chainHead: string,
  chainVerified: boolean,
  anomalyCount: number,
  complianceViolations: number,
  auditReport?: AuditReport,
): GovernanceReport {
  const sorted = [...receipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const byType: Record<string, number> = {};
  const byActor: Record<string, number> = {};
  const highRiskTypes = new Set(['config_change', 'safe_mode_toggle', 'evolution_promotion']);
  let highRiskActions = 0;

  for (const r of sorted) {
    byType[r.type] = (byType[r.type] ?? 0) + 1;
    byActor[r.actor] = (byActor[r.actor] ?? 0) + 1;
    if (highRiskTypes.has(r.type)) highRiskActions++;
  }

  const start = sorted[0]?.timestamp ?? new Date().toISOString();
  const end = sorted[sorted.length - 1]?.timestamp ?? new Date().toISOString();
  const spanMs = new Date(end).getTime() - new Date(start).getTime();
  const spanDays = Math.max(1, spanMs / (24 * 3600 * 1000));
  const spanHours = Math.max(1, spanMs / (3600 * 1000));

  // Risk assessment
  let overallRisk: GovernanceReport['riskAssessment']['overallRisk'] = 'low';
  if (anomalyCount >= 5 || complianceViolations >= 3) overallRisk = 'critical';
  else if (anomalyCount >= 3 || complianceViolations >= 1) overallRisk = 'high';
  else if (anomalyCount >= 1 || highRiskActions > 10) overallRisk = 'medium';

  // Trend analysis
  const prevReport = reportHistory[reportHistory.length - 1];
  let riskTrend: GovernanceReport['trends']['riskTrend'] = 'stable';
  if (prevReport) {
    const riskOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    const prevRisk = riskOrder[prevReport.riskAssessment.overallRisk] ?? 0;
    const currRisk = riskOrder[overallRisk] ?? 0;
    if (currRisk > prevRisk) riskTrend = 'degrading';
    else if (currRisk < prevRisk) riskTrend = 'improving';
  }

  const report: GovernanceReport = {
    id: `gov-report-${Date.now().toString(36)}`,
    generatedAt: new Date().toISOString(),
    period: { start, end },
    chainHealth: {
      length: sorted.length,
      verified: chainVerified,
      headHash: chainHead,
    },
    receiptSummary: {
      total: sorted.length,
      byType,
      byActor,
      avgPerDay: Math.round((sorted.length / spanDays) * 10) / 10,
    },
    riskAssessment: {
      overallRisk,
      anomalyCount,
      complianceViolations,
      highRiskActions,
    },
    auditFindings: auditReport ? {
      fatal: auditReport.summary.fatal,
      error: auditReport.summary.error,
      warn: auditReport.summary.warn,
      info: auditReport.summary.info,
      passed: auditReport.summary.passed,
    } : undefined,
    trends: {
      receiptVelocity: Math.round((sorted.length / spanHours) * 100) / 100,
      riskTrend,
    },
  };

  reportHistory.push(report);
  if (reportHistory.length > MAX_REPORTS) reportHistory.splice(0, reportHistory.length - MAX_REPORTS);

  return report;
}

export function getReportHistory(): GovernanceReport[] {
  return [...reportHistory];
}

export function resetReports(): void {
  reportHistory.length = 0;
}
