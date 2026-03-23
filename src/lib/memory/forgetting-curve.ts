/**
 * CMPSBL® MEMORY — Forgetting Curve Calibration
 * Per-domain calibration of SM-2 spaced repetition based on actual recall success.
 *
 * Instead of static intervals, tracks actual recall performance per domain
 * and adjusts intervals accordingly. Domains with poor recall get shorter
 * intervals; domains with excellent recall get longer intervals.
 *
 * Implements a modified Ebbinghaus curve with per-domain half-lives.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DomainCalibration {
  domain: string;
  halfLifeHours: number;       // calibrated half-life
  baseHalfLifeHours: number;   // original half-life
  recallAttempts: number;
  recallSuccesses: number;
  recallRate: number;          // success/attempts
  lastCalibrated: number;
  intervalMultiplier: number;  // derived from recall performance
}

export interface RecallAttempt {
  memoryId: string;
  domain: string;
  success: boolean;
  timeSinceLastReview: number; // hours
  timestamp: number;
}

export interface CalibrationStats {
  totalDomains: number;
  totalAttempts: number;
  overallRecallRate: number;
  bestDomain: string | null;
  worstDomain: string | null;
  avgHalfLife: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT HALF-LIVES (hours)
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_HALF_LIVES: Record<string, number> = {
  doctrine: 2160,       // 90 days
  architecture: 720,    // 30 days
  heuristic: 720,       // 30 days
  code: 336,            // 14 days
  error_pattern: 336,   // 14 days
  conversation: 168,    // 7 days
  general: 336,         // 14 days
  security: 504,        // 21 days
  performance: 336,     // 14 days
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Minimum half-life floor (1 hour) */
const MIN_HALF_LIFE = 1;
/** Maximum half-life ceiling (180 days) */
const MAX_HALF_LIFE = 4320;
/** Minimum attempts before calibration kicks in */
const MIN_CALIBRATION_ATTEMPTS = 5;
/** EMA smoothing for interval adjustment */
const CALIBRATION_ALPHA = 0.2;

class ForgettingCurveEngine {
  private calibrations = new Map<string, DomainCalibration>();
  private recentAttempts: RecallAttempt[] = [];
  private maxAttempts = 1000;

  /**
   * Record a recall attempt and recalibrate the domain's forgetting curve.
   */
  recordAttempt(attempt: Omit<RecallAttempt, 'timestamp'>): DomainCalibration {
    const ts = Date.now();
    this.recentAttempts.push({ ...attempt, timestamp: ts });
    if (this.recentAttempts.length > this.maxAttempts) {
      this.recentAttempts = this.recentAttempts.slice(-this.maxAttempts);
    }

    // Get or create domain calibration
    let cal = this.calibrations.get(attempt.domain);
    if (!cal) {
      const baseHalf = DEFAULT_HALF_LIVES[attempt.domain] || DEFAULT_HALF_LIVES.general;
      cal = {
        domain: attempt.domain,
        halfLifeHours: baseHalf,
        baseHalfLifeHours: baseHalf,
        recallAttempts: 0,
        recallSuccesses: 0,
        recallRate: 0.5,
        lastCalibrated: ts,
        intervalMultiplier: 1.0,
      };
      this.calibrations.set(attempt.domain, cal);
    }

    // Update stats
    cal.recallAttempts++;
    if (attempt.success) cal.recallSuccesses++;
    cal.recallRate = cal.recallSuccesses / cal.recallAttempts;

    // Recalibrate if enough data
    if (cal.recallAttempts >= MIN_CALIBRATION_ATTEMPTS) {
      this.recalibrate(cal);
    }

    return cal;
  }

  /**
   * Get the recommended review interval for a memory in a given domain.
   * Returns hours until next review.
   */
  getReviewInterval(domain: string, consecutiveSuccesses: number = 0): number {
    const cal = this.calibrations.get(domain);
    const baseHalf = cal?.halfLifeHours || DEFAULT_HALF_LIVES[domain] || DEFAULT_HALF_LIVES.general;
    const multiplier = cal?.intervalMultiplier || 1.0;

    // SM-2 style expansion: each consecutive success doubles the interval
    const expansionFactor = Math.pow(2, Math.min(consecutiveSuccesses, 8));

    return Math.max(MIN_HALF_LIFE, Math.min(MAX_HALF_LIFE, baseHalf * multiplier * expansionFactor));
  }

  /**
   * Predict recall probability at a given time since last review.
   * Uses calibrated Ebbinghaus curve: R = 2^(-t/halfLife)
   */
  predictRecall(domain: string, hoursSinceReview: number): number {
    const cal = this.calibrations.get(domain);
    const halfLife = cal?.halfLifeHours || DEFAULT_HALF_LIVES[domain] || DEFAULT_HALF_LIVES.general;

    return Math.pow(2, -hoursSinceReview / halfLife);
  }

  /**
   * Get memories that are due for review (recall probability < threshold).
   */
  getDueForReview(
    memories: Array<{ id: string; domain: string; lastReviewedAt: number }>,
    recallThreshold: number = 0.5
  ): Array<{ memoryId: string; recallProbability: number; domain: string }> {
    const now = Date.now();
    const due: Array<{ memoryId: string; recallProbability: number; domain: string }> = [];

    for (const mem of memories) {
      const hoursSince = (now - mem.lastReviewedAt) / 3600000;
      const recallProb = this.predictRecall(mem.domain, hoursSince);

      if (recallProb < recallThreshold) {
        due.push({ memoryId: mem.id, recallProbability: recallProb, domain: mem.domain });
      }
    }

    // Sort by most urgent (lowest recall probability)
    due.sort((a, b) => a.recallProbability - b.recallProbability);
    return due;
  }

  /**
   * Recalibrate a domain's forgetting curve based on actual performance.
   */
  private recalibrate(cal: DomainCalibration): void {
    const targetRecallRate = 0.85; // We want 85% recall at review time

    if (cal.recallRate > targetRecallRate + 0.1) {
      // Too easy — increase half-life (less frequent reviews)
      const boost = 1 + (cal.recallRate - targetRecallRate) * 0.5;
      cal.intervalMultiplier = CALIBRATION_ALPHA * boost + (1 - CALIBRATION_ALPHA) * cal.intervalMultiplier;
    } else if (cal.recallRate < targetRecallRate - 0.1) {
      // Too hard — decrease half-life (more frequent reviews)
      const reduction = 1 - (targetRecallRate - cal.recallRate) * 0.5;
      cal.intervalMultiplier = CALIBRATION_ALPHA * reduction + (1 - CALIBRATION_ALPHA) * cal.intervalMultiplier;
    }

    // Clamp multiplier
    cal.intervalMultiplier = Math.max(0.25, Math.min(4.0, cal.intervalMultiplier));
    cal.halfLifeHours = Math.max(MIN_HALF_LIFE, Math.min(MAX_HALF_LIFE, cal.baseHalfLifeHours * cal.intervalMultiplier));
    cal.lastCalibrated = Date.now();
  }

  /** Get calibration for a domain */
  getCalibration(domain: string): DomainCalibration | undefined {
    return this.calibrations.get(domain);
  }

  /** Get all calibrations */
  getAllCalibrations(): DomainCalibration[] {
    return [...this.calibrations.values()].sort((a, b) => a.recallRate - b.recallRate);
  }

  getStats(): CalibrationStats {
    const cals = [...this.calibrations.values()];
    if (cals.length === 0) {
      return { totalDomains: 0, totalAttempts: 0, overallRecallRate: 0, bestDomain: null, worstDomain: null, avgHalfLife: 0 };
    }

    const totalAttempts = cals.reduce((s, c) => s + c.recallAttempts, 0);
    const totalSuccesses = cals.reduce((s, c) => s + c.recallSuccesses, 0);
    const sorted = [...cals].sort((a, b) => b.recallRate - a.recallRate);

    return {
      totalDomains: cals.length,
      totalAttempts,
      overallRecallRate: totalAttempts > 0 ? totalSuccesses / totalAttempts : 0,
      bestDomain: sorted[0]?.domain || null,
      worstDomain: sorted[sorted.length - 1]?.domain || null,
      avgHalfLife: cals.reduce((s, c) => s + c.halfLifeHours, 0) / cals.length,
    };
  }

  clear(): void {
    this.calibrations.clear();
    this.recentAttempts = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: ForgettingCurveEngine | null = null;

export function getForgettingCurveEngine(): ForgettingCurveEngine {
  if (!_engine) _engine = new ForgettingCurveEngine();
  return _engine;
}

export function resetForgettingCurve(): void {
  _engine = null;
}
