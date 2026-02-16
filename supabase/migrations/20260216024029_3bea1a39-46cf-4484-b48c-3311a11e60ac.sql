
-- Module Sounding Board: advisory-only posts from modules to Governor
CREATE TABLE public.module_sounding_board (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('capability_outcome', 'clm_request', 'discovery', 'anomaly', 'milestone')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  confidence NUMERIC DEFAULT 0.5,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  governor_status TEXT DEFAULT 'open' CHECK (governor_status IN ('open', 'acknowledged', 'approved', 'scheduled', 'declined')),
  governor_rationale TEXT,
  governor_action_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.module_sounding_board ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write sounding board
CREATE POLICY "Admins can read sounding board"
  ON public.module_sounding_board FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert sounding board"
  ON public.module_sounding_board FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sounding board"
  ON public.module_sounding_board FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE TRIGGER update_sounding_board_timestamp
  BEFORE UPDATE ON public.module_sounding_board
  FOR EACH ROW
  EXECUTE FUNCTION public.update_brain_timestamp();

-- Index for fast queries
CREATE INDEX idx_sounding_board_status ON public.module_sounding_board (governor_status);
CREATE INDEX idx_sounding_board_module ON public.module_sounding_board (module_slug);
