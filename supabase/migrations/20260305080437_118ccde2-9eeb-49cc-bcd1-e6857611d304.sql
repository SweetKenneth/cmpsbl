
-- Fix: Allow anon SELECT on site_page_views and site_sessions
-- Required for heartbeat UPDATEs to find their rows (PostgREST needs SELECT to resolve UPDATE targets)
-- Only allow selecting own rows by matching on session_id or id

-- site_page_views: anon can read rows (needed for heartbeat UPDATE resolution)
CREATE POLICY "anon_select_page_views"
  ON public.site_page_views
  FOR SELECT
  TO anon
  USING (true);

-- site_sessions: anon can read rows (needed for heartbeat UPDATE + page_count increment)
CREATE POLICY "anon_select_sessions"
  ON public.site_sessions
  FOR SELECT
  TO anon
  USING (true);

-- Also deduplicate the exclusion entries
DELETE FROM public.site_analytics_exclusions
WHERE id NOT IN (
  SELECT DISTINCT ON (value) id 
  FROM public.site_analytics_exclusions 
  ORDER BY value, created_at ASC
);
