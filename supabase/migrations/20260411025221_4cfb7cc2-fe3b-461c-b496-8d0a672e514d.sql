
-- 1. compiled_products: Remove anonymous INSERT policy
DROP POLICY IF EXISTS "Anon insert compiled products" ON public.compiled_products;
DROP POLICY IF EXISTS "Anon insert compiled_products" ON public.compiled_products;
DROP POLICY IF EXISTS "Anyone can insert compiled_products" ON public.compiled_products;
DROP POLICY IF EXISTS "Public insert compiled_products" ON public.compiled_products;

-- Add admin-only insert policy
CREATE POLICY "Admins can insert compiled_products"
  ON public.compiled_products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. dream_sessions: Remove public read, restrict to admin
DROP POLICY IF EXISTS "Public read dream_sessions" ON public.dream_sessions;
DROP POLICY IF EXISTS "Anyone can read dream_sessions" ON public.dream_sessions;
DROP POLICY IF EXISTS "Public read on dream_sessions" ON public.dream_sessions;

CREATE POLICY "Admins can read dream_sessions"
  ON public.dream_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. substrate_install_config: Remove public read, restrict to admin
DROP POLICY IF EXISTS "Anyone can view install config" ON public.substrate_install_config;
DROP POLICY IF EXISTS "Public read substrate_install_config" ON public.substrate_install_config;
DROP POLICY IF EXISTS "Anyone can read substrate_install_config" ON public.substrate_install_config;

CREATE POLICY "Admins can read substrate_install_config"
  ON public.substrate_install_config FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
