-- CAPTCHA challenges table for DEFENSE challenge/verify flow
CREATE TABLE public.captcha_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID NOT NULL UNIQUE,
  challenge_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  solved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by token + status
CREATE INDEX idx_captcha_challenges_token_status ON public.captcha_challenges (token, status);

-- Auto-cleanup index for expired challenges
CREATE INDEX idx_captcha_challenges_created ON public.captcha_challenges (created_at);

-- Enable RLS
ALTER TABLE public.captcha_challenges ENABLE ROW LEVEL SECURITY;

-- Only service_role can read/write (edge functions use admin client)
-- No public access needed — all operations go through edge functions
