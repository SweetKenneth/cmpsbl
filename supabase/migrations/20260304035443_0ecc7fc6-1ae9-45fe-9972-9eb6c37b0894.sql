
-- ═══════════════════════════════════════════════════════════════════
-- FOUNDRY PUBLIC MINING: Tables for user state, inventory, mine events, tier config
-- ═══════════════════════════════════════════════════════════════════

-- 1) foundry_user_state — per-user workspace state
CREATE TABLE public.foundry_user_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active_run_id UUID,
  tutorial_completed BOOLEAN NOT NULL DEFAULT false,
  preferred_mode TEXT NOT NULL DEFAULT 'simple',
  last_mine_at TIMESTAMPTZ,
  total_mines INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_streak_date DATE
);

ALTER TABLE public.foundry_user_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own foundry state"
  ON public.foundry_user_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own foundry state"
  ON public.foundry_user_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own foundry state"
  ON public.foundry_user_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_foundry_user_state_timestamp
  BEFORE UPDATE ON public.foundry_user_state
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();

-- 2) foundry_inventory — user-owned mined artifacts
CREATE TABLE public.foundry_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artifact_id TEXT NOT NULL,
  artifact_name TEXT NOT NULL,
  artifact_description TEXT,
  score INTEGER NOT NULL CHECK (score >= 68),
  public_tier TEXT NOT NULL CHECK (public_tier IN ('Mint', 'Prime', 'Relic', 'Mythic', 'Apex')),
  valuation_display NUMERIC NOT NULL DEFAULT 0,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'mined' CHECK (source IN ('mined', 'reward', 'drop')),
  category TEXT,
  system_chain TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_foundry_inventory_user ON public.foundry_inventory(user_id);
CREATE INDEX idx_foundry_inventory_artifact ON public.foundry_inventory(artifact_id);
CREATE INDEX idx_foundry_inventory_tier ON public.foundry_inventory(public_tier);

ALTER TABLE public.foundry_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON public.foundry_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert inventory"
  ON public.foundry_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot delete inventory"
  ON public.foundry_inventory FOR DELETE
  USING (false);

-- 3) foundry_mine_events — audit trail for all mine attempts
CREATE TABLE public.foundry_mine_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id UUID,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  result_count INTEGER NOT NULL DEFAULT 0,
  best_score INTEGER,
  tier_breakdown JSONB DEFAULT '{}'::jsonb,
  rate_limit_bucket TEXT,
  blocked_reason TEXT,
  duration_ms INTEGER
);

CREATE INDEX idx_foundry_mine_events_user ON public.foundry_mine_events(user_id);
CREATE INDEX idx_foundry_mine_events_requested ON public.foundry_mine_events(requested_at);

ALTER TABLE public.foundry_mine_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mine events"
  ON public.foundry_mine_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mine events"
  ON public.foundry_mine_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4) foundry_tier_config — rate limits per paid tier (admin-managed)
CREATE TABLE public.foundry_tier_config (
  id TEXT PRIMARY KEY, -- 'explorer' | 'prospector' | 'excavator' | 'mythic_miner'
  display_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  mines_per_day INTEGER NOT NULL,
  mines_per_hour INTEGER NOT NULL,
  max_results_per_mine INTEGER NOT NULL,
  concurrency_cap INTEGER NOT NULL DEFAULT 1,
  fast_lane BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.foundry_tier_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tier config"
  ON public.foundry_tier_config FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify tier config"
  ON public.foundry_tier_config FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed the 4 tiers + free
INSERT INTO public.foundry_tier_config (id, display_name, price_cents, mines_per_day, mines_per_hour, max_results_per_mine, concurrency_cap, fast_lane)
VALUES
  ('free', 'Free', 0, 3, 2, 1, 1, false),
  ('explorer', 'Explorer', 900, 10, 5, 2, 1, false),
  ('prospector', 'Prospector', 2900, 30, 10, 3, 2, false),
  ('excavator', 'Excavator', 4900, 60, 20, 5, 3, true),
  ('mythic_miner', 'Mythic Miner', 7900, 120, 40, 8, 4, true);

-- 5) foundry_bias_config — internal-only admin switch for splash releases
CREATE TABLE public.foundry_bias_config (
  id TEXT PRIMARY KEY DEFAULT 'global',
  bias_enabled BOOLEAN NOT NULL DEFAULT false,
  bias_weight NUMERIC NOT NULL DEFAULT 0,
  splash_active BOOLEAN NOT NULL DEFAULT false,
  splash_start TIMESTAMPTZ,
  splash_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.foundry_bias_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access bias config"
  ON public.foundry_bias_config FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.foundry_bias_config (id, bias_enabled, bias_weight)
VALUES ('global', false, 0);

-- 6) foundry_bias_audit — audit log for bias switch usage
CREATE TABLE public.foundry_bias_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  previous_state JSONB,
  new_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.foundry_bias_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access bias audit"
  ON public.foundry_bias_audit FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
