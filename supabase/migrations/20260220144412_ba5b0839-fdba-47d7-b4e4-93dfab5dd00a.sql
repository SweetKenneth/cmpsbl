-- Fix immune_metrics RLS: allow anon inserts for shadow mesh telemetry
DROP POLICY IF EXISTS "system_insert_metrics" ON public.immune_metrics;
CREATE POLICY "anyone_can_insert_metrics"
  ON public.immune_metrics
  FOR INSERT
  WITH CHECK (true);

-- Also allow anon to read their own metrics for dashboard
DROP POLICY IF EXISTS "admin_read_metrics" ON public.immune_metrics;
CREATE POLICY "anyone_can_read_metrics"
  ON public.immune_metrics
  FOR SELECT
  USING (true);

-- Allow anon to delete for reset functionality
CREATE POLICY "admin_delete_metrics"
  ON public.immune_metrics
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::text));