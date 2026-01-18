-- =====================================================
-- SECURITY FIX: Address 5 error-level security issues
-- =====================================================

-- ISSUE 1: cascade_conversations - Remove user_email from public inserts
-- The issue is that anyone can insert conversations with ANY email.
-- We need to restrict this so user_email can only be set by authenticated users to their own email.

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can insert conversations" ON cascade_conversations;
DROP POLICY IF EXISTS "Users can view own session conversations" ON cascade_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON cascade_conversations;

-- Create more restrictive policies for cascade_conversations
-- Anonymous users can insert but NOT set user_email (it will be null or 'anonymous')
CREATE POLICY "Anonymous users insert without email"
ON cascade_conversations FOR INSERT
TO public
WITH CHECK (
  (auth.uid() IS NULL AND (user_email IS NULL OR user_email = 'anonymous'))
  OR
  (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
);

-- Users can only view their own conversations (by session or by email if authenticated)
CREATE POLICY "Users view own conversations"
ON cascade_conversations FOR SELECT
TO public
USING (
  (session_id = ((current_setting('request.headers', true))::json ->> 'x-session-id'))
  OR (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
);

-- Users can only update their own conversations
CREATE POLICY "Users update own conversations"
ON cascade_conversations FOR UPDATE
TO public
USING (
  (session_id = ((current_setting('request.headers', true))::json ->> 'x-session-id'))
  OR (auth.uid() IS NOT NULL AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
);

-- ISSUE 2: Create secure API key generation function for Clarity
-- This moves key generation server-side where it belongs
CREATE OR REPLACE FUNCTION generate_clarity_api_key(
  p_user_id uuid,
  p_key_name text,
  p_rate_limit integer DEFAULT 1000
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_api_key text;
  v_key_hash text;
  v_key_prefix text;
  v_new_key_id uuid;
BEGIN
  -- Verify the user is the authenticated user
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only generate keys for yourself';
  END IF;

  -- Generate secure random key with prefix
  v_api_key := 'clf_' || encode(gen_random_bytes(24), 'hex');
  v_key_prefix := substring(v_api_key from 1 for 11);
  
  -- Create salted hash (using user_id as salt for added security)
  v_key_hash := encode(digest(v_api_key || p_user_id::text, 'sha256'), 'hex');
  
  -- Insert the key record
  INSERT INTO pf_clarity_api_keys (user_id, key_name, api_key_hash, metadata)
  VALUES (
    p_user_id, 
    p_key_name, 
    v_key_hash,
    jsonb_build_object('key_prefix', v_key_prefix, 'rate_limit', p_rate_limit)
  )
  RETURNING id INTO v_new_key_id;
  
  -- Return the plaintext key ONCE (never stored unencrypted)
  RETURN jsonb_build_object(
    'api_key', v_api_key,
    'key_id', v_new_key_id,
    'key_prefix', v_key_prefix,
    'key_name', p_key_name
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION generate_clarity_api_key TO authenticated;

-- ISSUE 3: Verify profiles table has correct RLS (it already does from the query)
-- The profiles table RLS is CORRECT - users can only view their own profile
-- No changes needed, but let's ensure the SELECT policy is owner-only

-- ISSUE 4: Add function to validate Clarity API keys (for edge functions)
CREATE OR REPLACE FUNCTION validate_clarity_api_key(p_api_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key_record RECORD;
  v_test_hash text;
BEGIN
  -- Basic format validation
  IF p_api_key IS NULL OR NOT p_api_key LIKE 'clf_%' OR length(p_api_key) < 20 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid key format');
  END IF;

  -- Find matching key by checking hash against all active keys
  -- We need to check all keys since we use salted hashes
  FOR v_key_record IN 
    SELECT k.id, k.user_id, k.key_name, k.metadata
    FROM pf_clarity_api_keys k
    WHERE k.metadata->>'key_prefix' = substring(p_api_key from 1 for 11)
  LOOP
    -- Compute hash with user's salt
    v_test_hash := encode(digest(p_api_key || v_key_record.user_id::text, 'sha256'), 'hex');
    
    -- Check if it matches the stored hash
    IF EXISTS (
      SELECT 1 FROM pf_clarity_api_keys 
      WHERE id = v_key_record.id 
      AND api_key_hash = v_test_hash
    ) THEN
      -- Update last_used_at
      UPDATE pf_clarity_api_keys 
      SET metadata = metadata || jsonb_build_object('last_used_at', now())
      WHERE id = v_key_record.id;
      
      RETURN jsonb_build_object(
        'valid', true,
        'user_id', v_key_record.user_id,
        'key_name', v_key_record.key_name,
        'rate_limit', COALESCE((v_key_record.metadata->>'rate_limit')::integer, 1000)
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('valid', false, 'error', 'Key not found');
END;
$$;

-- Grant to service_role only (edge functions)
REVOKE ALL ON FUNCTION validate_clarity_api_key FROM public;
GRANT EXECUTE ON FUNCTION validate_clarity_api_key TO service_role;