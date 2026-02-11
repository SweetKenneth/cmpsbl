-- Fix audit_logs: restrict public read to admins only
DROP POLICY IF EXISTS "Allow public read on audit_logs" ON public.audit_logs;

CREATE POLICY "Admins can read audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));