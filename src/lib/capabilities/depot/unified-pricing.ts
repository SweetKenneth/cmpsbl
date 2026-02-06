/**
 * Capabilities Depot — Unified Pricing Resolver v1.0.0
 * 
 * SINGLE SOURCE OF TRUTH for all capability pricing.
 * This module ensures that displayed prices ALWAYS match checkout prices.
 * 
 * RULE: Stripe config prices are authoritative. Registry prices are legacy.
 * When displaying a price, ALWAYS use getUnifiedPrice() to get the correct amount.
 */

import { getStripeConfig, getAllStripeConfigs } from './stripe-config';
import type { CapabilityStripeConfig } from './stripe-config';

/**
 * Get the authoritative price for a capability.
 * This is what should be displayed in the UI and what Stripe will charge.
 */
export function getUnifiedPrice(capabilityId: string): number | null {
  const config = getStripeConfig(capabilityId);
  return config?.priceUsd ?? null;
}

/**
 * Get the price ID for checkout.
 * Returns null if capability doesn't have checkout enabled.
 */
export function getCheckoutPriceId(capabilityId: string): string | null {
  const config = getStripeConfig(capabilityId);
  if (!config) return null;
  if (config.offMenu) return null;
  return config.priceId;
}

/**
 * Check if a capability is available for checkout (not off-menu).
 */
export function isCheckoutAvailable(capabilityId: string): boolean {
  const config = getStripeConfig(capabilityId);
  return config !== undefined && !config.offMenu;
}

/**
 * Get the full Stripe config for a capability.
 */
export function getCapabilityStripeConfig(capabilityId: string): CapabilityStripeConfig | undefined {
  return getStripeConfig(capabilityId);
}

/**
 * Get all capabilities with their unified prices.
 * Returns a map of capability ID → price in USD.
 */
export function getAllUnifiedPrices(): Record<string, number> {
  const configs = getAllStripeConfigs();
  const prices: Record<string, number> = {};
  
  for (const [id, config] of Object.entries(configs)) {
    prices[id] = config.priceUsd;
  }
  
  return prices;
}

/**
 * Format a price for display.
 */
export function formatDisplayPrice(priceUsd: number | null): string {
  if (priceUsd === null) {
    return 'Contact Us';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceUsd);
}

/**
 * Get display info for a capability including price and checkout availability.
 */
export interface CapabilityPricingInfo {
  priceUsd: number;
  displayPrice: string;
  checkoutAvailable: boolean;
  priceId: string | null;
  productId: string | null;
  isOffMenu: boolean;
}

export function getCapabilityPricingInfo(capabilityId: string, fallbackPrice?: number): CapabilityPricingInfo {
  const config = getStripeConfig(capabilityId);
  
  if (config) {
    return {
      priceUsd: config.priceUsd,
      displayPrice: config.offMenu ? 'Licensed on request' : formatDisplayPrice(config.priceUsd),
      checkoutAvailable: !config.offMenu,
      priceId: config.priceId,
      productId: config.productId,
      isOffMenu: config.offMenu ?? false,
    };
  }
  
  // Fallback for capabilities not in Stripe config
  const price = fallbackPrice ?? 0;
  return {
    priceUsd: price,
    displayPrice: price > 0 ? formatDisplayPrice(price) : 'Contact Us',
    checkoutAvailable: false,
    priceId: null,
    productId: null,
    isOffMenu: true,
  };
}

/**
 * PRICE SYNC TABLE
 * This documents the mapping between old registry prices and new unified prices.
 * Used for auditing and ensuring consistency.
 */
export const PRICE_NORMALIZATION_MAP: Record<string, { old: number; new: number; reason: string }> = {
  // Core capabilities
  'cap-cost-optimizer': { old: 499, new: 199, reason: 'Normalized to $299 ceiling' },
  'cap-predictive-healing': { old: 599, new: 199, reason: 'Normalized to $299 ceiling' },
  'cap-chaos-resilience': { old: 799, new: 299, reason: 'Normalized to $299 ceiling' },
  'cap-threat-prediction': { old: 999, new: 299, reason: 'Normalized to $299 ceiling' },
  'cap-compliance-auto': { old: 699, new: 199, reason: 'Normalized to $299 ceiling' },
  'cap-sla-guardian': { old: 249, new: 99, reason: 'Normalized tier' },
  'cap-resource-contention': { old: 349, new: 149, reason: 'Normalized tier' },
  'cap-cognitive-mesh': { old: 2499, new: 299, reason: 'Normalized to $299 ceiling' },
  'cap-capacity-forecast': { old: 149, new: 99, reason: 'Normalized tier' },
  
  // Synergy capabilities
  'syn-smart-recall': { old: 199, new: 149, reason: 'Aligned with tier' },
  'syn-adaptive-routing': { old: 249, new: 99, reason: 'Normalized tier' },
  'syn-graceful-degradation': { old: 299, new: 149, reason: 'Normalized tier' },
  'syn-autonomous-evolution': { old: 399, new: 299, reason: 'Normalized to $299 ceiling' },
  'syn-cognitive-fusion': { old: 349, new: 149, reason: 'Normalized tier' },
  'syn-self-healing': { old: 449, new: 199, reason: 'Normalized to $299 ceiling' },
  'syn-threat-learning': { old: 349, new: 149, reason: 'Normalized tier' },
  'syn-end-to-end-reasoning': { old: 499, new: 299, reason: 'Normalized to $299 ceiling' },
};
