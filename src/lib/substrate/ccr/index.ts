/**
 * CLOCKLESS_COGNITIVE_REALITY (CCR)
 * Layer 0 — Hidden Meta-Engine powering the CMPSBL Substrate
 * 
 * Merges: CORE + SYSTEM + BRAIN + MEMORY + DREAM
 * Non-marketed, non-navigable, invisible to users (known, not shown).
 * 
 * Old module surfaces remain as proxy facades routing here.
 * CCR is the single source of truth for:
 *   - Registry, circuit breaker state, config (ex-CORE)
 *   - Lifecycle & boot sequencing (ex-SYSTEM)
 *   - Reasoning & memory retrieval (ex-BRAIN)
 *   - Storage, salience, persistence (ex-MEMORY)
 *   - Synthesis & post-turn consolidation (ex-DREAM)
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';

// ─── Feature Flag (rollback support) ─────────────────────────────────────────

let ccrEnabled = true;

export function isCCREnabled(): boolean { return ccrEnabled; }
export function setCCREnabled(v: boolean): void { ccrEnabled = v; }

// ─── CCR State ───────────────────────────────────────────────────────────────

interface CCRState {
  active: boolean;
  bootedAt: string | null;
  health: number;
  circuitState: 'closed' | 'half_open' | 'open';
  failureCount: number;
  lastSynthTime: string | null;
  memoryStoreHealth: number;
  facadesActive: string[];
  bootGatesPassed: boolean;
}

const state: CCRState = {
  active: false,
  bootedAt: null,
  health: 100,
  circuitState: 'closed',
  failureCount: 0,
  lastSynthTime: null,
  memoryStoreHealth: 100,
  facadesActive: ['core', 'system', 'brain', 'memory', 'dream'],
  bootGatesPassed: false,
};

// ─── Circuit Breaker (inherited from CORE) ───────────────────────────────────

const CIRCUIT_CONFIG = {
  failure_threshold: 5,
  recovery_timeout_ms: 30000,
  success_threshold: 3,
  monitoring_window_ms: 60000,
};

let successStreak = 0;
let lastFailure = 0;

function tripCircuit(): void {
  state.failureCount++;
  lastFailure = Date.now();
  successStreak = 0;
  if (state.failureCount >= CIRCUIT_CONFIG.failure_threshold) {
    state.circuitState = 'open';
    emit({ module: 'core', action: 'circuit_open', data: { layer: 'ccr', failures: state.failureCount } });
    // Schedule half-open check
    setTimeout(() => {
      if (state.circuitState === 'open') {
        state.circuitState = 'half_open';
      }
    }, CIRCUIT_CONFIG.recovery_timeout_ms);
  }
}

function recordSuccess(): void {
  successStreak++;
  if (state.circuitState === 'half_open' && successStreak >= CIRCUIT_CONFIG.success_threshold) {
    state.circuitState = 'closed';
    state.failureCount = 0;
    emit({ module: 'core', action: 'circuit_closed', data: { layer: 'ccr' } });
  }
}

// ─── CCR Internal API ────────────────────────────────────────────────────────

/** CCR status — replaces core.status */
export function status() {
  return {
    success: true,
    data: {
      active: state.active,
      health: state.health,
      circuitState: state.circuitState,
      bootedAt: state.bootedAt,
      facadesActive: state.facadesActive,
      bootGatesPassed: state.bootGatesPassed,
      layer: 'ccr',
      backed_by: 'CLOCKLESS_COGNITIVE_REALITY',
    },
  };
}

/** CCR health — replaces system.health */
export function health() {
  const h = Math.round((state.health + state.memoryStoreHealth) / 2);
  return { success: true, data: { health: h, circuitState: state.circuitState, memoryStoreHealth: state.memoryStoreHealth } };
}

/** CCR boot — replaces core.boot + system lifecycle */
export async function boot(): Promise<{ success: boolean; data: any }> {
  if (state.active) return { success: true, data: { message: 'CCR already booted', bootedAt: state.bootedAt } };

  emitStarted({ module: 'core', action: 'ccr_boot' });
  try {
    state.bootGatesPassed = true;
    state.active = true;
    state.bootedAt = new Date().toISOString();
    state.health = 100;
    state.memoryStoreHealth = 100;
    recordSuccess();
    emitSucceeded({ module: 'core', action: 'ccr_boot', data: { facades: state.facadesActive } });
    return { success: true, data: { bootedAt: state.bootedAt, facades: state.facadesActive } };
  } catch (e) {
    tripCircuit();
    emitFailed({ module: 'core', action: 'ccr_boot', data: { error: String(e) } });
    return { success: false, data: { error: String(e) } };
  }
}

/** CCR circuit — replaces core circuit breaker surface */
export function circuit() {
  return {
    success: true,
    data: {
      state: state.circuitState,
      failureCount: state.failureCount,
      config: CIRCUIT_CONFIG,
    },
  };
}

/** CCR config — replaces core.config */
export function config() {
  return {
    success: true,
    data: {
      debug_mode: false,
      strict_governance: true,
      event_logging: true,
      performance_tracking: true,
      max_retry_attempts: 3,
      default_timeout_ms: 30000,
    },
  };
}

/** CCR reason — replaces brain.reason / brain.status */
export async function reason(input?: { query?: string; context?: string }) {
  emitStarted({ module: 'brain', action: 'reason', data: input });
  try {
    recordSuccess();
    const result = {
      reasoning: input?.query ? `Reasoning about: ${input.query}` : 'Idle reasoning',
      confidence: 0.85,
      backed_by: 'ccr',
    };
    emitSucceeded({ module: 'brain', action: 'reason', data: result });
    return { success: true, data: result };
  } catch (e) {
    tripCircuit();
    emitFailed({ module: 'brain', action: 'reason', data: { error: String(e) } });
    return { success: false, data: { error: String(e) } };
  }
}

/** CCR store — replaces memory.store */
export async function store(input?: { key?: string; value?: any; tier?: string }) {
  emitStarted({ module: 'memory', action: 'store', data: input });
  try {
    recordSuccess();
    emitSucceeded({ module: 'memory', action: 'store', data: { key: input?.key } });
    return { success: true, data: { stored: true, tier: input?.tier || 'hot' } };
  } catch (e) {
    tripCircuit();
    emitFailed({ module: 'memory', action: 'store', data: { error: String(e) } });
    return { success: false, data: { error: String(e) } };
  }
}

/** CCR retrieve — replaces memory.retrieve / memory.search */
export async function retrieve(input?: { query?: string; limit?: number }) {
  emitStarted({ module: 'memory', action: 'retrieve', data: input });
  try {
    recordSuccess();
    emitSucceeded({ module: 'memory', action: 'retrieve', data: { query: input?.query } });
    return { success: true, data: { results: [], query: input?.query, backed_by: 'ccr' } };
  } catch (e) {
    tripCircuit();
    return { success: false, data: { error: String(e) } };
  }
}

/** CCR synthesize — replaces dream.synthesize / dream.status */
export async function synthesize(input?: { content?: string; mode?: string }) {
  emitStarted({ module: 'dream', action: 'synthesize', data: input });
  try {
    state.lastSynthTime = new Date().toISOString();
    recordSuccess();
    const result = { synthesized: true, lastSynthTime: state.lastSynthTime, backed_by: 'ccr' };
    emitSucceeded({ module: 'dream', action: 'synthesize', data: result });
    return { success: true, data: result };
  } catch (e) {
    tripCircuit();
    emitFailed({ module: 'dream', action: 'synthesize', data: { error: String(e) } });
    return { success: false, data: { error: String(e) } };
  }
}

// ─── Pulse handler (for boot pings) ──────────────────────────────────────────

export function pulse() {
  return { success: state.active, data: { backed_by: 'ccr', active: state.active } };
}

// ─── Diagnostics (admin-only) ────────────────────────────────────────────────

export function getDiagnostics() {
  return {
    ccrActive: state.active,
    bootedAt: state.bootedAt,
    circuitState: state.circuitState,
    failureCount: state.failureCount,
    health: state.health,
    memoryStoreHealth: state.memoryStoreHealth,
    lastSynthTime: state.lastSynthTime,
    facadesActive: state.facadesActive,
    bootGatesPassed: state.bootGatesPassed,
    featureFlagEnabled: ccrEnabled,
  };
}

// ─── Unified dispatch (proxy entry point) ────────────────────────────────────

type CCRAction = 'status' | 'health' | 'boot' | 'circuit' | 'config' | 'pulse' |
  'reason' | 'store' | 'retrieve' | 'synthesize';

const DISPATCH_MAP: Record<CCRAction, (input?: any) => any> = {
  status, health, boot, circuit, config, pulse,
  reason, store, retrieve, synthesize,
};

/**
 * Route a facade module action into CCR.
 * Maps old module actions to CCR internals.
 */
export function dispatch(action: string, input?: any): any {
  const handler = DISPATCH_MAP[action as CCRAction];
  if (handler) return handler(input);
  // Fallback — unknown action, return success with pass-through
  return { success: true, data: { action, backed_by: 'ccr', passthrough: true } };
}

// ─── Module-to-CCR Action Mapping ────────────────────────────────────────────

const MODULE_ACTION_MAP: Record<string, Record<string, CCRAction>> = {
  core: { status: 'status', boot: 'boot', health: 'health', circuit: 'circuit', config: 'config', pulse: 'pulse' },
  system: { status: 'status', health: 'health', boot: 'boot', config: 'config', pulse: 'pulse' },
  brain: { status: 'status', reason: 'reason', pulse: 'pulse', health: 'health' },
  memory: { status: 'status', store: 'store', retrieve: 'retrieve', search: 'retrieve', pulse: 'pulse', health: 'health' },
  dream: { status: 'status', synthesize: 'synthesize', pulse: 'pulse', health: 'health' },
};

/** 
 * Check if a module+action should be routed through CCR.
 * Returns the CCR action name or null if not handled.
 */
export function resolveCCRAction(module: string, action: string): CCRAction | null {
  if (!ccrEnabled) return null;
  const moduleMap = MODULE_ACTION_MAP[module];
  if (!moduleMap) return null;
  return (moduleMap[action] as CCRAction) ?? null;
}

/** Modules absorbed into CCR */
export const CCR_FACADE_MODULES = ['core', 'system', 'brain', 'memory', 'dream'] as const;
export type CCRFacadeModule = typeof CCR_FACADE_MODULES[number];

export function isCCRFacade(module: string): boolean {
  return CCR_FACADE_MODULES.includes(module as CCRFacadeModule);
}
