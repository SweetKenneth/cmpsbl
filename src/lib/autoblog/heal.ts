/**
 * AutoBlog Self-Healing
 * Integrates with system.heal
 */

import { 
  getAutoblogSettings, 
  updateAutoblogSettings, 
  getAutoblogQueue, 
  updateQueueStatus,
  recordRun
} from './store';
import { resetAutoblogCircuit, tripAutoblogCircuit } from './circuit';

export interface HealOptions {
  full?: boolean;
  source?: string;
}

export interface HealResult {
  ok: boolean;
  actions: string[];
  finalState: {
    enabled: boolean;
    circuitState: string;
    itemsCleared: number;
  };
}

/**
 * Heal AutoBlog subsystem
 * 
 * full=false: Soft heal
 *   - Clear stuck items
 *   - Reset circuit to half-open
 *   - Re-enable planning
 * 
 * full=true: Hard heal
 *   - Disable AutoBlog
 *   - Open circuit
 *   - Require Governor re-enable
 */
export async function healAutoblog(options: HealOptions = {}): Promise<HealResult> {
  const actions: string[] = [];
  const settings = await getAutoblogSettings();
  
  if (!settings) {
    return {
      ok: false,
      actions: ['Settings not found'],
      finalState: { enabled: false, circuitState: 'unknown', itemsCleared: 0 }
    };
  }

  if (options.full) {
    // Hard heal: disable everything
    await updateAutoblogSettings({
      enabled: false,
      circuit_state: 'open',
      circuit_opened_at: new Date().toISOString()
    });
    actions.push('Disabled AutoBlog');
    actions.push('Opened circuit breaker');

    await recordRun({
      phase: 'heal',
      outcome: 'success',
      reason: `Full heal triggered from ${options.source || 'unknown'}`,
      circuitState: 'open',
      healAttempted: true
    });

    return {
      ok: true,
      actions,
      finalState: { enabled: false, circuitState: 'open', itemsCleared: 0 }
    };
  }

  // Soft heal: clear stuck items and reset circuit
  const stuckItems = await clearStuckItems();
  if (stuckItems > 0) {
    actions.push(`Cleared ${stuckItems} stuck items`);
  }

  // Reset circuit to half-open for recovery attempt
  if (settings.circuit_state === 'open') {
    await updateAutoblogSettings({ circuit_state: 'half_open' });
    actions.push('Reset circuit to half-open');
  } else if (settings.circuit_state !== 'closed') {
    await resetAutoblogCircuit();
    actions.push('Reset circuit to closed');
  }

  await recordRun({
    phase: 'heal',
    outcome: 'success',
    reason: `Soft heal triggered from ${options.source || 'unknown'}`,
    circuitState: 'half_open',
    healAttempted: true
  });

  const updatedSettings = await getAutoblogSettings();

  return {
    ok: true,
    actions,
    finalState: {
      enabled: updatedSettings?.enabled ?? false,
      circuitState: updatedSettings?.circuit_state ?? 'unknown',
      itemsCleared: stuckItems
    }
  };
}

/**
 * Clear items stuck in drafting for too long
 */
async function clearStuckItems(): Promise<number> {
  const queue = await getAutoblogQueue('drafting');
  const stuckThresholdMs = 10 * 60 * 1000; // 10 minutes
  let cleared = 0;

  for (const item of queue) {
    if (item.started_at) {
      const startedAt = new Date(item.started_at).getTime();
      if (Date.now() - startedAt > stuckThresholdMs) {
        await updateQueueStatus(item.id, 'failed', { error: 'Stuck in drafting, cleared by heal' });
        cleared++;
      }
    }
  }

  return cleared;
}

/**
 * Integration point for system.heal
 */
export async function systemHealAutoblog(
  severity: 'low' | 'medium' | 'high',
  full: boolean
): Promise<HealResult> {
  // High severity or explicit full heal triggers hard reset
  const doFullHeal = full || severity === 'high';
  
  return healAutoblog({
    full: doFullHeal,
    source: `system.heal (severity=${severity})`
  });
}
