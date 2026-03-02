
-- Server-side aggregation for discoveries — bypasses PostgREST 1000-row limit
CREATE OR REPLACE FUNCTION public.get_discovery_stats()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM discoveries),
    'perfect_count', (SELECT count(*) FROM discoveries WHERE cjpi = 100),
    'avg_cjpi', (SELECT round(avg(cjpi)::numeric, 1) FROM discoveries),
    'tiers', (
      SELECT jsonb_object_agg(tier, cnt)
      FROM (SELECT tier, count(*) as cnt FROM discoveries GROUP BY tier) t
    ),
    'categories', (
      SELECT jsonb_agg(jsonb_build_object('category', category, 'count', cnt, 'avg_cjpi', avg_c))
      FROM (SELECT category, count(*) as cnt, round(avg(cjpi)::numeric, 1) as avg_c FROM discoveries GROUP BY category ORDER BY cnt DESC) c
    ),
    'module_freq', (
      SELECT jsonb_object_agg(module, cnt)
      FROM (
        SELECT m as module, count(*) as cnt
        FROM discoveries, unnest(module_chain) as m
        GROUP BY m ORDER BY cnt DESC LIMIT 20
      ) mf
    )
  );
$$;
