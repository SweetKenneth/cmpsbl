/**
 * CMPSBL® BRAIN — Neural Plasticity Governor
 * Controls learning rate based on confidence/novelty balance.
 *
 * Prevents:
 * - Catastrophic forgetting (learning too fast erases stable knowledge)
 * - Stagnation (learning too slow prevents adaptation)
 *
 * Uses a meta-learning approach: tracks learning outcomes to adjust
 * the learning rate itself (learning to learn).
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlasticityState {
  learningRate: number;          // 0-1, current global learning rate
  stability: number;             // 0-1, how stable current knowledge is
  noveltyPressure: number;       // 0-1, how much new info is arriving
  adaptationSpeed: number;       // derived: how fast the system adapts
  mode: PlasticityMode;
  recentOutcomes: LearningOutcome[];
  totalAdjustments: number;
}

export type PlasticityMode = 'exploration' | 'consolidation' | 'balanced' | 'protective';

export interface LearningOutcome {
  timestamp: number;
  success: boolean;
  novelty: number;       // 0-1 how novel was the learned material
  impact: number;        // 0-1 how much it changed existing knowledge
  domain: string;
}

export interface PlasticityConfig {
  /** Base learning rate (default 0.5) */
  baseLearningRate: number;
  /** Minimum learning rate floor (default 0.05) */
  minRate: number;
  /** Maximum learning rate ceiling (default 0.95) */
  maxRate: number;
  /** How many recent outcomes to track (default 50) */
  windowSize: number;
  /** Stability threshold for protective mode (default 0.8) */
  stabilityThreshold: number;
}

const DEFAULT_CONFIG: PlasticityConfig = {
  baseLearningRate: 0.5,
  minRate: 0.05,
  maxRate: 0.95,
  windowSize: 50,
  stabilityThreshold: 0.8,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class PlasticityGovernor {
  private config: PlasticityConfig;
  private learningRate: number;
  private outcomes: LearningOutcome[] = [];
  private totalAdjustments = 0;

  constructor(config?: Partial<PlasticityConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.learningRate = this.config.baseLearningRate;
  }

  /**
   * Record a learning outcome and adjust plasticity accordingly.
   */
  recordOutcome(outcome: Omit<LearningOutcome, 'timestamp'>): void {
    this.outcomes.push({ ...outcome, timestamp: Date.now() });

    // Trim to window
    if (this.outcomes.length > this.config.windowSize) {
      this.outcomes = this.outcomes.slice(-this.config.windowSize);
    }

    this.adjustRate();
  }

  /**
   * Get the current effective learning rate for a given novelty level.
   * High novelty + exploration mode → higher rate.
   * High novelty + protective mode → lower rate (protect existing knowledge).
   */
  getEffectiveRate(novelty: number = 0.5): number {
    const mode = this.getMode();

    switch (mode) {
      case 'exploration':
        // Boost rate for novel content
        return Math.min(this.config.maxRate, this.learningRate * (1 + novelty * 0.3));
      case 'protective':
        // Reduce rate for novel content (protect stability)
        return Math.max(this.config.minRate, this.learningRate * (1 - novelty * 0.3));
      case 'consolidation':
        // Low rate regardless — focusing on strengthening existing
        return Math.max(this.config.minRate, this.learningRate * 0.5);
      default:
        return this.learningRate;
    }
  }

  /**
   * Determine the current plasticity mode based on recent outcomes.
   */
  getMode(): PlasticityMode {
    if (this.outcomes.length < 5) return 'exploration'; // Cold start

    const stability = this.calculateStability();
    const noveltyPressure = this.calculateNoveltyPressure();
    const successRate = this.calculateSuccessRate();

    if (stability > this.config.stabilityThreshold && successRate > 0.8) {
      return noveltyPressure > 0.6 ? 'protective' : 'consolidation';
    }

    if (noveltyPressure > 0.7) return 'exploration';
    if (successRate < 0.4) return 'protective';

    return 'balanced';
  }

  /**
   * Get full plasticity state.
   */
  getState(): PlasticityState {
    return {
      learningRate: this.learningRate,
      stability: this.calculateStability(),
      noveltyPressure: this.calculateNoveltyPressure(),
      adaptationSpeed: this.learningRate * (1 - this.calculateStability()),
      mode: this.getMode(),
      recentOutcomes: this.outcomes.slice(-10),
      totalAdjustments: this.totalAdjustments,
    };
  }

  /**
   * Force a mode override (governor intervention).
   */
  forceRate(rate: number): void {
    this.learningRate = Math.max(this.config.minRate, Math.min(this.config.maxRate, rate));
    this.totalAdjustments++;
  }

  // ─── Internal Calculations ─────────────────────────────────────────

  private adjustRate(): void {
    const successRate = this.calculateSuccessRate();
    const noveltyPressure = this.calculateNoveltyPressure();
    const stability = this.calculateStability();

    // Meta-learning: adjust rate based on outcome patterns
    let adjustment = 0;

    // Success → slight increase (good learning is happening)
    if (successRate > 0.7) adjustment += 0.02;
    // Failure → decrease (protect existing knowledge)
    if (successRate < 0.3) adjustment -= 0.05;

    // High novelty → slight increase (need to adapt)
    if (noveltyPressure > 0.6) adjustment += 0.01;
    // High stability → slight decrease (don't disrupt)
    if (stability > 0.8) adjustment -= 0.01;

    this.learningRate = Math.max(
      this.config.minRate,
      Math.min(this.config.maxRate, this.learningRate + adjustment)
    );

    this.totalAdjustments++;
  }

  private calculateSuccessRate(): number {
    if (this.outcomes.length === 0) return 0.5;
    const successes = this.outcomes.filter(o => o.success).length;
    return successes / this.outcomes.length;
  }

  private calculateNoveltyPressure(): number {
    if (this.outcomes.length === 0) return 0.5;
    const recent = this.outcomes.slice(-10);
    return recent.reduce((s, o) => s + o.novelty, 0) / recent.length;
  }

  private calculateStability(): number {
    if (this.outcomes.length < 5) return 0.3;
    // Stability = low variance in success rate over time
    const recent = this.outcomes.slice(-20);
    const impacts = recent.map(o => o.impact);
    const mean = impacts.reduce((s, v) => s + v, 0) / impacts.length;
    const variance = impacts.reduce((s, v) => s + (v - mean) ** 2, 0) / impacts.length;
    // Low variance = high stability
    return Math.max(0, Math.min(1, 1 - Math.sqrt(variance) * 2));
  }

  clear(): void {
    this.learningRate = this.config.baseLearningRate;
    this.outcomes = [];
    this.totalAdjustments = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _governor: PlasticityGovernor | null = null;

export function getPlasticityGovernor(): PlasticityGovernor {
  if (!_governor) _governor = new PlasticityGovernor();
  return _governor;
}

export function resetPlasticityGovernor(): void {
  _governor = null;
}
