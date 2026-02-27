/**
 * S-Tier Capabilities — Stripe Configuration
 * Correct price IDs for all public items ($149-$299)
 * 
 * RULE: Only capabilities that compile/generate their own code are off-menu
 * Everything else is for sale at $299 or less
 */

import type { CapabilityStripeConfig } from './stripe-config';

/**
 * S-Tier Stripe Configuration
 * Most items are NOW FOR SALE (only code self-improvement is off-menu)
 * ALL PRICE IDs UPDATED to correct $149-$299 amounts
 */
export const STIER_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 SELF-IMPROVEMENT TIER — OFF-MENU (Crown Jewels)
  // Only recursive code compilation / self-modifying software
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-intelligence-governance-kernel': {
    productId: 'prod_TuAsehs143nnEK',
    priceId: 'price_1SwMX5Q7FtTiAL4aOb3kupJR',
    priceUsd: 299,
    offMenu: true, // Kernel-level code self-modification — Licensed on request
  },

  'stier-self-scaling-intelligence-fabric': {
    productId: 'prod_TuAsP1leYcoXYe',
    priceId: 'price_1SwMX6Q7FtTiAL4a2xLxRqAx',
    priceUsd: 299,
    offMenu: true, // Self-scaling code generation — Licensed on request
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 INTELLIGENCE × CONTROL — FOR SALE ($199-$299)
  // NEW CORRECT PRICE IDs
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-autonomous-ops-steward': {
    productId: 'prod_TuzXQoWEZvQ4rH',
    priceId: 'price_1Sx9Y5Q7FtTiAL4a99I5zImC',
    priceUsd: 299, // FOR SALE - Operations automation, not code compilation
  },

  'stier-strategic-foresight-engine': {
    productId: 'prod_TuzXff4qDOJwYz',
    priceId: 'price_1Sx9Y6Q7FtTiAL4aGiw4fiSn',
    priceUsd: 299, // FOR SALE - Strategic analysis
  },

  'stier-explainable-intelligence-compiler': {
    productId: 'prod_TuzXRCVH0NL5N1',
    priceId: 'price_1Sx9Y7Q7FtTiAL4aXqbi3R9q',
    priceUsd: 299, // FOR SALE - Explanation generation
  },

  'stier-decision-confidence-governor': {
    productId: 'prod_TuzXoUwQXhwffv',
    priceId: 'price_1Sx9Y8Q7FtTiAL4aYq3GOmTS',
    priceUsd: 199, // FOR SALE - Decision scoring
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 SECURITY × TRUST — FOR SALE ($199-$299)
  // NEW CORRECT PRICE IDs
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-intelligence-containment-engine': {
    productId: 'prod_TuzX0v7INznlvZ',
    priceId: 'price_1Sx9Y9Q7FtTiAL4aSyfPA7nn',
    priceUsd: 299, // FOR SALE - Containment logic
  },

  'stier-emergent-threat-anticipator': {
    productId: 'prod_TuzXVqMWdB2gOd',
    priceId: 'price_1Sx9YAQ7FtTiAL4aY4TmT0ta',
    priceUsd: 299, // FOR SALE - Threat detection
  },

  'stier-behavioral-trust-scoring': {
    productId: 'prod_TuzXzWHObMwJdN',
    priceId: 'price_1Sx9YBQ7FtTiAL4aZgxO7184',
    priceUsd: 199, // FOR SALE - Trust scoring
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ⚙️ AUTONOMY × OPERATIONS — FOR SALE ($199-$299)
  // NEW CORRECT PRICE IDs
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-autonomy-rollback-authority': {
    productId: 'prod_TuzXzG2uwK750D',
    priceId: 'price_1Sx9YCQ7FtTiAL4a66IUi3pN',
    priceUsd: 299, // FOR SALE - Rollback automation
  },

  'stier-autonomy-budget-manager': {
    productId: 'prod_TuzXSbQlk8eT3d',
    priceId: 'price_1Sx9YEQ7FtTiAL4aU01UXNDA',
    priceUsd: 199, // FOR SALE - Budget management
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 💸 COST × PERFORMANCE — FOR SALE ($149-$299)
  // NEW CORRECT PRICE IDs
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-autonomous-cost-arbitrage-engine': {
    productId: 'prod_TuzXaQvApY2EVV',
    priceId: 'price_1Sx9YEQ7FtTiAL4aO3ispvIs',
    priceUsd: 299, // FOR SALE - Cost optimization
  },

  'stier-value-weighted-reasoning-router': {
    productId: 'prod_TuzXc8Oq4wmMHZ',
    priceId: 'price_1Sx9YJQ7FtTiAL4aZG7TU1Y9',
    priceUsd: 199, // FOR SALE - Routing optimization
  },

  'stier-waste-detection-intelligence': {
    productId: 'prod_TuzXo7a6w57x2z',
    priceId: 'price_1Sx9YKQ7FtTiAL4aux9kVMzu',
    priceUsd: 149, // FOR SALE - Waste detection
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧩 PRODUCT × UX — FOR SALE ($149-$199)
  // NEW CORRECT PRICE IDs
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-intent-drift-tracker': {
    productId: 'prod_TuzXlb5i7iIsQc',
    priceId: 'price_1Sx9YLQ7FtTiAL4apa7lQoGJ',
    priceUsd: 149, // FOR SALE - Intent tracking
  },

  'stier-adaptive-product-brain': {
    productId: 'prod_TuzXvqrrRb1Fsr',
    priceId: 'price_1Sx9YMQ7FtTiAL4aup85lkRq',
    priceUsd: 199, // FOR SALE - Product intelligence
  },

  'stier-friction-auto-removal-engine': {
    productId: 'prod_TuzXntYHSfLsEZ',
    priceId: 'price_1Sx9YNQ7FtTiAL4auBI8NSnP',
    priceUsd: 199, // FOR SALE - UX optimization
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧬 PLATFORM × SCALE — FOR SALE ($199-$299)
  // NEW CORRECT PRICE IDs
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-cross-pipeline-arbitration-engine': {
    productId: 'prod_TuzXQtcnVU9dpi',
    priceId: 'price_1Sx9YOQ7FtTiAL4aL7Kzo3k9',
    priceUsd: 299, // FOR SALE - Pipeline orchestration
  },

  'stier-capability-impact-forecaster': {
    productId: 'prod_TuzXS9G9PTPRFQ',
    priceId: 'price_1Sx9YPQ7FtTiAL4atyujUF2y',
    priceUsd: 199, // FOR SALE - Impact forecasting
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏛️ COMPLIANCE × LEGITIMACY — FOR SALE ($199-$299)
  // NEW CORRECT PRICE IDs
  // ═══════════════════════════════════════════════════════════════════════════

  'stier-audit-grade-decision-ledger': {
    productId: 'prod_TuzXu6qn6CZFBN',
    priceId: 'price_1Sx9YQQ7FtTiAL4ay16bgAno',
    priceUsd: 299, // FOR SALE - Audit logging
  },

  'stier-regulatory-mode-switcher': {
    productId: 'prod_TuzX0ex1pNUvUC',
    priceId: 'price_1Sx9YRQ7FtTiAL4a1YaK7Odt',
    priceUsd: 199, // FOR SALE - Regulatory compliance
  },

  'stier-policy-aware-intelligence-gate': {
    productId: 'prod_TuzXm2ar0jAAKy',
    priceId: 'price_1Sx9YSQ7FtTiAL4aweMQJ6A4',
    priceUsd: 199, // FOR SALE - Policy enforcement
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

// Get self-improvement capabilities (only code compilation ones)
export function getSelfImprovementCapabilities(): string[] {
  return [
    'stier-intelligence-governance-kernel',
    'stier-self-scaling-intelligence-fabric',
  ];
}

// Check if capability is self-improvement tier (code compilation)
export function isSelfImprovementCapability(capabilityId: string): boolean {
  return getSelfImprovementCapabilities().includes(capabilityId);
}

// Only kernel/fabric items are off-menu now
export function isSTierOffMenu(capabilityId: string): boolean {
  const config = STIER_STRIPE_CONFIG[capabilityId];
  return config?.offMenu === true;
}
