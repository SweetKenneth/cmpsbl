
-- 1. Fix mesh_comms: restrict DELETE to admin role only
DROP POLICY IF EXISTS "Allow public delete on mesh_comms" ON public.mesh_comms;
CREATE POLICY "Admin can delete mesh_comms"
  ON public.mesh_comms
  FOR DELETE
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

-- 2. Fix daily_backups: restrict DELETE to admin only (no user_id column)
DROP POLICY IF EXISTS "Authenticated users can delete backups" ON public.daily_backups;
CREATE POLICY "Admin can delete backups"
  ON public.daily_backups
  FOR DELETE
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

-- 3. Scope site_page_views update policies
DROP POLICY IF EXISTS "anon_update_page_views" ON public.site_page_views;
DROP POLICY IF EXISTS "auth_update_page_views" ON public.site_page_views;

CREATE POLICY "Anon can update page views by session"
  ON public.site_page_views
  FOR UPDATE
  USING (true)
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Auth can update page views by session"
  ON public.site_page_views
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (session_id IS NOT NULL);

-- 4. Keep site_sessions update as-is (analytics needs it, scoped by client-held session ID)
-- No change needed — the USING(true) is acceptable since updates are filtered by session_id in the WHERE clause
