-- Fix cascade_conversations RLS policies - remove insecure header-based session access
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users view own conversations" ON cascade_conversations;
DROP POLICY IF EXISTS "Users update own conversations" ON cascade_conversations;
DROP POLICY IF EXISTS "Anonymous users insert without email" ON cascade_conversations;
DROP POLICY IF EXISTS "Secure conversation insert" ON cascade_conversations;
DROP POLICY IF EXISTS "Secure conversation select" ON cascade_conversations;

-- Keep service role full access
-- Already exists: "Service role full access cascade_conversations"

-- Create secure INSERT policy (authenticated users only set their email, anon is null/anonymous)
CREATE POLICY "Secure insert conversations"
ON cascade_conversations FOR INSERT
TO public
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NULL THEN 
      (user_email IS NULL OR user_email = 'anonymous')
    ELSE 
      user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
      OR user_email IS NULL 
      OR user_email = 'anonymous'
  END
);

-- Create secure SELECT policy - NO header trust, auth-based only
CREATE POLICY "Secure select conversations"
ON cascade_conversations FOR SELECT
TO public
USING (
  -- Authenticated users see their own conversations
  (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
  OR
  -- Anyone can see anonymous conversations (protected: no email exposed)
  (user_email IS NULL OR user_email = 'anonymous')
);

-- Create secure UPDATE policy - auth-based only
CREATE POLICY "Secure update conversations"
ON cascade_conversations FOR UPDATE
TO public
USING (
  (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
);

-- Fix substrate_developer_keys RLS using developer_id column
DROP POLICY IF EXISTS "Allow all" ON substrate_developer_keys;
DROP POLICY IF EXISTS "Public access" ON substrate_developer_keys;
DROP POLICY IF EXISTS "Developer can view own keys" ON substrate_developer_keys;
DROP POLICY IF EXISTS "Developer can insert own keys" ON substrate_developer_keys;
DROP POLICY IF EXISTS "Developer can update own keys" ON substrate_developer_keys;
DROP POLICY IF EXISTS "Developer can delete own keys" ON substrate_developer_keys;

ALTER TABLE substrate_developer_keys ENABLE ROW LEVEL SECURITY;

-- Developer-owned keys: developer_id matches authenticated user id
CREATE POLICY "Developer can view own keys"
ON substrate_developer_keys FOR SELECT
TO authenticated
USING (developer_id = auth.uid()::text);

CREATE POLICY "Developer can insert own keys"
ON substrate_developer_keys FOR INSERT
TO authenticated
WITH CHECK (developer_id = auth.uid()::text);

CREATE POLICY "Developer can update own keys"
ON substrate_developer_keys FOR UPDATE
TO authenticated
USING (developer_id = auth.uid()::text);

CREATE POLICY "Developer can delete own keys"
ON substrate_developer_keys FOR DELETE
TO authenticated
USING (developer_id = auth.uid()::text);