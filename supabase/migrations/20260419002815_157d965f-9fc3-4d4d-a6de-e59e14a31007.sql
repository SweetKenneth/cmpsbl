
-- 1. DECODE → DREAM: Knowledge gap log
CREATE TABLE IF NOT EXISTS public.decode_knowledge_gaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_hash TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  gap_signal TEXT NOT NULL DEFAULT 'low_confidence',
  confidence_observed NUMERIC,
  frequency INT NOT NULL DEFAULT 1,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dream_synthesis_id UUID,
  dreamed_at TIMESTAMPTZ,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decode_gaps_undreamed ON public.decode_knowledge_gaps (frequency DESC, last_seen_at DESC) WHERE dreamed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_decode_gaps_last_seen ON public.decode_knowledge_gaps (last_seen_at DESC);

ALTER TABLE public.decode_knowledge_gaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Governor reads decode gaps" ON public.decode_knowledge_gaps;
CREATE POLICY "Governor reads decode gaps"
  ON public.decode_knowledge_gaps FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service role manages decode gaps" ON public.decode_knowledge_gaps;
CREATE POLICY "Service role manages decode gaps"
  ON public.decode_knowledge_gaps FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. DEFENSE → MEMORY: Distilled attack signatures
CREATE TABLE IF NOT EXISTS public.defense_memory_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signature_hash TEXT NOT NULL UNIQUE,
  signature_kind TEXT NOT NULL,
  signature_value TEXT NOT NULL,
  action TEXT NOT NULL,
  hit_count INT NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decay_score NUMERIC NOT NULL DEFAULT 1.0,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_defense_sig_lookup ON public.defense_memory_signatures (signature_hash);
CREATE INDEX IF NOT EXISTS idx_defense_sig_active ON public.defense_memory_signatures (last_seen_at DESC) WHERE decay_score > 0.2;

ALTER TABLE public.defense_memory_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Governor reads defense memory" ON public.defense_memory_signatures;
CREATE POLICY "Governor reads defense memory"
  ON public.defense_memory_signatures FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service role manages defense memory" ON public.defense_memory_signatures;
CREATE POLICY "Service role manages defense memory"
  ON public.defense_memory_signatures FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Extend dream_intent_syntheses to tag source kind
ALTER TABLE public.dream_intent_syntheses
  ADD COLUMN IF NOT EXISTS source_kind TEXT NOT NULL DEFAULT 'intent',
  ADD COLUMN IF NOT EXISTS source_refs JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_dream_synth_source_kind ON public.dream_intent_syntheses (source_kind, created_at DESC);
