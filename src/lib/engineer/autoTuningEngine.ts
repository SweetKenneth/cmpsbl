/**
 * ENGINEER — Auto-Tuning Parameter Engine
 * Closed-loop optimizer: adjusts tunable parameters with ±10% incremental moves.
 * Automatic reversion on degradation.
 * @module engineer/autoTuningEngine
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type TunableParam =
  | 'connection_pool_size'
  | 'batch_size'
  | 'cache_size'
  | 'queue_depth'
  | 'worker_threads'
  | 'timeout_ms';

export interface TuningState {
  param: TunableParam;
  currentValue: number;
  baselineValue: number;
  lastAdjustment: number;     // epoch ms
  adjustmentDirection: 'up' | 'down' | 'none';
  performanceBefore: number;  // metric at last adjustment
  reverted: boolean;
}

export interface TuningResult {
  param: TunableParam;
  oldValue: number;
  newValue: number;
  reason: string;
  reverted: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────

const ADJUSTMENT_FACTOR = 0.10; // ±10%
const DEGRADATION_THRESHOLD = 0.05; // 5% worse = revert
const MIN_INTERVAL_MS = 60_000; // 1 minute between adjustments per param

// ── State ──────────────────────────────────────────────────────────────────

const tuningStates = new Map<TunableParam, TuningState>();
const tuningLog: TuningResult[] = [];

// ── Core ───────────────────────────────────────────────────────────────────

export function initParam(param: TunableParam, initialValue: number): void {
  tuningStates.set(param, {
    param,
    currentValue: initialValue,
    baselineValue: initialValue,
    lastAdjustment: 0,
    adjustmentDirection: 'none',
    performanceBefore: 0,
    reverted: false,
  });
}

export function adjustParam(
  param: TunableParam,
  currentPerformance: number,
  direction: 'up' | 'down',
): TuningResult | null {
  const state = tuningStates.get(param);
  if (!state) return null;

  const now = Date.now();
  if (now - state.lastAdjustment < MIN_INTERVAL_MS) return null;

  // Check if last adjustment degraded performance → revert
  if (state.adjustmentDirection !== 'none' && state.performanceBefore > 0) {
    const degradation = (state.performanceBefore - currentPerformance) / state.performanceBefore;
    if (degradation > DEGRADATION_THRESHOLD) {
      const oldValue = state.currentValue;
      state.currentValue = state.baselineValue;
      state.reverted = true;
      state.adjustmentDirection = 'none';
      state.lastAdjustment = now;
      const result: TuningResult = {
        param,
        oldValue,
        newValue: state.baselineValue,
        reason: `Reverted: ${Math.round(degradation * 100)}% degradation detected`,
        reverted: true,
      };
      tuningLog.push(result);
      return result;
    }
  }

  // Apply new adjustment
  const factor = direction === 'up' ? (1 + ADJUSTMENT_FACTOR) : (1 - ADJUSTMENT_FACTOR);
  const oldValue = state.currentValue;
  const newValue = Math.max(1, Math.round(oldValue * factor));

  if (newValue === oldValue) return null;

  state.baselineValue = oldValue;
  state.currentValue = newValue;
  state.performanceBefore = currentPerformance;
  state.adjustmentDirection = direction;
  state.lastAdjustment = now;
  state.reverted = false;

  const result: TuningResult = {
    param,
    oldValue,
    newValue,
    reason: `Auto-tuned ${direction} by ${ADJUSTMENT_FACTOR * 100}%`,
    reverted: false,
  };
  tuningLog.push(result);
  return result;
}

export function getParamValue(param: TunableParam): number | undefined {
  return tuningStates.get(param)?.currentValue;
}

export function getAllTuningStates(): TuningState[] {
  return Array.from(tuningStates.values());
}

export function getTuningLog(): TuningResult[] {
  return [...tuningLog];
}

export function resetAll(): void {
  tuningStates.clear();
  tuningLog.length = 0;
}
