
-- Fix 1: Add missing UPDATE policy for site_page_views (tracker needs to update time_on_page_ms, scroll_depth_pct)
CREATE POLICY "anon_update_page_views" ON public.site_page_views
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "auth_update_page_views" ON public.site_page_views
  FOR UPDATE TO authenticated USING (true)
  WITH CHECK (true);

-- Fix 2: Allow authenticated users to read analytics data (dashboard access)
-- Currently only admin can SELECT, but the /os dashboard is already auth-gated
CREATE POLICY "authenticated_read_page_views" ON public.site_page_views
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_sessions" ON public.site_sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_exclusions" ON public.site_analytics_exclusions
  FOR SELECT TO authenticated USING (true);
