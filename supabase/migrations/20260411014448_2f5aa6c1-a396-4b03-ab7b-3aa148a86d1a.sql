
-- 1. Fix tenants: remove public SELECT, restrict to authenticated
DROP POLICY IF EXISTS "Anyone can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Public can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Tenants are viewable by everyone" ON public.tenants;

-- Find and replace with authenticated-only policy
CREATE POLICY "Authenticated users can view tenants"
  ON public.tenants
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Fix memory_stream_config: remove public INSERT/UPDATE, restrict to admin
DROP POLICY IF EXISTS "Anyone can insert memory_stream_config" ON public.memory_stream_config;
DROP POLICY IF EXISTS "Anyone can update memory_stream_config" ON public.memory_stream_config;
DROP POLICY IF EXISTS "Public can insert memory_stream_config" ON public.memory_stream_config;
DROP POLICY IF EXISTS "Public can update memory_stream_config" ON public.memory_stream_config;
DROP POLICY IF EXISTS "Allow public insert" ON public.memory_stream_config;
DROP POLICY IF EXISTS "Allow public update" ON public.memory_stream_config;
DROP POLICY IF EXISTS "Allow insert" ON public.memory_stream_config;
DROP POLICY IF EXISTS "Allow update" ON public.memory_stream_config;

CREATE POLICY "Admins can insert memory_stream_config"
  ON public.memory_stream_config
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update memory_stream_config"
  ON public.memory_stream_config
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix dream_cycle_logs: remove public SELECT, restrict to authenticated
DROP POLICY IF EXISTS "Public can view dream cycle logs" ON public.dream_cycle_logs;
DROP POLICY IF EXISTS "Anyone can view dream_cycle_logs" ON public.dream_cycle_logs;
DROP POLICY IF EXISTS "Allow public read" ON public.dream_cycle_logs;
DROP POLICY IF EXISTS "Public read dream_cycle_logs" ON public.dream_cycle_logs;
DROP POLICY IF EXISTS "Anon can view dream cycle logs" ON public.dream_cycle_logs;

CREATE POLICY "Authenticated users can view dream_cycle_logs"
  ON public.dream_cycle_logs
  FOR SELECT
  TO authenticated
  USING (true);
