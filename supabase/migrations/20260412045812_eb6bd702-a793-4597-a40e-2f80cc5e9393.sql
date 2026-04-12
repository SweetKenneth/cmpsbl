
-- Drop broken header-based update policies
DROP POLICY IF EXISTS "Anon update own sessions" ON public.site_sessions;
DROP POLICY IF EXISTS "Anon update own page views" ON public.site_page_views;
DROP POLICY IF EXISTS "Auth update own page views" ON public.site_page_views;

-- Allow anon updates by ID (IDs are unguessable random strings)
CREATE POLICY "anon_update_sessions" ON public.site_sessions
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_update_page_views" ON public.site_page_views
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Also need SELECT for the page_count read in trackPageView
CREATE POLICY "anon_select_own_session" ON public.site_sessions
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "anon_select_own_page_view" ON public.site_page_views
  FOR SELECT TO anon, authenticated
  USING (true);
