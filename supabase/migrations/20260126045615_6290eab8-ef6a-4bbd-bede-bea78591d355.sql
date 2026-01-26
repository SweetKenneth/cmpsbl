
-- ============================================
-- SECURITY HARDENING: Round 2 - Fix service_role policies
-- These policies were incorrectly targeting 'public' role instead of 'service_role'
-- ============================================

-- ACCESS_API_KEYS: Should only be service_role
DROP POLICY IF EXISTS "Service role full access access_api_keys" ON public.access_api_keys;
CREATE POLICY "Service role full access access_api_keys"
ON public.access_api_keys FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ACCESS_DEVELOPERS: Should only be service_role
DROP POLICY IF EXISTS "Service role full access access_developers" ON public.access_developers;
CREATE POLICY "Service role full access access_developers"
ON public.access_developers FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ACCESS_PRODUCTS: Keep public read but fix write to service_role
DROP POLICY IF EXISTS "Service role can manage products" ON public.access_products;
CREATE POLICY "Service role can manage products"
ON public.access_products FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ACCESS_QUOTAS: Should only be service_role
DROP POLICY IF EXISTS "Service role full access access_quotas" ON public.access_quotas;
CREATE POLICY "Service role full access access_quotas"
ON public.access_quotas FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ACCESS_SUBSCRIPTIONS: Should only be service_role
DROP POLICY IF EXISTS "Service role full access access_subscriptions" ON public.access_subscriptions;
CREATE POLICY "Service role full access access_subscriptions"
ON public.access_subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ACCESS_USAGE: Should only be service_role
DROP POLICY IF EXISTS "Service role full access access_usage" ON public.access_usage;
CREATE POLICY "Service role full access access_usage"
ON public.access_usage FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- AGENCY_AGENT_TELEMETRY: Should only be service_role
DROP POLICY IF EXISTS "Service role can manage telemetry" ON public.agency_agent_telemetry;
CREATE POLICY "Service role can manage telemetry"
ON public.agency_agent_telemetry FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- AGENCY_TASK_ARTIFACTS: Should only be service_role
DROP POLICY IF EXISTS "Service role can manage artifacts" ON public.agency_task_artifacts;
CREATE POLICY "Service role can manage artifacts"
ON public.agency_task_artifacts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- AUDIT_LOGS: Fix public read and service_role
DROP POLICY IF EXISTS "Allow public read on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role full access audit_logs" ON public.audit_logs;

CREATE POLICY "Authenticated read audit_logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role full access audit_logs"
ON public.audit_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- AUTO_BLOG_POSTS: Should only be service_role
DROP POLICY IF EXISTS "Service role manages posts" ON public.auto_blog_posts;
CREATE POLICY "Service role manages posts"
ON public.auto_blog_posts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- AUTO_BLOG_SCHEDULE: Should only be service_role
DROP POLICY IF EXISTS "Service role manages schedule" ON public.auto_blog_schedule;
CREATE POLICY "Service role manages schedule"
ON public.auto_blog_schedule FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- BRAIN_ACTIONS_QUEUE: Should only be service_role
DROP POLICY IF EXISTS "Service role full access brain_actions_queue" ON public.brain_actions_queue;
CREATE POLICY "Service role full access brain_actions_queue"
ON public.brain_actions_queue FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- BRAIN_CROSS_INSIGHTS: Fix insert to service_role
DROP POLICY IF EXISTS "System can create cross insights" ON public.brain_cross_insights;
CREATE POLICY "Service role creates cross insights"
ON public.brain_cross_insights FOR INSERT
TO service_role
WITH CHECK (true);

-- BRAIN_CURIOSITY_LOG: Remove public read
DROP POLICY IF EXISTS "Allow public read on brain_curiosity_log" ON public.brain_curiosity_log;

-- BRAIN_DAILY_REPORTS: Remove public, keep auth
DROP POLICY IF EXISTS "Public read brain_daily_reports" ON public.brain_daily_reports;
DROP POLICY IF EXISTS "Service role all brain_daily_reports" ON public.brain_daily_reports;

CREATE POLICY "Authenticated read brain_daily_reports"
ON public.brain_daily_reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role all brain_daily_reports"
ON public.brain_daily_reports FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- BRAIN_DOMAIN_USAGE: Fix to service_role
DROP POLICY IF EXISTS "Service role all brain_domain_usage" ON public.brain_domain_usage;
CREATE POLICY "Service role all brain_domain_usage"
ON public.brain_domain_usage FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- BRAIN_FEEDBACK: Fix to service_role
DROP POLICY IF EXISTS "Service role full access brain_feedback" ON public.brain_feedback;
CREATE POLICY "Service role full access brain_feedback"
ON public.brain_feedback FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- BRAIN_FORECASTS: Remove public
DROP POLICY IF EXISTS "Allow public read on brain_forecasts" ON public.brain_forecasts;

-- BRAIN_GRAPH_EDGES: Fix to service_role
DROP POLICY IF EXISTS "Service role full access brain_graph_edges" ON public.brain_graph_edges;
CREATE POLICY "Service role full access brain_graph_edges"
ON public.brain_graph_edges FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- BRAIN_GRAPH_NODES: Fix to service_role
DROP POLICY IF EXISTS "Service role full access - nodes" ON public.brain_graph_nodes;
CREATE POLICY "Service role full access brain_graph_nodes"
ON public.brain_graph_nodes FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- BRAIN_MEMORY_PRUNED: Fix to service_role
DROP POLICY IF EXISTS "Service role full access - pruned" ON public.brain_memory_pruned;
CREATE POLICY "Service role full access brain_memory_pruned"
ON public.brain_memory_pruned FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- SERVICE_ROLE fixes for remaining tables
DROP POLICY IF EXISTS "Service role full access brain_memories" ON public.brain_memories;
DROP POLICY IF EXISTS "Service role manages brain_memories" ON public.brain_memories;
CREATE POLICY "Service role manages brain_memories"
ON public.brain_memories FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access brain_memory_cold" ON public.brain_memory_cold;
CREATE POLICY "Service role full access brain_memory_cold"
ON public.brain_memory_cold FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access brain_memory_warm" ON public.brain_memory_warm;
CREATE POLICY "Service role full access brain_memory_warm"
ON public.brain_memory_warm FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
