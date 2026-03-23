/**
 * NERVE Ultimate — Dynamic Priority Rebalancer
 * Auto-elevates/demotes signal priorities under sustained load conditions.
 * Prevents priority inversion and starvation during high-pressure periods.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type PriorityLevel = 'low' | 'normal' | 'high' | 'critical';

export interface RebalanceDecision {
  signalId: string;
  originalPriority: PriorityLevel;
  adjustedPriority: PriorityLevel;
  reason: string;
  timestamp: number;
}

export interface LoadSnapshot {
  timestamp: number;
  queueDepth: number;
  backpressureLevel: string;
  circuitsOpen: number;
  nodesDead: number;
  signalThroughput: number;
}

export interface RebalancerState {
  mode: 'normal' | 'elevated' | 'emergency';
  emaLoad: number;
  lowStarvationCount: number;
  elevationCount: number;
  demotionCount: number;
  lastModeChange: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const PRIORITY_ORDER: PriorityLevel[] = ['low', 'normal', 'high', 'critical'];
const EMA_ALPHA = 0.2;
const ELEVATED_THRESHOLD = 0.6;
const EMERGENCY_THRESHOLD = 0.85;
const STARVATION_WINDOW = 50;
const STARVATION_THRESHOLD = 0.8;   // If 80%+ of last N signals were high/critical, elevate lows
const MAX_DECISIONS = 500;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const decisions: RebalanceDecision[] = [];
const recentPriorities: PriorityLevel[] = [];
let state: RebalancerState = {
  mode: 'normal',
  emaLoad: 0,
  lowStarvationCount: 0,
  elevationCount: 0,
  demotionCount: 0,
  lastModeChange: Date.now(),
};

// ═══════════════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════════════

/** Update load snapshot and recalculate rebalancer mode */
export function updateLoad(snapshot: LoadSnapshot): RebalancerState {
  // Normalize load to 0–1 scale
  const depthNorm = Math.min(snapshot.queueDepth / 100, 1);
  const circuitNorm = Math.min(snapshot.circuitsOpen / 5, 1);
  const deadNorm = Math.min(snapshot.nodesDead / 3, 1);

  const loadScore = depthNorm * 0.5 + circuitNorm * 0.3 + deadNorm * 0.2;
  state.emaLoad = EMA_ALPHA * loadScore + (1 - EMA_ALPHA) * state.emaLoad;

  // Mode transitions
  const prevMode = state.mode;
  if (state.emaLoad >= EMERGENCY_THRESHOLD) {
    state.mode = 'emergency';
  } else if (state.emaLoad >= ELEVATED_THRESHOLD) {
    state.mode = 'elevated';
  } else {
    state.mode = 'normal';
  }

  if (state.mode !== prevMode) {
    state.lastModeChange = Date.now();
  }

  return { ...state };
}

/** Evaluate and potentially adjust a signal's priority */
export function evaluatePriority(
  signalId: string,
  originalPriority: PriorityLevel,
): RebalanceDecision {
  const now = Date.now();

  // Track recent priorities for starvation detection
  recentPriorities.push(originalPriority);
  if (recentPriorities.length > STARVATION_WINDOW) {
    recentPriorities.splice(0, recentPriorities.length - STARVATION_WINDOW);
  }

  let adjustedPriority = originalPriority;
  let reason = 'no adjustment';

  if (state.mode === 'emergency') {
    // Emergency: demote non-critical to free bandwidth
    if (originalPriority === 'low') {
      // Drop low priority entirely (caller should handle)
      adjustedPriority = 'low';
      reason = 'emergency mode — low priority may be dropped';
    } else if (originalPriority === 'normal') {
      adjustedPriority = 'low';
      reason = 'emergency mode — demoted normal→low';
      state.demotionCount++;
    }
  } else if (state.mode === 'elevated') {
    // Elevated: check for starvation of low-priority signals
    const highCount = recentPriorities.filter(p => p === 'high' || p === 'critical').length;
    const starvationRatio = highCount / recentPriorities.length;

    if (starvationRatio > STARVATION_THRESHOLD && originalPriority === 'low') {
      // Elevate starved low-priority signals
      adjustedPriority = 'normal';
      reason = `starvation protection — elevated low→normal (${(starvationRatio * 100).toFixed(0)}% high/critical)`;
      state.elevationCount++;
      state.lowStarvationCount++;
    }
  }

  const decision: RebalanceDecision = {
    signalId,
    originalPriority,
    adjustedPriority,
    reason,
    timestamp: now,
  };

  if (originalPriority !== adjustedPriority) {
    decisions.push(decision);
    if (decisions.length > MAX_DECISIONS) decisions.splice(0, decisions.length - MAX_DECISIONS);
  }

  return decision;
}

/** Get the current rebalancer state */
export function getRebalancerState(): RebalancerState {
  return { ...state };
}

/** Get recent rebalance decisions */
export function getDecisions(limit: number = 20): RebalanceDecision[] {
  return decisions.slice(-limit);
}

/** Get starvation analysis */
export function getStarvationAnalysis(): {
  windowSize: number;
  lowCount: number;
  normalCount: number;
  highCount: number;
  criticalCount: number;
  starvationRisk: boolean;
} {
  const low = recentPriorities.filter(p => p === 'low').length;
  const normal = recentPriorities.filter(p => p === 'normal').length;
  const high = recentPriorities.filter(p => p === 'high').length;
  const critical = recentPriorities.filter(p => p === 'critical').length;
  const highRatio = (high + critical) / Math.max(recentPriorities.length, 1);

  return {
    windowSize: recentPriorities.length,
    lowCount: low,
    normalCount: normal,
    highCount: high,
    criticalCount: critical,
    starvationRisk: highRatio > STARVATION_THRESHOLD,
  };
}

/** Reset rebalancer state */
export function resetRebalancer(): void {
  state = {
    mode: 'normal',
    emaLoad: 0,
    lowStarvationCount: 0,
    elevationCount: 0,
    demotionCount: 0,
    lastModeChange: Date.now(),
  };
  decisions.length = 0;
  recentPriorities.length = 0;
}
