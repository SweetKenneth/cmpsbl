-- Drop old overloads first
DROP FUNCTION IF EXISTS public.get_random_discoveries(integer, integer);
DROP FUNCTION IF EXISTS public.get_random_discoveries(integer, integer, integer);

-- Recreate with max_score support and full column set
CREATE FUNCTION public.get_random_discoveries(
  min_score integer,
  max_count integer,
  max_score integer DEFAULT 100
)
RETURNS TABLE(
  id text,
  name text,
  description text,
  cjpi numeric,
  category text,
  module_chain text[],
  pipeline_fingerprint text,
  pipeline_steps jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT d.id, d.name, d.description, d.cjpi, d.category, d.module_chain,
         d.pipeline_fingerprint, d.pipeline_steps
  FROM public.discoveries d
  WHERE d.cjpi >= min_score AND d.cjpi <= max_score
  ORDER BY random()
  LIMIT max_count;
$$;

-- Create increment_discovery_count RPC
CREATE OR REPLACE FUNCTION public.increment_discovery_count(p_discovery_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.discoveries
  SET discovery_count = COALESCE(discovery_count, 0) + 1,
      last_discovered_at = now()
  WHERE id = p_discovery_id;
$$;