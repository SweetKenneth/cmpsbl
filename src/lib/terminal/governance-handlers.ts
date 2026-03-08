/**
 * Governance Terminal Handlers — gov.* command namespace
 * Safe dynamic imports, full governance surface
 * 
 * Commands: gov.mode, gov.vetoes, gov.compliance, gov.drift,
 *           gov.transitions, gov.signals, gov.lifecycle, gov.summary
 */

import { registerHandler } from './validate-registry';

/** Helper: read current governance mode from DB with ACTIVE fallback */
async function readCurrentMode(): Promise<string> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase.from('governance_mode').select('mode').limit(1).maybeSingle();
    if (data?.mode) return data.mode;
  } catch { /* fallback */ }
  return 'ACTIVE';
}

export function registerGovernanceHandlers(): void {
  // ═══ gov.mode — Current governance mode and subsystem states ═══
  registerHandler('gov.mode', async () => {
    const { getSubsystemState, GOVERNANCE_MODE_META } = await import('@/lib/system/governance');

    const currentMode = await readCurrentMode();
    const meta = GOVERNANCE_MODE_META[currentMode as keyof typeof GOVERNANCE_MODE_META];
    const state = getSubsystemState(currentMode as any);

    const subsystemLines = Object.entries(state)
      .map(([k, v]) => `  ${k.padEnd(25)} ${v ? '✓ ON' : '✗ OFF'}`)
      .join('\n');

    return {
      output: `${meta?.icon || '⚪'} Governance Mode: ${currentMode}\n${meta?.description || ''}\n\nSubsystem States:\n${subsystemLines}`,
      status: 'success' as const,
    };
  });

  // ═══ gov.vetoes — Active vetoes with authority and scope ═══
  registerHandler('gov.vetoes', async () => {
    const { vetoAuthority } = await import('@/lib/substrate/governance');
    const vetoes = vetoAuthority.getActiveVetoes();

    if (vetoes.length === 0) {
      return { output: '✓ No active vetoes', status: 'success' as const };
    }

    const lines = vetoes.map(v =>
      `  [${v.authority.toUpperCase()}] ${v.scope} → ${v.target} (${v.severity}) — ${v.reason}`
    ).join('\n');

    return {
      output: `⚠ ${vetoes.length} Active Vetoes:\n${lines}`,
      status: 'success' as const,
    };
  });

  // ═══ gov.compliance — Run compliance audit ═══
  registerHandler('gov.compliance', async () => {
    const { runComplianceAudit, getComplianceScoreAvg } = await import('@/lib/substrate/governance/compliance-auditor');

    const currentMode = await readCurrentMode();
    const report = await runComplianceAudit(currentMode as any);
    const avgScore = getComplianceScoreAvg();

    const violationLines = report.violations.length > 0
      ? report.violations.map(v => `  [${v.severity.toUpperCase()}] ${v.message}`).join('\n')
      : '  None';

    return {
      output: `Compliance Audit — Mode: ${report.mode}\n` +
        `Score: ${report.score}/100 (avg: ${avgScore})\n` +
        `Status: ${report.compliant ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}\n` +
        `Checks: ${report.checksPerformed}\n\n` +
        `Violations:\n${violationLines}`,
      status: report.compliant ? 'success' as const : 'error' as const,
    };
  });

  // ═══ gov.drift — Governance drift analysis ═══
  registerHandler('gov.drift', async () => {
    const { analyzeDrift } = await import('@/lib/substrate/governance/governance-drift-detector');

    const currentMode = await readCurrentMode();
    const report = analyzeDrift(currentMode as any);

    const signalLines = report.signals.length > 0
      ? report.signals.map(s => `  [${s.severity.toUpperCase()}] ${s.type}: ${s.message}`).join('\n')
      : '  No drift signals';

    return {
      output: `Governance Drift Analysis — Mode: ${report.mode}\n` +
        `Drift Score: ${report.driftScore}/100\n` +
        `Status: ${report.drifting ? '⚠ DRIFT DETECTED' : '✓ STABLE'}\n\n` +
        `Signals:\n${signalLines}`,
      status: report.drifting ? 'warning' as const : 'success' as const,
    };
  });

  // ═══ gov.transitions — Available paths + quorum info ═══
  registerHandler('gov.transitions', async () => {
    const { getTransitionPath, evaluateTransition, getPendingApprovals } = await import('@/lib/substrate/governance/transition-validator');

    const currentMode = await readCurrentMode();
    const modes = ['ACTIVE', 'OBSERVE', 'LOCKDOWN', 'EVOLVE'] as const;

    const pathEntries: string[] = [];
    for (const m of modes) {
      if (m === currentMode) continue;
      const path = await getTransitionPath(currentMode as any, m);
      const validation = await evaluateTransition(currentMode as any, m, 'terminal', { skipRateLimit: true });
      const quorumTag = validation.requiresQuorum ? ' [QUORUM REQUIRED]' : '';
      const blockedTag = !validation.allowed ? ` ✗ BLOCKED: ${validation.blockedReasons?.join(', ') || validation.reason}` : '';
      pathEntries.push(`  ${currentMode} → ${m}: ${path.length > 0 ? path.join(' → ') : '✗ NO PATH'}${quorumTag}${blockedTag}`);
    }

    // Show pending approvals
    const pending = await getPendingApprovals();
    const pendingLines = pending.length > 0
      ? `\n\nPending Approvals:\n` + pending.map(p =>
          `  ${p.fromMode} → ${p.toMode} by ${p.requestedBy} (${p.voteCount ?? 0}/${p.approvalsRequired} votes, expires ${p.expiresAt})`
        ).join('\n')
      : '';

    return {
      output: `Transition Paths from ${currentMode}:\n${pathEntries.join('\n')}${pendingLines}`,
      status: 'success' as const,
    };
  });

  // ═══ gov.signals — Recent signal arbitration history ═══
  registerHandler('gov.signals', async () => {
    const { signalArbitration } = await import('@/lib/substrate/governance');
    const history = signalArbitration.getHistory(20);

    if (history.length === 0) {
      return { output: 'No recent signal history', status: 'success' as const };
    }

    const lines = history.slice(-10).map(s =>
      `  [${s.severity.toUpperCase()}] ${s.module}: ${s.message.slice(0, 80)}`
    ).join('\n');

    return {
      output: `Recent Signals (${history.length} total):\n${lines}`,
      status: 'success' as const,
    };
  });

  // ═══ gov.lifecycle — Veto lifecycle states ═══
  registerHandler('gov.lifecycle', async () => {
    const { vetoLifecycle } = await import('@/lib/substrate/governance');
    const all = vetoLifecycle.getAll();

    if (all.length === 0) {
      return { output: 'No tracked veto lifecycles', status: 'success' as const };
    }

    const lines = all.map(e =>
      `  [${e.authority.toUpperCase()}] ${e.vetoId.slice(0, 8)}… — ${e.state} (decay: ${(e.decay_progress * 100).toFixed(0)}%, entropy: ${e.current_entropy.toFixed(2)})`
    ).join('\n');

    return {
      output: `Veto Lifecycles (${all.length}):\n${lines}`,
      status: 'success' as const,
    };
  });

  // ═══ gov.summary — Full governance posture overview ═══
  registerHandler('gov.summary', async () => {
    const { vetoAuthority, signalArbitration, vetoLifecycle } = await import('@/lib/substrate/governance');
    const { getComplianceScoreAvg } = await import('@/lib/substrate/governance/compliance-auditor');
    const { analyzeDrift } = await import('@/lib/substrate/governance/governance-drift-detector');
    const { getPendingApprovals } = await import('@/lib/substrate/governance/transition-validator');

    const currentMode = await readCurrentMode();
    const vetoes = vetoAuthority.getActiveVetoes();
    const signals = signalArbitration.getHistory(100);
    const lifecycles = vetoLifecycle.getAll();
    const complianceAvg = getComplianceScoreAvg();
    const drift = analyzeDrift(currentMode as any);
    const pendingApprovals = await getPendingApprovals();

    return {
      output: `═══ GOVERNANCE POSTURE ═══\n` +
        `Mode:            ${currentMode}\n` +
        `Active Vetoes:   ${vetoes.length}\n` +
        `Signal Backlog:  ${signals.length}\n` +
        `Veto Lifecycles: ${lifecycles.length}\n` +
        `Compliance Avg:  ${complianceAvg}/100\n` +
        `Drift Score:     ${drift.driftScore}/100 ${drift.drifting ? '⚠ DRIFTING' : '✓ STABLE'}\n` +
        `Pending Quorum:  ${pendingApprovals.length}\n` +
        `═══════════════════════════`,
      status: drift.drifting || vetoes.length > 0 ? 'warning' as const : 'success' as const,
    };
  });

  // ═══ governance.status — Alias for gov.summary ═══
  registerHandler('governance.status', async () => {
    const currentMode = await readCurrentMode();
    const { vetoAuthority } = await import('@/lib/substrate/governance');
    const vetoes = vetoAuthority.getActiveVetoes();
    return {
      success: true,
      data: { mode: currentMode, activeVetoes: vetoes.length, module: 'GOVERNANCE', layer: 'Control Plane' },
    };
  });

  registerHandler('governance.health', async () => {
    const { getComplianceScoreAvg } = await import('@/lib/substrate/governance/compliance-auditor');
    const score = getComplianceScoreAvg();
    return { success: true, data: { health: score, module: 'GOVERNANCE', layer: 'Control Plane' } };
  });

  registerHandler('gov.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ GOVERNANCE — Control Plane ───────────────┐',
      '│  gov.mode         Current mode & subsystems    │',
      '│  gov.vetoes       Active vetoes                │',
      '│  gov.compliance   Compliance audit             │',
      '│  gov.drift        Drift analysis               │',
      '│  gov.transitions  Available transitions        │',
      '│  gov.signals      Signal arbitration history   │',
      '│  gov.lifecycle    Veto lifecycle states        │',
      '│  gov.summary      Full posture overview        │',
      '│  governance.status  Quick status               │',
      '│  governance.health  Health score               │',
      '│  governance.hardening  Hardening (Magistrate)  │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));
}
