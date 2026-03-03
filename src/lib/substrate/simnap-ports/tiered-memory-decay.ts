/**
 * Tiered Memory Decay & Rebalance — Ported from SimNap
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Hot → Warm → Cold decay pipeline with importance scoring
 * and automatic rebalancing to prevent memory bloat.
 * 
 * Consumers: MEMORY, DREAM, BRAIN, DECODE, ANALYTICS
 * Origin: simnapMemory.ts
 */

// ── Types ─────────────────────────────────────────────────────────

export type MemoryTier = 'hot' | 'warm' | 'cold' | 'archive';

export interface MemoryEntry {
  id: string;
  content: string;
  tier: MemoryTier;
  importance: number;        // 0-1 score
  accessCount: number;
  lastAccessedAt: number;    // timestamp
  createdAt: number;
  decayScore: number;        // computed decay value
  tags: string[];
  source: string;            // originating module
}

export interface TierConfig {
  /** Max entries in this tier */
  capacity: number;
  /** Time before demotion (ms) */
  maxAge: number;
  /** Minimum importance to stay in this tier */
  minImportance: number;
  /** Decay rate per hour (0-1) */
  decayRate: number;
}

export interface RebalanceConfig {
  hot: TierConfig;
  warm: TierConfig;
  cold: TierConfig;
  archive: TierConfig;
}

export interface RebalanceResult {
  promoted: number;
  demoted: number;
  archived: number;
  purged: number;
  duration: number;
  tierCounts: Record<MemoryTier, number>;
}

// ── Default Configuration ─────────────────────────────────────────

export const DEFAULT_REBALANCE_CONFIG: RebalanceConfig = {
  hot: {
    capacity: 200,
    maxAge: 3 * 24 * 60 * 60 * 1000,    // 3 days
    minImportance: 0.85,
    decayRate: 0.02,
  },
  warm: {
    capacity: 1000,
    maxAge: 14 * 24 * 60 * 60 * 1000,   // 14 days
    minImportance: 0.5,
    decayRate: 0.05,
  },
  cold: {
    capacity: 5000,
    maxAge: 90 * 24 * 60 * 60 * 1000,   // 90 days
    minImportance: 0.2,
    decayRate: 0.10,
  },
  archive: {
    capacity: 50000,
    maxAge: Infinity,
    minImportance: 0,
    decayRate: 0.15,
  },
};

// ── Decay Computation ─────────────────────────────────────────────

/**
 * Compute decay score for a memory entry
 * Higher score = more relevant / should stay in higher tier
 */
export function computeDecayScore(entry: MemoryEntry, config: RebalanceConfig): number {
  const now = Date.now();
  const tierConfig = config[entry.tier];
  const ageHours = (now - entry.lastAccessedAt) / (1000 * 60 * 60);
  
  // Exponential time decay
  const timeDecay = Math.exp(-tierConfig.decayRate * ageHours);
  
  // Access frequency boost (logarithmic to prevent gaming)
  const accessBoost = Math.log2(1 + entry.accessCount) / 10;
  
  // Importance is a strong anchor
  const importanceWeight = entry.importance * 0.6;
  
  // Recency boost
  const recencyWeight = timeDecay * 0.3;
  
  // Access pattern weight
  const accessWeight = Math.min(accessBoost, 0.2) * 0.1;
  
  return Math.min(1, importanceWeight + recencyWeight + accessWeight);
}

/**
 * Determine the target tier for an entry based on its decay score
 */
export function targetTier(decayScore: number, config: RebalanceConfig): MemoryTier {
  if (decayScore >= config.hot.minImportance) return 'hot';
  if (decayScore >= config.warm.minImportance) return 'warm';
  if (decayScore >= config.cold.minImportance) return 'cold';
  return 'archive';
}

// ── Rebalancer ────────────────────────────────────────────────────

/**
 * Rebalance a set of memory entries across tiers
 * Returns the modified entries and statistics
 */
export function rebalanceMemory(
  entries: MemoryEntry[],
  config: RebalanceConfig = DEFAULT_REBALANCE_CONFIG
): { entries: MemoryEntry[]; result: RebalanceResult } {
  const start = performance.now();
  let promoted = 0;
  let demoted = 0;
  let archived = 0;
  let purged = 0;

  // Compute fresh decay scores
  const scored = entries.map(entry => ({
    ...entry,
    decayScore: computeDecayScore(entry, config),
  }));

  // Determine new tier assignments
  const reassigned = scored.map(entry => {
    const newTier = targetTier(entry.decayScore, config);
    const tierOrder: MemoryTier[] = ['hot', 'warm', 'cold', 'archive'];
    const oldIdx = tierOrder.indexOf(entry.tier);
    const newIdx = tierOrder.indexOf(newTier);

    if (newIdx < oldIdx) promoted++;
    else if (newIdx > oldIdx) {
      if (newTier === 'archive') archived++;
      else demoted++;
    }

    return { ...entry, tier: newTier };
  });

  // Enforce capacity limits per tier (evict lowest scores first)
  const tiers: MemoryTier[] = ['hot', 'warm', 'cold', 'archive'];
  const result: MemoryEntry[] = [];

  for (const tier of tiers) {
    const tierEntries = reassigned
      .filter(e => e.tier === tier)
      .sort((a, b) => b.decayScore - a.decayScore);

    const cap = config[tier].capacity;
    const kept = tierEntries.slice(0, cap);
    const overflow = tierEntries.slice(cap);

    result.push(...kept);

    // Overflow from archive gets purged, otherwise demoted
    if (tier === 'archive') {
      purged += overflow.length;
    } else {
      const nextTier = tiers[tiers.indexOf(tier) + 1];
      overflow.forEach(e => {
        result.push({ ...e, tier: nextTier });
        demoted++;
      });
    }
  }

  const tierCounts = {
    hot: result.filter(e => e.tier === 'hot').length,
    warm: result.filter(e => e.tier === 'warm').length,
    cold: result.filter(e => e.tier === 'cold').length,
    archive: result.filter(e => e.tier === 'archive').length,
  };

  return {
    entries: result,
    result: {
      promoted,
      demoted,
      archived,
      purged,
      duration: performance.now() - start,
      tierCounts,
    },
  };
}

/**
 * Record an access event — boosts importance and resets decay
 */
export function recordAccess(entry: MemoryEntry, importanceBoost: number = 0.05): MemoryEntry {
  return {
    ...entry,
    accessCount: entry.accessCount + 1,
    lastAccessedAt: Date.now(),
    importance: Math.min(1, entry.importance + importanceBoost),
  };
}

/**
 * Create a new memory entry with defaults
 */
export function createMemoryEntry(
  content: string,
  source: string,
  importance: number = 0.5,
  tags: string[] = []
): MemoryEntry {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    content,
    tier: importance >= 0.85 ? 'hot' : 'warm',
    importance,
    accessCount: 0,
    lastAccessedAt: now,
    createdAt: now,
    decayScore: importance,
    tags,
    source,
  };
}

/**
 * Get tier distribution summary
 */
export function getTierDistribution(entries: MemoryEntry[]): {
  total: number;
  hot: { count: number; avgImportance: number };
  warm: { count: number; avgImportance: number };
  cold: { count: number; avgImportance: number };
  archive: { count: number; avgImportance: number };
} {
  const tiers: MemoryTier[] = ['hot', 'warm', 'cold', 'archive'];
  const dist: any = { total: entries.length };

  for (const tier of tiers) {
    const tierEntries = entries.filter(e => e.tier === tier);
    dist[tier] = {
      count: tierEntries.length,
      avgImportance: tierEntries.length > 0
        ? tierEntries.reduce((s, e) => s + e.importance, 0) / tierEntries.length
        : 0,
    };
  }

  return dist;
}
