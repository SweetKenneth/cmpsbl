/**
 * CMPSBL Substrate Licensing Products Configuration v8.0.0
 * Aligned with Stripe pricing (Feb 2026)
 * 
 * Developer License:
 * - Monthly: $39/month
 * - Annual: $299/year (save ~36%)
 * 
 * Research/Enterprise/Strategic: Contact sales
 */

export const LICENSING_PRODUCTS = {
  developer: {
    monthly: {
      product_id: 'prod_TuzDdndKiASplG',
      price_id: 'price_1Sx9F1Q7FtTiAL4aPvHMDh9r',
      amount: 3900, // $39/month
      interval: 'month' as const,
    },
    annual: {
      product_id: 'prod_TuzDyllhVhku0B',
      price_id: 'price_1Sx9F2Q7FtTiAL4a6vQtPPLe',
      amount: 29900, // $299/year
      interval: 'year' as const,
    },
    name: 'Developer License',
    description: 'For individual developers and small teams building with CMPSBL',
    features: [
      'Full API access to all 14 modules',
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
    amount: null, // Contact sales
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
    checkout_enabled: false, // Contact-based
  },
  research: {
    product_id: null,
    price_id: null,
    amount: null, // Contact sales
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
    checkout_enabled: false, // Contact-based
  },
  enterprise: {
    product_id: null,
    price_id: null,
    amount: null, // Contact sales
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
    checkout_enabled: false, // Contact-based
  },
  strategic: {
    product_id: null,
    price_id: null,
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

export const CONTACT_EMAIL = 'PromptFluid@gmail.com';
export const CONTACT_PHONE = '(214) 548-0883';
