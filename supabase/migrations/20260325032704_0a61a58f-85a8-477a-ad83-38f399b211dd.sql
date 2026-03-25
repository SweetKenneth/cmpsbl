-- Allow anon to INSERT into brain_maintenance_log (system telemetry, non-sensitive)
CREATE POLICY "Anon can insert brain_maintenance_log"
  ON public.brain_maintenance_log
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon to SELECT brain_maintenance_log for dashboard reads
CREATE POLICY "Anon can read brain_maintenance_log"
  ON public.brain_maintenance_log
  FOR SELECT
  TO anon
  USING (true);