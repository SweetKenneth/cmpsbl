
CREATE OR REPLACE FUNCTION public.get_site_analytics_aggregated(p_start_date timestamp with time zone, p_end_date timestamp with time zone DEFAULT now())
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_excluded_fps text[];
  v_result jsonb;
  v_max_session_ms numeric := 1800000; -- 30 minutes cap
BEGIN
  -- Merge exclusions from BOTH tables
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
        'total_page_views', COALESCE(SUM(GREATEST(s.page_count, 1)), 0),
        'avg_pages_per_session', ROUND(COALESCE(AVG(GREATEST(s.page_count, 1))::numeric, 0), 1),
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
          COALESCE(SUM(GREATEST(s.page_count, 1)), 0) AS views,
          COUNT(DISTINCT s.fingerprint_hash) AS visitors
        FROM site_sessions s
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
        SELECT referrer_domain AS domain, COUNT(*) AS cnt
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND referrer_domain IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY referrer_domain
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) ref_sub
    ),
    'devices', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('type', dev_sub.dtype, 'count', dev_sub.cnt)), '[]'::jsonb)
      FROM (
        SELECT COALESCE(device_type, 'unknown') AS dtype, COUNT(*) AS cnt
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY device_type ORDER BY COUNT(*) DESC
      ) dev_sub
    ),
    'browsers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', br_sub.bname, 'count', br_sub.cnt)), '[]'::jsonb)
      FROM (
        SELECT browser AS bname, COUNT(*) AS cnt
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND browser IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY browser ORDER BY COUNT(*) DESC
      ) br_sub
    ),
    'os_breakdown', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('name', os_sub.oname, 'count', os_sub.cnt)), '[]'::jsonb)
      FROM (
        SELECT os AS oname, COUNT(*) AS cnt
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND os IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY os ORDER BY COUNT(*) DESC
      ) os_sub
    ),
    'screens', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('size', scr_sub.sz, 'count', scr_sub.cnt)), '[]'::jsonb)
      FROM (
        SELECT (screen_width || '×' || screen_height) AS sz, COUNT(*) AS cnt
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND screen_width IS NOT NULL AND screen_height IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY screen_width, screen_height ORDER BY COUNT(*) DESC
        LIMIT 10
      ) scr_sub
    ),
    'timezones', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('tz', tz_sub.tzname, 'count', tz_sub.cnt)), '[]'::jsonb)
      FROM (
        SELECT timezone AS tzname, COUNT(*) AS cnt
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND timezone IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY timezone ORDER BY COUNT(*) DESC
        LIMIT 10
      ) tz_sub
    ),
    'languages', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('lang', lang_sub.lname, 'count', lang_sub.cnt)), '[]'::jsonb)
      FROM (
        SELECT language AS lname, COUNT(*) AS cnt
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND language IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY language ORDER BY COUNT(*) DESC
        LIMIT 10
      ) lang_sub
    ),
    'utm_sources', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('source', utm_sub.src, 'count', utm_sub.cnt)), '[]'::jsonb)
      FROM (
        SELECT utm_source AS src, COUNT(*) AS cnt
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND utm_source IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY utm_source ORDER BY COUNT(*) DESC
        LIMIT 10
      ) utm_sub
    ),
    'connection_types', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('type', conn_sub.ctype, 'count', conn_sub.cnt)), '[]'::jsonb)
      FROM (
        SELECT connection_type AS ctype, COUNT(*) AS cnt
        FROM site_page_views
        WHERE created_at >= p_start_date AND created_at <= p_end_date
          AND connection_type IS NOT NULL
          AND (fingerprint_hash IS NULL OR NOT (fingerprint_hash = ANY(v_excluded_fps)))
        GROUP BY connection_type ORDER BY COUNT(*) DESC
      ) conn_sub
    )
  ) INTO v_result;

  RETURN v_result;
END;
$function$;
