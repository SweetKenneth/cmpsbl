/**
 * Shadow Mesh — Probe Runner
 * Runs adversarial inputs through pilot executors when shadow mesh is enabled
 * 
 * Admin-only. Zero impact when disabled.
 */

import type { SynergyExecutionContext, SynergyResult } from '@/lib/capabilities/synergies/types';
import { generateAdversarialInputs } from './mutate';
import { isShadowMeshEnabled } from '@/lib/system/flags';
import { getSynergyExecutor } from '@/lib/capabilities/synergies/registry';
import { log } from '@/lib/system/log';
import { PILOT_EXECUTORS } from '@/immune/pilotExecutors';

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
 * Run a shadow probe against a specific pilot executor
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
      traceId: `shadow_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      dryRun: true, // Shadow probes are always dry-run
    };

    const start = performance.now();
    try {
      const result: SynergyResult = await executor(ctx);
      const durationMs = Math.round(performance.now() - start);

      if (result.success) {
        results.push({ input, outcome: 'success', durationMs });
        summary.success++;
      } else if (result.error?.includes('[immune]')) {
        if (result.error.includes('Repair')) {
          results.push({ input, outcome: 'repaired', error: result.error, durationMs });
          summary.repaired++;
        } else {
          results.push({ input, outcome: 'escalated', error: result.error, durationMs });
          summary.escalated++;
        }
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

  return {
    executor: executorName,
    enabled: true,
    totalRuns: inputs.length,
    results,
    summary,
  };
}

/**
 * Run shadow probes against all pilot executors.
 * Uses the canonical PILOT_EXECUTORS list from @/immune/pilotExecutors
 * rather than a local copy so additions/removals propagate automatically.
 */
export async function runAllShadowProbes(): Promise<ShadowProbeReport[]> {
  const reports: ShadowProbeReport[] = [];
  for (const name of PILOT_EXECUTORS) {
    reports.push(await runShadowProbe(name));
  }
  return reports;
}
