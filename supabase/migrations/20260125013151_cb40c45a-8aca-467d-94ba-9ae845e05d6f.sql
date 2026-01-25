-- ═══════════════════════════════════════════════════════════════
-- VISION v2.0 "Vee" — Trace Context + Anomaly Tables (fix)
-- ═══════════════════════════════════════════════════════════════

-- Add trace/span columns to brain_events for causal chain tracking
ALTER TABLE public.brain_events 
  ADD COLUMN IF NOT EXISTS trace_id uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS span_id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS parent_span_id uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS source_operation text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS correlation_keys jsonb DEFAULT '{}'::jsonb;

-- Create index for fast trace lookups
CREATE INDEX IF NOT EXISTS idx_brain_events_trace_id ON public.brain_events(trace_id) WHERE trace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_brain_events_span_id ON public.brain_events(span_id);
CREATE INDEX IF NOT EXISTS idx_brain_events_parent_span_id ON public.brain_events(parent_span_id) WHERE parent_span_id IS NOT NULL;

-- Create vision_anomalies table for anomaly detection
CREATE TABLE IF NOT EXISTS public.vision_anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  anomaly_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  baseline_value numeric,
  detected_value numeric,
  deviation_percent numeric,
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolution_action text,
  auto_action_taken text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on vision_anomalies
ALTER TABLE public.vision_anomalies ENABLE ROW LEVEL SECURITY;

-- Policy: service role can do everything (use IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vision_anomalies' AND policyname = 'Service role full access vision_anomalies') THEN
    CREATE POLICY "Service role full access vision_anomalies" 
    ON public.vision_anomalies FOR ALL 
    USING (auth.role() = 'service_role'::text);
  END IF;
END$$;

-- Policy: public read for transparency
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vision_anomalies' AND policyname = 'Public read vision_anomalies') THEN
    CREATE POLICY "Public read vision_anomalies" 
    ON public.vision_anomalies FOR SELECT 
    USING (true);
  END IF;
END$$;

-- Create indexes for anomaly queries
CREATE INDEX IF NOT EXISTS idx_vision_anomalies_module ON public.vision_anomalies(module);
CREATE INDEX IF NOT EXISTS idx_vision_anomalies_severity ON public.vision_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_vision_anomalies_detected_at ON public.vision_anomalies(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_vision_anomalies_resolved ON public.vision_anomalies(resolved);

-- Initialize vision_mode config (system_config already exists)
INSERT INTO public.system_config (key, value, description)
VALUES ('vision_mode', '"operative"'::jsonb, 'Vision module mode: passive | advisory | operative')
ON CONFLICT (key) DO NOTHING;

-- Initialize auto_heal_cooldown config (5 minutes)
INSERT INTO public.system_config (key, value, description)
VALUES ('auto_heal_cooldown_ms', '300000'::jsonb, 'Minimum ms between auto-heal attempts for same module')
ON CONFLICT (key) DO NOTHING;