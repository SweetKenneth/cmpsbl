/**
 * Vault & Memory Stream Limits — Per-tier capacity configuration
 * Controls: daily pulls, vault storage, export access, custom pipeline slots
 */
import type { ProductTier } from '@/lib/quarry/types';
import { resolveToProductTier } from './product-limits';

export interface VaultTierConfig {
  pullsPerDay: number;
  vaultCapacity: number; // -1 = unlimited
  exportEnabled: boolean;
  customPipelineSlotsEnabled: boolean;
}

export const VAULT_TIER_LIMITS: Record<ProductTier, VaultTierConfig> = {
  builder: {
    pullsPerDay: 3,
    vaultCapacity: 5,
    exportEnabled: false,
    customPipelineSlotsEnabled: false,
  },
  studio: {
    pullsPerDay: 6,
    vaultCapacity: 25,
    exportEnabled: true,
    customPipelineSlotsEnabled: false,
  },
  creator: {
    pullsPerDay: 9,
    vaultCapacity: 75,
    exportEnabled: true,
    customPipelineSlotsEnabled: true,
  },
  architect: {
    pullsPerDay: 12,
    vaultCapacity: -1,
    exportEnabled: true,
    customPipelineSlotsEnabled: true,
  },
  enterprise: {
    pullsPerDay: 50,
    vaultCapacity: -1,
    exportEnabled: true,
    customPipelineSlotsEnabled: true,
  },
};

/**
 * Get vault limits for a subscription tier string
 */
export function getVaultLimits(subscriptionTier?: string): VaultTierConfig {
  const tier = resolveToProductTier(subscriptionTier);
  return VAULT_TIER_LIMITS[tier];
}

/**
 * Check if vault is at capacity
 */
export function isVaultFull(currentCount: number, subscriptionTier?: string): boolean {
  const limits = getVaultLimits(subscriptionTier);
  if (limits.vaultCapacity === -1) return false; // unlimited
  return currentCount >= limits.vaultCapacity;
}

/**
 * Check if daily pull limit reached
 */
export function isPullLimitReached(pullsToday: number, subscriptionTier?: string): boolean {
  const limits = getVaultLimits(subscriptionTier);
  return pullsToday >= limits.pullsPerDay;
}

/**
 * Format vault capacity for display
 */
export function formatVaultCapacity(subscriptionTier?: string): string {
  const limits = getVaultLimits(subscriptionTier);
  return limits.vaultCapacity === -1 ? 'Unlimited' : `${limits.vaultCapacity}`;
}
