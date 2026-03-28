/**
 * Tiered Crown Jewel Unlock System
 * Maps Crown Jewels to subscription tiers: Builder → Studio → Creator → Architect → Enterprise
 * 
 * Architecture jewels: NEVER unlocked (admin/governor only)
 * Experience jewels: Unlock progressively per subscription tier
 * Compound jewels: NEVER unlocked (expanded IP guard)
 */

import type { ProductTier } from '@/lib/quarry/types';
import {
  ARCHITECTURE_CROWN_JEWEL_IDS,
  EXPERIENCE_CROWN_JEWEL_IDS,
  EXPERIENCE_TIER_MAP,
  isArchitectureCrownJewel,
  isExperienceCrownJewel,
  getExperienceJewelTier,
} from './crown-jewel-registry';
import { COMPOUND_CROWN_JEWEL_IDS } from './compound-ip-guard';

// ═══════════════════════════════════════════════════════════════════════════════
// TIER HIERARCHY — Numeric ordering for comparison
// ═══════════════════════════════════════════════════════════════════════════════

const TIER_RANK: Record<ProductTier, number> = {
  builder: 0,
  studio: 1,
  creator: 2,
  architect: 3,
  enterprise: 4,
};

/** Normalize legacy tier names to ProductTier */
function normalizeTier(tier: string): ProductTier {
  const map: Record<string, ProductTier> = {
    free: 'builder',
    builder: 'builder',
    studio: 'studio',
    creator: 'creator',
    pro: 'architect',
    architect: 'architect',
    enterprise: 'enterprise',
  };
  return map[tier.toLowerCase()] ?? 'builder';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCESS CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

export interface TieredAccessResult {
  allowed: boolean;
  reason: 'granted' | 'architecture_locked' | 'compound_locked' | 'tier_insufficient' | 'not_a_jewel';
  requiredTier: ProductTier | null;
  userTier: ProductTier;
  upgradeLabel?: string;
}

/**
 * Check if a user's subscription tier grants access to a Crown Jewel.
 * Returns detailed result with upgrade guidance.
 */
export function checkCrownJewelAccess(
  id: string,
  userTier: string
): TieredAccessResult {
  const normalizedTier = normalizeTier(userTier);

  // Architecture jewels — NEVER accessible
  if (isArchitectureCrownJewel(id)) {
    return {
      allowed: false,
      reason: 'architecture_locked',
      requiredTier: null,
      userTier: normalizedTier,
    };
  }

  // Compound jewels — NEVER accessible (expanded IP guard)
  if (COMPOUND_CROWN_JEWEL_IDS.has(id)) {
    return {
      allowed: false,
      reason: 'compound_locked',
      requiredTier: null,
      userTier: normalizedTier,
    };
  }

  // Experience jewels — tier-gated
  if (isExperienceCrownJewel(id)) {
    const rawTier = getExperienceJewelTier(id);
    const requiredTier = rawTier ? normalizeTier(rawTier) : 'architect';
    const userRank = TIER_RANK[normalizedTier];
    const requiredRank = TIER_RANK[requiredTier];

    if (userRank >= requiredRank) {
      return {
        allowed: true,
        reason: 'granted',
        requiredTier,
        userTier: normalizedTier,
      };
    }

    return {
      allowed: false,
      reason: 'tier_insufficient',
      requiredTier,
      userTier: normalizedTier,
      upgradeLabel: getTierUpgradeLabel(requiredTier),
    };
  }

  // Not a jewel — always accessible
  return {
    allowed: true,
    reason: 'not_a_jewel',
    requiredTier: null,
    userTier: normalizedTier,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface TierJewelCounts {
  builder: number;
  studio: number;
  creator: number;
  architect: number;
  enterprise: number;
  architecture: number;
  compound: number;
  total: number;
}

/** Count how many Experience jewels unlock at each tier */
export function getJewelCountsByTier(): TierJewelCounts {
  const counts: TierJewelCounts = {
    builder: 0,
    studio: 0,
    creator: 0,
    architect: 0,
    enterprise: 0,
    architecture: ARCHITECTURE_CROWN_JEWEL_IDS.size,
    compound: COMPOUND_CROWN_JEWEL_IDS.size,
    total: 0,
  };

  for (const id of EXPERIENCE_CROWN_JEWEL_IDS) {
    if (COMPOUND_CROWN_JEWEL_IDS.has(id)) continue; // counted separately
    const rawTier = EXPERIENCE_TIER_MAP[id];
    const tier = rawTier ? normalizeTier(rawTier) : 'architect';
    counts[tier]++;
  }

  counts.total =
    counts.builder + counts.studio + counts.creator +
    counts.architect + counts.enterprise +
    counts.architecture + counts.compound;

  return counts;
}

/** Get all jewel IDs accessible at a given tier (cumulative) */
export function getAccessibleJewelIds(userTier: string): string[] {
  const normalizedTier = normalizeTier(userTier);
  const userRank = TIER_RANK[normalizedTier];
  const result: string[] = [];

  for (const id of EXPERIENCE_CROWN_JEWEL_IDS) {
    if (COMPOUND_CROWN_JEWEL_IDS.has(id)) continue;
    const rawTier = EXPERIENCE_TIER_MAP[id];
    const requiredTier = rawTier ? normalizeTier(rawTier) : 'architect';
    if (userRank >= TIER_RANK[requiredTier]) {
      result.push(id);
    }
  }

  return result.sort();
}

/** Get jewel IDs that would unlock at the next tier up */
export function getNextTierUnlocks(userTier: string): { nextTier: ProductTier; unlocks: string[] } | null {
  const normalizedTier = normalizeTier(userTier);
  const currentRank = TIER_RANK[normalizedTier];

  const tiers: ProductTier[] = ['builder', 'studio', 'creator', 'architect', 'enterprise'];
  const nextTier = tiers.find(t => TIER_RANK[t] === currentRank + 1);
  if (!nextTier) return null;

  const unlocks: string[] = [];
  for (const id of EXPERIENCE_CROWN_JEWEL_IDS) {
    if (COMPOUND_CROWN_JEWEL_IDS.has(id)) continue;
    const rawTier = EXPERIENCE_TIER_MAP[id];
    const requiredTier = rawTier ? normalizeTier(rawTier) : 'architect';
    if (TIER_RANK[requiredTier] === currentRank + 1) {
      unlocks.push(id);
    }
  }

  return { nextTier, unlocks: unlocks.sort() };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const TIER_LABELS: Record<ProductTier, string> = {
  builder: 'Builder (Included)',
  studio: 'Studio ($29/mo)',
  creator: 'Creator ($49/mo)',
  architect: 'Architect ($79/mo)',
  enterprise: 'Enterprise (Custom)',
};

function getTierUpgradeLabel(tier: ProductTier): string {
  return TIER_LABELS[tier] ?? 'Architect ($79/mo)';
}

export { normalizeTier, TIER_RANK, TIER_LABELS };
