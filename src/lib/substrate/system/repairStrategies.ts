/**
 * CMPSBL Self-Repair Strategies
 * Safe, reversible repair actions for degraded subsystems.
 * All strategies operate on exposed module APIs — no globalThis hacks.
 */

import { recheckHealth } from '../control-plane/adapters/queueStateAdapter';
import { clearStream, healStream, getStreamHealth, getStreamBreakerState } from '../module-bus/eventStream';
import { healDiscoveryEngine, getDiscoveryHealth, getDiscoveryBreakerState } from '../intent-mesh/discovery-engine';
import { resetProbeBreaker } from '../capability-discovery';

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

    const force = healthBefore.score < 50 || breakerBefore.state === 'open';
    const result = healStream(force);

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

/** Heal discovery engine — reset breaker, restore health, clear cooldown */
export async function repairDiscoveryEngine(): Promise<RepairResult> {
  try {
    const healthBefore = getDiscoveryHealth();
    const breakerBefore = getDiscoveryBreakerState();

    const force = healthBefore.score < 50 || breakerBefore.state === 'open';
    const result = healDiscoveryEngine(force);

    // Also reset the capability-discovery probe breaker
    resetProbeBreaker();

    return {
      repaired: true,
      module: 'discovery_engine',
      message: `Healed: ${result.actions.length} actions, score ${result.previousScore}→${result.newScore}, probe breaker reset`,
    };
  } catch (err: any) {
    return { repaired: false, module: 'discovery_engine', message: err?.message || 'repair failed' };
  }
}

// ═══════════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════════

/**
 * Fallback repair: re-probe CP health (used for subsystems with no specialised strategy).
 */
async function repairGeneric(moduleName: string): Promise<RepairResult> {
  try {
    const healthy = await recheckHealth();
    return {
      repaired: healthy,
      module: moduleName,
      message: healthy ? `${moduleName} recovered via CP recheck` : `${moduleName} still degraded`,
    };
  } catch (err: any) {
    return { repaired: false, module: moduleName, message: err?.message || 'repair failed' };
  }
}

/** Attempt to reload vault primitives from database */
export async function repairVaultLoader(): Promise<RepairResult> {
  try {
    const { resetVaultLoader, loadVaultPrimitives, getVaultPrimitiveCount } = await import('../vault-primitive-loader');
    resetVaultLoader();
    const result = await loadVaultPrimitives();
    const count = getVaultPrimitiveCount();
    return {
      repaired: count > 0,
      module: 'vault_loader',
      message: count > 0
        ? `Reloaded ${result.loaded} primitives across ${Object.keys(result.byNode).length} nodes`
        : 'Reload returned 0 primitives',
    };
  } catch (err: any) {
    return { repaired: false, module: 'vault_loader', message: err?.message || 'vault reload failed' };
  }
}

export const RepairStrategies: Record<string, () => Promise<RepairResult>> = {
  control_plane: repairControlPlane,
  event_stream: repairEventStream,
  plan_store: repairPlanStore,
  discussion: repairDiscussion,
  discovery_engine: repairDiscoveryEngine,
  vault_loader: repairVaultLoader,
  mutation_chain: () => repairGeneric('mutation_chain'),
  ironclad: () => repairGeneric('ironclad'),
};
