
-- 1. Fix nexus_traces: remove duplicate policy, restrict to admin-only read
DROP POLICY IF EXISTS "Authenticated read nexus_traces" ON public.nexus_traces;
DROP POLICY IF EXISTS "Authenticated read traces" ON public.nexus_traces;

CREATE POLICY "Admin read nexus_traces"
  ON public.nexus_traces
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix compiled_products: restrict management to admin only
DROP POLICY IF EXISTS "Governor can manage compiled products" ON public.compiled_products;

CREATE POLICY "Admin can manage compiled products"
  ON public.compiled_products
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix compiler_weights: restrict management to admin only
DROP POLICY IF EXISTS "Governor can manage compiler weights" ON public.compiler_weights;

CREATE POLICY "Admin can manage compiler weights"
  ON public.compiler_weights
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Fix compiler_feedback: restrict management to admin only
DROP POLICY IF EXISTS "Governor can manage compiler feedback" ON public.compiler_feedback;

CREATE POLICY "Admin can manage compiler feedback"
  ON public.compiler_feedback
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix system_updates: remove public read policy (admin read already exists)
DROP POLICY IF EXISTS "Public can read updates" ON public.system_updates;
