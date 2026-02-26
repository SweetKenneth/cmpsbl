/**
 * Quarry — Strategic Asset Registry Types
 * v4.0.0 — Equal-Slot Capacity Model with Strategic Domains
 */

export type QuarryTier = 'free' | 'creator' | 'architect' | 'enterprise' | 'internal';
export type QuarryVisibility = 'hidden' | 'tier_exposed' | 'public_curated' | 'baseline';
export type QuarryAssetType = 'capability' | 'engine' | 'meta_engine' | 'pipeline' | 'template' | 'agent' | 'deployment_right' | 'governance_tool' | 'artifact_pack';

/** Product tiers — Builder / Operator / Architect */
export type ProductTier = 'builder' | 'operator' | 'architect';

export interface ArtifactSlotConfig {
  tier: ProductTier;
  slots: number;
  memoryDepth: 'standard' | 'expanded' | 'dedicated';
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
    asset.value_density * 0.25 +
    asset.revenue_impact * 0.25 +
    asset.stability * 0.15 +
    asset.differentiation * 0.20 +
    (1 - asset.maintenance_load) * 0.15
  );
}

/**
 * 24 Artifact Packs — Equal-slot model.
 * Every pack = 1 slot. No tier gating. All visible to all users.
 * Capacity controls activation only.
 * No internal taxonomy exposed.
 */
export const ARTIFACT_PACKS: ArtifactPack[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY & CONTINUITY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-persistent-memory',
    name: 'Persistent Memory',
    version: 'v1.0',
    description: 'Tiered recall across hot, warm, and cold layers with contradiction detection, spaced repetition, and adaptive capacity. The runtime remembers what matters and forgets what doesn\'t — a property impossible in stateless architectures.',
    useCase: 'Long-running projects where continuity across sessions determines output quality.',
    slotsRequired: 1,
    components: ['memory-tiering', 'recall-engine', 'contradiction-detector', 'spaced-repetition'],
  },
  {
    id: 'pack-dedicated-partitions',
    name: 'Dedicated Memory Partitions',
    version: 'v1.0',
    description: 'Isolated memory domains per project with custom retention policies, compression ratios, and archival strategies. Each partition operates as an independent cognitive namespace — not achievable by stitching separate databases.',
    useCase: 'Multi-project environments requiring strict data separation with independent retention logic.',
    slotsRequired: 1,
    components: ['memory-partitioner', 'retention-policy', 'isolation-layer', 'compression-engine'],
  },
  {
    id: 'pack-context-intelligence',
    name: 'Context Intelligence',
    version: 'v1.0',
    description: 'Adaptive context assembly that scores temporal relevance, balances cognitive load, and optimizes input windows in real-time. The unified runtime surfaces exactly what\'s needed — no manual prompt engineering required.',
    useCase: 'High-throughput systems where context precision directly impacts output accuracy.',
    slotsRequired: 1,
    components: ['context-optimizer', 'temporal-scorer', 'load-balancer', 'relevance-ranker'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COORDINATION & AUTOMATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-agent-composer',
    name: 'Agent Composer',
    version: 'v1.0',
    description: 'Build composable cognitive agents with specialized skill trees, competency tracking, and autonomous learning. Agents evolve through execution — a runtime-native property that API orchestration cannot replicate.',
    useCase: 'Developers creating purpose-built agents that improve through operational feedback loops.',
    slotsRequired: 1,
    components: ['cognitive-registry', 'agent-skills', 'competency-tracker', 'agency-orchestrator'],
  },
  {
    id: 'pack-multi-agent-ops',
    name: 'Multi-Agent Operations',
    version: 'v1.0',
    description: 'Cross-agent coordination with task decomposition, shared learning pools, and priority-based routing — all within a single runtime. Agents collaborate because they share architecture, not because they exchange messages.',
    useCase: 'Complex workflows where multiple agents must coordinate without integration overhead.',
    slotsRequired: 1,
    components: ['multi-agent-coordinator', 'task-decomposer', 'shared-learning', 'priority-router'],
  },
  {
    id: 'pack-workflow-automation',
    name: 'Workflow Automation',
    version: 'v1.0',
    description: 'Scheduled execution, event-driven pipelines, batch processing, and deduplication guards. Automation runs inside the runtime — not bolted on through external cron services or webhook chains.',
    useCase: 'Recurring data processing, report generation, and multi-step automations.',
    slotsRequired: 1,
    components: ['scheduler', 'batch-runner', 'event-pipeline', 'dedup-guard'],
  },
  {
    id: 'pack-background-optimization',
    name: 'Background Optimization',
    version: 'v1.0',
    description: 'Nocturnal processing, memory consolidation, and pattern evolution during idle periods. The system improves itself when you\'re not using it — because optimization is a continuous runtime property, not a manual task.',
    useCase: 'Systems that must improve autonomously during off-peak hours.',
    slotsRequired: 1,
    components: ['nocturnal-runner', 'memory-consolidator', 'pattern-evolver', 'idle-optimizer'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INTELLIGENCE & FORESIGHT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-deep-research',
    name: 'Deep Research',
    version: 'v1.0',
    description: 'Automated multi-source research with data enrichment, crawling orchestration, and structured output delivery. Research runs as a substrate operation — not a wrapper around search APIs.',
    useCase: 'Analysts running complex information-gathering workflows across diverse sources.',
    slotsRequired: 1,
    components: ['research-crawler', 'data-enricher', 'source-orchestrator', 'structured-output'],
  },
  {
    id: 'pack-predictive-analytics',
    name: 'Predictive Analytics',
    version: 'v1.0',
    description: 'Forward-looking metric forecasting, capacity planning, lifecycle prediction, and anomaly pre-detection. The runtime projects forward from its own operational data — prediction emerges from runtime awareness, not external ML pipelines.',
    useCase: 'Operations teams needing forward-looking signals before incidents materialize.',
    slotsRequired: 1,
    components: ['metric-forecaster', 'capacity-planner', 'lifecycle-predictor', 'pre-detector'],
  },
  {
    id: 'pack-strategic-intelligence',
    name: 'Strategic Intelligence',
    version: 'v1.0',
    description: 'Cross-domain insight synthesis, hypothesis validation, and impact analysis. The substrate fuses signals from its own operational graph — strategic intelligence that no external analytics tool can produce because it requires runtime-level visibility.',
    useCase: 'Decision-makers needing synthesized intelligence from operational data streams.',
    slotsRequired: 1,
    components: ['insight-synthesizer', 'hypothesis-validator', 'impact-analyzer', 'cross-domain-fusion'],
  },
  {
    id: 'pack-creative-synthesis',
    name: 'Creative Synthesis',
    version: 'v1.0',
    description: 'Pattern fusion, idea incubation, and emergent solution generation across domains. Innovation emerges from the runtime\'s ability to traverse its own knowledge graph — not from prompting a language model harder.',
    useCase: 'Teams exploring novel solutions where conventional approaches fail.',
    slotsRequired: 1,
    components: ['pattern-fuser', 'idea-incubator', 'innovation-synthesizer', 'emergent-detector'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RESILIENCE & TRUST
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-threat-intelligence',
    name: 'Threat Intelligence',
    version: 'v1.0',
    description: 'Proactive threat detection with pattern correlation, behavioral drift analysis, and attack surface mapping. Security that operates from inside the runtime — detecting threats that external scanners cannot see.',
    useCase: 'Production systems that need early-warning threat detection at the runtime level.',
    slotsRequired: 1,
    components: ['threat-correlator', 'drift-detector', 'surface-mapper', 'anomaly-detector'],
  },
  {
    id: 'pack-incident-response',
    name: 'Incident Response',
    version: 'v1.0',
    description: 'Automated incident handling with self-healing, graceful degradation, fault isolation, and integrity validation. Recovery happens at the architectural layer — not through alerting dashboards and manual runbooks.',
    useCase: 'High-availability systems requiring automated recovery without human intervention.',
    slotsRequired: 1,
    components: ['incident-automator', 'self-healer', 'fault-isolator', 'degradation-chain'],
  },
  {
    id: 'pack-zero-trust',
    name: 'Zero-Trust Compliance',
    version: 'v1.0',
    description: 'Continuous policy enforcement, compliance drift detection, ethical guardrails, and trust scoring across all operations. Trust is a runtime property — enforced structurally, not bolted on after the fact.',
    useCase: 'Regulated environments requiring continuous compliance enforcement.',
    slotsRequired: 1,
    components: ['policy-enforcer', 'compliance-detector', 'trust-scorer', 'ethical-guardrails'],
  },
  {
    id: 'pack-quality-assurance',
    name: 'Quality Assurance',
    version: 'v1.0',
    description: 'Accessibility regression guards, WCAG remediation, inclusive testing, and autonomous quality review. Quality enforcement that runs inside the production pipeline — not as a separate testing phase.',
    useCase: 'Teams shipping accessible, high-quality outputs that must pass compliance checks.',
    slotsRequired: 1,
    components: ['accessibility-guard', 'wcag-remediator', 'inclusive-tester', 'quality-reviewer'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOVEREIGNTY & DEPLOYMENT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-self-hosted',
    name: 'Self-Hosted Deployment',
    version: 'v1.0',
    description: 'Deploy the full runtime on your own infrastructure with data sovereignty and air-gapped operation. Not a simplified export — the complete substrate runs wherever you choose.',
    useCase: 'Organizations requiring complete infrastructure control or on-premise operation.',
    slotsRequired: 1,
    components: ['deployment-sdk', 'infra-manager', 'sovereignty-layer', 'air-gap-bridge'],
  },
  {
    id: 'pack-safe-evolution',
    name: 'Safe Evolution',
    version: 'v1.0',
    description: 'Shadow execution, stabilization gates, migration risk scoring, and atomic rollback. The substrate evolves itself safely — because evolution is a first-class runtime operation, not a deployment gamble.',
    useCase: 'Production systems that must evolve continuously without risking stability.',
    slotsRequired: 1,
    components: ['shadow-executor', 'stabilization-gate', 'risk-scorer', 'rollback-engine'],
  },
  {
    id: 'pack-governance-audit',
    name: 'Governance & Audit',
    version: 'v1.0',
    description: 'Complete audit trails, role-based access enforcement, compliance reporting, and policy governance. Governance is embedded in the runtime — not layered on through external compliance tools.',
    useCase: 'Regulated industries with SOC2, GDPR, or HIPAA requirements.',
    slotsRequired: 1,
    components: ['audit-logger', 'rbac-enforcer', 'compliance-reporter', 'policy-governor'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERCEPTION & INTERACTION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-intent-resolution',
    name: 'Intent Resolution',
    version: 'v1.0',
    description: 'Multi-intent parsing, ambiguity resolution, contextual understanding, and intent amplification. The substrate resolves what users mean — not just what they say — because it has memory, context, and operational history.',
    useCase: 'Complex user interactions where requests are ambiguous, layered, or multi-part.',
    slotsRequired: 1,
    components: ['intent-parser', 'ambiguity-resolver', 'contextual-parser', 'intent-amplifier'],
  },
  {
    id: 'pack-empathetic-interaction',
    name: 'Empathetic Interaction',
    version: 'v1.0',
    description: 'Emotional resonance, sentiment analysis, personality adaptation, and mood-aware responses. Empathy that emerges from continuous user modeling — not sentiment keyword matching.',
    useCase: 'Customer-facing agents where tone and emotional awareness improve outcomes.',
    slotsRequired: 1,
    components: ['emotion-detector', 'sentiment-analyzer', 'personality-adapter', 'mood-processor'],
  },
  {
    id: 'pack-knowledge-graph',
    name: 'Knowledge Graph',
    version: 'v1.0',
    description: 'Semantic navigation, similarity ranking, path finding, and cross-domain connection discovery. The substrate traverses its own knowledge structure — relationships emerge from runtime operation, not manual ontology construction.',
    useCase: 'Systems that need to discover and traverse relationships across large knowledge bases.',
    slotsRequired: 1,
    components: ['graph-navigator', 'similarity-ranker', 'path-finder', 'connection-discoverer'],
  },
  {
    id: 'pack-data-pipeline',
    name: 'Data Pipeline',
    version: 'v1.0',
    description: 'Intelligent routing, format transformation, conflict resolution, and cross-system synchronization. Data flows through the runtime — not through fragile webhook chains and transformation microservices.',
    useCase: 'Multi-provider environments requiring seamless data flow across formats and systems.',
    slotsRequired: 1,
    components: ['data-router', 'format-transformer', 'conflict-resolver', 'sync-bridge'],
  },
  {
    id: 'pack-observability',
    name: 'System Observability',
    version: 'v1.0',
    description: 'Real-time health monitoring, execution traces, performance insights, and trend analysis. Observability from inside the runtime — seeing what external monitoring tools structurally cannot.',
    useCase: 'Teams operating production systems needing deep visibility into runtime behavior.',
    slotsRequired: 1,
    components: ['health-monitor', 'trace-viewer', 'analytics-dashboard', 'trend-analyzer'],
  },
  {
    id: 'pack-capacity-management',
    name: 'Capacity Management',
    version: 'v1.0',
    description: 'Resource planning, quota prediction, burst handling, and cost-performance balancing. The substrate manages its own resource allocation — capacity planning that understands the workload because it is the workload.',
    useCase: 'Scaling teams needing to optimize resource allocation and prevent quota overruns.',
    slotsRequired: 1,
    components: ['resource-planner', 'quota-predictor', 'burst-handler', 'cost-balancer'],
  },
];
