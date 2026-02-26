/**
 * Quarry — Strategic Asset Registry Types
 */

export type QuarryTier = 'free' | 'creator' | 'architect' | 'enterprise' | 'internal';
export type QuarryVisibility = 'hidden' | 'tier_exposed' | 'public_curated';
export type QuarryAssetType = 'capability' | 'engine' | 'meta_engine' | 'pipeline' | 'template' | 'agent' | 'deployment_right' | 'governance_tool';

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

export const ASSET_TYPE_LABELS: Record<QuarryAssetType, string> = {
  capability: 'Capability',
  engine: 'Engine',
  meta_engine: 'Meta-Engine',
  pipeline: 'Pipeline',
  template: 'Template',
  agent: 'Agent',
  deployment_right: 'Deployment Right',
  governance_tool: 'Governance Tool',
};

export const VISIBILITY_LABELS: Record<QuarryVisibility, string> = {
  hidden: 'Hidden',
  tier_exposed: 'Tier Exposed',
  public_curated: 'Public Curated',
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
