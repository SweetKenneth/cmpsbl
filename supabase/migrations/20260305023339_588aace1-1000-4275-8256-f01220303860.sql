
CREATE OR REPLACE FUNCTION public.get_site_analytics_aggregated(p_start_date timestamptz, p_end_date timestamptz DEFAULT now())
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_excluded_fps text[];
  v_result jsonb;
BEGIN
  -- Get excluded fingerprints
  SELECT array_agg(value) INTO v_excluded_fps
  FROM site_analytics_exclusions
  WHERE exclusion_type = 'fingerprint';
  
  v_excluded_fps := COALESCE(v_excluded_fps, ARRAY[]::text[]);

  SELECT jsonb_build_object(
    'core', (
      SELECT jsonb_build_object(
        'unique_visitors', COUNT(DISTINCT s.fingerprint_hash),
        'total_sessions', COUNT(*),
        'total_page_views', COALESCE(SUM(GREATEST(s.page_count, 1)), 0),
        'avg_pages_per_session', ROUND(COALESCE(AVG(GREATEST(s.page_count, 1))::numeric, 0), 1),
        'avg_session_duration_ms', ROUND(COALESCE(AVG(NULLIF(s.total_duration_ms, 0))::numeric, 0)),
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
          ) r
        ),
        'new_visitors', (
          SELECT COUNT(DISTINCT fingerprint_hash) - COUNT(*) FROM (
            SELECT fingerprint_hash, COUNT(*) as cnt FROM site_sessions
            WHERE started_at >= p_start_date AND started_at <= p_end_date
              AND fingerprint_hash IS NOT NULL
              AND NOT (fingerprint_hash = ANY(v_excluded_fps))
            GROUP BY fingerprint_hash HAVING COUNT(*) > 1
          ) r2
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
      SELECT COALESCE(jsonb_agg(row_to_json(d) ORDER BY d.day), '[]'::jsonb)
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
      ) d
    ),
    'top_pages', (
      SELECT COALESCE(jsonb_agg(row_to_json(p) ORDER BY p.views DESC), '[]'::jsonb)
      FROM (
        SELECT 
          pv.page_path AS path,
          COUNT(*) AS views,
          ROUND(COALESCE(AVG(NULLIF(pv.time_on_page_ms, 0))::numeric, 0)) AS avg_time,
          ROUND(COALESCE(AVG(pv.scroll_depth_pct)::numeric, 0)) AS avg_scroll
        FROM site_page_views pv
        WHERE pv.created_at >= p_start_date AND pv.created_at <= p_end_date
          AND (pv.fingerprint_hash IS NULL OR NOT (pv.fingerprint_hash = ANY(v_excluded_fps)))
        GROUP BY pv.page_path
        ORDER BY COUNT(*) DESC
        LIMIT 20
      ) p
    ),
    'referrers', (
      SELECT COALESCE(jsonb_agg(row_to_json(r) ORDER BY r.count DESC), '[]'::jsonb)
      FROM (
        SELECT referrer_domain AS domain, COUNT(*) AS count
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND referrer_domain IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY referrer_domain
        ORDER BY COUNT(*) DESC
        LIMIT 10
      ) r
    ),
    'devices', (
      SELECT COALESCE(jsonb_agg(row_to_json(d)), '[]'::jsonb)
      FROM (
        SELECT COALESCE(device_type, 'unknown') AS type, COUNT(*) AS count
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY device_type ORDER BY COUNT(*) DESC
      ) d
    ),
    'browsers', (
      SELECT COALESCE(jsonb_agg(row_to_json(b)), '[]'::jsonb)
      FROM (
        SELECT browser AS name, COUNT(*) AS count
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND browser IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY browser ORDER BY COUNT(*) DESC
      ) b
    ),
    'os_breakdown', (
      SELECT COALESCE(jsonb_agg(row_to_json(o)), '[]'::jsonb)
      FROM (
        SELECT os AS name, COUNT(*) AS count
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND os IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY os ORDER BY COUNT(*) DESC
      ) o
    ),
    'screens', (
      SELECT COALESCE(jsonb_agg(row_to_json(sc)), '[]'::jsonb)
      FROM (
        SELECT (screen_width || '×' || screen_height) AS size, COUNT(*) AS count
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND screen_width IS NOT NULL AND screen_height IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY screen_width, screen_height ORDER BY COUNT(*) DESC
        LIMIT 10
      ) sc
    ),
    'timezones', (
      SELECT COALESCE(jsonb_agg(row_to_json(tz)), '[]'::jsonb)
      FROM (
        SELECT timezone AS tz, COUNT(*) AS count
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND timezone IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY timezone ORDER BY COUNT(*) DESC
        LIMIT 10
      ) tz
    ),
    'languages', (
      SELECT COALESCE(jsonb_agg(row_to_json(l)), '[]'::jsonb)
      FROM (
        SELECT language AS lang, COUNT(*) AS count
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND language IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY language ORDER BY COUNT(*) DESC
        LIMIT 10
      ) l
    ),
    'utm_sources', (
      SELECT COALESCE(jsonb_agg(row_to_json(u)), '[]'::jsonb)
      FROM (
        SELECT utm_source AS source, COUNT(*) AS count
        FROM site_sessions
        WHERE started_at >= p_start_date AND started_at <= p_end_date
          AND utm_source IS NOT NULL
          AND NOT (fingerprint_hash = ANY(v_excluded_fps))
        GROUP BY utm_source ORDER BY COUNT(*) DESC
        LIMIT 10
      ) u
    ),
    'connection_types', (
      SELECT COALESCE(jsonb_agg(row_to_json(c)), '[]'::jsonb)
      FROM (
        SELECT connection_type AS type, COUNT(*) AS count
        FROM site_page_views
        WHERE created_at >= p_start_date AND created_at <= p_end_date
          AND connection_type IS NOT NULL
          AND (fingerprint_hash IS NULL OR NOT (fingerprint_hash = ANY(v_excluded_fps)))
        GROUP BY connection_type ORDER BY COUNT(*) DESC
      ) c
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
