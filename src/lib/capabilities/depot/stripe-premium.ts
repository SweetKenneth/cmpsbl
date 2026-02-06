/**
 * Capabilities Depot — Premium Stripe Configuration
 * Maps 18 NEW premium capabilities to Stripe products/prices
 * v2.2.0 — PLACEHOLDER IDs marked as off-menu until real Stripe products are created
 * 
 * NOTE: These capabilities have placeholder Stripe IDs and are marked offMenu: true
 * To enable checkout, create real Stripe products/prices and update IDs here.
 */

import type { CapabilityStripeConfig } from './stripe-config';

// Premium Capabilities — Currently OFF-MENU (placeholder IDs)
// These need real Stripe products/prices before checkout will work
export const PREMIUM_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // Intelligence — Contact for pricing until Stripe products created
  'cap-chain-of-thought': {
    productId: 'prod_premium_cot',
    priceId: 'price_premium_cot_249',
    priceUsd: 249,
    offMenu: true, // No valid Stripe product yet
  },
  'cap-counterfactual-reasoning': {
    productId: 'prod_premium_cfr',
    priceId: 'price_premium_cfr_299',
    priceUsd: 299,
    offMenu: true,
  },
  'cap-cognitive-load-balancer': {
    productId: 'prod_premium_clb',
    priceId: 'price_premium_clb_199',
    priceUsd: 199,
    offMenu: true,
  },
  'cap-semantic-compression': {
    productId: 'prod_premium_sce',
    priceId: 'price_premium_sce_149',
    priceUsd: 149,
    offMenu: true,
  },

  // Security — Contact for pricing
  'cap-prompt-injection-shield': {
    productId: 'prod_premium_pis',
    priceId: 'price_premium_pis_199',
    priceUsd: 199,
    offMenu: true,
  },
  'cap-data-exfiltration-guard': {
    productId: 'prod_premium_deg',
    priceId: 'price_premium_deg_249',
    priceUsd: 249,
    offMenu: true,
  },
  'cap-adversarial-robustness': {
    productId: 'prod_premium_art',
    priceId: 'price_premium_art_299',
    priceUsd: 299,
    offMenu: true,
  },
  'cap-jailbreak-detector': {
    productId: 'prod_premium_jde',
    priceId: 'price_premium_jde_199',
    priceUsd: 199,
    offMenu: true,
  },

  // Automation — Contact for pricing
  'cap-workflow-composer': {
    productId: 'prod_premium_awc',
    priceId: 'price_premium_awc_199',
    priceUsd: 199,
    offMenu: true,
  },
  'cap-webhook-intelligence': {
    productId: 'prod_premium_wih',
    priceId: 'price_premium_wih_99',
    priceUsd: 99,
    offMenu: true,
  },
  'cap-scheduled-intelligence': {
    productId: 'prod_premium_sir',
    priceId: 'price_premium_sir_149',
    priceUsd: 149,
    offMenu: true,
  },
  'cap-event-driven-ai': {
    productId: 'prod_premium_edar',
    priceId: 'price_premium_edar_199',
    priceUsd: 199,
    offMenu: true,
  },

  // Resilience — Contact for pricing
  'cap-model-fallback-chain': {
    productId: 'prod_premium_mfc',
    priceId: 'price_premium_mfc_149',
    priceUsd: 149,
    offMenu: true,
  },
  'cap-request-replay': {
    productId: 'prod_premium_rre',
    priceId: 'price_premium_rre_99',
    priceUsd: 99,
    offMenu: true,
  },
  'cap-circuit-breaker-ai': {
    productId: 'prod_premium_cba',
    priceId: 'price_premium_cba_99',
    priceUsd: 99,
    offMenu: true,
  },

  // Optimization — Contact for pricing
  'cap-inference-caching': {
    productId: 'prod_premium_icl',
    priceId: 'price_premium_icl_149',
    priceUsd: 149,
    offMenu: true,
  },
  'cap-latency-predictor': {
    productId: 'prod_premium_lpe',
    priceId: 'price_premium_lpe_99',
    priceUsd: 99,
    offMenu: true,
  },
  'cap-batch-optimizer': {
    productId: 'prod_premium_bio',
    priceId: 'price_premium_bio_149',
    priceUsd: 149,
    offMenu: true,
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
