
-- ============================================================
-- FIX 1: agency_members — restrict anon SELECT on deployed agencies
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view members for deployed agencies" ON public.agency_members;
CREATE POLICY "Authenticated can view members for deployed agencies"
ON public.agency_members FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM agencies
  WHERE agencies.id = agency_members.agency_id
    AND agencies.status = 'deployed'
    AND agencies.slug IS NOT NULL
));

-- Fix agency_members ALL and SELECT from public → authenticated
DROP POLICY IF EXISTS "Manage agency members" ON public.agency_members;
CREATE POLICY "Manage agency members"
ON public.agency_members FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM agencies
  WHERE agencies.id = agency_members.agency_id
    AND (agencies.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'))
))
WITH CHECK (EXISTS (
  SELECT 1 FROM agencies
  WHERE agencies.id = agency_members.agency_id
    AND (agencies.owner_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

DROP POLICY IF EXISTS "View agency members" ON public.agency_members;

-- ============================================================
-- FIX 2: agency_tasks — restrict anon SELECT on deployed agencies
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view tasks for deployed agencies" ON public.agency_tasks;
CREATE POLICY "Authenticated can view tasks for deployed agencies"
ON public.agency_tasks FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM agencies
  WHERE agencies.id = agency_tasks.agency_id
    AND agencies.status = 'deployed'
    AND agencies.slug IS NOT NULL
));

-- Fix agency_tasks INSERT/DELETE/UPDATE/SELECT from public → authenticated
DROP POLICY IF EXISTS "Users can insert tasks for agencies they own" ON public.agency_tasks;
CREATE POLICY "Users can insert tasks for agencies they own"
ON public.agency_tasks FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM agencies
  WHERE agencies.id = agency_tasks.agency_id
    AND agencies.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete tasks for agencies they own" ON public.agency_tasks;
CREATE POLICY "Users can delete tasks for agencies they own"
ON public.agency_tasks FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM agencies
  WHERE agencies.id = agency_tasks.agency_id
    AND agencies.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update tasks for agencies they own" ON public.agency_tasks;
CREATE POLICY "Users can update tasks for agencies they own"
ON public.agency_tasks FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM agencies
  WHERE agencies.id = agency_tasks.agency_id
    AND agencies.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can view tasks for agencies they own" ON public.agency_tasks;
CREATE POLICY "Users can view tasks for agencies they own"
ON public.agency_tasks FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM agencies
  WHERE agencies.id = agency_tasks.agency_id
    AND agencies.owner_id = auth.uid()
));

-- ============================================================
-- FIX 3: agencies — restrict INSERT/UPDATE/DELETE from public → authenticated
-- ============================================================
DROP POLICY IF EXISTS "Users can create agencies" ON public.agencies;
CREATE POLICY "Users can create agencies"
ON public.agencies FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

DROP POLICY IF EXISTS "Users can update own agencies" ON public.agencies;
CREATE POLICY "Users can update own agencies"
ON public.agencies FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view own agencies" ON public.agencies;
CREATE POLICY "Users can view own agencies"
ON public.agencies FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete agencies" ON public.agencies;
CREATE POLICY "Admins can delete agencies"
ON public.agencies FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Keep deployed agencies viewable by authenticated only
DROP POLICY IF EXISTS "Authenticated can view deployed agencies by slug" ON public.agencies;
CREATE POLICY "Authenticated can view deployed agencies by slug"
ON public.agencies FOR SELECT TO authenticated
USING (status = 'deployed' AND slug IS NOT NULL);

-- ============================================================
-- FIX 4: cognitive_registry — restrict from public → authenticated
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all cognitives" ON public.cognitive_registry;
CREATE POLICY "Admins can view all cognitives"
ON public.cognitive_registry FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

DROP POLICY IF EXISTS "Users can create their own cognitives" ON public.cognitive_registry;
CREATE POLICY "Users can create their own cognitives"
ON public.cognitive_registry FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner);

DROP POLICY IF EXISTS "Users can update their own cognitives" ON public.cognitive_registry;
CREATE POLICY "Users can update their own cognitives"
ON public.cognitive_registry FOR UPDATE TO authenticated
USING (auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete their own cognitives" ON public.cognitive_registry;
CREATE POLICY "Users can delete their own cognitives"
ON public.cognitive_registry FOR DELETE TO authenticated
USING (auth.uid() = owner);

DROP POLICY IF EXISTS "Users can view their own cognitives" ON public.cognitive_registry;
CREATE POLICY "Users can view their own cognitives"
ON public.cognitive_registry FOR SELECT TO authenticated
USING (auth.uid() = owner);

-- ============================================================
-- FIX 5: brain_memory_hot — remove public role SELECT, keep authenticated
-- ============================================================
DROP POLICY IF EXISTS "Admin and service can read brain_memory_hot" ON public.brain_memory_hot;
CREATE POLICY "Admin can read brain_memory_hot"
ON public.brain_memory_hot FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service role can write brain_memory_hot" ON public.brain_memory_hot;
CREATE POLICY "Service role can write brain_memory_hot"
ON public.brain_memory_hot FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- ============================================================
-- FIX 6: analytics_events — restrict to authenticated role
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert analytics events" ON public.analytics_events;
CREATE POLICY "Authenticated users can insert analytics events"
ON public.analytics_events FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read analytics events" ON public.analytics_events;
CREATE POLICY "Authenticated users can read analytics events"
ON public.analytics_events FOR SELECT TO authenticated
USING (true);

-- ============================================================
-- FIX 7: analytics_snapshots — restrict to authenticated role
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert snapshots" ON public.analytics_snapshots;
CREATE POLICY "Authenticated users can insert snapshots"
ON public.analytics_snapshots FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read snapshots" ON public.analytics_snapshots;
CREATE POLICY "Authenticated users can read snapshots"
ON public.analytics_snapshots FOR SELECT TO authenticated
USING (true);

-- ============================================================
-- FIX 8: activation_audit_log — restrict from public → authenticated
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own audit log" ON public.activation_audit_log;
CREATE POLICY "Users can insert own audit log"
ON public.activation_audit_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own audit log" ON public.activation_audit_log;
CREATE POLICY "Users can view own audit log"
ON public.activation_audit_log FOR SELECT TO authenticated
USING (auth.uid() = user_id);
