-- Fix: dream_eater_audit - admin read-only, service role handles inserts
CREATE POLICY "Admin can read dream_eater_audit"
  ON public.dream_eater_audit FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Fix: passkey_challenges - no direct client access, managed by edge function via service role
-- Allow authenticated users to read their own challenges by session (needed for passkey flow)
CREATE POLICY "No direct client access to passkey_challenges"
  ON public.passkey_challenges FOR SELECT
  TO authenticated
  USING (false);