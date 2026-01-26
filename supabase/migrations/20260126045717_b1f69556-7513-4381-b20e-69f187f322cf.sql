
-- ============================================
-- SECURITY HARDENING: Round 3 - Remaining service_role policy fixes
-- Re-running without licenses table
-- ============================================

-- BRAIN tables
DROP POLICY IF EXISTS "Service role all brain_metrics" ON public.brain_metrics;
CREATE POLICY "Service role all brain_metrics" ON public.brain_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all brain_persona_patterns" ON public.brain_persona_patterns;
CREATE POLICY "Service role all brain_persona_patterns" ON public.brain_persona_patterns FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all brain_persona_state" ON public.brain_persona_state;
CREATE POLICY "Service role all brain_persona_state" ON public.brain_persona_state FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all brain_proxy_logs" ON public.brain_proxy_logs;
CREATE POLICY "Service role all brain_proxy_logs" ON public.brain_proxy_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all brain_reach_domains" ON public.brain_reach_domains;
CREATE POLICY "Service role all brain_reach_domains" ON public.brain_reach_domains FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert reinforcement logs" ON public.brain_reinforcement_log;
CREATE POLICY "Service role insert reinforcement logs" ON public.brain_reinforcement_log FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all brain_sensory_events" ON public.brain_sensory_events;
CREATE POLICY "Service role all brain_sensory_events" ON public.brain_sensory_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access - tiering" ON public.brain_tiering_config;
CREATE POLICY "Service role full access brain_tiering_config" ON public.brain_tiering_config FOR ALL TO service_role USING (true) WITH CHECK (true);

-- CORE tables
DROP POLICY IF EXISTS "Service role all causal_traces" ON public.causal_traces;
CREATE POLICY "Service role all causal_traces" ON public.causal_traces FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access core_config" ON public.core_config;
CREATE POLICY "Service role full access core_config" ON public.core_config FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access core_contexts" ON public.core_contexts;
CREATE POLICY "Service role full access core_contexts" ON public.core_contexts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access core_jobs" ON public.core_jobs;
CREATE POLICY "Service role full access core_jobs" ON public.core_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all core_plans" ON public.core_plans;
CREATE POLICY "Service role all core_plans" ON public.core_plans FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access core_state" ON public.core_state;
CREATE POLICY "Service role full access core_state" ON public.core_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- DAILY/STATE tables
DROP POLICY IF EXISTS "Service role can manage backups" ON public.daily_backups;
CREATE POLICY "Service role can manage backups" ON public.daily_backups FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all daily_state" ON public.daily_state;
DROP POLICY IF EXISTS "Service role can manage daily state" ON public.daily_state;
CREATE POLICY "Service role all daily_state" ON public.daily_state FOR ALL TO service_role USING (true) WITH CHECK (true);

-- DEFENSE tables
DROP POLICY IF EXISTS "Service role full access defense_config" ON public.defense_config;
CREATE POLICY "Service role full access defense_config" ON public.defense_config FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access defense_events" ON public.defense_events;
CREATE POLICY "Service role full access defense_events" ON public.defense_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all defense_rules" ON public.defense_rules;
CREATE POLICY "Service role all defense_rules" ON public.defense_rules FOR ALL TO service_role USING (true) WITH CHECK (true);

-- DEVELOPER/DREAM tables
DROP POLICY IF EXISTS "Service role manages templates" ON public.developer_templates;
CREATE POLICY "Service role manages templates" ON public.developer_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages dream_anomalies" ON public.dream_anomalies;
CREATE POLICY "Service role manages dream_anomalies" ON public.dream_anomalies FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can feed dreams" ON public.dream_feeder_submissions;
CREATE POLICY "Authenticated can feed dreams" ON public.dream_feeder_submissions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all dream_log" ON public.dream_log;
CREATE POLICY "Service role all dream_log" ON public.dream_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ECOSYSTEM/EDGE tables
DROP POLICY IF EXISTS "Service role can insert memory" ON public.ecosystem_memory;
CREATE POLICY "Service role can insert memory" ON public.ecosystem_memory FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to rate limits" ON public.edge_rate_limits;
CREATE POLICY "Service role full access edge_rate_limits" ON public.edge_rate_limits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ETHICAL/EVOLUTION tables
DROP POLICY IF EXISTS "Service role all ethical_approvals" ON public.ethical_approvals;
CREATE POLICY "Service role all ethical_approvals" ON public.ethical_approvals FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update proposals" ON public.evolution_proposals;
DROP POLICY IF EXISTS "Service role can insert proposals" ON public.evolution_proposals;
CREATE POLICY "Service role manages evolution_proposals" ON public.evolution_proposals FOR ALL TO service_role USING (true) WITH CHECK (true);

-- INTEGRATION tables
DROP POLICY IF EXISTS "Service role full access integration_audit_log" ON public.integration_audit_log;
CREATE POLICY "Service role full access integration_audit_log" ON public.integration_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access integration_command_mappings" ON public.integration_command_mappings;
CREATE POLICY "Service role full access integration_command_mappings" ON public.integration_command_mappings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access integration_connections" ON public.integration_connections;
CREATE POLICY "Service role full access integration_connections" ON public.integration_connections FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access integration_discoveries" ON public.integration_discoveries;
CREATE POLICY "Service role full access integration_discoveries" ON public.integration_discoveries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- IP/LEARNING tables
DROP POLICY IF EXISTS "Service role full access ip_reputation" ON public.ip_reputation;
CREATE POLICY "Service role full access ip_reputation" ON public.ip_reputation FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role all learning_cycles" ON public.learning_cycles;
CREATE POLICY "Service role all learning_cycles" ON public.learning_cycles FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access learning_queries" ON public.learning_queries;
CREATE POLICY "Service role full access learning_queries" ON public.learning_queries FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage learning_results" ON public.learning_results;
CREATE POLICY "Service role can manage learning_results" ON public.learning_results FOR ALL TO service_role USING (true) WITH CHECK (true);
