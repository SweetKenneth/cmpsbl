
-- Track all substrate changes for the LNCHBL patch governance stream
CREATE TABLE public.substrate_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_type TEXT NOT NULL DEFAULT 'commit',
  title TEXT NOT NULL,
  description TEXT,
  files_changed TEXT[] DEFAULT '{}',
  diff_summary JSONB DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'substrate',
  commit_hash TEXT,
  author TEXT,
  
  -- Governance fields
  lnchbl_status TEXT NOT NULL DEFAULT 'pending' CHECK (lnchbl_status IN ('pending', 'approved', 'declined', 'dispatched')),
  declined_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  dispatched_at TIMESTAMPTZ,
  patch_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.substrate_changes ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view substrate changes"
  ON public.substrate_changes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert substrate changes"
  ON public.substrate_changes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update substrate changes"
  ON public.substrate_changes FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE TRIGGER update_substrate_changes_timestamp
  BEFORE UPDATE ON public.substrate_changes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_substrate_timestamp();

-- Indexes
CREATE INDEX idx_substrate_changes_status ON public.substrate_changes (lnchbl_status);
CREATE INDEX idx_substrate_changes_created ON public.substrate_changes (created_at DESC);

-- Enable realtime for live feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.substrate_changes;
