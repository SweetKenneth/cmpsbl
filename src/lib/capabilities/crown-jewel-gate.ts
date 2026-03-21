/**
 * Crown Jewel Gate — Strategic Asset Protection
 * Tier Split, Black-Box Enforcement & Category Gating
 * 
 * Architecture Crown Jewels: admin_only, never visible
 * Experience Crown Jewels: black-boxed, tiered (Creator/Architect)
 * Category/Difficulty Gating: Substrate → ARCHITECT, Elite → ARCHITECT, Premium → CREATOR
 * S-Tier Capabilities: ARCHITECT minimum
 */

import { 
  isCrownJewel, 
  isCrownJewelExtended,
  isArchitectureCrownJewel,
  isArchitectureCrownJewelExtended,
  isExperienceCrownJewel,
  getExperienceJewelTier,
  CROWN_JEWEL_IDS,
  ARCHITECTURE_CROWN_JEWEL_IDS,
  EXPERIENCE_CROWN_JEWEL_IDS,
  type CrownJewelClassification,
} from './crown-jewel-registry';

export type ArtifactTierBadge = 'FREE' | 'CREATOR' | 'ARCHITECT' | 'BLACK-BOX' | 'CMPSBL CORE';

/** User subscription tiers */
export type UserTier = 'free' | 'creator' | 'architect' | 'enterprise';

/** Check if an item is an Architecture Crown Jewel (hidden from all non-admins) */
export function isArchitectureJewelItem(id: string, name: string = ''): boolean {
  return isArchitectureCrownJewelExtended(id, name);
}

/** Check if an item is an Experience Crown Jewel (visible but sealed/black-boxed) */
export function isExperienceJewelItem(id: string): boolean {
  return isExperienceCrownJewel(id);
}

/** Check if a capability ID maps to a Crown Jewel */
export function isCrownJewelCapability(capId: string): boolean {
  return isCrownJewelExtended(capId);
}

/** Check if a template is Crown Jewel */
export function isCrownJewelTemplate(templateId: string, name: string): boolean {
  return isCrownJewelExtended(templateId, name);
}

/** Check if a pipeline is Crown Jewel */
export function isCrownJewelPipeline(pipelineId: string, name: string): boolean {
  return isCrownJewelExtended(pipelineId, name);
}

/** Check if an engine is Crown Jewel */
export function isCrownJewelEngine(engineId: string): boolean {
  return isCrownJewel(engineId);
}

/** Check if a meta-engine is Crown Jewel */
export function isCrownJewelMetaEngine(metaEngineId: string): boolean {
  return isCrownJewel(metaEngineId);
}

/** 
 * Check any item — returns true for ARCHITECTURE jewels only.
 * Experience jewels are now visible in the store (with black-box enforcement).
 * Use this for items that should be completely HIDDEN.
 */
export function isCrownJewelItem(id: string, name: string = ''): boolean {
  return isArchitectureCrownJewelExtended(id, name);
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRATEGIC TIER GATING — Category, Difficulty & S-Tier Enforcement
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Substrate templates — ALL gated to ARCHITECT minimum.
 * These contain proprietary simulation, ECS, and physics code.
 */
function isWorldEngineItem(id: string, name: string = ''): boolean {
  const combined = `${id} ${name}`.toLowerCase();
  return combined.includes('world-engine') || combined.includes('world_engine');
}

/**
 * S-Tier capabilities — ARCHITECT minimum.
 * Flagship enterprise-grade synergy pipelines.
 */
function isSTierItem(id: string): boolean {
  return id.startsWith('stier-');
}

/**
 * Difficulty-based tier mapping for templates.
 * - elite/expert → ARCHITECT (highest non-crown-jewel value)
 * - premium/pro → CREATOR (substantial value, upgrade incentive)
 * - advanced → FREE (entry point, creates upgrade desire)
 * - intermediate → FREE
 * - beginner → FREE
 */
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'premium' | 'elite' | 'pro' | 'expert';

const DIFFICULTY_TIER_MAP: Record<DifficultyLevel, ArtifactTierBadge> = {
  beginner: 'FREE',
  intermediate: 'FREE',
  advanced: 'FREE',
  premium: 'CREATOR',
  pro: 'CREATOR',
  elite: 'ARCHITECT',
  expert: 'ARCHITECT',
};

/**
 * Get the tier badge for a store item.
 * Priority: Architecture > Experience > Substrate > S-Tier > Difficulty > FREE
 */
export function getItemTierBadge(
  id: string, 
  name: string = '', 
  difficulty?: string, 
  category?: string
): ArtifactTierBadge {
  // 1. Architecture jewels: admin-only, hidden
  if (isArchitectureCrownJewelExtended(id, name)) return 'CMPSBL CORE';
  
  // 2. Experience jewels: check tier
  if (isExperienceCrownJewel(id)) {
    const tier = getExperienceJewelTier(id);
    if (tier === 'creator') return 'CREATOR';
    if (tier === 'architect') return 'ARCHITECT';
    return 'BLACK-BOX';
  }
  
  // 3. Substrate — ALL ARCHITECT (too valuable for free)
  if (isWorldEngineItem(id, name) || category === 'world_engine') return 'ARCHITECT';
  
  // 4. S-Tier capabilities — ARCHITECT minimum
  if (isSTierItem(id)) return 'ARCHITECT';
  
  // 5. Difficulty-based gating for templates
  if (difficulty && DIFFICULTY_TIER_MAP[difficulty as DifficultyLevel]) {
    return DIFFICULTY_TIER_MAP[difficulty as DifficultyLevel];
  }
  
  return 'FREE';
}

/**
 * Check if a user can access an experience jewel based on their subscription tier
 */
export function canAccessExperienceJewel(
  id: string, 
  userTier: UserTier
): boolean {
  if (!isExperienceCrownJewel(id)) return true; // Not a jewel, allow
  
  const requiredTier = getExperienceJewelTier(id);
  if (!requiredTier) return false;
  
  const tierOrder: Record<string, number> = { free: 0, creator: 1, builder: 1, architect: 2, pro: 2, enterprise: 3 };
  return (tierOrder[userTier] ?? 0) >= (tierOrder[requiredTier] ?? 0);
}

/**
 * Check if user can access a tiered item based on its badge
 */
export function canAccessTieredItem(
  badge: ArtifactTierBadge,
  userTier: UserTier
): boolean {
  const badgeToMinTier: Record<ArtifactTierBadge, number> = {
    'FREE': 0,
    'CREATOR': 1,
    'ARCHITECT': 2,
    'BLACK-BOX': 2,
    'CMPSBL CORE': 99, // admin only
  };
  const tierOrder: Record<string, number> = { free: 0, creator: 1, architect: 2, enterprise: 3 };
  return (tierOrder[userTier] ?? 0) >= badgeToMinTier[badge];
}

/**
 * Get the upgrade tier label for a gated artifact
 */
export function getUpgradeTierLabel(id: string, name: string = '', difficulty?: string, category?: string): string {
  // Check experience jewels first
  const jewelTier = getExperienceJewelTier(id);
  if (jewelTier === 'creator') return 'Creator ($49/mo)';
  if (jewelTier === 'architect') return 'Architect ($79/mo)';
  
  // Check category/difficulty badge
  const badge = getItemTierBadge(id, name, difficulty, category);
  if (badge === 'CREATOR') return 'Creator ($49/mo)';
  if (badge === 'ARCHITECT') return 'Architect ($79/mo)';
  if (badge === 'CMPSBL CORE') return 'CMPSBL Internal';
  
  return 'Architect ($79/mo)';
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLACK-BOX ENFORCEMENT — UI Action Blocking
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if source code preview should be blocked for this item.
 * Architecture jewels: always blocked (item hidden anyway).
 * Experience jewels: always blocked — sealed runtime only.
 */
export function isSourcePreviewBlocked(id: string, name: string = ''): boolean {
  return isCrownJewelExtended(id, name) || isExperienceCrownJewel(id);
}

/**
 * Check if export/download should be blocked for this item.
 * Architecture jewels: always blocked.
 * Experience jewels: blocked — no artifact cloning.
 */
export function isExportBlocked(id: string, name: string = ''): boolean {
  return isCrownJewelExtended(id, name) || isExperienceCrownJewel(id);
}

/**
 * Check if code copy (clipboard) should be blocked for this item.
 * Architecture jewels: always blocked.
 * Experience jewels: blocked — no source extraction.
 */
export function isCopyBlocked(id: string, name: string = ''): boolean {
  return isCrownJewelExtended(id, name) || isExperienceCrownJewel(id);
}

/**
 * Get a user-friendly message for why an action is blocked.
 */
export function getBlackBoxMessage(id: string, name: string = ''): string {
  if (isArchitectureCrownJewelExtended(id, name)) {
    return 'This architecture artifact is restricted to CMPSBL core. Not available at any tier.';
  }
  if (isExperienceCrownJewel(id)) {
    return 'This artifact is delivered as a sealed runtime. Source code, export, and cloning are disabled to protect proprietary architecture.';
  }
  return '';
}

// Re-export for backward compatibility
export { 
  CROWN_JEWEL_IDS, 
  ARCHITECTURE_CROWN_JEWEL_IDS,
  EXPERIENCE_CROWN_JEWEL_IDS,
  isCrownJewel, 
  isCrownJewelExtended,
  isArchitectureCrownJewel,
  isExperienceCrownJewel,
  getExperienceJewelTier,
};
