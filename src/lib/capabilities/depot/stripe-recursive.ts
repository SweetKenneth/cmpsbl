/**
 * Capabilities Depot — Stripe Recursive Self-Improvement
 * Ultra-premium recursive self-improvement capabilities
 * v1.0.0
 */

import type { CapabilityStripeConfig } from './stripe-config';

// Recursive Self-Improvement capabilities — highest tier pricing
export const RECURSIVE_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 👑 APEX TIER — Recursive Self-Improvement ($5,999 - $6,999)
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-self-optimization-core': {
    productId: 'prod_TuB0P1v6HRgyQk',
    priceId: 'price_1SwMeWQ7FtTiAL4ackyGFUOx',
    priceUsd: 6999,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CROWN-CLASS — Meta-Learning & Architecture ($4,999 - $5,999)
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-meta-learning-accelerator': {
    productId: 'prod_TuB0pmYh0qsquD',
    priceId: 'price_1SwMeYQ7FtTiAL4aNnweXZDh',
    priceUsd: 5499,
  },
  'recursive-architecture-refactorer': {
    productId: 'prod_TuB0qw5cowOIxj',
    priceId: 'price_1SwMeZQ7FtTiAL4aVuWqiAvO',
    priceUsd: 5999,
  },
  'recursive-cognitive-bootstrapping': {
    productId: 'prod_TuB0Tzj2abQE7G',
    priceId: 'price_1SwMeaQ7FtTiAL4a2bYDTkSm',
    priceUsd: 4999,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ⚡ ENTERPRISE — Self-Healing & Synthesis ($3,499 - $4,499)
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-self-healing-mesh': {
    productId: 'prod_TuB0vxtbuI1Iuv',
    priceId: 'price_1SwMebQ7FtTiAL4aRTFY7atC',
    priceUsd: 4499,
  },
  'recursive-infinite-context': {
    productId: 'prod_TuB0aMNiFkp86j',
    priceId: 'price_1SwMedQ7FtTiAL4auaXh4d0F',
    priceUsd: 3999,
  },
  'recursive-capability-discoverer': {
    productId: 'prod_TuB0lcU7SzU0QM',
    priceId: 'price_1SwMeeQ7FtTiAL4aIlmYdJ7x',
    priceUsd: 3799,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 PLATFORM — Knowledge & Optimization ($2,999 - $3,499)
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-prompt-optimizer': {
    productId: 'prod_TuB02pWJEguQvO',
    priceId: 'price_1SwMefQ7FtTiAL4ao9Mmso1Y',
    priceUsd: 2999,
  },
  'recursive-knowledge-crystallization': {
    productId: 'prod_TuB0gRCB6xGuzT',
    priceId: 'price_1SwMegQ7FtTiAL4arI2lIXl7',
    priceUsd: 3499,
  },
  'recursive-goal-optimizer': {
    productId: 'prod_TuB0Wtkl5apARp',
    priceId: 'price_1SwMeiQ7FtTiAL4aKPUUJRNI',
    priceUsd: 3299,
  },
};

// Get recursive config
export function getRecursiveStripeConfig(capabilityId: string): CapabilityStripeConfig | undefined {
  return RECURSIVE_STRIPE_CONFIG[capabilityId];
}

// Check if capability is recursive self-improvement
export function hasRecursiveStripeConfig(capabilityId: string): boolean {
  return capabilityId in RECURSIVE_STRIPE_CONFIG;
}

// Check if capability is apex tier (highest pricing)
export function isApexTierCapability(capabilityId: string): boolean {
  return capabilityId === 'recursive-self-optimization-core';
}

// Get all recursive configs for display
export function getAllRecursiveStripeConfigs(): Record<string, CapabilityStripeConfig> {
  return RECURSIVE_STRIPE_CONFIG;
}
