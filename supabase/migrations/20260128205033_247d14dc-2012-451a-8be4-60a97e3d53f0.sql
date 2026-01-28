-- ============================================
-- SECURITY FIX: v6.0.0 RLS & Function Hardening
-- ============================================

-- 1. FIX CRITICAL: has_role(text) function that always returns TRUE
-- This function bypasses all authorization - must be fixed immediately
DROP FUNCTION IF EXISTS public.has_role(text);

CREATE OR REPLACE FUNCTION public.has_role(role_name text) 
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text = role_name
  );
END;
$$;

-- 2. FIX: dream_feeder_submissions - Remove public read access for processed dreams
-- The table contains source_ip, user_agent, and submitter_name which is PII
-- Only admins should be able to read this data
DROP POLICY IF EXISTS "Anyone can read processed dreams" ON public.dream_feeder_submissions;

-- Only admins can read dream submissions (contains PII like IP, user agent)
CREATE POLICY "Admins can read dream submissions" 
ON public.dream_feeder_submissions 
FOR SELECT 
TO authenticated
USING (public.has_role_text(auth.uid(), 'admin'));

-- 3. FIX: cascade_conversations - Strengthen RLS
-- Drop weak policies and create strict owner-only access
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Public can insert conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Authenticated users can insert" ON public.cascade_conversations;

-- Strict SELECT: Only the owner can view their conversations (by email match)
CREATE POLICY "Owner can view conversations" 
ON public.cascade_conversations 
FOR SELECT 
TO authenticated
USING (
  user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR public.has_role_text(auth.uid(), 'admin')
);

-- Strict INSERT: Authenticated users only, must match their email
CREATE POLICY "Authenticated insert own conversations" 
ON public.cascade_conversations 
FOR INSERT 
TO authenticated
WITH CHECK (
  user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR user_email IS NULL -- Allow null for system messages
);

-- UPDATE: Only owner can update
CREATE POLICY "Owner can update conversations" 
ON public.cascade_conversations 
FOR UPDATE 
TO authenticated
USING (
  user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR public.has_role_text(auth.uid(), 'admin')
);

-- 4. FIX: profiles table - Ensure strict access control
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;

-- Users can only view their own profile, admins can view all
CREATE POLICY "Users view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid() 
  OR public.has_role_text(auth.uid(), 'admin')
);