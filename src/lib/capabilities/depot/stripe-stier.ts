/**
 * S-Tier Capabilities — Stripe Configuration
 * Real Stripe product/price IDs for 22 premium S-tier capabilities
 * Self-improvement capabilities are priced highest
 * v1.0.0
 */

import type { CapabilityStripeConfig } from './stripe-config';

/**
 * S-Tier Stripe Configuration
 * 
 * Pricing tiers (self-improvement highest):
 * - Crown-Class Self-Improvement: $4,999
 * - Enterprise Self-Improvement: $3,999
 * - Platform Self-Improvement: $3,499
 * - Strategic: $1,999
 * - Enterprise: $1,499
 * - Professional: $999
 * - Advanced: $499
 */
export const STIER_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 SELF-IMPROVEMENT TIER (Highest Value - $3,499 to $4,999)
  // ═══════════════════════════════════════════════════════════════════════════

  // Crown-Class: Ultimate self-governing intelligence
  'stier-intelligence-governance-kernel': {
    productId: 'prod_TuAsehs143nnEK',
    priceId: 'price_1SwMX5Q7FtTiAL4aOb3kupJR',
    priceUsd: 4999,
  },

  // Self-scaling autonomous cognition
  'stier-self-scaling-intelligence-fabric': {
    productId: 'prod_TuAsP1leYcoXYe',
    priceId: 'price_1SwMX6Q7FtTiAL4a2xLxRqAx',
    priceUsd: 3999,
  },

  // Fully autonomous operations
  'stier-autonomous-ops-steward': {
    productId: 'prod_TuAsJZkIZMZMKn',
    priceId: 'price_1SwMX7Q7FtTiAL4ay1KCY2P7',
    priceUsd: 3499,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 INTELLIGENCE × CONTROL ($1,499 - $1,999)
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-strategic-foresight-engine': {
    productId: 'prod_TuAsvfPG4cRW6o',
    priceId: 'price_1SwMX8Q7FtTiAL4aibodEaBK',
    priceUsd: 1999,
  },

  'stier-explainable-intelligence-compiler': {
    productId: 'prod_TuAsMPxMUWO3og',
    priceId: 'price_1SwMXAQ7FtTiAL4asGaVk3wQ',
    priceUsd: 1499,
  },

  'stier-decision-confidence-governor': {
    productId: 'prod_TuAtTulcem0crw',
    priceId: 'price_1SwMXNQ7FtTiAL4aiyiRl2NT',
    priceUsd: 999,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 SECURITY × TRUST ($1,499 - $1,999)
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-intelligence-containment-engine': {
    productId: 'prod_TuAsAovFtvcvVs',
    priceId: 'price_1SwMXBQ7FtTiAL4aEFVwnbhV',
    priceUsd: 1999,
  },

  'stier-emergent-threat-anticipator': {
    productId: 'prod_TuAso2hWNvBZpN',
    priceId: 'price_1SwMXDQ7FtTiAL4aIqQeWZIX',
    priceUsd: 1499,
  },

  'stier-behavioral-trust-scoring': {
    productId: 'prod_TuAtTA5UQAybKD',
    priceId: 'price_1SwMXQQ7FtTiAL4aBZIwbjf4',
    priceUsd: 999,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ⚙️ AUTONOMY × OPERATIONS ($999 - $1,499)
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-autonomy-rollback-authority': {
    productId: 'prod_TuAtLdjXGe6YZK',
    priceId: 'price_1SwMXGQ7FtTiAL4aMOrbH0qd',
    priceUsd: 1499,
  },

  'stier-autonomy-budget-manager': {
    productId: 'prod_TuAtPEMmXeM2N5',
    priceId: 'price_1SwMXOQ7FtTiAL4ajI0ql6ZW',
    priceUsd: 999,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 💸 COST × PERFORMANCE ($499 - $1,499)
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-autonomous-cost-arbitrage-engine': {
    productId: 'prod_TuAtqw8KipLqEF',
    priceId: 'price_1SwMXEQ7FtTiAL4avInrW8Z0',
    priceUsd: 1499,
  },

  'stier-value-weighted-reasoning-router': {
    productId: 'prod_TuAtiqXn66EChS',
    priceId: 'price_1SwMXRQ7FtTiAL4ampIbvW2N',
    priceUsd: 999,
  },

  'stier-waste-detection-intelligence': {
    productId: 'prod_TuAtLB8Teb6f5N',
    priceId: 'price_1SwMXSQ7FtTiAL4aqw1XZdoe',
    priceUsd: 499,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧩 PRODUCT × UX ($499 - $999)
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-intent-drift-tracker': {
    productId: 'prod_TuAtxQiz6RxFye',
    priceId: 'price_1SwMXUQ7FtTiAL4aG87eNikh',
    priceUsd: 499,
  },

  'stier-adaptive-product-brain': {
    productId: 'prod_TuAtesOPMLhlvA',
    priceId: 'price_1SwMXVQ7FtTiAL4aLqijpxjb',
    priceUsd: 999,
  },

  'stier-friction-auto-removal-engine': {
    productId: 'prod_TuAtraIyPs1SrM',
    priceId: 'price_1SwMXWQ7FtTiAL4ateKy5q2O',
    priceUsd: 999,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧬 PLATFORM × SCALE ($999 - $1,499)
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-cross-pipeline-arbitration-engine': {
    productId: 'prod_TuAt93FGccXB1Q',
    priceId: 'price_1SwMXYQ7FtTiAL4a8XWNUZhx',
    priceUsd: 1499,
  },

  'stier-capability-impact-forecaster': {
    productId: 'prod_TuAtFoWAb6MdhI',
    priceId: 'price_1SwMXZQ7FtTiAL4aKoPR15p1',
    priceUsd: 999,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏛️ COMPLIANCE × LEGITIMACY ($999 - $1,499)
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-audit-grade-decision-ledger': {
    productId: 'prod_TuAtuuTNevNEjA',
    priceId: 'price_1SwMXHQ7FtTiAL4ayC2APFIR',
    priceUsd: 1499,
  },

  'stier-regulatory-mode-switcher': {
    productId: 'prod_TuAti76SVZY5Eu',
    priceId: 'price_1SwMXaQ7FtTiAL4a6RJ79sqT',
    priceUsd: 999,
  },

  'stier-policy-aware-intelligence-gate': {
    productId: 'prod_TuAt9k18BMdcWc',
    priceId: 'price_1SwMXcQ7FtTiAL4ag3nZaC5x',
    priceUsd: 999,
  },
};

// Helper functions
export function getSTierStripeConfig(capabilityId: string): CapabilityStripeConfig | undefined {
  return STIER_STRIPE_CONFIG[capabilityId];
}

export function hasSTierStripeConfig(capabilityId: string): boolean {
  return capabilityId in STIER_STRIPE_CONFIG;
}

export function getAllSTierStripeConfigs(): Record<string, CapabilityStripeConfig> {
  return STIER_STRIPE_CONFIG;
}

// Get self-improvement capabilities (highest tier)
export function getSelfImprovementCapabilities(): string[] {
  return [
    'stier-intelligence-governance-kernel',
    'stier-self-scaling-intelligence-fabric',
    'stier-autonomous-ops-steward',
  ];
}

// Check if capability is self-improvement tier
export function isSelfImprovementCapability(capabilityId: string): boolean {
  return getSelfImprovementCapabilities().includes(capabilityId);
}
