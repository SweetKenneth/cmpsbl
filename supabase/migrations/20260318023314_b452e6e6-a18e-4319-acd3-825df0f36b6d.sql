-- 1. Replace get_site_analytics_aggregated to include ALL missing sections:
--    os_breakdown, screens, timezones, languages, utm_sources, connection_types
--    ALSO fix referrers field key from 'source' to 'domain' to match frontend mapping
CREATE OR REPLACE FUNCTION public.get_site_analytics_aggregated(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
        'bounce_count', COUNT(*) FILTER (WHERE s.is_bounce = true),
        'bounce_rate', CASE WHEN COUNT(*) > 0 
          THEN ROUND((COUNT(*) FILTER (WHERE s.is_bounce = true))::numeric / COUNT(*)::numeric * 100, 1)
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
          SELECT COUNT(*) FROM (
            SELECT fingerprint_hash FROM site_sessions
            WHERE started_at >= p_start_date AND started_at <= p_end_date
              AND fingerprint_hash IS NOT NULL
              AND NOT (fingerprint_hash = ANY(v_excluded_fps))
            GROUP BY fingerprint_hash HAVING COUNT(*) = 1
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
    'referrers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('domain', ref_sub.domain, 'count', ref_sub.cnt) ORDER BY ref_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.referrer_domain, 'Direct') AS domain, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY COALESCE(s.referrer_domain, 'Direct')
        ORDER BY COUNT(*) DESC
        LIMIT 15
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
        SELECT COALESCE(s.browser, 'unknown') AS browser, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY COALESCE(s.browser, 'unknown')
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) br_sub
    ),
    'os_breakdown', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', os_sub.os_name, 'count', os_sub.cnt) ORDER BY os_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.os, 'Unknown') AS os_name, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY COALESCE(s.os, 'Unknown')
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) os_sub
    ),
    'screens', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('size', scr_sub.resolution, 'count', scr_sub.cnt) ORDER BY scr_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT (COALESCE(s.screen_width, 0)::text || 'x' || COALESCE(s.screen_height, 0)::text) AS resolution, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
          AND s.screen_width IS NOT NULL AND s.screen_width > 0
        GROUP BY s.screen_width, s.screen_height
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) scr_sub
    ),
    'timezones', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('tz', tz_sub.tz, 'count', tz_sub.cnt) ORDER BY tz_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.timezone, 'Unknown') AS tz, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
          AND s.timezone IS NOT NULL AND s.timezone != ''
        GROUP BY s.timezone
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) tz_sub
    ),
    'languages', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('lang', lang_sub.lang, 'count', lang_sub.cnt) ORDER BY lang_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.language, 'Unknown') AS lang, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
          AND s.language IS NOT NULL AND s.language != ''
        GROUP BY s.language
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) lang_sub
    ),
    'utm_sources', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('source', utm_sub.source, 'count', utm_sub.cnt) ORDER BY utm_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(s.utm_source, 'none') AS source, COUNT(*) AS cnt
        FROM site_sessions s
        WHERE s.started_at >= p_start_date AND s.started_at <= p_end_date
          AND s.fingerprint_hash IS NOT NULL
          AND NOT (s.fingerprint_hash = ANY(v_excluded_fps))
          AND s.utm_source IS NOT NULL AND s.utm_source != ''
        GROUP BY s.utm_source
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) utm_sub
    ),
    'connection_types', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('type', ct_sub.conn_type, 'count', ct_sub.cnt) ORDER BY ct_sub.cnt DESC), '[]'::jsonb)
      FROM (
        SELECT COALESCE(pv.connection_type, 'unknown') AS conn_type, COUNT(DISTINCT pv.session_id) AS cnt
        FROM site_page_views pv
        WHERE pv.created_at >= p_start_date AND pv.created_at <= p_end_date
          AND (pv.fingerprint_hash IS NULL OR NOT (pv.fingerprint_hash = ANY(v_excluded_fps)))
          AND pv.connection_type IS NOT NULL AND pv.connection_type != ''
        GROUP BY pv.connection_type
        ORDER BY COUNT(DISTINCT pv.session_id) DESC
        LIMIT 10
      ) ct_sub
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

-- 2. Add DELETE policy for daily_backups so pruning actually works
CREATE POLICY "Authenticated users can delete backups"
  ON public.daily_backups
  FOR DELETE
  TO authenticated
  USING (true);