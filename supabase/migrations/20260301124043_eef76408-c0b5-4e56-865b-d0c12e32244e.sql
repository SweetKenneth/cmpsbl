
-- NEXUS v3: Persistent Health State, Cost Ledger, Distributed Tracing, Provider Affinity
-- Table 1: Provider health state (persisted across isolates)
CREATE TABLE public.nexus_provider_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT NOT NULL,
  health_score NUMERIC NOT NULL DEFAULT 100,
  circuit_state TEXT NOT NULL DEFAULT 'closed',
  circuit_opened_at TIMESTAMPTZ,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  total_calls INTEGER NOT NULL DEFAULT 0,
  total_successes INTEGER NOT NULL DEFAULT 0,
  last_fail_time TIMESTAMPTZ,
  last_success_time TIMESTAMPTZ,
  p50_latency_ms NUMERIC DEFAULT 0,
  p95_latency_ms NUMERIC DEFAULT 0,
  p99_latency_ms NUMERIC DEFAULT 0,
  latency_samples NUMERIC[] DEFAULT '{}',
  task_affinity JSONB NOT NULL DEFAULT '{}',
  error_counts JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id)
);

-- Table 2: Cost ledger (per-provider daily spend)
CREATE TABLE public.nexus_cost_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_calls INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC NOT NULL DEFAULT 0,
  task_breakdown JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, date)
);

-- Table 3: Distributed trace log
CREATE TABLE public.nexus_traces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trace_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  model TEXT,
  task_type TEXT,
  prompt_hash TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  latency_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success',
  error_category TEXT,
  error_message TEXT,
  fallback_chain TEXT[],
  attempt_number INTEGER DEFAULT 1,
  priority TEXT DEFAULT 'normal',
  temperature NUMERIC,
  quality_score NUMERIC,
  cost_estimate_usd NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table 4: Provider affinity persistence (learned weights)
CREATE TABLE public.nexus_provider_affinity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms NUMERIC DEFAULT 0,
  avg_quality_score NUMERIC DEFAULT 0,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_id, task_type)
);

-- Table 5: Anomaly alerts
CREATE TABLE public.nexus_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id TEXT,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  description TEXT NOT NULL,
  metrics JSONB DEFAULT '{}',
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.nexus_provider_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_cost_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_provider_affinity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nexus_anomalies ENABLE ROW LEVEL SECURITY;

-- Service role full access (edge functions use service role)
CREATE POLICY "Service role full access" ON public.nexus_provider_health FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.nexus_cost_ledger FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.nexus_traces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.nexus_provider_affinity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.nexus_anomalies FOR ALL USING (true) WITH CHECK (true);

-- Authenticated users can read for dashboard
CREATE POLICY "Authenticated read health" ON public.nexus_provider_health FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read ledger" ON public.nexus_cost_ledger FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read traces" ON public.nexus_traces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read affinity" ON public.nexus_provider_affinity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read anomalies" ON public.nexus_anomalies FOR SELECT TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX idx_nexus_traces_created ON public.nexus_traces (created_at DESC);
CREATE INDEX idx_nexus_traces_provider ON public.nexus_traces (provider_id, created_at DESC);
CREATE INDEX idx_nexus_traces_trace_id ON public.nexus_traces (trace_id);
CREATE INDEX idx_nexus_cost_ledger_date ON public.nexus_cost_ledger (date DESC);
CREATE INDEX idx_nexus_anomalies_unresolved ON public.nexus_anomalies (resolved, created_at DESC);

-- DB function: Upsert provider health from edge function
CREATE OR REPLACE FUNCTION public.nexus_upsert_health(
  p_provider_id TEXT,
  p_health_score NUMERIC,
  p_circuit_state TEXT,
  p_consecutive_failures INTEGER,
  p_total_calls INTEGER,
  p_total_successes INTEGER,
  p_p50 NUMERIC,
  p_p95 NUMERIC,
  p_p99 NUMERIC,
  p_task_affinity JSONB,
  p_error_counts JSONB
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO nexus_provider_health (provider_id, health_score, circuit_state, consecutive_failures, total_calls, total_successes, p50_latency_ms, p95_latency_ms, p99_latency_ms, task_affinity, error_counts, updated_at)
  VALUES (p_provider_id, p_health_score, p_circuit_state, p_consecutive_failures, p_total_calls, p_total_successes, p_p50, p_p95, p_p99, p_task_affinity, p_error_counts, now())
  ON CONFLICT (provider_id) DO UPDATE SET
    health_score = EXCLUDED.health_score,
    circuit_state = EXCLUDED.circuit_state,
    consecutive_failures = EXCLUDED.consecutive_failures,
    total_calls = EXCLUDED.total_calls,
    total_successes = EXCLUDED.total_successes,
    p50_latency_ms = EXCLUDED.p50_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms,
    p99_latency_ms = EXCLUDED.p99_latency_ms,
    task_affinity = EXCLUDED.task_affinity,
    error_counts = EXCLUDED.error_counts,
    updated_at = now();
END;
$$;

-- DB function: Upsert cost ledger
CREATE OR REPLACE FUNCTION public.nexus_record_cost(
  p_provider_id TEXT,
  p_tokens INTEGER,
  p_cost_usd NUMERIC,
  p_task_type TEXT
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO nexus_cost_ledger (provider_id, date, total_calls, total_tokens, estimated_cost_usd, task_breakdown)
  VALUES (p_provider_id, CURRENT_DATE, 1, p_tokens, p_cost_usd,
    jsonb_build_object(p_task_type, 1))
  ON CONFLICT (provider_id, date) DO UPDATE SET
    total_calls = nexus_cost_ledger.total_calls + 1,
    total_tokens = nexus_cost_ledger.total_tokens + p_tokens,
    estimated_cost_usd = nexus_cost_ledger.estimated_cost_usd + p_cost_usd,
    task_breakdown = nexus_cost_ledger.task_breakdown || jsonb_build_object(
      p_task_type, 
      COALESCE((nexus_cost_ledger.task_breakdown->>p_task_type)::integer, 0) + 1
    ),
    updated_at = now();
END;
$$;

-- DB function: Upsert provider affinity
CREATE OR REPLACE FUNCTION public.nexus_update_affinity(
  p_provider_id TEXT,
  p_task_type TEXT,
  p_success BOOLEAN,
  p_latency_ms NUMERIC,
  p_quality NUMERIC
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO nexus_provider_affinity (provider_id, task_type, success_count, failure_count, avg_latency_ms, avg_quality_score)
  VALUES (
    p_provider_id, p_task_type,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN p_success THEN 0 ELSE 1 END,
    p_latency_ms, p_quality
  )
  ON CONFLICT (provider_id, task_type) DO UPDATE SET
    success_count = nexus_provider_affinity.success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    failure_count = nexus_provider_affinity.failure_count + CASE WHEN p_success THEN 0 ELSE 1 END,
    avg_latency_ms = (nexus_provider_affinity.avg_latency_ms * (nexus_provider_affinity.success_count + nexus_provider_affinity.failure_count) + p_latency_ms) / (nexus_provider_affinity.success_count + nexus_provider_affinity.failure_count + 1),
    avg_quality_score = CASE WHEN p_success THEN
      (nexus_provider_affinity.avg_quality_score * nexus_provider_affinity.success_count + p_quality) / (nexus_provider_affinity.success_count + 1)
    ELSE nexus_provider_affinity.avg_quality_score END,
    weight = CASE WHEN (nexus_provider_affinity.success_count + nexus_provider_affinity.failure_count) > 5 THEN
      (nexus_provider_affinity.success_count + CASE WHEN p_success THEN 1 ELSE 0 END)::NUMERIC / 
      GREATEST(1, nexus_provider_affinity.success_count + nexus_provider_affinity.failure_count + 1)
    ELSE 1.0 END,
    updated_at = now();
END;
$$;

-- Cleanup function for old traces (keep 7 days)
CREATE OR REPLACE FUNCTION public.nexus_cleanup_traces()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  DELETE FROM nexus_traces WHERE created_at < now() - INTERVAL '7 days';
  DELETE FROM nexus_anomalies WHERE resolved = true AND created_at < now() - INTERVAL '30 days';
END;
$$;
