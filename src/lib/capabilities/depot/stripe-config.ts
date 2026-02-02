/**
 * Capabilities Depot — Stripe Configuration
 * Maps capability IDs to Stripe product/price IDs
 * v1.0.0
 */

export interface CapabilityStripeConfig {
  productId: string;
  priceId: string;
  priceUsd: number;
}

// Core Capabilities
export const CAPABILITY_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // Intelligence
  'cap-causal-inference': {
    productId: 'prod_TtzRBRDJzwwL1W',
    priceId: 'price_1SwBSPQ7FtTiAL4aJycn6czm',
    priceUsd: 299,
  },
  'cap-emergent-pattern': {
    productId: 'prod_TtzRwYOYdzZgXx',
    priceId: 'price_1SwBSQQ7FtTiAL4aScJzym5y',
    priceUsd: 199,
  },
  
  // Optimization
  'cap-capacity-forecast': {
    productId: 'prod_TtzRqOWEGuhi9H',
    priceId: 'price_1SwBSRQ7FtTiAL4a0kpjBPwU',
    priceUsd: 149,
  },
  'cap-cost-optimizer': {
    productId: 'prod_TtzRWnfGCOWbga',
    priceId: 'price_1SwBSTQ7FtTiAL4aFhdkNtR0',
    priceUsd: 499,
  },
  
  // Resilience
  'cap-predictive-healing': {
    productId: 'prod_TtzRWmRgeAybdD',
    priceId: 'price_1SwBSUQ7FtTiAL4ahIE93DAB',
    priceUsd: 599,
  },
  'cap-chaos-resilience': {
    productId: 'prod_TtzRY8NfMX6dgb',
    priceId: 'price_1SwBSWQ7FtTiAL4aS3w6OPWD',
    priceUsd: 799,
  },
  
  // Security
  'cap-threat-prediction': {
    productId: 'prod_TtzRtLTqGfw9ce',
    priceId: 'price_1SwBSXQ7FtTiAL4aqKfXt0h4',
    priceUsd: 999,
  },
  'cap-compliance-auto': {
    productId: 'prod_TtzRrBPukmo6MB',
    priceId: 'price_1SwBSYQ7FtTiAL4aiwr1AAqi',
    priceUsd: 699,
  },
  
  // Accessibility
  'cap-wcag-auditor': {
    productId: 'prod_TtzRKsCaQfb4Sk',
    priceId: 'price_1SwBSZQ7FtTiAL4abm5ZuQqK',
    priceUsd: 49,
  },
  
  // Automation
  'cap-sla-guardian': {
    productId: 'prod_TtzR6iyGfcIkX2',
    priceId: 'price_1SwBSbQ7FtTiAL4aT7rIMXhw',
    priceUsd: 249,
  },
  'cap-resource-contention': {
    productId: 'prod_TtzRxiNqn7JstA',
    priceId: 'price_1SwBScQ7FtTiAL4aImHXOxKy',
    priceUsd: 349,
  },
  
  // Flagship
  'cap-cognitive-mesh': {
    productId: 'prod_TtzRdjZUT012dR',
    priceId: 'price_1SwBSeQ7FtTiAL4aPMhYfp5b',
    priceUsd: 2499,
  },
};

// Synergy Pipeline Capabilities
export const SYNERGY_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  'syn-smart-recall': {
    productId: 'prod_TtzRrsAv2XdHXZ',
    priceId: 'price_1SwBSgQ7FtTiAL4as6Nob9DC',
    priceUsd: 199,
  },
  'syn-adaptive-routing': {
    productId: 'prod_TtzRna6yh7RMcB',
    priceId: 'price_1SwBShQ7FtTiAL4aS2j350wK',
    priceUsd: 249,
  },
  'syn-graceful-degradation': {
    productId: 'prod_TtzR04e49rkeeF',
    priceId: 'price_1SwBSjQ7FtTiAL4aGALKx0Bu',
    priceUsd: 299,
  },
  'syn-autonomous-evolution': {
    productId: 'prod_TtzRHSGLRYBhya',
    priceId: 'price_1SwBSkQ7FtTiAL4auQ8H724n',
    priceUsd: 1499,
  },
  'syn-cognitive-fusion': {
    productId: 'prod_TtzRImij78dlk0',
    priceId: 'price_1SwBSmQ7FtTiAL4a2Vcrdxhm',
    priceUsd: 349,
  },
  'syn-self-healing': {
    productId: 'prod_TtzREec5TXBQmF',
    priceId: 'price_1SwBSnQ7FtTiAL4aokUoXhju',
    priceUsd: 499,
  },
  'syn-threat-learning': {
    productId: 'prod_TtzRZ0ghqy1IOZ',
    priceId: 'price_1SwBSoQ7FtTiAL4aS60aQaSc',
    priceUsd: 399,
  },
  'syn-end-to-end-reasoning': {
    productId: 'prod_TtzRGGaNJiBSWZ',
    priceId: 'price_1SwBSqQ7FtTiAL4aq47IP62M',
    priceUsd: 1999,
  },
};

import { EXPANSION_STRIPE_CONFIG } from './stripe-expansion';

// Get all Stripe configs
export function getAllStripeConfigs(): Record<string, CapabilityStripeConfig> {
  return { ...CAPABILITY_STRIPE_CONFIG, ...SYNERGY_STRIPE_CONFIG, ...EXPANSION_STRIPE_CONFIG };
}

// Get config by capability ID
export function getStripeConfig(capabilityId: string): CapabilityStripeConfig | undefined {
  return CAPABILITY_STRIPE_CONFIG[capabilityId] || SYNERGY_STRIPE_CONFIG[capabilityId] || EXPANSION_STRIPE_CONFIG[capabilityId];
}

// Check if capability has Stripe integration
export function hasStripeConfig(capabilityId: string): boolean {
  return capabilityId in CAPABILITY_STRIPE_CONFIG || capabilityId in SYNERGY_STRIPE_CONFIG || capabilityId in EXPANSION_STRIPE_CONFIG;
}
