/**
 * CMPSBL Substrate Licensing Products Configuration v7.0.0
 * Market-aligned pricing based on competitor research (Jan 2026)
 * 
 * Competitor Benchmarks:
 * - CognitiveView: $2,000-$5,000/yr per seat
 * - Enterprise AI Platforms: $25,000-$75,000/yr typical
 * - LangChain Enterprise: Custom (est. $15,000-$50,000/yr)
 * 
 * Positioning: Accessible category creator, not premium gatekeeper
 */

export const LICENSING_PRODUCTS = {
  developer: {
    product_id: 'prod_TrlBfjavZnDpP0',
    price_id: 'price_1Su1eoQ7FtTiAL4aqoXJj48x', // Will need new price
    amount: 299900, // $2,999/year (was $15,000)
    interval: 'year' as const,
    name: 'Developer License',
    description: 'For individual developers and small teams building with CMPSBL',
    features: [
      'Local deployment on your own infrastructure',
      'Full runtime + docs + restore pipeline',
      'Internal use only — no redistribution or resale',
      'Single-seat license per purchase',
      'Community forum access',
      '1-year updates included',
    ],
    checkout_enabled: true,
  },
  team: {
    amount: 999900, // $9,999/year (new tier)
    interval: 'year' as const,
    name: 'Team License',
    description: 'For development teams up to 10 seats',
    features: [
      'Everything in Developer License',
      'Up to 10 developer seats included',
      'Priority email support',
      'Shared deployment keys',
      'Team onboarding session (90 min)',
      'Slack/Discord priority channel',
    ],
    checkout_enabled: true,
  },
  research: {
    amount: 1999900, // $19,999/year (was $80,000)
    interval: 'year' as const,
    name: 'Research License',
    description: 'For universities, research labs, and academic institutions',
    features: [
      'Full substrate runtime for internal research',
      'Non-exclusive, non-transferable license',
      'Publication rights with attribution',
      'Support for experimental setups and validation',
      'Academic support channel',
      'Research collaboration opportunities',
    ],
    checkout_enabled: true, // Now available via Stripe checkout
  },
  enterprise: {
    amount: 4999900, // $49,999/year (was $180,000)
    interval: 'year' as const,
    name: 'Enterprise License',
    description: 'For enterprises embedding CMPSBL into products and platforms',
    features: [
      'Product and platform embedding rights',
      'Architecture + safety integration support',
      'Performance + observability best practices',
      'Priority support with SLA options',
      'Custom deployment assistance',
      'Quarterly roadmap alignment calls',
    ],
    checkout_enabled: false, // Contact-based for custom terms
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
      'Direct engineering team access',
      'Co-marketing opportunities',
    ],
    checkout_enabled: false, // Contact-based
  },
} as const;

export const CONTACT_EMAIL = 'licensing@cmpsbl.ai';
export const CONTACT_PHONE = '(214) 548-0883';
