
-- Fix nexus_provider_health: "Service role full access" policy is too permissive
-- It uses roles={public} which includes anon. Restrict to service_role only.
DROP POLICY IF EXISTS "Service role full access" ON public.nexus_provider_health;
CREATE POLICY "Service role full access" ON public.nexus_provider_health
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Fix nexus_cost_ledger: same issue
DROP POLICY IF EXISTS "Service role full access" ON public.nexus_cost_ledger;
CREATE POLICY "Service role full access" ON public.nexus_cost_ledger
  FOR ALL TO service_role USING (true) WITH CHECK (true);
