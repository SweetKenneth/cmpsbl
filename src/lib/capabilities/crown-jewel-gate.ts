/**
 * Crown Jewel Gate — Strategic Asset Protection
 * v9.3.0 ARCHITECT — Tier Split, Black-Box Enforcement & Category Gating
 * 
 * Architecture Crown Jewels: admin_only, never visible
 * Experience Crown Jewels: black-boxed, tiered (Builder/Pro)
 * Category/Difficulty Gating: World Engine → PRO, Elite → PRO, Premium → BUILDER
 * S-Tier Capabilities: PRO minimum
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

export type ArtifactTierBadge = 'FREE' | 'BUILDER' | 'PRO' | 'BLACK-BOX' | 'CMPSBL CORE';

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
 * World Engine templates — ALL gated to PRO minimum.
 * These contain proprietary simulation, ECS, and physics code.
 */
function isWorldEngineItem(id: string, name: string = ''): boolean {
  const combined = `${id} ${name}`.toLowerCase();
  return combined.includes('world-engine') || combined.includes('world_engine');
}

/**
 * S-Tier capabilities — PRO minimum.
 * Flagship enterprise-grade synergy pipelines.
 */
function isSTierItem(id: string): boolean {
  return id.startsWith('stier-');
}

/**
 * Difficulty-based tier mapping for templates.
 * - elite → PRO (highest non-crown-jewel value)
 * - premium → BUILDER (substantial value, upgrade incentive)
 * - pro → BUILDER
 * - advanced → FREE (entry point, creates upgrade desire)
 * - intermediate → FREE
 * - beginner → FREE
 */
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'premium' | 'elite' | 'pro' | 'expert';

const DIFFICULTY_TIER_MAP: Record<DifficultyLevel, ArtifactTierBadge> = {
  beginner: 'FREE',
  intermediate: 'FREE',
  advanced: 'FREE',
  premium: 'BUILDER',
  pro: 'BUILDER',
  elite: 'PRO',
  expert: 'PRO',
};

/**
 * Get the tier badge for a store item.
 * Priority: Architecture > Experience > World Engine > S-Tier > Difficulty > FREE
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
    if (tier === 'builder') return 'BUILDER';
    if (tier === 'pro') return 'PRO';
    return 'BLACK-BOX';
  }
  
  // 3. World Engine — ALL PRO (too valuable for free)
  if (isWorldEngineItem(id, name) || category === 'world_engine') return 'PRO';
  
  // 4. S-Tier capabilities — PRO minimum
  if (isSTierItem(id)) return 'PRO';
  
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
  userTier: 'starter' | 'builder' | 'pro' | 'enterprise'
): boolean {
  if (!isExperienceCrownJewel(id)) return true; // Not a jewel, allow
  
  const requiredTier = getExperienceJewelTier(id);
  if (!requiredTier) return false;
  
  const tierOrder = { starter: 0, builder: 1, pro: 2, enterprise: 3 };
  return tierOrder[userTier] >= tierOrder[requiredTier];
}

/**
 * Check if user can access a tiered item based on its badge
 */
export function canAccessTieredItem(
  badge: ArtifactTierBadge,
  userTier: 'starter' | 'builder' | 'pro' | 'enterprise'
): boolean {
  const badgeToMinTier: Record<ArtifactTierBadge, number> = {
    'FREE': 0,
    'BUILDER': 1,
    'PRO': 2,
    'BLACK-BOX': 2,
    'CMPSBL CORE': 99, // admin only
  };
  const tierOrder = { starter: 0, builder: 1, pro: 2, enterprise: 3 };
  return tierOrder[userTier] >= badgeToMinTier[badge];
}

/**
 * Get the upgrade tier label for a gated artifact
 */
export function getUpgradeTierLabel(id: string, name: string = '', difficulty?: string, category?: string): string {
  // Check experience jewels first
  const jewelTier = getExperienceJewelTier(id);
  if (jewelTier === 'builder') return 'Creator ($49/mo)';
  if (jewelTier === 'pro') return 'Architect ($149/mo)';
  
  // Check category/difficulty badge
  const badge = getItemTierBadge(id, name, difficulty, category);
  if (badge === 'BUILDER') return 'Creator ($49/mo)';
  if (badge === 'PRO') return 'Architect ($149/mo)';
  if (badge === 'CMPSBL CORE') return 'CMPSBL Internal';
  
  return 'Enterprise';
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
