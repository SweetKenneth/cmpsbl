/**
 * ATLAS Governance Hub — System Authority Interface
 * 
 * Flow: engineer_findings → intel_aggregation → atlas_proposal
 *       → governor_decision → system_action
 * 
 * Governance Modes: ACTIVE, OBSERVE, LOCKDOWN, EVOLVE
 * 
 * Controls:
 *   - SEBA enable/disable
 *   - CLM throttle
 *   - Evolution velocity
 *   - Capability registry access
 */

import { emit } from '../events/emit';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type GovernanceMode = 'ACTIVE' | 'OBSERVE' | 'LOCKDOWN' | 'EVOLVE';

export interface AtlasProposal {
  id: string;
  source: string; // ENGINEER, INTEL, SCANNER, etc.
  title: string;
  description: string;
  impactAssessment: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected' | 'deferred';
  governorDecision?: {
    decision: 'approve' | 'reject' | 'defer';
    reason: string;
    decidedAt: number;
  };
}

export interface AtlasState {
  mode: GovernanceMode;
  sebaEnabled: boolean;
  clmThrottle: number; // 0–1, where 1 = full speed
  evolutionVelocity: number; // mutations per hour cap
  capabilityRegistryLocked: boolean;
  pendingProposals: number;
  totalDecisions: number;
  lastModeChange: number;
}

export interface SystemControl {
  key: string;
  label: string;
  current: unknown;
  type: 'boolean' | 'number' | 'mode';
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const state: AtlasState = {
  mode: 'ACTIVE',
  sebaEnabled: true,
  clmThrottle: 1.0,
  evolutionVelocity: 5,
  capabilityRegistryLocked: false,
  pendingProposals: 0,
  totalDecisions: 0,
  lastModeChange: Date.now(),
};

const proposals: AtlasProposal[] = [];
const MAX_PROPOSALS = 500;

// ═══════════════════════════════════════════════════════════════
// GOVERNANCE MODE
// ═══════════════════════════════════════════════════════════════

export function setGovernanceMode(mode: GovernanceMode): void {
  const prev = state.mode;
  state.mode = mode;
  state.lastModeChange = Date.now();

  // Mode-specific behavior
  switch (mode) {
    case 'LOCKDOWN':
      state.sebaEnabled = false;
      state.evolutionVelocity = 0;
      state.capabilityRegistryLocked = true;
      break;
    case 'OBSERVE':
      state.evolutionVelocity = 0;
      break;
    case 'EVOLVE':
      state.sebaEnabled = true;
      state.evolutionVelocity = 10; // Increased velocity
      break;
    case 'ACTIVE':
      // Restore defaults
      state.sebaEnabled = true;
      state.evolutionVelocity = 5;
      state.capabilityRegistryLocked = false;
      break;
  }

  emit({
    module: 'atlas',
    event_type: 'mode.changed',
    outcome: 'succeeded',
    data: { previous: prev, current: mode },
  });
}

export function getGovernanceMode(): GovernanceMode {
  return state.mode;
}

// ═══════════════════════════════════════════════════════════════
// PROPOSAL LIFECYCLE
// ═══════════════════════════════════════════════════════════════

export function submitProposal(
  source: string,
  title: string,
  description: string,
  impactAssessment: string,
  riskLevel: AtlasProposal['riskLevel'] = 'low'
): AtlasProposal {
  const proposal: AtlasProposal = {
    id: `prop-${crypto.randomUUID().slice(0, 8)}`,
    source,
    title,
    description,
    impactAssessment,
    riskLevel,
    actionRequired: riskLevel !== 'low',
    createdAt: Date.now(),
    status: 'pending',
  };

  proposals.push(proposal);
  if (proposals.length > MAX_PROPOSALS) proposals.shift();
  state.pendingProposals = proposals.filter(p => p.status === 'pending').length;

  // In LOCKDOWN, auto-reject non-critical proposals
  if (state.mode === 'LOCKDOWN' && riskLevel !== 'critical') {
    proposal.status = 'rejected';
    proposal.governorDecision = {
      decision: 'reject',
      reason: 'System in LOCKDOWN mode — only critical proposals accepted',
      decidedAt: Date.now(),
    };
    state.pendingProposals = proposals.filter(p => p.status === 'pending').length;
  }

  emit({
    module: 'atlas',
    event_type: 'proposal.submitted',
    outcome: 'succeeded',
    data: { proposal_id: proposal.id, source, risk: riskLevel, status: proposal.status },
  });

  return proposal;
}

export function decideProposal(
  proposalId: string,
  decision: 'approve' | 'reject' | 'defer',
  reason: string
): AtlasProposal | null {
  const proposal = proposals.find(p => p.id === proposalId);
  if (!proposal || proposal.status !== 'pending') return null;

  proposal.status = decision === 'approve' ? 'approved'
    : decision === 'defer' ? 'deferred'
    : 'rejected';

  proposal.governorDecision = {
    decision,
    reason,
    decidedAt: Date.now(),
  };

  state.totalDecisions++;
  state.pendingProposals = proposals.filter(p => p.status === 'pending').length;

  emit({
    module: 'atlas',
    event_type: `proposal.${decision}`,
    outcome: 'succeeded',
    data: { proposal_id: proposalId, decision, reason },
  });

  return proposal;
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM CONTROLS
// ═══════════════════════════════════════════════════════════════

export function setSebaEnabled(enabled: boolean): void {
  state.sebaEnabled = enabled;
  emit({ module: 'atlas', event_type: 'control.seba', outcome: 'succeeded', data: { enabled } });
}

export function setCLMThrottle(throttle: number): void {
  state.clmThrottle = Math.max(0, Math.min(1, throttle));
  emit({ module: 'atlas', event_type: 'control.clm_throttle', outcome: 'succeeded', data: { throttle: state.clmThrottle } });
}

export function setEvolutionVelocity(velocity: number): void {
  state.evolutionVelocity = Math.max(0, Math.min(20, velocity));
  emit({ module: 'atlas', event_type: 'control.evolution_velocity', outcome: 'succeeded', data: { velocity: state.evolutionVelocity } });
}

export function setCapabilityRegistryLocked(locked: boolean): void {
  state.capabilityRegistryLocked = locked;
  emit({ module: 'atlas', event_type: 'control.capability_lock', outcome: 'succeeded', data: { locked } });
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

export function getAtlasState(): AtlasState {
  return { ...state };
}

export function getPendingProposals(): AtlasProposal[] {
  return proposals.filter(p => p.status === 'pending');
}

export function getProposalHistory(limit = 50): AtlasProposal[] {
  return proposals.slice(-limit);
}

export function getSystemControls(): SystemControl[] {
  return [
    { key: 'governance_mode', label: 'Governance Mode', current: state.mode, type: 'mode' },
    { key: 'seba_enabled', label: 'SEBA Enabled', current: state.sebaEnabled, type: 'boolean' },
    { key: 'clm_throttle', label: 'CLM Throttle', current: state.clmThrottle, type: 'number' },
    { key: 'evolution_velocity', label: 'Evolution Velocity', current: state.evolutionVelocity, type: 'number' },
    { key: 'capability_lock', label: 'Capability Registry Locked', current: state.capabilityRegistryLocked, type: 'boolean' },
  ];
}
