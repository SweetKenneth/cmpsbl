/**
 * Crown Jewel Gate — Strategic Asset Protection
 * v9.3.0 ARCHITECT — Tier Split & Black-Box Enforcement
 * 
 * Architecture Crown Jewels: admin_only, never visible
 * Experience Crown Jewels: black-boxed, tiered (Builder/Pro)
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

/**
 * Get the tier badge for a store item
 */
export function getItemTierBadge(id: string, name: string = ''): ArtifactTierBadge {
  // Architecture jewels: admin-only
  if (isArchitectureCrownJewelExtended(id, name)) return 'CMPSBL CORE';
  
  // Experience jewels: check tier
  if (isExperienceCrownJewel(id)) {
    const tier = getExperienceJewelTier(id);
    if (tier === 'builder') return 'BUILDER';
    if (tier === 'pro') return 'PRO';
    return 'BLACK-BOX';
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
 * Get the upgrade tier label for a gated artifact
 */
export function getUpgradeTierLabel(id: string): string {
  const tier = getExperienceJewelTier(id);
  if (tier === 'builder') return 'Builder ($49/mo)';
  if (tier === 'pro') return 'Pro ($149/mo)';
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
