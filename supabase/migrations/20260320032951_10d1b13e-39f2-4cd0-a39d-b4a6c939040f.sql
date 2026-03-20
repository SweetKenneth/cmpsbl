
-- ═══ Saved Workflows (Creator+) ═══
CREATE TABLE public.saved_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  intent_chain JSONB NOT NULL DEFAULT '[]'::jsonb,
  trigger_shortcut TEXT,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  tier_required TEXT NOT NULL DEFAULT 'creator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflows"
  ON public.saved_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflows"
  ON public.saved_workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON public.saved_workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON public.saved_workflows FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_workflows_user ON public.saved_workflows(user_id);

-- ═══ Referral Credits ═══
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  uses INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 10,
  credit_days_per_referral INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);

CREATE TABLE public.referral_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES public.referral_codes(id),
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  credit_days INTEGER DEFAULT 7,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON public.referral_redemptions FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Authenticated users can create redemptions"
  ON public.referral_redemptions FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

-- ═══ Usage Stats (for dashboard) ═══
CREATE TABLE public.member_usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_date DATE NOT NULL DEFAULT CURRENT_DATE,
  intents_executed INTEGER DEFAULT 0,
  tokens_consumed INTEGER DEFAULT 0,
  discoveries_pulled INTEGER DEFAULT 0,
  exports_created INTEGER DEFAULT 0,
  compute_time_ms BIGINT DEFAULT 0,
  estimated_value_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_date)
);

ALTER TABLE public.member_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage stats"
  ON public.member_usage_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can upsert usage stats"
  ON public.member_usage_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service can update usage stats"
  ON public.member_usage_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_member_usage_user_period ON public.member_usage_stats(user_id, period_date);

-- Trigger for updated_at
CREATE TRIGGER update_saved_workflows_updated_at
  BEFORE UPDATE ON public.saved_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_member_usage_stats_updated_at
  BEFORE UPDATE ON public.member_usage_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
