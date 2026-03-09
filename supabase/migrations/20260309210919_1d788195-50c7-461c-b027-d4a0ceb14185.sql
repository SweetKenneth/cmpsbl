
-- Pipeline Vault: server-side storage for kept pipelines
CREATE TABLE public.pipeline_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_name TEXT NOT NULL,
  pipeline_score INTEGER NOT NULL,
  pipeline_tier TEXT NOT NULL,
  pipeline_category TEXT,
  system_chain TEXT[],
  pipeline_fingerprint TEXT,
  pipeline_steps JSONB,
  valuation_display NUMERIC,
  mine_result_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user lookups and count queries
CREATE INDEX idx_pipeline_vault_user_id ON public.pipeline_vault(user_id);

-- Daily pull tracking: one row per user per day
CREATE TABLE public.user_daily_pulls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pull_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pull_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pull_date)
);

CREATE INDEX idx_user_daily_pulls_lookup ON public.user_daily_pulls(user_id, pull_date);

-- Enable RLS
ALTER TABLE public.pipeline_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_pulls ENABLE ROW LEVEL SECURITY;

-- RLS: users can only read/write their own vault
CREATE POLICY "Users can view own vault" ON public.pipeline_vault
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own vault" ON public.pipeline_vault
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own vault" ON public.pipeline_vault
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- RLS: users can only read/write their own pull counts
CREATE POLICY "Users can view own pulls" ON public.user_daily_pulls
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own pulls" ON public.user_daily_pulls
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pulls" ON public.user_daily_pulls
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Server-side function: increment daily pull count and return new count
CREATE OR REPLACE FUNCTION public.increment_daily_pull(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO user_daily_pulls (user_id, pull_date, pull_count, updated_at)
  VALUES (p_user_id, CURRENT_DATE, 1, now())
  ON CONFLICT (user_id, pull_date)
  DO UPDATE SET pull_count = user_daily_pulls.pull_count + 1, updated_at = now()
  RETURNING pull_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- Server-side function: get current vault count for a user
CREATE OR REPLACE FUNCTION public.get_vault_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::INTEGER, 0) FROM pipeline_vault WHERE user_id = p_user_id;
$$;

-- Server-side function: get today's pull count
CREATE OR REPLACE FUNCTION public.get_daily_pulls(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(pull_count, 0) FROM user_daily_pulls 
  WHERE user_id = p_user_id AND pull_date = CURRENT_DATE;
$$;
