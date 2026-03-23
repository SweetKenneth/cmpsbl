/**
 * CMPSBL Unified Pricing Configuration
 * Market-aligned pricing based on competitor research (Jan 2026)
 * All products linked to Stripe for checkout
 * 
 * Competitor Benchmarks:
 * - LangChain/LangSmith: $0-$39/seat/mo
 * - Claude Pro: $17-$25/seat/mo
 * - Zapier/Make/n8n: $20-$150/mo
 * - AI Templates (Envato): $29-$149 one-time
 * - CognitiveView: $2,000-$5,000/yr
 * - Enterprise AI Platforms: $25,000-$75,000/yr
 * 
 * CMPSBL Positioning: Category creator for cognitive AI infrastructure
 */

// ============================================
// TEMPLATE PRICING (One-time purchase)
// Competitive with Envato/CodeCanyon ($29-$149)
// ============================================
export const TEMPLATE_TIERS = {
  starter: {
    amount: 1900, // $19
    label: 'Starter',
    difficulty: 'beginner',
    hoursValue: '2-4 hours saved',
  },
  advanced: {
    amount: 4900, // $49
    label: 'Advanced', 
    difficulty: 'intermediate',
    hoursValue: '8-16 hours saved',
  },
  premium: {
    amount: 9900, // $99
    label: 'Premium',
    difficulty: 'premium',
    hoursValue: '16-32 hours saved',
  },
  elite: {
    amount: 12900, // $129
    label: 'Elite',
    difficulty: 'elite',
    hoursValue: '32-48 hours saved',
  },
  pro: {
    amount: 14900, // $149
    label: 'Pro',
    difficulty: 'pro',
    hoursValue: '48-64+ hours saved',
  },
} as const;

// ============================================
// BUNDLE PRICING (25-30% discount)
// All linked to Stripe for checkout
// ============================================
export const BUNDLE_PRICING = {
  starter_pack: {
    product_id: 'prod_Ttq6mgRnIQyRYl',
    price_id: 'price_1Sw2QOQ7FtTiAL4aqecnRxZd',
    amount: 4900, // $49 (5 templates, ~$10 each)
    templateCount: 5,
    savings: 30,
    name: 'Starter Pack',
  },
  drift_essentials: {
    product_id: 'prod_Ttq6C6Pc3UzhG5',
    price_id: 'price_1Sw2QPQ7FtTiAL4aWWORd7Io',
    amount: 14900, // $149 (5 core drift prevention templates)
    templateCount: 5,
    savings: 30,
    name: 'Drift Prevention Essentials',
  },
  business_complete: {
    product_id: 'prod_Ttq6Ma0M8K5WNo',
    price_id: 'price_1Sw2QQQ7FtTiAL4aNxLFgCml',
    amount: 19900, // $199 (10 business templates)
    templateCount: 10,
    savings: 35,
    name: 'Business AI Complete',
  },
} as const;

// ============================================
// STACK PRICING (Outcome-based recipes)
// All linked to Stripe for checkout
// ============================================
export const STACK_PRICING = {
  chatbot_production: {
    product_id: 'prod_Ttq6PKOU7i4KMZ',
    price_id: 'price_1Sw2QJQ7FtTiAL4auhBYAzPh',
    amount: 19900, // $199
    name: 'Production Chatbot Stack',
    outcome: 'Deploy self-healing chatbot in 2 hours',
    discount: 25,
  },
  support_agent: {
    product_id: 'prod_Ttq6wdKtmktTsc',
    price_id: 'price_1Sw2QKQ7FtTiAL4as7CuLl18',
    amount: 24900, // $249
    name: 'Customer Support Stack',
    outcome: 'AI support that remembers every customer',
    discount: 25,
  },
  learning_platform: {
    product_id: 'prod_Ttq6CdIUcR3uFd',
    price_id: 'price_1Sw2QLQ7FtTiAL4aGNjU3YJo',
    amount: 29900, // $299
    name: 'AI Learning Platform Stack',
    outcome: 'AI that improves overnight via dream cycles',
    discount: 30,
  },
  enterprise_security: {
    product_id: 'prod_Ttq6nE3M9yNU4T',
    price_id: 'price_1Sw2QMQ7FtTiAL4alJ9foP7i',
    amount: 24900, // $249
    name: 'Enterprise Security Stack',
    outcome: 'Military-grade AI security in production',
    discount: 25,
  },
} as const;

// ============================================
// AGENCY LICENSING (Recurring)
// All linked to Stripe for checkout
// ============================================
export const AGENCY_PRICING = {
  starter: {
    monthly: {
      product_id: 'prod_Ttq68OvKqqvwoJ',
      price_id: 'price_1Sw2Q7Q7FtTiAL4aTGbRQ4qK',
      amount: 4900, // $49/mo
    },
    annual: {
      product_id: 'prod_Ttq6g0IJPMrzN2',
      price_id: 'price_1Sw2Q8Q7FtTiAL4aPbvZisJt',
      amount: 44100, // $441/yr (25% off)
    },
    clients: 5,
    templates: 10,
    support: 'email',
    updates: '6 months',
    name: 'Agency Starter',
  },
  professional: {
    monthly: {
      product_id: 'prod_Ttq6uM4C1vQY9m',
      price_id: 'price_1Sw2Q9Q7FtTiAL4aKCjc8YGQ',
      amount: 9900, // $99/mo
    },
    annual: {
      product_id: 'prod_Ttq6Da02VJJoss',
      price_id: 'price_1Sw2QBQ7FtTiAL4aepXD5inO',
      amount: 89100, // $891/yr (25% off)
    },
    clients: 25,
    templates: 30,
    support: 'priority',
    updates: '12 months',
    name: 'Agency Professional',
  },
  enterprise: {
    monthly: {
      product_id: 'prod_Ttq6hskYfgXBLC',
      price_id: 'price_1Sw2QCQ7FtTiAL4a3ptFf575',
      amount: 24900, // $249/mo
    },
    annual: {
      product_id: 'prod_Ttq6QTRs4TAmx5',
      price_id: 'price_1Sw2QDQ7FtTiAL4a3iszdoU2',
      amount: 224100, // $2,241/yr (25% off)
    },
    clients: 'unlimited',
    templates: 'all',
    support: 'dedicated',
    updates: '24 months',
    name: 'Agency Enterprise',
  },
} as const;

// ============================================
// STUDIO LICENSING (World Engine)
// Uses existing Stripe products
// ============================================
export const STUDIO_PRICING = {
  professional: {
    monthly: {
      product_id: 'prod_TrTXmufNAhslad',
      price_id: 'price_1StkasQ7FtTiAL4azXr89vH5',
      amount: 19900, // $199/mo
    },
    annual: {
      product_id: 'prod_TrTXmufNAhslad',
      price_id: 'price_1StkauQ7FtTiAL4awoJFZ0Ct',
      amount: 179100, // $1,791/yr (25% off)
    },
    name: 'Studio Professional',
    includes: [
      'Cognitive Substrate Core',
      'Persistent Memory System',
      'DREAM Engine Cycles',
      'Persistent World State',
      'NEXUS Organ Routing',
      'BYOK Configuration',
    ],
  },
  enterprise: {
    monthly: {
      product_id: 'prod_TrTYBWq6xYDkq7',
      price_id: 'price_1StkawQ7FtTiAL4aM4CPyVFd',
      amount: 49900, // $499/mo
    },
    annual: {
      product_id: 'prod_TrTYWY8kb9EpJy',
      price_id: 'price_1StkaxQ7FtTiAL4aXeYaVfcx',
      amount: 449100, // $4,491/yr (25% off)
    },
    name: 'Studio Enterprise',
    includes: [
      'Everything in Professional',
      'Multi-Agent Coordination',
      'Entity Systems',
      'White-Label Rights',
      'Custom Integration Support',
      'SLA Guarantee',
    ],
  },
} as const;

// ============================================
// SUBSTRATE LICENSING (Infrastructure)
// All linked to Stripe for checkout
// ============================================
export const SUBSTRATE_LICENSING = {
  developer: {
    product_id: 'prod_Ttq0whvqEE87FV',
    price_id: 'price_1Sw2KuQ7FtTiAL4aMhocFXuv',
    amount: 299900, // $2,999/yr
    interval: 'year' as const,
    name: 'Developer License',
    description: 'For individual developers and small teams',
    features: [
      'Local deployment on your infrastructure',
      'Full runtime + docs + restore pipeline',
      'Internal use only — no redistribution',
      'Single-seat license per purchase',
      'Community forum access',
      '1-year updates included',
    ],
    checkout_enabled: true,
  },
  team: {
    product_id: 'prod_Ttq0wdWQ4OhVuk',
    price_id: 'price_1Sw2KvQ7FtTiAL4a0wR7WWFH',
    amount: 999900, // $9,999/yr
    interval: 'year' as const,
    name: 'Team License',
    description: 'For teams up to 10 developers',
    features: [
      'Everything in Developer',
      'Up to 10 seats included',
      'Priority email support',
      'Shared deployment keys',
      'Team onboarding session',
    ],
    checkout_enabled: true,
  },
  research: {
    product_id: 'prod_Ttq00PbOT1Ou1Q',
    price_id: 'price_1Sw2KxQ7FtTiAL4aUbRt0VoW',
    amount: 1999900, // $19,999/yr
    interval: 'year' as const,
    name: 'Research License',
    description: 'For universities and research labs',
    features: [
      'Full substrate runtime for research',
      'Non-exclusive, non-transferable',
      'Publication rights with attribution',
      'Academic support channel',
      'Research collaboration opportunities',
    ],
    checkout_enabled: true,
  },
  enterprise: {
    product_id: 'prod_Ttq6Zkso5r2axG',
    price_id: 'price_1Sw2QSQ7FtTiAL4auZzswJIF',
    amount: 4999900, // $49,999/yr
    interval: 'year' as const,
    name: 'Enterprise License',
    description: 'For enterprises embedding CMPSBL into products',
    features: [
      'Product and platform embedding rights',
      'Architecture + safety integration support',
      'Performance + observability best practices',
      'Priority support with SLA',
      'Custom deployment assistance',
      'Quarterly roadmap alignment',
    ],
    checkout_enabled: true, // Now available via checkout
  },
  strategic: {
    product_id: null,
    price_id: null,
    amount: null, // Custom pricing
    interval: 'custom' as const,
    name: 'Strategic Partner',
    description: 'For strategic partners, cloud providers, autonomy',
    features: [
      'Field or region-specific exclusivity options',
      'OEM / platform integration rights',
      'Roadmap alignment and co-authored validation',
      'Custom terms and partnership structure',
      'Direct engineering access',
    ],
    checkout_enabled: false, // Contact-based
  },
} as const;

// ============================================
// DEFENSE/SECURITY PRODUCTS
// Linked to existing Stripe products
// ============================================
export const DEFENSE_PRICING = {
  pro: {
    monthly: {
      product_id: 'prod_Ttq0hn2IK2Avy4',
      price_id: 'price_1Sw2KmQ7FtTiAL4aMZqtgKvU',
      amount: 1900, // $19/mo
    },
    annual: {
      product_id: 'prod_Ttq0Z9FBCQTfUU',
      price_id: 'price_1Sw2KnQ7FtTiAL4a6muJlQaU',
      amount: 14900, // $149/yr (35% off)
    },
    name: 'Defense Pro',
    features: [
      'Bot detection (10k requests/mo)',
      'Threat scoring',
      'IP reputation tracking',
      'API access',
      'Email support',
    ],
  },
  complete: {
    monthly: {
      product_id: 'prod_Ttq038ZizZZ6AM',
      price_id: 'price_1Sw2KoQ7FtTiAL4awHMK987t',
      amount: 3900, // $39/mo
    },
    annual: {
      product_id: 'prod_Ttq0apABjobPWl',
      price_id: 'price_1Sw2KpQ7FtTiAL4asO8qeJof',
      amount: 34900, // $349/yr (25% off)
    },
    name: 'Defense Complete',
    features: [
      'Unlimited bot detection',
      'WAF protection',
      'Malware scanning',
      'File integrity monitoring',
      'Login security',
      'Priority support',
    ],
  },
  sentinel: {
    monthly: {
      product_id: 'prod_Ttq0S8wJPKyVON',
      price_id: 'price_1Sw2KrQ7FtTiAL4aYVhCnyvR',
      amount: 7900, // $79/mo
    },
    annual: {
      product_id: 'prod_Ttq0kPPGuRuWTD',
      price_id: 'price_1Sw2KsQ7FtTiAL4aDBSHOPKh',
      amount: 66400, // $664/yr (30% off)
    },
    name: 'Defense Sentinel',
    features: [
      'Everything in Complete',
      'WCAG compliance scanning',
      'Auto-fix accessibility issues',
      'Advanced analytics',
      'Dedicated support',
      'Custom rules',
    ],
  },
} as const;

// ============================================
// AI TEMPLATE GENERATOR
// All linked to Stripe for checkout
// ============================================
export const GENERATOR_PRICING = {
  single: {
    product_id: 'prod_Ttq6WWQh89kf4m',
    price_id: 'price_1Sw2QFQ7FtTiAL4aetwxKKZr',
    amount: 2900, // $29
    name: 'Single Generation',
    description: 'Generate one unique template',
    value_range: '$19-$149',
  },
  bundle_3: {
    product_id: 'prod_Ttq657EGj7Gzty',
    price_id: 'price_1Sw2QGQ7FtTiAL4awswNUJxu',
    amount: 6900, // $69 (20% off)
    name: '3-Pack Generation',
    description: 'Generate 3 unique templates',
    value_range: '$57-$447',
  },
  bundle_10: {
    product_id: 'prod_Ttq61GtF8grMIY',
    price_id: 'price_1Sw2QHQ7FtTiAL4aBKZBzSB9',
    amount: 19900, // $199 (30% off)
    name: '10-Pack Generation',
    description: 'Generate 10 unique templates',
    value_range: '$190-$1,490',
  },
} as const;

// ============================================
// CONTACT INFO
// ============================================
export const CONTACT_INFO = {
  email: 'licensing@cmpsbl.ai',
  sales: 'sales@cmpsbl.ai',
  support: 'support@cmpsbl.ai',
  phone: '(214) 548-0883',
} as const;

// ============================================
// HELPERS
// ============================================
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export function formatMonthlyPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}/mo`;
}

export function formatAnnualPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US')}/yr`;
}

export function calculateAnnualSavings(monthly: number, annual: number): number {
  return (monthly * 12) - annual;
}

export function calculateSavingsPercent(monthly: number, annual: number): number {
  const monthlyTotal = monthly * 12;
  const savings = monthlyTotal - annual;
  return Math.round((savings / monthlyTotal) * 100);
}

// Trial configuration
export const TRIAL_DAYS = 7; // Increased from 3 to be more competitive
