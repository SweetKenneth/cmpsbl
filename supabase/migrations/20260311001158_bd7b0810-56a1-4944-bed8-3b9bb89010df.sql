
-- =====================================================
-- CRITICAL RLS HARDENING — Fix exposed user data
-- =====================================================

-- 1. substrate_licenses: restrict to service_role only
DROP POLICY IF EXISTS "Service role can manage licenses" ON public.substrate_licenses;
CREATE POLICY "Service role manages licenses"
  ON public.substrate_licenses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read only their own licenses
CREATE POLICY "Users can read own licenses"
  ON public.substrate_licenses
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- 2. scan_results_cache: restrict to owning user
DROP POLICY IF EXISTS "Anyone can read scan results" ON public.scan_results_cache;
CREATE POLICY "Users can read own scan results"
  ON public.scan_results_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. brain_rag_contexts: restrict to owning user
DROP POLICY IF EXISTS "Public read rag" ON public.brain_rag_contexts;
CREATE POLICY "Users can read own rag contexts"
  ON public.brain_rag_contexts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. brain_user_fingerprints: restrict to owning user
DROP POLICY IF EXISTS "Public read fingerprints" ON public.brain_user_fingerprints;
CREATE POLICY "Users can read own fingerprints"
  ON public.brain_user_fingerprints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. pf_clarity_email_follows: restrict to authenticated users with email match
DROP POLICY IF EXISTS "Users can view email follows for their scans" ON public.pf_clarity_email_follows;
CREATE POLICY "Users can view own email follows"
  ON public.pf_clarity_email_follows
  FOR SELECT
  TO authenticated
  USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 6. pf_image_outputs: restrict to project owner
DROP POLICY IF EXISTS "Anyone can view outputs" ON public.pf_image_outputs;
DROP POLICY IF EXISTS "Public read pf_image_outputs" ON public.pf_image_outputs;
CREATE POLICY "Users can read own image outputs"
  ON public.pf_image_outputs
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.pf_mvp_projects WHERE user_id = auth.uid()
    )
  );

-- 7. pf_text_outputs: restrict to project owner
DROP POLICY IF EXISTS "Anyone can view outputs" ON public.pf_text_outputs;
DROP POLICY IF EXISTS "Public read pf_text_outputs" ON public.pf_text_outputs;
CREATE POLICY "Users can read own text outputs"
  ON public.pf_text_outputs
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.pf_mvp_projects WHERE user_id = auth.uid()
    )
  );

-- 8. pf_video_outputs: restrict to project owner
DROP POLICY IF EXISTS "Anyone can view outputs" ON public.pf_video_outputs;
DROP POLICY IF EXISTS "Public read pf_video_outputs" ON public.pf_video_outputs;
CREATE POLICY "Users can read own video outputs"
  ON public.pf_video_outputs
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.pf_mvp_projects WHERE user_id = auth.uid()
    )
  );
