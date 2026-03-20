
-- Add admin read/write policies on backup_exports
CREATE POLICY "Admin can manage backup exports"
ON public.backup_exports
FOR ALL
USING (has_role_text(auth.uid(), 'admin'))
WITH CHECK (has_role_text(auth.uid(), 'admin'));

-- Add admin read/write policies on backup_import_log
CREATE POLICY "Admin can manage import logs"
ON public.backup_import_log
FOR ALL
USING (has_role_text(auth.uid(), 'admin'))
WITH CHECK (has_role_text(auth.uid(), 'admin'));
