-- Drop the current overly broad SELECT policy (targets public role including anon)
DROP POLICY IF EXISTS "profiles_select_owner_or_admin" ON public.profiles;

-- Recreate with authenticated-only access: owners see their own, admins see all
CREATE POLICY "profiles_select_owner_or_admin"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) OR public.has_role_text(auth.uid(), 'admin')
);

-- Document intent on captcha_challenges (RLS enabled, no policies = service_role only)
COMMENT ON TABLE public.captcha_challenges IS 'Service-role only. RLS enabled with no policies intentionally denies all non-service-role access.';

-- Document intent on device_fingerprint_snapshots
COMMENT ON TABLE public.device_fingerprint_snapshots IS 'Service-role only. RLS enabled with no policies intentionally denies all non-service-role access.';