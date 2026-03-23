/**
 * GOVERNANCE Ultimate — System 10: Governance Telemetry Nexus
 * 
 * Unified health from all governance systems: policy eval latency,
 * approval queue depth, veto rate, drift score, compliance pass rate,
 * decision chain integrity.
 * 
 * @module governance/ultimate/governanceTelemetryNexus
 */

import { getPolicyEngineStats } from './policyExpressionEngine';
import { getApprovalWorkflowStats } from './multiPartyApproval';
import { getVetoCascadeStats } from './vetoCascadeEngine';
import { getGovernanceStateMachineStats } from './governanceStateMachine';
import { getDriftCorrectionStats } from './driftCorrectionEngine';
import { getComplianceRuleEngineStats } from './complianceRuleEngine';
import { getDecisionChainStats } from './decisionAuditChain';
import { getGovernanceIntelligenceStats } from './governanceIntelligence';
import { getCrossNodeGateStats } from './crossNodePolicyGate';

// ── Types ────────────────────────────────────────────────────────

export interface GovernanceTelemetrySnapshot {
  id: string;
  timestamp: number;
  systems: {
    policyEngine: ReturnType<typeof getPolicyEngineStats>;
    approvalWorkflow: ReturnType<typeof getApprovalWorkflowStats>;
    vetoCascade: ReturnType<typeof getVetoCascadeStats>;
    stateMachine: ReturnType<typeof getGovernanceStateMachineStats>;
    driftCorrection: ReturnType<typeof getDriftCorrectionStats>;
    complianceEngine: ReturnType<typeof getComplianceRuleEngineStats>;
    decisionChain: ReturnType<typeof getDecisionChainStats>;
    intelligence: ReturnType<typeof getGovernanceIntelligenceStats>;
    crossNodeGates: ReturnType<typeof getCrossNodeGateStats>;
  };
  overallHealth: number;
}

export interface GovernanceTelemetryDashboard {
  snapshotCount: number;
  currentHealth: number;
  trend: 'improving' | 'stable' | 'degrading';
  lastSnapshotAt: number | null;
  criticalAlerts: string[];
}

// ── State ────────────────────────────────────────────────────────

const snapshots: GovernanceTelemetrySnapshot[] = [];
const MAX_SNAPSHOTS = 200;

// ── Core API ────────────────────────────────────────────────────

/** Capture a governance telemetry snapshot */
export function captureGovernanceSnapshot(): GovernanceTelemetrySnapshot {
  const policy = getPolicyEngineStats();
  const approval = getApprovalWorkflowStats();
  const veto = getVetoCascadeStats();
  const stateMachine = getGovernanceStateMachineStats();
  const drift = getDriftCorrectionStats();
  const compliance = getComplianceRuleEngineStats();
  const chain = getDecisionChainStats();
  const intelligence = getGovernanceIntelligenceStats();
  const gates = getCrossNodeGateStats();

  // Weighted health composite:
  // Approval latency (15%) + Veto rate (20%) + Drift score (20%) +
  // Compliance pass rate (25%) + Chain integrity (20%)
  const approvalScore = approval.pendingRequests < 10 ? 100 :
    Math.max(0, 100 - (approval.pendingRequests - 10) * 5);

  const vetoScore = veto.totalVetoes > 0
    ? Math.max(0, 100 - (veto.activeVetoes / Math.max(1, veto.totalVetoes)) * 100)
    : 100;

  const driftScore = Math.max(0, Math.round((1 - drift.currentDriftScore) * 100));

  const complianceScore = Math.round(compliance.passRate * 100);

  const chainScore = chain.chainIntact ? 100 : 0;

  const overallHealth = Math.round(
    approvalScore * 0.15 +
    vetoScore * 0.20 +
    driftScore * 0.20 +
    complianceScore * 0.25 +
    chainScore * 0.20
  );

  const snapshot: GovernanceTelemetrySnapshot = {
    id: `gsnap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    systems: {
      policyEngine: policy,
      approvalWorkflow: approval,
      vetoCascade: veto,
      stateMachine,
      driftCorrection: drift,
      complianceEngine: compliance,
      decisionChain: chain,
      intelligence,
      crossNodeGates: gates,
    },
    overallHealth: Math.max(0, Math.min(100, overallHealth)),
  };

  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);

  return snapshot;
}

/** Get dashboard with trend and alerts */
export function getGovernanceTelemetryDashboard(): GovernanceTelemetryDashboard {
  const alerts: string[] = [];

  if (snapshots.length === 0) {
    return { snapshotCount: 0, currentHealth: 100, trend: 'stable', lastSnapshotAt: null, criticalAlerts: [] };
  }

  const current = snapshots[snapshots.length - 1];

  // Generate alerts
  if (!current.systems.decisionChain.chainIntact) alerts.push('Decision chain integrity compromised');
  if (current.systems.driftCorrection.currentDriftScore > 0.5) alerts.push(`High governance drift: ${Math.round(current.systems.driftCorrection.currentDriftScore * 100)}%`);
  if (current.systems.approvalWorkflow.pendingRequests > 20) alerts.push(`Approval backlog: ${current.systems.approvalWorkflow.pendingRequests} pending`);
  if (current.systems.vetoCascade.activeVetoes > 10) alerts.push(`Active veto storm: ${current.systems.vetoCascade.activeVetoes} active vetoes`);
  if (current.systems.complianceEngine.failRate > 0.3) alerts.push(`Compliance failure rate: ${Math.round(current.systems.complianceEngine.failRate * 100)}%`);
  if (current.systems.intelligence.actionRequiredCount > 3) alerts.push(`${current.systems.intelligence.actionRequiredCount} governance patterns require action`);

  // Trend
  let trend: 'improving' | 'stable' | 'degrading' = 'stable';
  if (snapshots.length >= 10) {
    const recent = snapshots.slice(-5).reduce((s, sn) => s + sn.overallHealth, 0) / 5;
    const previous = snapshots.slice(-10, -5).reduce((s, sn) => s + sn.overallHealth, 0) / 5;
    if (recent > previous + 5) trend = 'improving';
    else if (recent < previous - 5) trend = 'degrading';
  }

  return {
    snapshotCount: snapshots.length,
    currentHealth: current.overallHealth,
    trend, lastSnapshotAt: current.timestamp,
    criticalAlerts: alerts,
  };
}

/** Get recent snapshots */
export function getGovernanceSnapshots(count?: number): GovernanceTelemetrySnapshot[] {
  return count ? snapshots.slice(-count) : [...snapshots];
}

export function resetGovernanceTelemetry(): void {
  snapshots.length = 0;
}
