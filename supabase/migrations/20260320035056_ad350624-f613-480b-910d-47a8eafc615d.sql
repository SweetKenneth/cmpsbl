
-- scan_finding_trends: Restrict INSERT to admin (not public)
DROP POLICY IF EXISTS "System can insert trends" ON public.scan_finding_trends;
CREATE POLICY "Admin can insert trends"
  ON public.scan_finding_trends
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role_text(auth.uid(), 'admin'));

-- cognitive_orders: Restrict open UPDATE to admin (was service_role label but USING true)
DROP POLICY IF EXISTS "Service role can update cognitive orders" ON public.cognitive_orders;
CREATE POLICY "Admin can update cognitive orders"
  ON public.cognitive_orders
  FOR UPDATE
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'))
  WITH CHECK (public.has_role_text(auth.uid(), 'admin'));
