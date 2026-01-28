-- ============================================
-- Security Fix: Error-Level Issues
-- 1. profiles - restrict to owner-only access
-- 2. cascade_conversations - remove email-based access loophole
-- 3. substrate_usage_meters - enable RLS with developer access
-- ============================================

-- ============================================
-- FIX 1: profiles table - restrict to owner only
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create secure owner-only SELECT policy
CREATE POLICY "Owner can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Ensure admins can also view profiles for support purposes
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

-- ============================================
-- FIX 2: cascade_conversations - remove email-based loophole
-- ============================================

-- Drop the vulnerable policies that allow email-based access
DROP POLICY IF EXISTS "Users can view own conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Owner can update conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.cascade_conversations;

-- Create secure user_id-based policies only (no email fallback)
CREATE POLICY "Owner can view own conversations"
  ON public.cascade_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations"
  ON public.cascade_conversations FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

CREATE POLICY "Owner can update own conversations"
  ON public.cascade_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert own conversations"
  ON public.cascade_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete own conversations"
  ON public.cascade_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- FIX 3: substrate_usage_meters - enable RLS
-- ============================================

-- Enable RLS on the table
ALTER TABLE public.substrate_usage_meters ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners
ALTER TABLE public.substrate_usage_meters FORCE ROW LEVEL SECURITY;

-- Create secure policies - developers can only see their own usage
CREATE POLICY "Developers can view own usage metrics"
  ON public.substrate_usage_meters FOR SELECT
  TO authenticated
  USING (developer_id = auth.uid()::text);

CREATE POLICY "Developers can insert own usage metrics"
  ON public.substrate_usage_meters FOR INSERT
  TO authenticated
  WITH CHECK (developer_id = auth.uid()::text);

CREATE POLICY "Developers can update own usage metrics"
  ON public.substrate_usage_meters FOR UPDATE
  TO authenticated
  USING (developer_id = auth.uid()::text);

-- Admins can view all usage for analytics
CREATE POLICY "Admins can view all usage metrics"
  ON public.substrate_usage_meters FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

-- Service role (edge functions) can manage all usage
CREATE POLICY "Service role manages usage metrics"
  ON public.substrate_usage_meters FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);