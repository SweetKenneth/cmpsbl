/**
 * Governance Terminal Handlers — gov.* command namespace
 * SPARTA Epoch — Full governance observability & operations via terminal
 * 
 * GAP: No terminal surface existed for governance operations.
 * Operators had to use the dashboard — terminal should be first-class.
 */

import { registerHandler } from './validate-registry';

export function registerGovernanceHandlers(): void {
  // ═══ gov.mode — Current governance mode and subsystem states ═══
  registerHandler('gov.mode', async () => {
    const { getSubsystemState, GOVERNANCE_MODE_META } = await import('@/lib/system/governance');
    const { isSubsystemAllowed } = await import('@/lib/system/governanceGate');

    // Fetch current mode
    let currentMode = 'ACTIVE';
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('governance_mode').select('mode').limit(1).maybeSingle();
      if (data?.mode) currentMode = data.mode;
    } catch { /* fallback */ }

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

    let currentMode = 'ACTIVE';
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('governance_mode').select('mode').limit(1).maybeSingle();
      if (data?.mode) currentMode = data.mode;
    } catch { /* fallback */ }

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

    let currentMode = 'ACTIVE';
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('governance_mode').select('mode').limit(1).maybeSingle();
      if (data?.mode) currentMode = data.mode;
    } catch { /* fallback */ }

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

  // ═══ gov.transitions — Validate a mode transition ═══
  registerHandler('gov.transitions', async () => {
    const { getTransitionPath } = await import('@/lib/substrate/governance/transition-validator');

    let currentMode = 'ACTIVE';
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('governance_mode').select('mode').limit(1).maybeSingle();
      if (data?.mode) currentMode = data.mode;
    } catch { /* fallback */ }

    const modes = ['ACTIVE', 'OBSERVE', 'LOCKDOWN', 'EVOLVE'] as const;
    const pathLines = modes
      .filter(m => m !== currentMode)
      .map(m => {
        const path = getTransitionPath(currentMode as any, m);
        return `  ${currentMode} → ${m}: ${path.length > 0 ? path.join(' → ') : '✗ BLOCKED'}`;
      })
      .join('\n');

    return {
      output: `Transition Paths from ${currentMode}:\n${pathLines}`,
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

    let currentMode = 'ACTIVE';
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase.from('governance_mode').select('mode').limit(1).maybeSingle();
      if (data?.mode) currentMode = data.mode;
    } catch { /* fallback */ }

    const vetoes = vetoAuthority.getActiveVetoes();
    const signals = signalArbitration.getHistory(100);
    const lifecycles = vetoLifecycle.getAll();
    const complianceAvg = getComplianceScoreAvg();
    const drift = analyzeDrift(currentMode as any);

    return {
      output: `═══ GOVERNANCE POSTURE ═══\n` +
        `Mode:         ${currentMode}\n` +
        `Active Vetoes: ${vetoes.length}\n` +
        `Signal Backlog: ${signals.length}\n` +
        `Veto Lifecycles: ${lifecycles.length}\n` +
        `Compliance Avg: ${complianceAvg}/100\n` +
        `Drift Score:   ${drift.driftScore}/100 ${drift.drifting ? '⚠ DRIFTING' : '✓ STABLE'}\n` +
        `═══════════════════════════`,
      status: drift.drifting || vetoes.length > 0 ? 'warning' as const : 'success' as const,
    };
  });
}
