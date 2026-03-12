
-- ═══════════════════════════════════════════════════════════════
-- DEEP AUDIT REPAIR: Critical + Warning RLS fixes (v2)
-- ═══════════════════════════════════════════════════════════════

-- CRITICAL FIX 1: nexus tables — already fixed by prior partial run, ensure idempotent
DROP POLICY IF EXISTS "Service role full access" ON public.nexus_traces;
DROP POLICY IF EXISTS "Service role full access" ON public.nexus_provider_affinity;
DROP POLICY IF EXISTS "Service role full access" ON public.nexus_anomalies;
DROP POLICY IF EXISTS "Service role manages nexus_traces" ON public.nexus_traces;
DROP POLICY IF EXISTS "Service role manages nexus_provider_affinity" ON public.nexus_provider_affinity;
DROP POLICY IF EXISTS "Service role manages nexus_anomalies" ON public.nexus_anomalies;
DROP POLICY IF EXISTS "Authenticated read nexus_traces" ON public.nexus_traces;
DROP POLICY IF EXISTS "Authenticated read nexus_provider_affinity" ON public.nexus_provider_affinity;
DROP POLICY IF EXISTS "Authenticated read nexus_anomalies" ON public.nexus_anomalies;

CREATE POLICY "Service role manages nexus_traces"
  ON public.nexus_traces FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages nexus_provider_affinity"
  ON public.nexus_provider_affinity FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages nexus_anomalies"
  ON public.nexus_anomalies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read nexus_traces"
  ON public.nexus_traces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read nexus_provider_affinity"
  ON public.nexus_provider_affinity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read nexus_anomalies"
  ON public.nexus_anomalies FOR SELECT TO authenticated USING (true);

-- CRITICAL FIX 2: site tables — restrict UPDATE
DROP POLICY IF EXISTS "anon_update_page_views" ON public.site_page_views;
DROP POLICY IF EXISTS "anon_update_sessions" ON public.site_sessions;
DROP POLICY IF EXISTS "anon_update_sessions_auth" ON public.site_sessions;
DROP POLICY IF EXISTS "Service role update page_views" ON public.site_page_views;
DROP POLICY IF EXISTS "Service role update sessions" ON public.site_sessions;

CREATE POLICY "Service role update page_views"
  ON public.site_page_views FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role update sessions"
  ON public.site_sessions FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- CRITICAL FIX 3: brain memory tables — user_id isolation (brain_memories has NO user_id, restrict to admin)
DROP POLICY IF EXISTS "Authenticated read brain_memories" ON public.brain_memories;
DROP POLICY IF EXISTS "Authenticated read own brain_memories" ON public.brain_memories;
CREATE POLICY "Admins read brain_memories"
  ON public.brain_memories FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated read brain_memory_warm" ON public.brain_memory_warm;
DROP POLICY IF EXISTS "Authenticated read own brain_memory_warm" ON public.brain_memory_warm;
CREATE POLICY "Authenticated read own brain_memory_warm"
  ON public.brain_memory_warm FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Authenticated read brain_memory_cold" ON public.brain_memory_cold;
DROP POLICY IF EXISTS "Authenticated read own brain_memory_cold" ON public.brain_memory_cold;
CREATE POLICY "Authenticated read own brain_memory_cold"
  ON public.brain_memory_cold FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Authenticated read brain_memory_archive" ON public.brain_memory_archive;
DROP POLICY IF EXISTS "Authenticated read own brain_memory_archive" ON public.brain_memory_archive;
CREATE POLICY "Authenticated read own brain_memory_archive"
  ON public.brain_memory_archive FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Authenticated read brain_memory_meta" ON public.brain_memory_meta;
DROP POLICY IF EXISTS "Authenticated read own brain_memory_meta" ON public.brain_memory_meta;
CREATE POLICY "Authenticated read own brain_memory_meta"
  ON public.brain_memory_meta FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Authenticated read contradictions" ON public.brain_memory_contradictions;
DROP POLICY IF EXISTS "Authenticated read own brain_memory_contradictions" ON public.brain_memory_contradictions;
CREATE POLICY "Authenticated read own brain_memory_contradictions"
  ON public.brain_memory_contradictions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- CRITICAL FIX 4: marketplace_mailing_list — remove NULL leak
DROP POLICY IF EXISTS "Users can manage own mailing list entries" ON public.marketplace_mailing_list;
CREATE POLICY "Users can manage own mailing list entries"
  ON public.marketplace_mailing_list FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- WARNING FIX 1: pf_cost_logs
DROP POLICY IF EXISTS "Authenticated users can view cost logs" ON public.pf_cost_logs;
DROP POLICY IF EXISTS "Admins can view cost logs" ON public.pf_cost_logs;
CREATE POLICY "Admins can view cost logs"
  ON public.pf_cost_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- WARNING FIX 2: ai_usage_log
DROP POLICY IF EXISTS "Authenticated users can read ai_usage_log" ON public.ai_usage_log;
DROP POLICY IF EXISTS "Admins can read ai_usage_log" ON public.ai_usage_log;
CREATE POLICY "Admins can read ai_usage_log"
  ON public.ai_usage_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- WARNING FIX 3: brain_reflection_log & brain_reflections
DROP POLICY IF EXISTS "Allow public read on brain_reflection_log" ON public.brain_reflection_log;
DROP POLICY IF EXISTS "Admins can read brain_reflection_log" ON public.brain_reflection_log;
CREATE POLICY "Admins can read brain_reflection_log"
  ON public.brain_reflection_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Allow public read on brain_reflections" ON public.brain_reflections;
DROP POLICY IF EXISTS "Authenticated read brain_reflections" ON public.brain_reflections;
DROP POLICY IF EXISTS "Admins can read brain_reflections" ON public.brain_reflections;
CREATE POLICY "Admins can read brain_reflections"
  ON public.brain_reflections FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- WARNING FIX 4: analytics_events — scope to own user
DROP POLICY IF EXISTS "Authenticated users can read analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated read own analytics_events" ON public.analytics_events;
CREATE POLICY "Authenticated read own analytics_events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- WARNING FIX 5: substrate_audit_log
DROP POLICY IF EXISTS "Authenticated users can read audit log" ON public.substrate_audit_log;
DROP POLICY IF EXISTS "Admins can read audit log" ON public.substrate_audit_log;
CREATE POLICY "Admins can read audit log"
  ON public.substrate_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- WARNING FIX 6: control_plane_state — remove anon read
DROP POLICY IF EXISTS "Anon can read CP state" ON public.control_plane_state;

-- ┌──────────────────────────────────────────────────────────────┐
-- │ MISSING POLICIES: 6 tables with RLS enabled but no policies │
-- └──────────────────────────────────────────────────────────────┘

CREATE POLICY "Anon can insert captcha_challenges"
  ON public.captcha_challenges FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anon can read captcha_challenges"
  ON public.captcha_challenges FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages captcha_challenges"
  ON public.captcha_challenges FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages decode_search_results"
  ON public.decode_search_results FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read decode_search_results"
  ON public.decode_search_results FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role manages device_fingerprint_snapshots"
  ON public.device_fingerprint_snapshots FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Admins read device_fingerprint_snapshots"
  ON public.device_fingerprint_snapshots FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages evolution_pre_metrics"
  ON public.evolution_pre_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Admins read evolution_pre_metrics"
  ON public.evolution_pre_metrics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages lovable_ai_usage"
  ON public.lovable_ai_usage FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Admins read lovable_ai_usage"
  ON public.lovable_ai_usage FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages tsac_training_feedback"
  ON public.tsac_training_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Admins read tsac_training_feedback"
  ON public.tsac_training_feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
