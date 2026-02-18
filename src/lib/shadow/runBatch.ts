/**
 * Shadow Mesh — Batch Runner
 * Runs shadow probes across all pilot executors and records metrics
 */

import { runShadowProbe } from './probe';
import { recordImmuneMetrics } from '@/lib/immune/recordMetrics';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { isShadowMeshEnabled } from '@/lib/system/flags';

export async function runShadowBatch() {
  if (!(await isShadowMeshEnabled())) return;

  for (const executor of PILOT_EXECUTORS) {
    const report = await runShadowProbe(executor);

    await recordImmuneMetrics({
      executor,
      total: report.totalRuns,
      repaired: report.summary.repaired,
      escalated: report.summary.escalated,
      safeFail: report.summary.failedSafe,
    });
  }
}
