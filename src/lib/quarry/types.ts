/**
 * Quarry — Strategic Asset Registry Types
 * v3.0.0 — Artifact Capacity Model
 */

export type QuarryTier = 'free' | 'creator' | 'architect' | 'enterprise' | 'internal';
export type QuarryVisibility = 'hidden' | 'tier_exposed' | 'public_curated' | 'baseline';
export type QuarryAssetType = 'capability' | 'engine' | 'meta_engine' | 'pipeline' | 'template' | 'agent' | 'deployment_right' | 'governance_tool' | 'artifact_pack';

/** Product tiers for the Artifact Capacity Model (public-facing) */
export type ProductTier = 'base' | 'professional' | 'enterprise';

export interface ArtifactSlotConfig {
  tier: ProductTier;
  slots: number | 'unlimited';
  memoryDepth: 'standard' | 'expanded' | 'dedicated';
  deploymentRights: boolean;
  governanceScope: 'basic' | 'advanced' | 'full';
}

export const PRODUCT_TIERS: Record<ProductTier, ArtifactSlotConfig> = {
  base: {
    tier: 'base',
    slots: 3,
    memoryDepth: 'standard',
    deploymentRights: false,
    governanceScope: 'basic',
  },
  professional: {
    tier: 'professional',
    slots: 8,
    memoryDepth: 'expanded',
    deploymentRights: false,
    governanceScope: 'advanced',
  },
  enterprise: {
    tier: 'enterprise',
    slots: 'unlimited',
    memoryDepth: 'dedicated',
    deploymentRights: true,
    governanceScope: 'full',
  },
};

export interface ArtifactPack {
  id: string;
  name: string;
  version: string;
  description: string;
  useCase: string;
  slotsRequired: number;
  tier: ProductTier;
  components: string[];
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
  base: 'Base',
  professional: 'Professional',
  enterprise: 'Enterprise',
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
 * Curated Artifact Packs — the only items visible on the public upgrade surface.
 * 24 packs total. Each is a composed bundle of internal components.
 * No internal taxonomy exposed. Outcome-based naming only.
 */
export const ARTIFACT_PACKS: ArtifactPack[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY & CONTEXT (3)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-persistent-memory',
    name: 'Persistent Memory',
    version: 'v1.0',
    description: 'Tiered recall with contradiction detection, adaptive capacity limits, and spaced repetition. Agents remember what matters.',
    useCase: 'Long-running projects where agents must retain and evolve context over weeks or months.',
    slotsRequired: 1,
    tier: 'base',
    components: ['memory-tiering', 'recall-engine', 'contradiction-detector', 'spaced-repetition'],
  },
  {
    id: 'pack-dedicated-partitions',
    name: 'Dedicated Memory Partitions',
    version: 'v1.0',
    description: 'Isolated memory domains per project with custom retention policies, compression, and archival.',
    useCase: 'Enterprise teams managing multiple AI projects requiring strict data separation.',
    slotsRequired: 2,
    tier: 'enterprise',
    components: ['memory-partitioner', 'retention-policy', 'isolation-layer', 'compression-engine'],
  },
  {
    id: 'pack-context-intelligence',
    name: 'Context Intelligence',
    version: 'v1.0',
    description: 'Smart context assembly with window optimization, temporal scoring, and cognitive load balancing.',
    useCase: 'Systems handling large input volumes where only the most relevant context should surface.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['context-optimizer', 'temporal-scorer', 'load-balancer', 'relevance-ranker'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT & AUTOMATION (3)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-agent-composer',
    name: 'Agent Composer',
    version: 'v1.0',
    description: 'Build, deploy, and manage composable cognitive agents with specialized skill trees and competency tracking.',
    useCase: 'Developers creating purpose-built agents for research, analysis, content, or automation.',
    slotsRequired: 2,
    tier: 'base',
    components: ['cognitive-registry', 'agent-skills', 'competency-tracker', 'agency-orchestrator'],
  },
  {
    id: 'pack-multi-agent-ops',
    name: 'Multi-Agent Operations',
    version: 'v1.0',
    description: 'Cross-agent coordination with task delegation, shared learning pools, and priority-based routing.',
    useCase: 'Complex workflows requiring multiple agents collaborating on decomposed tasks.',
    slotsRequired: 2,
    tier: 'professional',
    components: ['multi-agent-coordinator', 'task-decomposer', 'shared-learning', 'priority-router'],
  },
  {
    id: 'pack-workflow-automation',
    name: 'Workflow Automation',
    version: 'v1.0',
    description: 'Scheduled tasks, batch execution, event-driven pipelines, and deduplication guards.',
    useCase: 'Recurring data processing, report generation, or multi-step automations on schedule.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['scheduler', 'batch-runner', 'event-pipeline', 'dedup-guard'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY & RESILIENCE (3)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-threat-intelligence',
    name: 'Threat Intelligence',
    version: 'v1.0',
    description: 'Proactive threat detection with pattern correlation, behavioral drift analysis, and attack surface mapping.',
    useCase: 'Production systems that need early-warning threat detection before incidents occur.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['threat-correlator', 'drift-detector', 'surface-mapper', 'anomaly-detector'],
  },
  {
    id: 'pack-incident-response',
    name: 'Incident Response',
    version: 'v1.0',
    description: 'Automated incident handling with self-healing, graceful degradation, fault isolation, and integrity validation.',
    useCase: 'High-availability systems requiring automated recovery without human intervention.',
    slotsRequired: 2,
    tier: 'enterprise',
    components: ['incident-automator', 'self-healer', 'fault-isolator', 'degradation-chain'],
  },
  {
    id: 'pack-zero-trust',
    name: 'Zero-Trust Compliance',
    version: 'v1.0',
    description: 'Policy enforcement, compliance drift detection, ethical guardrails, and trust scoring across all operations.',
    useCase: 'Regulated environments requiring continuous policy enforcement and audit-ready posture.',
    slotsRequired: 2,
    tier: 'enterprise',
    components: ['policy-enforcer', 'compliance-detector', 'trust-scorer', 'ethical-guardrails'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INTELLIGENCE & RESEARCH (3)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-deep-research',
    name: 'Deep Research',
    version: 'v1.0',
    description: 'Automated multi-source research with data enrichment, crawling orchestration, and structured output delivery.',
    useCase: 'Analysts running complex information-gathering workflows across diverse sources.',
    slotsRequired: 1,
    tier: 'base',
    components: ['research-crawler', 'data-enricher', 'source-orchestrator', 'structured-output'],
  },
  {
    id: 'pack-predictive-analytics',
    name: 'Predictive Analytics',
    version: 'v1.0',
    description: 'Metric forecasting, capacity planning, lifecycle prediction, and anomaly pre-detection.',
    useCase: 'Operations teams needing forward-looking signals to prevent failures and plan growth.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['metric-forecaster', 'capacity-planner', 'lifecycle-predictor', 'pre-detector'],
  },
  {
    id: 'pack-strategic-intelligence',
    name: 'Strategic Intelligence',
    version: 'v1.0',
    description: 'Cross-domain insight synthesis, hypothesis validation, and impact analysis for data-driven decision-making.',
    useCase: 'Decision-makers needing synthesized intelligence from disparate data streams.',
    slotsRequired: 2,
    tier: 'enterprise',
    components: ['insight-synthesizer', 'hypothesis-validator', 'impact-analyzer', 'cross-domain-fusion'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATIVITY & INNOVATION (2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-creative-synthesis',
    name: 'Creative Synthesis',
    version: 'v1.0',
    description: 'Pattern fusion, idea incubation, cross-domain innovation, and emergent solution generation.',
    useCase: 'Teams exploring novel solutions across domains where conventional approaches fail.',
    slotsRequired: 2,
    tier: 'professional',
    components: ['pattern-fuser', 'idea-incubator', 'innovation-synthesizer', 'emergent-detector'],
  },
  {
    id: 'pack-background-optimization',
    name: 'Background Optimization',
    version: 'v1.0',
    description: 'Nocturnal processing, memory consolidation, and pattern evolution during idle periods.',
    useCase: 'Systems that improve themselves during off-peak hours without manual intervention.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['nocturnal-runner', 'memory-consolidator', 'pattern-evolver', 'idle-optimizer'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERCEPTION & UNDERSTANDING (2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-intent-resolution',
    name: 'Intent Resolution',
    version: 'v1.0',
    description: 'Multi-intent parsing, ambiguity resolution, contextual understanding, and intent amplification.',
    useCase: 'Complex user interactions where requests are ambiguous, layered, or multi-part.',
    slotsRequired: 1,
    tier: 'base',
    components: ['intent-parser', 'ambiguity-resolver', 'contextual-parser', 'intent-amplifier'],
  },
  {
    id: 'pack-empathetic-interaction',
    name: 'Empathetic Interaction',
    version: 'v1.0',
    description: 'Emotional resonance, sentiment analysis, personality adaptation, and mood-aware responses.',
    useCase: 'Customer-facing agents where tone, empathy, and emotional awareness improve outcomes.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['emotion-detector', 'sentiment-analyzer', 'personality-adapter', 'mood-processor'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // KNOWLEDGE & DATA (2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-knowledge-graph',
    name: 'Knowledge Graph',
    version: 'v1.0',
    description: 'Semantic navigation, similarity ranking, path finding, and cross-domain connection discovery.',
    useCase: 'Systems that need to traverse and discover relationships across large knowledge bases.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['graph-navigator', 'similarity-ranker', 'path-finder', 'connection-discoverer'],
  },
  {
    id: 'pack-data-pipeline',
    name: 'Data Pipeline',
    version: 'v1.0',
    description: 'Intelligent routing, format transformation, conflict resolution, and cross-system synchronization.',
    useCase: 'Multi-provider environments requiring seamless data flow across different formats and systems.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['data-router', 'format-transformer', 'conflict-resolver', 'sync-bridge'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OBSERVABILITY & ANALYTICS (2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-observability',
    name: 'System Observability',
    version: 'v1.0',
    description: 'Real-time health monitoring, execution traces, performance insights, and trend analysis.',
    useCase: 'Teams operating production AI systems needing visibility into runtime behavior.',
    slotsRequired: 1,
    tier: 'base',
    components: ['health-monitor', 'trace-viewer', 'analytics-dashboard', 'trend-analyzer'],
  },
  {
    id: 'pack-capacity-management',
    name: 'Capacity Management',
    version: 'v1.0',
    description: 'Resource planning, quota prediction, burst handling, and cost-performance balancing.',
    useCase: 'Scaling teams needing to optimize resource allocation and prevent quota overruns.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['resource-planner', 'quota-predictor', 'burst-handler', 'cost-balancer'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOVERNANCE & QUALITY (2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-governance-audit',
    name: 'Governance & Audit',
    version: 'v1.0',
    description: 'Audit exports, role-based access enforcement, compliance reporting, and policy governance.',
    useCase: 'Regulated industries or teams with SOC2/GDPR/HIPAA requirements.',
    slotsRequired: 2,
    tier: 'enterprise',
    components: ['audit-logger', 'rbac-enforcer', 'compliance-reporter', 'policy-governor'],
  },
  {
    id: 'pack-quality-assurance',
    name: 'Quality Assurance',
    version: 'v1.0',
    description: 'Accessibility regression guards, WCAG remediation, inclusive testing, and autonomous quality review.',
    useCase: 'Teams shipping accessible, high-quality outputs that must pass compliance checks.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['accessibility-guard', 'wcag-remediator', 'inclusive-tester', 'quality-reviewer'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPLOYMENT & EVOLUTION (2)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pack-self-hosted',
    name: 'Self-Hosted Deployment',
    version: 'v1.0',
    description: 'Deploy and run the full runtime on your own infrastructure with data sovereignty and air-gapped operation.',
    useCase: 'Organizations requiring complete infrastructure control, custom compliance, or on-premise operation.',
    slotsRequired: 3,
    tier: 'enterprise',
    components: ['deployment-sdk', 'infra-manager', 'sovereignty-layer', 'air-gap-bridge'],
  },
  {
    id: 'pack-safe-evolution',
    name: 'Safe Evolution',
    version: 'v1.0',
    description: 'Shadow execution, stabilization gates, migration risk scoring, and atomic rollback for safe system evolution.',
    useCase: 'Production systems that must evolve continuously without risking stability.',
    slotsRequired: 2,
    tier: 'enterprise',
    components: ['shadow-executor', 'stabilization-gate', 'risk-scorer', 'rollback-engine'],
  },
];
