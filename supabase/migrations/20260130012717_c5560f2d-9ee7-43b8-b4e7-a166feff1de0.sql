-- Allow authenticated users to read backups
CREATE POLICY "Authenticated users can read backups"
ON public.daily_backups
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated operators to manage their failsafe backups (update is_permanent, backup_category, notes)
CREATE POLICY "Authenticated users can update backup metadata"
ON public.daily_backups
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);