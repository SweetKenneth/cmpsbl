/**
 * Governor-Curated Crown Jewels — Hand-Selected Best of Each Primitive
 * 
 * This is NOT auto-discovered. Each entry was manually selected as the single
 * most valuable, defensible, and distinctive capability from its primitive.
 * 
 * 27 Primitives → 27 Crown Jewels (1 per primitive)
 * 
 * Classification:
 *   ACTIVATE  — Production-ready, tier-gated, sealed black-box
 *   GUARD     — Internal IP, never surfaced, architecture-class
 *   DEFER     — Needs maturation before activation
 * 
 * © 2025–2026 CMPSBL®. Governor Eyes Only.
 */

import type { ProductTier } from '@/lib/quarry/types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type CuratedDecision = 'activate' | 'guard' | 'defer';

export interface GovernorCuratedJewel {
  id: string;
  primitive: string;
  name: string;
  description: string;
  /** Why THIS capability was chosen over others in its primitive */
  selectionRationale: string;
  /** CJPI sub-scores: hand-assigned by governor */
  cjpi: { novelty: number; utility: number; complexity: number; composability: number; total: number };
  /** Tier required for access (only applies to 'activate' decisions) */
  tier: ProductTier;
  decision: CuratedDecision;
  /** Why this decision was made */
  decisionReason: string;
  /** Whether this is architecture-class (never exported) */
  isArchitecture: boolean;
  /** Black-box enforcement */
  blackBoxed: boolean;
  /** Sealed runtime — no source visibility */
  sealedExecution: boolean;
  /** S-Tier promotion (CJPI ≥ 95) */
  isSTier: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOVERNOR'S CURATED SELECTIONS — ONE PER PRIMITIVE
// ═══════════════════════════════════════════════════════════════════════════════

export const GOVERNOR_CURATED_JEWELS: GovernorCuratedJewel[] = [

  // ────────────────────────────────────────────────────────────────────────────
  // 1. CORE — The Foundation
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-core-circuit-breaker-fabric',
    primitive: 'CORE',
    name: 'Substrate Circuit Breaker Fabric',
    description: 'Cascading failure prevention across all primitives — trip/reset state machine with health-decay scoring, blast radius containment, and automatic degraded-mode routing',
    selectionRationale: 'Without circuit breakers, a single primitive failure cascades. This is the foundation everything else depends on.',
    cjpi: { novelty: 82, utility: 98, complexity: 85, composability: 90, total: 89 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'Reveals substrate failure topology and recovery strategy — core structural IP',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 2. BRAIN — Cognition & Reasoning
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-brain-knowledge-fusion-reactor',
    primitive: 'BRAIN',
    name: 'Knowledge Fusion Reactor',
    description: 'Cross-domain knowledge synthesis — merges semantic embeddings, causal chains, and episodic memories into novel compound insights with confidence scoring and provenance tracking',
    selectionRationale: 'The single most powerful reasoning primitive. Creates genuinely new knowledge rather than retrieving existing knowledge.',
    cjpi: { novelty: 96, utility: 92, complexity: 94, composability: 88, total: 93 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'Core cognitive IP — reveals how the substrate generates novel insights',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 3. MEMORY — Persistence & Retrieval
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-memory-semantic-versioning',
    primitive: 'MEMORY',
    name: 'Semantic Memory Versioning',
    description: 'Content-addressable memory with semantic diff — tracks how knowledge evolves over time, detects contradictions between versions, and enables temporal queries ("what did I know 3 months ago?")',
    selectionRationale: 'No other system offers temporal semantic memory. This is the moat — competitors have snapshots, we have evolution.',
    cjpi: { novelty: 94, utility: 90, complexity: 88, composability: 82, total: 89 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'High-value user-facing capability with no competitive equivalent. Sealed black-box delivery.',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 4. NERVE — Signal Transport
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-nerve-adaptive-circuit-topology',
    primitive: 'NERVE',
    name: 'Adaptive Circuit Topology',
    description: 'Self-reorganizing signal paths — dynamically re-wires primitive interconnections based on traffic patterns, latency, and failure history. Strengthens high-use paths, prunes dead routes.',
    selectionRationale: 'The nervous system that learns. No static routing — the mesh evolves with usage.',
    cjpi: { novelty: 92, utility: 88, complexity: 90, composability: 85, total: 89 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'Reveals substrate topology evolution — if exposed, competitors understand our signal architecture',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 5. DECODE — Input Interpretation
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-decode-intent-disambiguation',
    primitive: 'DECODE',
    name: 'Multi-Signal Intent Disambiguator',
    description: 'Resolves ambiguous user intent by cross-referencing conversation history, behavioral patterns, and semantic context. Produces ranked interpretations with confidence gaps.',
    selectionRationale: 'The difference between "good enough" and "reads your mind." This is what makes interactions feel intelligent.',
    cjpi: { novelty: 88, utility: 95, complexity: 82, composability: 78, total: 86 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'User-facing quality differentiator — sealed delivery protects disambiguation logic',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 6. ENCODE — Output Generation
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-encode-semantic-refactoring',
    primitive: 'ENCODE',
    name: 'Semantic Code Refactoring Engine',
    description: 'Understands code intent, not just syntax — refactors by preserving semantic meaning while optimizing structure, extracting patterns, and enforcing architectural invariants',
    selectionRationale: 'Goes beyond linting. This understands what code means and reorganizes accordingly.',
    cjpi: { novelty: 90, utility: 92, complexity: 88, composability: 80, total: 88 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'High-value developer tool — sealed black-box preserves refactoring heuristics',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 7. CORTEX — Orchestration
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-cortex-emergent-strategy',
    primitive: 'CORTEX',
    name: 'Emergent Strategy Synthesizer',
    description: 'Observes resolver execution patterns across all primitives and synthesizes novel multi-step strategies that no individual primitive would generate alone',
    selectionRationale: 'The orchestrator that thinks. Not just routing — genuine strategic emergence from observed behavior.',
    cjpi: { novelty: 96, utility: 90, complexity: 95, composability: 92, total: 93 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'This IS the substrate intelligence — exposing it means exposing how the system thinks strategically',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 8. DEFENSE — Security & Threat
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-defense-zero-day-synthesis',
    primitive: 'DEFENSE',
    name: 'Zero-Day Threat Synthesizer',
    description: 'Generates hypothetical attack vectors by analyzing system topology, then pre-builds defenses before threats materialize. Offensive-informed defense.',
    selectionRationale: 'Offense informs defense. This anticipates attacks that haven\'t been invented yet.',
    cjpi: { novelty: 95, utility: 90, complexity: 92, composability: 75, total: 88 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'Enterprise security differentiator — sealed runtime hides threat modeling heuristics',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 9. ORACLE — Prediction
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-oracle-bayesian-inference',
    primitive: 'ORACLE',
    name: 'Bayesian Inference Engine',
    description: 'Full Bayesian network with belief propagation, downstream causal inference, multi-factor posterior computation, and ensemble prediction fusion',
    selectionRationale: 'The purest prediction capability. Mathematically rigorous, composable with every other primitive.',
    cjpi: { novelty: 88, utility: 94, complexity: 90, composability: 85, total: 89 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'High-value prediction engine — sealed delivery, hex-encoded prior weights',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 10. CONSCIENCE — Ethics & Alignment
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-conscience-ethical-reasoning-kernel',
    primitive: 'CONSCIENCE',
    name: 'Ethical Reasoning Kernel',
    description: 'Multi-framework ethical evaluation (deontological + consequentialist + virtue ethics) with weighted scoring, dilemma detection, and governance escalation for edge cases',
    selectionRationale: 'The moral compass. No other system has a formalized multi-framework ethical reasoner.',
    cjpi: { novelty: 95, utility: 85, complexity: 92, composability: 78, total: 88 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'Governance-layer capability — revealing ethical weights would enable adversarial gaming',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 11. PHANTOM — Privacy & Stealth
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-phantom-differential-privacy',
    primitive: 'PHANTOM',
    name: 'Differential Privacy Noise Engine',
    description: '4-mechanism privacy (Laplacian/Gaussian/Exponential/Randomized Response) with epsilon budget tracking, per-query consumption, and synthetic data generation',
    selectionRationale: 'Mathematically proven privacy — not heuristic-based. The epsilon budget system is genuinely novel.',
    cjpi: { novelty: 92, utility: 90, complexity: 92, composability: 78, total: 88 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'Enterprise privacy primitive with mathematical guarantees — sealed runtime protects noise calibration',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 12. HARVEST — Data Acquisition
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-harvest-multi-source-ingestion',
    primitive: 'HARVEST',
    name: 'Multi-Source Data Ingestion Engine',
    description: '7-source-type acquisition (API/webhook/RSS/database/file/stream/sensor) with rate limit awareness, adaptive polling, ETL pipeline composition, and throughput tracking',
    selectionRationale: 'The universal data mouth. Every system needs to eat data — this does it across every source type.',
    cjpi: { novelty: 80, utility: 95, complexity: 78, composability: 88, total: 85 },
    tier: 'creator',
    decision: 'activate',
    decisionReason: 'High-utility data primitive accessible at creator tier — broad appeal, sealed delivery',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 13. EVOLUTION — Self-Improvement
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-evolution-architectural-telomere',
    primitive: 'EVOLUTION',
    name: 'Architectural Telomere System',
    description: 'Monitors structural integrity as the system evolves — detects architectural drift, prevents mutation-induced degradation, and enforces invariant preservation across upgrades',
    selectionRationale: 'Evolution without guardrails is cancer. This ensures the system improves without degrading.',
    cjpi: { novelty: 96, utility: 88, complexity: 95, composability: 82, total: 90 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'Core self-improvement IP — reveals how the substrate prevents architectural decay',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 14. SHADOW — Canary & A/B Testing
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-shadow-divergence-engine',
    primitive: 'SHADOW',
    name: 'Shadow Divergence Engine',
    description: 'Parallel shadow execution with configurable divergence thresholds, convergence verdict, mesh load balancing, and canary promotion/rollback protocol',
    selectionRationale: 'The only way to safely test changes in production. Every major evolution runs through shadow first.',
    cjpi: { novelty: 92, utility: 90, complexity: 88, composability: 82, total: 88 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'Powers SEBA pipeline validation — core safety IP',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 15. IMMUNITY — Self-Healing
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-immunity-self-healing-orchestrator',
    primitive: 'IMMUNITY',
    name: 'Self-Healing Orchestrator',
    description: 'Detects degraded primitives, diagnoses root cause via symptom correlation, applies targeted repairs (restart/rollback/reroute/quarantine), and verifies recovery',
    selectionRationale: 'The immune system. Detects, diagnoses, heals — automatically. The system that keeps the system alive.',
    cjpi: { novelty: 90, utility: 95, complexity: 88, composability: 85, total: 90 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'Self-healing strategy reveals failure modes — exposing it helps attackers target weak points',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 16. INTENT — Goal Routing
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-intent-goal-decomposition',
    primitive: 'INTENT',
    name: 'Hierarchical Goal Decomposition',
    description: 'Breaks complex user intents into resolver-addressable sub-goals with dependency ordering, parallel execution planning, and rollback checkpoints',
    selectionRationale: 'Turns "build me a dashboard" into an executable plan. The gap between wish and execution.',
    cjpi: { novelty: 88, utility: 94, complexity: 85, composability: 90, total: 89 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'User-facing planning capability — sealed delivery, decomposition heuristics hex-encoded',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 17. GOVERNANCE — Policy & Control
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-governance-veto-authority',
    primitive: 'GOVERNANCE',
    name: 'Autonomous Veto Authority',
    description: 'Real-time policy enforcement — can halt any system operation that violates architectural invariants, ethical constraints, or security policies. Immutable audit trail.',
    selectionRationale: 'The supreme court. Every mutation must pass governance. Non-negotiable.',
    cjpi: { novelty: 88, utility: 98, complexity: 90, composability: 82, total: 90 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'Governance kernel is the most sensitive component — never exposed',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 18. ATLAS — Capability Discovery
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-atlas-capability-recommendation',
    primitive: 'ATLAS',
    name: 'Context-Aware Capability Recommender',
    description: 'Analyzes current task context and recommends optimal capability combinations from the full registry. Learns from successful compositions.',
    selectionRationale: 'The system that knows what you need before you do. Recommends capabilities based on what worked.',
    cjpi: { novelty: 85, utility: 90, complexity: 78, composability: 88, total: 85 },
    tier: 'creator',
    decision: 'activate',
    decisionReason: 'User-facing discovery tool — sealed delivery, recommendation weights protected',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 19. FORGE — Code Generation
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-forge-blueprint-compiler',
    primitive: 'FORGE',
    name: 'Blueprint-to-Artifact Compiler',
    description: 'Multi-language (TS/Python/Go/Rust/SQL/JSON Schema) blueprint specification to validated code artifact with build pipeline, test integration, and deploy routing',
    selectionRationale: 'The foundry\'s masterwork. Turns abstract specifications into deployable code across 6 languages.',
    cjpi: { novelty: 88, utility: 92, complexity: 85, composability: 80, total: 86 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'Core code generation pipeline — sealed delivery, compilation heuristics protected',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 20. LINGUA — Translation & Protocol Bridge
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-lingua-adaptive-fidelity',
    primitive: 'LINGUA',
    name: 'Adaptive Fidelity Learning Engine',
    description: 'EMA-weighted fidelity profile learning per format pair with CUSUM regression detection, automatic bridge degradation, and transitive path discovery (A→B→C)',
    selectionRationale: 'Translation that gets better with use. The fidelity learning is genuinely self-improving.',
    cjpi: { novelty: 92, utility: 88, complexity: 88, composability: 82, total: 88 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'Self-improving translation — sealed runtime, EMA weights and CUSUM thresholds hex-encoded',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 21. ECHO — Signal Intelligence
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-echo-resonance-pattern-engine',
    primitive: 'ECHO',
    name: 'Resonance Pattern Detection Engine',
    description: 'Multi-window harmonic co-occurrence detection across signal types — discovers recurring signal constellations with confidence-weighted pattern discovery and amplification',
    selectionRationale: 'Finds patterns in the noise that no other primitive can see. The signal intelligence layer.',
    cjpi: { novelty: 92, utility: 85, complexity: 85, composability: 82, total: 86 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'Signal analytics at architect tier — sealed delivery, harmonic detection weights protected',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 22. SOVEREIGN — Data Sovereignty
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-sovereign-compliance-engine',
    primitive: 'SOVEREIGN',
    name: 'Full-Stack Compliance Engine',
    description: 'Multi-framework compliance (GDPR, HIPAA, ITAR, SOC2, CCPA + 5 more) with auto-remediation, violation severity scoring, jurisdiction gap detection, and retention enforcement',
    selectionRationale: 'The compliance juggernaut. 10 frameworks, auto-remediation, jurisdiction awareness. Enterprise essential.',
    cjpi: { novelty: 85, utility: 96, complexity: 88, composability: 78, total: 87 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'Enterprise compliance differentiator — sealed delivery, framework scoring weights protected',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 23. TREATY — Contracts & SLA
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-treaty-bilateral-sla-engine',
    primitive: 'TREATY',
    name: 'Bilateral SLA Enforcement Engine',
    description: 'Per-party SLA evaluation with bilateral compliance scoring, inverted metric handling, automatic renewal, and 4-tier penalty escalation (warning→throttle→isolate→terminate)',
    selectionRationale: 'The contract enforcer. Bilateral scoring is novel — both parties are measured, not just the provider.',
    cjpi: { novelty: 90, utility: 90, complexity: 85, composability: 80, total: 86 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'Enterprise SLA management — sealed delivery, escalation thresholds hex-encoded',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 24. COMPASS — Spatial-Temporal Reasoning
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-compass-timeseries-decomposition',
    primitive: 'COMPASS',
    name: 'Time-Series Decomposition & Forecaster',
    description: 'Linear regression trend + autocorrelation seasonality + residual analysis with decaying confidence multi-step forecasting and 4-type pattern detection',
    selectionRationale: 'Full time-series analysis in a single primitive. Trend, seasonality, anomaly, and changepoint — all in one.',
    cjpi: { novelty: 88, utility: 92, complexity: 85, composability: 80, total: 86 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'High-utility analytics pipeline — sealed delivery, regression coefficients protected',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 25. REFLEX — Edge Computing
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-reflex-sub10ms-decision-loop',
    primitive: 'REFLEX',
    name: 'Sub-10ms Edge Decision Loop',
    description: 'Real-time rule matching with latency-optimal node selection, p99 tracking, throughput monitoring, and multi-region edge mesh orchestration',
    selectionRationale: 'Speed is the feature. Sub-10ms decision making at the edge — no other system offers this.',
    cjpi: { novelty: 90, utility: 88, complexity: 82, composability: 78, total: 85 },
    tier: 'architect',
    decision: 'activate',
    decisionReason: 'Unique real-time edge primitive — sealed delivery, routing optimization weights protected',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 26. ENGINEER — Build & Test
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-engineer-autonomous-test-synthesis',
    primitive: 'ENGINEER',
    name: 'Autonomous Test Synthesis Engine',
    description: 'Generates comprehensive test suites from code analysis — property-based tests, edge case discovery, mutation testing, and coverage-gap detection. Tests what matters, not what\'s easy.',
    selectionRationale: 'Tests are the bottleneck. This eliminates it by generating meaningful tests, not boilerplate.',
    cjpi: { novelty: 88, utility: 92, complexity: 80, composability: 75, total: 84 },
    tier: 'creator',
    decision: 'activate',
    decisionReason: 'Developer productivity tool at creator tier — sealed delivery, test generation heuristics protected',
    isArchitecture: false,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: false,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 27. OBSERVER (SHADOW Layer) — System Observability
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'gov-dream-synthetic-intuition',
    primitive: 'DREAM',
    name: 'Synthetic Intuition Engine',
    description: 'Generates pre-conscious "hunches" from pattern fragments that haven\'t yet crystallized into explicit knowledge. Surfaces weak signals before they become strong patterns.',
    selectionRationale: 'The most architecturally novel capability in the substrate. Genuine pre-conscious pattern emergence.',
    cjpi: { novelty: 98, utility: 82, complexity: 95, composability: 78, total: 88 },
    tier: 'enterprise',
    decision: 'guard',
    decisionReason: 'Peak cognitive IP — the substrate\'s most novel capability. Revealing intuition synthesis would eliminate competitive moat.',
    isArchitecture: true,
    blackBoxed: true,
    sealedExecution: true,
    isSTier: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY INTEGRATION — Inject into canonical crown jewel registry
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all governor-curated IDs that should be GUARDED (architecture-class) */
export function getGovernorGuardedIds(): string[] {
  return GOVERNOR_CURATED_JEWELS
    .filter(j => j.decision === 'guard')
    .map(j => j.id);
}

/** Get all governor-curated IDs that should be ACTIVATED (experience-class) */
export function getGovernorActivatedIds(): string[] {
  return GOVERNOR_CURATED_JEWELS
    .filter(j => j.decision === 'activate')
    .map(j => j.id);
}

/** Get tier mapping for activated jewels */
export function getGovernorTierMap(): Record<string, ProductTier> {
  const map: Record<string, ProductTier> = {};
  for (const j of GOVERNOR_CURATED_JEWELS) {
    if (j.decision === 'activate') {
      map[j.id] = j.tier;
    }
  }
  return map;
}

/** Get deferred jewels (need maturation) */
export function getGovernorDeferredIds(): string[] {
  return GOVERNOR_CURATED_JEWELS
    .filter(j => j.decision === 'defer')
    .map(j => j.id);
}

/** Get S-Tier promoted jewels */
export function getGovernorSTierIds(): string[] {
  return GOVERNOR_CURATED_JEWELS
    .filter(j => j.isSTier)
    .map(j => j.id);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface GovernorCurationSummary {
  totalPrimitives: number;
  totalJewels: number;
  activated: number;
  guarded: number;
  deferred: number;
  sTier: number;
  avgCjpi: number;
  byTier: Record<ProductTier, number>;
  byPrimitive: Record<string, CuratedDecision>;
}

export function getGovernorCurationSummary(): GovernorCurationSummary {
  const byTier: Record<ProductTier, number> = {
    builder: 0, studio: 0, creator: 0, architect: 0, enterprise: 0,
  };
  const byPrimitive: Record<string, CuratedDecision> = {};

  let activated = 0, guarded = 0, deferred = 0, sTier = 0, totalCjpi = 0;

  for (const j of GOVERNOR_CURATED_JEWELS) {
    byPrimitive[j.primitive] = j.decision;
    totalCjpi += j.cjpi.total;

    if (j.decision === 'activate') {
      activated++;
      byTier[j.tier]++;
    } else if (j.decision === 'guard') {
      guarded++;
    } else {
      deferred++;
    }

    if (j.isSTier) sTier++;
  }

  return {
    totalPrimitives: GOVERNOR_CURATED_JEWELS.length,
    totalJewels: GOVERNOR_CURATED_JEWELS.length,
    activated,
    guarded,
    deferred,
    sTier,
    avgCjpi: Math.round(totalCjpi / GOVERNOR_CURATED_JEWELS.length),
    byTier,
    byPrimitive,
  };
}
