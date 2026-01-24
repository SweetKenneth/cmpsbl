/**
 * Marketplace Product Configuration
 * Stripe product/price mappings for templates and OS
 */

export const MARKETPLACE_PRODUCTS = {
  // Substrate OS License - $599
  os_license: {
    product_id: 'prod_TqfLiz7157fhrf',
    price_id: 'price_1Ssy0XQ7FtTiAL4aofFs83KJ',
    amount: 59900, // cents
    name: 'Substrate OS License',
    description: 'Full promptfluid® Substrate OS with BYOK support. Includes 5 starter templates.',
    includes: ['Core OS', '5 Starter Templates', 'BYOK Configuration', 'Single-Install License'],
  },
  
  // Template tiers by difficulty
  templates: {
    starter: {
      product_id: 'prod_TqfL0vNB5Dxe0O',
      price_id: 'price_1Ssy0YQ7FtTiAL4aThaDXpb2',
      amount: 900, // $9
      label: 'Starter',
      difficulty: 'beginner',
    },
    advanced: {
      product_id: 'prod_TqfLvaM2kDXxNy',
      price_id: 'price_1Ssy0ZQ7FtTiAL4avFtcmmDo',
      amount: 2900, // $29
      label: 'Advanced',
      difficulty: 'intermediate',
    },
    enterprise: {
      product_id: 'prod_TqfLjff3DWLLgJ',
      price_id: 'price_1Ssy0aQ7FtTiAL4a6B3erH9W',
      amount: 4900, // $49
      label: 'Enterprise',
      difficulty: 'advanced',
    },
    // Premium tier for World Engine and complex templates
    premium: {
      product_id: 'prod_TqfLpremiumWE1',
      price_id: 'price_1Ssy0bQ7FtTiAL4aPremium99',
      amount: 9900, // $99
      label: 'Premium',
      difficulty: 'premium',
    },
    elite: {
      product_id: 'prod_TqfLeliteWE199',
      price_id: 'price_1Ssy0cQ7FtTiAL4aElite199',
      amount: 19900, // $199
      label: 'Elite',
      difficulty: 'elite',
    },
  },
} as const;

// Premium template IDs that cost more
export const PREMIUM_TEMPLATE_IDS = [
  'world-engine-core',
  'world-engine-physics',
  'world-engine-entities',
  'enterprise-rag-pipeline',
  'multi-agent-orchestrator',
  'cognitive-swarm',
];

export const ELITE_TEMPLATE_IDS = [
  'world-engine-complete',
  'enterprise-agency-suite',
  'cognitive-os-starter-kit',
];

// Map difficulty to price tier
export function getTemplatePricing(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'premium' | 'elite', templateId?: string) {
  // Check for premium/elite templates first
  if (templateId) {
    if (ELITE_TEMPLATE_IDS.includes(templateId)) {
      return MARKETPLACE_PRODUCTS.templates.elite;
    }
    if (PREMIUM_TEMPLATE_IDS.includes(templateId)) {
      return MARKETPLACE_PRODUCTS.templates.premium;
    }
  }
  
  switch (difficulty) {
    case 'beginner':
      return MARKETPLACE_PRODUCTS.templates.starter;
    case 'intermediate':
      return MARKETPLACE_PRODUCTS.templates.advanced;
    case 'advanced':
      return MARKETPLACE_PRODUCTS.templates.enterprise;
    case 'premium':
      return MARKETPLACE_PRODUCTS.templates.premium;
    case 'elite':
      return MARKETPLACE_PRODUCTS.templates.elite;
    default:
      return MARKETPLACE_PRODUCTS.templates.starter;
  }
}

// Format price for display
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

// SDK is free messaging
export const SDK_FREE_MESSAGE = "The promptfluid® SDK is 100% free for developers to build on. Templates and OS licenses are sold separately for those who want pre-built solutions or self-hosted deployments.";
