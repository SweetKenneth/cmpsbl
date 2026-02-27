/**
 * Capabilities Depot — Stripe Recursive Self-Improvement
 * Correct $299 price IDs for all public items
 * 
 * RULE: Only capabilities that generate/compile their own code are off-menu
 * Learning, optimization, and analysis capabilities are FOR SALE
 */

import type { CapabilityStripeConfig } from './stripe-config';

// Recursive capabilities — Only code compilation is off-menu
export const RECURSIVE_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 👑 APEX TIER — Recursive Code Compilation — OFF-MENU (Crown Jewels)
  // Software that writes/compiles its own code
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-self-optimization-core': {
    productId: 'prod_TuB0P1v6HRgyQk',
    priceId: 'price_1SwMeWQ7FtTiAL4ackyGFUOx',
    priceUsd: 299,
    offMenu: true, // Core self-optimizing code compiler — Licensed on request
  },

  'recursive-architecture-refactorer': {
    productId: 'prod_TuB0qw5cowOIxj',
    priceId: 'price_1SwMeZQ7FtTiAL4aVuWqiAvO',
    priceUsd: 299,
    offMenu: true, // Self-modifying architecture code — Licensed on request
  },

  'recursive-cognitive-bootstrapping': {
    productId: 'prod_TuB0Tzj2abQE7G',
    priceId: 'price_1SwMeaQ7FtTiAL4a2bYDTkSm',
    priceUsd: 299,
    offMenu: true, // Cognitive code bootstrapping — Licensed on request
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 ENTERPRISE — Learning & Analysis — FOR SALE ($199-$299)
  // These LEARN but don't compile their own code
  // NEW PRICE IDs — Correct $299/$199 amounts
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-meta-learning-accelerator': {
    productId: 'prod_TuzWIwQXo9MY1L',
    priceId: 'price_1Sx9XwQ7FtTiAL4aPZOrtZmx',
    priceUsd: 299, // FOR SALE - Meta-learning (not code gen)
  },

  'recursive-self-healing-mesh': {
    productId: 'prod_TuzWdcYn4CPTBm',
    priceId: 'price_1Sx9XvQ7FtTiAL4aegq9sqrA',
    priceUsd: 299, // FOR SALE - Self-healing (runtime, not code)
  },

  'recursive-infinite-context': {
    productId: 'prod_TuzXpGnq8jFm1s',
    priceId: 'price_1Sx9XxQ7FtTiAL4ahaQga1P5',
    priceUsd: 299, // FOR SALE - Context management
  },

  'recursive-capability-discoverer': {
    productId: 'prod_TuzXVhADV9zHbe',
    priceId: 'price_1Sx9XyQ7FtTiAL4adUZxZlxO',
    priceUsd: 299, // FOR SALE - Capability analysis
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 PLATFORM — Optimization & Knowledge — FOR SALE ($149-$199)
  // NEW PRICE IDs — Correct $199 amounts
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-prompt-optimizer': {
    productId: 'prod_TuzXWKn5ZwEbPW',
    priceId: 'price_1Sx9XyQ7FtTiAL4aBkBxXp0A',
    priceUsd: 199, // FOR SALE - Prompt optimization
  },

  'recursive-knowledge-crystallization': {
    productId: 'prod_TuzXP4FdaS5hhW',
    priceId: 'price_1Sx9XzQ7FtTiAL4a0h4H4blZ',
    priceUsd: 199, // FOR SALE - Knowledge extraction
  },

  'recursive-goal-optimizer': {
    productId: 'prod_TuzXg2uQ5Nmj8z',
    priceId: 'price_1Sx9Y0Q7FtTiAL4a4glo8bR4',
    priceUsd: 199, // FOR SALE - Goal optimization
  },
};

// Get recursive config
export function getRecursiveStripeConfig(capabilityId: string): CapabilityStripeConfig | undefined {
  return RECURSIVE_STRIPE_CONFIG[capabilityId];
}

// Check if capability is recursive
export function hasRecursiveStripeConfig(capabilityId: string): boolean {
  return capabilityId in RECURSIVE_STRIPE_CONFIG;
}

// Check if capability is apex tier (code compilation - off-menu)
export function isApexTierCapability(capabilityId: string): boolean {
  return [
    'recursive-self-optimization-core',
    'recursive-architecture-refactorer',
    'recursive-cognitive-bootstrapping',
  ].includes(capabilityId);
}

// Get all recursive configs for display
export function getAllRecursiveStripeConfigs(): Record<string, CapabilityStripeConfig> {
  return RECURSIVE_STRIPE_CONFIG;
}

// Only code compilation capabilities are off-menu
export function isRecursiveOffMenu(capabilityId: string): boolean {
  const config = RECURSIVE_STRIPE_CONFIG[capabilityId];
  return config?.offMenu === true;
}
