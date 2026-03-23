/**
 * CORE — Runtime Mode Controller
 * Manages Network → Hybrid → Offline mode transitions
 * based on health scores with graceful degradation rules.
 * Ultimate Form v1.0.0
 */

export type RuntimeMode = 'network' | 'hybrid' | 'offline';

export interface ModeTransition {
  from: RuntimeMode;
  to: RuntimeMode;
  reason: string;
  timestamp: string;
  healthScore: number;
}

export interface RuntimeModeState {
  currentMode: RuntimeMode;
  healthScore: number;
  lastTransition: ModeTransition | null;
  transitionHistory: ModeTransition[];
  degradedModules: string[];
  stableForMs: number;
}

// Thresholds for mode transitions
const NETWORK_MIN_HEALTH = 70;
const HYBRID_MIN_HEALTH = 30;
const STABILITY_WINDOW_MS = 60_000; // 1 minute stable before upgrading

let state: RuntimeModeState = {
  currentMode: 'network',
  healthScore: 100,
  lastTransition: null,
  transitionHistory: [],
  degradedModules: [],
  stableForMs: 0,
};

const MAX_HISTORY = 100;
type ModeChangeCallback = (from: RuntimeMode, to: RuntimeMode, reason: string) => void;
const listeners: ModeChangeCallback[] = [];

/**
 * Evaluate and potentially transition runtime mode based on health.
 */
export function evaluateMode(healthScore: number, degradedModules: string[] = []): RuntimeMode {
  state.healthScore = healthScore;
  state.degradedModules = degradedModules;

  let targetMode: RuntimeMode;
  let reason: string;

  if (healthScore >= NETWORK_MIN_HEALTH && degradedModules.length === 0) {
    targetMode = 'network';
    reason = 'Full health — all primitives operational';
  } else if (healthScore >= HYBRID_MIN_HEALTH) {
    targetMode = 'hybrid';
    reason = `Degraded health (${healthScore}) or ${degradedModules.length} module(s) degraded`;
  } else {
    targetMode = 'offline';
    reason = `Critical health (${healthScore}) — switching to offline mode`;
  }

  // Prevent upgrade flapping: require stability window
  if (modeRank(targetMode) > modeRank(state.currentMode)) {
    if (state.stableForMs < STABILITY_WINDOW_MS) {
      state.stableForMs += 10_000; // Increment on each eval
      return state.currentMode; // Not stable enough to upgrade
    }
  }

  if (targetMode !== state.currentMode) {
    const transition: ModeTransition = {
      from: state.currentMode,
      to: targetMode,
      reason,
      timestamp: new Date().toISOString(),
      healthScore,
    };

    state.transitionHistory.push(transition);
    if (state.transitionHistory.length > MAX_HISTORY) {
      state.transitionHistory.shift();
    }
    state.lastTransition = transition;
    state.stableForMs = 0;

    const oldMode = state.currentMode;
    state.currentMode = targetMode;

    for (const cb of listeners) {
      try { cb(oldMode, targetMode, reason); } catch { /* no-op */ }
    }
  } else {
    state.stableForMs += 10_000;
  }

  return state.currentMode;
}

function modeRank(mode: RuntimeMode): number {
  return mode === 'network' ? 3 : mode === 'hybrid' ? 2 : 1;
}

export function getCurrentMode(): RuntimeMode {
  return state.currentMode;
}

export function getRuntimeState(): RuntimeModeState {
  return { ...state, transitionHistory: [...state.transitionHistory] };
}

export function onModeChange(cb: ModeChangeCallback): () => void {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function forceMode(mode: RuntimeMode, reason: string): void {
  const transition: ModeTransition = {
    from: state.currentMode,
    to: mode,
    reason: `[FORCED] ${reason}`,
    timestamp: new Date().toISOString(),
    healthScore: state.healthScore,
  };
  state.transitionHistory.push(transition);
  state.lastTransition = transition;
  state.currentMode = mode;
}
