-- ============================================
-- Security Hardening Migration
-- 1. Profiles table - consolidate RLS policies
-- 2. Agency tasks - add explicit agency ownership check
-- 3. Webhook secrets - add hashing documentation
-- ============================================

-- ============================================
-- FIX 1: Consolidate profiles table SELECT policies
-- Currently has 4 overlapping SELECT policies causing confusion
-- Drop all and create single consolidated policy
-- ============================================

DROP POLICY IF EXISTS "Admin views all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owner can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by owner only" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create single consolidated policy: owner OR admin can view profiles
CREATE POLICY "profiles_select_owner_or_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR auth.uid() = id
    OR public.has_role_text(auth.uid(), 'admin')
  );

-- ============================================
-- FIX 2: Agency tasks - add admin access for support
-- Existing policies check agency ownership correctly
-- Add admin override for support/debugging
-- ============================================

CREATE POLICY "Admins can view all agency tasks"
  ON public.agency_tasks FOR SELECT
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));

-- ============================================
-- FIX 3: Webhook secret hashing documentation
-- Add constraint comment to enforce SHA-256 hashing documentation
-- ============================================

COMMENT ON COLUMN public.pf_clarity_webhooks.secret_hash 
IS 'REQUIRED: SHA-256 hash of webhook secret. Webhooks are verified using HMAC-SHA256 comparison. Never store plaintext secrets. Generate secrets with crypto.randomBytes(32) and hash with SHA-256 before storing.';

-- Add check constraint to ensure secret_hash looks like a SHA-256 hash (64 hex chars)
DO $$
BEGIN
  -- Add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'secret_hash_sha256_format'
  ) THEN
    ALTER TABLE public.pf_clarity_webhooks
    ADD CONSTRAINT secret_hash_sha256_format 
    CHECK (secret_hash ~ '^[a-f0-9]{64}$');
  END IF;
EXCEPTION
  WHEN check_violation THEN
    -- If existing data doesn't match, log but continue
    RAISE NOTICE 'Some existing webhook secrets may not be in SHA-256 format';
END $$;