/**
 * MODERNIZER CLM — Continuous Learning Module
 * Monitors scan effectiveness, proposal approval rates, risk trends,
 * pending backlog, and capacity utilization.
 */

export interface ModernizerCLMDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  metric?: number;
  threshold?: number;
  timestamp: number;
}

export interface ModernizerCLMReport {
  diagnostics: ModernizerCLMDiagnostic[];
  score: number;
  timestamp: number;
}

const THRESHOLDS = {
  LOW_APPROVAL_RATE: 50,
  HIGH_RISK_SCORE: 60,
  CRITICAL_RISK_SCORE: 80,
  PENDING_BACKLOG_WARN: 10,
  PENDING_BACKLOG_CRITICAL: 25,
  SCAN_CAPACITY_WARN: 80,
  SCAN_CAPACITY_MAX: 100,
  PROPOSAL_CAPACITY_WARN: 170,
  PROPOSAL_CAPACITY_MAX: 200,
  HIGH_REJECTION_RATE: 0.4,
  MIN_SAMPLE: 3,
};

interface ModernizerStateShape {
  initialized: boolean;
  scans: Array<{ riskScore: number; findingsCount: number }>;
  proposals: Array<{ status: string; riskLevel: string; confidence: number }>;
  totalScans: number;
  totalProposals: number;
  approvalRate: number;
  avgRiskScore: number;
  pendingProposals: number;
}

export function runModernizerCLM(state: ModernizerStateShape): ModernizerCLMReport {
  const diagnostics: ModernizerCLMDiagnostic[] = [];
  let deductions = 0;

  if (!state.initialized) {
    diagnostics.push({ id: 'mod-not-init', severity: 'critical', category: 'lifecycle', message: 'MODERNIZER module not initialized', timestamp: Date.now() });
    return { diagnostics, score: 0, timestamp: Date.now() };
  }

  // 1. Average risk score
  if (state.totalScans >= THRESHOLDS.MIN_SAMPLE) {
    if (state.avgRiskScore >= THRESHOLDS.CRITICAL_RISK_SCORE) {
      diagnostics.push({ id: 'mod-critical-risk', severity: 'critical', category: 'risk', message: `Avg risk score ${state.avgRiskScore} critically high`, metric: state.avgRiskScore, threshold: THRESHOLDS.CRITICAL_RISK_SCORE, timestamp: Date.now() });
      deductions += 20;
    } else if (state.avgRiskScore >= THRESHOLDS.HIGH_RISK_SCORE) {
      diagnostics.push({ id: 'mod-high-risk', severity: 'warning', category: 'risk', message: `Avg risk score ${state.avgRiskScore} above ${THRESHOLDS.HIGH_RISK_SCORE}`, metric: state.avgRiskScore, threshold: THRESHOLDS.HIGH_RISK_SCORE, timestamp: Date.now() });
      deductions += 10;
    }
  }

  // 2. Low approval rate
  if (state.totalProposals >= THRESHOLDS.MIN_SAMPLE && state.approvalRate < THRESHOLDS.LOW_APPROVAL_RATE) {
    diagnostics.push({ id: 'mod-low-approval', severity: 'warning', category: 'effectiveness', message: `Proposal approval rate ${state.approvalRate}% below ${THRESHOLDS.LOW_APPROVAL_RATE}%`, metric: state.approvalRate, threshold: THRESHOLDS.LOW_APPROVAL_RATE, timestamp: Date.now() });
    deductions += 12;
  }

  // 3. Pending backlog
  if (state.pendingProposals >= THRESHOLDS.PENDING_BACKLOG_CRITICAL) {
    diagnostics.push({ id: 'mod-backlog-critical', severity: 'critical', category: 'backlog', message: `${state.pendingProposals} proposals awaiting review`, metric: state.pendingProposals, threshold: THRESHOLDS.PENDING_BACKLOG_CRITICAL, timestamp: Date.now() });
    deductions += 15;
  } else if (state.pendingProposals >= THRESHOLDS.PENDING_BACKLOG_WARN) {
    diagnostics.push({ id: 'mod-backlog-warn', severity: 'warning', category: 'backlog', message: `${state.pendingProposals} proposals awaiting review`, metric: state.pendingProposals, threshold: THRESHOLDS.PENDING_BACKLOG_WARN, timestamp: Date.now() });
    deductions += 5;
  }

  // 4. High rejection of high-confidence proposals
  const rejected = state.proposals.filter(p => p.status === 'rejected' && p.confidence > 0.7);
  if (rejected.length >= THRESHOLDS.MIN_SAMPLE) {
    diagnostics.push({ id: 'mod-high-conf-rejections', severity: 'info', category: 'calibration', message: `${rejected.length} high-confidence proposals rejected — recalibrate scoring`, metric: rejected.length, timestamp: Date.now() });
    deductions += 5;
  }

  // 5. Scan capacity
  if (state.scans.length >= THRESHOLDS.SCAN_CAPACITY_WARN) {
    const severity = state.scans.length >= THRESHOLDS.SCAN_CAPACITY_MAX ? 'critical' : 'warning';
    diagnostics.push({ id: 'mod-scan-capacity', severity, category: 'capacity', message: `Scan store at ${state.scans.length}/${THRESHOLDS.SCAN_CAPACITY_MAX}`, metric: state.scans.length, threshold: THRESHOLDS.SCAN_CAPACITY_MAX, timestamp: Date.now() });
    deductions += severity === 'critical' ? 10 : 5;
  }

  // 6. Proposal capacity
  if (state.proposals.length >= THRESHOLDS.PROPOSAL_CAPACITY_WARN) {
    const severity = state.proposals.length >= THRESHOLDS.PROPOSAL_CAPACITY_MAX ? 'critical' : 'warning';
    diagnostics.push({ id: 'mod-prop-capacity', severity, category: 'capacity', message: `Proposal store at ${state.proposals.length}/${THRESHOLDS.PROPOSAL_CAPACITY_MAX}`, metric: state.proposals.length, threshold: THRESHOLDS.PROPOSAL_CAPACITY_MAX, timestamp: Date.now() });
    deductions += severity === 'critical' ? 10 : 5;
  }

  const score = Math.max(0, Math.min(100, 100 - deductions));
  return { diagnostics, score, timestamp: Date.now() };
}
