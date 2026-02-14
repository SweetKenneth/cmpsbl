
-- Intent Mesh receipts table — tracks every cross-module interaction
CREATE TABLE public.mesh_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_type TEXT NOT NULL,
  source_module TEXT NOT NULL,
  target_modules TEXT[] NOT NULL DEFAULT '{}',
  resolved_by TEXT[] NOT NULL DEFAULT '{}',
  input_summary JSONB DEFAULT '{}',
  output_summary JSONB DEFAULT '{}',
  governance_mode TEXT NOT NULL DEFAULT 'read_only',
  success BOOLEAN NOT NULL DEFAULT true,
  duration_ms INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for dashboard queries
CREATE INDEX idx_mesh_intents_created ON public.mesh_intents (created_at DESC);
CREATE INDEX idx_mesh_intents_source ON public.mesh_intents (source_module);

-- Enable RLS
ALTER TABLE public.mesh_intents ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "Admins can read mesh intents"
  ON public.mesh_intents FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- System insert (service role only, no user inserts)
CREATE POLICY "Service role can insert mesh intents"
  ON public.mesh_intents FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for live dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.mesh_intents;
