/**
 * Protection Client — Ported from aetherion-shield
 * Full protection lifecycle orchestrator (fingerprint → analyze → challenge/block/allow)
 * Target nodes: DEFENSE, SITE-GUARD, IMMUNITY
 */

import { DeviceFingerprint, FingerprintData } from './device-fingerprint';
import { BehavioralTracker, BehavioralData } from './behavioral-tracker';

export interface ProtectionConfig {
  /** Auto-initialize on construction */
  autoProtect?: boolean;
  /** Track behavioral signals */
  trackBehavior?: boolean;
  /** Delay (ms) before first protection check to gather behavioral data */
  warmupMs?: number;
  /** Called when traffic is blocked */
  onBlocked?: (reason: string) => void;
  /** Called when a challenge is required */
  onChallenge?: (challengeData: unknown) => void;
}

export interface ProtectionResult {
  allowed: boolean;
  action: 'allow' | 'block' | 'challenge';
  score: number;
  reasons: string[];
  challenge?: { type: string; token: string; data: unknown };
}

/**
 * Orchestrates the full client-side protection lifecycle.
 * Uses DeviceFingerprint + BehavioralTracker to assemble signals,
 * then delegates scoring to the substrate's DEFENSE edge function.
 */
export class ProtectionClient {
  private config: Required<Pick<ProtectionConfig, 'autoProtect' | 'trackBehavior' | 'warmupMs'>> & ProtectionConfig;
  private fingerprint: FingerprintData | null = null;
  private fingerprintHash: string | null = null;
  private tracker: BehavioralTracker;
  private isProtected = false;

  constructor(config: ProtectionConfig = {}) {
    this.config = {
      autoProtect: true,
      trackBehavior: true,
      warmupMs: 2000,
      ...config,
    };
    this.tracker = new BehavioralTracker();

    if (this.config.autoProtect) {
      this.initialize();
    }
  }

  /** Initialize fingerprint collection + behavioral tracking */
  private async initialize(): Promise<void> {
    try {
      this.fingerprint = await DeviceFingerprint.generate();
      this.fingerprintHash = await DeviceFingerprint.hash(this.fingerprint);

      if (this.config.trackBehavior) {
        this.tracker.start();
      }

      // Wait for warmup period to collect behavioral data
      setTimeout(() => this.protect(), this.config.warmupMs);
    } catch (err) {
      console.warn('[DEFENSE] Protection initialization failed:', err);
    }
  }

  /** Run the protection check */
  async protect(): Promise<ProtectionResult> {
    if (this.isProtected) {
      return { allowed: true, action: 'allow', score: 0, reasons: ['already_protected'] };
    }

    if (!this.fingerprint || !this.fingerprintHash) {
      return { allowed: true, action: 'allow', score: 0, reasons: ['fingerprint_unavailable'] };
    }

    const behavioral = this.config.trackBehavior ? this.tracker.getData() : null;
    const humanScore = this.config.trackBehavior ? this.tracker.computeHumanScore() : null;

    // Build local risk assessment
    const riskSignals: string[] = [];
    if (humanScore !== null && humanScore < 0.3) {
      riskSignals.push('low_human_score');
    }
    if (!this.fingerprint.canvas) riskSignals.push('canvas_blocked');
    if (!this.fingerprint.webgl) riskSignals.push('webgl_blocked');
    if (this.fingerprint.plugins.length === 0) riskSignals.push('no_plugins');

    // Compute local score (0–1, higher = more suspicious)
    let score = 0;
    if (humanScore !== null) score += (1 - humanScore) * 0.4;
    score += riskSignals.length * 0.1;
    score = Math.min(score, 1);

    const result: ProtectionResult = {
      allowed: score < 0.7,
      action: score > 0.7 ? 'block' : score > 0.4 ? 'challenge' : 'allow',
      score,
      reasons: riskSignals,
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

  /** Get raw fingerprint */
  getFingerprint(): FingerprintData | null { return this.fingerprint; }

  /** Get behavioral data snapshot */
  getBehavioralData(): BehavioralData { return this.tracker.getData(); }

  /** Get current human-likelihood score */
  getHumanScore(): number { return this.tracker.computeHumanScore(); }

  /** Tear down all tracking */
  destroy(): void { this.tracker.stop(); }
}
