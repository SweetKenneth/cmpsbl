
-- Scheduler queue (replaces in-memory Map)
CREATE TABLE IF NOT EXISTS public.substrate_scheduler_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priority TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  age_boost INTEGER NOT NULL DEFAULT 0,
  estimated_tokens INTEGER NOT NULL DEFAULT 100,
  estimated_ms INTEGER NOT NULL DEFAULT 50,
  estimated_cost_cents INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_scheduler_queue_dispatch ON public.substrate_scheduler_queue (
  priority, age_boost DESC, created_at ASC
);

-- Scheduler receipts (replaces in-memory buffer)
CREATE TABLE IF NOT EXISTS public.substrate_scheduler_receipts (
  task_id UUID PRIMARY KEY,
  priority TEXT NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL,
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  wait_ms INTEGER NOT NULL DEFAULT 0,
  budget_tokens INTEGER NOT NULL DEFAULT 0,
  budget_ms INTEGER NOT NULL DEFAULT 0,
  budget_cost_cents INTEGER NOT NULL DEFAULT 0,
  backpressure_active BOOLEAN NOT NULL DEFAULT false
);

-- Circuit breaker durable state (replaces in-memory Map)
CREATE TABLE IF NOT EXISTS public.circuit_breaker_state (
  module TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'closed',
  countable_failures INTEGER NOT NULL DEFAULT 0,
  last_trip_at TIMESTAMPTZ,
  open_until TIMESTAMPTZ,
  half_open_attempts INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Circuit breaker failure log (sliding window)
CREATE TABLE IF NOT EXISTS public.circuit_breaker_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  classified_type TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cb_failures_module_time ON public.circuit_breaker_failures (module, created_at DESC);

-- Safe mode durable state (singleton)
CREATE TABLE IF NOT EXISTS public.substrate_safe_mode (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  level TEXT NOT NULL DEFAULT 'off',
  activated_at TIMESTAMPTZ,
  activated_by TEXT,
  reason TEXT,
  cascade_event_id UUID
);

INSERT INTO public.substrate_safe_mode (id, level) VALUES (1, 'off')
ON CONFLICT (id) DO NOTHING;

-- Memory tier receipts (replaces in-memory array)
CREATE TABLE IF NOT EXISTS public.memory_tier_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID,
  before_tier TEXT NOT NULL,
  after_tier TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  rps_score FLOAT,
  actor TEXT NOT NULL DEFAULT 'system',
  evidence JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_memory_tier_receipts_memory ON public.memory_tier_receipts (memory_id);

-- RLS: service role / admin only
ALTER TABLE public.substrate_scheduler_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_scheduler_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_breaker_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circuit_breaker_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_safe_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_tier_receipts ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "service_role_all" ON public.substrate_scheduler_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON public.substrate_scheduler_receipts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON public.circuit_breaker_state FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON public.circuit_breaker_failures FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON public.substrate_safe_mode FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON public.memory_tier_receipts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow authenticated admin read
CREATE POLICY "admin_read" ON public.substrate_scheduler_queue FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_read" ON public.substrate_scheduler_receipts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_read" ON public.circuit_breaker_state FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_read" ON public.circuit_breaker_failures FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_read" ON public.substrate_safe_mode FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_read" ON public.memory_tier_receipts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
