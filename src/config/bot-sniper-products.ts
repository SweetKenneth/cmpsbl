/**
 * RCKBL (Rockable) Stripe Product Configuration
 */

export const RCKBL_PRODUCTS = {
  base: {
    monthly: {
      price_id: 'price_1SOMBzQ7FtTiAL4aGf0eVISx', // Update after Stripe product creation
      product_id: 'prod_TL2GWmbIXRKePm',
      amount: 900,
      interval: 'month' as const,
      features: [
        '10,000 requests per month',
        'Real-time bot detection',
        'Threat scoring & classification',
        'IP reputation tracking',
        'API access',
        'Email support'
      ]
    }
  },
  full_suite: {
    monthly: {
      price_id: 'price_1SOM96Q7FtTiAL4aYbLYDXDV',
      product_id: 'prod_TL2DLZvV10hql4',
      amount: 3900,
      interval: 'month' as const,
      promo_first_month: 100, // $1 first month
      features: [
        'Unlimited bot detection requests',
        'Everything in RCKBL Base',
        'WAF (Web Application Firewall)',
        'Malware scanning & removal',
        'File integrity monitoring',
        'Login security & brute force protection',
        'WCAG compliance scanning',
        'Auto-fix accessibility issues',
        'Priority support',
        'Advanced analytics'
      ]
    }
  }
} as const;

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
