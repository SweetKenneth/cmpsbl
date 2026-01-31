-- Change Ledger: Append-only effect recording for Omega Observer Engine
-- Records EFFECTS of changes (not plans)

CREATE TABLE IF NOT EXISTS public.change_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  component TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('fix', 'feature', 'enhancement', 'config')),
  summary TEXT NOT NULL,
  artifacts_touched TEXT[] DEFAULT '{}',
  metrics_before JSONB,
  metrics_after JSONB,
  source TEXT NOT NULL DEFAULT 'unknown' CHECK (source IN ('modernizer', 'lovable', 'manual', 'unknown')),
  phase TEXT NOT NULL DEFAULT 'idle' CHECK (phase IN ('planning', 'apply', 'verify', 'post_apply', 'idle')),
  evolution_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- Index for efficient queries
CREATE INDEX idx_change_ledger_timestamp ON public.change_ledger (timestamp DESC);
CREATE INDEX idx_change_ledger_component ON public.change_ledger (component);
CREATE INDEX idx_change_ledger_source ON public.change_ledger (source);
CREATE INDEX idx_change_ledger_evolution_id ON public.change_ledger (evolution_id);

-- Enable RLS
ALTER TABLE public.change_ledger ENABLE ROW LEVEL SECURITY;

-- Admin read access (ledger is append-only, only system writes)
CREATE POLICY "Admin read access for change_ledger"
  ON public.change_ledger
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role full access for system writes
CREATE POLICY "Service role full access for change_ledger"
  ON public.change_ledger
  FOR ALL
  USING (auth.role() = 'service_role');

-- Enable realtime for observability
ALTER PUBLICATION supabase_realtime ADD TABLE public.change_ledger;

COMMENT ON TABLE public.change_ledger IS 'Append-only ledger recording effects of system changes for Omega Observer Engine';