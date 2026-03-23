/**
 * Constant Learning Mode (CLM) Configuration
 * Dynamic allocation via NEXUS 4-hour cycles
 * 
 * CLM no longer uses a hardcoded budget percentage. Instead:
 *   - NEXUS computes available calls every 4 hours
 *   - Subtracts estimated substrate operational needs
 *   - Divides surplus equally among learning entities
 *   - Entities rapid-fire until allocation exhausted or next cycle
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CLMConfig {
  /** Master enable flag */
  enabled: boolean;
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

/** 
 * Production-safe defaults. Discovery mode is set dynamically via system_flags.
 * The nexus-budget-optimizer adjusts spacing/concurrency based on discovery phase.
 */
export const DEFAULT_CLM_CONFIG: CLMConfig = {
  enabled: true,
  minSpacingMinutes: 5,        // Tighter spacing — NEXUS budget allows high throughput
  maxConcurrent: 5,            // Higher concurrency for 40-primitive coverage
  errorBackoffMultiplier: 1.5,
  maxBackoffMinutes: 45,
  quietHours: '03:00-04:30',   // Narrower quiet window — maximize learning time
  jitterMinutes: 1.5,
  killSwitch: false,
  maxConsecutiveFailures: 8,   // More tolerant — free-tier providers are flaky
  spacedRepetitionBudgetPct: 0.15,
  microLearningThreshold: 0.08,
  jobFingerprintTTLHours: 6,
  topicCacheTTLHours: 8,
};

/** Discovery-phase overrides — applied when nexus_clm_budget.phase === 'discovery' */
export const DISCOVERY_CLM_OVERRIDES: Partial<CLMConfig> = {
  minSpacingMinutes: 1,
  maxConcurrent: 6,
  errorBackoffMultiplier: 1.3,
  maxBackoffMinutes: 30,
  quietHours: null,
  jitterMinutes: 0.5,
  maxConsecutiveFailures: 12,
  spacedRepetitionBudgetPct: 0.10,
  jobFingerprintTTLHours: 2,
  topicCacheTTLHours: 6,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VARIABLE LOADER
// ═══════════════════════════════════════════════════════════════════════════════

export function loadCLMConfigFromEnv(): CLMConfig {
  const config = { ...DEFAULT_CLM_CONFIG };

  if (typeof window !== 'undefined') {
    return config;
  }

  try {
    const env = (globalThis as any).Deno?.env;
    if (env) {
      const enabled = env.get('SUBSTRATE_CLM_ENABLED');
      if (enabled !== undefined) config.enabled = enabled === 'true';

      const quietHours = env.get('SUBSTRATE_CLM_QUIET_HOURS');
      if (quietHours) config.quietHours = quietHours;

      const maxConcurrent = env.get('SUBSTRATE_CLM_MAX_CONCURRENT');
      if (maxConcurrent) config.maxConcurrent = Math.max(1, parseInt(maxConcurrent, 10));

      const killSwitch = env.get('SUBSTRATE_CLM_KILL_SWITCH');
      if (killSwitch !== undefined) config.killSwitch = killSwitch === 'true';
    }
  } catch { /* Fallback to defaults */ }

  return config;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Parsed quiet hours cache — avoids regex on every canExecute() call */
let _parsedQuietHours: { input: string; start: number; end: number } | null = null;

export function isInQuietHours(quietHours: string | null): boolean {
  if (!quietHours) return false;

  // Parse and cache
  if (!_parsedQuietHours || _parsedQuietHours.input !== quietHours) {
    const match = quietHours.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
    if (!match) return false;
    const [, sh, sm, eh, em] = match.map(Number);
    _parsedQuietHours = { input: quietHours, start: sh * 60 + sm, end: eh * 60 + em };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const { start, end } = _parsedQuietHours;

  return start < end
    ? currentMinutes >= start && currentMinutes < end
    : currentMinutes >= start || currentMinutes < end;
}

export function calculateJitteredDelay(baseMinutes: number, jitterMinutes: number): number {
  const jitter = (Math.random() - 0.5) * 2 * jitterMinutes;
  return Math.max(1, baseMinutes + jitter);
}

export function calculateBackoffDelay(
  baseMinutes: number,
  backoffLevel: number,
  multiplier: number,
  maxMinutes: number
): number {
  const delay = baseMinutes * Math.pow(multiplier, backoffLevel);
  return Math.min(delay, maxMinutes);
}
