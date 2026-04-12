
CREATE TABLE public.discovery_retired_combos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  combo_hash TEXT NOT NULL UNIQUE,
  module_chain TEXT[] NOT NULL,
  category TEXT NOT NULL,
  total_runs INTEGER NOT NULL DEFAULT 0,
  total_discoveries INTEGER NOT NULL DEFAULT 0,
  retired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  retired_by TEXT DEFAULT 'auto'
);

ALTER TABLE public.discovery_retired_combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read retired combos"
  ON public.discovery_retired_combos FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert retired combos"
  ON public.discovery_retired_combos FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete retired combos"
  ON public.discovery_retired_combos FOR DELETE
  TO authenticated USING (true);
