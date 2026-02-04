/**
 * Capabilities Depot — Stripe Configuration
 * Maps capability IDs to Stripe product/price IDs
 * v2.0.0 — Unified Pricing ($19-$299 public, off-menu licensed)
 */

import { normalizePrice, isOffMenuCapability } from './pricing-normalization';

export interface CapabilityStripeConfig {
  productId: string;
  priceId: string;
  priceUsd: number;
  /** If true, checkout is disabled — requires license request */
  offMenu?: boolean;
}

// Core Capabilities — Normalized to $19-$299 range
export const CAPABILITY_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // Intelligence
  'cap-causal-inference': {
    productId: 'prod_TtzRBRDJzwwL1W',
    priceId: 'price_1SwBSPQ7FtTiAL4aJycn6czm',
    priceUsd: 299, // normalized from 299
  },
  'cap-emergent-pattern': {
    productId: 'prod_TtzRwYOYdzZgXx',
    priceId: 'price_1SwBSQQ7FtTiAL4aScJzym5y',
    priceUsd: 199, // normalized from 199
  },
  
  // Optimization
  'cap-capacity-forecast': {
    productId: 'prod_TtzRqOWEGuhi9H',
    priceId: 'price_1SwBSRQ7FtTiAL4a0kpjBPwU',
    priceUsd: 99, // normalized from 149
  },
  'cap-cost-optimizer': {
    productId: 'prod_TtzRWnfGCOWbga',
    priceId: 'price_1SwBSTQ7FtTiAL4aFhdkNtR0',
    priceUsd: 199, // normalized from 499
  },
  
  // Resilience
  'cap-predictive-healing': {
    productId: 'prod_TtzRWmRgeAybdD',
    priceId: 'price_1SwBSUQ7FtTiAL4ahIE93DAB',
    priceUsd: 199, // normalized from 599
  },
  'cap-chaos-resilience': {
    productId: 'prod_TtzRY8NfMX6dgb',
    priceId: 'price_1SwBSWQ7FtTiAL4aS3w6OPWD',
    priceUsd: 299, // normalized from 799
  },
  
  // Security
  'cap-threat-prediction': {
    productId: 'prod_TtzRtLTqGfw9ce',
    priceId: 'price_1SwBSXQ7FtTiAL4aqKfXt0h4',
    priceUsd: 299, // normalized from 999
  },
  'cap-compliance-auto': {
    productId: 'prod_TtzRrBPukmo6MB',
    priceId: 'price_1SwBSYQ7FtTiAL4aiwr1AAqi',
    priceUsd: 199, // normalized from 699
  },
  
  // Accessibility
  'cap-wcag-auditor': {
    productId: 'prod_TtzRKsCaQfb4Sk',
    priceId: 'price_1SwBSZQ7FtTiAL4abm5ZuQqK',
    priceUsd: 49, // normalized from 49
  },
  
  // Automation
  'cap-sla-guardian': {
    productId: 'prod_TtzR6iyGfcIkX2',
    priceId: 'price_1SwBSbQ7FtTiAL4aT7rIMXhw',
    priceUsd: 99, // normalized from 249
  },
  'cap-resource-contention': {
    productId: 'prod_TtzRxiNqn7JstA',
    priceId: 'price_1SwBScQ7FtTiAL4aImHXOxKy',
    priceUsd: 149, // normalized from 349
  },
  
  // Flagship — Only true system-wide cognitive mesh remains off-menu
  'cap-cognitive-mesh': {
    productId: 'prod_TtzRdjZUT012dR',
    priceId: 'price_1SwBSeQ7FtTiAL4aPMhYfp5b',
    priceUsd: 299, // FOR SALE - Cognitive mesh (not code compilation)
  },
};

// Synergy Pipeline Capabilities — Normalized (most now FOR SALE)
export const SYNERGY_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  'syn-smart-recall': {
    productId: 'prod_TtzRrsAv2XdHXZ',
    priceId: 'price_1SwBSgQ7FtTiAL4as6Nob9DC',
    priceUsd: 149, // FOR SALE
  },
  'syn-adaptive-routing': {
    productId: 'prod_TtzRna6yh7RMcB',
    priceId: 'price_1SwBShQ7FtTiAL4aS2j350wK',
    priceUsd: 99, // FOR SALE
  },
  'syn-graceful-degradation': {
    productId: 'prod_TtzR04e49rkeeF',
    priceId: 'price_1SwBSjQ7FtTiAL4aGALKx0Bu',
    priceUsd: 149, // FOR SALE
  },
  'syn-autonomous-evolution': {
    productId: 'prod_TtzRHSGLRYBhya',
    priceId: 'price_1SwBSkQ7FtTiAL4auQ8H724n',
    priceUsd: 299, // FOR SALE - Autonomous evolution (not code gen)
  },
  'syn-cognitive-fusion': {
    productId: 'prod_TtzRImij78dlk0',
    priceId: 'price_1SwBSmQ7FtTiAL4a2Vcrdxhm',
    priceUsd: 149, // FOR SALE
  },
  'syn-self-healing': {
    productId: 'prod_TtzREec5TXBQmF',
    priceId: 'price_1SwBSnQ7FtTiAL4aokUoXhju',
    priceUsd: 199, // FOR SALE - Self-healing (runtime, not code)
  },
  'syn-threat-learning': {
    productId: 'prod_TtzRZ0ghqy1IOZ',
    priceId: 'price_1SwBSoQ7FtTiAL4aS60aQaSc',
    priceUsd: 149, // FOR SALE
  },
  'syn-end-to-end-reasoning': {
    productId: 'prod_TtzRGGaNJiBSWZ',
    priceId: 'price_1SwBSqQ7FtTiAL4aq47IP62M',
    priceUsd: 299, // FOR SALE - Reasoning pipeline
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW BUDGET CAPABILITIES — $19-$49 range
// ═══════════════════════════════════════════════════════════════════════════
export const BUDGET_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  'cap-json-validator': {
    productId: 'prod_TuzD8RJuqCSrNK',
    priceId: 'price_1Sx9F7Q7FtTiAL4aINxcTOse',
    priceUsd: 19,
  },
  'cap-date-parser': {
    productId: 'prod_TuzDFXcW3UV9wQ',
    priceId: 'price_1Sx9F8Q7FtTiAL4ap5MVSPMu',
    priceUsd: 19,
  },
  'cap-token-counter': {
    productId: 'prod_TuzDyjPRpOK9Ik',
    priceId: 'price_1Sx9F9Q7FtTiAL4aHQ9VoiET',
    priceUsd: 19,
  },
  'cap-id-generator': {
    productId: 'prod_TuzDFKDuhNfkMT',
    priceId: 'price_1Sx9FAQ7FtTiAL4aJ28jMM3y',
    priceUsd: 29,
  },
  'cap-log-formatter': {
    productId: 'prod_TuzDwKWrVnPLj0',
    priceId: 'price_1Sx9FBQ7FtTiAL4a7ASOirIC',
    priceUsd: 29,
  },
  'cap-env-loader': {
    productId: 'prod_TuzDeoM1LQHDS7',
    priceId: 'price_1Sx9FCQ7FtTiAL4aIXaS1bs9',
    priceUsd: 39,
  },
  'cap-retry-helper': {
    productId: 'prod_TuzDGLqp7xx4zg',
    priceId: 'price_1Sx9FDQ7FtTiAL4a8O4wBaPO',
    priceUsd: 39,
  },
  'cap-cache-utility': {
    productId: 'prod_TuzD9w8U3VBJOa',
    priceId: 'price_1Sx9FEQ7FtTiAL4aRkuirgsA',
    priceUsd: 49,
  },
  'cap-markdown-converter': {
    productId: 'prod_TuzDbzgZcgMRHA',
    priceId: 'price_1Sx9FEQ7FtTiAL4a1Suy4UmY',
    priceUsd: 49,
  },
  'cap-rate-limit-lite': {
    productId: 'prod_TuzDuWhhhcNfH7',
    priceId: 'price_1Sx9FFQ7FtTiAL4aXoKdSk61',
    priceUsd: 49,
  },
};

import { EXPANSION_STRIPE_CONFIG } from './stripe-expansion';
import { ULTRA_STRIPE_CONFIG } from './stripe-ultra';
import { STIER_STRIPE_CONFIG } from './stripe-stier';
import { RECURSIVE_STRIPE_CONFIG } from './stripe-recursive';

// Get all Stripe configs (Recursive first as highest tier, then S-tier)
export function getAllStripeConfigs(): Record<string, CapabilityStripeConfig> {
  return { 
    ...RECURSIVE_STRIPE_CONFIG,
    ...STIER_STRIPE_CONFIG, 
    ...CAPABILITY_STRIPE_CONFIG, 
    ...SYNERGY_STRIPE_CONFIG, 
    ...EXPANSION_STRIPE_CONFIG, 
    ...ULTRA_STRIPE_CONFIG,
    ...BUDGET_STRIPE_CONFIG,
  };
}

// Get config by capability ID
export function getStripeConfig(capabilityId: string): CapabilityStripeConfig | undefined {
  return RECURSIVE_STRIPE_CONFIG[capabilityId] 
    || STIER_STRIPE_CONFIG[capabilityId] 
    || CAPABILITY_STRIPE_CONFIG[capabilityId] 
    || SYNERGY_STRIPE_CONFIG[capabilityId] 
    || EXPANSION_STRIPE_CONFIG[capabilityId] 
    || ULTRA_STRIPE_CONFIG[capabilityId]
    || BUDGET_STRIPE_CONFIG[capabilityId];
}

// Check if capability has Stripe integration
export function hasStripeConfig(capabilityId: string): boolean {
  return capabilityId in RECURSIVE_STRIPE_CONFIG 
    || capabilityId in STIER_STRIPE_CONFIG 
    || capabilityId in CAPABILITY_STRIPE_CONFIG 
    || capabilityId in SYNERGY_STRIPE_CONFIG 
    || capabilityId in EXPANSION_STRIPE_CONFIG 
    || capabilityId in ULTRA_STRIPE_CONFIG
    || capabilityId in BUDGET_STRIPE_CONFIG;
}
