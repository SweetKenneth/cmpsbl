/**
 * Shadow Mesh — Batch Runner (v2.0)
 * Runs shadow probes across all pilot executors, records metrics,
 * triggers ENCODE to auto-resolve escalations, runs learning cycle,
 * and auto-propagates shared rules.
 */

import { runShadowProbe } from './probe';
import { recordImmuneMetrics } from '@/lib/immune/recordMetrics';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { isShadowMeshEnabled } from '@/lib/system/flags';
import { registerShadowStubs } from './stubs';
import { getExecutorSeedInput } from './mutate';

export async function runShadowBatch() {
  if (!(await isShadowMeshEnabled())) return;

  // Ensure stub executors are registered before probing
  registerShadowStubs();

  // Warm-start shared rule registry from DB on first run
  try {
    const { warmStartFromDB } = await import('@/immune/escalation-learning');
    await warmStartFromDB();
  } catch (err) {
    console.warn('[shadow-batch] Warm-start failed:', err);
  }

  for (const executor of PILOT_EXECUTORS) {
    // Use executor-specific seed input for balanced, fair probing
    const seedInput = getExecutorSeedInput(executor);
    const report = await runShadowProbe(executor, seedInput);

    // Derive telemetry flags from actual probe outcome counts
    // CRITICAL: safe-fails are NOT repair attempts — they are correctly rejected garbage inputs.
    // Only repaired + escalated count as repair attempts (escalations = failed repair attempts).
    const actualRepairAttempts = report.summary.repaired + report.summary.escalated;
    const hadSuccessfulRepairs = report.summary.repaired > 0;

    await recordImmuneMetrics({
      executor,
      total: report.totalRuns,
      repaired: report.summary.repaired,
      escalated: report.summary.escalated,
      safeFail: report.summary.failedSafe,
      repair_attempted: actualRepairAttempts > 0,
      repair_success: hadSuccessfulRepairs && report.summary.escalated === 0,
      retry_attempted: hadSuccessfulRepairs,
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
    if (learning.promoted > 0 || learning.crossExecutorTransfers > 0 || learning.sharedRulesPropagated > 0) {
      console.info(`[shadow-batch] Learning cycle: ${learning.promoted} rules promoted, ${learning.crossExecutorTransfers} cross-executor transfers, ${learning.sharedRulesPropagated} shared rules propagated`);
    }
  } catch (err) {
    console.warn('[shadow-batch] Learning cycle failed:', err);
  }

  // Auto-propagate shared rules to compatible executors
  try {
    const { autoPropagateRules } = await import('@/immune/shared-rule-registry');
    const propagation = autoPropagateRules();
    if (propagation.adopted > 0) {
      console.info(`[shadow-batch] Auto-propagated ${propagation.adopted} shared rules to [${propagation.executors.join(', ')}]`);
    }
  } catch (err) {
    console.warn('[shadow-batch] Shared rule propagation failed:', err);
  }
}
