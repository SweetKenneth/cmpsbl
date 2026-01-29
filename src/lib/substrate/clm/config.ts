/**
 * Constant Learning Mode (CLM) Configuration
 * v6.7.0 — Always-on, rate-limited, spaced, reflective learning
 * 
 * Controls the Brain's autonomous learning behavior with:
 * - 70% daily Nexus budget allocation
 * - Spaced repetition scheduling
 * - Kill switch and safety backoff
 * - Quiet hours and jitter
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CLMConfig {
  /** Master enable flag */
  enabled: boolean;
  /** Percentage of daily Nexus limits to use (0.0 - 1.0) */
  dailyBudgetPct: number;
  /** Minimum minutes between learning jobs */
  minSpacingMinutes: number;
  /** Maximum concurrent learning jobs */
  maxConcurrent: number;
  /** Backoff multiplier on errors */
  errorBackoffMultiplier: number;
  /** Maximum backoff in minutes */
  maxBackoffMinutes: number;
  /** Quiet hours range (e.g., "02:00-05:00") */
  quietHours: string | null;
  /** Jitter range in minutes (adds randomness to scheduling) */
  jitterMinutes: number;
  /** Kill switch - immediately stops all CLM activity */
  killSwitch: boolean;
  /** Auto-disable after N consecutive failures */
  maxConsecutiveFailures: number;
  /** Spaced repetition cap (percentage of CLM budget) */
  spacedRepetitionBudgetPct: number;
  /** Micro-learning mode threshold (remaining budget %) */
  microLearningThreshold: number;
  /** Job fingerprint TTL (hours) to prevent duplicates */
  jobFingerprintTTLHours: number;
  /** Cache TTL for repeated topic pulls (hours) */
  topicCacheTTLHours: number;
}

export interface BudgetState {
  /** Current date key (YYYY-MM-DD) */
  dateKey: string;
  /** Total daily budget units */
  totalBudgetUnits: number;
  /** Used budget units today */
  usedUnits: number;
  /** Remaining budget units */
  remainingUnits: number;
  /** Remaining as percentage */
  remainingPct: number;
  /** Next allowed execution time */
  nextAllowedAt: Date | null;
  /** Current backoff level (0 = none) */
  backoffLevel: number;
  /** Consecutive failure count */
  consecutiveFailures: number;
  /** Is CLM currently paused due to errors */
  pausedDueToErrors: boolean;
  /** Is in quiet hours */
  inQuietHours: boolean;
  /** Is in micro-learning mode */
  microLearningMode: boolean;
}

export interface LearningJobResult {
  jobId: string;
  topic: string;
  success: boolean;
  unitsUsed: number;
  durationMs: number;
  reflectionGenerated: boolean;
  graphNodesCreated: number;
  graphEdgesCreated: number;
  error?: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_CLM_CONFIG: CLMConfig = {
  enabled: false, // Must be explicitly enabled
  dailyBudgetPct: 0.70,
  minSpacingMinutes: 15,
  maxConcurrent: 1,
  errorBackoffMultiplier: 2.0,
  maxBackoffMinutes: 120,
  quietHours: '02:00-05:00',
  jitterMinutes: 5,
  killSwitch: false,
  maxConsecutiveFailures: 5,
  spacedRepetitionBudgetPct: 0.30,
  microLearningThreshold: 0.05,
  jobFingerprintTTLHours: 6,
  topicCacheTTLHours: 24,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VARIABLE LOADER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Load CLM config from environment variables with fallbacks
 */
export function loadCLMConfigFromEnv(): CLMConfig {
  const config = { ...DEFAULT_CLM_CONFIG };

  // Check environment (these would be set in edge functions)
  if (typeof window !== 'undefined') {
    // Client-side: use defaults, config comes from backend
    return config;
  }

  // Server-side environment loading (Deno/Edge)
  try {
    const env = (globalThis as any).Deno?.env;
    if (env) {
      const enabled = env.get('SUBSTRATE_CLM_ENABLED');
      if (enabled !== undefined) {
        config.enabled = enabled === 'true';
      }

      const budgetPct = env.get('SUBSTRATE_CLM_DAILY_BUDGET_PCT');
      if (budgetPct) {
        config.dailyBudgetPct = Math.min(1.0, Math.max(0.1, parseFloat(budgetPct)));
      }

      const quietHours = env.get('SUBSTRATE_CLM_QUIET_HOURS');
      if (quietHours) {
        config.quietHours = quietHours;
      }

      const maxConcurrent = env.get('SUBSTRATE_CLM_MAX_CONCURRENT');
      if (maxConcurrent) {
        config.maxConcurrent = Math.max(1, parseInt(maxConcurrent, 10));
      }

      const killSwitch = env.get('SUBSTRATE_CLM_KILL_SWITCH');
      if (killSwitch !== undefined) {
        config.killSwitch = killSwitch === 'true';
      }
    }
  } catch {
    // Fallback to defaults
  }

  return config;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUIET HOURS PARSER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse quiet hours string (e.g., "02:00-05:00") and check if current time is within
 */
export function isInQuietHours(quietHours: string | null): boolean {
  if (!quietHours) return false;

  const match = quietHours.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return false;

  const [, startHour, startMin, endHour, endMin] = match.map(Number);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (startMinutes < endMinutes) {
    // Normal range (e.g., 02:00-05:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight range (e.g., 23:00-06:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

/**
 * Calculate jittered delay
 */
export function calculateJitteredDelay(baseMinutes: number, jitterMinutes: number): number {
  const jitter = (Math.random() - 0.5) * 2 * jitterMinutes;
  return Math.max(1, baseMinutes + jitter);
}

/**
 * Calculate backoff delay
 */
export function calculateBackoffDelay(
  baseMinutes: number,
  backoffLevel: number,
  multiplier: number,
  maxMinutes: number
): number {
  const delay = baseMinutes * Math.pow(multiplier, backoffLevel);
  return Math.min(delay, maxMinutes);
}
