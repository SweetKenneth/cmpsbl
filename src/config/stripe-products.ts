/**
 * CMPSBL Defense (RCKBL) Stripe Product Configuration v7.0.0
 * Market-aligned pricing based on competitor research (Jan 2026)
 * 
 * Competitor Benchmarks:
 * - Cloudflare: $20-$200/mo
 * - Sucuri: $199-$499/yr
 * - Wordfence: $99-$499/yr
 */

export const DEFENSE_PRODUCTS = {
  pro: {
    monthly: {
      price_id: 'price_1SOM93Q7FtTiAL4aKHUZjHCU',
      product_id: 'prod_TL2DYghg32lYzo',
      amount: 1900, // $19/mo (was $19)
      interval: 'month' as const
    },
    annual: {
      price_id: 'price_1SOM94Q7FtTiAL4aIqLLRGkt',
      product_id: 'prod_TL2DyiBcKA6I5D',
      amount: 14900, // $149/yr (35% off)
      interval: 'year' as const,
      savings: 7900 // $79 savings
    }
  },
  complete: {
    monthly: {
      price_id: 'price_1SOM96Q7FtTiAL4aYbLYDXDV',
      product_id: 'prod_TL2DLZvV10hql4',
      amount: 3900, // $39/mo
      interval: 'month' as const
    },
    annual: {
      price_id: 'price_1SOM98Q7FtTiAL4agbuHYcuh',
      product_id: 'prod_TL2DzusHpJombN',
      amount: 34900, // $349/yr (25% off)
      interval: 'year' as const,
      savings: 11900 // $119 savings
    }
  },
  sentinel: {
    monthly: {
      price_id: 'price_1SOM99Q7FtTiAL4aelFhu7Ej',
      product_id: 'prod_TL2DcGTfW7PTYm',
      amount: 7900, // $79/mo
      interval: 'month' as const
    },
    annual: {
      price_id: 'price_1SOMBzQ7FtTiAL4aGf0eVISx',
      product_id: 'prod_TL2GWmbIXRKePm',
      amount: 66400, // $664/yr (30% off)
      interval: 'year' as const,
      savings: 28400 // $284 savings
    }
  }
} as const;

export const CONTACT_INFO = {
  email: 'support@cmpsbl.ai',
  phone: '(214) 548-0883',
  phoneFormatted: '(214) 548-0883',
  website: 'https://cmpsbl.ai'
} as const;

export const TRIAL_DAYS = 7;

// Helper to get product info by tier and interval
export function getProductInfo(tier: 'pro' | 'complete' | 'sentinel', interval: 'monthly' | 'annual' = 'monthly') {
  const tierData = DEFENSE_PRODUCTS[tier];
  return interval === 'annual' && 'annual' in tierData ? tierData.annual : tierData.monthly;
}

// Get all product IDs for a tier
export function getTierProductIds(tier: 'pro' | 'complete' | 'sentinel'): string[] {
  const tierData = DEFENSE_PRODUCTS[tier];
  const ids: string[] = [tierData.monthly.product_id];
  if ('annual' in tierData && tierData.annual) {
    ids.push(tierData.annual.product_id);
  }
  return ids;
}

// Format price for display
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

// Calculate savings percentage
export function calculateSavingsPercentage(tier: 'pro' | 'complete' | 'sentinel'): number {
  const tierData = DEFENSE_PRODUCTS[tier];
  if (!('annual' in tierData)) return 0;
  const monthly = tierData.monthly.amount * 12;
  const annual = tierData.annual.amount;
  return Math.round(((monthly - annual) / monthly) * 100);
}
