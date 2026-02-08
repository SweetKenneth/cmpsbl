-- Add missing columns to existing dream_eater_state if not present
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dream_eater_state' AND column_name = 'instability_score') THEN
    ALTER TABLE public.dream_eater_state ADD COLUMN instability_score NUMERIC(3,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dream_eater_state' AND column_name = 'last_daily_reset') THEN
    ALTER TABLE public.dream_eater_state ADD COLUMN last_daily_reset TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Create dream_eater_mood type if not exists
DO $$ BEGIN
  CREATE TYPE dream_eater_mood AS ENUM ('calm', 'curious', 'agitated', 'fractured', 'dormant', 'feral');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Dream-Eater Audit Log (no content stored)
CREATE TABLE IF NOT EXISTS public.dream_eater_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  mood_before TEXT,
  mood_after TEXT,
  mutation_delta INTEGER DEFAULT 0,
  nightmare_intensity NUMERIC(3,2),
  session_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public Dream Stream (anonymous, no content)
CREATE TABLE IF NOT EXISTS public.dream_stream (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_type TEXT NOT NULL,
  mood_before TEXT NOT NULL,
  mood_after TEXT NOT NULL,
  mutation_delta INTEGER DEFAULT 0,
  opted_in_excerpt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily Artifacts (immutable once generated)
CREATE TABLE IF NOT EXISTS public.dream_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_date DATE UNIQUE NOT NULL,
  sentence TEXT NOT NULL,
  mood TEXT NOT NULL,
  visual_seed TEXT,
  dreams_compressed INTEGER DEFAULT 0,
  nightmares_compressed INTEGER DEFAULT 0,
  is_immutable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dream Archaeology Analytics (aggregated themes, no raw content)
CREATE TABLE IF NOT EXISTS public.dream_archaeology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  theme_clusters JSONB DEFAULT '[]',
  mood_distribution JSONB DEFAULT '{}',
  nightmare_ratio NUMERIC(3,2) DEFAULT 0,
  total_consumed INTEGER DEFAULT 0,
  insight TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mutation Milestones (tracks unlocks)
CREATE TABLE IF NOT EXISTS public.dream_eater_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_level INTEGER UNIQUE NOT NULL,
  milestone_name TEXT NOT NULL,
  description TEXT,
  unlocked_at TIMESTAMPTZ,
  animation_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Echo Templates (cryptic responses)
CREATE TABLE IF NOT EXISTS public.dream_echo_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  echo_type TEXT NOT NULL,
  template TEXT NOT NULL,
  mood_affinity TEXT[],
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature Flags for rollback capability
CREATE TABLE IF NOT EXISTS public.dream_eater_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable realtime for live stream
ALTER PUBLICATION supabase_realtime ADD TABLE public.dream_stream;

-- RLS Policies
ALTER TABLE public.dream_eater_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_stream ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_archaeology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_eater_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_echo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_eater_features ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view dream stream" ON public.dream_stream FOR SELECT USING (true);
CREATE POLICY "Anyone can view artifacts" ON public.dream_artifacts FOR SELECT USING (true);
CREATE POLICY "Anyone can view archaeology" ON public.dream_archaeology FOR SELECT USING (true);
CREATE POLICY "Anyone can view milestones" ON public.dream_eater_milestones FOR SELECT USING (true);
CREATE POLICY "Anyone can view features" ON public.dream_eater_features FOR SELECT USING (true);
CREATE POLICY "Anyone can view echo templates" ON public.dream_echo_templates FOR SELECT USING (true);