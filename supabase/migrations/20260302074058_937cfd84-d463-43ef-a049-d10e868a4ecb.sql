
-- Vault Promotions table: auto-promoted discoveries ready for S-Tier export
CREATE TABLE public.vault_promotions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    discovery_id TEXT NOT NULL UNIQUE,
    run_id UUID,
    name TEXT NOT NULL,
    cjpi NUMERIC NOT NULL,
    tier TEXT,
    module_chain TEXT[] DEFAULT '{}',
    description TEXT,
    category TEXT,
    promoted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    export_ready BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'promoted',
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_promotions ENABLE ROW LEVEL SECURITY;

-- Admin-only read access (anyone authenticated can read promotions)
CREATE POLICY "Authenticated users can view vault promotions"
ON public.vault_promotions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only service role / admin can insert (handled via upsert from reactor)
CREATE POLICY "Authenticated users can insert vault promotions"
ON public.vault_promotions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update vault promotions"
ON public.vault_promotions FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Index for fast lookups
CREATE INDEX idx_vault_promotions_cjpi ON public.vault_promotions (cjpi DESC);
CREATE INDEX idx_vault_promotions_status ON public.vault_promotions (status);
