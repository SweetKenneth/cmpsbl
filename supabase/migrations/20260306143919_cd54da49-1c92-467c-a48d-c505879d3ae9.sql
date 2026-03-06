
ALTER TABLE public.foundry_inventory DROP CONSTRAINT foundry_inventory_public_tier_check;
ALTER TABLE public.foundry_inventory ADD CONSTRAINT foundry_inventory_public_tier_check CHECK (public_tier = ANY (ARRAY['Raw', 'Mint', 'Prime', 'Relic', 'Mythic', 'Apex']));

ALTER TABLE public.foundry_inventory DROP CONSTRAINT foundry_inventory_score_check;
ALTER TABLE public.foundry_inventory ADD CONSTRAINT foundry_inventory_score_check CHECK (score >= 0);
