ALTER TABLE public.discoveries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'discovered' CHECK (status IN ('discovered', 'promoted', 'registry', 'showroom', 'junkyard', 'retired'));

ALTER TABLE public.discoveries ADD COLUMN IF NOT EXISTS is_crown_jewel BOOLEAN DEFAULT FALSE;

ALTER TABLE public.discoveries ADD COLUMN IF NOT EXISTS vertical TEXT DEFAULT 'primary';

ALTER TABLE public.discoveries ADD COLUMN IF NOT EXISTS crown_jewel_capabilities JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_discoveries_status ON public.discoveries (status);
CREATE INDEX IF NOT EXISTS idx_discoveries_vertical ON public.discoveries (vertical);
CREATE INDEX IF NOT EXISTS idx_discoveries_crown_jewel ON public.discoveries (is_crown_jewel) WHERE is_crown_jewel = TRUE;