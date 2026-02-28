/**
 * Memory Tiering Optimization — Bounded Curriculum Module
 * 
 * Teaches and enforces tiered memory storage strategies across the substrate.
 * Hot/warm/cold data classification, automatic promotion/demotion,
 * and cost-optimized retention policies.
 * 
 * Part of the EVOLUTION overlay's bounded curriculum advancement.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type MemoryTier = 'hot' | 'warm' | 'cold' | 'archive';

export type TierMaturity = 'absent' | 'partial' | 'implemented' | 'verified' | 'optimized';

export interface TierPolicy {
  tier: MemoryTier;
  name: string;
  description: string;
  max_age_hours: number;        // data older than this gets demoted
  access_frequency_threshold: number; // accesses/hour to stay in tier
  maturity: TierMaturity;
  entries_count: number;
  avg_access_latency_ms: number;
  cost_weight: number;          // relative cost multiplier (hot=1.0, archive=0.05)
}

export interface TieringAuditResult {
  timestamp: string;
  tiers: TierPolicy[];
  overall_score: number;        // 0-100
  maturity_level: 'nascent' | 'developing' | 'mature' | 'optimized';
  gaps: TieringGap[];
  recommendations: TieringRecommendation[];
  cost_estimate: {
    current_monthly_relative: number;
    optimized_monthly_relative: number;
    savings_pct: number;
  };
}

export interface TieringGap {
  tier: MemoryTier;
  module: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

export interface TieringRecommendation {
  priority: number;
  title: string;
  description: string;
  affected_modules: string[];
  estimated_impact: string;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT TIER POLICIES
// ═══════════════════════════════════════════════════════════════

const DEFAULT_TIERS: TierPolicy[] = [
  {
    tier: 'hot',
    name: 'Hot Tier — Active Working Set',
    description: 'Frequently accessed data: active scan results, current session state, recent findings. In-memory Maps and runtime caches.',
    max_age_hours: 1,
    access_frequency_threshold: 10,
    maturity: 'absent',
    entries_count: 0,
    avg_access_latency_ms: 0.1,
    cost_weight: 1.0,
  },
  {
    tier: 'warm',
    name: 'Warm Tier — Recent Reference Data',
    description: 'Recently used but not actively queried: past scan diffs, resolved findings, recent evolution deltas. LocalStorage or indexed DB.',
    max_age_hours: 24,
    access_frequency_threshold: 1,
    maturity: 'absent',
    entries_count: 0,
    avg_access_latency_ms: 5,
    cost_weight: 0.3,
  },
  {
    tier: 'cold',
    name: 'Cold Tier — Historical Reference',
    description: 'Infrequently accessed: old scan reports, audit trail archives, completed evolution receipts. Database-backed with lazy loading.',
    max_age_hours: 168, // 1 week
    access_frequency_threshold: 0.01,
    maturity: 'absent',
    entries_count: 0,
    avg_access_latency_ms: 50,
    cost_weight: 0.1,
  },
  {
    tier: 'archive',
    name: 'Archive Tier — Compliance & Forensics',
    description: 'Retained for compliance: governance receipts, snapshot metadata, entropy ledger history. Compressed, rarely accessed.',
    max_age_hours: 8760, // 1 year
    access_frequency_threshold: 0,
    maturity: 'absent',
    entries_count: 0,
    avg_access_latency_ms: 200,
    cost_weight: 0.05,
  },
];

// ═══════════════════════════════════════════════════════════════
// AUDIT ENGINE — Introspects substrate memory usage
// ═══════════════════════════════════════════════════════════════

const MEMORY_MODULES = [
  'MEMORY', 'BRAIN', 'CORTEX', 'VISION', 'DREAM',
  'SCAN_CACHE', 'FINDING_PERSISTENCE', 'NOVELTY_WINDOW',
  'AUDIT_LEDGER', 'EVOLUTION_RECEIPTS', 'ENTROPY_LEDGER',
];

interface ModuleMemoryProfile {
  module: string;
  estimated_entries: number;
  access_pattern: 'hot' | 'warm' | 'cold' | 'mixed';
  current_tier: MemoryTier | 'none';
  recommended_tier: MemoryTier;
  has_ttl: boolean;
  has_eviction: boolean;
  has_promotion_logic: boolean;
}

function profileModule(module: string): ModuleMemoryProfile {
  // Introspect known modules for their memory behavior
  const profiles: Record<string, Partial<ModuleMemoryProfile>> = {
    MEMORY: { access_pattern: 'hot', current_tier: 'hot', has_ttl: false, has_eviction: false },
    BRAIN: { access_pattern: 'warm', current_tier: 'none', has_ttl: false, has_eviction: false },
    CORTEX: { access_pattern: 'warm', current_tier: 'none', has_ttl: false, has_eviction: false },
    VISION: { access_pattern: 'cold', current_tier: 'none', has_ttl: false, has_eviction: false },
    DREAM: { access_pattern: 'cold', current_tier: 'none', has_ttl: false, has_eviction: false },
    SCAN_CACHE: { access_pattern: 'hot', current_tier: 'hot', has_ttl: true, has_eviction: true },
    FINDING_PERSISTENCE: { access_pattern: 'warm', current_tier: 'none', has_ttl: false, has_eviction: false },
    NOVELTY_WINDOW: { access_pattern: 'warm', current_tier: 'warm', has_ttl: true, has_eviction: true },
    AUDIT_LEDGER: { access_pattern: 'cold', current_tier: 'none', has_ttl: false, has_eviction: false },
    EVOLUTION_RECEIPTS: { access_pattern: 'cold', current_tier: 'none', has_ttl: false, has_eviction: false },
    ENTROPY_LEDGER: { access_pattern: 'cold', current_tier: 'none', has_ttl: false, has_eviction: false },
  };

  const p = profiles[module] ?? {};
  const accessPattern = p.access_pattern ?? 'mixed';
  const recommendedTier: MemoryTier =
    accessPattern === 'hot' ? 'hot' :
    accessPattern === 'warm' ? 'warm' :
    accessPattern === 'cold' ? 'cold' : 'warm';

  return {
    module,
    estimated_entries: 0,
    access_pattern: accessPattern,
    current_tier: p.current_tier ?? 'none',
    recommended_tier: recommendedTier,
    has_ttl: p.has_ttl ?? false,
    has_eviction: p.has_eviction ?? false,
    has_promotion_logic: false,
  };
}

/**
 * Audit memory tiering coverage across the substrate.
 */
export function auditMemoryTiering(): TieringAuditResult {
  const profiles = MEMORY_MODULES.map(profileModule);
  const gaps: TieringGap[] = [];
  const recommendations: TieringRecommendation[] = [];

  // Clone default tiers
  const tiers = DEFAULT_TIERS.map(t => ({ ...t }));

  // Score each tier's maturity based on module coverage
  for (const tier of tiers) {
    const modulesInTier = profiles.filter(p => p.current_tier === tier.tier);
    const modulesNeeding = profiles.filter(p => p.recommended_tier === tier.tier);

    tier.entries_count = modulesInTier.length;

    if (modulesNeeding.length === 0) {
      tier.maturity = 'implemented'; // no modules need this tier
    } else if (modulesInTier.length === 0) {
      tier.maturity = 'absent';
    } else if (modulesInTier.length < modulesNeeding.length) {
      tier.maturity = 'partial';
    } else {
      // Check if modules have TTL + eviction
      const allHaveTtl = modulesInTier.every(m => m.has_ttl);
      const allHaveEviction = modulesInTier.every(m => m.has_eviction);
      tier.maturity = allHaveTtl && allHaveEviction ? 'verified' : 'implemented';
    }
  }

  // Detect gaps
  for (const profile of profiles) {
    if (profile.current_tier === 'none') {
      gaps.push({
        tier: profile.recommended_tier,
        module: profile.module,
        severity: profile.access_pattern === 'hot' ? 'high' : 'medium',
        description: `${profile.module} has no explicit tier assignment — data lifecycle unmanaged.`,
        recommendation: `Assign ${profile.module} to ${profile.recommended_tier} tier with appropriate TTL and eviction policy.`,
      });
    } else if (profile.current_tier !== profile.recommended_tier) {
      gaps.push({
        tier: profile.recommended_tier,
        module: profile.module,
        severity: 'low',
        description: `${profile.module} is in ${profile.current_tier} tier but access pattern suggests ${profile.recommended_tier}.`,
        recommendation: `Consider migrating ${profile.module} to ${profile.recommended_tier} tier for cost/performance optimization.`,
      });
    }

    if (!profile.has_ttl && profile.access_pattern !== 'hot') {
      gaps.push({
        tier: profile.recommended_tier,
        module: profile.module,
        severity: 'medium',
        description: `${profile.module} lacks TTL — data accumulates without bounds.`,
        recommendation: `Add TTL-based expiration to ${profile.module} data store.`,
      });
    }
  }

  // Generate recommendations
  const untieredModules = profiles.filter(p => p.current_tier === 'none');
  if (untieredModules.length > 0) {
    recommendations.push({
      priority: 1,
      title: 'Assign tier policies to unmanaged modules',
      description: `${untieredModules.length} module(s) lack explicit tier assignment. Add tier metadata and lifecycle hooks.`,
      affected_modules: untieredModules.map(m => m.module),
      estimated_impact: `Reduces unbounded memory growth in ${untieredModules.length} module(s).`,
    });
  }

  const noTtlModules = profiles.filter(p => !p.has_ttl && p.access_pattern !== 'hot');
  if (noTtlModules.length > 0) {
    recommendations.push({
      priority: 2,
      title: 'Add TTL-based expiration policies',
      description: `${noTtlModules.length} module(s) store data without TTL — risk of unbounded growth.`,
      affected_modules: noTtlModules.map(m => m.module),
      estimated_impact: 'Prevents memory pressure from stale data accumulation.',
    });
  }

  const noEvictionModules = profiles.filter(p => !p.has_eviction);
  if (noEvictionModules.length > 0) {
    recommendations.push({
      priority: 3,
      title: 'Implement eviction strategies',
      description: `${noEvictionModules.length} module(s) lack eviction logic (LRU, LFU, or size-based).`,
      affected_modules: noEvictionModules.map(m => m.module),
      estimated_impact: 'Caps memory usage under high load via bounded eviction.',
    });
  }

  recommendations.push({
    priority: 4,
    title: 'Add automatic promotion/demotion logic',
    description: 'Data should automatically move between tiers based on access frequency and age.',
    affected_modules: MEMORY_MODULES,
    estimated_impact: 'Optimizes cost-performance ratio by keeping hot data fast and cold data cheap.',
  });

  // Calculate scores
  const tierScores = tiers.map(t => {
    switch (t.maturity) {
      case 'optimized': return 100;
      case 'verified': return 80;
      case 'implemented': return 60;
      case 'partial': return 30;
      case 'absent': return 0;
    }
  });
  const overall_score = Math.round(tierScores.reduce((a, b) => a + b, 0) / tierScores.length);

  const maturity_level: TieringAuditResult['maturity_level'] =
    overall_score >= 90 ? 'optimized' :
    overall_score >= 70 ? 'mature' :
    overall_score >= 40 ? 'developing' : 'nascent';

  // Cost estimate
  const hotModules = profiles.filter(p => p.access_pattern === 'hot').length;
  const warmModules = profiles.filter(p => p.access_pattern === 'warm').length;
  const coldModules = profiles.filter(p => p.access_pattern === 'cold').length;
  const currentCost = MEMORY_MODULES.length * 1.0; // everything at hot cost
  const optimizedCost = hotModules * 1.0 + warmModules * 0.3 + coldModules * 0.1;
  const savingsPct = Math.round((1 - optimizedCost / currentCost) * 100);

  return {
    timestamp: new Date().toISOString(),
    tiers,
    overall_score,
    maturity_level,
    gaps,
    recommendations,
    cost_estimate: {
      current_monthly_relative: currentCost,
      optimized_monthly_relative: Math.round(optimizedCost * 100) / 100,
      savings_pct: savingsPct,
    },
  };
}

/**
 * Enforce that a memory operation respects tier policies.
 * Returns true if the operation should proceed, false if data should be demoted first.
 */
export function shouldPromote(
  currentTier: MemoryTier,
  accessFrequency: number,
  ageHours: number,
): { action: 'keep' | 'promote' | 'demote'; target_tier: MemoryTier; reason: string } {
  const tiers = DEFAULT_TIERS;
  const current = tiers.find(t => t.tier === currentTier)!;
  const tierIndex = tiers.indexOf(current);

  // Check if data should be promoted (accessed more than threshold for current tier)
  if (tierIndex > 0) {
    const higherTier = tiers[tierIndex - 1];
    if (accessFrequency >= higherTier.access_frequency_threshold && ageHours <= higherTier.max_age_hours) {
      return { action: 'promote', target_tier: higherTier.tier, reason: `Access frequency ${accessFrequency}/hr exceeds ${higherTier.tier} threshold` };
    }
  }

  // Check if data should be demoted (too old or too infrequently accessed)
  if (tierIndex < tiers.length - 1) {
    if (ageHours > current.max_age_hours || accessFrequency < current.access_frequency_threshold) {
      const lowerTier = tiers[tierIndex + 1];
      return { action: 'demote', target_tier: lowerTier.tier, reason: `Age ${ageHours}h exceeds ${current.tier} max (${current.max_age_hours}h) or access frequency below threshold` };
    }
  }

  return { action: 'keep', target_tier: currentTier, reason: 'Data fits current tier criteria' };
}
