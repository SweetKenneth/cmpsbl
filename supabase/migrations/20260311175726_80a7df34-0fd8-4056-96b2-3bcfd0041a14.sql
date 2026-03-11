CREATE TABLE public.discovered_pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  codename text NOT NULL,
  description text,
  category text NOT NULL,
  pipeline_score numeric NOT NULL DEFAULT 0,
  capability_chain jsonb NOT NULL DEFAULT '[]'::jsonb,
  node_chain text[] NOT NULL DEFAULT '{}',
  stage_count integer NOT NULL DEFAULT 0,
  estimated_value_usd numeric,
  discovery_method text NOT NULL DEFAULT 'autonomous',
  synergy_rating numeric DEFAULT 0,
  cross_sector_count integer DEFAULT 0,
  unique_nodes integer DEFAULT 0,
  tier text NOT NULL DEFAULT 'apex',
  status text NOT NULL DEFAULT 'discovered',
  curated boolean NOT NULL DEFAULT false,
  rank integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.discovered_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for discovered pipelines"
  ON public.discovered_pipelines
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access for discovered pipelines"
  ON public.discovered_pipelines
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_discovered_pipelines_score ON public.discovered_pipelines(pipeline_score DESC);
CREATE INDEX idx_discovered_pipelines_curated ON public.discovered_pipelines(curated) WHERE curated = true;
CREATE INDEX idx_discovered_pipelines_rank ON public.discovered_pipelines(rank) WHERE rank IS NOT NULL;