
ALTER TABLE public.discoveries
ADD COLUMN IF NOT EXISTS mutation_source TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS generation INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_discoveries_mutation_source ON public.discoveries (mutation_source) WHERE mutation_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_discoveries_generation ON public.discoveries (generation) WHERE generation > 0;

COMMENT ON COLUMN public.discoveries.mutation_source IS 'ID of the parent discovery this was mutated from. NULL for original template discoveries.';
COMMENT ON COLUMN public.discoveries.generation IS 'Number of mutation cycles away from original template. 0 = original, 1 = first mutation, etc.';
