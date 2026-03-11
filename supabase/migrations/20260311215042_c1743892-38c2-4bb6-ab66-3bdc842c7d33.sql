
-- Real mesh communication events table
CREATE TABLE public.mesh_comms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_module text NOT NULL,
  target_module text,
  raw_signal text NOT NULL,
  translated_voice text NOT NULL,
  category text NOT NULL,
  resolver_id text,
  personality_trait text,
  personality_icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient recent-first queries
CREATE INDEX idx_mesh_comms_created_at ON public.mesh_comms(created_at DESC);

-- RLS: public read (admin dashboard), public insert (system writes from client)
ALTER TABLE public.mesh_comms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on mesh_comms"
  ON public.mesh_comms FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on mesh_comms"
  ON public.mesh_comms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete on mesh_comms"
  ON public.mesh_comms FOR DELETE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.mesh_comms;
