
-- Store registered passkey credentials linked to auth users
CREATE TABLE public.passkey_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id text NOT NULL UNIQUE,
  public_key text NOT NULL,
  email text NOT NULL,
  device_type text DEFAULT 'platform',
  transports text[] DEFAULT '{}',
  sign_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz DEFAULT now()
);

-- Short-lived challenges for anti-replay protection
CREATE TABLE public.passkey_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 minutes'),
  used boolean DEFAULT false
);

-- RLS
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passkey_challenges ENABLE ROW LEVEL SECURITY;

-- Users can read their own passkeys
CREATE POLICY "Users can view own passkeys"
  ON public.passkey_credentials FOR SELECT
  USING (auth.uid() = user_id);

-- Users can register passkeys for themselves
CREATE POLICY "Users can insert own passkeys"
  ON public.passkey_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own passkeys
CREATE POLICY "Users can delete own passkeys"
  ON public.passkey_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- Service role manages challenges (edge function uses service role)
-- No user-facing policies needed for challenges

-- Index for fast credential lookup
CREATE INDEX idx_passkey_credentials_credential_id ON public.passkey_credentials(credential_id);
CREATE INDEX idx_passkey_challenges_challenge ON public.passkey_challenges(challenge);

-- Auto-cleanup expired challenges
CREATE OR REPLACE FUNCTION public.cleanup_expired_challenges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.passkey_challenges WHERE expires_at < now();
END;
$$;
