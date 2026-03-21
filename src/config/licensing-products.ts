/**
 * CMPSBL Pricing — Four Tiers
 * 
 * Four tiers. Clean hierarchy. Zero IP leakage.
 *   Builder    → $0/mo   (3 capability slots, full runtime, 30 free templates)
 *   Studio     → $29/mo  (6 capability slots, expanded memory, SDK templates)
 *   Creator    → $49/mo  (9 capability slots, engines, agents, exports)
 *   Architect  → $79/mo  (12 capability slots, governance, evolution, compliance)
 *
 * Core Rule: User projects run ON the CMPSBL Substrate.
 *            User projects never run AS the CMPSBL Substrate.
 */

export const UNIFIED_TIERS = {
  free: {
    product_id: null,
    price_id: null,
    amount: 0,
    interval: 'month' as const,
    name: 'Builder',
    tagline: 'Build real things — zero cost',
    description: 'Core templates, starter capabilities, bounded memory, and shared runtime. Not a trial — a real tier.',
    features: [
      'Capability Store access (Free catalog)',
      'Core templates (starter pack)',
      'Basic capabilities (read + compose)',
      'Limited persistent memory (per-user)',
      'Basic memories & missions',
      'Shared Nexus routing (with quotas)',
      'Dashboard + Terminal (Builder mode)',
      'Community support',
    ],
    checkout_enabled: false,
  },
  studio: {
    product_id: 'prod_TzwJfkmkooYhwU',
    price_id: 'price_1T1wR7Q7FtTiAL4a63bTsEk7',
    amount: 2900, // $29/month
    interval: 'month' as const,
    name: 'Studio',
    tagline: 'More juice for builders shipping products',
    description: 'Expanded catalog, executable capabilities, private memory, light automation — everything in Builder plus real power.',
    features: [
      'Everything in Builder, plus:',
      'Expanded Capability Store (Studio catalog)',
      'More + higher-quality templates',
      'Executable capabilities (run + compose)',
      'Multi-node synergy chains',
      'Stronger persistent memory (bigger limits)',
      'Higher Nexus quotas + better routing',
      'Scheduled tasks + simple automations',
      'Email + docs support',
    ],
    checkout_enabled: true,
  },
  creator: {
    product_id: 'prod_U4vfFrx4XIT6Ah',
    price_id: 'price_1T6lnoQ7FtTiAL4aOoMJtK9z',
    amount: 4900, // $49/month
    interval: 'month' as const,
    name: 'Creator',
    tagline: '9 template packs with expanded depth',
    description: '9 capability slots, expanded memory, template packs, trace exports, and high-priority Nexus routing.',
    features: [
      'Everything in Studio, plus:',
      '9 Capability Slots',
      '9 template packs included',
      'Expanded memory partitions',
      'Trace & audit exports',
      'High-priority Nexus routing',
      'Advanced automation chains',
      'Priority email support',
    ],
    checkout_enabled: true,
  },
  architect: {
    product_id: 'prod_TzwJm6Ji4E3Vca',
    price_id: 'price_1T1wR9Q7FtTiAL4aRHhQwX0m',
    amount: 7900, // $79/month
    interval: 'month' as const,
    name: 'Architect',
    tagline: 'Full control, governance, and deployment sovereignty',
    description: 'Everything in Creator plus 12 capability slots, org workspaces, compliance exports, dedicated memory, SLA-aware controls.',
    features: [
      'Everything in Creator, plus:',
      '12 Capability Slots',
      'Dedicated memory partitions',
      'Full governance authority',
      'Compliance + audit exports',
      'Organization workspaces + roles',
      'SLA-aware Nexus controls',
      'Dedicated support channel',
    ],
    checkout_enabled: true,
  },
} as const;

/** Standalone one-time purchase — kept separate from tier subscriptions */
export const TEMPLATE_GENERATOR = {
  product_id: 'prod_TwSqj6y5PfMkPy',
  amount: 1900, // $19 one-time
  name: 'Template Generator',
  description: 'Generate custom AI templates from natural language. One-time purchase, lifetime access.',
} as const;

// Legacy re-exports for backward compatibility
export const TIER_PRODUCTS = {
  builder: UNIFIED_TIERS.studio,
  pro: UNIFIED_TIERS.architect,
} as const;

export const LICENSING_PRODUCTS = {
  developer: {
    monthly: { product_id: UNIFIED_TIERS.studio.product_id, price_id: UNIFIED_TIERS.studio.price_id, amount: UNIFIED_TIERS.studio.amount, interval: 'month' as const },
    annual: { product_id: UNIFIED_TIERS.studio.product_id, price_id: UNIFIED_TIERS.studio.price_id, amount: UNIFIED_TIERS.studio.amount, interval: 'month' as const },
    name: UNIFIED_TIERS.studio.name,
    description: UNIFIED_TIERS.studio.description,
    features: UNIFIED_TIERS.studio.features,
    checkout_enabled: true,
  },
} as const;

export const CONTACT_EMAIL = 'Dev@CMPSBL.com';
export const CONTACT_PHONE = '(760) FLUID-AI';
