
-- CMPSBL Patch Distribution System
-- Canonical patch storage for LNCHBL distribution

CREATE TABLE public.cmpsbl_patches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  target_distribution TEXT NOT NULL DEFAULT 'LNCHBL' CHECK (target_distribution = 'LNCHBL'),
  required_tier TEXT NOT NULL DEFAULT 'free' CHECK (required_tier IN ('free', 'builder', 'pro')),
  engines_unlocked TEXT[] DEFAULT '{}',
  capabilities_unlocked TEXT[] DEFAULT '{}',
  changelog TEXT,
  manifest_json JSONB,
  signature TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'revoked')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_cmpsbl_patches_version ON public.cmpsbl_patches (version);
CREATE INDEX idx_cmpsbl_patches_target ON public.cmpsbl_patches (target_distribution);
CREATE INDEX idx_cmpsbl_patches_status ON public.cmpsbl_patches (status);
CREATE INDEX idx_cmpsbl_patches_tier ON public.cmpsbl_patches (required_tier);

-- Enable RLS
ALTER TABLE public.cmpsbl_patches ENABLE ROW LEVEL SECURITY;

-- Admin-only read/write via has_role
CREATE POLICY "Admins can read all patches"
  ON public.cmpsbl_patches FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert patches"
  ON public.cmpsbl_patches FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update patches"
  ON public.cmpsbl_patches FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete patches"
  ON public.cmpsbl_patches FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role access for edge functions (bypasses RLS by default)

-- Timestamp trigger
CREATE TRIGGER update_cmpsbl_patches_timestamp
  BEFORE UPDATE ON public.cmpsbl_patches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_substrate_timestamp();

-- Patch download audit log
CREATE TABLE public.cmpsbl_patch_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patch_id UUID REFERENCES public.cmpsbl_patches(id) ON DELETE CASCADE NOT NULL,
  distribution_id TEXT NOT NULL DEFAULT 'LNCHBL',
  license_key_hash TEXT,
  license_tier TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cmpsbl_patch_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read download logs"
  ON public.cmpsbl_patch_downloads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_patch_downloads_patch ON public.cmpsbl_patch_downloads (patch_id);
CREATE INDEX idx_patch_downloads_created ON public.cmpsbl_patch_downloads (created_at);
