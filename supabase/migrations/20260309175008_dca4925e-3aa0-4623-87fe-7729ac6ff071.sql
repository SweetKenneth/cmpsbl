
-- Table for excluded fingerprints (owner exclusion + bot blocking)
CREATE TABLE public.analytics_excluded_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT 'owner',
  label TEXT,
  excluded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: only admins can read/write
ALTER TABLE public.analytics_excluded_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage exclusions"
  ON public.analytics_excluded_fingerprints
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups during analytics queries
CREATE INDEX idx_analytics_excluded_fp ON public.analytics_excluded_fingerprints(fingerprint);
