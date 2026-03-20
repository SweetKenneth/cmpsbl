
-- Allow admin role to read backups (in addition to governor)
CREATE POLICY "Admin can read backups"
ON public.daily_backups
FOR SELECT
USING (has_role_text(auth.uid(), 'admin'));

-- Allow admin role to delete backups (for pruning)
CREATE POLICY "Admin can delete backups"
ON public.daily_backups
FOR DELETE
USING (has_role_text(auth.uid(), 'admin'));
