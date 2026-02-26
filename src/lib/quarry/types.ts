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
 * Max 8-12 packs. Each is a composed bundle of internal components.
 */
export const ARTIFACT_PACKS: ArtifactPack[] = [
  {
    id: 'pack-memory-pro',
    name: 'Advanced Memory',
    version: 'v1.0',
    description: 'Expanded persistent memory with tiered recall, contradiction detection, and adaptive limits.',
    useCase: 'Teams needing agents that retain context across long-running projects.',
    slotsRequired: 1,
    tier: 'base',
    components: ['memory-tiering', 'recall-engine', 'contradiction-detector'],
  },
  {
    id: 'pack-agent-composer',
    name: 'Agent Composer',
    version: 'v1.0',
    description: 'Build, deploy, and manage composable cognitive agents with specialized skills.',
    useCase: 'Developers creating multi-agent workflows for research, analysis, or automation.',
    slotsRequired: 2,
    tier: 'base',
    components: ['cognitive-registry', 'agent-skills', 'agency-orchestrator'],
  },
  {
    id: 'pack-observability',
    name: 'System Observability',
    version: 'v1.0',
    description: 'Real-time health monitoring, execution traces, and performance insights.',
    useCase: 'Teams operating production AI systems that need visibility into runtime behavior.',
    slotsRequired: 1,
    tier: 'base',
    components: ['health-monitor', 'trace-viewer', 'analytics-dashboard'],
  },
  {
    id: 'pack-automation',
    name: 'Workflow Automation',
    version: 'v1.0',
    description: 'Scheduled tasks, batch execution, and event-driven pipelines.',
    useCase: 'Recurring data processing, report generation, or multi-step automations.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['scheduler', 'batch-runner', 'event-pipeline'],
  },
  {
    id: 'pack-orchestration',
    name: 'Cross-System Orchestration',
    version: 'v1.0',
    description: 'Coordinate multiple engines and agents across modules with priority routing.',
    useCase: 'Complex workflows spanning memory, analysis, generation, and deployment.',
    slotsRequired: 2,
    tier: 'professional',
    components: ['orchestration-layer', 'priority-router', 'module-bridge'],
  },
  {
    id: 'pack-deployment',
    name: 'Self-Hosted Deployment',
    version: 'v1.0',
    description: 'Deploy and run the full runtime on your own infrastructure via LNCHBL.',
    useCase: 'Organizations requiring data sovereignty, custom compliance, or air-gapped operation.',
    slotsRequired: 3,
    tier: 'enterprise',
    components: ['lnchbl-sdk', 'deployment-manager', 'infra-bridge'],
  },
  {
    id: 'pack-governance',
    name: 'Governance & Compliance',
    version: 'v1.0',
    description: 'Audit exports, role-based access, policy enforcement, and compliance tooling.',
    useCase: 'Regulated industries or teams with SOC2/GDPR requirements.',
    slotsRequired: 2,
    tier: 'enterprise',
    components: ['audit-logger', 'rbac-engine', 'compliance-exporter'],
  },
  {
    id: 'pack-dedicated-memory',
    name: 'Dedicated Memory Partitions',
    version: 'v1.0',
    description: 'Isolated memory domains per project or team with custom retention policies.',
    useCase: 'Enterprise teams managing multiple AI projects with strict data isolation.',
    slotsRequired: 2,
    tier: 'enterprise',
    components: ['memory-partitioner', 'retention-policy', 'isolation-layer'],
  },
  {
    id: 'pack-research',
    name: 'Deep Research',
    version: 'v1.0',
    description: 'Automated multi-source research, data enrichment, and insight synthesis.',
    useCase: 'Analysts and researchers running complex information-gathering workflows.',
    slotsRequired: 1,
    tier: 'professional',
    components: ['research-crawler', 'data-enricher', 'insight-synthesizer'],
  },
  {
    id: 'pack-templates',
    name: 'Premium Templates',
    version: 'v1.0',
    description: 'Production-ready project scaffolds for common AI application patterns.',
    useCase: 'Teams wanting to skip boilerplate and start with proven architectures.',
    slotsRequired: 1,
    tier: 'base',
    components: ['template-gallery', 'scaffold-engine'],
  },
];
