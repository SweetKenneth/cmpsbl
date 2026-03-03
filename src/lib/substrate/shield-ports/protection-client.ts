/**
 * Protection Client — Ported from aetherion-shield (Hardened)
 * Full protection lifecycle orchestrator (fingerprint → analyze → challenge/block/allow)
 * Target nodes: DEFENSE, SITE-GUARD, IMMUNITY
 *
 * HARDENING:
 *  A) GOVERNANCE-configurable score weights with max daily drift + evolution log
 *  B) Entropy confidence metric — flags automation when signals are "too clean"
 *  C) Only hashed fingerprints cross the network boundary (compliance-safe)
 */

import { DeviceFingerprint, FingerprintData } from './device-fingerprint';
import { BehavioralTracker, BehavioralData } from './behavioral-tracker';
import { clampNumber, boundArray } from '@/lib/system/hardening';

// ── A) GOVERNANCE-configurable score weights ─────────────────────────

export interface ScoreWeights {
  /** Weight for (1 - humanScore) signal. Default 0.4 */
  humanScoreWeight: number;
  /** Weight per risk signal (canvas blocked, etc). Default 0.1 */
  riskSignalWeight: number;
  /** Weight for entropy confidence signal. Default 0.2 */
  entropyWeight: number;
  /** Block threshold. Default 0.7 */
  blockThreshold: number;
  /** Challenge threshold. Default 0.4 */
  challengeThreshold: number;
}

const DEFAULT_WEIGHTS: Readonly<ScoreWeights> = Object.freeze({
  humanScoreWeight: 0.4,
  riskSignalWeight: 0.1,
  entropyWeight: 0.2,
  blockThreshold: 0.7,
  challengeThreshold: 0.4,
});

/** Hard bounds — no GOVERNANCE config can push weights outside these */
const WEIGHT_BOUNDS = {
  humanScoreWeight:  { min: 0.1, max: 0.8 },
  riskSignalWeight:  { min: 0.01, max: 0.3 },
  entropyWeight:     { min: 0.05, max: 0.5 },
  blockThreshold:    { min: 0.5, max: 0.95 },
  challengeThreshold:{ min: 0.2, max: 0.7 },
} as const;

/** Max any weight can drift per day from its last value */
const MAX_WEIGHT_DRIFT_PER_DAY = 0.1;

interface ScoreEvolutionEntry {
  timestamp: number;
  score: number;
  weights: ScoreWeights;
  entropyConfidence: number;
  humanScore: number;
  riskSignals: string[];
}

// ── Config ───────────────────────────────────────────────────────────

export interface ProtectionConfig {
  autoProtect?: boolean;
  trackBehavior?: boolean;
  warmupMs?: number;
  /** GOVERNANCE-provided weight overrides */
  weights?: Partial<ScoreWeights>;
  onBlocked?: (reason: string) => void;
  onChallenge?: (challengeData: unknown) => void;
}

export interface ProtectionResult {
  allowed: boolean;
  action: 'allow' | 'block' | 'challenge';
  score: number;
  reasons: string[];
  /** Entropy confidence — low values (< 0.3) indicate automation */
  entropyConfidence: number;
  /** Only hash + metadata, never raw signals */
  fingerprintHash: string | null;
  challenge?: { type: string; token: string; data: unknown };
}

// ── Protection Client ────────────────────────────────────────────────

export class ProtectionClient {
  private config: Required<Pick<ProtectionConfig, 'autoProtect' | 'trackBehavior' | 'warmupMs'>> & ProtectionConfig;
  private fingerprint: FingerprintData | null = null;
  private fingerprintHash: string | null = null;
  private tracker: BehavioralTracker;
  private isProtected = false;
  private weights: ScoreWeights;
  private lastWeightUpdate = 0;
  private scoreHistory: ScoreEvolutionEntry[] = [];

  constructor(config: ProtectionConfig = {}) {
    this.config = {
      autoProtect: true,
      trackBehavior: true,
      warmupMs: 2000,
      ...config,
    };
    this.tracker = new BehavioralTracker();
    this.weights = this.clampWeights({ ...DEFAULT_WEIGHTS, ...config.weights });

    if (this.config.autoProtect) {
      this.initialize();
    }
  }

  /** Apply GOVERNANCE weight update with drift cap + hard clamp */
  updateWeights(partial: Partial<ScoreWeights>): void {
    const now = Date.now();
    const merged = { ...this.weights, ...partial };

    // If last update was within 24h, enforce drift cap
    if (this.lastWeightUpdate > 0 && now - this.lastWeightUpdate < 86_400_000) {
      for (const key of Object.keys(partial) as (keyof ScoreWeights)[]) {
        const oldVal = this.weights[key];
        const newVal = merged[key];
        const delta = newVal - oldVal;
        const clampedDelta = Math.max(-MAX_WEIGHT_DRIFT_PER_DAY, Math.min(MAX_WEIGHT_DRIFT_PER_DAY, delta));
        (merged as any)[key] = oldVal + clampedDelta;
      }
    }

    this.weights = this.clampWeights(merged);
    this.lastWeightUpdate = now;
  }

  /** Clamp all weights to hard bounds */
  private clampWeights(w: ScoreWeights): ScoreWeights {
    return {
      humanScoreWeight: clampNumber(w.humanScoreWeight, WEIGHT_BOUNDS.humanScoreWeight.min, WEIGHT_BOUNDS.humanScoreWeight.max, DEFAULT_WEIGHTS.humanScoreWeight),
      riskSignalWeight: clampNumber(w.riskSignalWeight, WEIGHT_BOUNDS.riskSignalWeight.min, WEIGHT_BOUNDS.riskSignalWeight.max, DEFAULT_WEIGHTS.riskSignalWeight),
      entropyWeight: clampNumber(w.entropyWeight, WEIGHT_BOUNDS.entropyWeight.min, WEIGHT_BOUNDS.entropyWeight.max, DEFAULT_WEIGHTS.entropyWeight),
      blockThreshold: clampNumber(w.blockThreshold, WEIGHT_BOUNDS.blockThreshold.min, WEIGHT_BOUNDS.blockThreshold.max, DEFAULT_WEIGHTS.blockThreshold),
      challengeThreshold: clampNumber(w.challengeThreshold, WEIGHT_BOUNDS.challengeThreshold.min, WEIGHT_BOUNDS.challengeThreshold.max, DEFAULT_WEIGHTS.challengeThreshold),
    };
  }

  private async initialize(): Promise<void> {
    try {
      this.fingerprint = await DeviceFingerprint.generate();
      this.fingerprintHash = await DeviceFingerprint.hash(this.fingerprint);

      if (this.config.trackBehavior) {
        this.tracker.start();
      }

      setTimeout(() => this.protect(), this.config.warmupMs);
    } catch (err) {
      console.warn('[DEFENSE] Protection initialization failed:', err);
    }
  }

  /** Run the protection check */
  async protect(): Promise<ProtectionResult> {
    if (this.isProtected) {
      return { allowed: true, action: 'allow', score: 0, reasons: ['already_protected'], entropyConfidence: 1, fingerprintHash: this.fingerprintHash };
    }

    if (!this.fingerprint || !this.fingerprintHash) {
      return { allowed: true, action: 'allow', score: 0, reasons: ['fingerprint_unavailable'], entropyConfidence: 0.5, fingerprintHash: null };
    }

    const humanScore = this.config.trackBehavior ? this.tracker.computeHumanScore() : 0.5;

    // ── B) Entropy confidence ──
    const entropyConfidence = this.computeEntropyConfidence();

    // Build risk signals
    const riskSignals: string[] = [];
    if (humanScore < 0.3) riskSignals.push('low_human_score');
    if (!this.fingerprint.canvas) riskSignals.push('canvas_blocked');
    if (!this.fingerprint.webgl) riskSignals.push('webgl_blocked');
    if (this.fingerprint.plugins.length === 0) riskSignals.push('no_plugins');
    if (entropyConfidence < 0.3) riskSignals.push('entropy_collapse');
    // Enterprise signals
    if (this.fingerprint.webdriver) riskSignals.push('webdriver_detected');
    if (this.fingerprint.cdpDetected) riskSignals.push('cdp_leak');
    if (this.fingerprint.performanceAPITampered) riskSignals.push('perf_api_tampered');
    if (this.fingerprint.browserInconsistencies.length > 0) {
      riskSignals.push(`browser_inconsistencies:${this.fingerprint.browserInconsistencies.length}`);
    }

    // Weighted scoring
    const w = this.weights;
    let score = 0;
    score += (1 - humanScore) * w.humanScoreWeight;
    score += riskSignals.length * w.riskSignalWeight;
    score += (1 - entropyConfidence) * w.entropyWeight;
    score = Math.min(score, 1);

    // Log score evolution
    this.scoreHistory = boundArray([...this.scoreHistory, {
      timestamp: Date.now(),
      score,
      weights: { ...this.weights },
      entropyConfidence,
      humanScore,
      riskSignals,
    }], 500);

    const result: ProtectionResult = {
      allowed: score < w.blockThreshold,
      action: score > w.blockThreshold ? 'block' : score > w.challengeThreshold ? 'challenge' : 'allow',
      score,
      reasons: riskSignals,
      entropyConfidence,
      fingerprintHash: this.fingerprintHash, // Only hash, never raw
    };

    if (!result.allowed && result.action === 'block') {
      this.config.onBlocked?.(result.reasons.join(', '));
    } else if (result.action === 'challenge') {
      this.config.onChallenge?.(result);
    } else {
      this.isProtected = true;
    }

    return result;
  }

  // ── B) Entropy confidence computation ──────────────────────────────

  /**
   * Compute entropy across fingerprint + behavioral signals.
   * Low entropy (too consistent/perfect) → likely automation.
   * Returns 0–1 where LOW values = suspicious (too clean).
   */
  private computeEntropyConfidence(): number {
    let signals: number[] = [];

    // Fingerprint signal diversity
    const fp = this.fingerprint!;
    signals.push(fp.canvas ? 1 : 0);
    signals.push(fp.webgl ? 1 : 0);
    signals.push(fp.audio ? 1 : 0);
    signals.push(fp.fonts.length > 0 ? Math.min(fp.fonts.length / 12, 1) : 0);
    signals.push(fp.plugins.length > 0 ? Math.min(fp.plugins.length / 5, 1) : 0);
    signals.push(fp.hardwareConcurrency > 1 ? 1 : 0);
    signals.push(fp.deviceMemory ? 1 : 0);

    // Behavioral timing variance (if tracking)
    if (this.config.trackBehavior) {
      const data = this.tracker.getData();

      // Mouse speed variance
      if (data.mouse_movements.length > 5) {
        const speeds = data.mouse_movements.slice(1).map((m, i) => {
          const prev = data.mouse_movements[i];
          const dt = Math.max(m.timestamp - prev.timestamp, 1);
          return Math.sqrt((m.x - prev.x) ** 2 + (m.y - prev.y) ** 2) / dt;
        });
        const speedEntropy = this.shannonEntropy(speeds);
        signals.push(Math.min(speedEntropy / 3, 1));
      }

      // Key interval variance
      if (data.keyboard_events.length > 3) {
        const intervals = data.keyboard_events.slice(1).map((k, i) => k.timestamp - data.keyboard_events[i].timestamp);
        const keyEntropy = this.shannonEntropy(intervals);
        signals.push(Math.min(keyEntropy / 3, 1));
      }

      // Click position variance
      if (data.click_events.length > 2) {
        const xs = data.click_events.map(c => c.x);
        const ys = data.click_events.map(c => c.y);
        const posEntropy = (this.shannonEntropy(xs) + this.shannonEntropy(ys)) / 2;
        signals.push(Math.min(posEntropy / 3, 1));
      }
    }

    if (signals.length === 0) return 0.5;

    // Overall entropy confidence = mean of all signal diversities
    const mean = signals.reduce((a, b) => a + b, 0) / signals.length;

    // Penalize if ALL signals are identical (too perfect)
    const allSame = signals.every(s => s === signals[0]);
    if (allSame && signals[0] === 1) return 0.2; // Suspiciously perfect

    return Math.min(mean, 1);
  }

  /**
   * Shannon entropy of a numeric array (binned into 10 buckets).
   * Higher = more random/human. Lower = more uniform/bot.
   */
  private shannonEntropy(values: number[]): number {
    if (values.length < 2) return 0;

    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return 0; // Zero variance = zero entropy

    const bins = 10;
    const counts = new Array(bins).fill(0);
    for (const v of values) {
      const idx = Math.min(Math.floor(((v - min) / (max - min)) * bins), bins - 1);
      counts[idx]++;
    }

    let entropy = 0;
    for (const c of counts) {
      if (c === 0) continue;
      const p = c / values.length;
      entropy -= p * Math.log2(p);
    }

    return entropy;
  }

  // ── Public accessors ───────────────────────────────────────────────

  /** NEVER returns raw fingerprint — only hash. Raw stays in-memory only. */
  getFingerprintHash(): string | null { return this.fingerprintHash; }

  /** Get behavioral data snapshot (in-memory only, never persisted raw) */
  getBehavioralData(): BehavioralData { return this.tracker.getData(); }

  getHumanScore(): number { return this.tracker.computeHumanScore(); }

  /** Get current weights (for GOVERNANCE dashboard) */
  getWeights(): Readonly<ScoreWeights> { return { ...this.weights }; }

  /** Get score evolution log (for trend analysis) */
  getScoreHistory(): readonly ScoreEvolutionEntry[] { return this.scoreHistory; }

  destroy(): void { this.tracker.stop(); }
}
