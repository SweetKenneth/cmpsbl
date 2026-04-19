-- Conductor pipeline registry
CREATE TABLE public.conductor_pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  target_function text NOT NULL,
  target_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  min_interval_seconds integer NOT NULL DEFAULT 60,
  max_interval_seconds integer NOT NULL DEFAULT 3600,
  signal_query text,
  signal_threshold integer NOT NULL DEFAULT 1,
  cost_estimate_cents integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  last_signal_pressure integer NOT NULL DEFAULT 0,
  consecutive_empty_runs integer NOT NULL DEFAULT 0,
  total_runs integer NOT NULL DEFAULT 0,
  total_work_units integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conductor_pipelines_enabled ON public.conductor_pipelines (enabled, last_run_at);

ALTER TABLE public.conductor_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_pipelines" ON public.conductor_pipelines
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "service_write_pipelines" ON public.conductor_pipelines
  TO service_role USING (true) WITH CHECK (true);

-- Run history
CREATE TABLE public.conductor_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES public.conductor_pipelines(id) ON DELETE CASCADE,
  pipeline_name text NOT NULL,
  dispatched_at timestamptz NOT NULL DEFAULT now(),
  duration_ms integer,
  outcome text NOT NULL DEFAULT 'pending',
  signal_pressure_at_dispatch integer NOT NULL DEFAULT 0,
  work_units integer NOT NULL DEFAULT 0,
  skip_reason text,
  response jsonb,
  error text
);

CREATE INDEX idx_conductor_runs_pipeline ON public.conductor_runs (pipeline_id, dispatched_at DESC);
CREATE INDEX idx_conductor_runs_outcome ON public.conductor_runs (outcome, dispatched_at DESC);

ALTER TABLE public.conductor_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_runs" ON public.conductor_runs
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "service_write_runs" ON public.conductor_runs
  TO service_role USING (true) WITH CHECK (true);

-- Signal counters
CREATE TABLE public.conductor_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_key text NOT NULL UNIQUE,
  pressure integer NOT NULL DEFAULT 0,
  last_emitted_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.conductor_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_signals" ON public.conductor_signals
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "service_write_signals" ON public.conductor_signals
  TO service_role USING (true) WITH CHECK (true);

-- updated_at trigger for pipelines
CREATE TRIGGER trg_conductor_pipelines_updated
  BEFORE UPDATE ON public.conductor_pipelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();