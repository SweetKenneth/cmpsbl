/**
 * Engine Subscription Stripe Product Configuration
 * v8.1.0 — OEM Subscription Tiers
 */

export const ENGINE_SUBSCRIPTION_PRODUCTS = {
  builder: {
    monthly: {
      price_id: 'price_1SyLZ9Q7FtTiAL4aDqPdcswv',
      product_id: 'prod_TwE1Eqx3bpZsSy',
      amount: 4900, // $49/mo
      interval: 'month' as const
    },
    annual: {
      price_id: 'price_1SyLZAQ7FtTiAL4aaG77BgYO',
      product_id: 'prod_TwE1VkEdBVaiuR',
      amount: 49000, // $490/yr (~17% savings)
      interval: 'year' as const,
      savings: 9800 // $98 savings
    }
  },
  pro: {
    monthly: {
      price_id: 'price_1SyLZCQ7FtTiAL4a0k9cnn8H',
      product_id: 'prod_TwE1R8rSXH8Hku',
      amount: 14900, // $149/mo
      interval: 'month' as const
    },
    annual: {
      price_id: 'price_1SyLZEQ7FtTiAL4aC0CmBb1w',
      product_id: 'prod_TwE1RRfo82Y15Z',
      amount: 149000, // $1490/yr (~17% savings)
      interval: 'year' as const,
      savings: 29800 // $298 savings
    }
  },
  enterprise: {
    monthly: {
      price_id: 'price_1SyLZFQ7FtTiAL4aN0vumAsj',
      product_id: 'prod_TwE1Ft7HTEDerh',
      amount: 49900, // $499/mo
      interval: 'month' as const
    },
    annual: {
      price_id: 'price_1SyLZGQ7FtTiAL4aT45BNfAA',
      product_id: 'prod_TwE1AiW91BGmM3',
      amount: 499000, // $4990/yr (~17% savings)
      interval: 'year' as const,
      savings: 99800 // $998 savings
    }
  }
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
  // Builder
  'prod_TwE1Eqx3bpZsSy': 'builder',
  'prod_TwE1VkEdBVaiuR': 'builder',
  // Pro
  'prod_TwE1R8rSXH8Hku': 'pro',
  'prod_TwE1RRfo82Y15Z': 'pro',
  // Enterprise
  'prod_TwE1Ft7HTEDerh': 'enterprise',
  'prod_TwE1AiW91BGmM3': 'enterprise',
};
