/**
 * CMPSBL Unified Pricing Configuration v7.0.0
 * Market-aligned pricing based on competitor research (Jan 2026)
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
    amount: 1900, // $19 (was $27)
    label: 'Starter',
    difficulty: 'beginner',
    hoursValue: '2-4 hours saved',
  },
  advanced: {
    amount: 4900, // $49 (was $87)
    label: 'Advanced', 
    difficulty: 'intermediate',
    hoursValue: '8-16 hours saved',
  },
  premium: {
    amount: 7900, // $79 (was $147-$299)
    label: 'Premium',
    difficulty: 'premium',
    hoursValue: '16-32 hours saved',
  },
  elite: {
    amount: 9900, // $99 (was $399)
    label: 'Elite',
    difficulty: 'elite',
    hoursValue: '32-48 hours saved',
  },
  pro: {
    amount: 14900, // $149 (was $499)
    label: 'Pro',
    difficulty: 'pro',
    hoursValue: '48-64+ hours saved',
  },
} as const;

// ============================================
// BUNDLE PRICING (25-30% discount)
// Volume packs for common use cases
// ============================================
export const BUNDLE_PRICING = {
  starter_pack: {
    amount: 4900, // $49 (5 templates, ~$10 each)
    templateCount: 5,
    savings: 30,
    name: 'Starter Pack',
  },
  drift_essentials: {
    amount: 14900, // $149 (5 core drift prevention templates)
    templateCount: 5,
    savings: 30,
    name: 'Drift Prevention Essentials',
  },
  business_complete: {
    amount: 19900, // $199 (10 business templates)
    templateCount: 10,
    savings: 35,
    name: 'Business AI Complete',
  },
} as const;

// ============================================
// STACK PRICING (Outcome-based recipes)
// Developer outcome recipes with 25% discount
// ============================================
export const STACK_PRICING = {
  chatbot_production: {
    amount: 19900, // $199
    name: 'Production Chatbot Stack',
    outcome: 'Deploy self-healing chatbot in 2 hours',
    discount: 25,
  },
  support_agent: {
    amount: 24900, // $249
    name: 'Customer Support Stack',
    outcome: 'AI support that remembers every customer',
    discount: 25,
  },
  learning_platform: {
    amount: 29900, // $299
    name: 'AI Learning Platform Stack',
    outcome: 'AI that improves overnight via dream cycles',
    discount: 30,
  },
  enterprise_security: {
    amount: 24900, // $249
    name: 'Enterprise Security Stack',
    outcome: 'Military-grade AI security in production',
    discount: 25,
  },
} as const;

// ============================================
// AGENCY LICENSING (Recurring)
// Competitive with Zapier/Make ($20-$150/mo)
// ============================================
export const AGENCY_PRICING = {
  starter: {
    monthly: 4900, // $49/mo (was $199)
    annual: 44100, // $441/yr (25% off)
    clients: 5,
    templates: 10,
    support: 'email',
    updates: '6 months',
    name: 'Agency Starter',
  },
  professional: {
    monthly: 9900, // $99/mo (was $499)
    annual: 89100, // $891/yr (25% off)
    clients: 25,
    templates: 30,
    support: 'priority',
    updates: '12 months',
    name: 'Agency Professional',
  },
  enterprise: {
    monthly: 24900, // $249/mo (was $1,499)
    annual: 224100, // $2,241/yr (25% off)
    clients: 'unlimited',
    templates: 'all',
    support: 'dedicated',
    updates: '24 months',
    name: 'Agency Enterprise',
  },
} as const;

// ============================================
// STUDIO LICENSING (World Engine)
// Category-creating, no direct competitors
// ============================================
export const STUDIO_PRICING = {
  professional: {
    monthly: 19900, // $199/mo (was $999)
    annual: 179100, // $1,791/yr (25% off)
    name: 'Studio Professional',
    includes: [
      'World Engine Core',
      'NPC Memory System',
      'Dream Cycles',
      'Persistent World State',
      'Physics Integration',
      'BYOK Routing',
    ],
  },
  enterprise: {
    monthly: 49900, // $499/mo (was $2,499)
    annual: 449100, // $4,491/yr (25% off)
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
// Competitive with enterprise AI platforms
// ============================================
export const SUBSTRATE_LICENSING = {
  developer: {
    amount: 299900, // $2,999/yr (was $15,000)
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
    amount: 999900, // $9,999/yr (new tier)
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
    amount: 1999900, // $19,999/yr (was $80,000)
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
    checkout_enabled: true, // Now available via checkout
  },
  enterprise: {
    amount: 4999900, // $49,999/yr (was $180,000)
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
    checkout_enabled: false, // Contact-based
  },
  strategic: {
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
// Competitive with security SaaS ($20-$80/mo)
// ============================================
export const DEFENSE_PRICING = {
  pro: {
    monthly: 1900, // $19/mo
    annual: 14900, // $149/yr (35% off)
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
    monthly: 3900, // $39/mo
    annual: 34900, // $349/yr (25% off)
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
    monthly: 7900, // $79/mo
    annual: 66400, // $664/yr (30% off)
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
// Unique product, gamified pricing
// ============================================
export const GENERATOR_PRICING = {
  single: {
    amount: 2900, // $29 (was $87)
    name: 'Single Generation',
    description: 'Generate one unique template',
    value_range: '$19-$149',
  },
  bundle_3: {
    amount: 6900, // $69 (20% off)
    name: '3-Pack Generation',
    description: 'Generate 3 unique templates',
    value_range: '$57-$447',
  },
  bundle_10: {
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
