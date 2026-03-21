/**
 * Engine Subscription Stripe Product Configuration
 * Builder ($0) | Studio ($29/mo) | Creator ($49/mo) | Architect ($79/mo)
 */

export const ENGINE_SUBSCRIPTION_PRODUCTS = {
  studio: {
    monthly: {
      price_id: 'price_1T5VsXQ7FtTiAL4aj5FIIVCu',
      product_id: 'prod_U3d8z2sorSG4sI',
      amount: 2900, // $29/mo
      interval: 'month' as const
    },
    annual: {
      price_id: 'price_1T5VsgQ7FtTiAL4ahx89OgVH',
      product_id: 'prod_U3d84gNyBRQgeu',
      amount: 27600, // $276/yr (save 20%)
      interval: 'year' as const,
      savings: 7200 // $72 savings
    }
  },
  creator: {
    monthly: {
      price_id: 'price_1T6lnoQ7FtTiAL4aOoMJtK9z',
      product_id: 'prod_U4vfFrx4XIT6Ah',
      amount: 4900, // $49/mo
      interval: 'month' as const
    },
    annual: {
      price_id: 'price_1T6lnxQ7FtTiAL4a3N9AvKcG',
      product_id: 'prod_U4vfNOl4dHkmld',
      amount: 47040, // $470.40/yr (save 20%)
      interval: 'year' as const,
      savings: 11760 // $117.60 savings
    }
  },
  architect: {
    monthly: {
      price_id: 'price_1T5VsZQ7FtTiAL4aCNAQYuY3',
      product_id: 'prod_U3d8XbUwCGrcfO',
      amount: 7900, // $79/mo
      interval: 'month' as const
    },
    annual: {
      price_id: 'price_1T5VshQ7FtTiAL4a2cWVOSVU',
      product_id: 'prod_U3d8M0yNFGpGTw',
      amount: 75600, // $756/yr (save 20%)
      interval: 'year' as const,
      savings: 19200 // $192 savings
    }
  },
} as const;

export type EngineSubscriptionTier = keyof typeof ENGINE_SUBSCRIPTION_PRODUCTS;

export function getEngineProductInfo(
  tier: EngineSubscriptionTier, 
  interval: 'monthly' | 'annual' = 'monthly'
) {
  const tierData = ENGINE_SUBSCRIPTION_PRODUCTS[tier];
  return interval === 'annual' ? tierData.annual : tierData.monthly;
}

export function getEnginePriceId(
  tier: EngineSubscriptionTier,
  interval: 'monthly' | 'annual' = 'monthly'
): string {
  return getEngineProductInfo(tier, interval).price_id;
}

// Map Stripe product IDs to tiers for subscription lookup
export const PRODUCT_TO_TIER_MAP: Record<string, EngineSubscriptionTier> = {
  // Studio ($29/mo)
  'prod_U3d8z2sorSG4sI': 'studio',
  'prod_U3d84gNyBRQgeu': 'studio',
  // Creator ($49/mo)
  'prod_U4vfFrx4XIT6Ah': 'creator',
  'prod_U4vfNOl4dHkmld': 'creator',
  // Architect ($79/mo)
  'prod_U3d8XbUwCGrcfO': 'architect',
  'prod_U3d8M0yNFGpGTw': 'architect',
};
