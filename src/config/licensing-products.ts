/**
 * CMPSBL Adoptable Pricing — Pricing & Access Patch
 * 
 * Four tiers. Adoptable pricing. Zero IP leakage.
 *   Free     → $0       (build real things, starter artifacts, bounded memory)
 *   Creator  → $9/mo    (expanded catalog, executable capabilities, light automation)
 *   Architect → $19/mo  (premium artifacts, cross-module orchestration, audit views)
 *   Enterprise → $99/mo (org workspaces, compliance, SLA-aware routing, governance)
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
    name: 'Free',
    tagline: 'Build real things — zero cost',
    description: 'Core templates, starter artifacts, bounded memory, and shared runtime. Not a trial — a real tier.',
    features: [
      'Artifact Store access (Free catalog)',
      'Core templates (starter pack)',
      'Basic capabilities (read + compose)',
      'Limited persistent memory (per-user)',
      'Basic pipelines & missions',
      'Shared Nexus routing (with quotas)',
      'Dashboard + Terminal (Free mode)',
      'Community support',
    ],
    checkout_enabled: false,
  },
  creator: {
    product_id: 'prod_TzwJfkmkooYhwU',
    price_id: 'price_1T1wR7Q7FtTiAL4a63bTsEk7',
    amount: 2900, // $29/month
    interval: 'month' as const,
    name: 'Creator',
    tagline: 'More juice for builders shipping products',
    description: 'Expanded catalog, executable capabilities, private memory, light automation — everything in Free plus real power.',
    features: [
      'Everything in Free, plus:',
      'Expanded Artifact Store (Creator catalog)',
      'More + higher-quality templates',
      'Executable capabilities (run + compose)',
      'Multi-module synergy pipelines',
      'Stronger persistent memory (bigger limits)',
      'Higher Nexus quotas + better routing',
      'Scheduled tasks + simple automations',
      'Email + docs support',
    ],
    checkout_enabled: true,
  },
  architect: {
    product_id: 'prod_TzwJtYd5I4rH7j',
    price_id: 'price_1T1wR8Q7FtTiAL4aJ3TYghDH',
    amount: 1900, // $19/month
    interval: 'month' as const,
    name: 'Architect',
    tagline: 'Best value-to-power ratio for serious builders',
    description: 'Premium artifacts, cross-module orchestration, larger memory, batch execution, audit views, and priority routing.',
    features: [
      'Everything in Creator, plus:',
      'Premium Artifact Store (Architect catalog)',
      'Cross-module orchestration (higher complexity)',
      'Larger memory + project memory domains',
      'Higher automation limits + batch execution',
      'Audit views + change summaries',
      'Reasoning summaries',
      'Priority Nexus routing + fallback options',
      'Priority email support',
    ],
    checkout_enabled: true,
  },
  enterprise: {
    product_id: 'prod_TzwJm6Ji4E3Vca',
    price_id: 'price_1T1wR9Q7FtTiAL4aRHhQwX0m',
    amount: 7900, // $79/month
    interval: 'month' as const,
    name: 'Enterprise',
    tagline: 'Governance, control, and reliability for teams',
    description: 'Org workspaces, compliance exports, advanced governance, dedicated memory, and SLA-aware controls.',
    features: [
      'Everything in Architect, plus:',
      'Organization workspaces + roles',
      'Higher execution ceilings',
      'Compliance + audit exports',
      'Advanced governance policies',
      'Dedicated memory partitions',
      'SLA-aware Nexus controls',
      'Provider budget pinning',
      'Dedicated support channel',
    ],
    checkout_enabled: true,
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
