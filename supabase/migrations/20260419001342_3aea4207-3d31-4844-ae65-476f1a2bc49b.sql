-- DREAM-from-Intent synthesis output (patentable lineage record)
CREATE TABLE public.dream_intent_syntheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id TEXT NOT NULL,
  insight_text TEXT NOT NULL,
  synthesis_kind TEXT NOT NULL DEFAULT 'resonance', -- resonance | contradiction | convergence | drift
  source_intent_ids UUID[] NOT NULL DEFAULT '{}',
  matched_fragment_ids UUID[] NOT NULL DEFAULT '{}',
  scoring JSONB NOT NULL DEFAULT '{}'::jsonb, -- { tag_overlap, vector_resonance, priority_weight, recency_weight, total }
  confidence NUMERIC NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active', -- active | superseded | archived
  superseded_by UUID REFERENCES public.dream_intent_syntheses(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dis_created ON public.dream_intent_syntheses (created_at DESC);
CREATE INDEX idx_dis_status_conf ON public.dream_intent_syntheses (status, confidence DESC, created_at DESC);
CREATE INDEX idx_dis_cycle ON public.dream_intent_syntheses (cycle_id);

ALTER TABLE public.dream_intent_syntheses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Governor reads dream syntheses"
  ON public.dream_intent_syntheses FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages dream syntheses"
  ON public.dream_intent_syntheses FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Per-user seen tracker for DECODE notification dot
CREATE TABLE public.decode_dream_seen (
  user_id UUID NOT NULL,
  synthesis_id UUID NOT NULL REFERENCES public.dream_intent_syntheses(id) ON DELETE CASCADE,
  seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, synthesis_id)
);

CREATE INDEX idx_dds_user_seen ON public.decode_dream_seen (user_id, seen_at DESC);

ALTER TABLE public.decode_dream_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Governor manages own seen markers"
  ON public.decode_dream_seen FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id)
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);

CREATE POLICY "Service role reads seen markers"
  ON public.decode_dream_seen FOR SELECT
  USING (auth.role() = 'service_role');