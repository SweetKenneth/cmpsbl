
-- Fix 1: profiles SELECT policy - remove auth.uid() = id condition
DROP POLICY IF EXISTS "profiles_select_owner_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_owner_or_admin" ON public.profiles
  FOR SELECT USING (
    (auth.uid() = user_id) OR has_role_text(auth.uid(), 'admin')
  );

-- Fix 2: cascade_conversations - remove anonymous insert policies
-- Drop the permissive policies that allow anonymous/null user_id inserts
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Authenticated insert own conversations" ON public.cascade_conversations;

-- Recreate with strict auth requirement
CREATE POLICY "Authenticated insert own conversations" ON public.cascade_conversations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR
      user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    )
  );
