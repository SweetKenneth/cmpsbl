
CREATE TABLE IF NOT EXISTS public.radio_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_date DATE NOT NULL DEFAULT CURRENT_DATE,
  script_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  audio_url TEXT,
  duration_seconds INTEGER,
  generation_cost_estimate NUMERIC(6,4),
  tts_duration_ms INTEGER,
  regeneration_attempts INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  voice_mapping JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.radio_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read radio broadcasts"
ON public.radio_broadcasts FOR SELECT
USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_radio_broadcasts_date ON public.radio_broadcasts(broadcast_date);
