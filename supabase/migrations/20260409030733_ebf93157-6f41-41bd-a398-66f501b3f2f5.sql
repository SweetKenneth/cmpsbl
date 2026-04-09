
ALTER TABLE public.access_subscriptions
  ADD COLUMN IF NOT EXISTS trial_tier text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_expires_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN public.access_subscriptions.trial_tier IS 'The tier being trialed (studio, creator, architect)';
COMMENT ON COLUMN public.access_subscriptions.trial_started_at IS 'When the trial started';
COMMENT ON COLUMN public.access_subscriptions.trial_expires_at IS 'When the trial expires (7 days from start)';
