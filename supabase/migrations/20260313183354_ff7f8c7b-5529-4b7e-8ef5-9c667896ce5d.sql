-- Allow anonymous users to UPDATE site_page_views (heartbeat duration/scroll updates)
CREATE POLICY "anon_update_page_views"
ON public.site_page_views
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anonymous users to UPDATE site_sessions (duration, page_count, bounce updates)
CREATE POLICY "anon_update_sessions"
ON public.site_sessions
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
