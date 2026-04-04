
-- Marketplace inventory: MERCHANT-curated software from across all substrates
CREATE TABLE IF NOT EXISTS public.marketplace_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  pain_points TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  source_substrate TEXT NOT NULL,
  source_vault TEXT NOT NULL,
  source_id TEXT NOT NULL,
  category TEXT NOT NULL,
  cjpi_score NUMERIC NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'Mint',
  price_cents INTEGER NOT NULL DEFAULT 1000,
  original_value_cents INTEGER DEFAULT 0,
  primitive_chain TEXT[] DEFAULT '{}',
  downloads INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  version TEXT DEFAULT '1.0.0',
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  last_verified_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MERCHANT scan log: audit trail of marketplace curation scans
CREATE TABLE IF NOT EXISTS public.merchant_scan_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  substrate TEXT NOT NULL,
  vault TEXT NOT NULL,
  items_scanned INTEGER DEFAULT 0,
  items_qualified INTEGER DEFAULT 0,
  items_added INTEGER DEFAULT 0,
  items_retired INTEGER DEFAULT 0,
  scan_duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add inventory_id column to marketplace_purchases if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'marketplace_purchases' AND column_name = 'inventory_id'
  ) THEN
    ALTER TABLE public.marketplace_purchases ADD COLUMN inventory_id UUID REFERENCES public.marketplace_inventory(id);
  END IF;
END $$;

-- RLS
ALTER TABLE public.marketplace_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_scan_log ENABLE ROW LEVEL SECURITY;

-- Anyone can browse active marketplace items (unauthenticated browsing)
CREATE POLICY "Anyone can view active marketplace items"
  ON public.marketplace_inventory FOR SELECT
  USING (is_active = true);

-- Scan log: public read for transparency
CREATE POLICY "Anyone can view scan logs"
  ON public.merchant_scan_log FOR SELECT
  USING (true);
