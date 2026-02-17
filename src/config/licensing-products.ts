/**
 * CMPSBL Unified Pricing — v10.0.0
 * 
 * Three tiers. One subscription. Everything included.
 *   Free   → $0     (build real systems, artifact store, memory, composition)
 *   Creator → $49/mo (all 76 engines, 8 meta-engines, templates, SDK, 7 Jewels)
 *   Architect → $149/mo (all 76 engines, 16 meta-engines, CLM, all 28 Jewels, priority)
 *   Enterprise → Custom (source access, SLA, dedicated support)
 *
 * Template Generator remains as a standalone one-time purchase ($29).
 */

export const UNIFIED_TIERS = {
  free: {
    product_id: null,
    price_id: null,
    amount: 0,
    interval: 'month' as const,
    name: 'Free',
    tagline: 'Build real systems at zero cost',
    description: 'Full building capabilities with persistent memory and composition.',
    features: [
      'Artifact Store access',
      '30 core engines',
      '120+ free templates',
      'Persistent memory (bounded)',
      'Composition engine',
      'All executors & runners',
      'Community support',
      'Public documentation',
    ],
    checkout_enabled: false,
  },
  creator: {
    product_id: 'prod_TyP9TVucbprd82',
    price_id: 'price_1T0SLKQ7FtTiAL4aonaF0po1',
    amount: 4900, // $49/month
    interval: 'month' as const,
    name: 'Creator',
    tagline: 'Full substrate access for builders',
    description: 'All 76 engines, 8 meta-engines, templates, SDK/API, and self-improving capabilities.',
    features: [
      'Everything in Free',
      'All 76 base engines',
      '8 meta-engines (standard + operational)',
      '160+ templates (Free + Creator)',
      'All artifacts',
      'Full SDK / API access',
      '7 Experience Crown Jewels',
      'In-run self-improvement',
      'Goal optimization',
      'Dream-assisted creative synthesis',
      'Email + docs support',
    ],
    checkout_enabled: true,
  },
  architect: {
    product_id: 'prod_TyP9U1DMXaHX1S',
    price_id: 'price_1T0SLMQ7FtTiAL4a8QbdCBqR',
    amount: 14900, // $149/month
    interval: 'month' as const,
    name: 'Architect',
    tagline: 'Compound intelligence across projects',
    description: 'CLM, cross-project learning, all 28 Experience Jewels, and priority support.',
    features: [
      'Everything in Creator',
      'All 76 engines + 16 meta-engines',
      '190+ templates (Free + Creator + Architect)',
      'All 28 Experience Crown Jewels',
      'Constant Learning Mode (CLM)',
      'Cross-session learning',
      'Cross-executor learning',
      'Memory optimization',
      'Performance tuning surfaces',
      'Pattern reuse across projects',
      'Team seats (up to 5)',
      'Priority email support',
    ],
    checkout_enabled: true,
  },
  enterprise: {
    product_id: null,
    price_id: null,
    amount: null,
    interval: 'custom' as const,
    name: 'Enterprise',
    tagline: 'Full governance and control',
    description: 'Source code access, SLA, dedicated support, and custom deployment.',
    features: [
      'Everything in Architect',
      'All 76 engines + all 24 meta-engines',
      'All 200+ templates',
      'Source code access',
      'Self-hosted deployment',
      'Unlimited team seats',
      '99.9% SLA guarantee',
      'Dedicated support channel',
      'Custom integration support',
      'Quarterly roadmap alignment',
    ],
    checkout_enabled: false,
  },
} as const;

/** Standalone one-time purchase — kept separate from tier subscriptions */
export const TEMPLATE_GENERATOR = {
  product_id: 'prod_TwSqj6y5PfMkPy',
  amount: 2900, // $29 one-time
  name: 'Template Generator',
  description: 'Generate custom AI templates from natural language. One-time purchase, lifetime access.',
} as const;

// Legacy re-exports for backward compatibility
export const TIER_PRODUCTS = {
  builder: UNIFIED_TIERS.creator,
  pro: UNIFIED_TIERS.architect,
} as const;

export const LICENSING_PRODUCTS = {
  developer: {
    monthly: { product_id: UNIFIED_TIERS.creator.product_id, price_id: UNIFIED_TIERS.creator.price_id, amount: UNIFIED_TIERS.creator.amount, interval: 'month' as const },
    annual: { product_id: UNIFIED_TIERS.creator.product_id, price_id: UNIFIED_TIERS.creator.price_id, amount: UNIFIED_TIERS.creator.amount, interval: 'month' as const },
    name: UNIFIED_TIERS.creator.name,
    description: UNIFIED_TIERS.creator.description,
    features: UNIFIED_TIERS.creator.features,
    checkout_enabled: true,
  },
} as const;

export const CONTACT_EMAIL = 'Dev@CMPSBL.com';
export const CONTACT_PHONE = '(760) FLUID-AI';
