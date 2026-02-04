/**
 * Capabilities Depot — Stripe Recursive Self-Improvement
 * ALL RECURSIVE CAPABILITIES ARE OFF-MENU (licensed on request)
 * These are the highest-tier autonomous/self-improving capabilities
 * v2.0.0 — Unified Pricing (All Recursive = Off-Menu)
 */

import type { CapabilityStripeConfig } from './stripe-config';

// Recursive Self-Improvement capabilities — ALL OFF-MENU
export const RECURSIVE_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 👑 APEX TIER — Recursive Self-Improvement — OFF-MENU
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-self-optimization-core': {
    productId: 'prod_TuB0P1v6HRgyQk',
    priceId: 'price_1SwMeWQ7FtTiAL4ackyGFUOx',
    priceUsd: 6999,
    offMenu: true, // Contains 'recursive' + 'self-optimization'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CROWN-CLASS — Meta-Learning & Architecture — OFF-MENU
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-meta-learning-accelerator': {
    productId: 'prod_TuB0pmYh0qsquD',
    priceId: 'price_1SwMeYQ7FtTiAL4aNnweXZDh',
    priceUsd: 5499,
    offMenu: true, // Contains 'recursive'
  },
  'recursive-architecture-refactorer': {
    productId: 'prod_TuB0qw5cowOIxj',
    priceId: 'price_1SwMeZQ7FtTiAL4aVuWqiAvO',
    priceUsd: 5999,
    offMenu: true, // Contains 'recursive'
  },
  'recursive-cognitive-bootstrapping': {
    productId: 'prod_TuB0Tzj2abQE7G',
    priceId: 'price_1SwMeaQ7FtTiAL4a2bYDTkSm',
    priceUsd: 4999,
    offMenu: true, // Contains 'recursive' + 'cognitive-bootstrapping'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ⚡ ENTERPRISE — Self-Healing & Synthesis — OFF-MENU
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-self-healing-mesh': {
    productId: 'prod_TuB0vxtbuI1Iuv',
    priceId: 'price_1SwMebQ7FtTiAL4aRTFY7atC',
    priceUsd: 4499,
    offMenu: true, // Contains 'recursive' + 'self-healing'
  },
  'recursive-infinite-context': {
    productId: 'prod_TuB0aMNiFkp86j',
    priceId: 'price_1SwMedQ7FtTiAL4auaXh4d0F',
    priceUsd: 3999,
    offMenu: true, // Contains 'recursive' + 'infinite'
  },
  'recursive-capability-discoverer': {
    productId: 'prod_TuB0lcU7SzU0QM',
    priceId: 'price_1SwMeeQ7FtTiAL4aIlmYdJ7x',
    priceUsd: 3799,
    offMenu: true, // Contains 'recursive'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 PLATFORM — Knowledge & Optimization — OFF-MENU
  // ═══════════════════════════════════════════════════════════════════════════

  'recursive-prompt-optimizer': {
    productId: 'prod_TuB02pWJEguQvO',
    priceId: 'price_1SwMefQ7FtTiAL4ao9Mmso1Y',
    priceUsd: 2999,
    offMenu: true, // Contains 'recursive'
  },
  'recursive-knowledge-crystallization': {
    productId: 'prod_TuB0gRCB6xGuzT',
    priceId: 'price_1SwMegQ7FtTiAL4arI2lIXl7',
    priceUsd: 3499,
    offMenu: true, // Contains 'recursive'
  },
  'recursive-goal-optimizer': {
    productId: 'prod_TuB0Wtkl5apARp',
    priceId: 'price_1SwMeiQ7FtTiAL4aKPUUJRNI',
    priceUsd: 3299,
    offMenu: true, // Contains 'recursive'
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

// All recursive capabilities are off-menu
export function isRecursiveOffMenu(capabilityId: string): boolean {
  return hasRecursiveStripeConfig(capabilityId);
}
