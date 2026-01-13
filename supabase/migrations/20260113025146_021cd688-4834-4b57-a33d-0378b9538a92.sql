-- ============================================
-- SECURITY HARDENING MIGRATION - Final Fixes
-- Fixes: Broken has_role(text), cascade_conversations public exposure
-- ============================================

-- 1. DROP broken has_role(text) function that always returns TRUE
DROP FUNCTION IF EXISTS public.has_role(text);

-- 2. Ensure has_role with proper signature has auth checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- SECURITY: Only allow checking own roles, or if caller is admin
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Allow checking own roles
  IF auth.uid() = _user_id THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    );
  END IF;
  
  -- Allow admins to check any user's roles
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    );
  END IF;
  
  -- Deny role info for other users
  RETURN false;
END;
$$;

-- 3. Re-apply generate_bot_sniper_api_key with auth validation
CREATE OR REPLACE FUNCTION public.generate_bot_sniper_api_key(p_user_id uuid, p_key_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_api_key TEXT;
  v_key_hash TEXT;
BEGIN
  -- SECURITY: Validate caller owns this user_id
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be authenticated';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only generate keys for yourself';
  END IF;

  -- Generate secure API key
  v_api_key := 'bs_' || encode(gen_random_bytes(32), 'hex');
  v_key_hash := encode(digest(v_api_key, 'sha256'), 'hex');

  INSERT INTO bot_sniper_api_keys (user_id, key_name, api_key_hash)
  VALUES (p_user_id, p_key_name, v_key_hash);

  RETURN v_api_key;
END;
$$;

-- 4. Re-apply update_ip_reputation with server-side risk calculation
CREATE OR REPLACE FUNCTION public.update_ip_reputation(
  p_ip text,
  p_action text,
  p_risk_score integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_risk_score INTEGER;
BEGIN
  -- SECURITY: Calculate risk score server-side based on action type
  -- Client-provided p_risk_score is IGNORED for security
  v_risk_score := CASE p_action
    WHEN 'block' THEN 50
    WHEN 'challenge' THEN 30
    WHEN 'rate_limit' THEN 20
    WHEN 'monitor' THEN 10
    WHEN 'allow' THEN 0
    ELSE 5
  END;

  INSERT INTO ip_reputation (ip, score, total_requests, blocked_count, last_seen, updated_at)
  VALUES (
    p_ip,
    GREATEST(0, LEAST(100, 50 - (v_risk_score / 2))),
    1,
    CASE WHEN p_action = 'block' THEN 1 ELSE 0 END,
    now(),
    now()
  )
  ON CONFLICT (ip) DO UPDATE SET
    score = GREATEST(0, LEAST(100, ip_reputation.score - (v_risk_score / 10))),
    total_requests = ip_reputation.total_requests + 1,
    blocked_count = ip_reputation.blocked_count + (CASE WHEN p_action = 'block' THEN 1 ELSE 0 END),
    last_seen = now(),
    updated_at = now();
END;
$$;

-- 5. FIX: cascade_conversations - Restrict to session-based access (no public email exposure)
DROP POLICY IF EXISTS "Public read cascade_conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Anyone can insert cascade_conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON public.cascade_conversations;

-- Users can only see their own conversations (by session_id or email match)
CREATE POLICY "Users can view own session conversations"
ON public.cascade_conversations FOR SELECT
USING (
  -- Allow viewing if session_id matches (for anonymous users)
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
  -- Or if authenticated user's email matches
  OR (
    auth.uid() IS NOT NULL 
    AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  -- Or for anonymous conversations
  OR user_email = 'anonymous'
);

-- Anyone can insert conversations (needed for chat functionality)
CREATE POLICY "Users can insert conversations"
ON public.cascade_conversations FOR INSERT
WITH CHECK (true);

-- Users can only update their own conversations
DROP POLICY IF EXISTS "Users can update own conversations" ON public.cascade_conversations;
CREATE POLICY "Users can update own conversations"
ON public.cascade_conversations FOR UPDATE
USING (
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
  OR (
    auth.uid() IS NOT NULL 
    AND user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);