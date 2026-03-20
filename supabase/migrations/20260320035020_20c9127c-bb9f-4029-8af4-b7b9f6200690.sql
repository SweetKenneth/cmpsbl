
-- ============================================
-- 1. BACKUP SYSTEM: Governor-only access
-- ============================================

-- daily_backups: Remove open SELECT, restrict to governor
DROP POLICY IF EXISTS "Authenticated users can read backups" ON public.daily_backups;
CREATE POLICY "Governor can read backups"
  ON public.daily_backups
  FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'governor'));

-- Also update the DELETE we set earlier to governor instead of admin
DROP POLICY IF EXISTS "Admin can delete backups" ON public.daily_backups;
CREATE POLICY "Governor can delete backups"
  ON public.daily_backups
  FOR DELETE
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'governor'));

-- backup_exports: Restrict from admin+moderator to governor-only
DROP POLICY IF EXISTS "Admins can manage backup exports" ON public.backup_exports;
CREATE POLICY "Governor can manage backup exports"
  ON public.backup_exports
  FOR ALL
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'governor'))
  WITH CHECK (public.has_role_text(auth.uid(), 'governor'));

-- backup_import_log: Restrict to governor-only
DROP POLICY IF EXISTS "Admins can view import logs" ON public.backup_import_log;
CREATE POLICY "Governor can manage import logs"
  ON public.backup_import_log
  FOR ALL
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'governor'))
  WITH CHECK (public.has_role_text(auth.uid(), 'governor'));

-- ============================================
-- 2. BRAIN TABLES: Restrict to admin/governor
-- ============================================

-- brain_knowledge_edges: Remove public read, restrict to admin
DROP POLICY IF EXISTS "Public read edges" ON public.brain_knowledge_edges;
CREATE POLICY "Admin can read knowledge edges"
  ON public.brain_knowledge_edges
  FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

-- brain_cross_insights: Tighten the open SELECT policies
DROP POLICY IF EXISTS "Authenticated read brain_cross_insights" ON public.brain_cross_insights;
DROP POLICY IF EXISTS "Authenticated users can read cross insights" ON public.brain_cross_insights;
CREATE POLICY "Admin can read cross insights"
  ON public.brain_cross_insights
  FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

-- brain_reinforcement_log: Restrict open SELECT to admin
DROP POLICY IF EXISTS "Authenticated users can read reinforcement logs" ON public.brain_reinforcement_log;
CREATE POLICY "Admin can read reinforcement logs"
  ON public.brain_reinforcement_log
  FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

-- ============================================
-- 3. ANALYTICS: Restrict snapshot INSERT to admin
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can insert snapshots" ON public.analytics_snapshots;
CREATE POLICY "Admin can insert snapshots"
  ON public.analytics_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role_text(auth.uid(), 'admin'));

-- Also restrict snapshot reads to admin
DROP POLICY IF EXISTS "Authenticated users can read snapshots" ON public.analytics_snapshots;
CREATE POLICY "Admin can read snapshots"
  ON public.analytics_snapshots
  FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

-- ============================================
-- 4. MESH_COMMS: Restrict INSERT to admin (was public)
-- ============================================
DROP POLICY IF EXISTS "Allow public insert on mesh_comms" ON public.mesh_comms;
CREATE POLICY "Admin can insert mesh_comms"
  ON public.mesh_comms
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role_text(auth.uid(), 'admin'));
