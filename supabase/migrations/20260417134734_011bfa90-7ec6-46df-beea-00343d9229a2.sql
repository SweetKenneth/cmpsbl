-- Layer Inventory: additive schema changes to marketplace_inventory
ALTER TABLE public.marketplace_inventory
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'template'
    CHECK (kind IN ('layer','agent','engine','template','suite')),
  ADD COLUMN IF NOT EXISTS pillar text,
  ADD COLUMN IF NOT EXISTS origin_vertical text,
  ADD COLUMN IF NOT EXISTS suite_capabilities jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_mi_kind   ON public.marketplace_inventory(kind)   WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_mi_pillar ON public.marketplace_inventory(pillar) WHERE is_active;