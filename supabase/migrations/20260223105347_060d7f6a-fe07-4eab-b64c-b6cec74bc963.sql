
-- Table for DECODE brand/ego monitoring search results
CREATE TABLE public.decode_search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  query TEXT NOT NULL,
  source_url TEXT,
  title TEXT,
  snippet TEXT,
  relevance_score NUMERIC DEFAULT 0.5,
  is_new BOOLEAN DEFAULT true,
  search_provider TEXT DEFAULT 'duckduckgo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient lookups in owner report
CREATE INDEX idx_decode_search_created ON decode_search_results(created_at DESC);
CREATE INDEX idx_decode_search_topic ON decode_search_results(topic);

-- RLS: public read (for owner report edge function using service role anyway)
ALTER TABLE public.decode_search_results ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role full access on decode_search_results"
  ON public.decode_search_results
  FOR ALL
  USING (true)
  WITH CHECK (true);
