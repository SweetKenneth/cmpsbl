/**
 * ATLAS CLM — Constant Learning Module
 * Monitors governance decision quality, pending backlog, mode drift,
 * proposal throughput, and decision latency.
 */

export interface AtlasCLMDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  metric?: number;
  threshold?: number;
  timestamp: number;
}

export interface AtlasCLMReport {
  diagnostics: AtlasCLMDiagnostic[];
  score: number;
  timestamp: number;
}

const THRESHOLDS = {
  PENDING_BACKLOG_WARN: 10,
  PENDING_BACKLOG_CRITICAL: 25,
  HIGH_REJECTION_RATE: 60,
  SLOW_DECISION_MS: 300_000, // 5 min avg
  LOCKDOWN_DURATION_WARN_MS: 600_000, // 10 min
  LOW_APPROVAL_RATE: 30,
  PROPOSAL_CAPACITY_WARN: 400,
  PROPOSAL_CAPACITY_MAX: 500,
  MIN_DECISIONS: 3,
};

interface AtlasStateShape {
  initialized: boolean;
  governanceMode: string;
  pendingProposals: number;
  totalDecisions: number;
  approvalRate: number;
  rejectionRate: number;
  avgDecisionLatencyMs: number;
  lastModeChange?: number;
}

export function runAtlasCLM(state: AtlasStateShape, proposalCount?: number): AtlasCLMReport {
  const diagnostics: AtlasCLMDiagnostic[] = [];
  let deductions = 0;

  if (!state.initialized) {
    diagnostics.push({ id: 'atlas-not-init', severity: 'critical', category: 'lifecycle', message: 'ATLAS module not initialized', timestamp: Date.now() });
    return { diagnostics, score: 0, timestamp: Date.now() };
  }

  // 1. Pending backlog
  if (state.pendingProposals >= THRESHOLDS.PENDING_BACKLOG_CRITICAL) {
    diagnostics.push({ id: 'atlas-backlog-critical', severity: 'critical', category: 'backlog', message: `${state.pendingProposals} proposals pending — governance bottleneck`, metric: state.pendingProposals, threshold: THRESHOLDS.PENDING_BACKLOG_CRITICAL, timestamp: Date.now() });
    deductions += 20;
  } else if (state.pendingProposals >= THRESHOLDS.PENDING_BACKLOG_WARN) {
    diagnostics.push({ id: 'atlas-backlog-warn', severity: 'warning', category: 'backlog', message: `${state.pendingProposals} proposals pending review`, metric: state.pendingProposals, threshold: THRESHOLDS.PENDING_BACKLOG_WARN, timestamp: Date.now() });
    deductions += 8;
  }

  // 2. High rejection rate
  if (state.totalDecisions >= THRESHOLDS.MIN_DECISIONS && state.rejectionRate >= THRESHOLDS.HIGH_REJECTION_RATE) {
    diagnostics.push({ id: 'atlas-high-rejection', severity: 'warning', category: 'quality', message: `Rejection rate ${state.rejectionRate}% — proposals may need better pre-screening`, metric: state.rejectionRate, threshold: THRESHOLDS.HIGH_REJECTION_RATE, timestamp: Date.now() });
    deductions += 10;
  }

  // 3. Low approval rate
  if (state.totalDecisions >= THRESHOLDS.MIN_DECISIONS && state.approvalRate < THRESHOLDS.LOW_APPROVAL_RATE) {
    diagnostics.push({ id: 'atlas-low-approval', severity: 'warning', category: 'effectiveness', message: `Approval rate only ${state.approvalRate}%`, metric: state.approvalRate, threshold: THRESHOLDS.LOW_APPROVAL_RATE, timestamp: Date.now() });
    deductions += 10;
  }

  // 4. Slow decision latency
  if (state.avgDecisionLatencyMs > THRESHOLDS.SLOW_DECISION_MS && state.totalDecisions >= THRESHOLDS.MIN_DECISIONS) {
    diagnostics.push({ id: 'atlas-slow-decisions', severity: 'info', category: 'performance', message: `Avg decision latency ${Math.round(state.avgDecisionLatencyMs / 1000)}s`, metric: state.avgDecisionLatencyMs, threshold: THRESHOLDS.SLOW_DECISION_MS, timestamp: Date.now() });
    deductions += 5;
  }

  // 5. Extended LOCKDOWN
  if (state.governanceMode === 'LOCKDOWN' && state.lastModeChange) {
    const lockdownDuration = Date.now() - state.lastModeChange;
    if (lockdownDuration > THRESHOLDS.LOCKDOWN_DURATION_WARN_MS) {
      diagnostics.push({ id: 'atlas-extended-lockdown', severity: 'warning', category: 'mode', message: `LOCKDOWN active for ${Math.round(lockdownDuration / 60_000)}min`, metric: lockdownDuration, threshold: THRESHOLDS.LOCKDOWN_DURATION_WARN_MS, timestamp: Date.now() });
      deductions += 10;
    }
  }

  // 6. Proposal capacity
  if (proposalCount !== undefined && proposalCount >= THRESHOLDS.PROPOSAL_CAPACITY_WARN) {
    const severity = proposalCount >= THRESHOLDS.PROPOSAL_CAPACITY_MAX ? 'critical' : 'warning';
    diagnostics.push({ id: 'atlas-capacity', severity, category: 'capacity', message: `Proposal store at ${proposalCount}/${THRESHOLDS.PROPOSAL_CAPACITY_MAX}`, metric: proposalCount, threshold: THRESHOLDS.PROPOSAL_CAPACITY_MAX, timestamp: Date.now() });
    deductions += severity === 'critical' ? 10 : 5;
  }

  const score = Math.max(0, Math.min(100, 100 - deductions));
  return { diagnostics, score, timestamp: Date.now() };
}
