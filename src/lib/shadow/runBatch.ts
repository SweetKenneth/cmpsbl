/**
 * Shadow Mesh — Batch Runner
 * Runs shadow probes across all pilot executors and records metrics
 */

/**
 * Shadow Mesh — Batch Runner
 * Runs shadow probes across all pilot executors, records metrics,
 * then triggers ENCODE to auto-resolve any new escalations.
 */

import { runShadowProbe } from './probe';
import { recordImmuneMetrics } from '@/lib/immune/recordMetrics';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { isShadowMeshEnabled } from '@/lib/system/flags';
import { registerShadowStubs } from './stubs';

export async function runShadowBatch() {
  if (!(await isShadowMeshEnabled())) return;

  // Ensure stub executors are registered before probing
  registerShadowStubs();

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

  // After all probes complete, trigger ENCODE to resolve any new escalations
  try {
    const { processEscalations } = await import('@/lib/substrate/encode-module/escalation-processor');
    const result = await processEscalations(50);
    if (result.resolved > 0) {
      console.info(`[shadow-batch] ENCODE auto-resolved ${result.resolved}/${result.processed} escalations`);
    }
  } catch (err) {
    console.warn('[shadow-batch] ENCODE auto-resolve failed:', err);
  }
}
