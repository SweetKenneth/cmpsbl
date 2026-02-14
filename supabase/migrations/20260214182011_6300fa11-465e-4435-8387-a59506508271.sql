-- Fix permissive INSERT policy on system_updates
DROP POLICY IF EXISTS "Admin can insert updates" ON public.system_updates;

CREATE POLICY "Admin can insert updates" ON public.system_updates 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));