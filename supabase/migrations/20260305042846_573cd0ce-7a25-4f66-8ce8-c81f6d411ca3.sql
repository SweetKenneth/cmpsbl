
-- ═══════════════════════════════════════════════════════════
-- Substrate Core Hardening Migration
-- 3-lane integrity, scheduler telemetry, memory receipts,
-- circuit breaker trips, cascade events, audit anchors,
-- provider routing events, SLO specs, module health columns
-- ═══════════════════════════════════════════════════════════

-- 1) Integrity Reports
CREATE TABLE IF NOT EXISTS public.substrate_integrity_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  computed_at timestamptz NOT NULL DEFAULT now(),
  integrity_total numeric NOT NULL,
  integrity_lanes jsonb NOT NULL,
  mode text NOT NULL DEFAULT 'min',
  inputs jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.substrate_integrity_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on integrity_reports"
  ON public.substrate_integrity_reports FOR ALL
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read integrity_reports"
  ON public.substrate_integrity_reports FOR SELECT
  TO authenticated USING (true);

-- 2) Memory Tier Receipts
CREATE TABLE IF NOT EXISTS public.memory_tier_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id text NOT NULL,
  reason_code text NOT NULL,
  before_tier text NOT NULL,
  after_tier text NOT NULL,
  before_confidence numeric,
  after_confidence numeric,
  rps_score numeric,
  actor text NOT NULL DEFAULT 'system',
  evidence jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.memory_tier_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on memory_tier_receipts"
  ON public.memory_tier_receipts FOR ALL
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read memory_tier_receipts"
  ON public.memory_tier_receipts FOR SELECT
  TO authenticated USING (true);

-- 3) Circuit Breaker Trips
CREATE TABLE IF NOT EXISTS public.circuit_breaker_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  trip_cause text NOT NULL,
  last_error_signature text,
  downstream_service text,
  estimated_blast_radius numeric,
  consecutive_trips integer NOT NULL DEFAULT 1,
  open_duration_ms integer NOT NULL,
  backoff_multiplier numeric NOT NULL DEFAULT 1,
  tripped_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.circuit_breaker_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on circuit_breaker_trips"
  ON public.circuit_breaker_trips FOR ALL
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read circuit_breaker_trips"
  ON public.circuit_breaker_trips FOR SELECT
  TO authenticated USING (true);

-- 4) Cascade Events
CREATE TABLE IF NOT EXISTS public.cascade_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL,
  origin_module text NOT NULL,
  affected_modules text[] NOT NULL DEFAULT '{}',
  actions_taken jsonb NOT NULL DEFAULT '[]',
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  safe_mode_level text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cascade_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on cascade_events"
  ON public.cascade_events FOR ALL
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read cascade_events"
  ON public.cascade_events FOR SELECT
  TO authenticated USING (true);

-- 5) Audit Chain Anchors
CREATE TABLE IF NOT EXISTS public.audit_chain_anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  head_hash text NOT NULL,
  receipt_count integer NOT NULL DEFAULT 0,
  store text NOT NULL DEFAULT 'primary',
  anchored_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_chain_anchors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on audit_chain_anchors"
  ON public.audit_chain_anchors FOR ALL
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read audit_chain_anchors"
  ON public.audit_chain_anchors FOR SELECT
  TO authenticated USING (true);

-- 6) Provider Routing Events (observability)
CREATE TABLE IF NOT EXISTS public.provider_routing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id text NOT NULL,
  task_type text,
  reason text NOT NULL,
  score numeric,
  candidates_count integer,
  filtered_count integer,
  failover_step text,
  sticky_hit boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.provider_routing_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on provider_routing_events"
  ON public.provider_routing_events FOR ALL
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read provider_routing_events"
  ON public.provider_routing_events FOR SELECT
  TO authenticated USING (true);

-- 7) SLO Specs
CREATE TABLE IF NOT EXISTS public.slo_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL UNIQUE,
  uptime_target numeric NOT NULL DEFAULT 0.995,
  error_rate_target numeric NOT NULL DEFAULT 0.02,
  p95_latency_target_ms numeric NOT NULL DEFAULT 500,
  p99_latency_target_ms numeric NOT NULL DEFAULT 1500,
  error_budget_window_hours numeric NOT NULL DEFAULT 720,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.slo_specs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on slo_specs"
  ON public.slo_specs FOR ALL
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read slo_specs"
  ON public.slo_specs FOR SELECT
  TO authenticated USING (true);

-- 8) Module SLO Status
CREATE TABLE IF NOT EXISTS public.module_slo_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  grade text NOT NULL DEFAULT 'A',
  slo_compliant boolean NOT NULL DEFAULT true,
  burn_rate_elevated boolean NOT NULL DEFAULT false,
  breaker_open boolean NOT NULL DEFAULT false,
  p99_latency_ms numeric,
  mttr_ms numeric,
  burn_rates jsonb,
  computed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.module_slo_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on module_slo_status"
  ON public.module_slo_status FOR ALL
  TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read module_slo_status"
  ON public.module_slo_status FOR SELECT
  TO authenticated USING (true);

-- 9) Add columns to substrate_module_health (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'substrate_module_health') THEN
    ALTER TABLE public.substrate_module_health ADD COLUMN IF NOT EXISTS p99_latency_ms numeric;
    ALTER TABLE public.substrate_module_health ADD COLUMN IF NOT EXISTS mttr_ms numeric;
    ALTER TABLE public.substrate_module_health ADD COLUMN IF NOT EXISTS error_budget_burn jsonb;
    ALTER TABLE public.substrate_module_health ADD COLUMN IF NOT EXISTS slo_status text;
  END IF;
END $$;
