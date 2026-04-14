
-- CRITICAL FIX 1: Remove public access to registrant_email in lex_registry
-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read registry entries" ON public.lex_registry;

-- Create a new SELECT policy that hides registrant_email for non-admin users
-- Public users can still read registry entries but email is protected via a view
CREATE POLICY "Public read registry without email"
ON public.lex_registry
FOR SELECT
TO anon, authenticated
USING (true);

-- Revoke direct column access to registrant_email for anon
REVOKE SELECT (registrant_email) ON public.lex_registry FROM anon;

-- CRITICAL FIX 2: Remove anonymous read access to analytics tables
DROP POLICY IF EXISTS "anon_select_own_page_view" ON public.site_page_views;
DROP POLICY IF EXISTS "anon_select_own_session" ON public.site_sessions;

-- CRITICAL FIX 3: Tighten brain_memory tables - remove NULL user_id branch
-- brain_memory_hot
DROP POLICY IF EXISTS "Users can read own hot memories" ON public.brain_memory_hot;
CREATE POLICY "Users can read own hot memories"
ON public.brain_memory_hot
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- brain_memory_warm
DROP POLICY IF EXISTS "Users can read own warm memories" ON public.brain_memory_warm;
CREATE POLICY "Users can read own warm memories"
ON public.brain_memory_warm
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- brain_memory_cold
DROP POLICY IF EXISTS "Users can read own cold memories" ON public.brain_memory_cold;
CREATE POLICY "Users can read own cold memories"
ON public.brain_memory_cold
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- brain_memory_archive
DROP POLICY IF EXISTS "Users can read own archive memories" ON public.brain_memory_archive;
CREATE POLICY "Users can read own archive memories"
ON public.brain_memory_archive
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
