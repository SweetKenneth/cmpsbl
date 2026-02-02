/**
 * Capabilities Depot — Stripe Expansion
 * Product/price mappings for expanded capabilities
 * v1.2.0
 */

import type { CapabilityStripeConfig } from './stripe-config';

// Expansion capabilities Stripe config
export const EXPANSION_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // Intelligence Expansion
  'cap-semantic-reasoning': {
    productId: 'prod_expansion_sem_rea',
    priceId: 'price_expansion_sem_rea',
    priceUsd: 399,
  },
  'cap-intent-disambiguation': {
    productId: 'prod_expansion_int_dis',
    priceId: 'price_expansion_int_dis',
    priceUsd: 149,
  },
  'cap-knowledge-distillation': {
    productId: 'prod_expansion_kno_dis',
    priceId: 'price_expansion_kno_dis',
    priceUsd: 899,
  },
  'cap-temporal-reasoning': {
    productId: 'prod_expansion_tem_rea',
    priceId: 'price_expansion_tem_rea',
    priceUsd: 349,
  },
  'cap-analogy-engine': {
    productId: 'prod_expansion_ana_eng',
    priceId: 'price_expansion_ana_eng',
    priceUsd: 249,
  },
  'cap-hypothesis-generator': {
    productId: 'prod_expansion_hyp_gen',
    priceId: 'price_expansion_hyp_gen',
    priceUsd: 299,
  },

  // Optimization Expansion
  'cap-latency-optimizer': {
    productId: 'prod_expansion_lat_opt',
    priceId: 'price_expansion_lat_opt',
    priceUsd: 249,
  },
  'cap-token-budgeting': {
    productId: 'prod_expansion_tok_bud',
    priceId: 'price_expansion_tok_bud',
    priceUsd: 199,
  },
  'cap-context-compression': {
    productId: 'prod_expansion_ctx_cmp',
    priceId: 'price_expansion_ctx_cmp',
    priceUsd: 179,
  },
  'cap-batch-orchestrator': {
    productId: 'prod_expansion_bat_orc',
    priceId: 'price_expansion_bat_orc',
    priceUsd: 299,
  },
  'cap-memory-pooling': {
    productId: 'prod_expansion_mem_poo',
    priceId: 'price_expansion_mem_poo',
    priceUsd: 449,
  },
  'cap-query-optimizer': {
    productId: 'prod_expansion_que_opt',
    priceId: 'price_expansion_que_opt',
    priceUsd: 219,
  },

  // Resilience Expansion
  'cap-circuit-breaker-pro': {
    productId: 'prod_expansion_cir_bre',
    priceId: 'price_expansion_cir_bre',
    priceUsd: 349,
  },
  'cap-retry-orchestrator': {
    productId: 'prod_expansion_ret_orc',
    priceId: 'price_expansion_ret_orc',
    priceUsd: 149,
  },
  'cap-failover-manager': {
    productId: 'prod_expansion_fai_mgr',
    priceId: 'price_expansion_fai_mgr',
    priceUsd: 549,
  },
  'cap-load-shedding': {
    productId: 'prod_expansion_loa_she',
    priceId: 'price_expansion_loa_she',
    priceUsd: 279,
  },
  'cap-bulkhead-isolation': {
    productId: 'prod_expansion_bul_iso',
    priceId: 'price_expansion_bul_iso',
    priceUsd: 329,
  },

  // Security Expansion
  'cap-anomaly-detection': {
    productId: 'prod_expansion_ano_det',
    priceId: 'price_expansion_ano_det',
    priceUsd: 449,
  },
  'cap-secret-rotation': {
    productId: 'prod_expansion_sec_rot',
    priceId: 'price_expansion_sec_rot',
    priceUsd: 399,
  },
  'cap-rate-limiter-pro': {
    productId: 'prod_expansion_rat_lim',
    priceId: 'price_expansion_rat_lim',
    priceUsd: 199,
  },
  'cap-input-sanitization': {
    productId: 'prod_expansion_inp_san',
    priceId: 'price_expansion_inp_san',
    priceUsd: 99,
  },
  'cap-access-control': {
    productId: 'prod_expansion_acc_ctl',
    priceId: 'price_expansion_acc_ctl',
    priceUsd: 549,
  },
  'cap-encryption-toolkit': {
    productId: 'prod_expansion_enc_too',
    priceId: 'price_expansion_enc_too',
    priceUsd: 649,
  },

  // Accessibility Expansion
  'cap-screen-reader-optimizer': {
    productId: 'prod_expansion_scr_rea',
    priceId: 'price_expansion_scr_rea',
    priceUsd: 79,
  },
  'cap-color-contrast': {
    productId: 'prod_expansion_col_con',
    priceId: 'price_expansion_col_con',
    priceUsd: 39,
  },
  'cap-keyboard-nav': {
    productId: 'prod_expansion_key_nav',
    priceId: 'price_expansion_key_nav',
    priceUsd: 59,
  },
  'cap-alt-text-generator': {
    productId: 'prod_expansion_alt_txt',
    priceId: 'price_expansion_alt_txt',
    priceUsd: 129,
  },

  // Automation Expansion
  'cap-workflow-engine': {
    productId: 'prod_expansion_wor_eng',
    priceId: 'price_expansion_wor_eng',
    priceUsd: 399,
  },
  'cap-event-sourcing': {
    productId: 'prod_expansion_evt_src',
    priceId: 'price_expansion_evt_src',
    priceUsd: 449,
  },
  'cap-scheduler-pro': {
    productId: 'prod_expansion_sch_pro',
    priceId: 'price_expansion_sch_pro',
    priceUsd: 179,
  },
  'cap-notification-hub': {
    productId: 'prod_expansion_not_hub',
    priceId: 'price_expansion_not_hub',
    priceUsd: 149,
  },
  'cap-state-machine': {
    productId: 'prod_expansion_sta_mac',
    priceId: 'price_expansion_sta_mac',
    priceUsd: 199,
  },

  // Flagship Expansion
  'cap-enterprise-mesh': {
    productId: 'prod_expansion_ent_mes',
    priceId: 'price_expansion_ent_mes',
    priceUsd: 2999,
  },
  'cap-cognitive-platform': {
    productId: 'prod_expansion_cog_pla',
    priceId: 'price_expansion_cog_pla',
    priceUsd: 2499,
  },
  'cap-security-suite': {
    productId: 'prod_expansion_sec_sui',
    priceId: 'price_expansion_sec_sui',
    priceUsd: 1999,
  },
  'cap-resilience-platform': {
    productId: 'prod_expansion_res_pla',
    priceId: 'price_expansion_res_pla',
    priceUsd: 1799,
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
