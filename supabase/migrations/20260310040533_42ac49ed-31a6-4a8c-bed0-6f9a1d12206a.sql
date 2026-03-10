
ALTER TABLE public.foundry_inventory
  ADD COLUMN IF NOT EXISTS pricing_evidence jsonb;

ALTER TABLE public.pipeline_vault
  ADD COLUMN IF NOT EXISTS pricing_evidence jsonb;

ALTER TABLE public.vault_promotions
  ADD COLUMN IF NOT EXISTS pricing_evidence jsonb;
