
-- Add pipeline_steps JSONB column to discoveries
ALTER TABLE public.discoveries ADD COLUMN IF NOT EXISTS pipeline_steps JSONB;

-- Add pipeline_steps JSONB column to foundry_inventory
ALTER TABLE public.foundry_inventory ADD COLUMN IF NOT EXISTS pipeline_steps JSONB;

-- Backfill existing discoveries: derive pipeline_steps from module_chain
UPDATE public.discoveries
SET pipeline_steps = (
  SELECT jsonb_agg(jsonb_build_object('module', m, 'capability', 'default'))
  FROM unnest(module_chain) AS m
)
WHERE pipeline_steps IS NULL AND module_chain IS NOT NULL;

-- Index for pipeline_steps queries
CREATE INDEX IF NOT EXISTS idx_discoveries_pipeline_steps ON public.discoveries USING gin (pipeline_steps);
