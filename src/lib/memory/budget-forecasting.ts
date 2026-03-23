/**
 * CMPSBL® MEMORY — Memory Budget Forecasting
 * Predictive model for storage consumption across tiers.
 *
 * Tracks ingestion rate, compression efficiency, and tier migration
 * to forecast when tiers will hit capacity and plan preemptive pruning.
 *
 * Uses exponential moving average for trend smoothing.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface TierCapacity {
  tier: string;
  current: number;
  max: number;
  utilizationPct: number;
  ingestionRate: number;   // items per hour
  pruneRate: number;       // items pruned per hour
  netGrowthRate: number;   // items per hour (ingestion - prune)
  hoursToFull: number;     // estimated hours until capacity
  status: 'healthy' | 'warning' | 'critical' | 'full';
}

export interface BudgetForecast {
  tiers: TierCapacity[];
  overallHealthPct: number;
  nextCriticalTier: string | null;
  nextCriticalHours: number | null;
  recommendations: BudgetRecommendation[];
  forecastedAt: number;
}

export interface BudgetRecommendation {
  tier: string;
  action: 'prune' | 'compress' | 'migrate' | 'expand' | 'none';
  urgency: 'immediate' | 'soon' | 'planned' | 'none';
  description: string;
  estimatedRecovery: number; // items that could be freed
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAPACITY LIMITS (from architecture docs)
// ═══════════════════════════════════════════════════════════════════════════════

const TIER_LIMITS: Record<string, number> = {
  hot: 500,
  warm: 10000,
  cold: 10000,
  glacier: 50000,
};

/** Warning threshold (% of capacity) */
const WARNING_THRESHOLD = 0.7;
/** Critical threshold */
const CRITICAL_THRESHOLD = 0.9;

/** EMA smoothing for rate calculations */
const RATE_ALPHA = 0.3;

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

interface TierTracker {
  currentCount: number;
  ingestionHistory: Array<{ count: number; timestamp: number }>;
  pruneHistory: Array<{ count: number; timestamp: number }>;
  smoothedIngestionRate: number;
  smoothedPruneRate: number;
}

class BudgetForecastEngine {
  private trackers = new Map<string, TierTracker>();
  private maxHistory = 100;

  constructor() {
    // Initialize trackers for all tiers
    for (const tier of Object.keys(TIER_LIMITS)) {
      this.trackers.set(tier, {
        currentCount: 0,
        ingestionHistory: [],
        pruneHistory: [],
        smoothedIngestionRate: 0,
        smoothedPruneRate: 0,
      });
    }
  }

  /**
   * Record an ingestion event (new memory stored in a tier).
   */
  recordIngestion(tier: string, count: number = 1): void {
    const tracker = this.getTracker(tier);
    tracker.currentCount += count;
    tracker.ingestionHistory.push({ count, timestamp: Date.now() });
    if (tracker.ingestionHistory.length > this.maxHistory) {
      tracker.ingestionHistory = tracker.ingestionHistory.slice(-this.maxHistory);
    }
    this.updateRates(tracker);
  }

  /**
   * Record a pruning/deletion event.
   */
  recordPrune(tier: string, count: number = 1): void {
    const tracker = this.getTracker(tier);
    tracker.currentCount = Math.max(0, tracker.currentCount - count);
    tracker.pruneHistory.push({ count, timestamp: Date.now() });
    if (tracker.pruneHistory.length > this.maxHistory) {
      tracker.pruneHistory = tracker.pruneHistory.slice(-this.maxHistory);
    }
    this.updateRates(tracker);
  }

  /**
   * Set the current count for a tier (sync from actual DB count).
   */
  syncTierCount(tier: string, count: number): void {
    const tracker = this.getTracker(tier);
    tracker.currentCount = count;
  }

  /**
   * Generate a full budget forecast.
   */
  forecast(): BudgetForecast {
    const tiers: TierCapacity[] = [];
    let nextCriticalTier: string | null = null;
    let nextCriticalHours = Infinity;

    for (const [tier, limit] of Object.entries(TIER_LIMITS)) {
      const tracker = this.getTracker(tier);
      const utilization = tracker.currentCount / limit;
      const netGrowth = tracker.smoothedIngestionRate - tracker.smoothedPruneRate;
      const remaining = limit - tracker.currentCount;
      const hoursToFull = netGrowth > 0 ? remaining / netGrowth : Infinity;

      let status: TierCapacity['status'] = 'healthy';
      if (utilization >= 1) status = 'full';
      else if (utilization >= CRITICAL_THRESHOLD) status = 'critical';
      else if (utilization >= WARNING_THRESHOLD) status = 'warning';

      tiers.push({
        tier,
        current: tracker.currentCount,
        max: limit,
        utilizationPct: utilization * 100,
        ingestionRate: tracker.smoothedIngestionRate,
        pruneRate: tracker.smoothedPruneRate,
        netGrowthRate: netGrowth,
        hoursToFull: isFinite(hoursToFull) ? hoursToFull : -1,
        status,
      });

      if (hoursToFull < nextCriticalHours && hoursToFull > 0) {
        nextCriticalHours = hoursToFull;
        nextCriticalTier = tier;
      }
    }

    const recommendations = this.generateRecommendations(tiers);
    const overallHealth = tiers.reduce((s, t) => s + (1 - t.utilizationPct / 100), 0) / tiers.length * 100;

    return {
      tiers,
      overallHealthPct: Math.round(overallHealth),
      nextCriticalTier: isFinite(nextCriticalHours) ? nextCriticalTier : null,
      nextCriticalHours: isFinite(nextCriticalHours) ? Math.round(nextCriticalHours) : null,
      recommendations,
      forecastedAt: Date.now(),
    };
  }

  /**
   * Generate actionable recommendations.
   */
  private generateRecommendations(tiers: TierCapacity[]): BudgetRecommendation[] {
    const recs: BudgetRecommendation[] = [];

    for (const tier of tiers) {
      if (tier.status === 'full') {
        recs.push({
          tier: tier.tier,
          action: 'prune',
          urgency: 'immediate',
          description: `${tier.tier} tier is FULL (${tier.current}/${tier.max}). Immediate pruning required.`,
          estimatedRecovery: Math.round(tier.max * 0.2),
        });
      } else if (tier.status === 'critical') {
        const action = tier.tier === 'hot' ? 'migrate' : 'compress';
        recs.push({
          tier: tier.tier,
          action,
          urgency: 'soon',
          description: `${tier.tier} tier at ${tier.utilizationPct.toFixed(0)}% capacity. ${action === 'migrate' ? 'Migrate low-value to warm' : 'Compress and deduplicate'}.`,
          estimatedRecovery: Math.round(tier.max * 0.15),
        });
      } else if (tier.status === 'warning') {
        recs.push({
          tier: tier.tier,
          action: 'compress',
          urgency: 'planned',
          description: `${tier.tier} tier approaching capacity (${tier.utilizationPct.toFixed(0)}%). Plan maintenance.`,
          estimatedRecovery: Math.round(tier.max * 0.1),
        });
      } else if (tier.hoursToFull > 0 && tier.hoursToFull < 168) {
        // Will be full within a week
        recs.push({
          tier: tier.tier,
          action: 'prune',
          urgency: 'planned',
          description: `${tier.tier} tier projected full in ${Math.round(tier.hoursToFull)}h at current growth rate.`,
          estimatedRecovery: Math.round(tier.max * 0.1),
        });
      }
    }

    return recs.sort((a, b) => {
      const urgencyOrder = { immediate: 0, soon: 1, planned: 2, none: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  /**
   * Update EMA-smoothed rates from history.
   */
  private updateRates(tracker: TierTracker): void {
    const hourMs = 3600000;
    const now = Date.now();
    const cutoff = now - hourMs * 24; // Look at last 24 hours

    const recentIngestions = tracker.ingestionHistory.filter(h => h.timestamp > cutoff);
    const recentPrunes = tracker.pruneHistory.filter(h => h.timestamp > cutoff);

    const totalIngested = recentIngestions.reduce((s, h) => s + h.count, 0);
    const totalPruned = recentPrunes.reduce((s, h) => s + h.count, 0);

    const hours = Math.max(1, (now - cutoff) / hourMs);
    const rawIngestionRate = totalIngested / hours;
    const rawPruneRate = totalPruned / hours;

    tracker.smoothedIngestionRate = RATE_ALPHA * rawIngestionRate + (1 - RATE_ALPHA) * tracker.smoothedIngestionRate;
    tracker.smoothedPruneRate = RATE_ALPHA * rawPruneRate + (1 - RATE_ALPHA) * tracker.smoothedPruneRate;
  }

  private getTracker(tier: string): TierTracker {
    if (!this.trackers.has(tier)) {
      this.trackers.set(tier, {
        currentCount: 0,
        ingestionHistory: [],
        pruneHistory: [],
        smoothedIngestionRate: 0,
        smoothedPruneRate: 0,
      });
    }
    return this.trackers.get(tier)!;
  }

  clear(): void {
    for (const tracker of this.trackers.values()) {
      tracker.currentCount = 0;
      tracker.ingestionHistory = [];
      tracker.pruneHistory = [];
      tracker.smoothedIngestionRate = 0;
      tracker.smoothedPruneRate = 0;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: BudgetForecastEngine | null = null;

export function getBudgetForecaster(): BudgetForecastEngine {
  if (!_engine) _engine = new BudgetForecastEngine();
  return _engine;
}

export function resetBudgetForecaster(): void {
  _engine = null;
}
