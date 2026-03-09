
-- ═══════════════════════════════════════════════════════════════
-- Advanced Analytics: Cohort Retention, Churn Scoring, Journey Flows
-- ═══════════════════════════════════════════════════════════════

-- 1. Cohort Retention Analysis
-- Groups users by signup week, tracks D1/D7/D30 return rates
CREATE OR REPLACE FUNCTION public.get_cohort_retention(
  p_cohort_window_days integer DEFAULT 90,
  p_granularity text DEFAULT 'week'
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH cohorts AS (
    -- Assign each fingerprint to a cohort based on first visit
    SELECT
      fingerprint_hash,
      MIN(started_at) AS first_seen,
      CASE
        WHEN p_granularity = 'day' THEN (MIN(started_at)::date)::text
        WHEN p_granularity = 'month' THEN to_char(MIN(started_at), 'YYYY-MM')
        ELSE to_char(MIN(started_at), 'IYYY-"W"IW')
      END AS cohort_label
    FROM site_sessions
    WHERE started_at >= (now() - (p_cohort_window_days || ' days')::interval)
    GROUP BY fingerprint_hash
  ),
  retention AS (
    SELECT
      c.cohort_label,
      COUNT(DISTINCT c.fingerprint_hash) AS cohort_size,
      COUNT(DISTINCT CASE
        WHEN s.started_at >= c.first_seen + interval '1 day'
         AND s.started_at < c.first_seen + interval '2 days'
        THEN s.fingerprint_hash END) AS d1,
      COUNT(DISTINCT CASE
        WHEN s.started_at >= c.first_seen + interval '7 days'
         AND s.started_at < c.first_seen + interval '8 days'
        THEN s.fingerprint_hash END) AS d7,
      COUNT(DISTINCT CASE
        WHEN s.started_at >= c.first_seen + interval '14 days'
         AND s.started_at < c.first_seen + interval '15 days'
        THEN s.fingerprint_hash END) AS d14,
      COUNT(DISTINCT CASE
        WHEN s.started_at >= c.first_seen + interval '30 days'
         AND s.started_at < c.first_seen + interval '31 days'
        THEN s.fingerprint_hash END) AS d30
    FROM cohorts c
    LEFT JOIN site_sessions s ON s.fingerprint_hash = c.fingerprint_hash
    GROUP BY c.cohort_label
    ORDER BY c.cohort_label DESC
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'cohort', cohort_label,
      'size', cohort_size,
      'd1', d1,
      'd7', d7,
      'd14', d14,
      'd30', d30,
      'd1_pct', CASE WHEN cohort_size > 0 THEN ROUND((d1::numeric / cohort_size) * 100, 1) ELSE 0 END,
      'd7_pct', CASE WHEN cohort_size > 0 THEN ROUND((d7::numeric / cohort_size) * 100, 1) ELSE 0 END,
      'd14_pct', CASE WHEN cohort_size > 0 THEN ROUND((d14::numeric / cohort_size) * 100, 1) ELSE 0 END,
      'd30_pct', CASE WHEN cohort_size > 0 THEN ROUND((d30::numeric / cohort_size) * 100, 1) ELSE 0 END
    )
  ) INTO result
  FROM retention;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- 2. Churn Risk Scoring
-- Scores each visitor fingerprint 0-100 based on engagement decay
CREATE OR REPLACE FUNCTION public.get_churn_risk_scores(p_limit integer DEFAULT 50)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH visitor_stats AS (
    SELECT
      s.fingerprint_hash,
      COUNT(*) AS total_sessions,
      MAX(s.started_at) AS last_visit,
      MIN(s.started_at) AS first_visit,
      AVG(COALESCE(s.page_count, 1)) AS avg_pages,
      AVG(COALESCE(s.total_duration_ms, 0)) AS avg_duration_ms,
      COUNT(*) FILTER (WHERE s.is_bounce = true) AS bounce_sessions,
      -- Recent activity: sessions in last 7 days vs previous 7 days
      COUNT(*) FILTER (WHERE s.started_at >= now() - interval '7 days') AS recent_7d,
      COUNT(*) FILTER (WHERE s.started_at >= now() - interval '14 days' AND s.started_at < now() - interval '7 days') AS prev_7d
    FROM site_sessions s
    WHERE s.started_at >= now() - interval '90 days'
    GROUP BY s.fingerprint_hash
    HAVING COUNT(*) >= 2  -- Need at least 2 sessions to score
  ),
  scored AS (
    SELECT
      fingerprint_hash,
      total_sessions,
      last_visit,
      first_visit,
      avg_pages,
      avg_duration_ms,
      bounce_sessions,
      recent_7d,
      prev_7d,
      -- Churn score: higher = more likely to churn
      LEAST(100, GREATEST(0,
        -- Days since last visit (0-40 points)
        LEAST(40, EXTRACT(EPOCH FROM (now() - last_visit)) / 86400 * 2)
        -- Declining frequency (0-30 points)
        + CASE WHEN prev_7d > 0 AND recent_7d < prev_7d
            THEN LEAST(30, (1 - (recent_7d::numeric / prev_7d)) * 30)
            WHEN recent_7d = 0 AND prev_7d > 0 THEN 30
            ELSE 0 END
        -- High bounce rate (0-15 points)
        + CASE WHEN total_sessions > 0
            THEN (bounce_sessions::numeric / total_sessions) * 15
            ELSE 0 END
        -- Low engagement depth (0-15 points)
        + CASE WHEN avg_pages < 2 THEN 15
               WHEN avg_pages < 3 THEN 8
               ELSE 0 END
      ))::integer AS churn_score
    FROM visitor_stats
  )
  SELECT jsonb_build_object(
    'visitors', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'fingerprint', fingerprint_hash,
          'churn_score', churn_score,
          'risk_level', CASE
            WHEN churn_score >= 70 THEN 'critical'
            WHEN churn_score >= 40 THEN 'warning'
            ELSE 'healthy'
          END,
          'total_sessions', total_sessions,
          'last_visit', last_visit,
          'days_since_visit', EXTRACT(EPOCH FROM (now() - last_visit))::integer / 86400,
          'avg_pages', ROUND(avg_pages::numeric, 1),
          'avg_duration_ms', ROUND(avg_duration_ms::numeric),
          'recent_7d', recent_7d,
          'prev_7d', prev_7d
        )
        ORDER BY churn_score DESC
      )
      FROM scored
      LIMIT p_limit
    ),
    'summary', (
      SELECT jsonb_build_object(
        'total_scored', COUNT(*),
        'critical_count', COUNT(*) FILTER (WHERE churn_score >= 70),
        'warning_count', COUNT(*) FILTER (WHERE churn_score >= 40 AND churn_score < 70),
        'healthy_count', COUNT(*) FILTER (WHERE churn_score < 40),
        'avg_score', ROUND(AVG(churn_score)::numeric, 1)
      )
      FROM scored
    )
  ) INTO result;

  RETURN COALESCE(result, '{"visitors":[],"summary":{}}'::jsonb);
END;
$$;

-- 3. Enhanced Journey Flow Analysis
-- Shows page-to-page transition frequencies for Sankey-style visualization
CREATE OR REPLACE FUNCTION public.get_journey_flows(
  p_start_date timestamptz DEFAULT now() - interval '30 days',
  p_min_count integer DEFAULT 2
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH ordered_pages AS (
    SELECT
      session_id,
      page_path,
      created_at,
      LAG(page_path) OVER (PARTITION BY session_id ORDER BY created_at) AS prev_page,
      ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at) AS step_num
    FROM site_page_views
    WHERE created_at >= p_start_date
  ),
  transitions AS (
    SELECT
      prev_page AS from_page,
      page_path AS to_page,
      COUNT(*) AS transition_count,
      COUNT(DISTINCT session_id) AS unique_sessions
    FROM ordered_pages
    WHERE prev_page IS NOT NULL
      AND prev_page != page_path
    GROUP BY prev_page, page_path
    HAVING COUNT(*) >= p_min_count
  ),
  entry_pages AS (
    SELECT
      page_path AS page,
      COUNT(*) AS entries
    FROM ordered_pages
    WHERE step_num = 1
    GROUP BY page_path
    ORDER BY entries DESC
    LIMIT 10
  ),
  exit_pages AS (
    SELECT
      s.last_page AS page,
      COUNT(*) AS exits
    FROM site_sessions s
    WHERE s.started_at >= p_start_date
      AND s.last_page IS NOT NULL
    GROUP BY s.last_page
    ORDER BY exits DESC
    LIMIT 10
  ),
  drop_offs AS (
    -- Pages where users leave without visiting another page
    SELECT
      page_path,
      COUNT(*) AS total_views,
      COUNT(*) FILTER (WHERE NOT EXISTS (
        SELECT 1 FROM site_page_views p2
        WHERE p2.session_id = ordered_pages.session_id
          AND p2.created_at > ordered_pages.created_at
      )) AS drop_count
    FROM ordered_pages
    GROUP BY page_path
    HAVING COUNT(*) >= 5
  )
  SELECT jsonb_build_object(
    'transitions', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'from', from_page,
          'to', to_page,
          'count', transition_count,
          'sessions', unique_sessions
        )
        ORDER BY transition_count DESC
      )
      FROM transitions
      LIMIT 50
    ), '[]'::jsonb),
    'entry_pages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('page', page, 'entries', entries))
      FROM entry_pages
    ), '[]'::jsonb),
    'exit_pages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('page', page, 'exits', exits))
      FROM exit_pages
    ), '[]'::jsonb),
    'drop_offs', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'page', page_path,
          'views', total_views,
          'drops', drop_count,
          'drop_rate', ROUND((drop_count::numeric / GREATEST(total_views, 1)) * 100, 1)
        )
        ORDER BY drop_count DESC
      )
      FROM drop_offs
      LIMIT 15
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

-- 4. Real-time Pulse (live visitor approximation)
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
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

-- 5. Feature Adoption Heatmap (from analytics_events)
CREATE OR REPLACE FUNCTION public.get_feature_adoption(
  p_start_date timestamptz DEFAULT now() - interval '30 days'
)
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
    'features', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'feature', event_type,
          'category', category,
          'total_uses', total,
          'unique_users', users,
          'unique_sessions', sessions,
          'avg_per_user', CASE WHEN users > 0 THEN ROUND((total::numeric / users), 1) ELSE 0 END,
          'trend_7d', recent_7d,
          'trend_prev_7d', prev_7d
        )
        ORDER BY total DESC
      )
      FROM (
        SELECT
          event_type,
          category,
          COUNT(*) AS total,
          COUNT(DISTINCT COALESCE(user_id, session_id)) AS users,
          COUNT(DISTINCT session_id) AS sessions,
          COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') AS recent_7d,
          COUNT(*) FILTER (WHERE created_at >= now() - interval '14 days' AND created_at < now() - interval '7 days') AS prev_7d
        FROM analytics_events
        WHERE created_at >= p_start_date
        GROUP BY event_type, category
        HAVING COUNT(*) >= 2
      ) t
      LIMIT 30
    ), '[]'::jsonb),
    'category_totals', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('category', category, 'count', cnt))
      FROM (
        SELECT category, COUNT(*) AS cnt
        FROM analytics_events
        WHERE created_at >= p_start_date
        GROUP BY category
        ORDER BY cnt DESC
      ) t
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
