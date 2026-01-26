
-- ============================================
-- SECURITY HARDENING: Round 4 - Final service_role policy fixes
-- ============================================

-- MARKETPLACE/LICENSE tables
DROP POLICY IF EXISTS "Allow license creation" ON public.marketplace_licenses;
CREATE POLICY "Service role creates licenses" ON public.marketplace_licenses FOR INSERT TO service_role WITH CHECK (true);

-- MODERNIZER tables
DROP POLICY IF EXISTS "Service role full access modernizer_analytics" ON public.modernizer_analytics;
CREATE POLICY "Service role full access modernizer_analytics" ON public.modernizer_analytics FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to autonomy log" ON public.modernizer_autonomy_log;
CREATE POLICY "Service role full access modernizer_autonomy_log" ON public.modernizer_autonomy_log FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service can insert reports" ON public.modernizer_reports;
CREATE POLICY "Service role insert reports" ON public.modernizer_reports FOR INSERT TO service_role WITH CHECK (true);

-- PF_CLARITY tables  
DROP POLICY IF EXISTS "Service can insert compliance history" ON public.pf_clarity_compliance_history;
CREATE POLICY "Service role insert compliance history" ON public.pf_clarity_compliance_history FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service can manage scan queue" ON public.pf_clarity_scan_queue;
CREATE POLICY "Service role manage scan queue" ON public.pf_clarity_scan_queue FOR ALL TO service_role USING (true) WITH CHECK (true);

-- PF tables
DROP POLICY IF EXISTS "Service can manage cost logs" ON public.pf_cost_logs;
CREATE POLICY "Service role manage cost logs" ON public.pf_cost_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service can manage image outputs" ON public.pf_image_outputs;
CREATE POLICY "Service role manage image outputs" ON public.pf_image_outputs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users only" ON public.pf_insight_logs;
CREATE POLICY "Service role manage insight logs" ON public.pf_insight_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read insight logs" ON public.pf_insight_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service can manage media cache" ON public.pf_media_cache;
CREATE POLICY "Service role manage media cache" ON public.pf_media_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service can manage text outputs" ON public.pf_text_outputs;
CREATE POLICY "Service role manage text outputs" ON public.pf_text_outputs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service can manage video outputs" ON public.pf_video_outputs;
CREATE POLICY "Service role manage video outputs" ON public.pf_video_outputs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RESILIENCE/RIPPLE tables
DROP POLICY IF EXISTS "Service role all resilience_ledger" ON public.resilience_ledger;
CREATE POLICY "Service role all resilience_ledger" ON public.resilience_ledger FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all ripple_campaigns" ON public.ripple_campaigns;
CREATE POLICY "Service role all ripple_campaigns" ON public.ripple_campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access ripple_circuit_breakers" ON public.ripple_circuit_breakers;
CREATE POLICY "Service role full access ripple_circuit_breakers" ON public.ripple_circuit_breakers FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access ripple_events" ON public.ripple_events;
CREATE POLICY "Service role full access ripple_events" ON public.ripple_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access ripple_jobs" ON public.ripple_jobs;
CREATE POLICY "Service role full access ripple_jobs" ON public.ripple_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access ripple_subscriptions" ON public.ripple_subscriptions;
CREATE POLICY "Service role full access ripple_subscriptions" ON public.ripple_subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access ripple_topics" ON public.ripple_topics;
CREATE POLICY "Service role full access ripple_topics" ON public.ripple_topics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- SECURITY/STUDIO tables
DROP POLICY IF EXISTS "Service role full access to security logs" ON public.security_audit_log;
CREATE POLICY "Service role full access security_audit_log" ON public.security_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full studio_audit" ON public.studio_audit;
CREATE POLICY "Service role full studio_audit" ON public.studio_audit FOR ALL TO service_role USING (true) WITH CHECK (true);

-- SUBSTRATE/SYSTEM tables
DROP POLICY IF EXISTS "Service role can manage applied improvements" ON public.substrate_applied_improvements;
CREATE POLICY "Service role manage applied improvements" ON public.substrate_applied_improvements FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access system_config" ON public.system_config;
CREATE POLICY "Service role full access system_config" ON public.system_config FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can insert updates" ON public.system_updates;
CREATE POLICY "Service role insert updates" ON public.system_updates FOR INSERT TO service_role WITH CHECK (true);

-- TENANTS/USAGE tables
DROP POLICY IF EXISTS "Service role all tenants" ON public.tenants;
CREATE POLICY "Service role all tenants" ON public.tenants FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all usage_metrics" ON public.usage_metrics;
CREATE POLICY "Service role all usage_metrics" ON public.usage_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all v_user_summary" ON public.v_user_summary;
CREATE POLICY "Service role all v_user_summary" ON public.v_user_summary FOR ALL TO service_role USING (true) WITH CHECK (true);
