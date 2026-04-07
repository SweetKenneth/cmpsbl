/**
 * CMPSBL FINTECH™ — Vertical Crown Jewel Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 80 Architectural Crown Jewels: 5 per each of the 16 fintech primitives.
 * Classification: Architecture (permanently black-boxed).
 * All CJPI ≥ 92 — governor-curated, S-Tier.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from './types';

/* ─── Helper ─── */
function cj(
  rank: number, id: string, name: string, cjpi: number,
  module: string, description: string, sig: string,
): STierEntry {
  return {
    rank, id, name, cjpi, module,
    type: 'Architecture',
    description,
    dependencyFootprint: [],
    exportMode: 'PureStandalone',
    signatureHash: sig,
    version: '1.0.0',
    approved: true,
    generatedAt: '2026-04-07T00:00:00.000Z',
    hasCode: true,
  };
}

/* ═══════════════════════════════════════════════
   ENGINES (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── LEDGER ──
const LEDGER_JEWELS: STierEntry[] = [
  cj(500, 'S-LDG01', 'Double-Entry Invariant Enforcer', 97, 'LEDGER',
    'Guarantees every debit has a matching credit across unlimited account hierarchies. Uses Merkle-rooted batch verification to detect imbalance within microseconds of posting, even across multi-currency journals with 200+ GL codes.',
    'f1a2b3c4'),
  cj(501, 'S-LDG02', 'Multi-Currency Reconciliation Matrix', 96, 'LEDGER',
    'Real-time cross-currency reconciliation engine supporting 180+ currencies with spot, forward, and blended rate strategies. Auto-detects rounding drift and produces variance explanations for audit consumption.',
    'f2a3b4c5'),
  cj(502, 'S-LDG03', 'Accrual Recognition Automaton', 95, 'LEDGER',
    'Autonomous revenue and expense recognition engine implementing ASC 606 and IFRS 15. Handles multi-element arrangements, variable consideration, and performance obligation tracking with full reversal capability.',
    'f3a4b5c6'),
  cj(503, 'S-LDG04', 'Intercompany Elimination Kernel', 94, 'LEDGER',
    'Automatically identifies and eliminates intercompany transactions across complex corporate hierarchies. Handles partial ownership, minority interests, and currency translation adjustments for consolidated reporting.',
    'f4a5b6c7'),
  cj(504, 'S-LDG05', 'Real-Time Trial Balance Generator', 96, 'LEDGER',
    'Produces trial balances on demand from the immutable journal with sub-second latency. Supports as-of-date queries, segment filtering, and comparative period analysis without materialized views.',
    'f5a6b7c8'),
];

// ── VAULT_FIN ──
const VAULT_FIN_JEWELS: STierEntry[] = [
  cj(505, 'S-VLF01', 'HSM-Grade Key Hierarchy Manager', 97, 'VAULT_FIN',
    'Implements NIST SP 800-57 key management lifecycle with automated rotation, split-knowledge key ceremonies, and hardware security module integration for master key protection.',
    'g1b2c3d4'),
  cj(506, 'S-VLF02', 'Multi-Signature Authorization Engine', 96, 'VAULT_FIN',
    'Threshold signature orchestrator supporting M-of-N approval schemes with time-locked transactions, geographic distribution requirements, and quorum-based emergency override protocols.',
    'g2b3c4d5'),
  cj(507, 'S-VLF03', 'Cold-Hot Wallet Segregation Controller', 95, 'VAULT_FIN',
    'Manages the boundary between cold storage and hot wallet environments with automated sweep thresholds, rate-limited withdrawal windows, and real-time reserve ratio enforcement.',
    'g3b4c5d6'),
  cj(508, 'S-VLF04', 'Proof-of-Reserve Attestation Engine', 94, 'VAULT_FIN',
    'Generates cryptographic proofs of solvency using Merkle tree inclusion proofs. Allows third-party auditors to verify reserves without exposing individual account balances.',
    'g4b5c6d7'),
  cj(509, 'S-VLF05', 'Asset Tokenization Pipeline', 95, 'VAULT_FIN',
    'Converts traditional financial instruments (bonds, equities, real estate) into tokenized representations with embedded compliance rules, dividend distribution logic, and transfer restrictions.',
    'g5b6c7d8'),
];

// ── TICKER ──
const TICKER_JEWELS: STierEntry[] = [
  cj(510, 'S-TKR01', 'Sub-Millisecond Price Feed Normalizer', 97, 'TICKER',
    'Ingests heterogeneous market data from 50+ exchanges, normalizes timestamp formats, and produces a unified price tape with provenance tracking and stale-data flagging.',
    'h1c2d3e4'),
  cj(511, 'S-TKR02', 'VWAP/TWAP Calculation Engine', 95, 'TICKER',
    'Computes volume-weighted and time-weighted average prices with configurable window sizes, outlier rejection, and cross-venue aggregation for best-execution analysis.',
    'h2c3d4e5'),
  cj(512, 'S-TKR03', 'Order Book Depth Reconstructor', 96, 'TICKER',
    'Rebuilds full order book depth from incremental L2/L3 market data updates. Detects spoofing patterns, iceberg orders, and liquidity vacuums in real-time.',
    'h3c4d5e6'),
  cj(513, 'S-TKR04', 'Gap Detection and Fill Analyzer', 94, 'TICKER',
    'Identifies price gaps across trading sessions, correlates with volume profiles, and predicts gap-fill probability using historical pattern matching across 10,000+ instruments.',
    'h4c5d6e7'),
  cj(514, 'S-TKR05', 'Exchange Latency Monitor', 93, 'TICKER',
    'Continuously measures round-trip latency to each connected exchange, detects degradation patterns, and triggers automatic failover to backup feeds when thresholds are breached.',
    'h5c6d7e8'),
];

// ── CLEARING ──
const CLEARING_JEWELS: STierEntry[] = [
  cj(515, 'S-CLR01', 'Multilateral Netting Optimizer', 97, 'CLEARING',
    'Reduces gross settlement obligations by 60-80% through graph-based multilateral netting algorithms. Handles partial fills, amended trades, and cross-product netting sets.',
    'i1d2e3f4'),
  cj(516, 'S-CLR02', 'T+0 Settlement Orchestrator', 96, 'CLEARING',
    'Manages atomic delivery-versus-payment settlement for T+0 cycles with rollback capability. Coordinates across custodians, transfer agents, and central securities depositories.',
    'i2d3e4f5'),
  cj(517, 'S-CLR03', 'Initial Margin Calculator (SIMM)', 95, 'CLEARING',
    'Implements ISDA Standard Initial Margin Model with sensitivity-based calculations, netting agreement parsing, and collateral eligibility determination across 6 risk classes.',
    'i3d4e5f6'),
  cj(518, 'S-CLR04', 'Fail Management and Recall Engine', 94, 'CLEARING',
    'Tracks settlement fails, calculates penalty interest under CSDR/SEC rules, initiates buy-in procedures, and manages partial delivery workflows.',
    'i4d5e6f7'),
  cj(519, 'S-CLR05', 'Collateral Optimization Allocator', 95, 'CLEARING',
    'Minimizes the cost of posted collateral by optimizing allocation across margin calls using linear programming, considering haircuts, concentration limits, and reuse eligibility.',
    'i5d6e7f8'),
];

// ── RISKCORE ──
const RISKCORE_JEWELS: STierEntry[] = [
  cj(520, 'S-RSK01', 'Historical VaR Engine (Full Revaluation)', 97, 'RISKCORE',
    'Computes Value-at-Risk using full revaluation against 2,500+ historical scenarios with parallel GPU-accelerated pricing. Supports parametric, historical, and Monte Carlo methodologies.',
    'j1e2f3g4'),
  cj(521, 'S-RSK02', 'Stress Test Scenario Generator', 96, 'RISKCORE',
    'Generates deterministic and reverse stress test scenarios across interest rates, credit spreads, FX, equity, and commodity risk factors. Implements regulatory scenarios (EBA, CCAR, DFAST).',
    'j2e3f4g5'),
  cj(522, 'S-RSK03', 'Greeks Calculation Grid', 95, 'RISKCORE',
    'Computes first and second-order sensitivities (Delta, Gamma, Vega, Theta, Rho) for options portfolios using analytical, finite-difference, and AAD methods with cross-gamma support.',
    'j3e4f5g6'),
  cj(523, 'S-RSK04', 'Correlation Matrix Estimator', 94, 'RISKCORE',
    'Estimates and validates correlation matrices using Ledoit-Wolf shrinkage, DCC-GARCH, and random matrix theory cleaning. Detects regime changes and structural breaks in correlation regimes.',
    'j4e5f6g7'),
  cj(524, 'S-RSK05', 'CVaR Tail Risk Decomposer', 95, 'RISKCORE',
    'Decomposes Conditional VaR contributions by position, risk factor, and strategy to identify concentrated tail exposures. Supports Euler allocation for additive risk budgeting.',
    'j5e6f7g8'),
];

// ── PAYRAIL ──
const PAYRAIL_JEWELS: STierEntry[] = [
  cj(525, 'S-PAY01', 'Intelligent Payment Router', 97, 'PAYRAIL',
    'Routes payments across ACH, SWIFT, SEPA, FedNow, and card networks using cost, speed, and reliability optimization. Maintains real-time corridor pricing and automatic failover paths.',
    'k1f2g3h4'),
  cj(526, 'S-PAY02', 'ISO 20022 Message Transformer', 95, 'PAYRAIL',
    'Bidirectional translation between legacy SWIFT MT messages and ISO 20022 MX formats with semantic validation, truncation handling, and regulatory enrichment for cross-border payments.',
    'k2f3g4h5'),
  cj(527, 'S-PAY03', 'FedNow Instant Settlement Adapter', 96, 'PAYRAIL',
    'Native integration with the Federal Reserve FedNow service for 24/7/365 instant settlement. Handles request-for-payment flows, return processing, and liquidity position monitoring.',
    'k3f4g5h6'),
  cj(528, 'S-PAY04', 'Cross-Border Corridor Optimizer', 94, 'PAYRAIL',
    'Optimizes cross-border payment routing by analyzing correspondent banking networks, nostro/vostro balances, and real-time FX rates to minimize cost and maximize settlement speed.',
    'k4f5g6h7'),
  cj(529, 'S-PAY05', 'Payment Idempotency Guardian', 95, 'PAYRAIL',
    'Prevents duplicate payment execution through content-based fingerprinting, temporal windowing, and distributed consensus. Handles retries, timeouts, and network partitions gracefully.',
    'k5f6g7h8'),
];

// ── TAXENGINE ──
const TAXENGINE_JEWELS: STierEntry[] = [
  cj(530, 'S-TAX01', 'Capital Gains Lot Optimizer', 96, 'TAXENGINE',
    'Selects optimal tax lots using FIFO, LIFO, HIFO, and specific identification methods. Projects tax impact across holding periods and suggests tax-loss harvesting opportunities.',
    'l1g2h3i4'),
  cj(531, 'S-TAX02', 'Wash Sale Detection Engine', 95, 'TAXENGINE',
    'Detects wash sales across accounts, related parties, and substantially identical securities within the 61-day window. Adjusts cost basis and holding periods automatically.',
    'l2g3h4i5'),
  cj(532, 'S-TAX03', 'Multi-Jurisdiction Tax Calculator', 94, 'TAXENGINE',
    'Computes tax obligations across 50+ jurisdictions with treaty analysis, foreign tax credit optimization, and permanent establishment risk assessment for cross-border transactions.',
    'l3g4h5i6'),
  cj(533, 'S-TAX04', '1099/W-8 Form Generator', 93, 'TAXENGINE',
    'Produces IRS-compliant 1099-B, 1099-DIV, 1099-INT, and W-8BEN forms with automated TIN validation, backup withholding determination, and electronic filing capability.',
    'l4g5h6i7'),
  cj(534, 'S-TAX05', 'Tax Loss Harvesting Strategist', 95, 'TAXENGINE',
    'Identifies tax-loss harvesting opportunities in real-time by monitoring unrealized losses against a replacement security universe. Avoids wash sale triggers while maximizing tax alpha.',
    'l5g6h7i8'),
];

// ── MATCHBOOK ──
const MATCHBOOK_JEWELS: STierEntry[] = [
  cj(535, 'S-MTB01', 'Price-Time Priority Matching Kernel', 97, 'MATCHBOOK',
    'Sub-microsecond order matching with strict price-time priority, supporting limit, market, stop, and stop-limit order types with partial fill and self-trade prevention.',
    'm1h2i3j4'),
  cj(536, 'S-MTB02', 'Continuous Auction Engine', 95, 'MATCHBOOK',
    'Manages opening, closing, and intraday auction mechanisms with indicative price calculation, order imbalance disclosure, and extension logic for price discovery.',
    'm2h3i4j5'),
  cj(537, 'S-MTB03', 'Iceberg Order Manager', 94, 'MATCHBOOK',
    'Handles iceberg/hidden quantity orders with configurable display quantities, random replenishment strategies, and market-data suppression to minimize information leakage.',
    'm3h4i5j6'),
  cj(538, 'S-MTB04', 'Circuit Breaker Halt Controller', 96, 'MATCHBOOK',
    'Implements LULD (Limit Up/Limit Down) and market-wide circuit breakers with configurable reference price bands, trading pause durations, and orderly resumption protocols.',
    'm4h5i6j7'),
  cj(539, 'S-MTB05', 'Self-Trade Prevention Filter', 93, 'MATCHBOOK',
    'Prevents inadvertent self-trades by matching participant IDs across order sides. Supports cancel-newest, cancel-oldest, and cancel-both prevention strategies.',
    'm5h6i7j8'),
];

/* ═══════════════════════════════════════════════
   AGENTS (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── SENTINEL_FIN ──
const SENTINEL_FIN_JEWELS: STierEntry[] = [
  cj(540, 'S-SFN01', 'Transaction Velocity Profiler', 96, 'SENTINEL_FIN',
    'Builds per-customer velocity profiles across transaction amount, frequency, geography, and device fingerprint. Detects anomalous bursts using sliding-window percentile thresholds.',
    'n1i2j3k4'),
  cj(541, 'S-SFN02', 'Geo-Impossibility Detector', 97, 'SENTINEL_FIN',
    'Flags transactions originating from geographically impossible locations based on travel-time analysis between consecutive authentications. Accounts for VPN, proxy, and known relay patterns.',
    'n2i3j4k5'),
  cj(542, 'S-SFN03', 'Behavioral Biometrics Analyzer', 95, 'SENTINEL_FIN',
    'Passive authentication through typing cadence, mouse dynamics, and touch pressure patterns. Maintains per-user behavioral baselines with continuous model adaptation.',
    'n3i4j5k6'),
  cj(543, 'S-SFN04', 'Synthetic Identity Detector', 94, 'SENTINEL_FIN',
    'Identifies synthetic identities by cross-referencing SSN issuance patterns, credit history depth, address stability, and device association graphs to detect fabricated personas.',
    'n4i5j6k7'),
  cj(544, 'S-SFN05', 'Chargeback Probability Scorer', 95, 'SENTINEL_FIN',
    'Predicts chargeback likelihood at transaction time using merchant category, card-present indicators, historical dispute rates, and customer risk segmentation.',
    'n5i6j7k8'),
];

// ── REGULATOR ──
const REGULATOR_JEWELS: STierEntry[] = [
  cj(545, 'S-REG01', 'AML Transaction Monitoring Engine', 97, 'REGULATOR',
    'Monitors transaction flows for structuring (smurfing), layering, and integration patterns. Applies FATF typologies and generates SARs with supporting evidence packages.',
    'o1j2k3l4'),
  cj(546, 'S-REG02', 'KYC Verification Orchestrator', 96, 'REGULATOR',
    'Coordinates multi-source identity verification (government ID, utility bill, biometric) with risk-based tiering, PEP screening, and adverse media monitoring.',
    'o2j3k4l5'),
  cj(547, 'S-REG03', 'Basel III Capital Adequacy Calculator', 95, 'REGULATOR',
    'Computes CET1, Tier 1, and Total Capital ratios using standardized and IRB approaches. Monitors capital buffers (CCyB, G-SIB, D-SIB) with early warning triggers.',
    'o3j4k5l6'),
  cj(548, 'S-REG04', 'PSD2 Strong Authentication Enforcer', 94, 'REGULATOR',
    'Enforces PSD2 SCA requirements with dynamic linking, transaction risk analysis exemptions, and delegated authentication flows for trusted beneficiaries.',
    'o4j5k6l7'),
  cj(549, 'S-REG05', 'Sanctions Screening Engine', 95, 'REGULATOR',
    'Screens counterparties against OFAC SDN, EU, UK, and UN sanctions lists with fuzzy matching, transliteration handling, and vessel/BIC secondary screening.',
    'o5j6k7l8'),
];

// ── ARBITER ──
const ARBITER_JEWELS: STierEntry[] = [
  cj(550, 'S-ARB01', 'Chargeback Evidence Compiler', 95, 'ARBITER',
    'Automatically assembles compelling representment packages with transaction receipts, delivery confirmations, IP/device logs, and customer communication history.',
    'p1k2l3m4'),
  cj(551, 'S-ARB02', 'Dispute Reason Code Classifier', 94, 'ARBITER',
    'Classifies incoming chargebacks by Visa/MC/Amex reason codes and routes to optimal representment strategies based on historical win rates per code and merchant category.',
    'p2k3l4m5'),
  cj(552, 'S-ARB03', 'Pre-Arbitration Deflection Engine', 96, 'ARBITER',
    'Intercepts disputes before they escalate to arbitration by offering targeted refunds, credits, or resolutions based on dispute value, customer lifetime value, and win probability.',
    'p3k4l5m6'),
  cj(553, 'S-ARB04', 'Friendly Fraud Pattern Detector', 93, 'ARBITER',
    'Identifies first-party fraud patterns by correlating chargeback history, delivery confirmation, IP consistency, and behavioral indicators across customer accounts.',
    'p4k5l6m7'),
  cj(554, 'S-ARB05', 'Dispute Analytics Dashboard Engine', 94, 'ARBITER',
    'Produces merchant-level dispute analytics including win rates, response times, reason code distributions, and chargeback-to-transaction ratios with trend forecasting.',
    'p5k6l7m8'),
];

// ── UNDERWRITER ──
const UNDERWRITER_JEWELS: STierEntry[] = [
  cj(555, 'S-UND01', 'Alternative Data Credit Scorer', 96, 'UNDERWRITER',
    'Incorporates non-traditional data sources (rent payments, utility bills, bank transaction patterns) into credit risk models for thin-file and no-file applicants.',
    'q1l2m3n4'),
  cj(556, 'S-UND02', 'Automated Loan Origination Pipeline', 95, 'UNDERWRITER',
    'End-to-end loan origination from application intake through decisioning, document generation, and funding. Supports consumer, commercial, and mortgage product types.',
    'q2l3m4n5'),
  cj(557, 'S-UND03', 'Portfolio Credit Quality Monitor', 94, 'UNDERWRITER',
    'Continuously monitors loan portfolio health through delinquency migration analysis, vintage curve comparison, and expected credit loss (CECL/IFRS 9) calculation.',
    'q3l4m5n6'),
  cj(558, 'S-UND04', 'Covenant Compliance Tracker', 93, 'UNDERWRITER',
    'Monitors financial and non-financial covenants across commercial loan portfolios, generating early warning alerts when borrowers approach threshold breaches.',
    'q4l5m6n7'),
  cj(559, 'S-UND05', 'Probability of Default Model Engine', 95, 'UNDERWRITER',
    'Implements PD estimation using logistic regression, survival analysis, and machine learning ensembles with through-the-cycle and point-in-time calibration.',
    'q5l6m7n8'),
];

// ── TREASURER ──
const TREASURER_JEWELS: STierEntry[] = [
  cj(560, 'S-TRS01', 'Cash Position Forecasting Engine', 96, 'TREASURER',
    'Predicts daily cash positions across account hierarchies using scheduled payments, receivables aging, and seasonal pattern analysis with 30/60/90-day forward visibility.',
    'r1m2n3o4'),
  cj(561, 'S-TRS02', 'Liquidity Stress Test Simulator', 95, 'TREASURER',
    'Models liquidity adequacy under adverse scenarios including deposit runs, credit line revocations, and market disruptions. Produces LCR and NSFR calculations.',
    'r2m3n4o5'),
  cj(562, 'S-TRS03', 'Automated Sweep Controller', 94, 'TREASURER',
    'Manages zero-balance and target-balance sweep operations across account networks with configurable timing, priority ordering, and minimum balance preservation.',
    'r3m4n5o6'),
  cj(563, 'S-TRS04', 'FX Exposure Hedging Engine', 93, 'TREASURER',
    'Calculates net FX exposures from operations, forecasts, and financial positions. Recommends and executes hedging strategies using forwards, options, and natural offsets.',
    'r4m5n6o7'),
  cj(564, 'S-TRS05', 'Intercompany Funding Optimizer', 95, 'TREASURER',
    'Optimizes intercompany lending rates and funding flows considering transfer pricing regulations, thin capitalization rules, and withholding tax implications across jurisdictions.',
    'r5m6n7o8'),
];

// ── AUDITOR ──
const AUDITOR_JEWELS: STierEntry[] = [
  cj(565, 'S-AUD01', 'Continuous Control Testing Engine', 96, 'AUDITOR',
    'Executes automated control tests against predefined assertions (completeness, accuracy, authorization) on a continuous basis with exception-based alerting and trending.',
    's1n2o3p4'),
  cj(566, 'S-AUD02', 'SOX 404 Compliance Validator', 95, 'AUDITOR',
    'Maps business processes to SOX-relevant controls, tests operating effectiveness, and generates management assertion reports with identified deficiencies and remediation tracking.',
    's2n3o4p5'),
  cj(567, 'S-AUD03', 'Segregation of Duties Analyzer', 94, 'AUDITOR',
    'Maps user roles and permissions against an SoD conflict matrix, identifies toxic combinations, and recommends compensating controls or role restructuring.',
    's3n4o5p6'),
  cj(568, 'S-AUD04', 'Tamper-Evident Audit Trail Builder', 96, 'AUDITOR',
    'Produces cryptographically chained audit logs with Merkle tree anchoring. Any retroactive modification is detectable through hash chain verification.',
    's4n5o6p7'),
  cj(569, 'S-AUD05', 'Journal Entry Testing Automaton', 93, 'AUDITOR',
    'Automatically selects and tests journal entries for authorization, supporting documentation, and business rationale. Focuses on non-standard, round-amount, and period-end entries.',
    's5n6o7p8'),
];

// ── PORTFOLIO ──
const PORTFOLIO_JEWELS: STierEntry[] = [
  cj(570, 'S-PFL01', 'Dynamic Rebalancing Optimizer', 96, 'PORTFOLIO',
    'Triggers portfolio rebalancing based on drift thresholds, calendar schedules, or market events. Optimizes trade lists considering transaction costs, tax implications, and market impact.',
    't1o2p3q4'),
  cj(571, 'S-PFL02', 'Performance Attribution Engine', 95, 'PORTFOLIO',
    'Decomposes portfolio returns using Brinson-Fachler allocation/selection analysis and multi-factor risk models. Supports fixed-income, equity, and multi-asset attribution.',
    't2o3p4q5'),
  cj(572, 'S-PFL03', 'Benchmark Tracking Error Monitor', 94, 'PORTFOLIO',
    'Computes ex-ante and ex-post tracking error against benchmarks with factor decomposition. Alerts when tracking error exceeds mandate limits with contributing position identification.',
    't3o4p5q6'),
  cj(573, 'S-PFL04', 'Factor Exposure Analyzer', 93, 'PORTFOLIO',
    'Measures portfolio exposure to common factors (value, momentum, quality, size, volatility) using multi-factor regression. Detects unintended factor tilts and style drift.',
    't4o5p6q7'),
  cj(574, 'S-PFL05', 'Model Portfolio Constructor', 95, 'PORTFOLIO',
    'Constructs optimal portfolios using mean-variance optimization with Black-Litterman views, resampling, and robust optimization to handle estimation error in inputs.',
    't5o6p7q8'),
];

// ── COMPLIANCE ──
const COMPLIANCE_JEWELS: STierEntry[] = [
  cj(575, 'S-CMP01', 'Pre-Trade Compliance Gate', 97, 'COMPLIANCE',
    'Intercepts orders before execution to validate against investment mandates, concentration limits, restricted lists, and regulatory constraints with sub-millisecond latency.',
    'u1p2q3r4'),
  cj(576, 'S-CMP02', 'Position Limit Enforcer', 95, 'COMPLIANCE',
    'Monitors real-time position sizes against exchange-imposed, regulatory, and internal position limits across instruments, asset classes, and account groups.',
    'u2p3q4r5'),
  cj(577, 'S-CMP03', 'Trade Surveillance Engine', 96, 'COMPLIANCE',
    'Detects market manipulation patterns including spoofing, layering, wash trading, and front-running using order flow analysis and cross-market surveillance.',
    'u3p4q5r6'),
  cj(578, 'S-CMP04', 'Restricted List Screening Module', 94, 'COMPLIANCE',
    'Screens trading activity against firm-wide restricted, watch, and grey lists with fuzzy matching for corporate actions, ticker changes, and ISIN remapping.',
    'u4p5q6r7'),
  cj(579, 'S-CMP05', 'Best Execution Monitoring Engine', 95, 'COMPLIANCE',
    'Evaluates execution quality against benchmarks (arrival price, VWAP, implementation shortfall) and produces MiFID II/Reg NMS best execution reports.',
    'u5p6q7r8'),
];


/* ─── Assembled Registry ─── */

export const FINTECH_CROWN_JEWELS: STierEntry[] = [
  ...LEDGER_JEWELS,
  ...VAULT_FIN_JEWELS,
  ...TICKER_JEWELS,
  ...CLEARING_JEWELS,
  ...RISKCORE_JEWELS,
  ...PAYRAIL_JEWELS,
  ...TAXENGINE_JEWELS,
  ...MATCHBOOK_JEWELS,
  ...SENTINEL_FIN_JEWELS,
  ...REGULATOR_JEWELS,
  ...ARBITER_JEWELS,
  ...UNDERWRITER_JEWELS,
  ...TREASURER_JEWELS,
  ...AUDITOR_JEWELS,
  ...PORTFOLIO_JEWELS,
  ...COMPLIANCE_JEWELS,
];

/** Total count of fintech vertical Crown Jewels */
export const FINTECH_CJ_COUNT = FINTECH_CROWN_JEWELS.length; // 80

/** Get Crown Jewels for a specific fintech primitive */
export function getFintechJewelsByPrimitive(primitiveId: string): STierEntry[] {
  return FINTECH_CROWN_JEWELS.filter(j => j.module === primitiveId);
}

/** Get all fintech Crown Jewel IDs */
export function getFintechJewelIds(): string[] {
  return FINTECH_CROWN_JEWELS.map(j => j.id);
}

/** Get fintech jewels by minimum CJPI */
export function getFintechJewelsByCJPI(minCjpi: number): STierEntry[] {
  return FINTECH_CROWN_JEWELS.filter(j => j.cjpi >= minCjpi);
}

/** Primitive-to-jewel summary for dashboard display */
export function getFintechJewelSummary(): Array<{
  primitive: string;
  count: number;
  avgCjpi: number;
  topJewel: string;
}> {
  const primitives = [...new Set(FINTECH_CROWN_JEWELS.map(j => j.module))];
  return primitives.map(p => {
    const jewels = FINTECH_CROWN_JEWELS.filter(j => j.module === p);
    const top = jewels.reduce((a, b) => a.cjpi > b.cjpi ? a : b);
    return {
      primitive: p,
      count: jewels.length,
      avgCjpi: Math.round(jewels.reduce((s, j) => s + j.cjpi, 0) / jewels.length * 10) / 10,
      topJewel: top.name,
    };
  });
}
