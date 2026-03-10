
-- Add commercialization/pricing columns to foundry_inventory
ALTER TABLE public.foundry_inventory
  ADD COLUMN IF NOT EXISTS recommended_resale_price numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS indie_price numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS standard_price numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS enterprise_price numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estimated_market_range_low numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS estimated_market_range_high numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pricing_confidence numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS market_category text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comparable_summary text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS suggested_marketplaces text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS commercialization_notes text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pricing_last_updated_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pricing_source text DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS pricing_source_version text DEFAULT '1.0.0';
