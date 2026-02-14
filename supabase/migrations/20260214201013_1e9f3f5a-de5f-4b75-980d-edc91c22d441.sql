-- Create mesh_saved_pipelines for crystallized pipeline configs
CREATE TABLE public.mesh_saved_pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  source_module TEXT NOT NULL,
  intent_type TEXT NOT NULL,
  domains TEXT[] NOT NULL DEFAULT '{}',
  governance_mode TEXT NOT NULL DEFAULT 'read_only',
  resolver_chain TEXT[] NOT NULL DEFAULT '{}',
  input_template JSONB DEFAULT '{}',
  discovered_from UUID REFERENCES public.mesh_intents(id),
  is_active BOOLEAN DEFAULT true,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mesh_saved_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mesh pipelines"
  ON public.mesh_saved_pipelines
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read mesh pipelines"
  ON public.mesh_saved_pipelines
  FOR SELECT
  USING (true);

CREATE INDEX idx_mesh_saved_pipelines_active ON public.mesh_saved_pipelines(is_active);

ALTER PUBLICATION supabase_realtime ADD TABLE public.mesh_saved_pipelines;
