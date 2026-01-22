-- Fix profiles table RLS policies to protect email addresses
-- Remove the overly permissive public read policy

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create owner-only read access for full profile data (including email)
CREATE POLICY "Users can view their own full profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create a limited public view for display names only (no email)
-- Only allow viewing other users' display_name and avatar_url, never email
CREATE POLICY "Users can view limited profile info of others"
ON public.profiles FOR SELECT
TO authenticated
USING (
  -- User can always see their own profile
  auth.uid() = user_id
  -- This policy allows the query but application code should NOT select email for non-owners
);

-- Drop the duplicate policy since we combined them
DROP POLICY IF EXISTS "Users can view limited profile info of others" ON public.profiles;

-- Final clean policy: authenticated users can see all profiles but email is protected via application layer
-- For proper protection, we keep it simple: users can only SELECT their own profile
CREATE POLICY "Profiles are only viewable by owner"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure users can still update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);