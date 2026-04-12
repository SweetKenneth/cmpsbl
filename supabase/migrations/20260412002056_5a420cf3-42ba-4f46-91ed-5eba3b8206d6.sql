-- Add auto-scoring and marketplace columns to compiled_products
ALTER TABLE public.compiled_products
  ADD COLUMN IF NOT EXISTS rarity_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uniqueness_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS usefulness_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS marketplace_price_cents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS marketplace_listed_at timestamptz,
  ADD COLUMN IF NOT EXISTS marketplace_slug text,
  ADD COLUMN IF NOT EXISTS rotation_priority integer DEFAULT 0;

-- Index for marketplace queries
CREATE INDEX IF NOT EXISTS idx_compiled_products_auto_score ON public.compiled_products (auto_score DESC);
CREATE INDEX IF NOT EXISTS idx_compiled_products_status_marketplace ON public.compiled_products (status, marketplace_listed_at DESC);
CREATE INDEX IF NOT EXISTS idx_compiled_products_slug ON public.compiled_products (marketplace_slug);