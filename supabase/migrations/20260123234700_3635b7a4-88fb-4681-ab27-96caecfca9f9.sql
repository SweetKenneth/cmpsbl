-- Fix security issues with RLS policies

-- ============================================
-- 1. FIX agency_api_calls - Remove overly permissive service role policy
-- ============================================

-- Drop the overly permissive service role policy that allows public access
DROP POLICY IF EXISTS "Service role can manage API calls" ON public.agency_api_calls;

-- Create a proper admin-only policy for service role operations
CREATE POLICY "Admin service role can manage API calls"
ON public.agency_api_calls
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. FIX brain_events - Remove public read access
-- ============================================

-- Drop all the problematic policies
DROP POLICY IF EXISTS "Allow public read on brain_events" ON public.brain_events;
DROP POLICY IF EXISTS "Authenticated read brain_events" ON public.brain_events;
DROP POLICY IF EXISTS "Service role full access brain_events" ON public.brain_events;
DROP POLICY IF EXISTS "Service role full access to brain_events" ON public.brain_events;
DROP POLICY IF EXISTS "Service role only access for brain_events" ON public.brain_events;

-- Create proper admin-only policies
-- Only admins can read brain_events
CREATE POLICY "Admins can read brain_events"
ON public.brain_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Service role can manage brain_events (for edge functions)
CREATE POLICY "Service role manages brain_events"
ON public.brain_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);