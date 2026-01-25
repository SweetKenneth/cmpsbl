-- =========================================================
-- ACCESS v2 — Keys, Subscriptions, Entitlements
-- Promotes Access to a proper v2 entitlement & key-management module
-- =========================================================

-- 1. Create access_developers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.access_developers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  email text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Add unique index on email if present
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_developers_email 
  ON public.access_developers(email) WHERE email IS NOT NULL;

-- 3. Add entitlements and plan_slug to access_subscriptions
ALTER TABLE public.access_subscriptions 
  ADD COLUMN IF NOT EXISTS entitlements jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS plan_slug text DEFAULT 'substrate_free';

-- 4. Add product_code to access_usage for CMPTBL product tracking
ALTER TABLE public.access_usage
  ADD COLUMN IF NOT EXISTS product_code text;

-- 5. Create access_products table for CMPTBL product catalog
CREATE TABLE IF NOT EXISTS public.access_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text DEFAULT 'cmptbl',
  monthly_quota integer DEFAULT 100,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 6. Seed CMPTBL products
INSERT INTO public.access_products (code, name, description, category, monthly_quota) VALUES
  ('scan', 'Accessibility Scan', 'WCAG compliance scanning', 'cmptbl', 100),
  ('fix', 'Auto Fix', 'AI-powered accessibility fixes', 'cmptbl', 50),
  ('badge', 'Compliance Badge', 'SVG badge generation', 'cmptbl', 1000),
  ('report', 'Accessibility Report', 'Full compliance reports', 'cmptbl', 25),
  ('assist', 'Vision Assist', 'Real-time accessibility chatbot', 'cmptbl', 200),
  ('alt_text', 'Alt Text Generation', 'AI alt text for images', 'cmptbl', 500),
  ('tts', 'Text to Speech', 'TTS audio generation', 'cmptbl', 200),
  ('recommendations', 'Fix Recommendations', 'AI improvement suggestions', 'cmptbl', 100),
  ('substrate_read', 'Substrate Read', 'Read-only substrate access', 'substrate', 10000),
  ('substrate_write', 'Substrate Write', 'Write operations on substrate', 'substrate', 5000),
  ('brain_query', 'Brain Query', 'Memory queries', 'substrate', 1000),
  ('nexus_route', 'Nexus Routing', 'AI provider routing', 'substrate', 500)
ON CONFLICT (code) DO NOTHING;

-- 7. Enable RLS on new tables
ALTER TABLE public.access_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_products ENABLE ROW LEVEL SECURITY;

-- 8. RLS policies for access_developers
CREATE POLICY "Service role full access access_developers" ON public.access_developers
  AS RESTRICTIVE FOR ALL USING (true);

CREATE POLICY "Users can view own developer profile" ON public.access_developers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own developer profile" ON public.access_developers
  FOR UPDATE USING (auth.uid() = user_id);

-- 9. RLS policies for access_products (read-only for all)
CREATE POLICY "Products are publicly readable" ON public.access_products
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage products" ON public.access_products
  AS RESTRICTIVE FOR ALL USING (true);

-- 10. Create updated_at trigger for access_developers
CREATE OR REPLACE FUNCTION public.update_access_developer_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_access_developers_updated_at ON public.access_developers;
CREATE TRIGGER update_access_developers_updated_at
  BEFORE UPDATE ON public.access_developers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_access_developer_timestamp();

-- 11. Add index on access_usage for product_code queries
CREATE INDEX IF NOT EXISTS idx_access_usage_product_code 
  ON public.access_usage(product_code, created_at DESC);