/**
 * Mutation Velocity Governor — EVOLUTION v9.0.0
 * Rate-limits mutation throughput based on governance mode.
 */

// --- Types ---

export type GovernanceMode = 'ACTIVE' | 'OBSERVE' | 'LOCKDOWN' | 'EVOLVE';

export interface VelocityState {
  mode: GovernanceMode;
  mutationsThisHour: number;
  hourStart: number;
  burstAllowance: number;
  cooldownUntil: number;
  totalMutations: number;
  blockedCount: number;
}

export interface VelocityDecision {
  allowed: boolean;
  reason: string;
  currentRate: number;
  maxRate: number;
  cooldownRemainingMs: number;
}

// --- Constants ---

const MODE_LIMITS: Record<GovernanceMode, number> = {
  LOCKDOWN: 0,
  OBSERVE: 0,
  ACTIVE: 5,
  EVOLVE: 10,
};

const BURST_ALLOWANCE = 2;
const COOLDOWN_MS = 5 * 60_000; // 5 min cooldown after burst
const HOUR_MS = 3600_000;

// --- State ---

const state: VelocityState = {
  mode: 'ACTIVE',
  mutationsThisHour: 0,
  hourStart: Date.now(),
  burstAllowance: BURST_ALLOWANCE,
  cooldownUntil: 0,
  totalMutations: 0,
  blockedCount: 0,
};

// --- Core ---

function resetHourIfNeeded(): void {
  const now = Date.now();
  if (now - state.hourStart >= HOUR_MS) {
    state.mutationsThisHour = 0;
    state.hourStart = now;
    state.burstAllowance = BURST_ALLOWANCE;
  }
}

export function setGovernanceMode(mode: GovernanceMode): void {
  state.mode = mode;
}

export function requestMutation(): VelocityDecision {
  resetHourIfNeeded();
  const now = Date.now();
  const maxRate = MODE_LIMITS[state.mode];

  // Cooldown check
  if (now < state.cooldownUntil) {
    state.blockedCount++;
    return {
      allowed: false,
      reason: `Cooldown active — ${Math.ceil((state.cooldownUntil - now) / 1000)}s remaining`,
      currentRate: state.mutationsThisHour,
      maxRate,
      cooldownRemainingMs: state.cooldownUntil - now,
    };
  }

  // Mode block
  if (maxRate === 0) {
    state.blockedCount++;
    return {
      allowed: false,
      reason: `Mutations blocked in ${state.mode} mode`,
      currentRate: state.mutationsThisHour,
      maxRate,
      cooldownRemainingMs: 0,
    };
  }

  // Within limit
  if (state.mutationsThisHour < maxRate) {
    state.mutationsThisHour++;
    state.totalMutations++;
    return {
      allowed: true,
      reason: `Mutation ${state.mutationsThisHour}/${maxRate} this hour`,
      currentRate: state.mutationsThisHour,
      maxRate,
      cooldownRemainingMs: 0,
    };
  }

  // Burst allowance
  if (state.burstAllowance > 0) {
    state.burstAllowance--;
    state.mutationsThisHour++;
    state.totalMutations++;

    if (state.burstAllowance === 0) {
      state.cooldownUntil = now + COOLDOWN_MS;
    }

    return {
      allowed: true,
      reason: `Burst mutation (${state.burstAllowance} burst remaining)`,
      currentRate: state.mutationsThisHour,
      maxRate,
      cooldownRemainingMs: 0,
    };
  }

  // Over limit
  state.blockedCount++;
  return {
    allowed: false,
    reason: `Rate limit exceeded: ${state.mutationsThisHour}/${maxRate} this hour`,
    currentRate: state.mutationsThisHour,
    maxRate,
    cooldownRemainingMs: 0,
  };
}

export function getVelocityState(): Readonly<VelocityState> {
  resetHourIfNeeded();
  return { ...state };
}

export function getUtilization(): number {
  resetHourIfNeeded();
  const max = MODE_LIMITS[state.mode];
  if (max === 0) return 0;
  return Math.round((state.mutationsThisHour / max) * 100);
}

export function clearVelocityState(): void {
  state.mode = 'ACTIVE';
  state.mutationsThisHour = 0;
  state.hourStart = Date.now();
  state.burstAllowance = BURST_ALLOWANCE;
  state.cooldownUntil = 0;
  state.totalMutations = 0;
  state.blockedCount = 0;
}
