-- Allow authenticated users to insert into brain_maintenance_log
CREATE POLICY "Authenticated users can insert maintenance logs"
ON public.brain_maintenance_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to read their own maintenance logs
CREATE POLICY "Authenticated users can read maintenance logs"
ON public.brain_maintenance_log
FOR SELECT
TO authenticated
USING (true);