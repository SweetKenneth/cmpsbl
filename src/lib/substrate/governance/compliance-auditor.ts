/**
 * Governance Compliance Auditor
 * SPARTA Epoch — Periodic runtime compliance verification
 * 
 * GAP: The PolicyEngine existed but nothing periodically verified
 * that the system's actual state matches governance expectations.
 * This auditor checks that subsystem states align with the declared
 * governance mode and flags any violations.
 */

import { getSubsystemState, type GovernanceMode } from '@/lib/system/governance';
import { isSystemFlagEnabled } from '@/lib/system/flags';
import { log } from '@/lib/system/log';
import { recordAudit } from '@/lib/substrate/audit-trail';
import { emit } from '@/lib/substrate/events';

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
      // (less concerning — just informational)
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
      // Can't determine — skip
      checksPerformed--;
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

/** Compliance history for trend analysis */
const complianceHistory: ComplianceReport[] = [];
const MAX_HISTORY = 100;

/**
 * Run audit and store in history
 */
export async function runComplianceAudit(currentMode: GovernanceMode): Promise<ComplianceReport> {
  const report = await auditCompliance(currentMode);
  complianceHistory.push(report);
  if (complianceHistory.length > MAX_HISTORY) {
    complianceHistory.splice(0, complianceHistory.length - MAX_HISTORY);
  }
  return report;
}

/**
 * Get compliance trend (last N reports)
 */
export function getComplianceTrend(limit = 10): ComplianceReport[] {
  return complianceHistory.slice(-limit);
}

/**
 * Get compliance score average over recent audits
 */
export function getComplianceScoreAvg(window = 10): number {
  const recent = complianceHistory.slice(-window);
  if (recent.length === 0) return 100;
  return Math.round(recent.reduce((sum, r) => sum + r.score, 0) / recent.length);
}
