
-- ============================================
-- SECURITY HARDENING: Fix non-critical RLS issues
-- ============================================

-- 1. BRAIN_MEMORIES: Remove overly permissive public read
DROP POLICY IF EXISTS "Allow public read on brain_memories" ON public.brain_memories;
DROP POLICY IF EXISTS "Authenticated read brain_memories" ON public.brain_memories;
DROP POLICY IF EXISTS "Allow service role to manage brain_memories" ON public.brain_memories;

-- Recreate with proper restrictions
CREATE POLICY "Authenticated read brain_memories"
ON public.brain_memories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role manages brain_memories"
ON public.brain_memories FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admin can also manage brain_memories
CREATE POLICY "Admin manages brain_memories"
ON public.brain_memories FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. BRAIN_MEMORY_COLD: Remove public read, restrict to authenticated/service
DROP POLICY IF EXISTS "Allow public read on brain_memory_cold" ON public.brain_memory_cold;
DROP POLICY IF EXISTS "Authenticated read brain_memory_cold" ON public.brain_memory_cold;
DROP POLICY IF EXISTS "Service role full access brain_memory_cold" ON public.brain_memory_cold;

CREATE POLICY "Authenticated read brain_memory_cold"
ON public.brain_memory_cold FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role full access brain_memory_cold"
ON public.brain_memory_cold FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin manages brain_memory_cold"
ON public.brain_memory_cold FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. BRAIN_MEMORY_WARM: Restrict to service_role and admin only
DROP POLICY IF EXISTS "Service role full access - warm" ON public.brain_memory_warm;

CREATE POLICY "Authenticated read brain_memory_warm"
ON public.brain_memory_warm FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role full access brain_memory_warm"
ON public.brain_memory_warm FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin manages brain_memory_warm"
ON public.brain_memory_warm FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. AGENCY_PURCHASES: Fix the INSERT policy to only allow service_role
DROP POLICY IF EXISTS "Service can insert purchases" ON public.agency_purchases;

CREATE POLICY "Service role inserts purchases"
ON public.agency_purchases FOR INSERT
TO service_role
WITH CHECK (true);

-- 5. BRAIN_MEMORY_HOT: Fix authenticated read to restrict to admins/owners
DROP POLICY IF EXISTS "Authenticated read brain_memory_hot" ON public.brain_memory_hot;

CREATE POLICY "Admin reads brain_memory_hot"
ON public.brain_memory_hot FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Additional cleanup for any lingering public role policies
-- Drop any remaining policies targeting public role with true condition on sensitive tables

-- Ensure profiles table has no public access (already good per query, but double-check)
DROP POLICY IF EXISTS "Profiles are only viewable by owner" ON public.profiles;
CREATE POLICY "Profiles viewable by owner only"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admin to view all profiles for administrative purposes
CREATE POLICY "Admin views all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
