/**
 * Shadow Mesh — Batch Runner
 * Runs shadow probes across all pilot executors, records metrics,
 * triggers ENCODE to auto-resolve escalations, and runs learning cycle.
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
      console.info(`[shadow-batch] ENCODE auto-resolved ${result.resolved}/${result.processed} escalations (quality: ${(result.qualityScore * 100).toFixed(0)}%)`);
    }
  } catch (err) {
    console.warn('[shadow-batch] ENCODE auto-resolve failed:', err);
  }

  // Run learning cycle to synthesize new rules from patterns
  try {
    const { runLearningCycle } = await import('@/immune/escalation-learning');
    const learning = runLearningCycle();
    if (learning.promoted > 0 || learning.crossExecutorTransfers > 0) {
      console.info(`[shadow-batch] Learning cycle: ${learning.promoted} rules promoted, ${learning.crossExecutorTransfers} cross-executor transfers`);
    }
  } catch (err) {
    console.warn('[shadow-batch] Learning cycle failed:', err);
  }
}
