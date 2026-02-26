/**
 * Veto → Governance Bridge
 * SPARTA Epoch — Connects the veto authority system to governance mode
 * 
 * GAP: Critical vetoes (especially from DEFENSE/AUDIT) had no mechanism
 * to influence governance mode. A defense veto should escalate to LOCKDOWN
 * and governance lockdowns should auto-issue scope-wide vetoes.
 * 
 * Bidirectional:
 * - Multiple defense vetoes → auto-escalate governance to LOCKDOWN
 * - Governance LOCKDOWN → auto-issue write_access + external_integrations vetoes
 * - Governance ACTIVE restore → auto-revoke system-issued vetoes
 */

import { vetoAuthority, type VetoRequest } from './veto-authority';
import { recordAudit } from '@/lib/substrate/audit-trail';
import { emit } from '@/lib/substrate/events';
import { log } from '@/lib/system/log';
import type { GovernanceMode } from '@/lib/system/governance';

export interface VetoGovernanceEscalation {
  shouldEscalate: boolean;
  targetMode: GovernanceMode;
  reason: string;
  triggeringVetoes: string[];
}

/** Governance-issued veto IDs for cleanup on de-escalation */
const governanceIssuedVetoes: Set<string> = new Set();

/**
 * Evaluate whether active vetoes should trigger governance escalation.
 * Call this after any veto is accepted.
 */
export function evaluateVetoEscalation(currentMode: GovernanceMode): VetoGovernanceEscalation | null {
  if (currentMode === 'LOCKDOWN') return null; // Already at maximum

  const activeVetoes = vetoAuthority.getActiveVetoes();
  const defenseVetoes = activeVetoes.filter(v => v.authority === 'defense');
  const auditVetoes = activeVetoes.filter(v => v.authority === 'audit');
  const criticalVetoes = activeVetoes.filter(v => v.severity === 'critical');

  // Any audit veto → immediate LOCKDOWN
  if (auditVetoes.length > 0) {
    return {
      shouldEscalate: true,
      targetMode: 'LOCKDOWN',
      reason: `Audit authority veto active — mandatory lockdown`,
      triggeringVetoes: auditVetoes.map(v => v.id),
    };
  }

  // 2+ defense vetoes or any critical defense veto → LOCKDOWN
  if (defenseVetoes.length >= 2 || defenseVetoes.some(v => v.severity === 'critical')) {
    return {
      shouldEscalate: true,
      targetMode: 'LOCKDOWN',
      reason: `${defenseVetoes.length} defense vetoes active (${criticalVetoes.length} critical) — escalating to lockdown`,
      triggeringVetoes: defenseVetoes.map(v => v.id),
    };
  }

  // 1 defense veto → OBSERVE if currently ACTIVE or EVOLVE
  if (defenseVetoes.length === 1 && (currentMode === 'ACTIVE' || currentMode === 'EVOLVE')) {
    return {
      shouldEscalate: true,
      targetMode: 'OBSERVE',
      reason: `Defense veto active — downgrading to OBSERVE for safety`,
      triggeringVetoes: defenseVetoes.map(v => v.id),
    };
  }

  return null;
}

/**
 * Issue governance-derived vetoes when entering LOCKDOWN.
 * These are auto-revoked when leaving LOCKDOWN.
 */
export async function issueGovernanceVetoes(mode: GovernanceMode): Promise<void> {
  if (mode !== 'LOCKDOWN') return;

  const scopes = ['write_access', 'external_integrations', 'scaling_operations'] as const;

  for (const scope of scopes) {
    const result = await vetoAuthority.submitVeto({
      authority: 'system',
      scope,
      reason: `Auto-issued by governance LOCKDOWN mode`,
      target: '*', // all targets
      severity: 'high',
    });

    if (result.accepted) {
      // We don't have the veto ID from submitVeto result, but track the scope
      log.info('governance', `Governance veto issued: ${scope}`);
    }
  }

  recordAudit(
    'veto-governance-bridge',
    'governance.vetoes_issued',
    'governance_mode',
    mode,
    mode,
    mode,
    { scopes: scopes.join(',') }
  );

  emit({
    module: 'GOVERNANCE',
    event_type: 'governance.lockdown_vetoes_issued',
    outcome: 'succeeded',
    data: { scopes },
  });
}

/**
 * Revoke governance-issued vetoes when leaving LOCKDOWN.
 */
export async function revokeGovernanceVetoes(): Promise<void> {
  const activeVetoes = vetoAuthority.getActiveVetoes();
  const governanceVetoes = activeVetoes.filter(
    v => v.authority === 'system' && v.reason?.includes('governance LOCKDOWN')
  );

  for (const veto of governanceVetoes) {
    await vetoAuthority.revokeVeto(veto.id, 'system');
    log.info('governance', `Governance veto revoked: ${veto.scope} (${veto.id})`);
  }

  if (governanceVetoes.length > 0) {
    recordAudit(
      'veto-governance-bridge',
      'governance.vetoes_revoked',
      'governance_mode',
      'LOCKDOWN',
      'LOCKDOWN',
      'ACTIVE',
      { revokedCount: String(governanceVetoes.length) }
    );
  }
}

/**
 * Full bridge cycle — call on governance mode change.
 */
export async function onGovernanceModeChange(
  fromMode: GovernanceMode,
  toMode: GovernanceMode
): Promise<void> {
  // Entering lockdown: issue vetoes
  if (toMode === 'LOCKDOWN' && fromMode !== 'LOCKDOWN') {
    await issueGovernanceVetoes(toMode);
  }

  // Leaving lockdown: revoke vetoes
  if (fromMode === 'LOCKDOWN' && toMode !== 'LOCKDOWN') {
    await revokeGovernanceVetoes();
  }
}
