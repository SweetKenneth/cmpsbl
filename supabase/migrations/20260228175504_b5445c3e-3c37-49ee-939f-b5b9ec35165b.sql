
-- Persistent Control Plane Tables (founder = admin role)

CREATE TABLE public.substrate_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percent INTEGER NOT NULL DEFAULT 100,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.substrate_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_flags FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TABLE public.substrate_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.substrate_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_config FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TABLE public.substrate_canaries (
  id TEXT PRIMARY KEY,
  percent INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT false,
  metrics_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.substrate_canaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_canaries FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TABLE public.substrate_retry_buckets (
  module TEXT PRIMARY KEY,
  tokens NUMERIC NOT NULL DEFAULT 10,
  max_tokens NUMERIC NOT NULL DEFAULT 10,
  refill_rate NUMERIC NOT NULL DEFAULT 0.5,
  stats_json JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.substrate_retry_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_retry_buckets FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TABLE public.substrate_metrics_snapshot (
  name TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  labels_json JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (name, labels_json)
);
ALTER TABLE public.substrate_metrics_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_metrics_snapshot FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TABLE public.substrate_cascade_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  chain_json JSONB NOT NULL DEFAULT '[]',
  confidence NUMERIC NOT NULL DEFAULT 0,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.substrate_cascade_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_cascade_history FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TABLE public.substrate_idempotency (
  key TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  result_json JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 hour')
);
ALTER TABLE public.substrate_idempotency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_idempotency FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TABLE public.substrate_schema_registry (
  entity TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  fields_json JSONB NOT NULL DEFAULT '[]',
  migrations_json JSONB NOT NULL DEFAULT '[]',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.substrate_schema_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_schema_registry FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TABLE public.substrate_queue_snapshot (
  id TEXT PRIMARY KEY DEFAULT 'default',
  serialized_heap_json JSONB NOT NULL DEFAULT '[]',
  stats_json JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.substrate_queue_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_queue_snapshot FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE TABLE public.substrate_chaos_rules (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  target TEXT NOT NULL,
  probability NUMERIC NOT NULL DEFAULT 0.1,
  config_json JSONB DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.substrate_chaos_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin access only" ON public.substrate_chaos_rules FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);
