
DROP FUNCTION IF EXISTS public.get_site_analytics_aggregated(timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.get_site_analytics_aggregated(
  p_start_date timestamptz,
  p_end_date timestamptz
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_excluded_fps text[];
  v_result jsonb;
  v_max_session_ms numeric := 1800000;
BEGIN
  SELECT array_agg(DISTINCT fp) INTO v_excluded_fps
  FROM (
    SELECT value AS fp FROM site_analytics_exclusions WHERE exclusion_type = 'fingerprint'
    UNION
    SELECT fingerprint AS fp FROM analytics_excluded_fingerprints
  ) combined;
  
  v_excluded_fps := COALESCE(v_excluded_fps, ARRAY[]::text[]);

  SELECT jsonb_build_object(
    'core', (
      SELECT jsonb_build_object(
        'unique_visitors', COUNT(DISTINCT s.fingerprint_hash),
        'total_sessions', COUNT(*),
        'total_page_views', COALESCE(SUM(GREATEST(real_pv.cnt, 1)), 0),
        'avg_pages_per_session', ROUND(COALESCE(AVG(GREATEST(real_pv.cnt, 1))::numeric, 0), 1),
        'avg_pages_per_visitor', CASE WHEN COUNT(DISTINCT s.fingerprint_hash) > 0
          THEN ROUND(COALESCE(SUM(GREATEST(real_pv.cnt, 1)), 0)::numeric / COUNT(DISTINCT s.fingerprint_hash)::numeric, 1)
          ELSE 0 END,
        'avg_session_duration_ms', ROUND(COALESCE(AVG(
          CASE WHEN s.total_duration_ms > 0 
               THEN LEAST(s.total_duration_ms::numeric, v_max_session_ms) 
          END
        ), 0)),
        'bounce_count', COUNT(*) FILTER (WHERE real_pv.cnt <= 1),
        'bounce_rate', CASE WHEN COUNT(*) > 0 
          THEN ROUND((COUNT(*) FILTER (WHERE real_pv.cnt <= 1))::numeric / COUNT(*)::numeric * 100, 1)
          ELSE 0 END,
        'unique_fingerprints', COUNT(DISTINCT s.fingerprint_hash),
        'returning_visitors', (
          SELECT COUNT(*) FROM (
            SELECT fingerprint_hash FROM site_sessions
            WHERE started_at >= p_start_date AND started_at <= p_end_date
              AND fingerprint_hash IS NOT NULL
              AND NOT (fingerprint_hash = ANY(v_excluded_fps))
            GROUP BY fingerprint_hash HAVING COUNT(*) > 1
          ) ret_sub
        ),
        'new_visitors', (
          SELECT COUNT(DISTINCT fingerprint_hash) - COUNT(*) FROM (
            SELECT fingerprint_hash, COUNT(*) as cnt FROM site_sessions
            WHERE started_at >= p_start_date AND started_at <= p_end_date
              AND fingerprint_hash IS NOT NULL
              AND NOT (fingerprint_hash = ANY(v_excluded_fps))
            GROUP BY fingerprint_hash HAVING COUNT(*) > 1
          ) new_sub
        )
      )
      FROM site_sessions s
      LEFT JOIN LATERAL (
        SELECT COUNT(*) as cnt FROM site_page_views pv WHERE pv.session_id = s.id
      ) real_pv ON true
      WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
        AND s.fingerprint_hash IS NOT NULL
        AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
    ),
    'page_view_count', (
      SELECT COUNT(*)
      FROM site_page_views pv
      WHERE pv.created_at >= p_start_date AND pv.created_at <= p_end_date
        AND (pv.fingerprint_hash IS NULL OR NOT (pv.fingerprint_hash = ANY(v_excluded_fps)))
    ),
    'daily', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('day', daily_sub.day, 'sessions', daily_sub.sessions, 'views', daily_sub.views, 'visitors', daily_sub.visitors) ORDER BY daily_sub.day), '[]'::jsonb)
      FROM (
        SELECT 
          (s.started_at::date)::text AS day,
          COUNT(*) AS sessions,
          COALESCE(SUM(GREATEST(real_pv.cnt, 1)), 0) AS views,
          COUNT(DISTINCT s.fingerprint_hash) AS visitors
        FROM site_sessions s
        LEFT JOIN LATERAL (
          SELECT COUNT(*) as cnt FROM site_page_views pv WHERE pv.session_id = s.id
        ) real_pv ON true
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY s.started_at::date
      ) daily_sub
    ),
    'top_pages', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('path', pg_sub.path, 'views', pg_sub.views, 'avg_time', pg_sub.avg_time, 'avg_scroll', pg_sub.avg_scroll) ORDER BY pg_sub.views DESC), '[]'::jsonb)
      FROM (
        SELECT 
          pv.page_path AS path,
          COUNT(*) AS views,
          ROUND(COALESCE(AVG(
            CASE WHEN pv.time_on_page_ms > 0 
                 THEN LEAST(pv.time_on_page_ms::numeric, v_max_session_ms) 
            END
          ), 0)) AS avg_time,
          ROUND(COALESCE(AVG(pv.scroll_depth_pct)::numeric, 0)) AS avg_scroll
        FROM site_page_views pv
        WHERE pv.created_at >= p_start_date AND pv.created_at <= p_end_date
          AND (pv.fingerprint_hash IS NULL OR NOT (pv.fingerprint_hash = ANY(v_excluded_fps)))
        GROUP BY pv.page_path
        ORDER BY COUNT(*) DESC
        LIMIT 20
      ) pg_sub
    ),
    'top_referrers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('source', ref_sub.source, 'count', ref_sub.cnt) ORDER BY ref_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.referrer_domain, 'Direct') AS source, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY COALESCE(s.referrer_domain, 'Direct')
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) ref_sub
    ),
    'devices', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('type', dev_sub.device_type, 'count', dev_sub.cnt) ORDER BY dev_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.device_type, 'unknown') AS device_type, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY COALESCE(s.device_type, 'unknown')
      ) dev_sub
    ),
    'browsers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', br_sub.browser, 'count', br_sub.cnt) ORDER BY br_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.browser_name, 'unknown') AS browser, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY COALESCE(s.browser_name, 'unknown')
      ) br_sub
    ),
    'countries', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('country', co_sub.country, 'count', co_sub.cnt) ORDER BY co_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.country, 'Unknown') AS country, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY COALESCE(s.country, 'Unknown')
        ORDER BY COUNT(*) DESC
        LIMIT 15
      ) co_sub
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
