-- 2. Fix immunity table policies (named "Service write" but no role check)
DROP POLICY IF EXISTS "Service write mesh_runs" ON public.immunity_mesh_runs;
CREATE POLICY "Service role manages mesh_runs" ON public.immunity_mesh_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service write rule_conflicts" ON public.immunity_rule_conflicts;
CREATE POLICY "Service role manages rule_conflicts" ON public.immunity_rule_conflicts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service write rule_invocations" ON public.immunity_rule_invocations;
CREATE POLICY "Service role manages rule_invocations" ON public.immunity_rule_invocations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service write rule_lineage" ON public.immunity_rule_lineage;
CREATE POLICY "Service role manages rule_lineage" ON public.immunity_rule_lineage
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service write rule_propagation" ON public.immunity_rule_propagation;
CREATE POLICY "Service role manages rule_propagation" ON public.immunity_rule_propagation
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service write immunity_rules" ON public.immunity_rules;
CREATE POLICY "Service role manages immunity_rules" ON public.immunity_rules
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Scope site_page_views UPDATE to specific roles
DROP POLICY IF EXISTS "Anon can update page views by session" ON public.site_page_views;
CREATE POLICY "Anon can update page views by session" ON public.site_page_views
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Auth can update page views by session" ON public.site_page_views;
CREATE POLICY "Auth can update page views by session" ON public.site_page_views
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 4. Scope site_sessions UPDATE to anon role
DROP POLICY IF EXISTS "anon_update_sessions" ON public.site_sessions;
CREATE POLICY "anon_update_sessions" ON public.site_sessions
  FOR UPDATE TO anon USING (true) WITH CHECK (true);