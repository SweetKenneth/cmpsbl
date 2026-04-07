/**
 * CMPSBL FINTECH™ — Vertical Substrate Configuration
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Full 40-primitive cognitive infrastructure for financial technology.
 * 24 Spine + 8 Engines + 8 Agents = 40 Primitives.
 *
 * Domain: Financial services, banking, payments, trading, risk, compliance.
 * Subdomain: fintech.cmpsbl.com
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { getSpinePrimitives, assembleVerticalPrimitives } from '../vertical-substrate';
import { FINTECH_CROWN_JEWELS, getFintechJewelsByPrimitive, getFintechJewelSummary } from '@/crownjewels/fintech-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

/* ─── Fintech Engines ─── */

const FINTECH_ENGINES: VerticalPrimitive[] = [
  {
    id: 'LEDGER',
    name: 'LEDGER',
    role: 'engine',
    description: 'Double-entry accounting engine. Maintains immutable transaction journals, enforces balance invariants, and produces real-time trial balances across multi-currency portfolios.',
    inherited: false,
    replaces: 'CORTEX',
    capabilities: [
      'double_entry_accounting',
      'multi_currency_support',
      'trial_balance_generation',
      'journal_immutability',
      'reconciliation_engine',
      'accrual_recognition',
      'intercompany_elimination',
    ],
    weight: 0.040,
    classification: 'active',
  },
  {
    id: 'VAULT_FIN',
    name: 'VAULT_FIN',
    role: 'engine',
    description: 'Secure asset custody engine. Manages cryptographic key hierarchies, multi-signature authorization, and cold/hot wallet segregation for digital and traditional assets.',
    inherited: false,
    capabilities: [
      'key_hierarchy_management',
      'multisig_authorization',
      'cold_hot_segregation',
      'asset_tokenization',
      'custody_attestation',
      'withdrawal_governance',
    ],
    weight: 0.035,
    classification: 'hybrid',
  },
  {
    id: 'TICKER',
    name: 'TICKER',
    role: 'engine',
    description: 'Real-time market data engine. Ingests, normalizes, and distributes price feeds across exchanges with sub-millisecond latency and gap detection.',
    inherited: false,
    capabilities: [
      'price_feed_normalization',
      'exchange_aggregation',
      'tick_data_compression',
      'gap_detection',
      'vwap_calculation',
      'order_book_reconstruction',
      'latency_monitoring',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'CLEARING',
    name: 'CLEARING',
    role: 'engine',
    description: 'Trade clearing and settlement engine. Handles netting, novation, margin calculation, and delivery-versus-payment (DvP) across T+0 to T+2 settlement cycles.',
    inherited: false,
    capabilities: [
      'trade_netting',
      'novation_processing',
      'margin_calculation',
      'dvp_settlement',
      'fail_management',
      'collateral_optimization',
    ],
    weight: 0.035,
    classification: 'active',
  },
  {
    id: 'RISKCORE',
    name: 'RISKCORE',
    role: 'engine',
    description: 'Quantitative risk modeling engine. Computes VaR, CVaR, Greeks, stress scenarios, and Monte Carlo simulations for portfolio-level and instrument-level risk assessment.',
    inherited: false,
    capabilities: [
      'var_computation',
      'cvar_tail_risk',
      'greeks_calculation',
      'stress_testing',
      'monte_carlo_simulation',
      'scenario_analysis',
      'correlation_matrix',
    ],
    weight: 0.035,
    classification: 'passive',
  },
  {
    id: 'PAYRAIL',
    name: 'PAYRAIL',
    role: 'engine',
    description: 'Payment routing and orchestration engine. Routes transactions across ACH, SWIFT, SEPA, FedNow, and card networks with automatic failover and least-cost routing.',
    inherited: false,
    capabilities: [
      'payment_routing',
      'ach_processing',
      'swift_messaging',
      'sepa_integration',
      'fednow_instant',
      'card_network_routing',
      'least_cost_optimization',
    ],
    weight: 0.035,
    classification: 'active',
  },
  {
    id: 'TAXENGINE',
    name: 'TAXENGINE',
    role: 'engine',
    description: 'Tax computation and reporting engine. Calculates withholding, capital gains (FIFO/LIFO/HIFO), and generates 1099/W-8 forms with multi-jurisdiction support.',
    inherited: false,
    capabilities: [
      'withholding_calculation',
      'capital_gains_fifo',
      'capital_gains_lifo',
      'form_1099_generation',
      'multi_jurisdiction_tax',
      'wash_sale_detection',
      'tax_loss_harvesting',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'MATCHBOOK',
    name: 'MATCHBOOK',
    role: 'engine',
    description: 'Order matching engine. Implements price-time priority, pro-rata, and auction matching algorithms for exchange-grade order book management.',
    inherited: false,
    capabilities: [
      'price_time_priority',
      'pro_rata_matching',
      'auction_matching',
      'order_book_management',
      'iceberg_order_support',
      'circuit_breaker_halts',
    ],
    weight: 0.030,
    classification: 'active',
  },
];

/* ─── Fintech Agents ─── */

const FINTECH_AGENTS: VerticalPrimitive[] = [
  {
    id: 'SENTINEL_FIN',
    name: 'SENTINEL_FIN',
    role: 'agent',
    description: 'Fraud detection agent. Monitors transaction patterns for anomalous behavior using velocity checks, geo-impossibility, and behavioral biometrics.',
    inherited: false,
    capabilities: [
      'velocity_checking',
      'geo_impossibility_detection',
      'behavioral_biometrics',
      'transaction_scoring',
      'chargeback_prediction',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'REGULATOR',
    name: 'REGULATOR',
    role: 'agent',
    description: 'Regulatory compliance agent. Continuously validates operations against Basel III/IV, MiFID II, Dodd-Frank, PSD2, and AML/KYC requirements.',
    inherited: false,
    capabilities: [
      'basel_iii_validation',
      'mifid_ii_compliance',
      'dodd_frank_monitoring',
      'psd2_sca_enforcement',
      'aml_screening',
      'kyc_verification',
      'sanctions_screening',
    ],
    weight: 0.025,
    classification: 'hybrid',
  },
  {
    id: 'ARBITER',
    name: 'ARBITER',
    role: 'agent',
    description: 'Dispute resolution agent. Manages chargeback workflows, evidence compilation, and arbitration case management across card networks.',
    inherited: false,
    capabilities: [
      'chargeback_management',
      'evidence_compilation',
      'arbitration_workflow',
      'representment_automation',
      'dispute_analytics',
    ],
    weight: 0.020,
    classification: 'hybrid',
  },
  {
    id: 'UNDERWRITER',
    name: 'UNDERWRITER',
    role: 'agent',
    description: 'Credit and lending agent. Evaluates creditworthiness using traditional and alternative data, manages loan origination, and monitors portfolio credit quality.',
    inherited: false,
    capabilities: [
      'credit_scoring',
      'alternative_data_scoring',
      'loan_origination',
      'portfolio_monitoring',
      'covenant_tracking',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'TREASURER',
    name: 'TREASURER',
    role: 'agent',
    description: 'Treasury management agent. Optimizes cash positions, manages liquidity buffers, and coordinates sweep operations across account hierarchies.',
    inherited: false,
    capabilities: [
      'cash_position_optimization',
      'liquidity_forecasting',
      'sweep_operations',
      'interest_rate_hedging',
      'fx_exposure_management',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'AUDITOR',
    name: 'AUDITOR',
    role: 'agent',
    description: 'Internal audit agent. Performs continuous control testing, SOX compliance verification, and generates audit trails with exception reporting.',
    inherited: false,
    capabilities: [
      'continuous_control_testing',
      'sox_compliance',
      'audit_trail_generation',
      'exception_reporting',
      'segregation_of_duties',
      'access_review',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'PORTFOLIO',
    name: 'PORTFOLIO',
    role: 'agent',
    description: 'Portfolio management agent. Handles rebalancing, drift detection, benchmark tracking, and attribution analysis across multi-asset portfolios.',
    inherited: false,
    capabilities: [
      'portfolio_rebalancing',
      'drift_detection',
      'benchmark_tracking',
      'attribution_analysis',
      'factor_exposure_monitoring',
    ],
    weight: 0.020,
    classification: 'hybrid',
  },
  {
    id: 'COMPLIANCE',
    name: 'COMPLIANCE',
    role: 'agent',
    description: 'Real-time compliance monitoring agent. Enforces trade limits, position limits, restricted lists, and pre-trade compliance checks.',
    inherited: false,
    capabilities: [
      'pre_trade_compliance',
      'position_limit_enforcement',
      'restricted_list_screening',
      'trade_surveillance',
      'market_abuse_detection',
    ],
    weight: 0.020,
    classification: 'active',
  },
];

/* ─── Assembled Fintech Substrate ─── */

export function getFintechPrimitives(): VerticalPrimitive[] {
  return assembleVerticalPrimitives(FINTECH_ENGINES, FINTECH_AGENTS);
}

export function getFintechEngines(): VerticalPrimitive[] {
  return [...FINTECH_ENGINES];
}

export function getFintechAgents(): VerticalPrimitive[] {
  return [...FINTECH_AGENTS];
}

/**
 * Full Fintech vertical substrate configuration
 */
export function getFintechSubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'fintech-v1',
    name: 'CMPSBL FINTECH™',
    tagline: 'Cognitive Financial Infrastructure — Every Transaction Governed',
    domain: 'fintech',
    subdomain: 'fintech',
    url: 'https://fintech.cmpsbl.com',
    status: 'assembling',
    version: '1.0.0',
    primitives: getFintechPrimitives(),
    clmCurriculum: {
      cyclesPerDay: 2400,
      curriculum: [
        'payment_processing_patterns',
        'risk_model_calibration',
        'regulatory_framework_updates',
        'fraud_detection_heuristics',
        'settlement_optimization',
        'market_microstructure',
        'credit_risk_assessment',
        'anti_money_laundering',
        'portfolio_theory',
        'tax_computation_rules',
      ],
      priorityPrimitives: ['LEDGER', 'RISKCORE', 'PAYRAIL', 'REGULATOR'],
      batchSize: 4,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 4,
      scannerFocus: [
        'regulatory_change_monitoring',
        'market_risk_evolution',
        'fraud_pattern_synthesis',
        'settlement_failure_analysis',
        'payment_rail_optimization',
        'compliance_framework_updates',
      ],
      contributesToGlobal: true,
      retentionDays: 365,
    },
    ascensionConfig: {
      maxCapabilities: 20,
      enhancementArchetypes: [
        'Autonomous Fraud Prevention',
        'Real-Time Risk Governance',
        'Payment Rail Orchestration',
        'Regulatory Compliance Automation',
        'Trade Settlement Optimization',
        'Credit Underwriting Intelligence',
        'Tax Computation Automation',
        'Portfolio Rebalancing Engine',
        'Treasury Cash Optimization',
        'Market Surveillance Grid',
      ],
      cjpiWeights: {
        security: 0.35,
        performance: 0.25,
        reliability: 0.30,
        maintainability: 0.10,
      },
      collisionPriority: ['LEDGER', 'RISKCORE', 'PAYRAIL', 'SENTINEL_FIN', 'REGULATOR'],
    },
    theme: {
      primaryHue: 152,
      icon: 'DollarSign',
      gradientAngle: 135,
      darkAccent: '152 70% 55%',
      lightAccent: '152 65% 38%',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get all capabilities across the Fintech vertical
 */
export function getAllFintechCapabilities(): string[] {
  const primitives = getFintechPrimitives();
  const capabilities = new Set<string>();
  for (const p of primitives) {
    for (const cap of p.capabilities) {
      capabilities.add(cap);
    }
  }
  return Array.from(capabilities).sort();
}

/* ═══════════════════════════════════════════════
   Crown Jewel Integration — S-Tier Registry Surface
   ═══════════════════════════════════════════════ */

/** All 80 architectural Crown Jewels for the FINTECH™ vertical */
export function getFintechCrownJewels(): STierEntry[] {
  return [...FINTECH_CROWN_JEWELS];
}

/** Crown Jewels for a specific fintech primitive */
export function getFintechPrimitiveCrownJewels(primitiveId: string): STierEntry[] {
  return getFintechJewelsByPrimitive(primitiveId);
}

/** Crown Jewel summary per primitive (for dashboard) */
export function getFintechCrownJewelSummary() {
  return getFintechJewelSummary();
}

/** Total Crown Jewel count for the vertical */
export function getFintechCrownJewelCount(): number {
  return FINTECH_CROWN_JEWELS.length;
}

/** All Crown Jewel capability IDs as active capabilities */
export function getFintechCrownJewelCapabilities(): string[] {
  return FINTECH_CROWN_JEWELS.map(j =>
    j.id.toLowerCase().replace(/^s-/, 'cj_')
  );
}
