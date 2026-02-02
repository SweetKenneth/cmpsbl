/**
 * Capabilities Depot — Pricing Model
 * Aligned with template pricing tiers
 * v1.0.0
 */

import type { PricingTier } from './types';

// === Pricing Tier Definitions ===
export interface PricingTierConfig {
  id: PricingTier;
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  color: string;
  badge: string;
}

export const PRICING_TIERS: Record<PricingTier, PricingTierConfig> = {
  utility: {
    id: 'utility',
    name: 'Utility',
    description: 'Essential capabilities for common tasks',
    minPrice: 19,
    maxPrice: 49,
    color: 'emerald',
    badge: 'Starter',
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced',
    description: 'Sophisticated capabilities for complex workflows',
    minPrice: 99,
    maxPrice: 299,
    color: 'cyan',
    badge: 'Pro',
  },
  system: {
    id: 'system',
    name: 'System-Level',
    description: 'Deep integration capabilities for production systems',
    minPrice: 499,
    maxPrice: 999,
    color: 'violet',
    badge: 'Elite',
  },
  flagship: {
    id: 'flagship',
    name: 'Flagship',
    description: 'Enterprise-grade capabilities with maximum value',
    minPrice: 1499,
    maxPrice: 2999,
    color: 'amber',
    badge: 'Enterprise',
  },
};

// === Price Formatting ===
export function formatPrice(priceUsd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceUsd);
}

// === Determine Tier from Price ===
export function getTierFromPrice(priceUsd: number): PricingTier {
  if (priceUsd <= 49) return 'utility';
  if (priceUsd <= 299) return 'advanced';
  if (priceUsd <= 999) return 'system';
  return 'flagship';
}

// === Get Tier Config ===
export function getTierConfig(tier: PricingTier): PricingTierConfig {
  return PRICING_TIERS[tier];
}

// === Price Range Display ===
export function getPriceRangeDisplay(tier: PricingTier): string {
  const config = PRICING_TIERS[tier];
  return `${formatPrice(config.minPrice)} – ${formatPrice(config.maxPrice)}`;
}

// === Value Proposition by Tier ===
export const TIER_VALUE_PROPS: Record<PricingTier, string[]> = {
  utility: [
    'Quick integration',
    'Common use cases',
    'Basic documentation',
    'Standard artifact format',
  ],
  advanced: [
    'Complex workflows',
    'Multiple executor types',
    'Extended documentation',
    'Usage examples included',
  ],
  system: [
    'Deep module integration',
    'Production-ready patterns',
    'Comprehensive docs',
    'Reference implementations',
  ],
  flagship: [
    'Enterprise architecture',
    'Multi-system coordination',
    'Full source access',
    'Architecture guides',
  ],
};

// === Stripe Price ID Mapping (for checkout) ===
// These would be populated from Stripe
export const CAPABILITY_PRICE_IDS: Record<string, string> = {
  // Maps capability slug to Stripe price ID
  // e.g., 'causal-inference': 'price_xxx'
};
