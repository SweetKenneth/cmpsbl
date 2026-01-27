/**
 * CMPSBL Substrate Licensing Products Configuration
 * Developer License is automated via Stripe checkout
 * Research/Enterprise/Strategic are contact-based
 */

export const LICENSING_PRODUCTS = {
  developer: {
    product_id: 'prod_TrlBfjavZnDpP0',
    price_id: 'price_1Su1eoQ7FtTiAL4aqoXJj48x',
    amount: 1500000, // $15,000/year
    interval: 'year' as const,
    name: 'Developer License',
    description: 'Annual license for individual developers and small teams',
    features: [
      'Local deployment on your own infrastructure',
      'Full runtime + docs + restore pipeline',
      'Internal use only — no redistribution or resale',
      'Single-seat license per purchase',
    ],
    checkout_enabled: true,
  },
  research: {
    amount: 8000000, // $80,000/year
    interval: 'year' as const,
    name: 'Research License',
    description: 'For universities, research labs, and institutes',
    features: [
      'Full substrate runtime for internal research',
      'Non-exclusive, non-transferable license',
      'Support for experimental setups and validation',
      'Publication rights with attribution',
    ],
    checkout_enabled: false, // Contact-based
  },
  enterprise: {
    amount: 18000000, // $180,000/year
    interval: 'year' as const,
    name: 'Enterprise License',
    description: 'For enterprises embedding CMPSBL into products and platforms',
    features: [
      'Product and platform embedding rights',
      'Architecture + safety integration support',
      'Performance + observability best practices',
      'Priority support and SLA options',
    ],
    checkout_enabled: false, // Contact-based
  },
  strategic: {
    amount: null, // Custom pricing
    interval: 'custom' as const,
    name: 'Strategic / Exclusive License',
    description: 'For strategic partners, autonomy/robotics, cloud providers',
    features: [
      'Field or region-specific exclusivity options',
      'OEM / platform integration rights',
      'Roadmap alignment and co-authored validation',
      'Custom terms and partnership structure',
    ],
    checkout_enabled: false, // Contact-based
  },
} as const;

export const CONTACT_EMAIL = 'promptfluid@gmail.com';
export const CONTACT_PHONE = '(214) 548-0883';
