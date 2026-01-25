-- Migration: Rebrand Access products from CMPTBL to Substrate-native
-- This updates product categories and codes to be substrate-native

-- 1. Update existing 'cmptbl' category products to 'substrate' category
UPDATE public.access_products 
SET category = 'substrate'
WHERE category = 'cmptbl';

-- 2. Add new substrate-native product codes if they don't exist
INSERT INTO public.access_products (code, name, description, category, monthly_quota, is_active) VALUES
  ('substrate.scan', 'Substrate Scan', 'System analysis and compliance scanning', 'substrate', 100, true),
  ('substrate.fix', 'Auto Fix', 'AI-powered automated fixes', 'substrate', 50, true),
  ('substrate.report', 'Compliance Report', 'Full compliance and analysis reports', 'substrate', 25, true),
  ('substrate.assist', 'Assist Agent', 'Real-time assistance and interaction', 'substrate', 200, true),
  ('substrate.tts', 'Text to Speech', 'TTS audio generation', 'substrate', 200, true),
  ('substrate.recommend', 'Recommendations', 'AI improvement suggestions', 'substrate', 100, true),
  ('substrate.brain', 'Brain Access', 'Memory and knowledge operations', 'substrate', 1000, true),
  ('substrate.vision', 'Vision Access', 'Observability and monitoring', 'substrate', 500, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_active = true;

-- 3. Add a legacy_code column to track original codes for migration purposes
ALTER TABLE public.access_products 
ADD COLUMN IF NOT EXISTS legacy_code text;

-- 4. Mark old codes with their legacy mapping
UPDATE public.access_products SET legacy_code = 'scan' WHERE code = 'scan';
UPDATE public.access_products SET legacy_code = 'fix' WHERE code = 'fix';
UPDATE public.access_products SET legacy_code = 'badge' WHERE code = 'badge';
UPDATE public.access_products SET legacy_code = 'report' WHERE code = 'report';
UPDATE public.access_products SET legacy_code = 'assist' WHERE code = 'assist';
UPDATE public.access_products SET legacy_code = 'alt_text' WHERE code = 'alt_text';
UPDATE public.access_products SET legacy_code = 'tts' WHERE code = 'tts';
UPDATE public.access_products SET legacy_code = 'recommendations' WHERE code = 'recommendations';

-- 5. Soft-deprecate legacy products (keep for backwards compat but mark inactive)
UPDATE public.access_products 
SET is_active = false 
WHERE code IN ('badge', 'alt_text') 
  AND legacy_code IS NOT NULL;

-- 6. Update access_usage to use new product codes for future tracking
-- This preserves historical data while enabling new codes
COMMENT ON COLUMN public.access_usage.product_code IS 'Product code - use substrate.* format for new entries. Legacy codes (scan, fix, etc.) are mapped automatically.';

-- 7. Add index for faster product lookups by category
CREATE INDEX IF NOT EXISTS idx_access_products_category ON public.access_products(category) WHERE is_active = true;