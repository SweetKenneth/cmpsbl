/**
 * CMPSBL Self-Repair Loop
 * Audit → identify failures → attempt safe repair → re-audit
 * No timers — runs on-demand only.
 */

import { runSystemAudit, type AuditReport } from './auditRunner';
import { RepairStrategies, type RepairResult } from './repairStrategies';
import { log } from '@/lib/system/log';

export interface RepairCycleReport {
  attempts: number;
  maxAttempts: number;
  stable: boolean;
  repairs: RepairResult[];
  finalAudit: AuditReport;
}

export async function runSelfRepair(maxAttempts = 3): Promise<RepairCycleReport> {
  const allRepairs: RepairResult[] = [];
  let attempt = 0;
  let lastAudit: AuditReport | null = null;
  let prevFailureKey = '';

  while (attempt < maxAttempts) {
    attempt++;
    const report = await runSystemAudit();
    lastAudit = report;

    const failures = report.results.filter(r => !r.ok);

    if (failures.length === 0) {
      log.info('self-repair', `System stable after ${attempt} attempt(s)`);
      break;
    }

    // Detect stuck loop: if the exact same modules are failing, stop early
    const failureKey = failures.map(f => f.module).sort().join(',');
    if (failureKey === prevFailureKey) {
      log.warn('self-repair', `Same failures persisted after repair — aborting loop (${failureKey})`);
      break;
    }
    prevFailureKey = failureKey;

    log.warn('self-repair', `Attempt ${attempt}/${maxAttempts}: ${failures.length} failure(s) detected`);

    for (const f of failures) {
      const strategy = RepairStrategies[f.module];
      if (!strategy) {
        log.warn('self-repair', `No repair strategy for module: ${f.module}`);
        continue;
      }

      try {
        const result = await strategy();
        allRepairs.push(result);
        log.info('self-repair', `${result.module}: ${result.message}`);
      } catch (err) {
        allRepairs.push({
          repaired: false,
          module: f.module,
          message: err instanceof Error ? err.message : 'strategy threw',
        });
      }
    }
  }

  // Final audit after all repair attempts
  if (!lastAudit || !lastAudit.success) {
    lastAudit = await runSystemAudit();
  }

  return {
    attempts: attempt,
    maxAttempts,
    stable: lastAudit.success,
    repairs: allRepairs,
    finalAudit: lastAudit,
  };
}
