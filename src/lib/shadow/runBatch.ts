/**
 * Shadow Mesh — Batch Runner (v3.0 — Phase 1 Shadow Scale)
 * Runs shadow probes across all 35 pilot executors, records metrics,
 * triggers ENCODE to auto-resolve escalations, runs learning cycle,
 * auto-propagates shared rules, and feeds rolling window telemetry.
 */

import { runShadowProbe } from './probe';
import { recordImmuneMetrics } from '@/lib/immune/recordMetrics';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { isShadowMeshEnabled } from '@/lib/system/flags';
import { registerShadowStubs } from './stubs';
import { getExecutorSeedInput } from './mutate';
import { recordWindowProbeResult, forceFlushWindow } from './windowTelemetry';

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

    // Feed rolling window telemetry for each probe result
    for (const result of report.results) {
      recordWindowProbeResult(
        executor,
        result.outcome,
        result.outcome === 'repaired' ? 'INTELLIGENT' : null,
        result.error,
      );
    }

    // Derive telemetry flags from actual probe outcome counts
    // CRITICAL: safe-fails are NOT repair attempts — they are correctly rejected garbage inputs.
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
    const result = await processEscalations(100);
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

  // Flush rolling window if mature
  try {
    const { validatePhase1Targets, getWindowLogs } = await import('./windowTelemetry');
    const targets = validatePhase1Targets();
    if (!targets.repairRateOk || !targets.escalationOk || !targets.cascadeOk) {
      console.warn(`[shadow-batch] Phase 1 target violation: ${targets.details}`);
    }
  } catch (err) {
    console.warn('[shadow-batch] Window telemetry check failed:', err);
  }
}
