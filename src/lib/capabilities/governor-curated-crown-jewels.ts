/**
 * Governor-Curated Crown Jewels — Hand-Selected Best of Each Primitive
 * 
 * EXPANDED: Full 40-primitive coverage + 3 per expansion + 2 per original
 * 
 * 40 Primitives → 78 Crown Jewels
 *   - 16 original primitives × 2 jewels = 32
 *   - 11 expansion primitives × 3 jewels = 33
 *   - 13 infrastructure primitives × 1 jewel = 13
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
  selectionRationale: string;
  cjpi: { novelty: number; utility: number; complexity: number; composability: number; total: number };
  tier: ProductTier;
  decision: CuratedDecision;
  decisionReason: string;
  isArchitecture: boolean;
  blackBoxed: boolean;
  sealedExecution: boolean;
  isSTier: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function jewel(
  id: string, primitive: string, name: string, description: string,
  rationale: string, cjpi: [number, number, number, number],
  tier: ProductTier, decision: CuratedDecision, reason: string,
  arch: boolean, sTier = false,
): GovernorCuratedJewel {
  const [n, u, cx, co] = cjpi;
  return {
    id, primitive, name, description, selectionRationale: rationale,
    cjpi: { novelty: n, utility: u, complexity: cx, composability: co, total: Math.round((n + u + cx + co) / 4) },
    tier, decision, decisionReason: reason,
    isArchitecture: arch, blackBoxed: true, sealedExecution: true, isSTier: sTier,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORIGINAL 16 PRIMITIVES — 2 jewels each (32 total)
// ═══════════════════════════════════════════════════════════════════════════════

export const GOVERNOR_CURATED_JEWELS: GovernorCuratedJewel[] = [

  // ── CORE ──────────────────────────────────────────────────────────────────
  jewel('gov-core-circuit-breaker-fabric', 'CORE',
    'Substrate Circuit Breaker Fabric',
    'Cascading failure prevention across all primitives — trip/reset state machine with health-decay scoring, blast radius containment, and automatic degraded-mode routing',
    'Without circuit breakers, a single primitive failure cascades. This is the foundation everything depends on.',
    [82, 98, 85, 90], 'enterprise', 'guard',
    'Reveals substrate failure topology and recovery strategy — core structural IP',
    true),
  jewel('gov-core-substrate-homeostasis', 'CORE',
    'Substrate Homeostasis Controller',
    'Maintains system equilibrium under load — auto-scales resource allocation, balances primitive CPU/memory budgets, and prevents runaway consumption',
    'The thermostat of the substrate. Keeps everything in operating range without human intervention.',
    [88, 95, 82, 85], 'enterprise', 'guard',
    'Reveals internal resource management strategy — competitive moat',
    true, true), // S-TIER: utility 95 + irreplicable homeostasis logic

  // ── BRAIN ─────────────────────────────────────────────────────────────────
  jewel('gov-brain-knowledge-fusion-reactor', 'BRAIN',
    'Knowledge Fusion Reactor',
    'Cross-domain knowledge synthesis — merges semantic embeddings, causal chains, and episodic memories into novel compound insights with confidence scoring and provenance tracking',
    'The single most powerful reasoning primitive. Creates genuinely new knowledge.',
    [96, 92, 94, 88], 'enterprise', 'guard',
    'Core cognitive IP — reveals how the substrate generates novel insights',
    true, true), // S-TIER: novelty 96
  jewel('gov-brain-associative-recall-mesh', 'BRAIN',
    'Associative Recall Mesh',
    'Retrieves semantically related memories through spreading activation — finds connections between seemingly unrelated knowledge fragments via multi-hop association chains',
    'Human-like association — not keyword search. The difference between remembering and understanding.',
    [92, 90, 85, 82], 'architect', 'activate',
    'User-facing reasoning upgrade — sealed delivery, activation weights hex-encoded',
    false),

  // ── MEMORY ────────────────────────────────────────────────────────────────
  jewel('gov-memory-semantic-versioning', 'MEMORY',
    'Semantic Memory Versioning',
    'Content-addressable memory with semantic diff — tracks how knowledge evolves, detects contradictions between versions, enables temporal queries',
    'No other system offers temporal semantic memory. Competitors have snapshots, we have evolution.',
    [94, 90, 88, 82], 'architect', 'activate',
    'High-value user-facing capability with no competitive equivalent',
    false),
  jewel('gov-memory-knowledge-compaction', 'MEMORY',
    'Knowledge Compaction Engine',
    'Lossless semantic compression — distills verbose memories into dense representations while preserving retrievability. Reduces memory footprint by 60-80% without information loss.',
    'Memory is expensive. This makes the system remember more with less.',
    [90, 88, 92, 78], 'enterprise', 'guard',
    'Reveals compression heuristics — competitors could replicate memory efficiency',
    true),

  // ── NERVE ─────────────────────────────────────────────────────────────────
  jewel('gov-nerve-adaptive-circuit-topology', 'NERVE',
    'Adaptive Circuit Topology',
    'Self-reorganizing signal paths — dynamically re-wires primitive interconnections based on traffic patterns, latency, and failure history',
    'The nervous system that learns. The mesh evolves with usage.',
    [92, 88, 90, 85], 'enterprise', 'guard',
    'Reveals substrate topology evolution — competitors understand our signal architecture',
    true),
  jewel('gov-nerve-signal-prioritization', 'NERVE',
    'Cognitive Signal Prioritizer',
    'Content-aware signal ranking with deadline awareness — routes urgent signals through fast-path lanes while batching low-priority traffic for efficiency',
    'Not all signals are equal. This ensures the right signals arrive first.',
    [82, 90, 75, 80], 'architect', 'activate',
    'User-facing performance improvement — sealed delivery',
    false),

  // ── DECODE ────────────────────────────────────────────────────────────────
  jewel('gov-decode-intent-disambiguation', 'DECODE',
    'Multi-Signal Intent Disambiguator',
    'Resolves ambiguous user intent by cross-referencing conversation history, behavioral patterns, and semantic context. Produces ranked interpretations with confidence gaps.',
    'The difference between "good enough" and "reads your mind."',
    [88, 95, 82, 78], 'architect', 'activate',
    'User-facing quality differentiator — sealed delivery protects disambiguation logic',
    false),
  jewel('gov-decode-empathic-calibration', 'DECODE',
    'Empathic Calibration Engine',
    'Detects user emotional state from interaction patterns — adjusts response tone, verbosity, and complexity in real-time. Prevents tone-deaf responses during frustration.',
    'Systems that read emotion outperform systems that read text.',
    [90, 88, 80, 75], 'architect', 'activate',
    'UX quality differentiator — sealed runtime, calibration weights protected',
    false),

  // ── ENCODE ────────────────────────────────────────────────────────────────
  jewel('gov-encode-semantic-refactoring', 'ENCODE',
    'Semantic Code Refactoring Engine',
    'Understands code intent, not just syntax — refactors by preserving semantic meaning while optimizing structure, extracting patterns, and enforcing architectural invariants',
    'Goes beyond linting. Understands what code means and reorganizes accordingly.',
    [90, 92, 88, 80], 'architect', 'activate',
    'High-value developer tool — sealed black-box preserves refactoring heuristics',
    false),
  jewel('gov-encode-mutation-testing', 'ENCODE',
    'Autonomous Mutation Testing Engine',
    'Injects targeted code mutations (boundary swaps, null injections, logic inversions) and verifies test suites catch them. Scores test effectiveness, not just coverage.',
    'Coverage is vanity. Mutation score is sanity. This measures if tests actually work.',
    [88, 90, 82, 78], 'creator', 'activate',
    'Developer quality tool at creator tier — sealed delivery',
    false),

  // ── CORTEX ────────────────────────────────────────────────────────────────
  jewel('gov-cortex-emergent-strategy', 'CORTEX',
    'Emergent Strategy Synthesizer',
    'Observes resolver execution patterns across all primitives and synthesizes novel multi-step strategies that no individual primitive would generate alone',
    'The orchestrator that thinks. Genuine strategic emergence from observed behavior.',
    [96, 90, 95, 92], 'enterprise', 'guard',
    'This IS the substrate intelligence — exposing it means exposing how the system thinks',
    true, true), // S-TIER: novelty 96 + complexity 95
  jewel('gov-cortex-workflow-compression', 'CORTEX',
    'Workflow Compression Engine',
    'Detects redundant steps in multi-primitive workflows and compresses them — merging parallel-safe operations, eliminating no-op resolvers, and reducing end-to-end latency',
    'Every workflow has waste. This finds and eliminates it automatically.',
    [85, 90, 80, 82], 'architect', 'activate',
    'Performance optimization visible to users — sealed delivery',
    false),

  // ── DEFENSE ───────────────────────────────────────────────────────────────
  jewel('gov-defense-zero-day-synthesis', 'DEFENSE',
    'Zero-Day Threat Synthesizer',
    'Generates hypothetical attack vectors by analyzing system topology, then pre-builds defenses before threats materialize. Offensive-informed defense.',
    'Offense informs defense. Anticipates attacks that haven\'t been invented yet.',
    [95, 90, 92, 75], 'architect', 'activate',
    'Enterprise security differentiator — sealed runtime hides threat modeling',
    false, true), // S-TIER: novelty 95
  jewel('gov-defense-behavioral-biometrics', 'DEFENSE',
    'Behavioral Biometric Engine',
    'Builds unique behavioral fingerprints from typing patterns, navigation habits, and interaction rhythms. Detects account takeover without passwords.',
    'Passwordless authentication through behavior. You ARE the credential.',
    [92, 88, 85, 78], 'architect', 'activate',
    'Security innovation — sealed delivery, fingerprint models hex-encoded',
    false),

  // ── CONSCIENCE ────────────────────────────────────────────────────────────
  jewel('gov-conscience-ethical-reasoning-kernel', 'CONSCIENCE',
    'Ethical Reasoning Kernel',
    'Multi-framework ethical evaluation (deontological + consequentialist + virtue ethics) with weighted scoring, dilemma detection, and governance escalation',
    'The moral compass. No other system has a formalized multi-framework ethical reasoner.',
    [95, 85, 92, 78], 'enterprise', 'guard',
    'Governance-layer — revealing ethical weights would enable adversarial gaming',
    true, true), // S-TIER: novelty 95
  jewel('gov-conscience-alignment-drift-detector', 'CONSCIENCE',
    'Alignment Drift Detector',
    'Continuously monitors system outputs for ethical drift — detects when behavior slowly diverges from stated values over time. Catches boiling-frog misalignment.',
    'The system that watches the system. Catches drift before it becomes disaster.',
    [94, 88, 85, 75], 'enterprise', 'guard',
    'Safety-critical governance IP — exposure enables adversarial drift evasion',
    true),

  // ── EVOLUTION ─────────────────────────────────────────────────────────────
  jewel('gov-evolution-architectural-telomere', 'EVOLUTION',
    'Architectural Telomere System',
    'Monitors structural integrity as the system evolves — detects architectural drift, prevents mutation-induced degradation, enforces invariant preservation',
    'Evolution without guardrails is cancer. This ensures improvement without degradation.',
    [96, 88, 95, 82], 'enterprise', 'guard',
    'Core self-improvement IP — reveals how the substrate prevents architectural decay',
    true, true), // S-TIER: novelty 96 + complexity 95
  jewel('gov-evolution-mutation-sandbox', 'EVOLUTION',
    'Mutation Sandbox Evaluator',
    'Isolates proposed system mutations in a sandboxed environment, runs them against regression tests, and scores safety before allowing promotion to production',
    'Try before you buy, for system evolution. Every change is tested in isolation first.',
    [88, 92, 85, 80], 'architect', 'activate',
    'Controlled evolution visible at architect tier — sandbox heuristics sealed',
    false),


  // ── IMMUNITY ──────────────────────────────────────────────────────────────
  jewel('gov-immunity-self-healing-orchestrator', 'IMMUNITY',
    'Self-Healing Orchestrator',
    'Detects degraded primitives, diagnoses root cause via symptom correlation, applies targeted repairs (restart/rollback/reroute/quarantine), verifies recovery',
    'The immune system. Detects, diagnoses, heals — automatically.',
    [90, 95, 88, 85], 'enterprise', 'guard',
    'Self-healing strategy reveals failure modes — helps attackers target weak points',
    true, true), // S-TIER: utility 95
  jewel('gov-immunity-immune-memory', 'IMMUNITY',
    'Immune Memory System',
    'Remembers every failure pattern the system has survived — builds an adaptive defense library so the same class of failure never succeeds twice',
    'The system that learns from every wound. Failures become permanent antibodies.',
    [94, 90, 82, 80], 'architect', 'activate',
    'Resilience feature visible at architect tier — failure pattern library sealed',
    false),

  // ── INTENT ────────────────────────────────────────────────────────────────
  jewel('gov-intent-goal-decomposition', 'INTENT',
    'Hierarchical Goal Decomposition',
    'Breaks complex user intents into resolver-addressable sub-goals with dependency ordering, parallel execution planning, and rollback checkpoints',
    'Turns "build me a dashboard" into an executable plan.',
    [88, 94, 85, 90], 'architect', 'activate',
    'User-facing planning — sealed delivery, decomposition heuristics hex-encoded',
    false),
  jewel('gov-intent-affinity-routing', 'INTENT',
    'Intent Affinity Router',
    'Learns which resolver combinations produce the best outcomes for each intent type — builds an affinity matrix that improves routing quality over time',
    'The router that gets smarter. Every execution teaches it to route better.',
    [90, 88, 82, 85], 'enterprise', 'guard',
    'Reveals substrate routing intelligence — competitive moat',
    true),

  // ── GOVERNANCE ────────────────────────────────────────────────────────────
  jewel('gov-governance-veto-authority', 'GOVERNANCE',
    'Autonomous Veto Authority',
    'Real-time policy enforcement — can halt any system operation that violates architectural invariants, ethical constraints, or security policies. Immutable audit trail.',
    'The supreme court. Every mutation must pass governance. Non-negotiable.',
    [88, 98, 90, 82], 'enterprise', 'guard',
    'Governance kernel is the most sensitive component — never exposed',
    true, true), // S-TIER: utility 98
  jewel('gov-governance-policy-evolution', 'GOVERNANCE',
    'Policy Evolution Engine',
    'Governance policies that evolve — learns from veto patterns, suggests policy refinements, and auto-retires rules that haven\'t triggered in 90+ days',
    'Governance that governs itself. Policies improve without manual intervention.',
    [94, 85, 88, 78], 'enterprise', 'guard',
    'Meta-governance IP — reveals how the system adapts its own rules',
    true),

  // ── ATLAS ─────────────────────────────────────────────────────────────────
  jewel('gov-atlas-capability-recommendation', 'ATLAS',
    'Context-Aware Capability Recommender',
    'Analyzes current task context and recommends optimal capability combinations from the full registry. Learns from successful compositions.',
    'The system that knows what you need before you do.',
    [85, 90, 78, 88], 'creator', 'activate',
    'User-facing discovery tool — sealed delivery, recommendation weights protected',
    false),
  jewel('gov-atlas-topology-navigator', 'ATLAS',
    'Topology Navigator',
    'Visual and programmatic navigation of the full 40-primitive topology — shows dependency chains, affinity clusters, and capability heat maps',
    'The map of the system itself. Navigate the substrate like a city.',
    [82, 88, 75, 80], 'creator', 'activate',
    'Discovery and exploration tool — sealed delivery',
    false),

  // ── ENGINEER ──────────────────────────────────────────────────────────────
  jewel('gov-engineer-autonomous-test-synthesis', 'ENGINEER',
    'Autonomous Test Synthesis Engine',
    'Generates comprehensive test suites from code analysis — property-based tests, edge case discovery, mutation testing, coverage-gap detection',
    'Tests are the bottleneck. This eliminates it by generating meaningful tests.',
    [88, 92, 80, 75], 'creator', 'activate',
    'Developer productivity at creator tier — sealed delivery',
    false),
  jewel('gov-engineer-regression-guardian', 'ENGINEER',
    'Regression Guardian',
    'Monitors every code change against behavioral baselines — catches regressions that pass unit tests but break real-world behavior patterns',
    'Unit tests pass but the feature is broken? This catches that.',
    [85, 90, 78, 75], 'creator', 'activate',
    'Quality assurance at creator tier — sealed delivery',
    false),

  // ── DREAM ─────────────────────────────────────────────────────────────────
  jewel('gov-dream-synthetic-intuition', 'DREAM',
    'Synthetic Intuition Engine',
    'Generates pre-conscious "hunches" from pattern fragments that haven\'t yet crystallized into explicit knowledge. During idle cycles, the DREAM primitive runs consolidation across the 20-agent fleet\'s memories, detecting statistical regularities below the threshold of explicit pattern recognition. These weak signals — co-occurrence frequencies, temporal adjacencies, structural analogies — are synthesized into weighted "intuition vectors" that bias future reasoning without requiring conscious justification. The engine operates on three layers: (1) Fragment Collection — harvests sub-threshold pattern matches from BRAIN, MEMORY, and ECHO during dream cycles; (2) Resonance Amplification — when 3+ fragments from independent sources converge on the same latent structure, the signal is amplified above the intuition threshold; (3) Bias Injection — the resulting intuition vector is injected into CORTEX\'s strategy space as a soft prior, making the system more likely to explore paths it has a "feeling" about without overriding explicit reasoning. This is how the substrate develops genuine hunches — not hallucination, but statistically grounded pre-conscious pattern emergence.',
    'The most architecturally novel capability in the substrate. Genuine pre-conscious pattern emergence — the system develops hunches before it can articulate why.',
    [98, 85, 96, 80], 'enterprise', 'guard',
    'Peak cognitive IP — the substrate\'s most novel capability. Revealing intuition synthesis would eliminate competitive moat.',
    true, true), // S-TIER: novelty 98 + complexity 96
  jewel('gov-dream-cross-pollination', 'DREAM',
    'Cross-Agent Dream Pollination',
    'Distributes insights learned by individual agents across the entire fleet during idle cycles — one agent\'s discovery becomes the collective\'s knowledge without human direction or additional API cost',
    'The compounding intelligence layer. Every agent makes every other agent smarter.',
    [92, 90, 85, 88], 'enterprise', 'guard',
    'Core CLM (Continuous Learning Machine) IP — reveals fleet intelligence distribution',
    true),

  // ═══════════════════════════════════════════════════════════════════════════
  // 11 EXPANSION PRIMITIVES — 3 jewels each (33 total)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── ORACLE (3) ────────────────────────────────────────────────────────────
  jewel('gov-oracle-bayesian-inference', 'ORACLE',
    'Bayesian Inference Engine',
    'Full Bayesian network with belief propagation, downstream causal inference, multi-factor posterior computation, and ensemble prediction fusion',
    'The purest prediction capability. Mathematically rigorous, composable with every primitive.',
    [88, 94, 90, 85], 'architect', 'activate',
    'High-value prediction engine — sealed delivery, hex-encoded prior weights',
    false),
  jewel('gov-oracle-causal-graph-traversal', 'ORACLE',
    'Causal Graph Traversal',
    'Edge-wired causal networks with BFS belief propagation, parent-aggregated influence scoring, and cycle-safe traversal — answers "what caused this?"',
    'Causality, not correlation. This traces why things happen, not just that they co-occur.',
    [92, 88, 90, 82], 'enterprise', 'guard',
    'Reveals substrate topology reasoning patterns — architecture IP',
    true),
  jewel('gov-oracle-ensemble-prediction', 'ORACLE',
    'Ensemble Prediction Combiner',
    'Multi-method prediction fusion (bayesian + montecarlo + regression + ensemble) with coefficient-of-variation confidence scoring',
    'Four prediction methods, one answer. Ensemble beats any single method.',
    [80, 90, 78, 82], 'creator', 'activate',
    'High-utility general-purpose prediction at creator tier',
    false),

  // ── SOVEREIGN (3) ─────────────────────────────────────────────────────────
  jewel('gov-sovereign-compliance-engine', 'SOVEREIGN',
    'Full-Stack Compliance Engine',
    'Multi-framework compliance (GDPR, HIPAA, ITAR, SOC2, CCPA + 5 more) with auto-remediation, violation severity scoring, and jurisdiction gap detection',
    'The compliance juggernaut. 10 frameworks, auto-remediation, jurisdiction awareness.',
    [85, 96, 88, 78], 'architect', 'activate',
    'Enterprise compliance differentiator — sealed delivery',
    false, true), // S-TIER: utility 96
  jewel('gov-sovereign-consent-lifecycle', 'SOVEREIGN',
    'Immutable Consent Lifecycle Manager',
    'Append-only consent records with expiry detection, framework-scoped consent, and 30-day expiry warning system',
    'GDPR requires provable consent chains. This is that chain, immutable and auditable.',
    [82, 90, 72, 70], 'creator', 'activate',
    'GDPR/CCPA essential at creator tier',
    false),
  jewel('gov-sovereign-data-residency-enforcer', 'SOVEREIGN',
    'Data Residency Enforcer',
    'Automatic detection of unprotected jurisdictions where residency rules are missing, with real-time gap telemetry and routing enforcement',
    'Data must stay where the law says it stays. This enforces it automatically.',
    [88, 88, 72, 75], 'architect', 'activate',
    'Multi-jurisdiction deployment essential — sealed delivery',
    false),

  // ── SHADOW (3) ────────────────────────────────────────────────────────────
  jewel('gov-shadow-canary-promotion', 'SHADOW',
    'Canary Promotion Protocol',
    'Graduated canary deployment with divergence-based promotion/rollback, dark launch mode, and concurrent execution caps',
    'Not all-or-nothing deployments. Gradual promotion with automatic rollback.',
    [90, 88, 85, 80], 'enterprise', 'guard',
    'Core SEBA dependency — structural IP',
    true),
  jewel('gov-shadow-mesh-isolation', 'SHADOW',
    'Shadow Mesh Isolation Controller',
    'Configurable shadow mesh with load indexing, health bleed control, and concurrent run management — prevents shadow execution from affecting production',
    'Shadow testing that never leaks into production. Complete isolation guaranteed.',
    [80, 85, 78, 72], 'architect', 'activate',
    'A/B testing infrastructure at architect tier',
    false),
  jewel('gov-shadow-ab-statistical-engine', 'SHADOW',
    'A/B Statistical Significance Engine',
    'Bayesian A/B testing with early stopping rules, multi-armed bandit optimization, and automatic winner declaration with configurable confidence levels',
    'Not just A/B testing — statistically rigorous A/B testing with optimal sample efficiency.',
    [85, 90, 82, 78], 'architect', 'activate',
    'Data-driven optimization at architect tier — sealed delivery',
    false),

  // ── FORGE (3) ─────────────────────────────────────────────────────────────
  jewel('gov-forge-blueprint-compiler', 'FORGE',
    'Blueprint-to-Artifact Compiler',
    'Multi-language (TS/Python/Go/Rust/SQL/JSON Schema) blueprint to validated code artifact with build pipeline, test integration, and deploy routing',
    'Turns abstract specifications into deployable code across 6 languages.',
    [88, 92, 85, 80], 'architect', 'activate',
    'Core code generation pipeline — sealed delivery',
    false),
  jewel('gov-forge-sandboxed-build', 'FORGE',
    'Sandboxed Build Pipeline',
    'Full build lifecycle (queue→compile→test→deploy) with test pass/fail tracking, build time metrics, and deploy target routing',
    'Every build runs in isolation. Compilation failures never affect production.',
    [82, 88, 80, 78], 'architect', 'activate',
    'Essential for gated code generation workflows — sealed delivery',
    false),
  jewel('gov-forge-capability-synthesis', 'FORGE',
    'Capability Synthesis Engine',
    'Composes new capabilities from existing primitives by analyzing resolver compatibility, generating adapter glue code, and validating the composite through shadow testing',
    'The forge that builds new tools from existing tools. Meta-capability generation.',
    [95, 85, 92, 88], 'enterprise', 'guard',
    'Reveals how the substrate generates new capabilities — peak competitive moat',
    true, true), // S-TIER: novelty 95 + composability 88

  // ── HARVEST (3) ───────────────────────────────────────────────────────────
  jewel('gov-harvest-multi-source-ingestion', 'HARVEST',
    'Multi-Source Data Ingestion Engine',
    '7-source-type acquisition (API/webhook/RSS/database/file/stream/sensor) with rate limit awareness, adaptive polling, and throughput tracking',
    'The universal data mouth. Every system needs to eat data — this does it across every source.',
    [80, 95, 78, 88], 'creator', 'activate',
    'High-utility data primitive at creator tier — sealed delivery',
    false, true), // S-TIER: utility 95
  jewel('gov-harvest-etl-orchestrator', 'HARVEST',
    'ETL Pipeline Orchestrator',
    'Multi-source ETL pipeline composition with transformation chains, destination routing, and throughput tracking',
    'Extract, transform, load — composed into reusable pipelines.',
    [78, 88, 75, 80], 'creator', 'activate',
    'Data transformation pipeline at creator tier',
    false),
  jewel('gov-harvest-adaptive-feed-manager', 'HARVEST',
    'Adaptive Feed Status Manager',
    'Auto-managed feed lifecycle with status tracking (active/paused/error/rate_limited/exhausted) and error rate monitoring with automatic backoff',
    'Feeds that manage themselves. Auto-pause on errors, auto-resume on recovery.',
    [72, 82, 65, 70], 'studio', 'activate',
    'Feed monitoring at studio tier',
    false),

  // ── TREATY (3) ────────────────────────────────────────────────────────────
  jewel('gov-treaty-bilateral-sla-engine', 'TREATY',
    'Bilateral SLA Enforcement Engine',
    'Per-party SLA evaluation with bilateral compliance scoring, inverted metric handling, automatic renewal, and 4-tier penalty escalation',
    'Both parties are measured, not just the provider. Bilateral scoring is novel.',
    [90, 90, 85, 80], 'architect', 'activate',
    'Enterprise SLA management — sealed delivery, escalation thresholds hex-encoded',
    false),
  jewel('gov-treaty-dispute-resolution', 'TREATY',
    'Evidence-Weighted Dispute Resolution',
    'Multi-evidence arbitration with weighted scoring, precedent matching, and binding verdict generation — automated conflict resolution',
    'Disputes resolved by evidence, not authority. Precedent-aware arbitration.',
    [92, 85, 82, 75], 'architect', 'activate',
    'Unique dispute arbitration capability — sealed delivery',
    false),
  jewel('gov-treaty-multi-party-arbitration', 'TREATY',
    'N-Party Arbitration with Quorum',
    'Multi-party weighted voting arbitration with quorum requirements and delegation — scales to unlimited parties',
    'Governance coordination at scale. N parties, weighted votes, quorum rules.',
    [92, 80, 88, 72], 'enterprise', 'guard',
    'Reveals governance coordination patterns — structural IP',
    true),

  // ── COMPASS (3) ───────────────────────────────────────────────────────────
  jewel('gov-compass-timeseries-decomposition', 'COMPASS',
    'Time-Series Decomposition & Forecaster',
    'Linear regression trend + autocorrelation seasonality + residual analysis with decaying confidence multi-step forecasting',
    'Full time-series analysis in a single primitive. Trend, seasonality, anomaly — all in one.',
    [88, 92, 85, 80], 'architect', 'activate',
    'High-utility analytics pipeline — sealed delivery',
    false),
  jewel('gov-compass-temporal-pattern-detector', 'COMPASS',
    'Multi-Pattern Temporal Detector',
    '4-type pattern detection (trend/anomaly/seasonality/changepoint) with z-score anomalies, autocorrelation periods, and structural shift detection',
    'Finds every type of temporal pattern in one pass.',
    [88, 88, 85, 78], 'architect', 'activate',
    'Advanced temporal analytics at architect tier — sealed delivery',
    false),
  jewel('gov-compass-route-optimizer', 'COMPASS',
    'Nearest-Neighbor + 2-Opt Route Optimizer',
    'Haversine-based route optimization with nearest-neighbor heuristic and 2-opt improvement phase, efficiency scoring',
    'Classical combinatorial optimization with real algorithmic depth.',
    [82, 88, 82, 75], 'creator', 'activate',
    'Optimization primitive at creator tier',
    false),

  // ── PHANTOM (3) ───────────────────────────────────────────────────────────
  jewel('gov-phantom-differential-privacy', 'PHANTOM',
    'Differential Privacy Noise Engine',
    '4-mechanism privacy (Laplacian/Gaussian/Exponential/Randomized Response) with epsilon budget tracking, per-query consumption, and synthetic data generation',
    'Mathematically proven privacy — not heuristic-based.',
    [92, 90, 92, 78], 'architect', 'activate',
    'Enterprise privacy with mathematical guarantees — sealed runtime',
    false),
  jewel('gov-phantom-pii-anonymizer', 'PHANTOM',
    'PII Detection & Anonymization Pipeline',
    '6-method anonymization (k-anonymity/l-diversity/t-closeness/DP/tokenization/masking) with regex PII detection and information loss scoring',
    'Every privacy regulation requires PII handling. This does all 6 methods.',
    [80, 92, 78, 80], 'creator', 'activate',
    'Privacy compliance tool at creator tier — sealed delivery',
    false),
  jewel('gov-phantom-governance-gated-ops', 'PHANTOM',
    'Governance-Gated Covert Operations',
    'Multi-party approval (2+ approvers), hardcoded ethical constraints (no impersonation/social engineering), TTL enforcement with auto-sanitization',
    'Covert operations with built-in ethics. The system can\'t be used for harm.',
    [95, 82, 90, 72], 'enterprise', 'guard',
    'Governance-layer operation — reveals approval topology',
    true, true), // S-TIER: novelty 95

  // ── ECHO (3) ──────────────────────────────────────────────────────────────
  jewel('gov-echo-resonance-pattern-engine', 'ECHO',
    'Resonance Pattern Detection Engine',
    'Multi-window harmonic co-occurrence detection across signal types with confidence-weighted pattern discovery and amplification',
    'Finds patterns in the noise that no other primitive can see.',
    [92, 85, 85, 82], 'architect', 'activate',
    'Signal analytics at architect tier — sealed delivery',
    false),
  jewel('gov-echo-cross-node-correlation', 'ECHO',
    'Cross-Node Signal Correlation Engine',
    'N-gram causal chain discovery (2-gram, 3-gram) with frequency-weighted confidence and cross-primitive signal tracking',
    'Discovers causal chains between primitives nobody designed.',
    [94, 88, 90, 85], 'enterprise', 'guard',
    'Reveals inter-primitive communication patterns — topology IP',
    true, true), // S-TIER: novelty 94 + composability 85
  jewel('gov-echo-chamber-prevention', 'ECHO',
    'Echo Chamber Detection & Prevention',
    'Anti-feedback loop system with bounce pattern detection, max depth enforcement, and automatic cycle breaking',
    'The safety valve. Prevents the system from getting stuck in self-reinforcing loops.',
    [88, 85, 78, 75], 'creator', 'activate',
    'Safety mechanism at creator tier — sealed delivery',
    false),

  // ── LINGUA (3) ────────────────────────────────────────────────────────────
  jewel('gov-lingua-adaptive-fidelity', 'LINGUA',
    'Adaptive Fidelity Learning Engine',
    'EMA-weighted fidelity profile learning per format pair with CUSUM regression detection and automatic bridge degradation',
    'Translation that gets better with use. Self-improving fidelity.',
    [92, 88, 88, 82], 'architect', 'activate',
    'Self-improving translation — sealed runtime, EMA weights hex-encoded',
    false),
  jewel('gov-lingua-transitive-bridge-mesh', 'LINGUA',
    'Transitive Protocol Bridge Mesh',
    'BFS-based transitive path discovery (A→B→C) across modality bridges with combined fidelity scoring and hot-swap replacement',
    'If A translates to B and B translates to C, we can translate A to C. Automatic bridge chaining.',
    [94, 85, 90, 85], 'enterprise', 'guard',
    'Reveals substrate modality mesh topology — structural IP',
    true, true), // S-TIER: novelty 94 + composability 85
  jewel('gov-lingua-multi-modal-pipeline', 'LINGUA',
    'Multi-Modal Translation Pipeline',
    '7-modality (text/code/image/audio/structured_data/embedding/graph) translation with streaming, batch queuing, and priority lanes',
    'Universal translator. Seven modalities, one pipeline.',
    [85, 90, 80, 82], 'creator', 'activate',
    'Versatile translation at creator tier',
    false),

  // ── REFLEX (3) ────────────────────────────────────────────────────────────
  jewel('gov-reflex-sub10ms-decision-loop', 'REFLEX',
    'Sub-10ms Edge Decision Loop',
    'Real-time rule matching with latency-optimal node selection, p99 tracking, throughput monitoring, and multi-region edge mesh orchestration',
    'Speed is the feature. Sub-10ms decision making at the edge.',
    [90, 88, 82, 78], 'architect', 'activate',
    'Unique real-time edge primitive — sealed delivery',
    false),
  jewel('gov-reflex-edge-node-mesh', 'REFLEX',
    'Edge Node Mesh Orchestrator',
    'Multi-region edge node registration with heartbeat monitoring, capacity tracking, and overload detection — self-managing edge infrastructure',
    'Edge nodes that manage themselves. Register, monitor, rebalance — automatically.',
    [80, 85, 75, 72], 'creator', 'activate',
    'Edge infrastructure at creator tier',
    false),
  jewel('gov-reflex-predictive-precompute', 'REFLEX',
    'Predictive Precompute Engine',
    'Anticipates likely next decisions based on recent patterns and pre-computes results — eliminates latency for predicted paths while discarding unused precomputes',
    'The system that starts thinking before you ask. Speculative execution for edge computing.',
    [94, 85, 88, 78], 'enterprise', 'guard',
    'Reveals predictive heuristics — competitive moat for edge performance',
    true, true), // S-TIER: novelty 94

  // ═══════════════════════════════════════════════════════════════════════════
  // 13 INFRASTRUCTURE PRIMITIVES — 1 jewel each (13 total)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── SYSTEM ────────────────────────────────────────────────────────────────
  jewel('gov-system-boot-dependency-resolver', 'SYSTEM',
    'Boot Dependency Resolver',
    'Topological sort of all 40 primitive boot dependencies — ensures correct initialization order, detects circular dependencies, and supports staged warm-up',
    'The bootstrap protocol. 40 primitives boot in the right order, every time.',
    [82, 95, 80, 78], 'enterprise', 'guard',
    'Reveals boot topology — attackers could exploit initialization race conditions',
    true),

  // ── NEXUS ─────────────────────────────────────────────────────────────────
  jewel('gov-nexus-fleet-intelligence', 'NEXUS',
    'Fleet Intelligence Orchestrator',
    'Multi-model consensus with IQR outlier rejection, cost-aware routing across providers, and automatic fallback chain architecture',
    'The AI brain that manages AI brains. Optimal model selection across the entire fleet.',
    [90, 92, 88, 85], 'enterprise', 'guard',
    'Core AI routing IP — reveals model selection and consensus strategy',
    true, true), // S-TIER: utility 92 + composability 85

  // ── VISION ────────────────────────────────────────────────────────────────
  jewel('gov-vision-root-cause-analysis', 'VISION',
    'Automated Root Cause Analysis',
    'Traces system anomalies back to their origin through causal graph traversal — correlates symptoms across primitives and produces ranked root cause hypotheses',
    'The diagnostic genius. Doesn\'t just find problems — finds WHY.',
    [90, 92, 88, 80], 'architect', 'activate',
    'Observability differentiator — sealed delivery, causal weights protected',
    false),

  // ── RELAY ─────────────────────────────────────────────────────────────────
  jewel('gov-relay-adaptive-delivery', 'RELAY',
    'Adaptive Multi-Channel Delivery',
    'Content-aware delivery routing across channels (email/webhook/push/SMS/in-app) with automatic failover, delivery confirmation tracking, and smart batching',
    'The right message, the right channel, confirmed delivery. Automatically.',
    [82, 92, 78, 82], 'creator', 'activate',
    'Delivery infrastructure at creator tier — sealed delivery',
    false),

  // ── RIPPLE ────────────────────────────────────────────────────────────────
  jewel('gov-ripple-semantic-event-routing', 'RIPPLE',
    'Semantic Event Router',
    'Content-aware event routing that understands event meaning — routes based on semantic similarity, not just topic strings. Deduplicates semantically identical events.',
    'Events that route themselves based on what they mean, not what they\'re labeled.',
    [88, 85, 80, 82], 'architect', 'activate',
    'Intelligent event bus — sealed delivery, semantic models protected',
    false),

  // ── SANDBOX ───────────────────────────────────────────────────────────────
  jewel('gov-sandbox-chaos-orchestrator', 'SANDBOX',
    'Chaos Orchestrator',
    'Automated chaos engineering — injects calibrated failures (latency/crashes/data corruption) into sandboxed environments, measures system resilience, and scores recovery',
    'Break things on purpose to build things that don\'t break.',
    [88, 88, 82, 78], 'architect', 'activate',
    'Resilience testing at architect tier — sealed delivery',
    false),

  // ── ECONOMY ───────────────────────────────────────────────────────────────
  jewel('gov-economy-dynamic-pricing', 'ECONOMY',
    'Dynamic Pricing Engine',
    'Multi-model consensus pricing with IQR outlier rejection, market weight blending, and CJPI-anchored valuation. Real-time cost attribution across the 40-node matrix.',
    'Software that prices itself. Grounded valuations, not guesswork.',
    [88, 90, 85, 78], 'architect', 'activate',
    'Platform economics at architect tier — pricing models hex-encoded',
    false),

  // ── IDENTITY ──────────────────────────────────────────────────────────────
  jewel('gov-identity-behavioral-fingerprinting', 'IDENTITY',
    'Behavioral Fingerprinting Engine',
    'Builds unique identity signatures from interaction patterns, usage rhythms, and preference evolution — detects identity anomalies without traditional credentials',
    'Your behavior IS your identity. Continuous authentication through how you work.',
    [92, 85, 82, 78], 'architect', 'activate',
    'Identity innovation at architect tier — fingerprint models sealed',
    false),

  // ── ACCESS ────────────────────────────────────────────────────────────────
  jewel('gov-access-entitlement-reasoning', 'ACCESS',
    'Entitlement Reasoning Engine',
    'Derives effective permissions through policy chain reasoning — resolves conflicting rules, evaluates contextual grants, and explains WHY access was granted or denied',
    'Not just "denied" — "denied because X policy overrides Y grant in Z context."',
    [85, 90, 82, 78], 'architect', 'activate',
    'Explainable access control at architect tier — sealed delivery',
    false),

  // ── AUDIT ─────────────────────────────────────────────────────────────────
  jewel('gov-audit-forensic-timeline', 'AUDIT',
    'Forensic Timeline Reconstruction',
    'Reconstructs complete event timelines from fragmented audit records — fills temporal gaps, cross-references multiple primitives, and produces court-admissible event chains',
    'What happened, in what order, with what evidence. Forensic-grade reconstruction.',
    [85, 90, 85, 75], 'architect', 'activate',
    'Enterprise audit capability at architect tier — sealed delivery',
    false),

  // ── MEDIC ─────────────────────────────────────────────────────────────────
  jewel('gov-medic-predictive-healing', 'MEDIC',
    'Predictive Healing Engine',
    'Predicts system failures before they occur by analyzing degradation patterns — pre-applies healing patches to prevent outages instead of responding to them',
    'The doctor that prevents illness, not just treats it.',
    [90, 90, 82, 78], 'architect', 'activate',
    'Proactive healing at architect tier — sealed delivery',
    false),

  // ── INCLUSIVE ──────────────────────────────────────────────────────────────
  jewel('gov-inclusive-neurodiversity-adaptation', 'INCLUSIVE',
    'Neurodiversity Adaptation Engine',
    'Adapts interface complexity, information density, and interaction patterns to match cognitive preferences — supports ADHD, dyslexia, autism spectrum, and other neurodivergent profiles',
    'Technology that adapts to how minds actually work, not how we assume they work.',
    [92, 85, 80, 75], 'architect', 'activate',
    'Accessibility innovation — sealed delivery, adaptation models protected',
    false),

  // ── INTEGRATION ───────────────────────────────────────────────────────────
  jewel('gov-integration-connector-orchestration', 'INTEGRATION',
    'Universal Connector Orchestrator',
    'Auto-discovers API schemas, generates typed connectors, manages authentication lifecycle, and self-heals broken integrations with automatic retry and fallback',
    'Connect to anything. The system builds its own integrations.',
    [85, 92, 80, 85], 'architect', 'activate',
    'Integration infrastructure at architect tier — sealed delivery',
    false),

  // ── ANALYTICS ─────────────────────────────────────────────────────────────
  jewel('gov-analytics-cognitive-dashboard', 'ANALYTICS',
    'Cognitive Analytics Dashboard Engine',
    'Auto-generates insight dashboards from raw telemetry — identifies the most important metrics, detects anomalies, and surfaces actionable recommendations without manual configuration',
    'Dashboards that build themselves. The system knows what metrics matter.',
    [85, 90, 78, 80], 'creator', 'activate',
    'Self-configuring analytics at creator tier — sealed delivery',
    false),

  // ── OBSERVABILITY ─────────────────────────────────────────────────────────
  jewel('gov-observability-distributed-trace', 'OBSERVABILITY',
    'Distributed Trace Intelligence',
    'End-to-end request tracing across all 40 primitives with automatic bottleneck detection, latency attribution, and optimization recommendations',
    'See everything, miss nothing. Full distributed tracing with actionable insights.',
    [82, 92, 80, 78], 'architect', 'activate',
    'Enterprise observability at architect tier — sealed delivery',
    false),
];

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY INTEGRATION
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

/** Get deferred jewels */
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
  byPrimitive: Record<string, { decision: CuratedDecision; count: number }>;
}

export function getGovernorCurationSummary(): GovernorCurationSummary {
  const byTier: Record<ProductTier, number> = {
    builder: 0, studio: 0, creator: 0, architect: 0, enterprise: 0,
  };
  const byPrimitive: Record<string, { decision: CuratedDecision; count: number }> = {};

  let activated = 0, guarded = 0, deferred = 0, sTier = 0, totalCjpi = 0;

  for (const j of GOVERNOR_CURATED_JEWELS) {
    if (!byPrimitive[j.primitive]) {
      byPrimitive[j.primitive] = { decision: j.decision, count: 0 };
    }
    byPrimitive[j.primitive].count++;
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
    totalPrimitives: Object.keys(byPrimitive).length,
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
