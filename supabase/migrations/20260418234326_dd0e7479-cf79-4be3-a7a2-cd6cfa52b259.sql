
CREATE TABLE IF NOT EXISTS public.brain_regret_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_module TEXT NOT NULL,
  decision_type TEXT NOT NULL,
  decision_ref TEXT,
  decision_summary TEXT NOT NULL,
  outcome_summary TEXT NOT NULL,
  severity INTEGER NOT NULL DEFAULT 5,
  lessons TEXT[],
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  dreamed BOOLEAN NOT NULL DEFAULT false,
  dreamed_at TIMESTAMPTZ,
  dream_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brain_regret_log_dreamed ON public.brain_regret_log (dreamed, severity DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_regret_log_source ON public.brain_regret_log (source_module, decision_type);

ALTER TABLE public.brain_regret_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Governor reads regret log"
  ON public.brain_regret_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages regret log"
  ON public.brain_regret_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.defense_memory_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  events_scanned INTEGER NOT NULL DEFAULT 0,
  groups INTEGER NOT NULL DEFAULT 0,
  promoted INTEGER NOT NULL DEFAULT 0,
  reinforced INTEGER NOT NULL DEFAULT 0,
  elapsed_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.defense_memory_sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Governor reads defense sync runs"
  ON public.defense_memory_sync_runs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages defense sync runs"
  ON public.defense_memory_sync_runs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
