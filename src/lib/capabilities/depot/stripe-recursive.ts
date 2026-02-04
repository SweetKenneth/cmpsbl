/**
 * Capabilities Depot — Stripe Recursive Self-Improvement
 * v3.0.0 — Updated: Only code compilation capabilities are off-menu
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
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-meta-learning-accelerator': {
    productId: 'prod_TuB0pmYh0qsquD',
    priceId: 'price_1SwMeYQ7FtTiAL4aNnweXZDh',
    priceUsd: 299, // FOR SALE - Meta-learning (not code gen)
  },

  'recursive-self-healing-mesh': {
    productId: 'prod_TuB0vxtbuI1Iuv',
    priceId: 'price_1SwMebQ7FtTiAL4aRTFY7atC',
    priceUsd: 299, // FOR SALE - Self-healing (runtime, not code)
  },

  'recursive-infinite-context': {
    productId: 'prod_TuB0aMNiFkp86j',
    priceId: 'price_1SwMedQ7FtTiAL4auaXh4d0F',
    priceUsd: 299, // FOR SALE - Context management
  },

  'recursive-capability-discoverer': {
    productId: 'prod_TuB0lcU7SzU0QM',
    priceId: 'price_1SwMeeQ7FtTiAL4aIlmYdJ7x',
    priceUsd: 299, // FOR SALE - Capability analysis
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 PLATFORM — Optimization & Knowledge — FOR SALE ($149-$299)
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-prompt-optimizer': {
    productId: 'prod_TuB02pWJEguQvO',
    priceId: 'price_1SwMefQ7FtTiAL4ao9Mmso1Y',
    priceUsd: 199, // FOR SALE - Prompt optimization
  },

  'recursive-knowledge-crystallization': {
    productId: 'prod_TuB0gRCB6xGuzT',
    priceId: 'price_1SwMegQ7FtTiAL4arI2lIXl7',
    priceUsd: 199, // FOR SALE - Knowledge extraction
  },

  'recursive-goal-optimizer': {
    productId: 'prod_TuB0Wtkl5apARp',
    priceId: 'price_1SwMeiQ7FtTiAL4aKPUUJRNI',
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
