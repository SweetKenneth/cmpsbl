/**
 * FORGE Ultimate #9 — Thermal Budget Governor
 * Rate-limits forge operations to prevent resource exhaustion.
 * Thermal zones: cool → warm → hot → critical.
 * Cost estimation before forging begins.
 */

// ── Types ──

export type ThermalZone = 'cool' | 'warm' | 'hot' | 'critical';

export interface ThermalState {
  zone: ThermalZone;
  temperature: number;           // 0-100
  operationsThisWindow: number;
  windowStartAt: number;
  throttleActive: boolean;
  throttleReason?: string;
  cooldownUntil: number | null;
}

export interface CostEstimate {
  blueprintId: string;
  estimatedComputeMs: number;
  estimatedMemoryMB: number;
  estimatedCost: number;         // Relative cost units
  thermalImpact: number;         // How much this will raise temperature
  approved: boolean;
  reason: string;
}

// ── Constants ──

const ZONE_THRESHOLDS: Record<ThermalZone, { min: number; maxOpsPerMinute: number }> = {
  cool: { min: 0, maxOpsPerMinute: 60 },
  warm: { min: 40, maxOpsPerMinute: 30 },
  hot: { min: 70, maxOpsPerMinute: 10 },
  critical: { min: 90, maxOpsPerMinute: 2 },
};

const WINDOW_MS = 60_000; // 1 minute
const COOL_RATE = 0.5;    // Temperature decay per second
const HEAT_PER_OP = 5;    // Temperature increase per operation

// ── State ──

let state: ThermalState = {
  zone: 'cool', temperature: 0,
  operationsThisWindow: 0, windowStartAt: Date.now(),
  throttleActive: false, cooldownUntil: null,
};

let totalOperations = 0;
let totalThrottled = 0;

// ── Helpers ──

function computeZone(temp: number): ThermalZone {
  if (temp >= 90) return 'critical';
  if (temp >= 70) return 'hot';
  if (temp >= 40) return 'warm';
  return 'cool';
}

// ── Core ──

export function requestForgeSlot(): { approved: boolean; zone: ThermalZone; waitMs: number } {
  const now = Date.now();

  // Reset window if expired
  if (now - state.windowStartAt > WINDOW_MS) {
    state.operationsThisWindow = 0;
    state.windowStartAt = now;
  }

  // Apply cooling
  const elapsed = (now - state.windowStartAt) / 1000;
  state.temperature = Math.max(0, state.temperature - elapsed * COOL_RATE);
  state.zone = computeZone(state.temperature);

  // Check cooldown
  if (state.cooldownUntil && now < state.cooldownUntil) {
    totalThrottled++;
    return { approved: false, zone: state.zone, waitMs: state.cooldownUntil - now };
  }
  state.cooldownUntil = null;

  // Check rate limit
  const maxOps = ZONE_THRESHOLDS[state.zone].maxOpsPerMinute;
  if (state.operationsThisWindow >= maxOps) {
    state.throttleActive = true;
    state.throttleReason = `${state.zone} zone limit (${maxOps}/min)`;
    totalThrottled++;

    // Enter cooldown in critical zone
    if (state.zone === 'critical') {
      state.cooldownUntil = now + 30_000; // 30s cooldown
    }

    return { approved: false, zone: state.zone, waitMs: WINDOW_MS - (now - state.windowStartAt) };
  }

  // Approve
  state.operationsThisWindow++;
  state.temperature = Math.min(100, state.temperature + HEAT_PER_OP);
  state.zone = computeZone(state.temperature);
  state.throttleActive = false;
  totalOperations++;

  return { approved: true, zone: state.zone, waitMs: 0 };
}

export function estimateCost(blueprintId: string, moduleCount: number, targetCount: number): CostEstimate {
  const computeMs = moduleCount * 50 + targetCount * 200;
  const memoryMB = moduleCount * 2 + targetCount * 5;
  const cost = Math.round((computeMs * 0.01 + memoryMB * 0.05) * 100) / 100;
  const thermalImpact = Math.min(30, moduleCount * 2 + targetCount * 3);

  const wouldOverheat = (state.temperature + thermalImpact) >= 90;

  return {
    blueprintId,
    estimatedComputeMs: computeMs,
    estimatedMemoryMB: memoryMB,
    estimatedCost: cost,
    thermalImpact,
    approved: !wouldOverheat,
    reason: wouldOverheat ? 'Would push thermal into critical zone' : 'Within thermal budget',
  };
}

export function getThermalState(): ThermalState { return { ...state }; }

export function getThermalStats(): { totalOperations: number; totalThrottled: number; currentZone: ThermalZone; temperature: number; throttleRate: number } {
  return {
    totalOperations, totalThrottled,
    currentZone: state.zone,
    temperature: Math.round(state.temperature * 10) / 10,
    throttleRate: totalOperations > 0 ? Math.round(totalThrottled / (totalOperations + totalThrottled) * 1000) / 1000 : 0,
  };
}

export function resetThermalState(): void {
  state = { zone: 'cool', temperature: 0, operationsThisWindow: 0, windowStartAt: Date.now(), throttleActive: false, cooldownUntil: null };
  totalOperations = 0; totalThrottled = 0;
}
