/**
 * Maintenance Orchestrator
 * Coordinates HYGIENE → VALIDATOR → REPORTER engine pipeline
 * Integrates with ENGINEER for CLM-triggered and cron-scheduled runs
 */

import { runHygieneEngine } from './hygiene-engine';
import { runValidatorEngine } from './validator-engine';
import { runReporterEngine } from './reporter-engine';
import type { OrchestratorRunResult, TriggerSource, RunStatus } from './types';

// ── Orchestrator ───────────────────────────────────────────────────────────

export async function runMaintenanceOrchestrator(
  triggerSource: TriggerSource = 'manual',
  options: { skipHygiene?: boolean; skipValidator?: boolean; skipReporter?: boolean } = {},
): Promise<OrchestratorRunResult> {
  const start = performance.now();
  const result: OrchestratorRunResult = {
    engines: [],
    overallStatus: 'running',
    totalDurationMs: 0,
    triggeredBy: triggerSource,
    completedAt: '',
    notificationsSent: { email: false, webhook: false, atlas: false, db: false },
  };

  // Phase 1: HYGIENE (data lifecycle)
  if (!options.skipHygiene) {
    console.log('[ORCHESTRATOR] Running HYGIENE engine...');
    const hygieneResult = await runHygieneEngine(triggerSource);
    result.engines.push(hygieneResult);
    console.log(`[ORCHESTRATOR] HYGIENE: ${hygieneResult.status} (${hygieneResult.durationMs}ms)`);
  }

  // Phase 2: VALIDATOR (structural integrity)
  if (!options.skipValidator) {
    console.log('[ORCHESTRATOR] Running VALIDATOR engine...');
    const validatorResult = await runValidatorEngine(triggerSource);
    result.engines.push(validatorResult);
    console.log(`[ORCHESTRATOR] VALIDATOR: ${validatorResult.status} (${validatorResult.durationMs}ms)`);
  }

  // Compute overall status before reporting
  const statuses = result.engines.map(e => e.status);
  if (statuses.includes('failed')) {
    result.overallStatus = 'failed';
  } else if (statuses.includes('partial')) {
    result.overallStatus = 'partial';
  } else {
    result.overallStatus = 'passed';
  }

  result.totalDurationMs = Math.round(performance.now() - start);
  result.completedAt = new Date().toISOString();

  // Phase 3: REPORTER (dispatch results)
  if (!options.skipReporter) {
    console.log('[ORCHESTRATOR] Running REPORTER engine...');
    const reporterResult = await runReporterEngine(result, triggerSource);
    result.engines.push(reporterResult);
    console.log(`[ORCHESTRATOR] REPORTER: ${reporterResult.status} (${reporterResult.durationMs}ms)`);
  }

  // Final timing
  result.totalDurationMs = Math.round(performance.now() - start);

  console.log(`[ORCHESTRATOR] Complete: ${result.overallStatus} in ${result.totalDurationMs}ms`);

  return result;
}

// ── Quick Health Check (lightweight, for ENGINEER CLM triggers) ─────────

export async function runQuickHealthCheck(): Promise<{
  healthy: boolean;
  score: number;
  issues: string[];
}> {
  try {
    const { quickStructuralCheck } = await import('@/lib/audit/substrate-health-check');
    const report = quickStructuralCheck();
    return {
      healthy: report.verdict === 'PASS',
      score: report.issues === 0 ? 100 : Math.max(0, 100 - report.issues * 10),
      issues: report.issues > 0 ? [`${report.issues} structural issue(s) detected`] : [],
    };
  } catch {
    return { healthy: false, score: 0, issues: ['Health check failed to execute'] };
  }
}

// ── ENGINEER Integration ───────────────────────────────────────────────────

let lastMaintenanceRun = 0;
const MIN_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes minimum between auto-runs

/**
 * Called by ENGINEER during CLM cycles
 * Only triggers full maintenance if health is degraded or enough time has passed
 */
export async function engineerTriggeredMaintenance(): Promise<OrchestratorRunResult | null> {
  const now = Date.now();

  // Cooldown check
  if (now - lastMaintenanceRun < MIN_INTERVAL_MS) {
    console.log('[ENGINEER→MAINT] Skipped — cooldown active');
    return null;
  }

  // Quick health check first
  const health = await runQuickHealthCheck();

  // Only run full maintenance if degraded OR if >3 hours since last run
  const threeHours = 3 * 60 * 60 * 1000;
  if (health.healthy && now - lastMaintenanceRun < sixHours) {
    console.log('[ENGINEER→MAINT] Skipped — system healthy, last run recent');
    return null;
  }

  console.log(`[ENGINEER→MAINT] Triggering maintenance (healthy=${health.healthy}, score=${health.score})`);
  lastMaintenanceRun = now;

  return runMaintenanceOrchestrator('engineer');
}

/**
 * Called by cron edge function as scheduled fallback
 */
export async function cronTriggeredMaintenance(): Promise<OrchestratorRunResult> {
  lastMaintenanceRun = Date.now();
  return runMaintenanceOrchestrator('cron');
}
