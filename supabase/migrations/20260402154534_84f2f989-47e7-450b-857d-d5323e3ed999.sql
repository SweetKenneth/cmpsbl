
-- 1. Fix evolution_receipts & evolution_runs privilege escalation
DROP POLICY IF EXISTS "Service role can manage evolution_receipts" ON public.evolution_receipts;
CREATE POLICY "Service role can manage evolution_receipts" ON public.evolution_receipts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage evolution_runs" ON public.evolution_runs;
CREATE POLICY "Service role can manage evolution_runs" ON public.evolution_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Remove public analytics SELECT
DROP POLICY IF EXISTS "anon_select_page_views" ON public.site_page_views;
DROP POLICY IF EXISTS "authenticated_read_page_views" ON public.site_page_views;
DROP POLICY IF EXISTS "anon_select_sessions" ON public.site_sessions;
DROP POLICY IF EXISTS "authenticated_read_sessions" ON public.site_sessions;

-- Tighten page_views UPDATE
DROP POLICY IF EXISTS "Anon can update page views by session" ON public.site_page_views;
DROP POLICY IF EXISTS "Auth can update page views by session" ON public.site_page_views;
CREATE POLICY "Anon update own page views" ON public.site_page_views
  FOR UPDATE TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');
CREATE POLICY "Auth update own page views" ON public.site_page_views
  FOR UPDATE TO authenticated
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- Tighten sessions UPDATE
DROP POLICY IF EXISTS "anon_update_sessions" ON public.site_sessions;
CREATE POLICY "Anon update own sessions" ON public.site_sessions
  FOR UPDATE TO anon
  USING (fingerprint_hash = current_setting('request.headers', true)::json->>'x-fingerprint')
  WITH CHECK (fingerprint_hash = current_setting('request.headers', true)::json->>'x-fingerprint');

-- 3. Fix developer_progress SELECT
DROP POLICY IF EXISTS "Developers can view own progress" ON public.developer_progress;
CREATE POLICY "Developers can view own progress" ON public.developer_progress
  FOR SELECT TO authenticated
  USING ((auth.uid())::text = developer_id);

-- 4. Fix cognitives_zips storage
DROP POLICY IF EXISTS "Authenticated users can download cognitives via signed URL" ON storage.objects;
CREATE POLICY "Authenticated users can download own cognitives" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cognitives_zips' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 5. Restrict brain_embeddings to admin
DROP POLICY IF EXISTS "Authenticated users can read brain_embeddings" ON public.brain_embeddings;
CREATE POLICY "Admin can read brain_embeddings" ON public.brain_embeddings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::text));

-- 6. Restrict cortex_audit_log to admin
DROP POLICY IF EXISTS "Authenticated read cortex_audit_log" ON public.cortex_audit_log;
CREATE POLICY "Admin read cortex_audit_log" ON public.cortex_audit_log
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::text));

-- 7. Restrict nexus_cost_ledger to admin
DROP POLICY IF EXISTS "Authenticated read ledger" ON public.nexus_cost_ledger;
CREATE POLICY "Admin read nexus_cost_ledger" ON public.nexus_cost_ledger
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::text));
