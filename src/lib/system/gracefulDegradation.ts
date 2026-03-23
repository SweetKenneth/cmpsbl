/**
 * Graceful Degradation Controller — SYSTEM v9.0.0
 * Tiered degradation levels with automatic escalation/de-escalation
 * based on composite health scores.
 */

// --- Types ---

export type DegradationLevel = 'L0_NORMAL' | 'L1_REDUCED' | 'L2_READONLY' | 'L3_SAFE_MODE' | 'L4_EMERGENCY_HALT';

export interface DegradationState {
  level: DegradationLevel;
  since: number;
  reason: string;
  healthScore: number;
  autoEscalated: boolean;
  history: DegradationEvent[];
}

export interface DegradationEvent {
  fromLevel: DegradationLevel;
  toLevel: DegradationLevel;
  timestamp: number;
  reason: string;
  healthScore: number;
  automatic: boolean;
}

export interface DegradationPolicy {
  l1Threshold: number; // Below this → L1
  l2Threshold: number;
  l3Threshold: number;
  l4Threshold: number;
  escalationCooldownMs: number;
  deescalationRequiredMs: number; // How long health must be above threshold to de-escalate
}

// --- Constants ---

const DEFAULT_POLICY: DegradationPolicy = {
  l1Threshold: 70,
  l2Threshold: 50,
  l3Threshold: 30,
  l4Threshold: 10,
  escalationCooldownMs: 30_000,
  deescalationRequiredMs: 60_000,
};

const LEVEL_ORDER: DegradationLevel[] = [
  'L0_NORMAL', 'L1_REDUCED', 'L2_READONLY', 'L3_SAFE_MODE', 'L4_EMERGENCY_HALT',
];

const MAX_HISTORY = 200;

// --- State ---

let state: DegradationState = {
  level: 'L0_NORMAL',
  since: Date.now(),
  reason: 'initial',
  healthScore: 100,
  autoEscalated: false,
  history: [],
};

let policy = { ...DEFAULT_POLICY };
let healthAboveThresholdSince: number | null = null;

// --- Core ---

export function getDegradationState(): Readonly<DegradationState> {
  return { ...state, history: [...state.history] };
}

export function getDegradationLevel(): DegradationLevel {
  return state.level;
}

export function setPolicy(newPolicy: Partial<DegradationPolicy>): void {
  policy = { ...policy, ...newPolicy };
}

function levelIndex(level: DegradationLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

function transitionTo(level: DegradationLevel, reason: string, automatic: boolean): void {
  if (level === state.level) return;

  const event: DegradationEvent = {
    fromLevel: state.level,
    toLevel: level,
    timestamp: Date.now(),
    reason,
    healthScore: state.healthScore,
    automatic,
  };

  state.history.push(event);
  if (state.history.length > MAX_HISTORY) {
    state.history.splice(0, state.history.length - MAX_HISTORY);
  }

  state.level = level;
  state.since = Date.now();
  state.reason = reason;
  state.autoEscalated = automatic;
}

function determineTargetLevel(healthScore: number): DegradationLevel {
  if (healthScore < policy.l4Threshold) return 'L4_EMERGENCY_HALT';
  if (healthScore < policy.l3Threshold) return 'L3_SAFE_MODE';
  if (healthScore < policy.l2Threshold) return 'L2_READONLY';
  if (healthScore < policy.l1Threshold) return 'L1_REDUCED';
  return 'L0_NORMAL';
}

export function evaluateHealth(healthScore: number): DegradationLevel {
  state.healthScore = Math.max(0, Math.min(100, healthScore));
  const targetLevel = determineTargetLevel(healthScore);
  const currentIdx = levelIndex(state.level);
  const targetIdx = levelIndex(targetLevel);
  const now = Date.now();

  // Escalation (immediate, respecting cooldown)
  if (targetIdx > currentIdx) {
    const timeSinceLast = now - state.since;
    if (timeSinceLast >= policy.escalationCooldownMs || targetIdx - currentIdx >= 2) {
      transitionTo(targetLevel, `Health dropped to ${healthScore}`, true);
      healthAboveThresholdSince = null;
    }
  }

  // De-escalation (requires sustained health)
  if (targetIdx < currentIdx) {
    if (!healthAboveThresholdSince) {
      healthAboveThresholdSince = now;
    } else if (now - healthAboveThresholdSince >= policy.deescalationRequiredMs) {
      // Step down one level at a time
      const newLevel = LEVEL_ORDER[currentIdx - 1];
      transitionTo(newLevel, `Health recovered to ${healthScore}`, true);
      healthAboveThresholdSince = null;
    }
  } else {
    healthAboveThresholdSince = null;
  }

  return state.level;
}

export function forceLevel(level: DegradationLevel, reason: string): void {
  transitionTo(level, reason, false);
}

export function isOperationAllowed(requiredLevel: DegradationLevel = 'L2_READONLY'): boolean {
  return levelIndex(state.level) < levelIndex(requiredLevel);
}

export function isWriteAllowed(): boolean {
  return levelIndex(state.level) < levelIndex('L2_READONLY');
}

export function isFeatureAllowed(): boolean {
  return levelIndex(state.level) < levelIndex('L1_REDUCED');
}

export function getHistory(): DegradationEvent[] {
  return [...state.history];
}

export function clearDegradationState(): void {
  state = {
    level: 'L0_NORMAL',
    since: Date.now(),
    reason: 'reset',
    healthScore: 100,
    autoEscalated: false,
    history: [],
  };
  healthAboveThresholdSince = null;
  policy = { ...DEFAULT_POLICY };
}
