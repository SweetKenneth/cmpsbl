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

  while (attempt < maxAttempts) {
    attempt++;
    const report = await runSystemAudit();
    lastAudit = report;

    const failures = report.results.filter(r => !r.ok);

    if (failures.length === 0) {
      log.info('self-repair', `System stable after ${attempt} attempt(s)`);
      break;
    }

    log.warn('self-repair', `Attempt ${attempt}/${maxAttempts}: ${failures.length} failure(s) detected`);

    for (const f of failures) {
      const strategy = RepairStrategies[f.module];
      if (!strategy) {
        log.warn('self-repair', `No repair strategy for module: ${f.module}`);
        continue;
      }

      const result = await strategy();
      allRepairs.push(result);
      log.info('self-repair', `${result.module}: ${result.message}`);
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
