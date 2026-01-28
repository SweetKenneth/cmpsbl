-- =====================================================
-- Security Fix: Webhook Secrets & Conversation Access Control
-- =====================================================

-- 1. WEBHOOK SECRET HASHING
-- Rename webhook_secret to webhook_secret_hash for clarity
-- This signals to developers that values should be hashed before storage
ALTER TABLE public.substrate_integrations 
RENAME COLUMN webhook_secret TO webhook_secret_hash;

COMMENT ON COLUMN public.substrate_integrations.webhook_secret_hash 
IS 'SHA-256 hash of webhook secret for verification - never store plaintext. Hash secrets in application code before storing.';

-- Add similar fix for pf_clarity_webhooks if it has plaintext secrets
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'pf_clarity_webhooks' 
    AND column_name = 'secret'
  ) THEN
    ALTER TABLE public.pf_clarity_webhooks RENAME COLUMN secret TO secret_hash;
    COMMENT ON COLUMN public.pf_clarity_webhooks.secret_hash 
    IS 'SHA-256 hash of webhook secret for verification';
  END IF;
END $$;

-- 2. CASCADE CONVERSATIONS ACCESS CONTROL FIX
-- Add user_id column for proper ownership-based access control
ALTER TABLE public.cascade_conversations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_cascade_conversations_user_id 
ON public.cascade_conversations(user_id) 
WHERE user_id IS NOT NULL;

-- Add session_token column for anonymous conversation ownership
ALTER TABLE public.cascade_conversations 
ADD COLUMN IF NOT EXISTS session_token TEXT;

-- Create partial index for session token lookups (anonymous users only)
CREATE INDEX IF NOT EXISTS idx_cascade_conversations_session 
ON public.cascade_conversations(session_token) 
WHERE session_token IS NOT NULL AND user_id IS NULL;

-- Drop existing RLS policies that use email-based access
DROP POLICY IF EXISTS "Owner can view conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Secure insert conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.cascade_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.cascade_conversations;

-- Create new secure RLS policies using user_id instead of email
CREATE POLICY "Users can view own conversations" 
ON public.cascade_conversations FOR SELECT 
USING (
  -- User owns the conversation by user_id
  (auth.uid() = user_id)
  -- OR user is an admin
  OR has_role_text(auth.uid(), 'admin')
  -- OR anonymous conversation with matching email (legacy support)
  OR (user_id IS NULL AND user_email = auth.email())
);

CREATE POLICY "Users can insert own conversations" 
ON public.cascade_conversations FOR INSERT 
WITH CHECK (
  -- Authenticated users must set their user_id
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  -- OR allow anonymous conversations with email/session
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

CREATE POLICY "Users can update own conversations" 
ON public.cascade_conversations FOR UPDATE 
USING (
  (auth.uid() = user_id)
  OR has_role_text(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete own conversations" 
ON public.cascade_conversations FOR DELETE 
USING (
  (auth.uid() = user_id)
  OR has_role_text(auth.uid(), 'admin')
);

-- 3. UPDATE EXISTING DATA
-- Migrate existing conversations to use user_id where possible
UPDATE public.cascade_conversations c
SET user_id = u.id
FROM auth.users u
WHERE c.user_email = u.email
AND c.user_id IS NULL
AND c.user_email IS NOT NULL 
AND c.user_email != 'anonymous';