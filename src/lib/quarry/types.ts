/**
 * Quarry — Strategic Asset Registry Types
 * Substrate-Native Artifact Density Model
 */

export type QuarryTier = 'free' | 'creator' | 'architect' | 'enterprise' | 'internal';
export type QuarryVisibility = 'hidden' | 'tier_exposed' | 'public_curated' | 'baseline';
export type QuarryAssetType = 'capability' | 'engine' | 'meta_engine' | 'pipeline' | 'template' | 'agent' | 'deployment_right' | 'governance_tool' | 'artifact_pack';

/** Product tiers — Builder / Operator / Studio / Architect */
export type ProductTier = 'builder' | 'operator' | 'studio' | 'architect';

export interface ArtifactSlotConfig {
  tier: ProductTier;
  slots: number;
  memoryDepth: 'standard' | 'expanded' | 'expanded_plus' | 'dedicated';
  deploymentRights: boolean;
  governanceScope: 'basic' | 'advanced' | 'full';
}

export const PRODUCT_TIERS: Record<ProductTier, ArtifactSlotConfig> = {
  builder: {
    tier: 'builder',
    slots: 3,
    memoryDepth: 'standard',
    deploymentRights: false,
    governanceScope: 'basic',
  },
  operator: {
    tier: 'operator',
    slots: 6,
    memoryDepth: 'expanded',
    deploymentRights: false,
    governanceScope: 'advanced',
  },
  studio: {
    tier: 'studio',
    slots: 9,
    memoryDepth: 'expanded_plus',
    deploymentRights: false,
    governanceScope: 'advanced',
  },
  architect: {
    tier: 'architect',
    slots: 12,
    memoryDepth: 'dedicated',
    deploymentRights: true,
    governanceScope: 'full',
  },
};

/** Strategic Domains — category-defining groupings above pack level */
export interface StrategicDomain {
  id: string;
  name: string;
  thesis: string;
  packIds: string[];
}

export const STRATEGIC_DOMAINS: StrategicDomain[] = [
  {
    id: 'domain-memory',
    name: 'Memory & Continuity',
    thesis: 'Conventional AI forgets between sessions. The substrate remembers, contradicts, compresses, and evolves context across time — because cognition without continuity is noise.',
    packIds: ['pack-persistent-memory', 'pack-dedicated-partitions', 'pack-context-intelligence'],
  },
  {
    id: 'domain-coordination',
    name: 'Coordination & Automation',
    thesis: 'Most automation stitches disconnected APIs. The substrate coordinates agents, workflows, and tasks within a single runtime — so orchestration emerges from architecture, not integration.',
    packIds: ['pack-agent-composer', 'pack-multi-agent-ops', 'pack-workflow-automation', 'pack-background-optimization'],
  },
  {
    id: 'domain-intelligence',
    name: 'Intelligence & Foresight',
    thesis: 'Static dashboards show what happened. The substrate synthesizes signals across domains, validates hypotheses, and projects forward — because intelligence is anticipation, not reporting.',
    packIds: ['pack-deep-research', 'pack-predictive-analytics', 'pack-strategic-intelligence', 'pack-creative-synthesis'],
  },
  {
    id: 'domain-resilience',
    name: 'Resilience & Trust',
    thesis: 'Bolted-on security creates compliance theater. The substrate enforces trust, detects drift, and self-heals at the runtime level — because resilience must be structural, not cosmetic.',
    packIds: ['pack-threat-intelligence', 'pack-incident-response', 'pack-zero-trust', 'pack-quality-assurance'],
  },
  {
    id: 'domain-sovereignty',
    name: 'Sovereignty & Deployment',
    thesis: 'Cloud-only platforms hold your infrastructure hostage. The substrate deploys anywhere — cloud, on-premise, air-gapped — because sovereignty means running what you own, where you choose.',
    packIds: ['pack-self-hosted', 'pack-safe-evolution', 'pack-governance-audit'],
  },
  {
    id: 'domain-perception',
    name: 'Perception & Interaction',
    thesis: 'Chatbots parse keywords. The substrate resolves intent, adapts personality, traverses knowledge, and routes data — because interaction is a cognitive act, not a string match.',
    packIds: ['pack-intent-resolution', 'pack-empathetic-interaction', 'pack-knowledge-graph', 'pack-data-pipeline', 'pack-observability', 'pack-capacity-management'],
  },
];

export interface ArtifactPack {
  id: string;
  name: string;
  version: string;
  description: string;
  useCase: string;
  slotsRequired: 1; // All packs = 1 slot. Always.
  components: string[];
  /** Internal: crystallized pipeline IDs this pack depends on (never exposed publicly) */
  _crystallizedPipelines: string[];
  /** Internal: why this pack cannot exist in a fragmented architecture */
  _emergenceClause: string;
  docUrl?: string;
}

export interface QuarryAsset {
  id: string;
  asset_key: string;
  asset_type: QuarryAssetType;
  name: string;
  description: string | null;
  tier: QuarryTier;
  visibility: QuarryVisibility;
  value_density: number;
  stability: number;
  strategic_weight: number;
  revenue_impact: number;
  differentiation: number;
  maintenance_load: number;
  future_release: boolean;
  category: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const TIER_ORDER: Record<QuarryTier, number> = {
  free: 0,
  creator: 1,
  architect: 2,
  enterprise: 3,
  internal: 4,
};

export const TIER_LABELS: Record<QuarryTier, string> = {
  free: 'Free',
  creator: 'Creator',
  architect: 'Architect',
  enterprise: 'Enterprise',
  internal: 'Internal Only',
};

export const PRODUCT_TIER_LABELS: Record<ProductTier, string> = {
  builder: 'Builder',
  operator: 'Operator',
  studio: 'Studio',
  architect: 'Architect',
};

export const ASSET_TYPE_LABELS: Record<QuarryAssetType, string> = {
  capability: 'Capability',
  engine: 'Engine',
  meta_engine: 'Meta-Engine',
  pipeline: 'Pipeline',
  template: 'Template',
  agent: 'Agent',
  deployment_right: 'Deployment Right',
  governance_tool: 'Governance Tool',
  artifact_pack: 'Artifact Pack',
};

export const VISIBILITY_LABELS: Record<QuarryVisibility, string> = {
  hidden: 'Hidden',
  tier_exposed: 'Tier Exposed',
  public_curated: 'Public Curated',
  baseline: 'Baseline Technology',
};

/** Composite score for asset value evaluation */
export function computeAssetScore(asset: QuarryAsset): number {
  return (
    asset.value_density * 0.22 +
    asset.revenue_impact * 0.22 +
    asset.stability * 0.12 +
    asset.differentiation * 0.28 +
    (1 - asset.maintenance_load) * 0.16
  );
}

/**
 * 24 Artifact Packs — Equal-slot model.
 * Every pack = 1 slot. No tier gating. All visible to all users.
 * Capacity controls activation only.
 * No internal taxonomy exposed publicly.
 * 
 * v5.0 — Substrate-native density pass:
 * - Every pack validated against crystallized pipeline registry
 * - Every pack includes at least one sealed multi-module resolver chain
 * - Emergence clauses document why fragmented architectures cannot replicate
 * - Differentiation weighting increased in computeAssetScore
 */
export const ARTIFACT_PACKS: ArtifactPack[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY & CONTINUITY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-persistent-memory',
    name: 'Persistent Memory',
    version: 'v1.0',
    description: 'Tiered recall across hot, warm, and cold layers with contradiction detection, confidence decay curves, and spaced repetition scheduling. Memory doesn\'t just persist — it self-organizes through value scoring and autonomous demotion cascades that restructure knowledge topology without operator intervention.',
    useCase: 'Long-running projects where continuity across sessions determines output quality and where knowledge must age gracefully rather than rot.',
    slotsRequired: 1,
    components: ['memory-tiering', 'recall-engine', 'contradiction-detector', 'spaced-repetition', 'confidence-decay', 'value-scorer'],
    _crystallizedPipelines: ['cp-memory-consolidation-pipeline', 'cp-smart-cache-invalidator'],
    _emergenceClause: 'Memory tiering requires runtime-level value scoring that mutates across hot/warm/cold/archive boundaries. The contradiction detector cross-references new entries against existing memory using trigram similarity — this requires shared memory state across all tiers simultaneously, which is structurally impossible when memory is an external service.',
  },
  {
    id: 'pack-dedicated-partitions',
    name: 'Dedicated Memory Partitions',
    version: 'v1.0',
    description: 'Isolated cognitive namespaces per project with custom retention policies, compression ratios, and archival strategies. Each partition maintains its own metacognitive assessment — tracking recall accuracy, retrieval strategy, and salience distribution independently. Partitions don\'t share memory; they share the intelligence that governs memory.',
    useCase: 'Multi-project environments requiring strict data separation where each domain develops its own recall patterns and retention characteristics.',
    slotsRequired: 1,
    components: ['memory-partitioner', 'retention-policy', 'isolation-layer', 'compression-engine', 'metacognitive-assessor'],
    _crystallizedPipelines: ['cp-multi-tenant-isolation-fabric', 'cp-cross-project-learning-bridge'],
    _emergenceClause: 'Partition isolation with shared metacognition requires the runtime to enforce cryptographic boundaries while allowing cross-partition strategy transfer. The adaptive memory limits function computes per-user capacity based on recall history — this feedback loop between memory performance and memory allocation cannot exist when storage and compute are separate services.',
  },
  {
    id: 'pack-context-intelligence',
    name: 'Context Intelligence',
    version: 'v1.0',
    description: 'Adaptive context assembly that scores temporal relevance, balances cognitive load, and compresses input windows in real-time. Context isn\'t selected — it\'s composed through a multi-stage pipeline that weighs recency, salience, user fingerprint patterns, and semantic density to produce the minimum effective context for each operation.',
    useCase: 'High-throughput systems where context precision directly impacts output accuracy and where token budgets constrain what can be included.',
    slotsRequired: 1,
    components: ['context-optimizer', 'temporal-scorer', 'salience-ranker', 'window-compressor', 'fingerprint-integration'],
    _crystallizedPipelines: ['cp-context-window-optimizer', 'cp-cognitive-load-optimizer'],
    _emergenceClause: 'Context assembly fuses real-time salience scores from the memory tier, user fingerprint data from the interaction layer, and temporal decay curves from the recall engine. This three-way fusion requires simultaneous read access to memory state, user model, and decay parameters — a runtime property that cannot be replicated by calling three separate APIs.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COORDINATION & AUTOMATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-agent-composer',
    name: 'Agent Composer',
    version: 'v1.0',
    description: 'Build composable cognitive agents with specialized skill trees, competency tracking, and autonomous learning curves. Agents don\'t just execute — they develop proficiency through a competency scoring system that gates skill progression, adjusts task assignment confidence, and evolves heuristics from execution traces.',
    useCase: 'Developers creating purpose-built agents that improve through operational feedback loops rather than manual retraining.',
    slotsRequired: 1,
    components: ['cognitive-registry', 'agent-skills', 'competency-tracker', 'agency-orchestrator', 'heuristic-evolver'],
    _crystallizedPipelines: ['cp-session-handoff-chain', 'cp-pattern-consolidation-pipeline'],
    _emergenceClause: 'Agent competency scoring derives from execution trace analysis, dream-layer pattern consolidation, and cross-agent skill transfer. The competency function updates atomically on trace completion — this tight coupling between execution outcome, learning, and future task assignment requires a unified runtime where agents, memory, and scheduling share state.',
  },
  {
    id: 'pack-multi-agent-ops',
    name: 'Multi-Agent Operations',
    version: 'v1.0',
    description: 'Cross-agent coordination with task decomposition, shared learning pools, and priority-based routing — all within a single runtime. Agents collaborate because they share architecture: dream pools propagate heuristics, competency scores inform delegation, and shared memory eliminates the coordination overhead of message-passing architectures.',
    useCase: 'Complex workflows where multiple agents must coordinate without integration overhead or state synchronization delays.',
    slotsRequired: 1,
    components: ['multi-agent-coordinator', 'task-decomposer', 'dream-pool-bridge', 'priority-router', 'shared-learning'],
    _crystallizedPipelines: ['cp-cross-module-orchestration', 'cp-workflow-bottleneck-eliminator'],
    _emergenceClause: 'Multi-agent coordination uses dream pool shared learning where heuristics discovered by one agent are immediately available to all agents in the same agency. This requires agents to share a mutable heuristic store with atomic read-write semantics — structurally impossible when agents are separate processes communicating through APIs.',
  },
  {
    id: 'pack-workflow-automation',
    name: 'Workflow Automation',
    version: 'v1.0',
    description: 'Scheduled execution, event-driven pipeline composition, batch processing with deduplication guards, and adaptive retry strategies. Workflows don\'t just run — they self-correct through contextual retry selection that analyzes failure cause rather than applying fixed backoff, and they deduplicate across time windows using semantic matching.',
    useCase: 'Recurring data processing, report generation, and multi-step automations that must be reliable without manual oversight.',
    slotsRequired: 1,
    components: ['scheduler', 'batch-runner', 'event-pipeline', 'dedup-guard', 'contextual-retry'],
    _crystallizedPipelines: ['cp-smart-event-routing', 'cp-contextual-retry-strategist', 'cp-webhook-intelligence-chain'],
    _emergenceClause: 'Workflow deduplication uses semantic matching against the memory layer — not just hash comparison. Contextual retry analyzes failure context from the execution trace to select strategy (exponential, jitter, circuit-break). This requires the scheduler to have runtime access to both memory state and execution history, which is a unified runtime property.',
  },
  {
    id: 'pack-background-optimization',
    name: 'Background Optimization',
    version: 'v1.0',
    description: 'Autonomous off-peak processing where the system consolidates fragmented memories, discovers latent patterns across execution history, evolves agent heuristics, and repairs knowledge decay. The substrate doesn\'t idle — it dreams. Optimization runs produce compound improvements that accumulate across cycles, creating a system that is measurably better each morning.',
    useCase: 'Systems that must improve autonomously during off-peak hours without operator-initiated optimization tasks.',
    slotsRequired: 1,
    components: ['nocturnal-runner', 'memory-consolidator', 'pattern-evolver', 'decay-reverser', 'heuristic-optimizer'],
    _crystallizedPipelines: ['cp-pattern-consolidation-pipeline', 'cp-entropic-decay-reversal', 'cp-knowledge-fusion-cascade'],
    _emergenceClause: 'Background optimization traverses the entire runtime state — memory tiers, agent competency scores, execution traces, and pattern registries — to identify improvement opportunities. This requires read-write access to every subsystem simultaneously during a single optimization pass. No external orchestrator can achieve this without reimplementing the entire runtime.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INTELLIGENCE & FORESIGHT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-deep-research',
    name: 'Deep Research',
    version: 'v1.0',
    description: 'Automated multi-source research with crawling orchestration, data enrichment, and structured output delivery. Research operations run as substrate-native processes — they benefit from memory-aware deduplication, agent competency routing, and result quality scoring that improves with each research cycle through accumulated domain knowledge.',
    useCase: 'Analysts running complex information-gathering workflows where research quality compounds over time.',
    slotsRequired: 1,
    components: ['research-crawler', 'data-enricher', 'source-orchestrator', 'structured-output', 'domain-accumulator'],
    _crystallizedPipelines: ['cp-smart-deduplication-engine', 'cp-signal-noise-separator'],
    _emergenceClause: 'Research quality improves over time because findings are stored in the memory tier and influence future research routing. The deduplication engine uses semantic similarity from the memory layer to prevent redundant crawls. This feedback loop between research output and research input requires shared state between the crawling orchestrator and the memory system.',
  },
  {
    id: 'pack-predictive-analytics',
    name: 'Predictive Analytics',
    version: 'v1.0',
    description: 'Forward-looking metric forecasting, capacity prediction, lifecycle analysis, and anomaly pre-detection. Predictions emerge from the substrate\'s own operational data — the system forecasts its own behavior because it has continuous visibility into execution patterns, resource consumption trends, and behavioral drift signals that external analytics tools structurally cannot access.',
    useCase: 'Operations teams needing forward-looking signals before incidents materialize, derived from the system\'s own operational intelligence.',
    slotsRequired: 1,
    components: ['metric-forecaster', 'capacity-planner', 'lifecycle-predictor', 'pre-detector', 'drift-correlator'],
    _crystallizedPipelines: ['cp-capacity-prediction-chain', 'cp-usage-forecasting-pipeline', 'cp-metric-correlation-finder'],
    _emergenceClause: 'Prediction accuracy depends on the system observing its own execution patterns — latency distributions, memory tier transitions, agent success rates, and provider response curves. This self-referential data stream exists only because the predictor and the predicted system are the same runtime. External analytics tools see metrics; the substrate sees causation.',
  },
  {
    id: 'pack-strategic-intelligence',
    name: 'Strategic Intelligence',
    version: 'v1.0',
    description: 'Cross-domain insight synthesis, hypothesis validation, and impact analysis that fuses signals from the substrate\'s operational graph. Strategic intelligence isn\'t computed — it emerges when memory patterns, execution traces, agent discoveries, and governance decisions are viewed as a single information surface rather than separate data streams.',
    useCase: 'Decision-makers needing synthesized intelligence that connects operational signals invisible to single-domain analytics.',
    slotsRequired: 1,
    components: ['insight-synthesizer', 'hypothesis-validator', 'impact-analyzer', 'cross-domain-fusion', 'causal-chain-builder'],
    _crystallizedPipelines: ['cp-emergent-strategy-compiler', 'cp-knowledge-gap-discoverer', 'cp-innovation-scoring-pipeline'],
    _emergenceClause: 'Strategic synthesis requires traversing the full operational graph — memory, agents, governance, execution, economics — in a single pass. The hypothesis validator tests conjectures against live runtime state. This requires the intelligence layer to have direct, synchronous access to every subsystem\'s current state, which is a structural property of unified architecture.',
  },
  {
    id: 'pack-creative-synthesis',
    name: 'Creative Synthesis',
    version: 'v1.0',
    description: 'Pattern fusion, idea incubation, and emergent solution generation across domains. Innovation emerges from the runtime\'s ability to traverse its own knowledge graph and discover non-obvious connections between execution patterns, stored knowledge, and agent heuristics — producing insights that no individual component could generate alone.',
    useCase: 'Teams exploring novel solutions where conventional approaches fail and where innovation must emerge from system-level pattern recognition.',
    slotsRequired: 1,
    components: ['pattern-fuser', 'idea-incubator', 'innovation-synthesizer', 'cross-domain-connector', 'novelty-scorer'],
    _crystallizedPipelines: ['cp-knowledge-fusion-cascade', 'cp-innovation-scoring-pipeline', 'cp-synthetic-benchmark-generator'],
    _emergenceClause: 'Creative synthesis fuses patterns from execution traces (what worked), memory (what\'s known), dream processing (what was consolidated), and agent heuristics (what was learned). This four-way fusion produces emergent insights that are structurally impossible when these domains are separate services because the creative signal exists in the intersection, not in any individual source.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RESILIENCE & TRUST
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-threat-intelligence',
    name: 'Threat Intelligence',
    version: 'v1.0',
    description: 'Proactive threat detection with behavioral drift analysis, anomaly fingerprinting, and attack surface mapping. Security operates from inside the runtime — detecting behavioral anomalies that external scanners cannot see because they lack access to execution patterns, memory access frequencies, and agent decision distributions.',
    useCase: 'Production systems that need early-warning threat detection at the runtime level, catching threats before they manifest as incidents.',
    slotsRequired: 1,
    components: ['threat-correlator', 'drift-detector', 'surface-mapper', 'anomaly-fingerprinter', 'reputation-scorer'],
    _crystallizedPipelines: ['cp-threat-prediction-chain', 'cp-anomaly-fingerprinting-chain', 'cp-reputation-scoring-chain'],
    _emergenceClause: 'Threat detection correlates behavioral drift across memory access patterns, agent decision distributions, and execution timing — detecting anomalies that manifest as statistical deviations in runtime behavior, not as signature matches. This requires the security layer to observe the full behavioral surface of the running system, which is only possible from inside the runtime.',
  },
  {
    id: 'pack-incident-response',
    name: 'Incident Response',
    version: 'v1.0',
    description: 'Automated incident handling with self-healing, graceful degradation, fault isolation, and integrity validation. Recovery happens at the architectural layer — the system isolates blast radius, degrades gracefully through provider fallback chains, and reconstructs stable state from its own execution history without human runbooks.',
    useCase: 'High-availability systems requiring automated recovery where minutes of downtime have material impact.',
    slotsRequired: 1,
    components: ['incident-automator', 'self-healer', 'fault-isolator', 'degradation-chain', 'state-reconstructor'],
    _crystallizedPipelines: ['cp-blast-radius-containment', 'cp-chaos-resilience-pipeline', 'cp-graceful-degradation-router', 'cp-disaster-recovery-orchestrator'],
    _emergenceClause: 'Self-healing requires the incident responder to isolate affected module chains, reroute through fallback providers, and reconstruct state from execution history — all within a single atomic recovery operation. This requires the recovery system to have write access to routing tables, provider registries, and memory state simultaneously, which is a unified runtime property.',
  },
  {
    id: 'pack-zero-trust',
    name: 'Zero-Trust Compliance',
    version: 'v1.0',
    description: 'Continuous policy enforcement with compliance drift detection, trust scoring across all operations, and governance mode management with TTL-based auto-revert. Trust isn\'t a configuration — it\'s a continuous runtime computation that evaluates every operation against the current policy surface and auto-reverts dangerous governance changes.',
    useCase: 'Regulated environments requiring continuous compliance enforcement where policy violations must be caught at execution time, not audit time.',
    slotsRequired: 1,
    components: ['policy-enforcer', 'compliance-detector', 'trust-scorer', 'governance-mode-manager', 'auto-revert-engine'],
    _crystallizedPipelines: ['cp-identity-trust-fabric', 'cp-privilege-escalation-sentinel', 'cp-regulatory-autopilot'],
    _emergenceClause: 'Trust scoring evaluates every operation against the governance mode, user identity, execution context, and historical behavioral patterns — producing a continuous trust signal. The auto-revert engine uses TTL-based governance mode management to ensure dangerous policy changes self-expire. This tight coupling between policy enforcement and execution requires the governance layer to intercept every operation at the runtime level.',
  },
  {
    id: 'pack-quality-assurance',
    name: 'Quality Assurance',
    version: 'v1.0',
    description: 'Automated quality enforcement with accessibility regression guards, behavioral drift detection on outputs, and output confidence calibration. Quality isn\'t tested after production — it\'s enforced during execution through inline validators that score output confidence, detect regressions against behavioral baselines, and flag drift before delivery.',
    useCase: 'Teams shipping high-quality outputs that must pass compliance and accessibility checks as a continuous pipeline property, not a separate testing phase.',
    slotsRequired: 1,
    components: ['accessibility-guard', 'regression-detector', 'confidence-calibrator', 'output-validator', 'drift-flagger'],
    _crystallizedPipelines: ['cp-output-confidence-calibrator', 'cp-behavioral-drift-detector', 'cp-performance-regression-oracle'],
    _emergenceClause: 'Quality enforcement runs inline with execution — the confidence calibrator adjusts stated certainty to match actual accuracy by referencing historical output performance. The regression detector compares current output distributions against stored behavioral baselines. This requires the quality layer to access execution history and output statistics in real-time, which is a runtime-embedded property.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOVEREIGNTY & DEPLOYMENT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-self-hosted',
    name: 'Self-Hosted Deployment',
    version: 'v1.0',
    description: 'Deploy the full runtime on your own infrastructure with data sovereignty and air-gapped operation. Not a simplified export — the complete substrate runs wherever you choose, including cross-deployment state synchronization for distributed installations.',
    useCase: 'Organizations requiring complete infrastructure control, air-gapped operation, or data residency compliance.',
    slotsRequired: 1,
    components: ['deployment-sdk', 'infra-manager', 'sovereignty-layer', 'air-gap-bridge', 'cross-deployment-sync'],
    _crystallizedPipelines: ['cp-cross-deployment-sync', 'cp-data-residency-enforcer'],
    _emergenceClause: 'Self-hosted deployment packages the entire runtime — memory tiers, agent orchestration, governance, execution engine — as a single deployable unit. Cross-deployment sync propagates state across geographically distributed installations with eventual consistency. This requires the deployment artifact to be a complete, self-contained runtime, not a collection of microservices that depend on external infrastructure.',
  },
  {
    id: 'pack-safe-evolution',
    name: 'Safe Evolution',
    version: 'v1.0',
    description: 'Shadow execution, stabilization gates, migration risk scoring, and atomic rollback. The substrate evolves itself safely through a multi-phase pipeline: planning, shadow application, production application, verification — with circuit breaker protection that halts evolution if instability is detected at any phase.',
    useCase: 'Production systems that must evolve continuously without risking stability, where every mutation is validated before commitment.',
    slotsRequired: 1,
    components: ['shadow-executor', 'stabilization-gate', 'risk-scorer', 'rollback-engine', 'circuit-breaker', 'phase-validator'],
    _crystallizedPipelines: ['cp-autonomous-rollback-authority', 'cp-impact-radius-predictor', 'cp-chaos-resilience-pipeline'],
    _emergenceClause: 'Safe evolution requires the shadow executor to run proposed mutations against a complete copy of runtime state and compare results against production baselines. The phase validation trigger enforces sequential phase transitions and blocks phase skipping. This requires the evolution system to have deep access to the runtime\'s internal state for comparison, which is only possible when evolution is a first-class runtime operation.',
  },
  {
    id: 'pack-governance-audit',
    name: 'Governance & Audit',
    version: 'v1.0',
    description: 'Complete audit trails with forensic timeline reconstruction, role-based access enforcement, and compliance reporting with decision-level causal justification. Every autonomous decision is recorded with full provenance — not just what happened, but why, and what alternatives were considered.',
    useCase: 'Regulated industries with SOC2, GDPR, or HIPAA requirements where audit trails must be court-admissible and causally complete.',
    slotsRequired: 1,
    components: ['audit-logger', 'rbac-enforcer', 'compliance-reporter', 'forensic-reconstructor', 'decision-ledger'],
    _crystallizedPipelines: ['cp-enterprise-audit-trail', 'cp-executive-decision-ledger', 'cp-compliance-automation-chain'],
    _emergenceClause: 'Causal audit trails require the governance layer to intercept every decision point in the runtime and record the full decision context — input state, evaluated alternatives, selected action, and justification. This produces court-admissible decision provenance. External audit tools can only record outcomes; the substrate records reasoning.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERCEPTION & INTERACTION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-intent-resolution',
    name: 'Intent Resolution',
    version: 'v1.0',
    description: 'Multi-intent parsing with ambiguity resolution through multi-hypothesis scoring, contextual understanding enriched by persistent memory, and intent amplification that infers unstated needs from user fingerprint patterns and interaction history.',
    useCase: 'Complex user interactions where requests are ambiguous, layered, or multi-part and where resolution quality depends on accumulated user understanding.',
    slotsRequired: 1,
    components: ['intent-parser', 'ambiguity-resolver', 'hypothesis-scorer', 'intent-amplifier', 'fingerprint-reader'],
    _crystallizedPipelines: ['cp-intent-disambiguation-engine', 'cp-prompt-quality-scorer'],
    _emergenceClause: 'Intent resolution draws from persistent memory (what the user has said before), user fingerprints (communication patterns), and execution history (what has worked) to disambiguate requests. This multi-source resolution requires synchronous access to memory, user model, and execution state — a property of unified runtime that cannot be replicated by chaining separate NLU, memory, and history services.',
  },
  {
    id: 'pack-empathetic-interaction',
    name: 'Empathetic Interaction',
    version: 'v1.0',
    description: 'Emotional resonance detection, personality adaptation, and mood-aware response calibration. Empathy emerges from continuous user modeling — the system adapts tone, detail level, and interaction style based on accumulated interaction patterns, not sentiment keyword matching on individual messages.',
    useCase: 'Customer-facing agents where tone and emotional awareness improve outcomes and where personality consistency across sessions matters.',
    slotsRequired: 1,
    components: ['emotion-detector', 'personality-adapter', 'mood-processor', 'response-calibrator', 'interaction-modeler'],
    _crystallizedPipelines: ['cp-empathic-interaction-chain', 'cp-response-calibration-pipeline', 'cp-user-journey-reconstructor'],
    _emergenceClause: 'Empathetic adaptation requires the interaction layer to reference the user\'s complete interaction history, emotional trajectory across sessions, and personality model. Response calibration adjusts length, tone, and detail level based on accumulated user preferences. This requires persistent user state that spans across sessions — a memory-dependent property that stateless interaction layers cannot achieve.',
  },
  {
    id: 'pack-knowledge-graph',
    name: 'Knowledge Graph',
    version: 'v1.0',
    description: 'Semantic navigation with similarity ranking, path finding, and cross-domain connection discovery. The substrate traverses its own knowledge structure — relationships emerge from runtime operation as execution patterns create implicit edges between concepts that no manual ontology could anticipate.',
    useCase: 'Systems that need to discover and traverse relationships across large knowledge bases where connections are emergent rather than predefined.',
    slotsRequired: 1,
    components: ['graph-navigator', 'similarity-ranker', 'path-finder', 'connection-discoverer', 'edge-emergent-detector'],
    _crystallizedPipelines: ['cp-org-knowledge-graph-weaver', 'cp-knowledge-distillation-pipeline'],
    _emergenceClause: 'Knowledge graph edges emerge from execution patterns — when operations consistently connect two concepts, an implicit edge forms. The graph weaver constructs organizational knowledge from siloed data through execution-time observation. This self-constructing ontology requires the knowledge layer to observe runtime behavior, which is only possible from inside the runtime.',
  },
  {
    id: 'pack-data-pipeline',
    name: 'Data Pipeline',
    version: 'v1.0',
    description: 'Intelligent routing with provider health awareness, format transformation, conflict resolution, and cross-system synchronization. Data flows through the runtime with full provider health visibility — routing decisions consider latency predictions, cost anomaly detection, and failure probability rather than static configuration.',
    useCase: 'Multi-provider environments requiring seamless data flow where routing decisions must be intelligent rather than round-robin.',
    slotsRequired: 1,
    components: ['data-router', 'format-transformer', 'conflict-resolver', 'sync-bridge', 'health-aware-router'],
    _crystallizedPipelines: ['cp-latency-prediction-router', 'cp-cost-anomaly-detection', 'cp-connector-health-monitor', 'cp-provider-arbitrage-pipeline'],
    _emergenceClause: 'Data routing uses live provider health signals, latency predictions, and cost anomaly detection to make per-request routing decisions. The provider arbitrage pipeline exploits cross-provider price differentials in real-time. This requires the routing layer to have continuous visibility into provider performance, cost, and reliability — a runtime property that static webhook chains cannot replicate.',
  },
  {
    id: 'pack-observability',
    name: 'Runtime Observability',
    version: 'v1.0',
    description: 'Internal health monitoring with execution trace correlation, feedback loop detection, and capability maturity scoring. Observability from inside the runtime — seeing execution causation, not just execution metrics. The system identifies runaway feedback loops, scores capability maturity, and correlates metrics that external monitoring tools structurally cannot connect.',
    useCase: 'Teams operating production systems needing causal visibility into runtime behavior beyond what external APM tools provide.',
    slotsRequired: 1,
    components: ['health-monitor', 'trace-correlator', 'feedback-loop-detector', 'maturity-scorer', 'causal-analyzer'],
    _crystallizedPipelines: ['cp-feedback-loop-detector', 'cp-capability-maturity-scorer', 'cp-error-context-enricher'],
    _emergenceClause: 'Internal observability detects feedback loops by correlating execution traces across subsystems — identifying when output from one module influences input to another in a destabilizing cycle. External monitoring sees metrics in isolation; the substrate sees causal chains. Capability maturity scoring requires observing capability execution over time, which is a runtime-embedded measurement.',
  },
  {
    id: 'pack-capacity-management',
    name: 'Capacity Management',
    version: 'v1.0',
    description: 'Resource planning with quota prediction, intelligent burst handling, cost-performance optimization, and dynamic pricing based on real-time demand. The substrate manages its own resource allocation — capacity planning that understands the workload because it is the workload, using token budget optimization to maximize total value across concurrent operations.',
    useCase: 'Scaling teams needing to optimize resource allocation where capacity decisions must account for workload characteristics, not just request volume.',
    slotsRequired: 1,
    components: ['resource-planner', 'quota-predictor', 'burst-handler', 'cost-optimizer', 'token-budget-allocator'],
    _crystallizedPipelines: ['cp-capacity-prediction-chain', 'cp-token-budget-optimizer', 'cp-dynamic-pricing-pipeline', 'cp-resource-contention-arbiter'],
    _emergenceClause: 'Capacity management allocates token budgets across concurrent tasks using value-weighted scoring — not equal distribution. The resource contention arbiter resolves competing claims using priority scoring that considers task importance, deadline pressure, and historical ROI. This requires the capacity layer to have real-time visibility into all active workloads and their relative value, which is a unified runtime property.',
  },
];
