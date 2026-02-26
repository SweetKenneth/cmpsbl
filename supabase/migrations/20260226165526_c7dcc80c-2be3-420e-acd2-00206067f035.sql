
-- ══════════════════════════════════════════════════════════════════════
-- RLS HARDENING: Replace permissive INSERT/UPDATE/DELETE policies
-- ══════════════════════════════════════════════════════════════════════

-- 1. brain_cross_insights — service_role only writes
DROP POLICY IF EXISTS "Service role creates cross insights" ON public.brain_cross_insights;
CREATE POLICY "Service role creates cross insights" ON public.brain_cross_insights
  FOR INSERT TO service_role WITH CHECK (true);

-- 2. brain_knowledge_edges — service_role only
DROP POLICY IF EXISTS "Insert edges" ON public.brain_knowledge_edges;
CREATE POLICY "Service role insert edges" ON public.brain_knowledge_edges
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Update edges" ON public.brain_knowledge_edges;
CREATE POLICY "Service role update edges" ON public.brain_knowledge_edges
  FOR UPDATE TO service_role USING (true);

-- 3. brain_rag_contexts — service_role only
DROP POLICY IF EXISTS "Insert rag" ON public.brain_rag_contexts;
CREATE POLICY "Service role insert rag" ON public.brain_rag_contexts
  FOR INSERT TO service_role WITH CHECK (true);

-- 4. brain_reinforcement_log
DROP POLICY IF EXISTS "Service role insert reinforcement logs" ON public.brain_reinforcement_log;
CREATE POLICY "Service role insert reinforcement logs" ON public.brain_reinforcement_log
  FOR INSERT TO service_role WITH CHECK (true);

-- 5. brain_user_fingerprints — service_role only
DROP POLICY IF EXISTS "Insert fingerprints" ON public.brain_user_fingerprints;
CREATE POLICY "Service role insert fingerprints" ON public.brain_user_fingerprints
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Update fingerprints" ON public.brain_user_fingerprints;
CREATE POLICY "Service role update fingerprints" ON public.brain_user_fingerprints
  FOR UPDATE TO service_role USING (true);

-- 6. cognitive_orders — user-scoped insert (user_id is UUID), service_role update
DROP POLICY IF EXISTS "Anyone can insert cognitive orders" ON public.cognitive_orders;
CREATE POLICY "Authenticated users insert own cognitive orders" ON public.cognitive_orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can update cognitive orders" ON public.cognitive_orders;
CREATE POLICY "Service role can update cognitive orders" ON public.cognitive_orders
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- 7. daily_backups — service_role only
DROP POLICY IF EXISTS "Authenticated users can update backup metadata" ON public.daily_backups;
CREATE POLICY "Service role update backup metadata" ON public.daily_backups
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- 8. defense_events — service_role only
DROP POLICY IF EXISTS "Anon can insert defense events" ON public.defense_events;
DROP POLICY IF EXISTS "Authenticated can insert defense events" ON public.defense_events;
CREATE POLICY "Service role insert defense events" ON public.defense_events
  FOR INSERT TO service_role WITH CHECK (true);

-- 9. developer_earned_badges — developer_id is TEXT, use text cast
DROP POLICY IF EXISTS "Developers can earn badges" ON public.developer_earned_badges;
CREATE POLICY "Authenticated users earn own badges" ON public.developer_earned_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = developer_id);

-- 10. developer_progress — developer_id is TEXT
DROP POLICY IF EXISTS "Developers can update own progress" ON public.developer_progress;
CREATE POLICY "Authenticated insert own progress" ON public.developer_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = developer_id);

DROP POLICY IF EXISTS "Developers can modify own progress" ON public.developer_progress;
CREATE POLICY "Authenticated update own progress" ON public.developer_progress
  FOR UPDATE TO authenticated USING (auth.uid()::text = developer_id);

-- 11. dream_feeder_submissions — authenticated only (no user_id, so just restrict to authenticated)
DROP POLICY IF EXISTS "Authenticated can feed dreams" ON public.dream_feeder_submissions;
CREATE POLICY "Authenticated insert dreams" ON public.dream_feeder_submissions
  FOR INSERT TO authenticated WITH CHECK (true);

-- 12. ecosystem_memory — service_role only
DROP POLICY IF EXISTS "Service role can insert memory" ON public.ecosystem_memory;
CREATE POLICY "Service role insert memory" ON public.ecosystem_memory
  FOR INSERT TO service_role WITH CHECK (true);

-- 13. immune_escalations — service_role only
DROP POLICY IF EXISTS "System insert immune_escalations" ON public.immune_escalations;
CREATE POLICY "Service role insert immune_escalations" ON public.immune_escalations
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update immune_escalations" ON public.immune_escalations;
CREATE POLICY "Service role update immune_escalations" ON public.immune_escalations
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated delete immune_escalations" ON public.immune_escalations;
CREATE POLICY "Service role delete immune_escalations" ON public.immune_escalations
  FOR DELETE TO service_role USING (true);

-- 14. immune_intelligence_events — service_role only
DROP POLICY IF EXISTS "Anyone can insert intelligence events" ON public.immune_intelligence_events;
CREATE POLICY "Service role insert intelligence events" ON public.immune_intelligence_events
  FOR INSERT TO service_role WITH CHECK (true);

-- 15. immune_metrics — service_role only
DROP POLICY IF EXISTS "anyone_can_insert_metrics" ON public.immune_metrics;
CREATE POLICY "Service role insert immune metrics" ON public.immune_metrics
  FOR INSERT TO service_role WITH CHECK (true);

-- 16. licensing_inquiries — authenticated only
DROP POLICY IF EXISTS "Anyone can submit licensing inquiry" ON public.licensing_inquiries;
CREATE POLICY "Authenticated submit licensing inquiry" ON public.licensing_inquiries
  FOR INSERT TO authenticated WITH CHECK (true);

-- 17. marketplace_licenses — service_role only
DROP POLICY IF EXISTS "Service role creates licenses" ON public.marketplace_licenses;
CREATE POLICY "Service role creates licenses" ON public.marketplace_licenses
  FOR INSERT TO service_role WITH CHECK (true);

-- 18. mesh_capability_recommendations — service_role only
DROP POLICY IF EXISTS "Service insert mesh recommendations" ON public.mesh_capability_recommendations;
CREATE POLICY "Service role insert mesh recommendations" ON public.mesh_capability_recommendations
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service update mesh recommendations" ON public.mesh_capability_recommendations;
CREATE POLICY "Service role update mesh recommendations" ON public.mesh_capability_recommendations
  FOR UPDATE TO service_role USING (true);

-- 19. mesh_discovery_gaps — service_role only
DROP POLICY IF EXISTS "Service insert mesh gaps" ON public.mesh_discovery_gaps;
CREATE POLICY "Service role insert mesh gaps" ON public.mesh_discovery_gaps
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service update mesh gaps" ON public.mesh_discovery_gaps;
CREATE POLICY "Service role update mesh gaps" ON public.mesh_discovery_gaps
  FOR UPDATE TO service_role USING (true);

-- 20. mesh_discovery_runs — service_role only
DROP POLICY IF EXISTS "Service insert mesh discovery runs" ON public.mesh_discovery_runs;
CREATE POLICY "Service role insert mesh discovery runs" ON public.mesh_discovery_runs
  FOR INSERT TO service_role WITH CHECK (true);

-- 21. modernizer_reports — service_role only
DROP POLICY IF EXISTS "Service role insert reports" ON public.modernizer_reports;
CREATE POLICY "Service role insert reports" ON public.modernizer_reports
  FOR INSERT TO service_role WITH CHECK (true);

-- 22. nexus_logs — service_role only
DROP POLICY IF EXISTS "service_role_insert_nexus_logs" ON public.nexus_logs;
CREATE POLICY "Service role insert nexus logs" ON public.nexus_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- 23. owner_reports — service_role only
DROP POLICY IF EXISTS "Service role can insert owner reports" ON public.owner_reports;
CREATE POLICY "Service role insert owner reports" ON public.owner_reports
  FOR INSERT TO service_role WITH CHECK (true);

-- 24. pf_clarity_compliance_history — service_role only
DROP POLICY IF EXISTS "Service role insert compliance history" ON public.pf_clarity_compliance_history;
CREATE POLICY "Service role insert compliance history" ON public.pf_clarity_compliance_history
  FOR INSERT TO service_role WITH CHECK (true);

-- 25. radio_broadcasts — service_role only
DROP POLICY IF EXISTS "Service can insert radio broadcasts" ON public.radio_broadcasts;
CREATE POLICY "Service role insert radio broadcasts" ON public.radio_broadcasts
  FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service can update radio broadcasts" ON public.radio_broadcasts;
CREATE POLICY "Service role update radio broadcasts" ON public.radio_broadcasts
  FOR UPDATE TO service_role USING (true);

DROP POLICY IF EXISTS "Service can delete stale radio broadcasts" ON public.radio_broadcasts;
CREATE POLICY "Service role delete radio broadcasts" ON public.radio_broadcasts
  FOR DELETE TO service_role USING (true);

-- 26. Create extensions schema for future extension installs
CREATE SCHEMA IF NOT EXISTS extensions;
