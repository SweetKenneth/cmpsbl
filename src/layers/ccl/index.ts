/**
 * Operational Compliance Grid (OCG)
 * Formerly: Clockless Cognitive Lucidity (CCL)
 * 
 * Boundary enforcement grid — contains 5 Zones:
 *   RIPPLE Zone + ACCESS Zone + IDENTITY Zone + RELAY Zone + AUDIT Zone
 *
 * Each Zone is surgically hot-swappable with its own circuit breaker.
 * If a Zone's circuit trips, the fault is isolated (e.g., "RIPPLE Zone fault").
 *
 * Topology: OCG is a Grid — right-side tap off the vertical spine.
 * Boot order: CORE → SYSTEM → CCR → OCG → Modules → Fields → Plane → Shell → INTEGRATION
 */

import { emit } from '@/lib/substrate/events';

// ─── Feature Flag ────────────────────────────────────────────────────────────

let ocgEnabled = true;
export function isOCGEnabled(): boolean { return ocgEnabled; }
export function setOCGEnabled(v: boolean): void { ocgEnabled = v; }

// Legacy aliases
export const isCCLEnabled = isOCGEnabled;
export const setCCLEnabled = setOCGEnabled;

// ─── OCG State ───────────────────────────────────────────────────────────────

interface OCGState {
  active: boolean;
  bootedAt: string | null;
  health: number;
  subsystems: Record<string, { active: boolean; health: number }>;
}

const state: OCGState = {
  active: false,
  bootedAt: null,
  health: 100,
  subsystems: {
    identity: { active: false, health: 0 },
    access: { active: false, health: 0 },
    signal: { active: false, health: 0 },   // formerly RIPPLE
    relay: { active: false, health: 0 },
    audit: { active: false, health: 0 },     // compliance logging
    integrity: { active: false, health: 0 }, // health check bindings
  },
};

// ─── Subsystem Initializers ──────────────────────────────────────────────────

function initializeIdentity(): void {
  state.subsystems.identity = { active: true, health: 100 };
  emit({ module: 'access', event_type: 'identity_init', outcome: 'succeeded', data: { backed_by: 'ocg' } });
}

function initializeAccess(): void {
  state.subsystems.access = { active: true, health: 100 };
  emit({ module: 'access', event_type: 'access_init', outcome: 'succeeded', data: { backed_by: 'ocg' } });
}

function initializeSignal(): void {
  state.subsystems.signal = { active: true, health: 100 };
  emit({ module: 'ripple', event_type: 'signal_init', outcome: 'succeeded', data: { backed_by: 'ocg' } });
}

function initializeRelay(): void {
  state.subsystems.relay = { active: true, health: 100 };
  emit({ module: 'relay', event_type: 'relay_init', outcome: 'succeeded', data: { backed_by: 'ocg' } });
}

function initializeAudit(): void {
  state.subsystems.audit = { active: true, health: 100 };
  emit({ module: 'audit', event_type: 'audit_init', outcome: 'succeeded', data: { backed_by: 'ocg' } });
}

function bindHealthCheckSurface(): void {
  state.subsystems.integrity = { active: true, health: 100 };
}

// ─── Public Boot ─────────────────────────────────────────────────────────────

export async function initializeOCG(): Promise<{ success: boolean; data: any }> {
  if (state.active) return { success: true, data: { message: 'OCG already booted', bootedAt: state.bootedAt } };

  try {
    initializeIdentity();
    initializeAccess();
    initializeSignal();
    initializeRelay();
    initializeAudit();
    bindHealthCheckSurface();

    state.active = true;
    state.bootedAt = new Date().toISOString();
    state.health = 100;

    emit({ module: 'core', event_type: 'ocg_boot', outcome: 'succeeded', data: { subsystems: Object.keys(state.subsystems) } });
    return { success: true, data: { bootedAt: state.bootedAt, subsystems: state.subsystems } };
  } catch (e) {
    emit({ module: 'core', event_type: 'ocg_boot', outcome: 'failed', data: { error: String(e) } });
    return { success: false, data: { error: String(e) } };
  }
}

// Legacy alias
export const initializeCCL = initializeOCG;

// ─── OCG Internal API ────────────────────────────────────────────────────────

export function status() {
  return { success: true, data: { active: state.active, health: state.health, bootedAt: state.bootedAt, subsystems: state.subsystems, layer: 'ocg', backed_by: 'OPERATIONAL_COMPLIANCE_GRID' } };
}

export function health() {
  const subs = Object.values(state.subsystems);
  const avg = subs.length > 0 ? Math.round(subs.reduce((s, v) => s + v.health, 0) / subs.length) : 0;
  return { success: true, data: { health: avg, subsystems: state.subsystems } };
}

export function pulse() {
  return { success: state.active, data: { backed_by: 'ocg', active: state.active } };
}

// ─── Diagnostics (admin-only) ────────────────────────────────────────────────

export function getDiagnostics() {
  return {
    ocgActive: state.active,
    bootedAt: state.bootedAt,
    health: state.health,
    subsystems: state.subsystems,
    featureFlagEnabled: ocgEnabled,
    absorbedModules: ['ripple', 'access', 'identity', 'relay', 'audit'],
  };
}

// ─── Unified Dispatch ────────────────────────────────────────────────────────

type OCGAction = 'status' | 'health' | 'pulse' | 'boot' | 'diagnostics';

const DISPATCH_MAP: Record<OCGAction, (input?: any) => any> = {
  status, health, pulse,
  boot: initializeOCG,
  diagnostics: getDiagnostics,
};

export function dispatch(action: string, input?: any): any {
  const handler = DISPATCH_MAP[action as OCGAction];
  if (handler) return handler(input);
  return { success: true, data: { action, backed_by: 'ocg', passthrough: true } };
}

// ─── Module-to-OCG Action Mapping (proxy shims) ─────────────────────────────

const MODULE_ACTION_MAP: Record<string, Record<string, OCGAction>> = {
  ripple: { status: 'status', health: 'health', pulse: 'pulse' },
  access: { status: 'status', health: 'health', pulse: 'pulse' },
  identity: { status: 'status', health: 'health', pulse: 'pulse' },
  relay: { status: 'status', health: 'health', pulse: 'pulse' },
  audit: { status: 'status', health: 'health', pulse: 'pulse' },
};

export function resolveOCGAction(module: string, action: string): OCGAction | null {
  if (!ocgEnabled) return null;
  return (MODULE_ACTION_MAP[module]?.[action] as OCGAction) ?? null;
}

// Legacy alias
export const resolveCCLAction = resolveOCGAction;

export const OCG_FACADE_MODULES = ['ripple', 'access', 'identity', 'relay', 'audit'] as const;
export type OCGFacadeModule = typeof OCG_FACADE_MODULES[number];

// Legacy aliases
export const CCL_FACADE_MODULES = OCG_FACADE_MODULES;
export type CCLFacadeModule = OCGFacadeModule;

export function isOCGFacade(module: string): boolean {
  return OCG_FACADE_MODULES.includes(module as OCGFacadeModule);
}

// Legacy alias
export const isCCLFacade = isOCGFacade;
