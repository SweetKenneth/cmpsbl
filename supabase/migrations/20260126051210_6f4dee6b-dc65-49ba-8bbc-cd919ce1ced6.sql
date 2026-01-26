-- Marketplace User Profiles & Personalization System
-- Observer profile for new accounts with purchase tracking and recommendations

-- Template views/likes for recommendation engine
CREATE TABLE public.marketplace_user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'purchase', 'preview')),
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- User purchases tracking
CREATE TABLE public.marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  license_key TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Mailing list for new releases and featured templates
CREATE TABLE public.marketplace_mailing_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  preferences JSONB DEFAULT '{"new_releases": true, "featured": true, "deals": true}',
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Template popularity tracking for "Most Popular" section
CREATE TABLE public.marketplace_template_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT UNIQUE NOT NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  preview_count INTEGER DEFAULT 0,
  trending_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User saved/favorited templates
CREATE TABLE public.marketplace_saved_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, template_id)
);

-- New release alerts (per-user notification preferences)
CREATE TABLE public.marketplace_release_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT, -- NULL means all categories
  alert_method TEXT DEFAULT 'in_app' CHECK (alert_method IN ('in_app', 'email', 'both')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE public.marketplace_user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_mailing_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_template_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_saved_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_release_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_user_interests
CREATE POLICY "Users can view own interests"
  ON public.marketplace_user_interests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interests"
  ON public.marketplace_user_interests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to interests"
  ON public.marketplace_user_interests FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- RLS Policies for marketplace_purchases
CREATE POLICY "Users can view own purchases"
  ON public.marketplace_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to purchases"
  ON public.marketplace_purchases FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- RLS Policies for marketplace_mailing_list
CREATE POLICY "Users can view own subscription"
  ON public.marketplace_mailing_list FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own subscription"
  ON public.marketplace_mailing_list FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public can subscribe to mailing list"
  ON public.marketplace_mailing_list FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Service role full access to mailing list"
  ON public.marketplace_mailing_list FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- RLS Policies for marketplace_template_stats (public read, service write)
CREATE POLICY "Anyone can view template stats"
  ON public.marketplace_template_stats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages template stats"
  ON public.marketplace_template_stats FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- RLS Policies for marketplace_saved_templates
CREATE POLICY "Users can view own saved templates"
  ON public.marketplace_saved_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved templates"
  ON public.marketplace_saved_templates FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for marketplace_release_alerts
CREATE POLICY "Users can view own alerts"
  ON public.marketplace_release_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own alerts"
  ON public.marketplace_release_alerts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_marketplace_interests_user ON public.marketplace_user_interests(user_id);
CREATE INDEX idx_marketplace_interests_template ON public.marketplace_user_interests(template_id);
CREATE INDEX idx_marketplace_purchases_user ON public.marketplace_purchases(user_id);
CREATE INDEX idx_marketplace_saved_user ON public.marketplace_saved_templates(user_id);
CREATE INDEX idx_marketplace_stats_trending ON public.marketplace_template_stats(trending_score DESC);

-- Function to track template interaction
CREATE OR REPLACE FUNCTION public.track_template_interaction(
  p_template_id TEXT,
  p_interaction_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update or insert template stats
  INSERT INTO marketplace_template_stats (template_id, view_count, like_count, purchase_count, preview_count, updated_at)
  VALUES (
    p_template_id,
    CASE WHEN p_interaction_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_interaction_type = 'like' THEN 1 ELSE 0 END,
    CASE WHEN p_interaction_type = 'purchase' THEN 1 ELSE 0 END,
    CASE WHEN p_interaction_type = 'preview' THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (template_id) DO UPDATE SET
    view_count = marketplace_template_stats.view_count + CASE WHEN p_interaction_type = 'view' THEN 1 ELSE 0 END,
    like_count = marketplace_template_stats.like_count + CASE WHEN p_interaction_type = 'like' THEN 1 ELSE 0 END,
    purchase_count = marketplace_template_stats.purchase_count + CASE WHEN p_interaction_type = 'purchase' THEN 1 ELSE 0 END,
    preview_count = marketplace_template_stats.preview_count + CASE WHEN p_interaction_type = 'preview' THEN 1 ELSE 0 END,
    trending_score = (
      marketplace_template_stats.view_count * 0.1 +
      marketplace_template_stats.like_count * 0.3 +
      marketplace_template_stats.purchase_count * 1.0 +
      marketplace_template_stats.preview_count * 0.2
    ),
    updated_at = now();

  -- Track user interest if authenticated
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO marketplace_user_interests (user_id, template_id, interaction_type)
    VALUES (auth.uid(), p_template_id, p_interaction_type);
  END IF;
END;
$$;