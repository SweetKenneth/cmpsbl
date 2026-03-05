-- Add unique constraint to prevent duplicate artifacts per user
ALTER TABLE public.foundry_inventory 
ADD CONSTRAINT foundry_inventory_user_artifact_unique 
UNIQUE (user_id, artifact_id);

-- Add index on (user_id, obtained_at desc) for vault queries
CREATE INDEX IF NOT EXISTS idx_foundry_inventory_user_obtained 
ON public.foundry_inventory(user_id, obtained_at DESC);

-- Fix get_random_discoveries to support max_score parameter
CREATE OR REPLACE FUNCTION public.get_random_discoveries(min_score integer, max_count integer, max_score integer DEFAULT 100)
RETURNS TABLE(id text, name text, description text, cjpi numeric, category text, module_chain text[])
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT d.id, d.name, d.description, d.cjpi, d.category, d.module_chain
  FROM public.discoveries d
  WHERE d.cjpi >= min_score AND d.cjpi <= max_score
  ORDER BY random()
  LIMIT max_count;
$function$;