/**
 * Capabilities Depot — Stripe Expansion
 * Normalized Stripe product/price mappings for expanded capabilities
 * v2.0.0 — Unified Pricing ($19-$299 public range)
 */

import type { CapabilityStripeConfig } from './stripe-config';

// Expansion capabilities Stripe config — Normalized to $19-$299 range
export const EXPANSION_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // Intelligence Expansion
  'cap-semantic-reasoning': {
    productId: 'prod_TtzloV6im9GRSR',
    priceId: 'price_1SwBlwQ7FtTiAL4axAqaaiTg',
    priceUsd: 149, // normalized from 399
  },
  'cap-intent-disambiguation': {
    productId: 'prod_Ttzll69BZyTqgg',
    priceId: 'price_1SwBlxQ7FtTiAL4aojDNaJDU',
    priceUsd: 99, // normalized from 149
  },
  'cap-knowledge-distillation': {
    productId: 'prod_TtzltM7DxEj6i8',
    priceId: 'price_1SwBlzQ7FtTiAL4agQtOhCXp',
    priceUsd: 299, // normalized from 899
  },
  'cap-temporal-reasoning': {
    productId: 'prod_TtzleIMTD9JPAF',
    priceId: 'price_1SwBm1Q7FtTiAL4aFKteQKtG',
    priceUsd: 149, // normalized from 349
  },
  'cap-analogy-engine': {
    productId: 'prod_TtzlnRuuRtTaFq',
    priceId: 'price_1SwBm2Q7FtTiAL4aDXET9GYH',
    priceUsd: 99, // normalized from 249
  },
  'cap-hypothesis-generator': {
    productId: 'prod_TtzltMEBacTdVb',
    priceId: 'price_1SwBm3Q7FtTiAL4aWyb1S3tw',
    priceUsd: 149, // normalized from 299
  },

  // Optimization Expansion
  'cap-latency-optimizer': {
    productId: 'prod_TtzlPp3QtGVJIT',
    priceId: 'price_1SwBm5Q7FtTiAL4aZrf4zrxL',
    priceUsd: 99, // normalized from 249
  },
  'cap-token-budgeting': {
    productId: 'prod_TtzlzcMnQYWa5M',
    priceId: 'price_1SwBm6Q7FtTiAL4aH1qYI1x6',
    priceUsd: 149, // normalized from 199
  },
  'cap-context-compression': {
    productId: 'prod_TtzlwQSR40kqCy',
    priceId: 'price_1SwBm7Q7FtTiAL4aEkQMyRSG',
    priceUsd: 99, // normalized from 179
  },
  'cap-batch-orchestrator': {
    productId: 'prod_TtzltvFJkFH3Fc',
    priceId: 'price_1SwBm9Q7FtTiAL4aqrrJa9El',
    priceUsd: 149, // normalized from 299
  },
  'cap-memory-pooling': {
    productId: 'prod_TtzlZuzA9ANWpB',
    priceId: 'price_1SwBmCQ7FtTiAL4aXnsUiSvW',
    priceUsd: 199, // normalized from 449
  },
  'cap-query-optimizer': {
    productId: 'prod_Ttzlygb6GPydLN',
    priceId: 'price_1SwBmEQ7FtTiAL4aR17K6lqz',
    priceUsd: 149, // normalized from 219
  },

  // Resilience Expansion
  'cap-circuit-breaker-pro': {
    productId: 'prod_TtzlFmr8QoaHVM',
    priceId: 'price_1SwBmFQ7FtTiAL4aGeDJ49wo',
    priceUsd: 149, // normalized from 349
  },
  'cap-retry-orchestrator': {
    productId: 'prod_Ttzl2sQOHq84d2',
    priceId: 'price_1SwBmGQ7FtTiAL4aEzdQ1yAo',
    priceUsd: 99, // normalized from 149
  },
  'cap-failover-manager': {
    productId: 'prod_TtzlOyJNIskWbM',
    priceId: 'price_1SwBmHQ7FtTiAL4a7w6HiMc6',
    priceUsd: 199, // normalized from 549
  },
  'cap-load-shedding': {
    productId: 'prod_Ttzl69EoofFcj6',
    priceId: 'price_1SwBmJQ7FtTiAL4aTilnaSPM',
    priceUsd: 149, // normalized from 279
  },
  'cap-bulkhead-isolation': {
    productId: 'prod_TtzlZhIMooOCpd',
    priceId: 'price_1SwBmKQ7FtTiAL4a2GMfg1k9',
    priceUsd: 149, // normalized from 329
  },

  // Security Expansion
  'cap-anomaly-detection': {
    productId: 'prod_TtzlTzg7xzDU38',
    priceId: 'price_1SwBmLQ7FtTiAL4ajGBip76w',
    priceUsd: 199, // normalized from 449
  },
  'cap-secret-rotation': {
    productId: 'prod_TtzlwPpuI2A2lu',
    priceId: 'price_1SwBmNQ7FtTiAL4aeZMBO1mK',
    priceUsd: 149, // normalized from 399
  },
  'cap-rate-limiter-pro': {
    productId: 'prod_TtzlCLws10jBGP',
    priceId: 'price_1SwBmNQ7FtTiAL4aZpKIxPEY',
    priceUsd: 149, // normalized from 199
  },
  'cap-input-sanitization': {
    productId: 'prod_TtzljjMeqohbBq',
    priceId: 'price_1SwBmRQ7FtTiAL4aj5N0S5oe',
    priceUsd: 49, // normalized from 99
  },
  'cap-access-control': {
    productId: 'prod_Ttzmh104kAtFEL',
    priceId: 'price_1SwBmSQ7FtTiAL4acUBQEvgv',
    priceUsd: 199, // normalized from 549
  },
  'cap-encryption-toolkit': {
    productId: 'prod_TtzmkHLDBbvpaO',
    priceId: 'price_1SwBmTQ7FtTiAL4aQMw5mQSo',
    priceUsd: 199, // normalized from 649
  },

  // Accessibility Expansion
  'cap-screen-reader-optimizer': {
    productId: 'prod_Ttzm2TfuhFB8wS',
    priceId: 'price_1SwBmUQ7FtTiAL4aE12zwxSu',
    priceUsd: 49, // normalized from 79
  },
  'cap-color-contrast': {
    productId: 'prod_Ttzme5CAYklhuV',
    priceId: 'price_1SwBmVQ7FtTiAL4ac7kvOVbR',
    priceUsd: 19, // normalized from 39
  },
  'cap-keyboard-nav': {
    productId: 'prod_TtzmBlT1gZElJP',
    priceId: 'price_1SwBmWQ7FtTiAL4ahM73IRqp',
    priceUsd: 19, // normalized from 59
  },
  'cap-alt-text-generator': {
    productId: 'prod_TtzmtLQ9yUHflL',
    priceId: 'price_1SwBmXQ7FtTiAL4aOEPYI97x',
    priceUsd: 49, // normalized from 129
  },

  // Automation Expansion
  'cap-workflow-engine': {
    productId: 'prod_TtzmrBef2LkWed',
    priceId: 'price_1SwBmYQ7FtTiAL4ayzfrPMjB',
    priceUsd: 149, // normalized from 399
  },
  'cap-event-sourcing': {
    productId: 'prod_TtzmQTCCNbUaau',
    priceId: 'price_1SwBmZQ7FtTiAL4a6kToI2pr',
    priceUsd: 199, // normalized from 449
  },
  'cap-scheduler-pro': {
    productId: 'prod_TtzmJVYOMpHtEz',
    priceId: 'price_1SwBmaQ7FtTiAL4akhbkVCeo',
    priceUsd: 99, // normalized from 179
  },
  'cap-notification-hub': {
    productId: 'prod_TtzmOAvynTetXT',
    priceId: 'price_1SwBmdQ7FtTiAL4aroaj2Vx8',
    priceUsd: 99, // normalized from 149
  },
  'cap-state-machine': {
    productId: 'prod_Ttzmc1UJZcPB4T',
    priceId: 'price_1SwBmfQ7FtTiAL4aTRIOPWQB',
    priceUsd: 149, // normalized from 199
  },

  // Flagship Expansion — Now FOR SALE at $299 ceiling (not code compilation)
  'cap-enterprise-mesh': {
    productId: 'prod_Ttzm3IGLUnxtXg',
    priceId: 'price_1SwBmgQ7FtTiAL4aDaRGvBMd',
    priceUsd: 299, // FOR SALE - Enterprise mesh (not code gen)
  },
  'cap-cognitive-platform': {
    productId: 'prod_Ttzm98E4Mv7UQ5',
    priceId: 'price_1SwBmhQ7FtTiAL4aU89A5AEH',
    priceUsd: 299, // FOR SALE - Cognitive platform
  },
  'cap-security-suite': {
    productId: 'prod_TtzmmOP8HKoEKM',
    priceId: 'price_1SwBmiQ7FtTiAL4aenCVhynX',
    priceUsd: 299, // FOR SALE - Security suite
  },
  'cap-resilience-platform': {
    productId: 'prod_Ttzmse1gqAIhDb',
    priceId: 'price_1SwBmjQ7FtTiAL4aU1oKwtPF',
    priceUsd: 299, // FOR SALE - Resilience platform
  },
};

// Get expansion config
export function getExpansionStripeConfig(capabilityId: string): CapabilityStripeConfig | undefined {
  return EXPANSION_STRIPE_CONFIG[capabilityId];
}

// Check if capability is in expansion
export function hasExpansionStripeConfig(capabilityId: string): boolean {
  return capabilityId in EXPANSION_STRIPE_CONFIG;
}
