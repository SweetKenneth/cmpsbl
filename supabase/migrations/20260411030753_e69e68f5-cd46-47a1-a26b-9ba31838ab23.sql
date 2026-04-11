
-- 1. tenants: Restrict from all-authenticated to admin-only
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Anyone can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Public read tenants" ON public.tenants;
CREATE POLICY "Admins can view tenants"
  ON public.tenants FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. pf_media_cache: Restrict from public to authenticated-only
DROP POLICY IF EXISTS "Users can access media cache" ON public.pf_media_cache;
DROP POLICY IF EXISTS "Anyone can access media cache" ON public.pf_media_cache;
DROP POLICY IF EXISTS "Public read media cache" ON public.pf_media_cache;
CREATE POLICY "Authenticated users can access media cache"
  ON public.pf_media_cache FOR SELECT TO authenticated
  USING (true);

-- 3. core_settings: Restrict from public to admin-only
DROP POLICY IF EXISTS "Public read core_settings" ON public.core_settings;
DROP POLICY IF EXISTS "Anyone can read core_settings" ON public.core_settings;
CREATE POLICY "Admins can read core_settings"
  ON public.core_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
