
CREATE OR REPLACE FUNCTION public.get_random_discoveries(min_score integer, max_count integer)
RETURNS TABLE(
  id text,
  name text,
  description text,
  cjpi numeric,
  category text,
  module_chain text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT d.id, d.name, d.description, d.cjpi, d.category, d.module_chain
  FROM public.discoveries d
  WHERE d.cjpi >= min_score
  ORDER BY random()
  LIMIT max_count;
$$;
