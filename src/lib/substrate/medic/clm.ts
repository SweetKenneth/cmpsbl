/**
 * MEDIC CLM — Continuous Learning Module
 * Monitors repair success rates, quarantine load, active issues,
 * diagnostic throughput, and capacity utilization.
 */

export interface MedicCLMDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  metric?: number;
  threshold?: number;
  timestamp: number;
}

export interface MedicCLMReport {
  diagnostics: MedicCLMDiagnostic[];
  score: number;
  timestamp: number;
}

const THRESHOLDS = {
  /** Repair success rate below this triggers warning */
  LOW_REPAIR_SUCCESS: 70,
  /** Critical repair success rate */
  CRITICAL_REPAIR_SUCCESS: 40,
  /** Active issues count triggering warning */
  HIGH_ACTIVE_ISSUES: 5,
  /** Critical active issues */
  CRITICAL_ACTIVE_ISSUES: 15,
  /** Active quarantine entries */
  HIGH_QUARANTINE: 3,
  /** Unresolved diagnosis older than this (ms) */
  STALE_DIAGNOSIS_MS: 600_000, // 10 min
  /** Diagnosis store capacity */
  DIAGNOSIS_CAPACITY_WARN: 250,
  DIAGNOSIS_CAPACITY_MAX: 300,
  /** Repair store capacity */
  REPAIR_CAPACITY_WARN: 250,
  REPAIR_CAPACITY_MAX: 300,
  /** Min repairs for meaningful rate */
  MIN_REPAIR_SAMPLE: 5,
};

interface MedicStateShape {
  initialized: boolean;
  diagnoses: Array<{ id: string; severity: string; resolvedAt: number | null; diagnosedAt: number }>;
  quarantine: Array<{ releasedAt: number | null }>;
  repairs: Array<{ success: boolean }>;
  totalRepairs: number;
  successfulRepairs: number;
  overallHealth: number;
  activeIssues: Array<{ id: string }>;
}

export function runMedicCLM(state: MedicStateShape): MedicCLMReport {
  const diagnostics: MedicCLMDiagnostic[] = [];
  let deductions = 0;

  if (!state.initialized) {
    diagnostics.push({ id: 'medic-not-init', severity: 'critical', category: 'lifecycle', message: 'MEDIC module not initialized', timestamp: Date.now() });
    return { diagnostics, score: 0, timestamp: Date.now() };
  }

  // 1. Repair success rate
  if (state.totalRepairs >= THRESHOLDS.MIN_REPAIR_SAMPLE) {
    const rate = Math.round((state.successfulRepairs / state.totalRepairs) * 100);
    if (rate < THRESHOLDS.CRITICAL_REPAIR_SUCCESS) {
      diagnostics.push({ id: 'medic-critical-repair', severity: 'critical', category: 'reliability', message: `Repair success rate ${rate}% below critical ${THRESHOLDS.CRITICAL_REPAIR_SUCCESS}%`, metric: rate, threshold: THRESHOLDS.CRITICAL_REPAIR_SUCCESS, timestamp: Date.now() });
      deductions += 25;
    } else if (rate < THRESHOLDS.LOW_REPAIR_SUCCESS) {
      diagnostics.push({ id: 'medic-low-repair', severity: 'warning', category: 'reliability', message: `Repair success rate ${rate}% below ${THRESHOLDS.LOW_REPAIR_SUCCESS}%`, metric: rate, threshold: THRESHOLDS.LOW_REPAIR_SUCCESS, timestamp: Date.now() });
      deductions += 12;
    }
  }

  // 2. Active issues
  const issueCount = state.activeIssues.length;
  if (issueCount >= THRESHOLDS.CRITICAL_ACTIVE_ISSUES) {
    diagnostics.push({ id: 'medic-critical-issues', severity: 'critical', category: 'health', message: `${issueCount} active issues (critical ≥${THRESHOLDS.CRITICAL_ACTIVE_ISSUES})`, metric: issueCount, threshold: THRESHOLDS.CRITICAL_ACTIVE_ISSUES, timestamp: Date.now() });
    deductions += 20;
  } else if (issueCount >= THRESHOLDS.HIGH_ACTIVE_ISSUES) {
    diagnostics.push({ id: 'medic-high-issues', severity: 'warning', category: 'health', message: `${issueCount} active issues`, metric: issueCount, threshold: THRESHOLDS.HIGH_ACTIVE_ISSUES, timestamp: Date.now() });
    deductions += 10;
  }

  // 3. Quarantine load
  const activeQuarantine = state.quarantine.filter(q => !q.releasedAt).length;
  if (activeQuarantine >= THRESHOLDS.HIGH_QUARANTINE) {
    diagnostics.push({ id: 'medic-quarantine-load', severity: 'warning', category: 'isolation', message: `${activeQuarantine} module(s) quarantined`, metric: activeQuarantine, threshold: THRESHOLDS.HIGH_QUARANTINE, timestamp: Date.now() });
    deductions += Math.min(activeQuarantine * 5, 15);
  }

  // 4. Stale diagnoses
  const now = Date.now();
  const staleDiags = state.diagnoses.filter(d => !d.resolvedAt && d.severity !== 'healthy' && (now - d.diagnosedAt) > THRESHOLDS.STALE_DIAGNOSIS_MS);
  if (staleDiags.length > 0) {
    diagnostics.push({ id: 'medic-stale-diags', severity: 'info', category: 'freshness', message: `${staleDiags.length} unresolved diagnosis(es) older than ${THRESHOLDS.STALE_DIAGNOSIS_MS / 60_000}min`, metric: staleDiags.length, timestamp: Date.now() });
    deductions += Math.min(staleDiags.length * 2, 10);
  }

  // 5. Diagnosis capacity
  if (state.diagnoses.length >= THRESHOLDS.DIAGNOSIS_CAPACITY_WARN) {
    const severity = state.diagnoses.length >= THRESHOLDS.DIAGNOSIS_CAPACITY_MAX ? 'critical' : 'warning';
    diagnostics.push({ id: 'medic-diag-capacity', severity, category: 'capacity', message: `Diagnosis store at ${state.diagnoses.length}/${THRESHOLDS.DIAGNOSIS_CAPACITY_MAX}`, metric: state.diagnoses.length, threshold: THRESHOLDS.DIAGNOSIS_CAPACITY_MAX, timestamp: Date.now() });
    deductions += severity === 'critical' ? 10 : 5;
  }

  // 6. Repair capacity
  if (state.repairs.length >= THRESHOLDS.REPAIR_CAPACITY_WARN) {
    const severity = state.repairs.length >= THRESHOLDS.REPAIR_CAPACITY_MAX ? 'critical' : 'warning';
    diagnostics.push({ id: 'medic-repair-capacity', severity, category: 'capacity', message: `Repair store at ${state.repairs.length}/${THRESHOLDS.REPAIR_CAPACITY_MAX}`, metric: state.repairs.length, threshold: THRESHOLDS.REPAIR_CAPACITY_MAX, timestamp: Date.now() });
    deductions += severity === 'critical' ? 10 : 5;
  }

  const score = Math.max(0, Math.min(100, 100 - deductions));
  return { diagnostics, score, timestamp: Date.now() };
}
