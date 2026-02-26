
-- Quarry Asset Registry
-- Strategic internal asset management system for tier-based distribution

CREATE TYPE public.quarry_tier AS ENUM ('free', 'creator', 'architect', 'enterprise', 'internal');
CREATE TYPE public.quarry_visibility AS ENUM ('hidden', 'tier_exposed', 'public_curated');
CREATE TYPE public.quarry_asset_type AS ENUM ('capability', 'engine', 'meta_engine', 'pipeline', 'template', 'agent', 'deployment_right', 'governance_tool');

CREATE TABLE public.quarry_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_key TEXT NOT NULL UNIQUE,
  asset_type public.quarry_asset_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tier public.quarry_tier NOT NULL DEFAULT 'free',
  visibility public.quarry_visibility NOT NULL DEFAULT 'hidden',
  value_density NUMERIC(3,2) DEFAULT 0.50 CHECK (value_density >= 0 AND value_density <= 1),
  stability NUMERIC(3,2) DEFAULT 0.50 CHECK (stability >= 0 AND stability <= 1),
  strategic_weight NUMERIC(3,2) DEFAULT 0.50 CHECK (strategic_weight >= 0 AND strategic_weight <= 1),
  revenue_impact NUMERIC(3,2) DEFAULT 0.50 CHECK (revenue_impact >= 0 AND revenue_impact <= 1),
  differentiation NUMERIC(3,2) DEFAULT 0.50 CHECK (differentiation >= 0 AND differentiation <= 1),
  maintenance_load NUMERIC(3,2) DEFAULT 0.30 CHECK (maintenance_load >= 0 AND maintenance_load <= 1),
  future_release BOOLEAN DEFAULT false,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quarry_assets ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write quarry assets
CREATE POLICY "Admins can manage quarry assets"
  ON public.quarry_assets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read for tier-exposed/public-curated items (for /upgrade page rendering)
CREATE POLICY "Public can read visible quarry assets"
  ON public.quarry_assets FOR SELECT
  TO anon, authenticated
  USING (visibility IN ('tier_exposed', 'public_curated'));

-- Auto-update timestamp
CREATE TRIGGER update_quarry_assets_timestamp
  BEFORE UPDATE ON public.quarry_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_substrate_timestamp();

-- Index for common queries
CREATE INDEX idx_quarry_assets_tier ON public.quarry_assets (tier);
CREATE INDEX idx_quarry_assets_type ON public.quarry_assets (asset_type);
CREATE INDEX idx_quarry_assets_visibility ON public.quarry_assets (visibility);
