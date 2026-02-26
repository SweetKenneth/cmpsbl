/**
 * Governance Compliance Auditor
 * SPARTA Epoch v11.5.2 — No silent skips, DB-persisted reports
 * 
 * Verifies runtime subsystem states match governance mode expectations.
 * Unknown/undeterminable flags produce WARNING violations, never silent skips.
 */

import { getSubsystemState, type GovernanceMode } from '@/lib/system/governance';
import { isSystemFlagEnabled } from '@/lib/system/flags';
import { log } from '@/lib/system/log';
import { recordAudit } from '@/lib/substrate/audit-trail';
import { emit } from '@/lib/substrate/events';
import { supabase } from '@/integrations/supabase/client';

export interface ComplianceViolation {
  subsystem: string;
  expected: boolean;
  actual: boolean;
  severity: 'warning' | 'critical';
  message: string;
  detectedAt: string;
}

export interface ComplianceReport {
  mode: GovernanceMode;
  timestamp: string;
  compliant: boolean;
  violations: ComplianceViolation[];
  checksPerformed: number;
  score: number; // 0-100
}

/** Flag keys mapped to subsystem names */
const SUBSYSTEM_FLAG_MAP: Record<string, string> = {
  clm: 'clm_enabled',
  dream: 'dream_enabled',
  evolution: 'evolution_enabled',
  schedulers: 'schedulers_enabled',
  mutations: 'mutations_enabled',
};

/**
 * Run a compliance audit comparing declared governance mode
 * against actual subsystem flag states.
 */
export async function auditCompliance(currentMode: GovernanceMode): Promise<ComplianceReport> {
  const expectedState = getSubsystemState(currentMode);
  const violations: ComplianceViolation[] = [];
  let checksPerformed = 0;

  // In ACTIVE mode, subsystem flags are authoritative — no compliance check needed
  if (currentMode === 'ACTIVE') {
    return {
      mode: currentMode,
      timestamp: new Date().toISOString(),
      compliant: true,
      violations: [],
      checksPerformed: 0,
      score: 100,
    };
  }

  // Check each gated subsystem
  for (const [subsystem, flagKey] of Object.entries(SUBSYSTEM_FLAG_MAP)) {
    checksPerformed++;
    const expected = expectedState[subsystem as keyof typeof expectedState] as boolean;

    try {
      const actual = await isSystemFlagEnabled(flagKey);

      // Violation: subsystem running when governance says it should be off
      if (actual && !expected) {
        violations.push({
          subsystem,
          expected,
          actual,
          severity: 'critical',
          message: `${subsystem.toUpperCase()} is ACTIVE but governance mode ${currentMode} requires it to be OFF`,
          detectedAt: new Date().toISOString(),
        });
      }

      // Soft violation: subsystem off when governance says it could be on
      if (!actual && expected) {
        violations.push({
          subsystem,
          expected,
          actual,
          severity: 'warning',
          message: `${subsystem.toUpperCase()} is OFF but governance mode ${currentMode} permits it to be ACTIVE`,
          detectedAt: new Date().toISOString(),
        });
      }
    } catch {
      // Cannot determine flag state — WARNING violation, NOT silent skip
      violations.push({
        subsystem,
        expected,
        actual: false,
        severity: 'warning',
        message: `Cannot verify ${flagKey}: flag state undeterminable for ${subsystem.toUpperCase()}`,
        detectedAt: new Date().toISOString(),
      });
    }
  }

  const criticalCount = violations.filter(v => v.severity === 'critical').length;
  const score = checksPerformed > 0
    ? Math.max(0, Math.round(100 - (criticalCount / checksPerformed) * 100))
    : 100;

  const report: ComplianceReport = {
    mode: currentMode,
    timestamp: new Date().toISOString(),
    compliant: criticalCount === 0,
    violations,
    checksPerformed,
    score,
  };

  // Log violations
  if (criticalCount > 0) {
    log.error('governance', `Compliance audit FAILED: ${criticalCount} critical violations in ${currentMode} mode`);

    recordAudit(
      'compliance-auditor',
      'governance.compliance.failed',
      'governance_mode',
      currentMode,
      currentMode,
      currentMode,
      {
        violations: String(criticalCount),
        score: String(score),
        details: violations.filter(v => v.severity === 'critical').map(v => v.message).join('; '),
      }
    );

    emit({
      module: 'GOVERNANCE',
      event_type: 'governance.compliance.violation',
      outcome: 'failed',
      data: { mode: currentMode, violations: criticalCount, score },
    });
  }

  return report;
}

/** Compliance history for trend analysis (in-memory cache) */
const complianceHistory: ComplianceReport[] = [];
const MAX_HISTORY = 100;

/**
 * Run audit, store in history + persist to DB.
 */
export async function runComplianceAudit(currentMode: GovernanceMode): Promise<ComplianceReport> {
  const report = await auditCompliance(currentMode);

  // In-memory cache
  complianceHistory.push(report);
  if (complianceHistory.length > MAX_HISTORY) {
    complianceHistory.splice(0, complianceHistory.length - MAX_HISTORY);
  }

  // Persist to DB
  try {
    await supabase.from('governance_compliance_reports').insert({
      mode: report.mode,
      score: report.score,
      compliant: report.compliant,
      violations: report.violations as any,
      checks_performed: report.checksPerformed,
    });
  } catch {
    log.warn('governance', 'Failed to persist compliance report to DB');
  }

  return report;
}

/**
 * Get compliance trend (last N reports), preferring DB.
 */
export async function getComplianceTrend(limit = 10): Promise<ComplianceReport[]> {
  try {
    const { data } = await supabase
      .from('governance_compliance_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (data && data.length > 0) {
      return data.map((r: any) => ({
        mode: r.mode as GovernanceMode,
        timestamp: r.created_at,
        compliant: r.compliant,
        violations: r.violations || [],
        checksPerformed: r.checks_performed,
        score: r.score,
      }));
    }
  } catch {
    // Fallback to in-memory
  }
  return complianceHistory.slice(-limit);
}

/**
 * Get last compliance report.
 */
export async function getLastComplianceReport(): Promise<ComplianceReport | null> {
  const trend = await getComplianceTrend(1);
  return trend.length > 0 ? trend[0] : null;
}

/**
 * Get compliance score average over recent audits
 */
export function getComplianceScoreAvg(window = 10): number {
  const recent = complianceHistory.slice(-window);
  if (recent.length === 0) return 100;
  return Math.round(recent.reduce((sum, r) => sum + r.score, 0) / recent.length);
}
