-- DREAM v1.1 — Add circadian counters, mood decay tracking, and anomaly logging

-- Add circadian and metabolic fields to dream_eater_state
ALTER TABLE public.dream_eater_state 
ADD COLUMN IF NOT EXISTS cycle_count_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS awaken_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_awaken_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS last_cycle_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS last_decay_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS reset_reason TEXT NULL;

-- Add mutation history tracking
ALTER TABLE public.dream_eater_state 
ADD COLUMN IF NOT EXISTS mutation_history JSONB DEFAULT '[]'::jsonb;

-- Create dream_anomalies table for logging module anomalies
CREATE TABLE IF NOT EXISTS public.dream_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anomaly_type TEXT NOT NULL, -- 'unknown_id', 'bad_feed_input', 'failed_consume', 'invalid_mood', 'mutation_overflow'
  severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'error', 'critical'
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on dream_anomalies
ALTER TABLE public.dream_anomalies ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role access
CREATE POLICY "Service role manages dream_anomalies"
ON public.dream_anomalies
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for efficient anomaly queries
CREATE INDEX IF NOT EXISTS idx_dream_anomalies_type ON public.dream_anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_dream_anomalies_created ON public.dream_anomalies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dream_anomalies_resolved ON public.dream_anomalies(resolved) WHERE resolved = false;

-- Update dream_eater_state with initial circadian values
UPDATE public.dream_eater_state SET 
  cycle_count_today = 0,
  awaken_count = 0,
  last_decay_at = now()
WHERE cycle_count_today IS NULL;