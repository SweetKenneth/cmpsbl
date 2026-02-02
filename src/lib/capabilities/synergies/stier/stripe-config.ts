/**
 * S-Tier Synergy Pipelines — Stripe Configuration
 * v7.5.0 — Premium pricing for 22 S-tier pipelines
 */

import type { CapabilityStripeConfig } from '../../depot/stripe-config';

/**
 * S-Tier Pipeline Stripe Configuration
 * Pricing tiers:
 * - Crown-Class: $2,999
 * - Enterprise: $1,999
 * - Professional: $999
 * - Advanced: $499
 */
export const STIER_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // 🧠 INTELLIGENCE × CONTROL (High Prestige)
  'stier-strategic-foresight-engine': {
    productId: 'prod_stier_foresight',
    priceId: 'price_stier_foresight',
    priceUsd: 1999,
  },
  'stier-decision-confidence-governor': {
    productId: 'prod_stier_dcg',
    priceId: 'price_stier_dcg',
    priceUsd: 999,
  },
  'stier-explainable-intelligence-compiler': {
    productId: 'prod_stier_xai',
    priceId: 'price_stier_xai',
    priceUsd: 1499,
  },

  // ⚙️ AUTONOMY × OPERATIONS (Big Money)
  'stier-autonomous-ops-steward': {
    productId: 'prod_stier_ops',
    priceId: 'price_stier_ops',
    priceUsd: 1999,
  },
  'stier-autonomy-budget-manager': {
    productId: 'prod_stier_budget',
    priceId: 'price_stier_budget',
    priceUsd: 999,
  },
  'stier-autonomy-rollback-authority': {
    productId: 'prod_stier_rollback',
    priceId: 'price_stier_rollback',
    priceUsd: 1499,
  },

  // 🔐 SECURITY × TRUST (Non-Optional at Scale)
  'stier-intelligence-containment-engine': {
    productId: 'prod_stier_contain',
    priceId: 'price_stier_contain',
    priceUsd: 1999,
  },
  'stier-emergent-threat-anticipator': {
    productId: 'prod_stier_threat',
    priceId: 'price_stier_threat',
    priceUsd: 1499,
  },
  'stier-behavioral-trust-scoring': {
    productId: 'prod_stier_trust',
    priceId: 'price_stier_trust',
    priceUsd: 999,
  },

  // 💸 COST × PERFORMANCE (Instant ROI)
  'stier-autonomous-cost-arbitrage-engine': {
    productId: 'prod_stier_arbitrage',
    priceId: 'price_stier_arbitrage',
    priceUsd: 1499,
  },
  'stier-value-weighted-reasoning-router': {
    productId: 'prod_stier_value',
    priceId: 'price_stier_value',
    priceUsd: 999,
  },
  'stier-waste-detection-intelligence': {
    productId: 'prod_stier_waste',
    priceId: 'price_stier_waste',
    priceUsd: 499,
  },

  // 🧩 PRODUCT × UX (Adoption Drivers)
  'stier-intent-drift-tracker': {
    productId: 'prod_stier_drift',
    priceId: 'price_stier_drift',
    priceUsd: 499,
  },
  'stier-adaptive-product-brain': {
    productId: 'prod_stier_product',
    priceId: 'price_stier_product',
    priceUsd: 999,
  },
  'stier-friction-auto-removal-engine': {
    productId: 'prod_stier_friction',
    priceId: 'price_stier_friction',
    priceUsd: 999,
  },

  // 🧬 PLATFORM × SCALE (Valuation Boosters)
  'stier-cross-pipeline-arbitration-engine': {
    productId: 'prod_stier_arbitration',
    priceId: 'price_stier_arbitration',
    priceUsd: 1499,
  },
  'stier-capability-impact-forecaster': {
    productId: 'prod_stier_impact',
    priceId: 'price_stier_impact',
    priceUsd: 999,
  },
  'stier-self-scaling-intelligence-fabric': {
    productId: 'prod_stier_fabric',
    priceId: 'price_stier_fabric',
    priceUsd: 1999,
  },

  // 🏛️ COMPLIANCE × LEGITIMACY (Deal Closers)
  'stier-regulatory-mode-switcher': {
    productId: 'prod_stier_regulatory',
    priceId: 'price_stier_regulatory',
    priceUsd: 999,
  },
  'stier-audit-grade-decision-ledger': {
    productId: 'prod_stier_ledger',
    priceId: 'price_stier_ledger',
    priceUsd: 1499,
  },
  'stier-policy-aware-intelligence-gate': {
    productId: 'prod_stier_policy',
    priceId: 'price_stier_policy',
    priceUsd: 999,
  },

  // 🧠 META / CROWN-CLASS (Scarcity Drivers)
  'stier-intelligence-governance-kernel': {
    productId: 'prod_stier_kernel',
    priceId: 'price_stier_kernel',
    priceUsd: 2999,
  },
};

export function getSTierStripeConfig(pipelineId: string): CapabilityStripeConfig | undefined {
  return STIER_STRIPE_CONFIG[`stier-${pipelineId}`];
}

export function hasSTierStripeConfig(pipelineId: string): boolean {
  return `stier-${pipelineId}` in STIER_STRIPE_CONFIG;
}

export function getAllSTierConfigs(): Record<string, CapabilityStripeConfig> {
  return STIER_STRIPE_CONFIG;
}
