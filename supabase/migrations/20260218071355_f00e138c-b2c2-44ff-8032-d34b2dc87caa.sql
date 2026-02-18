
-- Immune metrics table for shadow mesh run results
CREATE TABLE IF NOT EXISTS public.immune_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  executor text NOT NULL,
  run_at timestamptz NOT NULL DEFAULT now(),
  total_runs int NOT NULL DEFAULT 0,
  repair_successes int NOT NULL DEFAULT 0,
  escalations int NOT NULL DEFAULT 0,
  safe_failures int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS immune_metrics_executor_idx ON public.immune_metrics (executor);
CREATE INDEX IF NOT EXISTS immune_metrics_run_at_idx ON public.immune_metrics (run_at DESC);

ALTER TABLE public.immune_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_metrics" ON public.immune_metrics
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "system_insert_metrics" ON public.immune_metrics
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
