
CREATE TABLE public.cli_ascension_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  file_name TEXT NOT NULL,
  archetype TEXT,
  node_id TEXT,
  collisions INTEGER DEFAULT 0,
  discoveries INTEGER DEFAULT 0,
  cjpi_total INTEGER DEFAULT 0,
  cjpi_novelty INTEGER DEFAULT 0,
  cjpi_utility INTEGER DEFAULT 0,
  cjpi_composability INTEGER DEFAULT 0,
  cjpi_maturity INTEGER DEFAULT 0,
  cjpi_tier TEXT DEFAULT 'C',
  file_lines INTEGER DEFAULT 0,
  file_size_kb NUMERIC DEFAULT 0,
  output_file TEXT,
  operator TEXT,
  language TEXT,
  api_key_prefix TEXT,
  developer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_cli_ascension_fingerprint ON public.cli_ascension_sessions(fingerprint);
CREATE INDEX idx_cli_ascension_developer ON public.cli_ascension_sessions(developer_id);

ALTER TABLE public.cli_ascension_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read CLI ascension sessions"
  ON public.cli_ascension_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can insert CLI ascension sessions"
  ON public.cli_ascension_sessions FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.lookup_cli_ascension_by_fingerprint(p_fingerprint TEXT)
RETURNS SETOF public.cli_ascension_sessions
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.cli_ascension_sessions
  WHERE fingerprint = p_fingerprint
  LIMIT 1;
$$;
