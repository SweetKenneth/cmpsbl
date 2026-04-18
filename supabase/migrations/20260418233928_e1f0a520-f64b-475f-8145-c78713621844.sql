
CREATE TABLE IF NOT EXISTS public.decode_gap_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  best_similarity NUMERIC NOT NULL DEFAULT 0,
  match_count INTEGER NOT NULL DEFAULT 0,
  threshold_used NUMERIC,
  artifact_types TEXT[],
  source TEXT DEFAULT 'decode-memory-search',
  user_id UUID,
  addressed BOOLEAN NOT NULL DEFAULT false,
  addressed_at TIMESTAMPTZ,
  dream_id UUID,
  attempts INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decode_gap_log_addressed ON public.decode_gap_log (addressed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decode_gap_log_similarity ON public.decode_gap_log (best_similarity ASC) WHERE addressed = false;
CREATE INDEX IF NOT EXISTS idx_decode_gap_log_query_lower ON public.decode_gap_log (lower(query));

ALTER TABLE public.decode_gap_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Governor can read decode gaps"
  ON public.decode_gap_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages decode gaps"
  ON public.decode_gap_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
