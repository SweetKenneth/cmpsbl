-- ═══ v4.7.0: DEFENSE PERIMETER ENGINE SCHEMA UPGRADES ═══

-- Add new columns to defense_events for enhanced fingerprinting
ALTER TABLE public.defense_events 
ADD COLUMN IF NOT EXISTS fingerprint_family text,
ADD COLUMN IF NOT EXISTS provider text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS asn text,
ADD COLUMN IF NOT EXISTS matched_rule_id uuid,
ADD COLUMN IF NOT EXISTS request_method text DEFAULT 'GET',
ADD COLUMN IF NOT EXISTS status_code integer,
ADD COLUMN IF NOT EXISTS defense_mode text DEFAULT 'observe';

-- Add new columns to ip_reputation for enhanced tracking
ALTER TABLE public.ip_reputation
ADD COLUMN IF NOT EXISTS challenge_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS fingerprint_family text,
ADD COLUMN IF NOT EXISTS provider text,
ADD COLUMN IF NOT EXISTS country text;

-- Add condition column to defense_rules for DSL
ALTER TABLE public.defense_rules
ADD COLUMN IF NOT EXISTS condition jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS last_matched_at timestamptz,
ADD COLUMN IF NOT EXISTS match_count integer DEFAULT 0;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_defense_events_fingerprint_family ON public.defense_events(fingerprint_family);
CREATE INDEX IF NOT EXISTS idx_defense_events_matched_rule_id ON public.defense_events(matched_rule_id);
CREATE INDEX IF NOT EXISTS idx_defense_events_provider ON public.defense_events(provider);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_risk_level ON public.ip_reputation(risk_level);
CREATE INDEX IF NOT EXISTS idx_defense_rules_match_count ON public.defense_rules(match_count DESC);

-- Create defense_config table for mode switches
CREATE TABLE IF NOT EXISTS public.defense_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on defense_config
ALTER TABLE public.defense_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for defense_config
DROP POLICY IF EXISTS "Service role full access defense_config" ON public.defense_config;
CREATE POLICY "Service role full access defense_config" ON public.defense_config FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin can view defense_config" ON public.defense_config;
CREATE POLICY "Admin can view defense_config" ON public.defense_config FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));