
-- ═══════════════════════════════════════════════════════════════
-- Evolution Pre-Metrics: Captures system state before each export
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.evolution_pre_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_id TEXT NOT NULL UNIQUE,
  proposal_id TEXT,
  tenant_id TEXT,
  health_score NUMERIC NOT NULL DEFAULT 0,
  audit_percent NUMERIC NOT NULL DEFAULT 0,
  debt_flags_count INTEGER NOT NULL DEFAULT 0,
  open_circuit_count INTEGER NOT NULL DEFAULT 0,
  memory_total_vectors INTEGER NOT NULL DEFAULT 0,
  entropy_score NUMERIC NOT NULL DEFAULT 0,
  raw_scan_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.evolution_pre_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on evolution_pre_metrics"
  ON public.evolution_pre_metrics FOR ALL
  USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- Evolution Entropy Ledger: Tracks entropy trend per tenant
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.evolution_entropy_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  proposal_id TEXT,
  entropy_score NUMERIC NOT NULL DEFAULT 0,
  health_score NUMERIC NOT NULL DEFAULT 0,
  debt_flags_count INTEGER NOT NULL DEFAULT 0,
  health_delta NUMERIC,
  entropy_delta NUMERIC,
  event_type TEXT NOT NULL DEFAULT 'evolution',
  is_restoration BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.evolution_entropy_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read entropy ledger"
  ON public.evolution_entropy_ledger FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Service role write entropy ledger"
  ON public.evolution_entropy_ledger FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_entropy_ledger_tenant ON public.evolution_entropy_ledger(tenant_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- Evolution Snapshots: Tenant-scoped snapshot registry
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.evolution_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  proposal_id TEXT,
  pre_metrics JSONB,
  state_hash TEXT,
  restorable BOOLEAN NOT NULL DEFAULT true,
  restored_at TIMESTAMPTZ,
  restored_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.evolution_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read evolution snapshots"
  ON public.evolution_snapshots FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Service role write evolution snapshots"
  ON public.evolution_snapshots FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role update evolution snapshots"
  ON public.evolution_snapshots FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE INDEX idx_evolution_snapshots_tenant ON public.evolution_snapshots(tenant_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- Add delta columns to evolution_receipts
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.evolution_receipts
  ADD COLUMN IF NOT EXISTS pre_metrics JSONB,
  ADD COLUMN IF NOT EXISTS post_metrics JSONB,
  ADD COLUMN IF NOT EXISTS delta JSONB,
  ADD COLUMN IF NOT EXISTS tenant_id TEXT,
  ADD COLUMN IF NOT EXISTS snapshot_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS reverted_at TIMESTAMPTZ;
