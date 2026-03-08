/**
 * Veto → Governance Bridge
 * Deterministic, DB-tracked veto management
 * 
 * Bidirectional:
 * - Multiple defense vetoes → auto-escalate governance to LOCKDOWN
 * - Governance LOCKDOWN → auto-issue write_access + external_integrations vetoes
 * - Governance ACTIVE restore → auto-revoke system-issued vetoes (DB-tracked)
 */

import { vetoAuthority, type VetoRequest } from './veto-authority';
import { recordAudit } from '@/lib/substrate/audit-trail';
import { emit } from '@/lib/substrate/events';
import { log } from '@/lib/system/log';
import { supabase } from '@/integrations/supabase/client';
import type { GovernanceMode } from '@/lib/system/governance';

export interface VetoGovernanceEscalation {
  shouldEscalate: boolean;
  targetMode: GovernanceMode;
  reason: string;
  triggeringVetoes: string[];
}

/**
 * Evaluate whether active vetoes should trigger governance escalation.
 * Call this after any veto is accepted.
 * Emits telemetry + audit on escalation decisions.
 */
export function evaluateVetoEscalation(currentMode: GovernanceMode): VetoGovernanceEscalation | null {
  if (currentMode === 'LOCKDOWN') return null; // Already at maximum

  const activeVetoes = vetoAuthority.getActiveVetoes();
  const defenseVetoes = activeVetoes.filter(v => v.authority === 'defense');
  const auditVetoes = activeVetoes.filter(v => v.authority === 'audit');
  const criticalVetoes = activeVetoes.filter(v => v.severity === 'critical');

  // Any audit veto → immediate LOCKDOWN
  if (auditVetoes.length > 0) {
    const escalation: VetoGovernanceEscalation = {
      shouldEscalate: true,
      targetMode: 'LOCKDOWN',
      reason: `Audit authority veto active — mandatory lockdown`,
      triggeringVetoes: auditVetoes.map(v => v.id),
    };

    emit({
      module: 'GOVERNANCE',
      event_type: 'governance.veto_escalation',
      outcome: 'succeeded',
      data: { from: currentMode, to: 'LOCKDOWN', trigger: 'audit_veto', vetoCount: auditVetoes.length },
    });

    recordAudit(
      'veto-governance-bridge',
      'governance.escalation.audit_veto',
      'governance_mode',
      currentMode,
      currentMode,
      'LOCKDOWN',
      { triggerCount: String(auditVetoes.length) }
    );

    return escalation;
  }

  // 2+ defense vetoes or any critical defense veto → LOCKDOWN
  if (defenseVetoes.length >= 2 || defenseVetoes.some(v => v.severity === 'critical')) {
    const escalation: VetoGovernanceEscalation = {
      shouldEscalate: true,
      targetMode: 'LOCKDOWN',
      reason: `${defenseVetoes.length} defense vetoes active (${criticalVetoes.length} critical) — escalating to lockdown`,
      triggeringVetoes: defenseVetoes.map(v => v.id),
    };

    emit({
      module: 'GOVERNANCE',
      event_type: 'governance.veto_escalation',
      outcome: 'succeeded',
      data: { from: currentMode, to: 'LOCKDOWN', trigger: 'defense_veto', vetoCount: defenseVetoes.length },
    });

    recordAudit(
      'veto-governance-bridge',
      'governance.escalation.defense_veto',
      'governance_mode',
      currentMode,
      currentMode,
      'LOCKDOWN',
      { defenseCount: String(defenseVetoes.length), criticalCount: String(criticalVetoes.length) }
    );

    return escalation;
  }

  // 1 defense veto → OBSERVE if currently ACTIVE or EVOLVE
  if (defenseVetoes.length === 1 && (currentMode === 'ACTIVE' || currentMode === 'EVOLVE')) {
    const escalation: VetoGovernanceEscalation = {
      shouldEscalate: true,
      targetMode: 'OBSERVE',
      reason: `Defense veto active — downgrading to OBSERVE for safety`,
      triggeringVetoes: defenseVetoes.map(v => v.id),
    };

    emit({
      module: 'GOVERNANCE',
      event_type: 'governance.veto_escalation',
      outcome: 'succeeded',
      data: { from: currentMode, to: 'OBSERVE', trigger: 'defense_veto_single', vetoCount: 1 },
    });

    recordAudit(
      'veto-governance-bridge',
      'governance.escalation.defense_observe',
      'governance_mode',
      currentMode,
      currentMode,
      'OBSERVE',
      { defenseCount: '1' }
    );

    return escalation;
  }

  return null;
}

/**
 * Issue governance-derived vetoes when entering LOCKDOWN.
 * Tracks issued veto IDs in DB for deterministic revocation.
 */
export async function issueGovernanceVetoes(mode: GovernanceMode): Promise<void> {
  if (mode !== 'LOCKDOWN') return;

  const scopes = ['write_access', 'external_integrations', 'scaling_operations'] as const;

  for (const scope of scopes) {
    const result = await vetoAuthority.submitVeto({
      authority: 'system',
      scope,
      reason: `Auto-issued by governance LOCKDOWN mode [gov-bridge-lockdown]`,
      target: '*',
      severity: 'high',
    });

    if (result.accepted) {
      // Find the veto we just created by matching authority + reason marker
      const activeVetoes = vetoAuthority.getActiveVetoes();
      const issued = activeVetoes.find(
        v => v.authority === 'system' && v.scope === scope && v.reason?.includes('[gov-bridge-lockdown]')
      );
      const vetoId = issued?.id || `gov-${scope}-${Date.now()}`;

      // Persist to DB for deterministic revocation
      try {
        await supabase.from('governance_issued_vetoes').insert({
          veto_id: vetoId,
          scope,
        });
      } catch (err) {
        log.warn('governance', `Failed to persist issued veto record: ${err}`);
      }
      log.info('governance', `Governance veto issued: ${scope} (${vetoId})`);
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
 * Primary: lookup by governance_issued_vetoes table.
 * Fallback: scan active vetoes by marker string.
 */
export async function revokeGovernanceVetoes(): Promise<void> {
  let revokedCount = 0;
  const failedRevocations: string[] = [];

  // Primary: DB lookup
  try {
    const { data: issuedRecords } = await supabase
      .from('governance_issued_vetoes')
      .select('veto_id, scope');

    if (issuedRecords && issuedRecords.length > 0) {
      for (const record of issuedRecords) {
        try {
          await vetoAuthority.revokeVeto(record.veto_id, 'system');
          revokedCount++;
          log.info('governance', `Governance veto revoked: ${record.scope} (${record.veto_id})`);
        } catch (err) {
          failedRevocations.push(record.veto_id);
          log.warn('governance', `Failed to revoke veto ${record.veto_id}: ${err}`);
        }
      }

      // Clean up DB records for successfully revoked vetoes
      const successfulIds = (issuedRecords || [])
        .filter(r => !failedRevocations.includes(r.veto_id))
        .map(r => r.veto_id);

      if (successfulIds.length > 0) {
        await supabase
          .from('governance_issued_vetoes')
          .delete()
          .in('veto_id', successfulIds);
      }
    }
  } catch {
    log.warn('governance', 'DB lookup for issued vetoes failed — falling back to scan');
  }

  // Fallback: scan active vetoes by marker
  if (revokedCount === 0) {
    const activeVetoes = vetoAuthority.getActiveVetoes();
    const governanceVetoes = activeVetoes.filter(
      v => v.authority === 'system' && v.reason?.includes('[gov-bridge-lockdown]')
    );

    for (const veto of governanceVetoes) {
      try {
        await vetoAuthority.revokeVeto(veto.id, 'system');
        revokedCount++;
        log.info('governance', `Governance veto revoked (fallback): ${veto.scope} (${veto.id})`);
      } catch (err) {
        failedRevocations.push(veto.id);
        log.warn('governance', `Failed to revoke veto ${veto.id}: ${err}`);
      }
    }
  }

  if (failedRevocations.length > 0) {
    emit({
      module: 'GOVERNANCE',
      event_type: 'governance.veto_revocation_partial',
      outcome: 'failed',
      data: { failedCount: failedRevocations.length, failedIds: failedRevocations },
    });
  }

  if (revokedCount > 0) {
    recordAudit(
      'veto-governance-bridge',
      'governance.vetoes_revoked',
      'governance_mode',
      'LOCKDOWN',
      'LOCKDOWN',
      'ACTIVE',
      { revokedCount: String(revokedCount), failedCount: String(failedRevocations.length) }
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
