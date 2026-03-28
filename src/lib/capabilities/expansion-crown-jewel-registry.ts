/**
 * Expansion Crown Jewel Discovery Registry
 * 
 * Canonical registry of Crown Jewels discovered from expansion primitives.
 * Each capability is CJPI-scored, tier-classified, and activation-decided.
 * 
 * 11 Expansion Primitives:
 *   ORACLE, SOVEREIGN, SHADOW, FORGE, HARVEST,
 *   TREATY, COMPASS, PHANTOM, ECHO, LINGUA, REFLEX
 *
 * Classification Rules:
 *   Architecture (GUARD): Multi-primitive, governance-layer, or structural IP
 *   Experience (SURFACE): Single-primitive, user-facing, sealed black-box
 *
 * Activation Rules:
 *   ACTIVE: Ready for production, tier-gated
 *   GUARDED: Too sensitive or not production-ready, governor-only
 *   DEFERRED: Needs further development before activation
 */

import type { ProductTier } from '@/lib/quarry/types';
import { calculateCJPI, classifyTier, type DiscoveredCapability } from './expansion-discovery';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ActivationStatus = 'active' | 'guarded' | 'deferred';

export interface ExpansionCrownJewel {
  id: string;
  name: string;
  primitive: string;
  description: string;
  modules: string[];
  cjpiScores: { novelty: number; utility: number; complexity: number; composability: number };
  cjpiTotal: number;
  classification: 'architecture' | 'experience';
  tier: ProductTier;
  activation: ActivationStatus;
  activationReason: string;
  blackBoxed: boolean;
  sealedExecution: boolean;
  isCrownJewel: boolean;
  isSTier: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORACLE CROWN JEWELS — Predictive Modeling & Probabilistic Reasoning
// ═══════════════════════════════════════════════════════════════════════════════

const ORACLE_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-oracle-bayesian-inference-engine',
    name: 'Bayesian Inference Engine',
    primitive: 'ORACLE',
    description: 'Full Bayesian network construction with belief propagation, downstream causal inference, and multi-factor posterior computation',
    modules: ['ORACLE'],
    cjpiScores: { novelty: 88, utility: 92, complexity: 85, composability: 78 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Core prediction capability, production-hardened with circuit breaker',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-oracle-monte-carlo-convergence',
    name: 'Monte Carlo Convergence Engine',
    primitive: 'ORACLE',
    description: 'Adaptive Monte Carlo simulation with early convergence detection, confidence intervals (90/95/99), and percentile distribution',
    modules: ['ORACLE'],
    cjpiScores: { novelty: 82, utility: 90, complexity: 80, composability: 72 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Statistically rigorous simulation, saves compute via early convergence',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-oracle-causal-graph-traversal',
    name: 'Causal Graph Traversal',
    primitive: 'ORACLE',
    description: 'Edge-wired causal networks with BFS belief propagation, parent-aggregated influence scoring, and cycle-safe traversal',
    modules: ['ORACLE'],
    cjpiScores: { novelty: 90, utility: 85, complexity: 88, composability: 82 },
    cjpiTotal: 0, classification: 'architecture', tier: 'enterprise', activation: 'guarded',
    activationReason: 'Reveals substrate topology reasoning patterns — architecture IP',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-oracle-ensemble-prediction',
    name: 'Ensemble Prediction Combiner',
    primitive: 'ORACLE',
    description: 'Multi-method prediction fusion (bayesian + montecarlo + regression + ensemble) with coefficient-of-variation confidence',
    modules: ['ORACLE'],
    cjpiScores: { novelty: 78, utility: 88, complexity: 75, composability: 80 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'High-utility general-purpose prediction, suitable for creator tier',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-oracle-multi-factor-health',
    name: 'Multi-Factor Prediction Health Scorer',
    primitive: 'ORACLE',
    description: '5-factor health scoring: prediction confidence, simulation convergence, network freshness, capacity headroom, expired prediction ratio',
    modules: ['ORACLE'],
    cjpiScores: { novelty: 70, utility: 82, complexity: 68, composability: 65 },
    cjpiTotal: 0, classification: 'experience', tier: 'studio', activation: 'active',
    activationReason: 'Observability primitive, valuable at studio tier',
    blackBoxed: false, sealedExecution: false, isCrownJewel: false, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SOVEREIGN CROWN JEWELS — Data Sovereignty & Jurisdictional Compliance
// ═══════════════════════════════════════════════════════════════════════════════

const SOVEREIGN_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-sovereign-compliance-engine',
    name: 'Full-Stack Compliance Engine',
    primitive: 'SOVEREIGN',
    description: 'Multi-framework compliance checking (GDPR, HIPAA, ITAR, SOC2, CCPA + 5 more) with auto-remediation and violation severity scoring',
    modules: ['SOVEREIGN'],
    cjpiScores: { novelty: 85, utility: 95, complexity: 88, composability: 75 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Enterprise-critical compliance, production-hardened',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-sovereign-consent-lifecycle',
    name: 'Immutable Consent Lifecycle Manager',
    primitive: 'SOVEREIGN',
    description: 'Append-only consent records with expiry detection, framework-scoped consent, and 30-day expiry warning system',
    modules: ['SOVEREIGN'],
    cjpiScores: { novelty: 80, utility: 90, complexity: 72, composability: 68 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'GDPR/CCPA essential, suitable for creator tier',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-sovereign-jurisdiction-gap-detector',
    name: 'Jurisdiction Gap Detector',
    primitive: 'SOVEREIGN',
    description: 'Automatic detection of unprotected jurisdictions where residency rules are missing, with real-time gap telemetry',
    modules: ['SOVEREIGN'],
    cjpiScores: { novelty: 88, utility: 85, complexity: 70, composability: 72 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Critical for multi-jurisdiction deployment',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-sovereign-data-classifier',
    name: 'Autonomous Data Classifier',
    primitive: 'SOVEREIGN',
    description: 'Content-aware classification (public/internal/confidential/restricted/top_secret) with keyword matching and encryption requirement derivation',
    modules: ['SOVEREIGN'],
    cjpiScores: { novelty: 72, utility: 88, complexity: 60, composability: 75 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Broadly useful classification primitive',
    blackBoxed: false, sealedExecution: true, isCrownJewel: false, isSTier: false,
  },
  {
    id: 'exp-sovereign-retention-enforcer',
    name: 'Framework-Aware Retention Enforcer',
    primitive: 'SOVEREIGN',
    description: 'Per-framework minimum retention validation (HIPAA 6yr, ITAR 5yr, etc.) with auto-expiry and anonymization policies',
    modules: ['SOVEREIGN'],
    cjpiScores: { novelty: 75, utility: 85, complexity: 65, composability: 60 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Essential compliance building block',
    blackBoxed: true, sealedExecution: true, isCrownJewel: false, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SHADOW CROWN JEWELS — Covert Execution & Canary Validation
// ═══════════════════════════════════════════════════════════════════════════════

const SHADOW_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-shadow-divergence-engine',
    name: 'Shadow Divergence Engine',
    primitive: 'SHADOW',
    description: 'Parallel shadow execution with configurable divergence thresholds, convergence verdict, and mesh load balancing',
    modules: ['SHADOW'],
    cjpiScores: { novelty: 92, utility: 88, complexity: 85, composability: 80 },
    cjpiTotal: 0, classification: 'architecture', tier: 'enterprise', activation: 'guarded',
    activationReason: 'Powers EVOLUTION canary validation — core architectural IP',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-shadow-canary-promotion',
    name: 'Canary Promotion Protocol',
    primitive: 'SHADOW',
    description: 'Graduated canary deployment with divergence-based promotion/rollback, dark launch mode, and concurrent execution caps',
    modules: ['SHADOW'],
    cjpiScores: { novelty: 90, utility: 85, complexity: 82, composability: 78 },
    cjpiTotal: 0, classification: 'architecture', tier: 'enterprise', activation: 'guarded',
    activationReason: 'Core SEBA dependency — structural IP',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-shadow-mesh-isolation',
    name: 'Shadow Mesh Isolation Controller',
    primitive: 'SHADOW',
    description: 'Configurable shadow mesh with load indexing, health bleed control, and concurrent run management',
    modules: ['SHADOW'],
    cjpiScores: { novelty: 78, utility: 80, complexity: 75, composability: 70 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Useful for A/B testing infrastructure at architect tier',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FORGE CROWN JEWELS — Runtime Code Generation & Compilation
// ═══════════════════════════════════════════════════════════════════════════════

const FORGE_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-forge-blueprint-compiler',
    name: 'Blueprint-to-Artifact Compiler',
    primitive: 'FORGE',
    description: 'Multi-language (TS/Python/Go/Rust/SQL/JSON Schema) blueprint specification to code artifact generation pipeline',
    modules: ['FORGE'],
    cjpiScores: { novelty: 85, utility: 90, complexity: 82, composability: 78 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Core code generation capability, production-hardened',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-forge-sandboxed-build-pipeline',
    name: 'Sandboxed Build Pipeline',
    primitive: 'FORGE',
    description: 'Full build lifecycle (queue→compile→test→deploy) with test pass/fail tracking, build time metrics, and deploy target routing',
    modules: ['FORGE'],
    cjpiScores: { novelty: 80, utility: 88, complexity: 78, composability: 75 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Essential for gated code generation workflows',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-forge-artifact-versioning',
    name: 'Artifact Version Controller',
    primitive: 'FORGE',
    description: 'Blueprint-linked artifact versioning with complexity scoring, test coverage tracking, and validation state machine',
    modules: ['FORGE'],
    cjpiScores: { novelty: 72, utility: 82, complexity: 68, composability: 70 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Code quality infrastructure, creator tier appropriate',
    blackBoxed: false, sealedExecution: true, isCrownJewel: false, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HARVEST CROWN JEWELS — Autonomous Data Acquisition
// ═══════════════════════════════════════════════════════════════════════════════

const HARVEST_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-harvest-multi-source-ingestion',
    name: 'Multi-Source Data Ingestion Engine',
    primitive: 'HARVEST',
    description: '7-source-type acquisition (API/webhook/RSS/database/file/stream/sensor) with rate limit awareness and poll interval management',
    modules: ['HARVEST'],
    cjpiScores: { novelty: 80, utility: 92, complexity: 75, composability: 82 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Primary data acquisition engine, high utility',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-harvest-etl-orchestrator',
    name: 'ETL Pipeline Orchestrator',
    primitive: 'HARVEST',
    description: 'Multi-source ETL pipeline composition with transformation chains, destination routing, and throughput tracking',
    modules: ['HARVEST'],
    cjpiScores: { novelty: 75, utility: 88, complexity: 72, composability: 78 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Data transformation pipeline, creator tier value',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-harvest-adaptive-feed-manager',
    name: 'Adaptive Feed Status Manager',
    primitive: 'HARVEST',
    description: 'Auto-managed feed lifecycle with status tracking (active/paused/error/rate_limited/exhausted) and error rate monitoring',
    modules: ['HARVEST'],
    cjpiScores: { novelty: 68, utility: 80, complexity: 60, composability: 65 },
    cjpiTotal: 0, classification: 'experience', tier: 'studio', activation: 'active',
    activationReason: 'Feed monitoring, appropriate for studio tier',
    blackBoxed: false, sealedExecution: false, isCrownJewel: false, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TREATY CROWN JEWELS — Inter-Node Contracts & SLA Enforcement
// ═══════════════════════════════════════════════════════════════════════════════

const TREATY_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-treaty-bilateral-sla-engine',
    name: 'Bilateral SLA Enforcement Engine',
    primitive: 'TREATY',
    description: 'Per-party SLA evaluation with bilateral compliance scoring, inverted metric handling, and automatic contract renewal',
    modules: ['TREATY'],
    cjpiScores: { novelty: 88, utility: 90, complexity: 85, composability: 78 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Enterprise SLA management, production-hardened',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-treaty-penalty-escalation-ladder',
    name: 'Penalty Escalation Ladder',
    primitive: 'TREATY',
    description: '4-tier escalation (warning→throttle→circuit_isolation→termination) with breach-count-driven progression and per-party penalties',
    modules: ['TREATY'],
    cjpiScores: { novelty: 85, utility: 82, complexity: 72, composability: 68 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Penalty enforcement, pairs with SLA engine',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-treaty-dispute-resolution',
    name: 'Evidence-Weighted Dispute Resolution',
    primitive: 'TREATY',
    description: 'Multi-evidence arbitration with weighted scoring, precedent matching, and binding verdict generation',
    modules: ['TREATY'],
    cjpiScores: { novelty: 90, utility: 82, complexity: 80, composability: 72 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Unique dispute arbitration capability',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-treaty-multi-party-arbitration',
    name: 'N-Party Arbitration with Quorum',
    primitive: 'TREATY',
    description: 'Multi-party weighted voting arbitration with quorum requirements and delegation',
    modules: ['TREATY'],
    cjpiScores: { novelty: 92, utility: 78, complexity: 85, composability: 70 },
    cjpiTotal: 0, classification: 'architecture', tier: 'enterprise', activation: 'guarded',
    activationReason: 'Reveals governance coordination patterns — structural IP',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPASS CROWN JEWELS — Spatial-Temporal Reasoning
// ═══════════════════════════════════════════════════════════════════════════════

const COMPASS_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-compass-2opt-route-optimizer',
    name: 'Nearest-Neighbor + 2-Opt Route Optimizer',
    primitive: 'COMPASS',
    description: 'Haversine-based route optimization with nearest-neighbor heuristic and 2-opt improvement phase, efficiency scoring',
    modules: ['COMPASS'],
    cjpiScores: { novelty: 82, utility: 88, complexity: 80, composability: 72 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Classical optimization with real algorithmic depth',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-compass-timeseries-decomposition',
    name: 'Time-Series Decomposition & Forecaster',
    primitive: 'COMPASS',
    description: 'Linear regression trend + autocorrelation seasonality + residual analysis with decaying confidence multi-step forecasting',
    modules: ['COMPASS'],
    cjpiScores: { novelty: 85, utility: 90, complexity: 82, composability: 78 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Full time-series analysis pipeline, high utility',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-compass-temporal-pattern-detector',
    name: 'Multi-Pattern Temporal Detector',
    primitive: 'COMPASS',
    description: '4-type pattern detection (trend/anomaly/seasonality/changepoint) with z-score anomalies, autocorrelation periods, and structural shift detection',
    modules: ['COMPASS'],
    cjpiScores: { novelty: 88, utility: 86, complexity: 84, composability: 76 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Advanced temporal analytics, architect-tier value',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PHANTOM CROWN JEWELS — Stealth Operations & Privacy
// ═══════════════════════════════════════════════════════════════════════════════

const PHANTOM_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-phantom-differential-privacy-engine',
    name: 'Differential Privacy Noise Engine',
    primitive: 'PHANTOM',
    description: '4-mechanism privacy (Laplacian/Gaussian/Exponential/Randomized Response) with epsilon budget tracking and per-query consumption',
    modules: ['PHANTOM'],
    cjpiScores: { novelty: 92, utility: 88, complexity: 90, composability: 75 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Enterprise privacy primitive, mathematically grounded',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-phantom-governance-gated-ops',
    name: 'Governance-Gated Covert Operations',
    primitive: 'PHANTOM',
    description: 'Multi-party approval (2+ approvers), hardcoded ethical constraints (no impersonation/social engineering), TTL enforcement with auto-sanitization',
    modules: ['PHANTOM'],
    cjpiScores: { novelty: 95, utility: 82, complexity: 88, composability: 70 },
    cjpiTotal: 0, classification: 'architecture', tier: 'enterprise', activation: 'guarded',
    activationReason: 'Governance-layer operation — reveals approval topology',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: true,
  },
  {
    id: 'exp-phantom-sealed-audit-trail',
    name: 'Multi-Party Sealed Audit Trail',
    primitive: 'PHANTOM',
    description: 'Simulated 3-of-5 multi-party encrypted audit entries with sealed payload and required decryptor count',
    modules: ['PHANTOM'],
    cjpiScores: { novelty: 90, utility: 85, complexity: 85, composability: 72 },
    cjpiTotal: 0, classification: 'architecture', tier: 'enterprise', activation: 'guarded',
    activationReason: 'Audit infrastructure IP — reveals internal encryption approach',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-phantom-synthetic-data-generator',
    name: 'Privacy-Preserving Synthetic Data Generator',
    primitive: 'PHANTOM',
    description: 'Epsilon-budgeted synthetic dataset generation with fidelity scoring and privacy guarantee tracking',
    modules: ['PHANTOM'],
    cjpiScores: { novelty: 85, utility: 88, complexity: 78, composability: 75 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'High-value data privacy tool',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-phantom-pii-detection-anonymizer',
    name: 'PII Detection & Anonymization Pipeline',
    primitive: 'PHANTOM',
    description: '6-method anonymization (k-anonymity/l-diversity/t-closeness/DP/tokenization/masking) with regex PII detection and information loss scoring',
    modules: ['PHANTOM'],
    cjpiScores: { novelty: 78, utility: 90, complexity: 75, composability: 78 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Broadly useful privacy compliance tool',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ECHO CROWN JEWELS — Signal Reverberation & Pattern Amplification
// ═══════════════════════════════════════════════════════════════════════════════

const ECHO_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-echo-resonance-pattern-engine',
    name: 'Resonance Pattern Detection Engine',
    primitive: 'ECHO',
    description: 'Multi-window harmonic co-occurrence detection across signal types with confidence-weighted pattern discovery',
    modules: ['ECHO'],
    cjpiScores: { novelty: 90, utility: 85, complexity: 82, composability: 80 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Signal intelligence with real harmonic detection',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-echo-chamber-prevention',
    name: 'Echo Chamber Detection & Prevention',
    primitive: 'ECHO',
    description: 'Anti-feedback loop system with bounce pattern detection, max depth enforcement, and automatic cycle breaking',
    modules: ['ECHO'],
    cjpiScores: { novelty: 88, utility: 82, complexity: 75, composability: 72 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Critical safety mechanism against signal loops',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-echo-cross-node-correlation',
    name: 'Cross-Node Signal Correlation Engine',
    primitive: 'ECHO',
    description: 'N-gram causal chain discovery (2-gram, 3-gram) with frequency-weighted confidence and cross-primitive signal tracking',
    modules: ['ECHO'],
    cjpiScores: { novelty: 92, utility: 85, complexity: 88, composability: 82 },
    cjpiTotal: 0, classification: 'architecture', tier: 'enterprise', activation: 'guarded',
    activationReason: 'Reveals inter-primitive communication patterns — topology IP',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-echo-predictive-forecaster',
    name: 'Predictive Signal Forecaster',
    primitive: 'ECHO',
    description: 'N-gram-based next-signal prediction with probability scoring and sequence-based forecast generation',
    modules: ['ECHO'],
    cjpiScores: { novelty: 85, utility: 80, complexity: 78, composability: 75 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Predictive analytics for signal bus optimization',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-echo-selective-amplification',
    name: 'EMA-Weighted Signal Amplification',
    primitive: 'ECHO',
    description: 'Outcome-driven signal value scoring with EMA decay, impact-based amplification (+50%) and dampening (-50%)',
    modules: ['ECHO'],
    cjpiScores: { novelty: 80, utility: 82, complexity: 70, composability: 75 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Signal quality optimization, creator tier value',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LINGUA CROWN JEWELS — Universal Translation & Protocol Bridge
// ═══════════════════════════════════════════════════════════════════════════════

const LINGUA_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-lingua-adaptive-fidelity-engine',
    name: 'Adaptive Fidelity Learning Engine',
    primitive: 'LINGUA',
    description: 'EMA-weighted fidelity profile learning per format pair with CUSUM regression detection and automatic bridge degradation',
    modules: ['LINGUA'],
    cjpiScores: { novelty: 90, utility: 88, complexity: 85, composability: 78 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Self-improving translation quality — enterprise value',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-lingua-transitive-bridge-mesh',
    name: 'Transitive Protocol Bridge Mesh',
    primitive: 'LINGUA',
    description: 'BFS-based transitive path discovery (A→B→C) across modality bridges with combined fidelity scoring and hot-swap replacement',
    modules: ['LINGUA'],
    cjpiScores: { novelty: 92, utility: 85, complexity: 88, composability: 82 },
    cjpiTotal: 0, classification: 'architecture', tier: 'enterprise', activation: 'guarded',
    activationReason: 'Reveals substrate modality mesh topology — structural IP',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-lingua-semantic-schema-intelligence',
    name: 'Semantic Schema Intelligence Layer',
    primitive: 'LINGUA',
    description: 'Levenshtein + semantic alias matching for field mapping, type coercion safety graph, and schema version migration',
    modules: ['LINGUA'],
    cjpiScores: { novelty: 85, utility: 90, complexity: 80, composability: 78 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'High-utility schema mapping with semantic intelligence',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-lingua-multi-modal-pipeline',
    name: 'Multi-Modal Translation Pipeline',
    primitive: 'LINGUA',
    description: '7-modality (text/code/image/audio/structured_data/embedding/graph) translation with streaming, batch queuing, and priority lanes',
    modules: ['LINGUA'],
    cjpiScores: { novelty: 82, utility: 88, complexity: 78, composability: 80 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Versatile translation pipeline, creator tier',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REFLEX CROWN JEWELS — Real-Time Edge Computing
// ═══════════════════════════════════════════════════════════════════════════════

const REFLEX_JEWELS: ExpansionCrownJewel[] = [
  {
    id: 'exp-reflex-sub10ms-decision-loop',
    name: 'Sub-10ms Edge Decision Loop',
    primitive: 'REFLEX',
    description: 'Real-time rule matching with latency-optimal node selection, p99 latency tracking, and throughput monitoring',
    modules: ['REFLEX'],
    cjpiScores: { novelty: 88, utility: 85, complexity: 80, composability: 75 },
    cjpiTotal: 0, classification: 'experience', tier: 'architect', activation: 'active',
    activationReason: 'Unique real-time edge computing primitive',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-reflex-edge-node-mesh',
    name: 'Edge Node Mesh Orchestrator',
    primitive: 'REFLEX',
    description: 'Multi-region edge node registration with heartbeat monitoring, capacity tracking, and overload detection',
    modules: ['REFLEX'],
    cjpiScores: { novelty: 78, utility: 82, complexity: 72, composability: 70 },
    cjpiTotal: 0, classification: 'experience', tier: 'creator', activation: 'active',
    activationReason: 'Edge infrastructure management, creator value',
    blackBoxed: true, sealedExecution: true, isCrownJewel: true, isSTier: false,
  },
  {
    id: 'exp-reflex-adaptive-rule-engine',
    name: 'Adaptive Reflex Rule Engine',
    primitive: 'REFLEX',
    description: 'Priority-sorted rule matching with hit counting, configurable max latency, and enable/disable lifecycle',
    modules: ['REFLEX'],
    cjpiScores: { novelty: 72, utility: 80, complexity: 65, composability: 72 },
    cjpiTotal: 0, classification: 'experience', tier: 'studio', activation: 'active',
    activationReason: 'Rule management building block, studio tier',
    blackBoxed: false, sealedExecution: true, isCrownJewel: false, isSTier: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FINALIZE — Compute CJPI totals and build canonical registry
// ═══════════════════════════════════════════════════════════════════════════════

function finalize(jewels: ExpansionCrownJewel[]): ExpansionCrownJewel[] {
  return jewels.map(j => {
    const score = calculateCJPI(
      j.cjpiScores.novelty, j.cjpiScores.utility,
      j.cjpiScores.complexity, j.cjpiScores.composability
    );
    return {
      ...j,
      cjpiTotal: score.total,
      tier: j.classification === 'architecture' ? 'enterprise' as ProductTier : j.tier,
      isCrownJewel: score.total >= 75,
      isSTier: score.total >= 95,
    };
  });
}

/** All expansion Crown Jewels — canonical registry */
export const EXPANSION_CROWN_JEWELS: ExpansionCrownJewel[] = [
  ...finalize(ORACLE_JEWELS),
  ...finalize(SOVEREIGN_JEWELS),
  ...finalize(SHADOW_JEWELS),
  ...finalize(FORGE_JEWELS),
  ...finalize(HARVEST_JEWELS),
  ...finalize(TREATY_JEWELS),
  ...finalize(COMPASS_JEWELS),
  ...finalize(PHANTOM_JEWELS),
  ...finalize(ECHO_JEWELS),
  ...finalize(LINGUA_JEWELS),
  ...finalize(REFLEX_JEWELS),
];

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all activated jewels (ready for production, tier-gated) */
export function getActiveJewels(): ExpansionCrownJewel[] {
  return EXPANSION_CROWN_JEWELS.filter(j => j.activation === 'active');
}

/** Get all guarded jewels (governor-only, internal IP) */
export function getGuardedJewels(): ExpansionCrownJewel[] {
  return EXPANSION_CROWN_JEWELS.filter(j => j.activation === 'guarded');
}

/** Get all deferred jewels (needs development) */
export function getDeferredJewels(): ExpansionCrownJewel[] {
  return EXPANSION_CROWN_JEWELS.filter(j => j.activation === 'deferred');
}

/** Get jewels by primitive */
export function getJewelsByPrimitive(primitive: string): ExpansionCrownJewel[] {
  return EXPANSION_CROWN_JEWELS.filter(j => j.primitive.toUpperCase() === primitive.toUpperCase());
}

/** Get jewels by tier */
export function getJewelsByTier(tier: ProductTier): ExpansionCrownJewel[] {
  return EXPANSION_CROWN_JEWELS.filter(j => j.tier === tier);
}

/** Get comprehensive stats */
export function getExpansionRegistryStats() {
  const byPrimitive: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  const byActivation: Record<string, number> = { active: 0, guarded: 0, deferred: 0 };
  const byClassification: Record<string, number> = { architecture: 0, experience: 0 };

  for (const j of EXPANSION_CROWN_JEWELS) {
    byPrimitive[j.primitive] = (byPrimitive[j.primitive] ?? 0) + 1;
    byTier[j.tier] = (byTier[j.tier] ?? 0) + 1;
    byActivation[j.activation]++;
    byClassification[j.classification]++;
  }

  return {
    totalJewels: EXPANSION_CROWN_JEWELS.length,
    crownJewels: EXPANSION_CROWN_JEWELS.filter(j => j.isCrownJewel).length,
    sTier: EXPANSION_CROWN_JEWELS.filter(j => j.isSTier).length,
    blackBoxed: EXPANSION_CROWN_JEWELS.filter(j => j.blackBoxed).length,
    avgCJPI: Math.round(EXPANSION_CROWN_JEWELS.reduce((s, j) => s + j.cjpiTotal, 0) / EXPANSION_CROWN_JEWELS.length),
    byPrimitive,
    byTier,
    byActivation,
    byClassification,
    primitiveCoverage: Object.keys(byPrimitive).length,
  };
}

/** Expansion jewel IDs for injection into the main crown jewel registry */
export function getExpansionArchitectureIds(): string[] {
  return EXPANSION_CROWN_JEWELS
    .filter(j => j.classification === 'architecture')
    .map(j => j.id);
}

export function getExpansionExperienceIds(): string[] {
  return EXPANSION_CROWN_JEWELS
    .filter(j => j.classification === 'experience')
    .map(j => j.id);
}

export function getExpansionTierMap(): Record<string, ProductTier> {
  const map: Record<string, ProductTier> = {};
  for (const j of EXPANSION_CROWN_JEWELS) {
    if (j.classification === 'experience') {
      map[j.id] = j.tier;
    }
  }
  return map;
}
