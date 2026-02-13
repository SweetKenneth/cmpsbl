/**
 * CMPSBL Substrate Licensing Products Configuration v9.3.0
 * Aligned with Stripe pricing (Feb 2026)
 * 
 * Tier Model:
 * - Free: $0 (full building, no Experience Jewels)
 * - Builder: $49/month (sealed Experience Jewels, in-run SI)
 * - Pro: $149/month (CLM, cross-session, all Experience Jewels)
 * - Developer SDK: $39/month or $299/year
 * - Enterprise: Custom
 */

export const TIER_PRODUCTS = {
  builder: {
    product_id: 'prod_TyObH8wzkQ9myM',
    price_id: 'price_1T0Ro7Q7FtTiAL4as3eV39L9',
    amount: 4900, // $49/month
    interval: 'month' as const,
    name: 'CMPSBL Builder',
    description: 'Self-improving apps with sealed Experience Crown Jewels',
    features: [
      'All Free tier capabilities included',
      '7 sealed Experience Crown Jewels',
      'In-run self-improvement (bounded)',
      'Goal optimization (bounded)',
      'Creative synthesis (dream-assisted)',
      'End-to-end reasoning pipelines (sealed)',
      'Email + docs support',
    ],
    checkout_enabled: true,
  },
  pro: {
    product_id: 'prod_TyObyIgiIa28nD',
    price_id: 'price_1T0Ro9Q7FtTiAL4aOxvDTMGc',
    amount: 14900, // $149/month
    interval: 'month' as const,
    name: 'CMPSBL Pro',
    description: 'Compound intelligence with CLM and cross-project learning',
    features: [
      'Everything in Builder tier',
      'All 28 Experience Crown Jewels',
      'CLM (bounded + governed)',
      'Cross-session learning',
      'Cross-executor learning',
      'Memory optimization',
      'Performance tuning surfaces',
      'Pattern reuse across projects',
      'Priority email support',
    ],
    checkout_enabled: true,
  },
} as const;

export const LICENSING_PRODUCTS = {
  developer: {
    monthly: {
      product_id: 'prod_TwbbSoGvPk62xt',
      price_id: 'price_1SyiOSQ7FtTiAL4a0nLYNaww',
      amount: 3900, // $39/month
      interval: 'month' as const,
    },
    annual: {
      product_id: 'prod_TwbbkEwx63DMli',
      price_id: 'price_1SyiOTQ7FtTiAL4ahfSITWgg',
      amount: 29900, // $299/year
      interval: 'year' as const,
    },
    name: 'Developer License',
    description: 'For individual developers and small teams building with CMPSBL',
    features: [
      'Full API access to all 21 modules',
      'Unlimited API calls (fair use)',
      'Unlimited memory storage',
      'Email support + documentation',
      'Community forum access',
      'Updates included during subscription',
    ],
    checkout_enabled: true,
  },
  team: {
    product_id: null,
    price_id: null,
    amount: null,
    interval: 'custom' as const,
    name: 'Team License',
    description: 'For development teams up to 10 seats',
    features: [
      'Everything in Developer License',
      'Up to 10 developer seats included',
      'Priority email support',
      'API key management dashboard',
      'Team onboarding session (90 min)',
      'Slack/Discord priority channel',
    ],
    checkout_enabled: false,
  },
  research: {
    product_id: null,
    price_id: null,
    amount: null,
    interval: 'custom' as const,
    name: 'Research License',
    description: 'For universities, research labs, and academic institutions',
    features: [
      'Full API access for internal research',
      'Multi-deployment (up to 5 instances)',
      'Publication rights with attribution',
      'Quarterly technical calls',
      'Academic support channel',
      'Early access to new features',
    ],
    checkout_enabled: false,
  },
  enterprise: {
    product_id: null,
    price_id: null,
    amount: null,
    interval: 'custom' as const,
    name: 'Enterprise License',
    description: 'For enterprises embedding CMPSBL into products and platforms',
    features: [
      'Source code access — self-hosted deployment',
      'Unlimited on-premise/air-gapped instances',
      '99.9% SLA guarantee',
      'Dedicated support channel',
      'Custom integration support',
      'Quarterly roadmap alignment calls',
    ],
    checkout_enabled: false,
  },
  strategic: {
    product_id: null,
    price_id: null,
    amount: null,
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
    checkout_enabled: false,
  },
} as const;

export const CONTACT_EMAIL = 'PromptFluid@gmail.com';
export const CONTACT_PHONE = '(214) 548-0883';
