-- ════════════════════════════════════════════════════════════════════════════
-- user_layer_entitlements
-- ────────────────────────────────────────────────────────────────────────────
-- Records which inventory (store) layers a user has purchased and is
-- therefore entitled to wire into their Ascension V2 export flow.
--
-- Design:
--   * One row per (user_id, layer_id) pair  → uniqueness enforced.
--   * `layer_id` is the CmpsblLayerDefinition.id string (e.g. 'privacy-obfuscation').
--   * `source` records how the entitlement was granted (stripe purchase,
--     governor grant, promotional, bundle, etc.) for audit clarity.
--   * `marketplace_inventory_id` is a soft FK to the store row that produced
--     this entitlement (nullable so governor/admin grants don't require a
--     storefront SKU).
--   * `revoked_at` allows non-destructive entitlement removal (refunds,
--     subscription expiry) while preserving audit history.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.user_layer_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  layer_id TEXT NOT NULL,
  marketplace_inventory_id UUID NULL REFERENCES public.marketplace_inventory(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'stripe',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_layer_entitlements_unique UNIQUE (user_id, layer_id)
);

CREATE INDEX idx_user_layer_entitlements_user_active
  ON public.user_layer_entitlements (user_id)
  WHERE revoked_at IS NULL;

CREATE INDEX idx_user_layer_entitlements_layer
  ON public.user_layer_entitlements (layer_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.user_layer_entitlements ENABLE ROW LEVEL SECURITY;

-- Users see only their own active entitlements.
CREATE POLICY "Users can view their own entitlements"
  ON public.user_layer_entitlements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Governor sees all (uses existing has_role check).
CREATE POLICY "Admins can view all entitlements"
  ON public.user_layer_entitlements
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Inserts/updates/deletes are restricted to service role only — entitlements
-- are granted via edge functions (stripe webhooks, governor grant function),
-- never directly from the client.
CREATE POLICY "Admins can manage entitlements"
  ON public.user_layer_entitlements
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ── Updated-at trigger ──────────────────────────────────────────────────────
CREATE TRIGGER trg_user_layer_entitlements_updated_at
  BEFORE UPDATE ON public.user_layer_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ── Helper: list active entitlements for a user ─────────────────────────────
CREATE OR REPLACE FUNCTION public.get_active_layer_entitlements(_user_id UUID)
RETURNS TABLE (layer_id TEXT, source TEXT, granted_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT layer_id, source, granted_at
  FROM public.user_layer_entitlements
  WHERE user_id = _user_id
    AND revoked_at IS NULL
  ORDER BY granted_at DESC;
$$;

COMMENT ON TABLE public.user_layer_entitlements IS
  'Per-user purchase entitlements for the 25 inventory (store) layers. Drives the "Your Purchased Layers" section in the Ascension V2 enhance step.';