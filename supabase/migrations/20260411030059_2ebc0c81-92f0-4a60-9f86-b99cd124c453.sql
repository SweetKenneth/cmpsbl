
-- 1. brain_memory_hot: Fix NULL user_id bypass
DROP POLICY IF EXISTS "Users can read their own hot memories" ON public.brain_memory_hot;
DROP POLICY IF EXISTS "Anyone can read hot memories" ON public.brain_memory_hot;
DROP POLICY IF EXISTS "Authenticated users can read hot memories" ON public.brain_memory_hot;
CREATE POLICY "Users can read own hot memories"
  ON public.brain_memory_hot FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. brain_memory_warm: Fix NULL user_id bypass
DROP POLICY IF EXISTS "Users can read their own warm memories" ON public.brain_memory_warm;
DROP POLICY IF EXISTS "Anyone can read warm memories" ON public.brain_memory_warm;
DROP POLICY IF EXISTS "Authenticated users can read warm memories" ON public.brain_memory_warm;
CREATE POLICY "Users can read own warm memories"
  ON public.brain_memory_warm FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3. brain_memory_cold: Fix NULL user_id bypass
DROP POLICY IF EXISTS "Users can read their own cold memories" ON public.brain_memory_cold;
DROP POLICY IF EXISTS "Anyone can read cold memories" ON public.brain_memory_cold;
DROP POLICY IF EXISTS "Authenticated users can read cold memories" ON public.brain_memory_cold;
CREATE POLICY "Users can read own cold memories"
  ON public.brain_memory_cold FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 4. brain_memory_archive: Fix NULL user_id bypass
DROP POLICY IF EXISTS "Users can read their own archive memories" ON public.brain_memory_archive;
DROP POLICY IF EXISTS "Anyone can read archive memories" ON public.brain_memory_archive;
DROP POLICY IF EXISTS "Authenticated users can read archive memories" ON public.brain_memory_archive;
CREATE POLICY "Users can read own archive memories"
  ON public.brain_memory_archive FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 5. brain_memory_meta: Fix NULL user_id bypass
DROP POLICY IF EXISTS "Users can read their own meta memories" ON public.brain_memory_meta;
DROP POLICY IF EXISTS "Anyone can read meta memories" ON public.brain_memory_meta;
DROP POLICY IF EXISTS "Authenticated users can read meta memories" ON public.brain_memory_meta;
CREATE POLICY "Users can read own meta memories"
  ON public.brain_memory_meta FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 6. brain_memory_contradictions: Fix NULL user_id bypass
DROP POLICY IF EXISTS "Users can read their own contradictions" ON public.brain_memory_contradictions;
DROP POLICY IF EXISTS "Anyone can read contradictions" ON public.brain_memory_contradictions;
DROP POLICY IF EXISTS "Authenticated users can read contradictions" ON public.brain_memory_contradictions;
CREATE POLICY "Users can read own contradictions"
  ON public.brain_memory_contradictions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 7. immune_intelligence_events: Remove public read, restrict to admin
DROP POLICY IF EXISTS "Anyone can read intelligence events" ON public.immune_intelligence_events;
DROP POLICY IF EXISTS "Public read intelligence events" ON public.immune_intelligence_events;
CREATE POLICY "Admins can read intelligence events"
  ON public.immune_intelligence_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 8. brain_daily_reports: Replace authenticated-read-all with admin-only
DROP POLICY IF EXISTS "Authenticated read brain_daily_reports" ON public.brain_daily_reports;
DROP POLICY IF EXISTS "Admins can read brain_daily_reports" ON public.brain_daily_reports;
CREATE POLICY "Admins can read brain_daily_reports"
  ON public.brain_daily_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
