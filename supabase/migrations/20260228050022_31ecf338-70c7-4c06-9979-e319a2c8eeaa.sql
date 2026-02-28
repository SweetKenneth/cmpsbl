-- Create substrate_health_log table for tracking health check results
CREATE TABLE public.substrate_health_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_id TEXT NOT NULL,
  overall_verdict TEXT NOT NULL DEFAULT 'UNKNOWN',
  structural_issues INTEGER NOT NULL DEFAULT 0,
  layers_checked INTEGER NOT NULL DEFAULT 0,
  layers_passed INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.substrate_health_log ENABLE ROW LEVEL SECURITY;

-- Public read access (health data is non-sensitive)
CREATE POLICY "Anyone can read health logs"
  ON public.substrate_health_log FOR SELECT USING (true);

-- Only service role / admins can write
CREATE POLICY "Admins can manage health logs"
  ON public.substrate_health_log FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS read policy for evolution_receipts (currently only has ALL for service role)
CREATE POLICY "Authenticated can read evolution receipts"
  ON public.evolution_receipts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Add RLS read policy for evolution_runs  
CREATE POLICY "Authenticated can read evolution runs"
  ON public.evolution_runs FOR SELECT
  USING (auth.uid() IS NOT NULL);