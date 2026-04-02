CREATE TABLE public.restoration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  original_code TEXT NOT NULL,
  original_language TEXT,
  scan_result JSONB NOT NULL,
  selected_primitives JSONB NOT NULL,
  report JSONB NOT NULL,
  cjpi_score NUMERIC,
  cjpi_tier TEXT,
  serial_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_restoration_sessions_fingerprint ON public.restoration_sessions(fingerprint);
CREATE INDEX idx_restoration_sessions_serial ON public.restoration_sessions(serial_number);

ALTER TABLE public.restoration_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert restoration sessions"
ON public.restoration_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read by fingerprint"
ON public.restoration_sessions
FOR SELECT
TO anon, authenticated
USING (true);