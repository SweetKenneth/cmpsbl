/**
 * GOVERNANCE Ultimate Form — v9.0.0 "Parliament Prime"
 * Unified export and lifecycle API for all 10 Ultimate Form systems.
 *
 * Systems:
 *  1. Policy Expression Engine
 *  2. Multi-Party Approval Workflow
 *  3. Veto Cascade Engine
 *  4. Governance State Machine
 *  5. Drift Detection & Correction
 *  6. Compliance Rule Engine
 *  7. Decision Audit Chain
 *  8. Governance Intelligence (CLM)
 *  9. Cross-Node Policy Enforcement
 * 10. Governance Telemetry Nexus
 */

// ── Exports ─────────────────────────────────────────────────────
export * from './policyExpressionEngine';
export * from './multiPartyApproval';
export * from './vetoCascadeEngine';
export * from './governanceStateMachine';
export * from './driftCorrectionEngine';
export * from './complianceRuleEngine';
export * from './decisionAuditChain';
export * from './governanceIntelligence';
export * from './crossNodePolicyGate';
export * from './governanceTelemetryNexus';

// ── Imports for Lifecycle ───────────────────────────────────────
import { getPolicyEngineStats, resetPolicyEngine } from './policyExpressionEngine';
import { getApprovalWorkflowStats, resetApprovalWorkflow } from './multiPartyApproval';
import { getVetoCascadeStats, resetVetoCascade } from './vetoCascadeEngine';
import { getGovernanceStateMachineStats, getCurrentMode, resetGovernanceStateMachine } from './governanceStateMachine';
import { getDriftCorrectionStats, resetDriftCorrection } from './driftCorrectionEngine';
import { getComplianceRuleEngineStats, resetComplianceRuleEngine } from './complianceRuleEngine';
import { getDecisionChainStats, verifyChainIntegrity, resetDecisionChain } from './decisionAuditChain';
import { getGovernanceIntelligenceStats, resetGovernanceIntelligence } from './governanceIntelligence';
import { getCrossNodeGateStats, resetCrossNodeGates } from './crossNodePolicyGate';
import { getGovernanceTelemetryDashboard, resetGovernanceTelemetry } from './governanceTelemetryNexus';

// ═══════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════

export interface GovernanceUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    policyEngine: { healthy: boolean; policies: number; denyRate: number };
    approvalWorkflow: { healthy: boolean; pending: number; avgResolutionMs: number };
    vetoCascade: { healthy: boolean; activeVetoes: number; cascadedCount: number };
    stateMachine: { healthy: boolean; currentMode: string; transitions: number };
    driftCorrection: { healthy: boolean; driftScore: number; velocity: number };
    complianceEngine: { healthy: boolean; passRate: number; enabledRules: number };
    decisionChain: { healthy: boolean; chainIntact: boolean; entries: number };
    intelligence: { healthy: boolean; avgEffectiveness: number; actionRequired: number };
    crossNodeGates: { healthy: boolean; nodesGated: number; denyRate: number };
    telemetryNexus: { healthy: boolean; health: number; trend: string };
  };
  overallHealth: number;
}

let initialized = false;

export function initGovernanceUltimate(): void {
  if (initialized) return;
  initialized = true;
  console.log('[GOVERNANCE] Ultimate Form v9.0.0 "Parliament Prime" initialized — 10 systems online');
}

export function governanceUltimateHealth(): GovernanceUltimateHealth {
  const policy = getPolicyEngineStats();
  const approval = getApprovalWorkflowStats();
  const veto = getVetoCascadeStats();
  const sm = getGovernanceStateMachineStats();
  const drift = getDriftCorrectionStats();
  const compliance = getComplianceRuleEngineStats();
  const chain = getDecisionChainStats();
  const intel = getGovernanceIntelligenceStats();
  const gates = getCrossNodeGateStats();
  const dashboard = getGovernanceTelemetryDashboard();
  const chainIntegrity = verifyChainIntegrity();

  const totalEvals = policy.totalEvaluations || 1;

  const systems = {
    policyEngine: { healthy: policy.denyCount / totalEvals < 0.5, policies: policy.activePolicies, denyRate: Math.round((policy.denyCount / totalEvals) * 1000) / 1000 },
    approvalWorkflow: { healthy: approval.pendingRequests < 20, pending: approval.pendingRequests, avgResolutionMs: approval.avgResolutionTimeMs },
    vetoCascade: { healthy: veto.activeVetoes < 10, activeVetoes: veto.activeVetoes, cascadedCount: veto.cascadedVetoes },
    stateMachine: { healthy: getCurrentMode() !== 'EMERGENCY', currentMode: getCurrentMode(), transitions: sm.totalTransitions },
    driftCorrection: { healthy: drift.currentDriftScore < 0.5, driftScore: Math.round(drift.currentDriftScore * 1000) / 1000, velocity: drift.driftVelocity },
    complianceEngine: { healthy: compliance.passRate > 0.7 || compliance.totalEvaluations === 0, passRate: compliance.passRate, enabledRules: compliance.enabledRules },
    decisionChain: { healthy: chainIntegrity.intact, chainIntact: chainIntegrity.intact, entries: chain.totalEntries },
    intelligence: { healthy: intel.actionRequiredCount < 5, avgEffectiveness: intel.avgEffectivenessScore, actionRequired: intel.actionRequiredCount },
    crossNodeGates: { healthy: gates.denyRate < 0.5, nodesGated: gates.nodesWithGates, denyRate: gates.denyRate },
    telemetryNexus: { healthy: dashboard.trend !== 'degrading', health: dashboard.currentHealth, trend: dashboard.trend },
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '9.0.0', codename: 'Parliament Prime', initialized, systems, overallHealth };
}

export function governanceUltimateResilience(): {
  policyEngineStable: boolean;
  noApprovalBacklog: boolean;
  noVetoStorm: boolean;
  driftControlled: boolean;
  chainIntact: boolean;
} {
  const approval = getApprovalWorkflowStats();
  const veto = getVetoCascadeStats();
  const drift = getDriftCorrectionStats();
  const chain = verifyChainIntegrity();

  return {
    policyEngineStable: getPolicyEngineStats().totalEvaluations === 0 || getPolicyEngineStats().denyCount / getPolicyEngineStats().totalEvaluations < 0.3,
    noApprovalBacklog: approval.pendingRequests < 15,
    noVetoStorm: veto.activeVetoes < 5,
    driftControlled: drift.currentDriftScore < 0.3,
    chainIntact: chain.intact,
  };
}

export function resetGovernanceUltimate(): void {
  resetPolicyEngine();
  resetApprovalWorkflow();
  resetVetoCascade();
  resetGovernanceStateMachine();
  resetDriftCorrection();
  resetComplianceRuleEngine();
  resetDecisionChain();
  resetGovernanceIntelligence();
  resetCrossNodeGates();
  resetGovernanceTelemetry();
  initialized = false;
}
