
-- Update get_realtime_pulse to include per-page average time
CREATE OR REPLACE FUNCTION public.get_realtime_pulse()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'active_5min', (
      SELECT COUNT(DISTINCT fingerprint_hash)
      FROM site_sessions
      WHERE ended_at >= now() - interval '5 minutes'
    ),
    'active_15min', (
      SELECT COUNT(DISTINCT fingerprint_hash)
      FROM site_sessions
      WHERE ended_at >= now() - interval '15 minutes'
    ),
    'active_1hr', (
      SELECT COUNT(DISTINCT fingerprint_hash)
      FROM site_sessions
      WHERE ended_at >= now() - interval '1 hour'
    ),
    'sessions_today', (
      SELECT COUNT(*)
      FROM site_sessions
      WHERE started_at >= date_trunc('day', now())
    ),
    'pageviews_today', (
      SELECT COUNT(*)
      FROM site_page_views
      WHERE created_at >= date_trunc('day', now())
    ),
    'avg_pages_today', (
      SELECT ROUND(COALESCE(AVG(GREATEST(page_count, 1))::numeric, 0), 1)
      FROM site_sessions
      WHERE started_at >= date_trunc('day', now())
    ),
    'top_pages_now', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('page', page_path, 'count', cnt))
      FROM (
        SELECT page_path, COUNT(*) AS cnt
        FROM site_page_views
        WHERE created_at >= now() - interval '15 minutes'
        GROUP BY page_path
        ORDER BY cnt DESC
        LIMIT 5
      ) t
    ), '[]'::jsonb),
    'hourly_today', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('hour', hr, 'sessions', cnt) ORDER BY hr)
      FROM (
        SELECT EXTRACT(HOUR FROM started_at)::integer AS hr, COUNT(*) AS cnt
        FROM site_sessions
        WHERE started_at >= date_trunc('day', now())
        GROUP BY hr
      ) t
    ), '[]'::jsonb),
    'page_times', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'page', page_path,
        'avg_time_ms', avg_time,
        'views', view_count
      ) ORDER BY view_count DESC)
      FROM (
        SELECT 
          page_path,
          ROUND(AVG(CASE WHEN time_on_page_ms > 0 AND time_on_page_ms <= 1800000 THEN time_on_page_ms END)) AS avg_time,
          COUNT(*) AS view_count
        FROM site_page_views
        WHERE created_at >= now() - interval '24 hours'
          AND time_on_page_ms IS NOT NULL
          AND time_on_page_ms > 0
        GROUP BY page_path
        HAVING COUNT(*) >= 2
        ORDER BY COUNT(*) DESC
        LIMIT 15
      ) t
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
