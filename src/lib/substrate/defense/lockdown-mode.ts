/**
 * DEFENSE — Kill Switch / Lockdown Mode v1.0.0
 * Single command to elevate all thresholds and block non-allowlisted traffic.
 *
 * Lockdown levels:
 *  - YELLOW: Enhanced monitoring, tightened rate limits
 *  - ORANGE: Strict rate limits, challenge all unknowns
 *  - RED: Block all non-allowlisted traffic, full forensic capture
 *  - BLACK: Total system lockdown — all external access denied
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type LockdownLevel = 'NONE' | 'YELLOW' | 'ORANGE' | 'RED' | 'BLACK';

export interface LockdownConfig {
  readonly level: LockdownLevel;
  readonly activatedAt: number | null;
  readonly activatedBy: string | null;
  readonly reason: string | null;
  readonly autoExpireAt: number | null;
  readonly allowlist: ReadonlySet<string>;   // Allowlisted actor IDs
  readonly rateMultiplier: number;           // Applied to all rate limits
  readonly blockNewSessions: boolean;
  readonly challengeAll: boolean;
  readonly forensicCapture: boolean;
  readonly requireMFA: boolean;
}

export interface LockdownEvent {
  readonly timestamp: number;
  readonly level: LockdownLevel;
  readonly previousLevel: LockdownLevel;
  readonly activatedBy: string;
  readonly reason: string;
  readonly autoExpireAt: number | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

const LEVEL_CONFIGS: Record<LockdownLevel, Omit<LockdownConfig, 'level' | 'activatedAt' | 'activatedBy' | 'reason' | 'autoExpireAt' | 'allowlist'>> = {
  NONE: {
    rateMultiplier: 1.0,
    blockNewSessions: false,
    challengeAll: false,
    forensicCapture: false,
    requireMFA: false,
  },
  YELLOW: {
    rateMultiplier: 0.5,       // Halve rate limits
    blockNewSessions: false,
    challengeAll: false,
    forensicCapture: false,
    requireMFA: false,
  },
  ORANGE: {
    rateMultiplier: 0.2,       // 20% of normal rate limits
    blockNewSessions: false,
    challengeAll: true,
    forensicCapture: false,
    requireMFA: true,
  },
  RED: {
    rateMultiplier: 0.05,      // 5% of normal rate limits
    blockNewSessions: true,
    challengeAll: true,
    forensicCapture: true,
    requireMFA: true,
  },
  BLACK: {
    rateMultiplier: 0,         // No traffic allowed
    blockNewSessions: true,
    challengeAll: true,
    forensicCapture: true,
    requireMFA: true,
  },
};

const AUTO_EXPIRE_DEFAULTS: Record<LockdownLevel, number> = {
  NONE: 0,
  YELLOW: 24 * 60 * 60_000,    // 24 hours
  ORANGE: 4 * 60 * 60_000,     // 4 hours
  RED: 1 * 60 * 60_000,        // 1 hour
  BLACK: 30 * 60_000,          // 30 minutes
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_LOG = 100;
const lockdownLog: LockdownEvent[] = [];
const lockdownListeners = new Set<(config: LockdownConfig) => void>();
const allowlist = new Set<string>();

let currentConfig: LockdownConfig = {
  level: 'NONE',
  activatedAt: null,
  activatedBy: null,
  reason: null,
  autoExpireAt: null,
  allowlist,
  ...LEVEL_CONFIGS.NONE,
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Activate lockdown mode.
 */
export function activateLockdown(
  level: LockdownLevel,
  activatedBy: string,
  reason: string,
  autoExpireMs?: number,
): LockdownConfig {
  const now = Date.now();
  const previousLevel = currentConfig.level;
  const expire = autoExpireMs ?? AUTO_EXPIRE_DEFAULTS[level];

  currentConfig = {
    level,
    activatedAt: level === 'NONE' ? null : now,
    activatedBy: level === 'NONE' ? null : activatedBy,
    reason: level === 'NONE' ? null : reason,
    autoExpireAt: level === 'NONE' ? null : (expire > 0 ? now + expire : null),
    allowlist,
    ...LEVEL_CONFIGS[level],
  };

  lockdownLog.push(Object.freeze({
    timestamp: now,
    level,
    previousLevel,
    activatedBy,
    reason,
    autoExpireAt: currentConfig.autoExpireAt,
  }));

  if (lockdownLog.length > MAX_LOG) lockdownLog.splice(0, 1);

  // Notify
  for (const listener of lockdownListeners) {
    try { listener(currentConfig); } catch { /* swallow */ }
  }

  return currentConfig;
}

/**
 * Deactivate lockdown (return to NONE).
 */
export function deactivateLockdown(deactivatedBy: string, reason = 'Manual deactivation'): LockdownConfig {
  return activateLockdown('NONE', deactivatedBy, reason, 0);
}

/**
 * Escalate lockdown by one level.
 */
export function escalateLockdown(escalatedBy: string, reason: string): LockdownConfig {
  const levels: LockdownLevel[] = ['NONE', 'YELLOW', 'ORANGE', 'RED', 'BLACK'];
  const currentIdx = levels.indexOf(currentConfig.level);
  const nextLevel = levels[Math.min(currentIdx + 1, levels.length - 1)];
  return activateLockdown(nextLevel, escalatedBy, reason);
}

/**
 * De-escalate lockdown by one level.
 */
export function deescalateLockdown(deescalatedBy: string, reason: string): LockdownConfig {
  const levels: LockdownLevel[] = ['NONE', 'YELLOW', 'ORANGE', 'RED', 'BLACK'];
  const currentIdx = levels.indexOf(currentConfig.level);
  const prevLevel = levels[Math.max(currentIdx - 1, 0)];
  return activateLockdown(prevLevel, deescalatedBy, reason);
}

/**
 * Check auto-expire and deactivate if needed.
 */
export function checkAutoExpire(): boolean {
  if (currentConfig.autoExpireAt && Date.now() >= currentConfig.autoExpireAt) {
    deactivateLockdown('SYSTEM', 'Auto-expire triggered');
    return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALLOWLIST
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Add an actor to the lockdown allowlist.
 */
export function addToAllowlist(actorId: string): void {
  allowlist.add(actorId);
}

/**
 * Remove an actor from the allowlist.
 */
export function removeFromAllowlist(actorId: string): void {
  allowlist.delete(actorId);
}

/**
 * Check if an actor is allowed during lockdown.
 */
export function isAllowlisted(actorId: string): boolean {
  return allowlist.has(actorId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// POLICY CHECK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a request should be allowed under current lockdown.
 */
export function checkLockdownPolicy(actorId: string): {
  allowed: boolean;
  level: LockdownLevel;
  rateMultiplier: number;
  requiresChallenge: boolean;
  requiresMFA: boolean;
  reason: string;
} {
  // Auto-expire check
  checkAutoExpire();

  if (currentConfig.level === 'NONE') {
    return { allowed: true, level: 'NONE', rateMultiplier: 1.0, requiresChallenge: false, requiresMFA: false, reason: 'No lockdown active' };
  }

  // Allowlisted actors bypass
  if (isAllowlisted(actorId)) {
    return { allowed: true, level: currentConfig.level, rateMultiplier: 0.5, requiresChallenge: false, requiresMFA: false, reason: 'Allowlisted' };
  }

  // BLACK = total block
  if (currentConfig.level === 'BLACK') {
    return { allowed: false, level: 'BLACK', rateMultiplier: 0, requiresChallenge: true, requiresMFA: true, reason: 'Total lockdown — all non-allowlisted traffic denied' };
  }

  // RED = block new sessions
  if (currentConfig.level === 'RED' && currentConfig.blockNewSessions) {
    return { allowed: false, level: 'RED', rateMultiplier: currentConfig.rateMultiplier, requiresChallenge: true, requiresMFA: true, reason: 'Red lockdown — new sessions blocked' };
  }

  return {
    allowed: true,
    level: currentConfig.level,
    rateMultiplier: currentConfig.rateMultiplier,
    requiresChallenge: currentConfig.challengeAll,
    requiresMFA: currentConfig.requireMFA,
    reason: `${currentConfig.level} lockdown active`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LISTENERS & STATS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to lockdown changes.
 */
export function onLockdownChange(listener: (config: LockdownConfig) => void): () => void {
  lockdownListeners.add(listener);
  return () => { lockdownListeners.delete(listener); };
}

/**
 * Get current lockdown status.
 */
export function getLockdownStatus(): LockdownConfig {
  checkAutoExpire();
  return currentConfig;
}

/**
 * Get lockdown history.
 */
export function getLockdownHistory(limit = 20): readonly LockdownEvent[] {
  const start = Math.max(0, lockdownLog.length - limit);
  return Object.freeze(lockdownLog.slice(start).reverse());
}

/**
 * Get lockdown stats.
 */
export function getLockdownStats() {
  return {
    version: '1.0.0',
    currentLevel: currentConfig.level,
    isActive: currentConfig.level !== 'NONE',
    activatedAt: currentConfig.activatedAt,
    autoExpireAt: currentConfig.autoExpireAt,
    allowlistSize: allowlist.size,
    historyCount: lockdownLog.length,
    rateMultiplier: currentConfig.rateMultiplier,
  };
}
