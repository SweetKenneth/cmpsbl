-- ==============================================
-- SECURITY FIX: Harden RLS policies for sensitive tables
-- ==============================================

-- 1. FIX: profiles table - remove any public access policies
-- The "Profiles viewable by owner only" and multiple SELECT policies create confusion
-- Keep only owner-based access + admin access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;

-- 2. FIX: accessibility_scans table - remove public read access
-- Only allow users to see their own scans, or service role for edge functions
DROP POLICY IF EXISTS "Allow public read access to accessibility scans" ON public.accessibility_scans;

-- 3. FIX: cascade_conversations table - tighten anonymous access
-- Remove the anonymous fallback that exposes conversations
DROP POLICY IF EXISTS "Secure select conversations" ON public.cascade_conversations;

-- Create a stricter policy that only allows:
-- - Authenticated users to see their own conversations
-- - Service role for edge functions
CREATE POLICY "Users can view own conversations"
  ON public.cascade_conversations
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
    OR (auth.role() = 'service_role')
  );

-- 4. cascade_dreams - public read is INTENTIONAL for the Dream-Eater feed
-- Service role already has write restrictions - this is acceptable
-- No changes needed for cascade_dreams