/**
 * Capabilities Depot — Premium Stripe Configuration
 * Maps premium capabilities to Stripe products/prices.
 *
 * NOTE: These currently include placeholder IDs, but checkout is still enabled via
 * the marketplace checkout function using normalized tier amounts.
 */

import type { CapabilityStripeConfig } from './stripe-config';

export const PREMIUM_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // Intelligence
  'cap-chain-of-thought': {
    productId: 'prod_premium_cot',
    priceId: 'price_premium_cot_199',
    priceUsd: 199, // normalized from $249
  },
  'cap-counterfactual-reasoning': {
    productId: 'prod_premium_cfr',
    priceId: 'price_premium_cfr_299',
    priceUsd: 299,
  },
  'cap-cognitive-load-balancer': {
    productId: 'prod_premium_clb',
    priceId: 'price_premium_clb_199',
    priceUsd: 199,
  },
  'cap-semantic-compression': {
    productId: 'prod_premium_sce',
    priceId: 'price_premium_sce_149',
    priceUsd: 149,
  },

  // Security
  'cap-prompt-injection-shield': {
    productId: 'prod_premium_pis',
    priceId: 'price_premium_pis_199',
    priceUsd: 199,
  },
  'cap-data-exfiltration-guard': {
    productId: 'prod_premium_deg',
    priceId: 'price_premium_deg_199',
    priceUsd: 199, // normalized from $249
  },
  'cap-adversarial-robustness': {
    productId: 'prod_premium_art',
    priceId: 'price_premium_art_299',
    priceUsd: 299,
  },
  'cap-jailbreak-detector': {
    productId: 'prod_premium_jde',
    priceId: 'price_premium_jde_199',
    priceUsd: 199,
  },

  // Automation
  'cap-workflow-composer': {
    productId: 'prod_premium_awc',
    priceId: 'price_premium_awc_199',
    priceUsd: 199,
  },
  'cap-webhook-intelligence': {
    productId: 'prod_premium_wih',
    priceId: 'price_premium_wih_99',
    priceUsd: 99,
  },
  'cap-scheduled-intelligence': {
    productId: 'prod_premium_sir',
    priceId: 'price_premium_sir_149',
    priceUsd: 149,
  },
  'cap-event-driven-ai': {
    productId: 'prod_premium_edar',
    priceId: 'price_premium_edar_199',
    priceUsd: 199,
  },

  // Resilience
  'cap-model-fallback-chain': {
    productId: 'prod_premium_mfc',
    priceId: 'price_premium_mfc_149',
    priceUsd: 149,
  },
  'cap-request-replay': {
    productId: 'prod_premium_rre',
    priceId: 'price_premium_rre_99',
    priceUsd: 99,
  },
  'cap-circuit-breaker-ai': {
    productId: 'prod_premium_cba',
    priceId: 'price_premium_cba_99',
    priceUsd: 99,
  },

  // Optimization
  'cap-inference-caching': {
    productId: 'prod_premium_icl',
    priceId: 'price_premium_icl_149',
    priceUsd: 149,
  },
  'cap-latency-predictor': {
    productId: 'prod_premium_lpe',
    priceId: 'price_premium_lpe_99',
    priceUsd: 99,
  },
  'cap-batch-optimizer': {
    productId: 'prod_premium_bio',
    priceId: 'price_premium_bio_149',
    priceUsd: 149,
  },
};

// Get config by capability ID
export function getPremiumStripeConfig(capabilityId: string): CapabilityStripeConfig | undefined {
  return PREMIUM_STRIPE_CONFIG[capabilityId];
}

// Check if capability has Premium Stripe integration
export function hasPremiumStripeConfig(capabilityId: string): boolean {
  return capabilityId in PREMIUM_STRIPE_CONFIG;
}

// Get all Premium Stripe configs
export function getAllPremiumStripeConfigs(): Record<string, CapabilityStripeConfig> {
  return PREMIUM_STRIPE_CONFIG;
}
