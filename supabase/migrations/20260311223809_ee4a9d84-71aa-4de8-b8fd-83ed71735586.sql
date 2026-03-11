
-- ============================================================
-- SECURITY FIX: Harden overly-permissive RLS policies
-- ============================================================

-- 1. control_plane_state: Remove blanket authenticated ALL, add admin-only
DROP POLICY IF EXISTS "Authenticated users can manage CP state" ON public.control_plane_state;
CREATE POLICY "Admins can manage CP state"
  ON public.control_plane_state
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. governance_transition_log: Remove public ALL, add admin-only
DROP POLICY IF EXISTS "Public full access on governance_transition_log" ON public.governance_transition_log;
DROP POLICY IF EXISTS "Allow full access to governance_transition_log" ON public.governance_transition_log;
CREATE POLICY "Admins can manage governance_transition_log"
  ON public.governance_transition_log
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. governance_issued_vetoes: Remove public ALL, add admin-only
DROP POLICY IF EXISTS "Public full access on governance_issued_vetoes" ON public.governance_issued_vetoes;
DROP POLICY IF EXISTS "Allow full access to governance_issued_vetoes" ON public.governance_issued_vetoes;
CREATE POLICY "Admins can manage governance_issued_vetoes"
  ON public.governance_issued_vetoes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. governance_transition_approvals: Remove public ALL, add admin-only
DROP POLICY IF EXISTS "Public full access on governance_transition_approvals" ON public.governance_transition_approvals;
DROP POLICY IF EXISTS "Allow full access to governance_transition_approvals" ON public.governance_transition_approvals;
CREATE POLICY "Admins can manage governance_transition_approvals"
  ON public.governance_transition_approvals
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. governance_compliance_reports: Remove public ALL, add admin-only
DROP POLICY IF EXISTS "Public full access on governance_compliance_reports" ON public.governance_compliance_reports;
DROP POLICY IF EXISTS "Allow full access to governance_compliance_reports" ON public.governance_compliance_reports;
CREATE POLICY "Admins can manage governance_compliance_reports"
  ON public.governance_compliance_reports
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. governance_transition_votes: Remove public ALL, add admin-only
DROP POLICY IF EXISTS "Public full access on governance_transition_votes" ON public.governance_transition_votes;
DROP POLICY IF EXISTS "Allow full access to governance_transition_votes" ON public.governance_transition_votes;
CREATE POLICY "Admins can manage governance_transition_votes"
  ON public.governance_transition_votes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. decode_search_results: Fix misnamed public policy to actual service_role restriction
DROP POLICY IF EXISTS "Service role full access on decode_search_results" ON public.decode_search_results;
-- No replacement needed — service_role bypasses RLS automatically

-- 8. nexus_traces: Fix misnamed public policy
DROP POLICY IF EXISTS "Service role full access on nexus_traces" ON public.nexus_traces;

-- 9. nexus_provider_affinity: Fix misnamed public policy
DROP POLICY IF EXISTS "Service role full access on nexus_provider_affinity" ON public.nexus_provider_affinity;

-- 10. nexus_anomalies: Fix misnamed public policy
DROP POLICY IF EXISTS "Service role full access on nexus_anomalies" ON public.nexus_anomalies;

-- 11. lovable_ai_usage: Fix misnamed public policy
DROP POLICY IF EXISTS "Service role full access on lovable_ai_usage" ON public.lovable_ai_usage;

-- 12. tsac_training_feedback: Fix misnamed public policy
DROP POLICY IF EXISTS "Service role full access on tsac_training_feedback" ON public.tsac_training_feedback;

-- 13. evolution_pre_metrics: Fix misnamed public policy
DROP POLICY IF EXISTS "Service role full access on evolution_pre_metrics" ON public.evolution_pre_metrics;

-- 14. v_user_summary: Remove public read, add user-scoped read
DROP POLICY IF EXISTS "Public read v_user_summary" ON public.v_user_summary;
CREATE POLICY "Users can read own summary"
  ON public.v_user_summary
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 15. pf_image_outputs: Remove public SELECT (keep existing user-scoped policies)
DROP POLICY IF EXISTS "Public read pf_image_outputs" ON public.pf_image_outputs;
DROP POLICY IF EXISTS "Anyone can view image outputs" ON public.pf_image_outputs;

-- 16. pf_video_outputs: Remove public SELECT
DROP POLICY IF EXISTS "Public read pf_video_outputs" ON public.pf_video_outputs;
DROP POLICY IF EXISTS "Anyone can view video outputs" ON public.pf_video_outputs;

-- 17. pf_text_outputs: Remove public SELECT
DROP POLICY IF EXISTS "Public read pf_text_outputs" ON public.pf_text_outputs;
DROP POLICY IF EXISTS "Anyone can view text outputs" ON public.pf_text_outputs;

-- Ensure RLS is enabled on all affected tables (idempotent)
ALTER TABLE IF EXISTS public.control_plane_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.governance_transition_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.governance_issued_vetoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.governance_transition_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.governance_compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.governance_transition_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.decode_search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nexus_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nexus_provider_affinity ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nexus_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lovable_ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tsac_training_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evolution_pre_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.v_user_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pf_image_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pf_video_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pf_text_outputs ENABLE ROW LEVEL SECURITY;
