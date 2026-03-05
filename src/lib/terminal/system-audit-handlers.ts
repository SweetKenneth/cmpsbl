/**
 * Terminal handlers for system audit + self-repair
 * Commands: system.audit, system.repair, system.health
 */

import { registerHandler } from './validate-registry';

export function registerSystemAuditHandlers(): void {
  // ═══ system.audit — Full subsystem audit ═══
  registerHandler('system.audit', async () => {
    const { runSystemAudit } = await import('@/lib/substrate/system/auditRunner');
    const report = await runSystemAudit();

    const summary = report.results.map(r =>
      `${r.ok ? '✓' : '✗'} ${r.module}: ${r.detail}`
    );

    return {
      success: true,
      data: {
        passed: report.success,
        duration_ms: report.completedAt - report.startedAt,
        checks: report.results.length,
        failures: report.results.filter(r => !r.ok).length,
        results: summary,
      },
    };
  });

  // ═══ system.repair — Self-repair loop ═══
  registerHandler('system.repair', async () => {
    const { runSelfRepair } = await import('@/lib/substrate/system/selfRepairLoop');
    const report = await runSelfRepair(3);

    return {
      success: true,
      data: {
        stable: report.stable,
        attempts: report.attempts,
        repairs_applied: report.repairs.length,
        repairs: report.repairs.map(r => ({
          module: r.module,
          repaired: r.repaired,
          message: r.message,
        })),
        final_passed: report.finalAudit.success,
      },
    };
  });

  // ═══ system.health — Quick composite health check ═══
  registerHandler('system.health', async () => {
    const { runSystemAudit } = await import('@/lib/substrate/system/auditRunner');
    const report = await runSystemAudit();

    const failedModules = report.results.filter(r => !r.ok).map(r => r.module);

    return {
      success: true,
      data: {
        status: report.success ? 'healthy' : 'degraded',
        total_checks: report.results.length,
        passed: report.results.filter(r => r.ok).length,
        failed: failedModules.length,
        failed_modules: failedModules,
        duration_ms: report.completedAt - report.startedAt,
      },
    };
  });

  // ═══ system.help — Command reference ═══
  registerHandler('system.help', async () => {
    return {
      success: true,
      data: {
        commands: [
          { command: 'system.audit', description: 'Run full subsystem audit' },
          { command: 'system.repair', description: 'Run self-repair loop (max 3 attempts)' },
          { command: 'system.health', description: 'Quick composite health check' },
          { command: 'system.help', description: 'Show this help' },
        ],
      },
    };
  });
}
