
-- 1. memory_stream_config: drop the exact overly-permissive public policies
DROP POLICY IF EXISTS "Allow insert on memory stream config" ON public.memory_stream_config;
DROP POLICY IF EXISTS "Allow update on memory stream config" ON public.memory_stream_config;

-- 2. tenants: drop the exact public SELECT policy
DROP POLICY IF EXISTS "Public read tenants" ON public.tenants;

-- 3. evolution_repair_log: restrict public read to admin only
DROP POLICY IF EXISTS "Anyone can read repair logs" ON public.evolution_repair_log;

CREATE POLICY "Admins can read repair logs"
  ON public.evolution_repair_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
