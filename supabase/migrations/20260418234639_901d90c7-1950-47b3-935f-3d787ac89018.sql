
CREATE TABLE IF NOT EXISTS public.governor_intent_stream (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_text TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'substrate',
  priority INTEGER NOT NULL DEFAULT 5,
  source TEXT DEFAULT 'governor_chat',
  linked_refs TEXT[],
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  embedded BOOLEAN NOT NULL DEFAULT false,
  embedding_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_governor_intent_processed ON public.governor_intent_stream (processed, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_governor_intent_scope ON public.governor_intent_stream (scope, created_at DESC);

ALTER TABLE public.governor_intent_stream ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Governor reads intent stream"
  ON public.governor_intent_stream FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages intent stream"
  ON public.governor_intent_stream FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
