/**
 * DEFENSE Guardrail — Threshold Clamping System (Phase 2)
 * 
 * Every adaptive threshold is governed by:
 *   1. Absolute MIN/MAX bounds
 *   2. MAX_DAILY_DELTA percentage cap
 *   3. Cooldown period between adjustments
 *   4. Consecutive-confirmation requirement
 * 
 * All updates are logged with before/after snapshots.
 */

import { guardrailLog } from './logger';
import { isSpikeActive } from './spike-detector';

// ── Types ───────────────────────────────────────────────────────

export interface ThresholdBounds {
  min: number;
  max: number;
}

export interface ThresholdConfig {
  /** Unique key for this threshold */
  key: string;
  /** Absolute value bounds */
  bounds: ThresholdBounds;
  /** Max change per day as a fraction (0.25 = 25%) */
  maxDailyDeltaPct: number;
  /** Minimum cooldown between adjustments in ms */
  cooldownMs: number;
  /** How many consecutive confirmations before allowing an adjustment */
  requiredConfirmations: number;
}

export interface ThresholdState {
  currentValue: number;
  lastAdjustedAt: number; // epoch ms
  dailyDeltaUsed: number; // absolute delta consumed today
  dailyResetAt: number;   // epoch ms when daily budget resets
  pendingDirection: 'up' | 'down' | null;
  consecutiveConfirmations: number;
}

export interface ClampResult {
  value: number;
  clamped: boolean;
  reason: string;
}

export interface DeltaCapResult {
  allowed: boolean;
  cappedValue: number;
  reason: string;
  deltaUsed: number;
}

// ── Pure Utilities ──────────────────────────────────────────────

/**
 * Clamp a numeric value to [min, max]. Always safe — no NaN, no Infinity.
 */
export function clamp(value: number, min: number, max: number): ClampResult {
  if (!Number.isFinite(value)) {
    return { value: min, clamped: true, reason: 'Non-finite value replaced with min' };
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    return { value, clamped: false, reason: 'Invalid bounds — returned raw value' };
  }
  if (value < min) return { value: min, clamped: true, reason: `Clamped up to min (${min})` };
  if (value > max) return { value: max, clamped: true, reason: `Clamped down to max (${max})` };
  return { value, clamped: false, reason: 'Within bounds' };
}

/**
 * Enforce a maximum percentage delta between previous and proposed values.
 * Returns the capped value and whether capping occurred.
 */
export function enforceDeltaCap(
  previous: number,
  proposed: number,
  maxDeltaPct: number
): DeltaCapResult {
  if (!Number.isFinite(previous) || !Number.isFinite(proposed) || !Number.isFinite(maxDeltaPct)) {
    return { allowed: false, cappedValue: previous, reason: 'Non-finite input', deltaUsed: 0 };
  }
  if (previous === 0) {
    // Avoid division by zero — use absolute cap of maxDeltaPct * 100
    const absCap = maxDeltaPct * 100;
    const capped = Math.max(-absCap, Math.min(absCap, proposed));
    return {
      allowed: proposed === capped,
      cappedValue: capped,
      reason: previous === 0 ? 'Zero baseline — used absolute cap' : 'Normal',
      deltaUsed: Math.abs(capped),
    };
  }

  const maxAbsDelta = Math.abs(previous) * maxDeltaPct;
  const rawDelta = proposed - previous;
  const clampedDelta = Math.max(-maxAbsDelta, Math.min(maxAbsDelta, rawDelta));
  const cappedValue = previous + clampedDelta;

  return {
    allowed: Math.abs(rawDelta - clampedDelta) < 0.001,
    cappedValue,
    reason: Math.abs(rawDelta) > maxAbsDelta
      ? `Delta capped: requested ${rawDelta.toFixed(2)}, allowed ±${maxAbsDelta.toFixed(2)}`
      : 'Delta within cap',
    deltaUsed: Math.abs(clampedDelta),
  };
}

// ── Threshold Registry ──────────────────────────────────────────

const MAX_TRACKED_THRESHOLDS = 200;
const configs = new Map<string, ThresholdConfig>();
const states = new Map<string, ThresholdState>();

/**
 * Register a threshold with its bounds and constraints.
 */
export function registerThreshold(config: ThresholdConfig, initialValue: number): void {
  if (configs.size >= MAX_TRACKED_THRESHOLDS && !configs.has(config.key)) {
    guardrailLog('threshold_registration_blocked', {
      reason: `Max tracked thresholds (${MAX_TRACKED_THRESHOLDS}) reached`,
      metadata: { key: config.key },
    });
    return;
  }

  // Validate config
  if (config.bounds.min > config.bounds.max) {
    guardrailLog('threshold_registration_blocked', {
      reason: `Invalid bounds: min (${config.bounds.min}) > max (${config.bounds.max})`,
      metadata: { key: config.key },
    });
    return;
  }

  configs.set(config.key, { ...config });

  const clamped = clamp(initialValue, config.bounds.min, config.bounds.max);
  const now = Date.now();

  states.set(config.key, {
    currentValue: clamped.value,
    lastAdjustedAt: 0,
    dailyDeltaUsed: 0,
    dailyResetAt: now + 86_400_000,
    pendingDirection: null,
    consecutiveConfirmations: 0,
  });

  guardrailLog('threshold_registered', {
    reason: `Threshold "${config.key}" registered`,
    final_value: clamped.value,
    metadata: {
      bounds: config.bounds,
      maxDailyDeltaPct: config.maxDailyDeltaPct,
      cooldownMs: config.cooldownMs,
      requiredConfirmations: config.requiredConfirmations,
      initialClamped: clamped.clamped,
    },
  });
}

/**
 * Request a threshold adjustment. Returns the final value after all guardrails.
 * This does NOT bypass the proposal gate — callers should only invoke this
 * after a proposal has been approved.
 */
export function requestThresholdAdjustment(
  key: string,
  proposedValue: number
): { accepted: boolean; finalValue: number; reason: string } {
  const config = configs.get(key);
  const state = states.get(key);

  if (!config || !state) {
    return { accepted: false, finalValue: 0, reason: `Threshold "${key}" not registered` };
  }

  const now = Date.now();
  const previousValue = state.currentValue;

  // ── Guard 0: Spike freeze ────────────────────────────────────
  if (isSpikeActive()) {
    guardrailLog('threshold_clamped', {
      previous_value: previousValue,
      proposed_value: proposedValue,
      final_value: previousValue,
      reason: 'Traffic spike active — all threshold adjustments frozen',
      metadata: { key },
    });
    return {
      accepted: false,
      finalValue: previousValue,
      reason: 'Traffic spike active — adjustments frozen',
    };
  }

  // ── Guard 1: Cooldown ─────────────────────────────────────────
  if (state.lastAdjustedAt > 0 && now - state.lastAdjustedAt < config.cooldownMs) {
    const remainingMs = config.cooldownMs - (now - state.lastAdjustedAt);
    guardrailLog('threshold_clamped', {
      previous_value: previousValue,
      proposed_value: proposedValue,
      final_value: previousValue,
      reason: `Cooldown active: ${Math.ceil(remainingMs / 1000)}s remaining`,
      metadata: { key },
    });
    return {
      accepted: false,
      finalValue: previousValue,
      reason: `Cooldown: ${Math.ceil(remainingMs / 1000)}s remaining`,
    };
  }

  // ── Guard 2: Consecutive confirmations ────────────────────────
  const direction: 'up' | 'down' = proposedValue >= previousValue ? 'up' : 'down';
  if (state.pendingDirection === direction) {
    state.consecutiveConfirmations++;
  } else {
    state.pendingDirection = direction;
    state.consecutiveConfirmations = 1;
  }

  if (state.consecutiveConfirmations < config.requiredConfirmations) {
    guardrailLog('threshold_clamped', {
      previous_value: previousValue,
      proposed_value: proposedValue,
      final_value: previousValue,
      reason: `Awaiting confirmations: ${state.consecutiveConfirmations}/${config.requiredConfirmations}`,
      metadata: { key, direction },
    });
    return {
      accepted: false,
      finalValue: previousValue,
      reason: `Confirmations: ${state.consecutiveConfirmations}/${config.requiredConfirmations}`,
    };
  }

  // ── Guard 3: Daily delta budget ───────────────────────────────
  // Reset daily budget if window expired
  if (now >= state.dailyResetAt) {
    state.dailyDeltaUsed = 0;
    state.dailyResetAt = now + 86_400_000;
  }

  const maxDailyAbsDelta = Math.abs(previousValue) * config.maxDailyDeltaPct;
  const remainingBudget = Math.max(0, maxDailyAbsDelta - state.dailyDeltaUsed);

  if (remainingBudget <= 0) {
    guardrailLog('threshold_clamped', {
      previous_value: previousValue,
      proposed_value: proposedValue,
      final_value: previousValue,
      reason: 'Daily delta budget exhausted',
      metadata: { key, dailyDeltaUsed: state.dailyDeltaUsed, maxDailyAbsDelta },
    });
    return {
      accepted: false,
      finalValue: previousValue,
      reason: 'Daily delta budget exhausted',
    };
  }

  // ── Guard 4: Per-adjustment delta cap ─────────────────────────
  const deltaCap = enforceDeltaCap(previousValue, proposedValue, config.maxDailyDeltaPct);
  const afterDelta = deltaCap.cappedValue;

  // ── Guard 5: Absolute bounds ──────────────────────────────────
  const clamped = clamp(afterDelta, config.bounds.min, config.bounds.max);
  const finalValue = clamped.value;
  const actualDelta = Math.abs(finalValue - previousValue);

  // Update state
  state.currentValue = finalValue;
  state.lastAdjustedAt = now;
  state.dailyDeltaUsed += actualDelta;
  state.pendingDirection = null;
  state.consecutiveConfirmations = 0;

  guardrailLog('threshold_clamped', {
    previous_value: previousValue,
    proposed_value: proposedValue,
    final_value: finalValue,
    reason: clamped.clamped || !deltaCap.allowed
      ? `Guardrails applied: ${[!deltaCap.allowed ? deltaCap.reason : '', clamped.clamped ? clamped.reason : ''].filter(Boolean).join('; ')}`
      : 'Adjustment accepted within bounds',
    metadata: {
      key,
      direction,
      actualDelta,
      dailyBudgetRemaining: Math.max(0, remainingBudget - actualDelta),
    },
  });

  return {
    accepted: true,
    finalValue,
    reason: 'Adjustment applied',
  };
}

/**
 * Get current threshold state (read-only snapshot).
 */
export function getThresholdState(key: string): (ThresholdState & { config: ThresholdConfig }) | null {
  const config = configs.get(key);
  const state = states.get(key);
  if (!config || !state) return null;
  return { ...state, config: { ...config } };
}

/**
 * List all registered thresholds.
 */
export function listThresholds(): Array<{ key: string; value: number; bounds: ThresholdBounds }> {
  const result: Array<{ key: string; value: number; bounds: ThresholdBounds }> = [];
  for (const [key, config] of configs) {
    const state = states.get(key);
    result.push({ key, value: state?.currentValue ?? 0, bounds: config.bounds });
  }
  return result;
}

/**
 * Clear all thresholds (testing only).
 */
export function clearThresholds(): void {
  configs.clear();
  states.clear();
}
