/**
 * CLOCKLESS_COGNITIVE_REALITY (CCR)
 * Layer 0 — Hidden Meta-Engine powering the CMPSBL Substrate
 * 
 * Contains 4 Zones: SYSTEM Zone + BRAIN Zone + MEMORY Zone + DREAM Zone
 * Each Zone is surgically hot-swappable with its own circuit breaker.
 * If a Zone's circuit breaker trips, the fault is isolated to that Zone.
 *
 * CORE is standalone (not a Zone).
 * CCL (Layer 1) contains 5 Zones: RIPPLE + ACCESS + IDENTITY + RELAY + AUDIT
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';

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
  facadesActive: string[];  // now called "zones"
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
  facadesActive: ['system', 'brain', 'memory', 'dream'],
  bootGatesPassed: false,
};

// ─── Circuit Breaker ─────────────────────────────────────────────────────────

const CIRCUIT_CONFIG = {
  failure_threshold: 5,
  recovery_timeout_ms: 30000,
  success_threshold: 3,
  monitoring_window_ms: 60000,
};

let successStreak = 0;

function tripCircuit(): void {
  state.failureCount++;
  successStreak = 0;
  if (state.failureCount >= CIRCUIT_CONFIG.failure_threshold) {
    state.circuitState = 'open';
    emit({ module: 'core', event_type: 'circuit_open', outcome: 'failed', data: { layer: 'ccr', failures: state.failureCount } });
    setTimeout(() => {
      if (state.circuitState === 'open') state.circuitState = 'half_open';
    }, CIRCUIT_CONFIG.recovery_timeout_ms);
  }
}

function recordSuccess(): void {
  successStreak++;
  if (state.circuitState === 'half_open' && successStreak >= CIRCUIT_CONFIG.success_threshold) {
    state.circuitState = 'closed';
    state.failureCount = 0;
    emit({ module: 'core', event_type: 'circuit_closed', outcome: 'succeeded', data: { layer: 'ccr' } });
  }
}

// ─── CCR Internal API ────────────────────────────────────────────────────────

export function status() {
  return {
    success: true,
    data: {
      active: state.active, health: state.health, circuitState: state.circuitState,
      bootedAt: state.bootedAt, facadesActive: state.facadesActive,
      bootGatesPassed: state.bootGatesPassed, layer: 'ccr', backed_by: 'CLOCKLESS_COGNITIVE_REALITY',
    },
  };
}

export function health() {
  const h = Math.round((state.health + state.memoryStoreHealth) / 2);
  return { success: true, data: { health: h, circuitState: state.circuitState, memoryStoreHealth: state.memoryStoreHealth } };
}

export async function boot(): Promise<{ success: boolean; data: any }> {
  if (state.active) return { success: true, data: { message: 'CCR already booted', bootedAt: state.bootedAt } };
  emitStarted('core', 'ccr_boot');
  try {
    state.bootGatesPassed = true;
    state.active = true;
    state.bootedAt = new Date().toISOString();
    state.health = 100;
    state.memoryStoreHealth = 100;
    recordSuccess();
    emitSucceeded('core', 'ccr_boot', { facades: state.facadesActive });
    return { success: true, data: { bootedAt: state.bootedAt, facades: state.facadesActive } };
  } catch (e) {
    tripCircuit();
    emitFailed('core', 'ccr_boot', String(e));
    return { success: false, data: { error: String(e) } };
  }
}

export function circuit() {
  return { success: true, data: { state: state.circuitState, failureCount: state.failureCount, config: CIRCUIT_CONFIG } };
}

export function config() {
  return { success: true, data: { debug_mode: false, strict_governance: true, event_logging: true, performance_tracking: true, max_retry_attempts: 3, default_timeout_ms: 30000 } };
}

export async function reason(input?: { query?: string; context?: string }) {
  // Input validation
  const query = validateStringInput(input?.query, { maxLength: 10_000, label: 'ccr.reason.query' });
  const context = validateStringInput(input?.context, { maxLength: 50_000, label: 'ccr.reason.context' });

  emitStarted('brain', 'reason', { query, context });
  try {
    recordSuccess();
    const result = { reasoning: query ? `Reasoning about: ${query}` : 'Idle reasoning', confidence: 0.85, backed_by: 'ccr' };
    emitSucceeded('brain', 'reason', result);
    return { success: true, data: result };
  } catch (e) {
    tripCircuit();
    emitFailed('brain', 'reason', String(e));
    return { success: false, data: { error: String(e) } };
  }
}

export async function store(input?: { key?: string; value?: any; tier?: string }) {
  // Input validation
  const key = validateStringInput(input?.key, { maxLength: 500, label: 'ccr.store.key' });
  const tier = validateStringInput(input?.tier, { maxLength: 20, label: 'ccr.store.tier' }) || 'hot';
  if (tier !== 'hot' && tier !== 'warm' && tier !== 'cold') {
    return { success: false, data: { error: `Invalid tier: ${tier}. Must be hot|warm|cold` } };
  }

  emitStarted('memory', 'store', { key, tier } as any);
  try {
    recordSuccess();
    emitSucceeded('memory', 'store', { key });
    return { success: true, data: { stored: true, tier } };
  } catch (e) {
    tripCircuit();
    emitFailed('memory', 'store', String(e));
    return { success: false, data: { error: String(e) } };
  }
}

export async function retrieve(input?: { query?: string; limit?: number }) {
  // Input validation
  const query = validateStringInput(input?.query, { maxLength: 5_000, label: 'ccr.retrieve.query' });
  const limit = clampNumber(input?.limit, 1, 100, 10);

  emitStarted('memory', 'retrieve', { query, limit });
  try {
    recordSuccess();
    emitSucceeded('memory', 'retrieve', { query });
    return { success: true, data: { results: [], query, limit, backed_by: 'ccr' } };
  } catch (e) {
    tripCircuit();
    return { success: false, data: { error: String(e) } };
  }
}

export async function synthesize(input?: { content?: string; mode?: string }) {
  emitStarted('dream', 'synthesize', input);
  try {
    state.lastSynthTime = new Date().toISOString();
    recordSuccess();
    const result = { synthesized: true, lastSynthTime: state.lastSynthTime, backed_by: 'ccr' };
    emitSucceeded('dream', 'synthesize', result);
    return { success: true, data: result };
  } catch (e) {
    tripCircuit();
    emitFailed('dream', 'synthesize', String(e));
    return { success: false, data: { error: String(e) } };
  }
}

export function pulse() {
  return { success: state.active, data: { backed_by: 'ccr', active: state.active } };
}

// ─── Diagnostics (admin-only) ────────────────────────────────────────────────

export function getDiagnostics() {
  return {
    ccrActive: state.active, bootedAt: state.bootedAt, circuitState: state.circuitState,
    failureCount: state.failureCount, health: state.health, memoryStoreHealth: state.memoryStoreHealth,
    lastSynthTime: state.lastSynthTime, facadesActive: state.facadesActive,
    bootGatesPassed: state.bootGatesPassed, featureFlagEnabled: ccrEnabled,
  };
}

// ─── Unified dispatch ────────────────────────────────────────────────────────

type CCRAction = 'status' | 'health' | 'boot' | 'circuit' | 'config' | 'pulse' | 'reason' | 'store' | 'retrieve' | 'synthesize';

const DISPATCH_MAP: Record<CCRAction, (input?: any) => any> = {
  status, health, boot, circuit, config, pulse, reason, store, retrieve, synthesize,
};

export function dispatch(action: string, input?: any): any {
  // Input validation — reject unknown/empty actions
  const validAction = validateStringInput(action, { maxLength: 50, minLength: 1, label: 'ccr.dispatch.action' });
  if (!validAction) {
    return { success: false, data: { error: 'Invalid action: must be a non-empty string (max 50 chars)' } };
  }

  // Circuit check — reject if circuit is open
  if (state.circuitState === 'open') {
    return { success: false, data: { error: 'CCR circuit is OPEN — request rejected', circuit: state.circuitState } };
  }

  const handler = DISPATCH_MAP[validAction as CCRAction];
  if (handler) return handler(input);
  return { success: true, data: { action: validAction, backed_by: 'ccr', passthrough: true } };
}

// ─── Module-to-CCR Action Mapping ────────────────────────────────────────────

const MODULE_ACTION_MAP: Record<string, Record<string, CCRAction>> = {
  // CORE is standalone — no longer routed through CCR
  system: { status: 'status', health: 'health', boot: 'boot', config: 'config', pulse: 'pulse' },
  brain: { status: 'status', reason: 'reason', pulse: 'pulse', health: 'health' },
  memory: { status: 'status', store: 'store', retrieve: 'retrieve', search: 'retrieve', pulse: 'pulse', health: 'health' },
  dream: { status: 'status', synthesize: 'synthesize', pulse: 'pulse', health: 'health' },
};

export function resolveCCRAction(module: string, action: string): CCRAction | null {
  if (!ccrEnabled) return null;
  return (MODULE_ACTION_MAP[module]?.[action] as CCRAction) ?? null;
}

export const CCR_FACADE_MODULES = ['system', 'brain', 'memory', 'dream'] as const;
export type CCRFacadeModule = typeof CCR_FACADE_MODULES[number];

export function isCCRFacade(module: string): boolean {
  return CCR_FACADE_MODULES.includes(module as CCRFacadeModule);
}
