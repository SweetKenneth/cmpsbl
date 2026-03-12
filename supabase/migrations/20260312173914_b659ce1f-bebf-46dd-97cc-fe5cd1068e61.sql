
-- ============================================================
-- SECURITY HARDENING MIGRATION — March 2026
-- Fixes 10 critical/warning security scan findings
-- ============================================================

-- 1. GOVERNANCE TABLES: Change {public} → {service_role}
DROP POLICY IF EXISTS "Service role full access on governance_transition_log" ON public.governance_transition_log;
CREATE POLICY "Service role full access on governance_transition_log" ON public.governance_transition_log FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on governance_issued_vetoes" ON public.governance_issued_vetoes;
CREATE POLICY "Service role full access on governance_issued_vetoes" ON public.governance_issued_vetoes FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on governance_transition_approvals" ON public.governance_transition_approvals;
CREATE POLICY "Service role full access on governance_transition_approvals" ON public.governance_transition_approvals FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on governance_compliance_reports" ON public.governance_compliance_reports;
CREATE POLICY "Service role full access on governance_compliance_reports" ON public.governance_compliance_reports FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "System can manage transition votes" ON public.governance_transition_votes;
CREATE POLICY "Service role full access on governance_transition_votes" ON public.governance_transition_votes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. DEVELOPER SANDBOX SESSIONS: Restrict to authenticated + user-scoped
DROP POLICY IF EXISTS "Developers can manage sandbox" ON public.developer_sandbox_sessions;
CREATE POLICY "Developers can manage own sandbox" ON public.developer_sandbox_sessions FOR ALL TO authenticated USING (developer_id = auth.uid()::text) WITH CHECK (developer_id = auth.uid()::text);

-- 3. DEVELOPER AI TOOL USAGE: Restrict to authenticated + user-scoped
DROP POLICY IF EXISTS "AI usage is trackable" ON public.developer_ai_tool_usage;
CREATE POLICY "Developers can view own AI usage" ON public.developer_ai_tool_usage FOR SELECT TO authenticated USING (developer_id = auth.uid()::text);
CREATE POLICY "Service role manage AI usage" ON public.developer_ai_tool_usage FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. BRAIN MEMORY tables: Remove public read, add authenticated
DROP POLICY IF EXISTS "Public read brain_memory_archive" ON public.brain_memory_archive;
CREATE POLICY "Authenticated read brain_memory_archive" ON public.brain_memory_archive FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Public read contradictions" ON public.brain_memory_contradictions;
CREATE POLICY "Authenticated read contradictions" ON public.brain_memory_contradictions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Public read brain_memory_meta" ON public.brain_memory_meta;
CREATE POLICY "Authenticated read brain_memory_meta" ON public.brain_memory_meta FOR SELECT TO authenticated USING (true);

-- 5. AI OUTPUT TABLES: Remove blanket public SELECT
DROP POLICY IF EXISTS "Users can view their image outputs" ON public.pf_image_outputs;
DROP POLICY IF EXISTS "Users can view their text outputs" ON public.pf_text_outputs;
DROP POLICY IF EXISTS "Users can view their video outputs" ON public.pf_video_outputs;

-- 6. DEVELOPER TUTORIAL PROGRESS: Restrict to authenticated + user-scoped
DROP POLICY IF EXISTS "Developers can update tutorial progress" ON public.developer_tutorial_progress;
DROP POLICY IF EXISTS "Developers can view tutorial progress" ON public.developer_tutorial_progress;
CREATE POLICY "Developers can view own tutorial progress" ON public.developer_tutorial_progress FOR SELECT TO authenticated USING (developer_id = auth.uid()::text);
CREATE POLICY "Developers can manage own tutorial progress" ON public.developer_tutorial_progress FOR ALL TO authenticated USING (developer_id = auth.uid()::text) WITH CHECK (developer_id = auth.uid()::text);

-- 7. EVOLUTION TABLES: Change {public} → {service_role}
DROP POLICY IF EXISTS "Service role write entropy ledger" ON public.evolution_entropy_ledger;
CREATE POLICY "Service role write entropy ledger" ON public.evolution_entropy_ledger FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write evolution snapshots" ON public.evolution_snapshots;
CREATE POLICY "Service role write evolution snapshots" ON public.evolution_snapshots FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role update evolution snapshots" ON public.evolution_snapshots;
CREATE POLICY "Service role update evolution snapshots" ON public.evolution_snapshots FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- 8. SCAN RESULTS CACHE: Change to authenticated + user-scoped
DROP POLICY IF EXISTS "Authenticated users can insert scan results" ON public.scan_results_cache;
CREATE POLICY "Authenticated users can insert scan results" ON public.scan_results_cache FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 9. COST LOGS: Remove public read, restrict to authenticated
DROP POLICY IF EXISTS "Users can view cost logs" ON public.pf_cost_logs;
CREATE POLICY "Authenticated users can view cost logs" ON public.pf_cost_logs FOR SELECT TO authenticated USING (true);
