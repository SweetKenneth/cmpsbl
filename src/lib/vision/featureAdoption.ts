/**
 * CMPSBL® VISION — Feature Adoption Heatmap
 * Tracks capability-level adoption rates to identify underutilized features.
 */

export interface FeatureUsage {
  feature: string;
  category: string;
  totalUses: number;
  uniqueUsers: Set<string>;
  firstUsed: string;
  lastUsed: string;
  avgSessionDepth: number; // how deep into a session before feature is used
  conversionRate: number; // % of sessions that use this feature
}

export interface AdoptionHeatmap {
  features: Array<{
    feature: string;
    category: string;
    adoptionRate: number; // 0-100
    totalUses: number;
    uniqueUserCount: number;
    heat: 'cold' | 'cool' | 'warm' | 'hot';
    trend: 'rising' | 'stable' | 'falling';
  }>;
  totalTrackedUsers: number;
  underutilized: string[];
  timestamp: string;
}

// Bounded store
const MAX_FEATURES = 500;
const featureUsage = new Map<string, FeatureUsage>();
const totalTrackedUsers = new Set<string>();
const recentUsageCounts = new Map<string, number[]>(); // last 7 windows

/**
 * Record a feature use
 */
export function recordFeatureUse(
  feature: string,
  userId: string,
  category: string = 'general',
  sessionDepth: number = 0
): void {
  totalTrackedUsers.add(userId);

  const existing = featureUsage.get(feature);
  const now = new Date().toISOString();

  if (existing) {
    existing.totalUses++;
    existing.uniqueUsers.add(userId);
    existing.lastUsed = now;
    existing.avgSessionDepth = existing.avgSessionDepth + 0.1 * (sessionDepth - existing.avgSessionDepth);
  } else {
    if (featureUsage.size >= MAX_FEATURES) {
      // Evict least-used feature
      let leastKey = '';
      let leastUses = Infinity;
      for (const [k, v] of featureUsage) {
        if (v.totalUses < leastUses) { leastUses = v.totalUses; leastKey = k; }
      }
      if (leastKey) featureUsage.delete(leastKey);
    }

    featureUsage.set(feature, {
      feature,
      category,
      totalUses: 1,
      uniqueUsers: new Set([userId]),
      firstUsed: now,
      lastUsed: now,
      avgSessionDepth: sessionDepth,
      conversionRate: 0,
    });
  }

  // Track for trend detection
  const counts = recentUsageCounts.get(feature) || [];
  if (counts.length === 0) counts.push(0);
  counts[counts.length - 1]++;
  recentUsageCounts.set(feature, counts);
}

/**
 * Advance trend window (call periodically, e.g., hourly)
 */
export function advanceTrendWindow(): void {
  for (const [feature, counts] of recentUsageCounts) {
    counts.push(0);
    if (counts.length > 7) counts.shift();
    recentUsageCounts.set(feature, counts);
  }
}

/**
 * Generate adoption heatmap
 */
export function generateHeatmap(): AdoptionHeatmap {
  const totalUsers = Math.max(1, totalTrackedUsers.size);
  const features: AdoptionHeatmap['features'] = [];
  const underutilized: string[] = [];

  for (const [, usage] of featureUsage) {
    const adoptionRate = Math.round((usage.uniqueUsers.size / totalUsers) * 100);

    // Heat classification
    let heat: 'cold' | 'cool' | 'warm' | 'hot';
    if (adoptionRate >= 60) heat = 'hot';
    else if (adoptionRate >= 30) heat = 'warm';
    else if (adoptionRate >= 10) heat = 'cool';
    else heat = 'cold';

    // Trend from recent windows
    const counts = recentUsageCounts.get(usage.feature) || [];
    let trend: 'rising' | 'stable' | 'falling' = 'stable';
    if (counts.length >= 3) {
      const early = counts.slice(0, Math.floor(counts.length / 2)).reduce((a, b) => a + b, 0);
      const late = counts.slice(Math.floor(counts.length / 2)).reduce((a, b) => a + b, 0);
      if (late > early * 1.3) trend = 'rising';
      else if (late < early * 0.7) trend = 'falling';
    }

    if (heat === 'cold' || heat === 'cool') underutilized.push(usage.feature);

    features.push({
      feature: usage.feature,
      category: usage.category,
      adoptionRate,
      totalUses: usage.totalUses,
      uniqueUserCount: usage.uniqueUsers.size,
      heat,
      trend,
    });
  }

  features.sort((a, b) => b.adoptionRate - a.adoptionRate);

  return {
    features,
    totalTrackedUsers: totalUsers,
    underutilized,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get adoption rate for a specific feature
 */
export function getFeatureAdoption(feature: string): number {
  const usage = featureUsage.get(feature);
  if (!usage) return 0;
  return Math.round((usage.uniqueUsers.size / Math.max(1, totalTrackedUsers.size)) * 100);
}
