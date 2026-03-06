/**
 * CMPSBL Self-Repair Strategies
 * Safe, reversible repair actions for degraded subsystems.
 * All strategies operate on exposed module APIs — no globalThis hacks.
 */

import { recheckHealth } from '../control-plane/adapters/queueStateAdapter';
import { clearStream, healStream, getStreamHealth, getStreamBreakerState } from '../module-bus/eventStream';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RepairResult {
  repaired: boolean;
  module: string;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// STRATEGIES
// ═══════════════════════════════════════════════════════════════

/** Re-probe CP health and attempt to restore durable storage */
export async function repairControlPlane(): Promise<RepairResult> {
  try {
    const healthy = await recheckHealth();
    return {
      repaired: healthy,
      module: 'control_plane',
      message: healthy ? 'CP storage restored' : 'CP still degraded — using fallback',
    };
  } catch (err: any) {
    return { repaired: false, module: 'control_plane', message: err?.message || 'repair failed' };
  }
}

/** Heal event stream — reset breaker, restore health, flush if needed */
export async function repairEventStream(): Promise<RepairResult> {
  try {
    const healthBefore = getStreamHealth();
    const breakerBefore = getStreamBreakerState();

    // If health is critical or breaker is open, do a full heal
    const force = healthBefore.score < 50 || breakerBefore.state === 'open';
    const result = healStream(force);

    // Additionally clear buffer if it was a forced heal
    let cleared = 0;
    if (force) {
      cleared = clearStream();
    }

    return {
      repaired: true,
      module: 'event_stream',
      message: `Healed: ${result.actions.length} actions, score ${result.previousScore}→${result.newScore}${cleared > 0 ? `, cleared ${cleared} events` : ''}`,
    };
  } catch (err: any) {
    return { repaired: false, module: 'event_stream', message: err?.message || 'repair failed' };
  }
}

/** Re-probe plan store health (forces CP recheck) */
export async function repairPlanStore(): Promise<RepairResult> {
  try {
    const healthy = await recheckHealth();
    return {
      repaired: healthy,
      module: 'plan_store',
      message: healthy ? 'Plan store CP link restored' : 'Plan store still degraded',
    };
  } catch (err: any) {
    return { repaired: false, module: 'plan_store', message: err?.message || 'repair failed' };
  }
}

/** Re-probe discussion health */
export async function repairDiscussion(): Promise<RepairResult> {
  try {
    const healthy = await recheckHealth();
    return {
      repaired: healthy,
      module: 'discussion',
      message: healthy ? 'Discussion CP link restored' : 'Discussion still degraded',
    };
  } catch (err: any) {
    return { repaired: false, module: 'discussion', message: err?.message || 'repair failed' };
  }
}

// ═══════════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════════

export const RepairStrategies: Record<string, () => Promise<RepairResult>> = {
  control_plane: repairControlPlane,
  event_stream: repairEventStream,
  plan_store: repairPlanStore,
  discussion: repairDiscussion,
};
