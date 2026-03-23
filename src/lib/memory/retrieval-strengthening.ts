/**
 * CMPSBL® MEMORY — Retrieval-Induced Strengthening & Weakening
 * The testing effect: recalling a memory strengthens it while
 * weakening competing similar memories.
 *
 * Implements retrieval practice theory:
 * - Successful recall → boost target + weaken competitors
 * - Failed recall → no change (prevents accidental weakening)
 * - Repeated retrieval → diminishing returns (saturation)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface RetrievalEvent {
  targetId: string;
  competitorIds: string[];
  success: boolean;
  strengthDelta: number;   // how much the target was strengthened
  weakenedCount: number;   // how many competitors were weakened
  timestamp: number;
}

export interface StrengthAdjustment {
  memoryId: string;
  oldStrength: number;
  newStrength: number;
  delta: number;
  reason: 'retrieval_boost' | 'competitor_weakening' | 'saturation_decay';
}

export interface RetrievalStats {
  totalRetrievals: number;
  successfulRetrievals: number;
  totalStrengthened: number;
  totalWeakened: number;
  avgBoostPerRetrieval: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Base strength boost per successful retrieval */
const BASE_BOOST = 0.08;
/** Weakening factor for competitors */
const WEAKENING_FACTOR = 0.03;
/** Saturation: diminishing returns after N retrievals */
const SATURATION_THRESHOLD = 10;
/** Maximum strength */
const MAX_STRENGTH = 1.0;
/** Minimum strength (prevents total erasure) */
const MIN_STRENGTH = 0.05;

class RetrievalStrengtheningEngine {
  private strengths = new Map<string, number>();
  private retrievalCounts = new Map<string, number>();
  private events: RetrievalEvent[] = [];
  private maxEvents = 500;
  private totalRetrievals = 0;
  private successfulRetrievals = 0;
  private totalStrengthened = 0;
  private totalWeakened = 0;
  private totalBoost = 0;

  /**
   * Record a retrieval event and apply strengthening/weakening.
   *
   * @param targetId The memory that was recalled
   * @param competitorIds Similar memories that competed during recall
   * @param success Whether the recall was successful
   * @param similarityScores Optional: similarity between target and each competitor
   */
  onRetrieval(
    targetId: string,
    competitorIds: string[],
    success: boolean,
    similarityScores?: Map<string, number>
  ): StrengthAdjustment[] {
    const adjustments: StrengthAdjustment[] = [];
    this.totalRetrievals++;

    if (!success) {
      // Failed recall — no strengthening, no weakening
      this.events.push({
        targetId,
        competitorIds,
        success: false,
        strengthDelta: 0,
        weakenedCount: 0,
        timestamp: Date.now(),
      });
      return adjustments;
    }

    this.successfulRetrievals++;

    // Get retrieval count for saturation
    const count = (this.retrievalCounts.get(targetId) || 0) + 1;
    this.retrievalCounts.set(targetId, count);

    // Diminishing returns: boost = base / (1 + ln(count))
    const saturationFactor = 1 / (1 + Math.log(Math.min(count, SATURATION_THRESHOLD)));
    const boost = BASE_BOOST * saturationFactor;

    // Strengthen target
    const oldTargetStrength = this.strengths.get(targetId) ?? 0.5;
    const newTargetStrength = Math.min(MAX_STRENGTH, oldTargetStrength + boost);
    this.strengths.set(targetId, newTargetStrength);
    this.totalStrengthened++;
    this.totalBoost += boost;

    adjustments.push({
      memoryId: targetId,
      oldStrength: oldTargetStrength,
      newStrength: newTargetStrength,
      delta: boost,
      reason: 'retrieval_boost',
    });

    // Weaken competitors proportional to their similarity
    let weakenedCount = 0;
    for (const compId of competitorIds) {
      const similarity = similarityScores?.get(compId) ?? 0.5;
      const weakening = WEAKENING_FACTOR * similarity * saturationFactor;

      const oldStrength = this.strengths.get(compId) ?? 0.5;
      const newStrength = Math.max(MIN_STRENGTH, oldStrength - weakening);

      if (newStrength < oldStrength) {
        this.strengths.set(compId, newStrength);
        weakenedCount++;
        this.totalWeakened++;

        adjustments.push({
          memoryId: compId,
          oldStrength,
          newStrength,
          delta: -(oldStrength - newStrength),
          reason: 'competitor_weakening',
        });
      }
    }

    this.events.push({
      targetId,
      competitorIds,
      success: true,
      strengthDelta: boost,
      weakenedCount,
      timestamp: Date.now(),
    });

    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    return adjustments;
  }

  /**
   * Get the current strength of a memory.
   */
  getStrength(memoryId: string): number {
    return this.strengths.get(memoryId) ?? 0.5;
  }

  /**
   * Set initial strength for a memory.
   */
  setStrength(memoryId: string, strength: number): void {
    this.strengths.set(memoryId, Math.max(MIN_STRENGTH, Math.min(MAX_STRENGTH, strength)));
  }

  /**
   * Get retrieval count for a memory.
   */
  getRetrievalCount(memoryId: string): number {
    return this.retrievalCounts.get(memoryId) || 0;
  }

  /**
   * Get memories sorted by strength (strongest first).
   */
  getByStrength(limit: number = 20): Array<{ memoryId: string; strength: number; retrievals: number }> {
    return [...this.strengths.entries()]
      .map(([memoryId, strength]) => ({
        memoryId,
        strength,
        retrievals: this.retrievalCounts.get(memoryId) || 0,
      }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }

  /**
   * Get weakest memories (candidates for forgetting/archival).
   */
  getWeakest(limit: number = 20): Array<{ memoryId: string; strength: number }> {
    return [...this.strengths.entries()]
      .map(([memoryId, strength]) => ({ memoryId, strength }))
      .sort((a, b) => a.strength - b.strength)
      .slice(0, limit);
  }

  getStats(): RetrievalStats {
    return {
      totalRetrievals: this.totalRetrievals,
      successfulRetrievals: this.successfulRetrievals,
      totalStrengthened: this.totalStrengthened,
      totalWeakened: this.totalWeakened,
      avgBoostPerRetrieval: this.successfulRetrievals > 0 ? this.totalBoost / this.successfulRetrievals : 0,
    };
  }

  clear(): void {
    this.strengths.clear();
    this.retrievalCounts.clear();
    this.events = [];
    this.totalRetrievals = 0;
    this.successfulRetrievals = 0;
    this.totalStrengthened = 0;
    this.totalWeakened = 0;
    this.totalBoost = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: RetrievalStrengtheningEngine | null = null;

export function getRetrievalEngine(): RetrievalStrengtheningEngine {
  if (!_engine) _engine = new RetrievalStrengtheningEngine();
  return _engine;
}

export function resetRetrievalEngine(): void {
  _engine = null;
}
