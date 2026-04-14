-- PHASE 4: Enterprise Security Hardening
-- Fixes 2 critical scan findings + tightens remaining always-true policies

-- FIX 1: decode_search_results — revoke broad authenticated read
DROP POLICY IF EXISTS "Authenticated read decode_search_results" ON public.decode_search_results;
DROP POLICY IF EXISTS "Service role manages decode_search_results" ON public.decode_search_results;

CREATE POLICY "Governor reads decode_search_results"
  ON public.decode_search_results FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

CREATE POLICY "Service role manages decode_search_results"
  ON public.decode_search_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- FIX 2: Tighten remaining overly-permissive INSERT/UPDATE/DELETE policies

-- agency_purchases: INSERT scoped to purchasing user
DROP POLICY IF EXISTS "Users can insert purchases" ON public.agency_purchases;
CREATE POLICY "Users can insert own purchases"
  ON public.agency_purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- activation_audit_log: INSERT scoped to acting user
DROP POLICY IF EXISTS "Users can insert activation audit logs" ON public.activation_audit_log;
CREATE POLICY "Users can insert own activation audit logs"
  ON public.activation_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- agent_competency: updates admin-only
DROP POLICY IF EXISTS "Authenticated update agent_competency" ON public.agent_competency;
CREATE POLICY "Admin manages agent_competency"
  ON public.agent_competency FOR UPDATE
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'))
  WITH CHECK (public.has_role_text(auth.uid(), 'admin'));

-- agency_economics: admin-only
DROP POLICY IF EXISTS "Authenticated insert agency_economics" ON public.agency_economics;
DROP POLICY IF EXISTS "Authenticated update agency_economics" ON public.agency_economics;
CREATE POLICY "Admin manages agency_economics"
  ON public.agency_economics FOR ALL
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'))
  WITH CHECK (public.has_role_text(auth.uid(), 'admin'));

-- agency_agent_telemetry: admin-only
DROP POLICY IF EXISTS "Authenticated insert agency_agent_telemetry" ON public.agency_agent_telemetry;
DROP POLICY IF EXISTS "Authenticated update agency_agent_telemetry" ON public.agency_agent_telemetry;
CREATE POLICY "Admin manages agency_agent_telemetry"
  ON public.agency_agent_telemetry FOR ALL
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'))
  WITH CHECK (public.has_role_text(auth.uid(), 'admin'));