/**
 * Power Center — Terminal Handlers
 * power.* command namespace
 * Meta circuit breaker and unified substrate activation control
 */

import { registerHandler } from './validate-registry';

export function registerPowerHandlers() {
  // ═══ power.status — Get power center state ═══
  registerHandler('power.status', async () => {
    const { powerCenter } = await import('@/lib/substrate/power-center');
    const state = powerCenter.getState();
    const activeCount = state.subsystems.filter(s => s.active).length;
    return {
      success: true,
      data: {
        metaBreakerActive: state.metaBreakerActive,
        activatedAt: state.activatedAt,
        activeSubsystems: `${activeCount}/${state.subsystems.length}`,
        totalCyclesRun: state.totalCyclesRun,
        lastFullAuditAt: state.lastFullAuditAt,
        subsystems: state.subsystems.map(s => ({
          name: s.name,
          active: s.active ? '🟢' : '⚫',
          health: s.health,
          cycles: s.cyclesCompleted,
          lastCycle: s.lastCycleAt,
        })),
      },
    };
  });

  // ═══ power.on — Flip meta breaker ON ═══
  registerHandler('power.on', async () => {
    const { powerCenter } = await import('@/lib/substrate/power-center');
    const state = await powerCenter.activateAll();
    const activeCount = state.subsystems.filter(s => s.active).length;
    return {
      success: true,
      data: {
        message: `⚡ META CIRCUIT BREAKER ACTIVE — ${activeCount} subsystems online`,
        activatedAt: state.activatedAt,
        subsystems: state.subsystems
          .filter(s => s.active)
          .map(s => `🟢 ${s.name}`),
      },
    };
  });

  // ═══ power.off — Flip meta breaker OFF ═══
  registerHandler('power.off', async () => {
    const { powerCenter } = await import('@/lib/substrate/power-center');
    const state = powerCenter.deactivateAll();
    return {
      success: true,
      data: {
        message: '🔴 META CIRCUIT BREAKER DEACTIVATED — all subsystems offline',
        subsystems: state.subsystems.map(s => `⚫ ${s.name}`),
      },
    };
  });

  // ═══ power.audit — Run full production audit ═══
  registerHandler('power.audit', async () => {
    const { powerCenter } = await import('@/lib/substrate/power-center');
    const result = await powerCenter.runFullAudit();
    return {
      success: true,
      data: {
        overallHealth: `${result.overallHealth}%`,
        issues: result.issues.length > 0 ? result.issues : ['No issues detected'],
        subsystems: result.subsystems.map(s => ({
          name: s.name,
          status: s.active ? '🟢 ACTIVE' : '⚫ INACTIVE',
          health: `${s.health}%`,
          cycles: s.cyclesCompleted,
          error: s.error,
        })),
      },
    };
  });

  // ═══ power.help — Command reference ═══
  registerHandler('power.help', async () => {
    return {
      success: true,
      data: {
        commands: {
          'power.status': 'View all subsystem states',
          'power.on': 'Flip meta breaker — activate ALL subsystems',
          'power.off': 'Deactivate ALL subsystems',
          'power.audit': 'Run full production audit across all subsystems',
        },
      },
    };
  });
}
