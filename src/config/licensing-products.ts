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
    product_id: 'prod_Ttq0whvqEE87FV',
    price_id: 'price_1Sw2KuQ7FtTiAL4aMhocFXuv',
    amount: 299900, // $2,999/year
    interval: 'year' as const,
    name: 'Developer License',
    description: 'For individual developers and small teams building with CMPSBL',
    features: [
      'Full API access to all 14 modules',
      'Unlimited API calls (fair use)',
      'Unlimited memory storage',
      'Email support + documentation',
      'Community forum access',
      '1-year updates included',
    ],
    checkout_enabled: true,
  },
  team: {
    product_id: 'prod_Ttq0wdWQ4OhVuk',
    price_id: 'price_1Sw2KvQ7FtTiAL4a0wR7WWFH',
    amount: 999900, // $9,999/year
    interval: 'year' as const,
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
    checkout_enabled: true,
  },
  research: {
    product_id: 'prod_Ttq00PbOT1Ou1Q',
    price_id: 'price_1Sw2KxQ7FtTiAL4aUbRt0VoW',
    amount: 1999900, // $19,999/year
    interval: 'year' as const,
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
    checkout_enabled: false, // Contact-based for high-value licenses
  },
  enterprise: {
    product_id: 'prod_Ttq6Zkso5r2axG',
    price_id: 'price_1Sw2QSQ7FtTiAL4auZzswJIF',
    amount: 4999900, // $49,999/year
    interval: 'year' as const,
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
    checkout_enabled: false, // Contact-based for high-value licenses
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
