/**
 * Shadow Mesh — Probe Runner (v3.0 — Dynamic Discovery)
 * 
 * Probes ALL registered executors dynamically rather than a hardcoded list.
 * New executors are automatically discovered and probed as they register.
 * 
 * Admin-only. Zero impact when disabled.
 */

import type { SynergyExecutionContext, SynergyResult } from '@/lib/capabilities/synergies/types';
import { generateAdversarialInputs } from './mutate';
import { isShadowMeshEnabled } from '@/lib/system/flags';
import { getSynergyExecutor } from '@/lib/capabilities/synergies/registry';
import { log } from '@/lib/system/log';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';
import { updateHealthRegistry, updateShadowMeshState, getShadowMeshState } from '@/lib/substrate/health-registry';
import { appendEvent } from '@/core/events/eventStore';

export interface ShadowProbeResult {
  input: Record<string, unknown>;
  outcome: 'success' | 'repaired' | 'escalated' | 'failed_safe';
  error?: string;
  durationMs: number;
}

export interface ShadowProbeReport {
  executor: string;
  enabled: boolean;
  totalRuns: number;
  results: ShadowProbeResult[];
  summary: {
    success: number;
    repaired: number;
    escalated: number;
    failedSafe: number;
  };
}

/**
 * Get ALL registered executor IDs dynamically.
 * Merges the pilot list with any additional executors found in the registry,
 * so new executors are probed automatically as they are added.
 */
export function getProbeableExecutors(): string[] {
  // Start with all known pilot executors
  const executorSet = new Set<string>(PILOT_EXECUTORS);

  // Dynamically discover any additional executors that have been registered
  // by scanning the registry for executors not in the pilot list
  try {
    const { listRegisteredExecutorIds } = await import('@/lib/capabilities/synergies/registry');
    if (typeof listRegisteredExecutorIds === 'function') {
      const allIds: string[] = listRegisteredExecutorIds();
      for (const id of allIds) {
        executorSet.add(id);
      }
    }
  } catch {
    // Fallback: only probe pilot executors if dynamic discovery unavailable
    log.warn('shadow', 'Dynamic executor discovery unavailable, using pilot list only');
  }

  return Array.from(executorSet);
}

/**
 * Run a shadow probe against a specific executor
 */
export async function runShadowProbe(
  executorName: string,
  seedInput?: Record<string, unknown>,
): Promise<ShadowProbeReport> {
  const enabled = await isShadowMeshEnabled();
  
  if (!enabled) {
    return {
      executor: executorName,
      enabled: false,
      totalRuns: 0,
      results: [],
      summary: { success: 0, repaired: 0, escalated: 0, failedSafe: 0 },
    };
  }

  const executor = getSynergyExecutor(executorName);
  if (!executor) {
    log.warn('shadow', `Executor "${executorName}" not found in registry`);
    return {
      executor: executorName,
      enabled: true,
      totalRuns: 0,
      results: [],
      summary: { success: 0, repaired: 0, escalated: 0, failedSafe: 0 },
    };
  }

  const inputs = generateAdversarialInputs(seedInput);
  const results: ShadowProbeResult[] = [];
  const summary = { success: 0, repaired: 0, escalated: 0, failedSafe: 0 };

  for (const input of inputs) {
    const ctx: SynergyExecutionContext = {
      synergyId: executorName,
      input,
      caller: 'shadow.probe',
      traceId: crypto.randomUUID(),
      dryRun: true, // Shadow probes are always dry-run
    };

    const start = performance.now();
    try {
      const result: SynergyResult = await executor(ctx);
      const durationMs = Math.round(performance.now() - start);

      // Classification priority:
      // 1. Check for [immune] marker — covers repair-success, escalation, and safe-fail
      // 2. '[immune] Repair succeeded' = repaired
      // 3. '[immune] Safe-fail' or other non-repair [immune] = safe fail (expected rejection)
      // 4. '[immune] Escalated' or '[immune] Executor failed' = escalated (needs attention)
      // 5. success:true with no [immune] marker = natural success
      if (result.error?.includes('[immune]')) {
        if (result.error.includes('Repair succeeded')) {
          results.push({ input, outcome: 'repaired', error: result.error, durationMs });
          summary.repaired++;
        } else if (result.error.includes('Safe-fail') || result.error.includes('Preflight rejected') || result.error.includes('No repair strategy')) {
          // v3.0: Archetype-gated safe-fails — expected rejections of garbage inputs
          results.push({ input, outcome: 'failed_safe', error: result.error, durationMs });
          summary.failedSafe++;
        } else {
          results.push({ input, outcome: 'escalated', error: result.error, durationMs });
          summary.escalated++;
        }
      } else if (result.success) {
        results.push({ input, outcome: 'success', durationMs });
        summary.success++;
      } else {
        results.push({ input, outcome: 'failed_safe', error: result.error, durationMs });
        summary.failedSafe++;
      }
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      results.push({
        input,
        outcome: 'failed_safe',
        error: err instanceof Error ? err.message : 'unknown',
        durationMs,
      });
      summary.failedSafe++;
    }
  }

  log.info('shadow', `Probe complete: ${executorName} — ${inputs.length} runs`, summary);

  // Event-sourced logging for each outcome category
  const correlationId = crypto.randomUUID();
  if (summary.repaired > 0) {
    appendEvent('PROBE_REPAIRED', `shadow:${executorName}`, executorName, 'probing', 'repaired', correlationId);
  }
  if (summary.escalated > 0) {
    appendEvent('PROBE_ESCALATED', `shadow:${executorName}`, executorName, 'probing', 'escalated', correlationId);
  }
  if (summary.failedSafe > 0) {
    appendEvent('PROBE_FAILED_SAFE', `shadow:${executorName}`, executorName, 'probing', 'failed_safe', correlationId);
  }

  // Push shadow mesh state to CHR
  const totalFails = summary.escalated + summary.failedSafe;
  const loadIndex = inputs.length > 0 ? Math.round((totalFails / inputs.length) * 100) : 0;
  updateShadowMeshState({ active: true, load_index: loadIndex });

  // Register as synthetic shadow event (isolation-aware)
  const shadowState = getShadowMeshState();
  updateHealthRegistry(`shadow:${executorName}`, totalFails > 0 ? 'shadow_event' : 'healthy',
    totalFails > 0 ? 'shadow_event' : 'boot',
    shadowState.bleed_into_health ? 'synthetic_shadow_event' : 'synthetic_test',
    {
      detail: `${summary.success} ok, ${summary.repaired} repaired, ${summary.escalated} escalated, ${summary.failedSafe} safe-failed`,
      score_override: totalFails > 0 ? 85 : 100,
    }
  );

  return {
    executor: executorName,
    enabled: true,
    totalRuns: inputs.length,
    results,
    summary,
  };
}

/**
 * Run shadow probes against ALL registered executors dynamically.
 * Automatically discovers new executors as they are added to the mesh.
 */
export async function runAllShadowProbes(): Promise<ShadowProbeReport[]> {
  const executors = getProbeableExecutors();
  log.info('shadow', `Dynamic probe sweep: ${executors.length} executors discovered`);
  
  const reports: ShadowProbeReport[] = [];
  for (const name of executors) {
    reports.push(await runShadowProbe(name));
  }
  return reports;
}
