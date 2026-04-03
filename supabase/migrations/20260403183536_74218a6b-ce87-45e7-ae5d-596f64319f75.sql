
-- Fix 1: vault_promotions — restrict to admin only (internal substrate data)
DROP POLICY IF EXISTS "Authenticated users can view vault promotions" ON public.vault_promotions;
DROP POLICY IF EXISTS "Authenticated users can insert vault promotions" ON public.vault_promotions;
DROP POLICY IF EXISTS "Authenticated users can update vault promotions" ON public.vault_promotions;

CREATE POLICY "Admin can view vault promotions"
  ON public.vault_promotions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert vault promotions"
  ON public.vault_promotions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update vault promotions"
  ON public.vault_promotions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix 2: immune_escalations — restrict SELECT to admin only (security data)
DROP POLICY IF EXISTS "Authenticated read immune_escalations" ON public.immune_escalations;

CREATE POLICY "Admin can read immune_escalations"
  ON public.immune_escalations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix 3: brain_maintenance_log — remove anon INSERT (should be service_role only)
DROP POLICY IF EXISTS "Anon can insert brain_maintenance_log" ON public.brain_maintenance_log;
DROP POLICY IF EXISTS "Anon can read brain_maintenance_log" ON public.brain_maintenance_log;

CREATE POLICY "Service role insert brain_maintenance_log"
  ON public.brain_maintenance_log FOR INSERT
  TO service_role
  WITH CHECK (true);
