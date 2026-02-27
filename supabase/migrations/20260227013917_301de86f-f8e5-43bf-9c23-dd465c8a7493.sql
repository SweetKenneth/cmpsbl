
-- Phase 2: Crystallized asset entitlement layer

-- 1. Crystallized assets registry (admin-managed)
CREATE TABLE public.crystallized_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_key TEXT NOT NULL UNIQUE,
  asset_type TEXT NOT NULL DEFAULT 'pipeline',
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('released', 'reserved')),
  tier_min TEXT NOT NULL DEFAULT 'builder' CHECK (tier_min IN ('builder', 'operator', 'architect')),
  pack_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Per-user explicit entitlements (for exceptions / grants)
CREATE TABLE public.user_crystallized_entitlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_key TEXT NOT NULL REFERENCES public.crystallized_assets(asset_key) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'admin_grant',
  UNIQUE(user_id, asset_key)
);

-- 3. Enable RLS
ALTER TABLE public.crystallized_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_crystallized_entitlements ENABLE ROW LEVEL SECURITY;

-- 4. RLS: crystallized_assets readable by all authenticated users, writable by admins only
CREATE POLICY "Anyone can read crystallized assets"
  ON public.crystallized_assets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage crystallized assets"
  ON public.crystallized_assets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. RLS: entitlements scoped to own user
CREATE POLICY "Users can read own entitlements"
  ON public.user_crystallized_entitlements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage entitlements"
  ON public.user_crystallized_entitlements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Timestamp trigger
CREATE TRIGGER update_crystallized_assets_timestamp
  BEFORE UPDATE ON public.crystallized_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();

-- 7. can_use_crystallized RPC
CREATE OR REPLACE FUNCTION public.can_use_crystallized(p_user_id UUID, p_asset_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_asset RECORD;
BEGIN
  -- Find the asset
  SELECT status, tier_min, pack_id INTO v_asset
  FROM crystallized_assets WHERE asset_key = p_asset_key;

  -- Asset doesn't exist = deny
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Reserved assets: only if explicitly entitled
  IF v_asset.status = 'reserved' THEN
    RETURN EXISTS (
      SELECT 1 FROM user_crystallized_entitlements
      WHERE user_id = p_user_id AND asset_key = p_asset_key
    );
  END IF;

  -- Released asset: check if user has pack active (if pack-bound)
  IF v_asset.pack_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM user_pack_activations
      WHERE user_id = p_user_id AND pack_id = v_asset.pack_id AND active = true
    );
  END IF;

  -- Released + no pack binding = available to all
  RETURN TRUE;
END;
$$;
