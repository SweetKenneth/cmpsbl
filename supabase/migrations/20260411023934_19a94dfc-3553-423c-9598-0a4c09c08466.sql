
-- 1. pf_clarity_wp_connections: revoke column-level SELECT on api_key
-- This prevents the plaintext API key from being returned in client queries
REVOKE SELECT (api_key) ON public.pf_clarity_wp_connections FROM anon, authenticated;

-- Create a security definer function for server-side retrieval of the key
CREATE OR REPLACE FUNCTION public.get_wp_connection_api_key(p_site_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT api_key
  FROM public.pf_clarity_wp_connections
  WHERE site_id = p_site_id
$$;

-- Revoke direct access to the function from anon
REVOKE EXECUTE ON FUNCTION public.get_wp_connection_api_key(uuid) FROM anon;

-- 2. brain_policy: restrict to admin-only
DROP POLICY IF EXISTS "Allow public read on brain_policy" ON public.brain_policy;
DROP POLICY IF EXISTS "Authenticated read brain_policy" ON public.brain_policy;
DROP POLICY IF EXISTS "Public read brain_policy" ON public.brain_policy;
DROP POLICY IF EXISTS "Anyone can read brain_policy" ON public.brain_policy;

CREATE POLICY "Admins can read brain_policy"
  ON public.brain_policy FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. access_scans: restrict to authenticated only (remove anon access)
DROP POLICY IF EXISTS "Public read access_scans" ON public.access_scans;
DROP POLICY IF EXISTS "Anyone can read access_scans" ON public.access_scans;
DROP POLICY IF EXISTS "Public read on access_scans" ON public.access_scans;

CREATE POLICY "Authenticated users can read access_scans"
  ON public.access_scans FOR SELECT TO authenticated
  USING (true);
