/**
 * Clockless Governance Control Plane
 * Centralized mode controller for CLM, Dream, and Evolution subsystems.
 * Admin-only. No end-user visibility.
 */

export type GovernanceMode = 'ACTIVE' | 'OBSERVE' | 'LOCKDOWN' | 'EVOLVE';

export interface GovernanceModeRecord {
  id: string;
  mode: GovernanceMode;
  changed_by: string | null;
  changed_at: string;
  reason: string;
  ttl_minutes: number | null;
  expires_at: string | null;
}

export interface GovernanceAuditEntry {
  id: string;
  previous_mode: string;
  new_mode: string;
  changed_by: string | null;
  reason: string;
  ttl_minutes: number | null;
  affected_subsystems: string[];
  auto_reverted: boolean;
  created_at: string;
}

/** Subsystem state derived from governance mode */
export interface SubsystemState {
  clm: boolean;
  dream: boolean;
  evolution: boolean;
  schedulers: boolean;
  mutations: boolean;
  rateLimitingAggressive: boolean;
  canaryRequired: boolean;
  autoRollback: boolean;
}

/** Derive subsystem states from the governance mode */
export function getSubsystemState(mode: GovernanceMode): SubsystemState {
  switch (mode) {
    case 'ACTIVE':
      return {
        clm: true,
        dream: true,
        evolution: true,
        schedulers: true,
        mutations: true,
        rateLimitingAggressive: false,
        canaryRequired: false,
        autoRollback: false,
      };
    case 'OBSERVE':
      return {
        clm: false,
        dream: false,
        evolution: false,
        schedulers: false,
        mutations: false,
        rateLimitingAggressive: false,
        canaryRequired: false,
        autoRollback: false,
      };
    case 'LOCKDOWN':
      return {
        clm: false,
        dream: false,
        evolution: false,
        schedulers: false,
        mutations: false,
        rateLimitingAggressive: true,
        canaryRequired: false,
        autoRollback: false,
      };
    case 'EVOLVE':
      return {
        clm: true,
        dream: true,
        evolution: true,
        schedulers: true,
        mutations: true,
        rateLimitingAggressive: false,
        canaryRequired: true,
        autoRollback: true,
      };
  }
}

/** Mode metadata for UI display */
export const GOVERNANCE_MODE_META: Record<GovernanceMode, {
  label: string;
  description: string;
  color: string;
  icon: string;
}> = {
  ACTIVE: {
    label: 'Active',
    description: 'All subsystems running normally. Default Clockless behavior.',
    color: 'text-green-400',
    icon: '🟢',
  },
  OBSERVE: {
    label: 'Observe',
    description: 'Quiet mode. CLM/Dream/Evolution paused. Read-only telemetry only.',
    color: 'text-yellow-400',
    icon: '🟡',
  },
  LOCKDOWN: {
    label: 'Lockdown',
    description: 'Incident mode. Only auth, continuity, core API, audit logging, and health.',
    color: 'text-red-400',
    icon: '🔴',
  },
  EVOLVE: {
    label: 'Evolve',
    description: 'Admin-directed acceleration. Canary rollouts required, auto-rollback enabled.',
    color: 'text-blue-400',
    icon: '🔵',
  },
};

/** Affected subsystems summary for audit logging */
export function getAffectedSubsystems(fromMode: GovernanceMode, toMode: GovernanceMode): string[] {
  const fromState = getSubsystemState(fromMode);
  const toState = getSubsystemState(toMode);
  const affected: string[] = [];

  if (fromState.clm !== toState.clm) affected.push('clm');
  if (fromState.dream !== toState.dream) affected.push('dream');
  if (fromState.evolution !== toState.evolution) affected.push('evolution');
  if (fromState.schedulers !== toState.schedulers) affected.push('schedulers');
  if (fromState.mutations !== toState.mutations) affected.push('mutations');
  if (fromState.rateLimitingAggressive !== toState.rateLimitingAggressive) affected.push('rate_limiting');

  return affected;
}
