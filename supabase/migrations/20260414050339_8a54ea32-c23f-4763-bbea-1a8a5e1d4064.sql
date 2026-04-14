
-- PASS 2: Drop stale permissive policies that still have user_id IS NULL branch

-- brain_memory_warm
DROP POLICY IF EXISTS "Authenticated read own brain_memory_warm" ON public.brain_memory_warm;

-- brain_memory_cold
DROP POLICY IF EXISTS "Authenticated read own brain_memory_cold" ON public.brain_memory_cold;

-- brain_memory_archive
DROP POLICY IF EXISTS "Authenticated read own brain_memory_archive" ON public.brain_memory_archive;

-- brain_memory_meta (has old + new)
DROP POLICY IF EXISTS "Authenticated read own brain_memory_meta" ON public.brain_memory_meta;

-- brain_memory_contradictions (has old + new)
DROP POLICY IF EXISTS "Authenticated read own brain_memory_contradictions" ON public.brain_memory_contradictions;

-- Ensure correct policies exist on meta and contradictions (created in Pass 1 for hot/warm/cold/archive, but not meta/contradictions)
-- Check: contradictions already has "Users can read own contradictions" → good
-- Check: meta already has "Users can read own meta memories" → good

-- analytics_events: drop NULL branch policy + anon INSERT
DROP POLICY IF EXISTS "Authenticated read own analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Anon can insert analytics events" ON public.analytics_events;

-- Create proper analytics read policy
CREATE POLICY "Users can read own analytics events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- lex_registry: restrict SELECT to authenticated only (protects registrant_email from anon)
DROP POLICY IF EXISTS "Public read registry without email" ON public.lex_registry;

CREATE POLICY "Authenticated read registry"
ON public.lex_registry
FOR SELECT
TO authenticated
USING (true);

-- Allow anon to read only via a secure view (package lookup needs to work for unauthenticated Shield users)
CREATE OR REPLACE VIEW public.lex_registry_public AS
SELECT id, package_name, package_hash, status, registered_at, updated_at, metadata
FROM public.lex_registry;

-- Grant anon access to the view only
GRANT SELECT ON public.lex_registry_public TO anon;
