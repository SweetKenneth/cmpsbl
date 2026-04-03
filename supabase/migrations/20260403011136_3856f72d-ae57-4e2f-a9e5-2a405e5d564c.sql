
-- Vertical Substrate Registry: tracks each instantiated vertical
CREATE TABLE public.vertical_substrates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'blueprint',
  version TEXT NOT NULL DEFAULT '1.0.0',
  config JSONB NOT NULL DEFAULT '{}',
  primitive_count INTEGER NOT NULL DEFAULT 40,
  total_capabilities INTEGER NOT NULL DEFAULT 0,
  health_score NUMERIC(5,2) DEFAULT 100.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vertical-specific primitives (engines + agents per vertical)
CREATE TABLE public.vertical_primitives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id TEXT NOT NULL REFERENCES public.vertical_substrates(vertical_id) ON DELETE CASCADE,
  primitive_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('organ', 'layer', 'engine', 'agent')),
  description TEXT,
  inherited BOOLEAN NOT NULL DEFAULT false,
  replaces TEXT,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  weight NUMERIC(5,3) NOT NULL DEFAULT 0.025,
  classification TEXT NOT NULL DEFAULT 'passive' CHECK (classification IN ('active', 'passive', 'hybrid')),
  health_score NUMERIC(5,2) DEFAULT 100.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vertical_id, primitive_id)
);

-- Vertical-specific CLM cycles (separate from core CLM)
CREATE TABLE public.vertical_clm_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id TEXT NOT NULL REFERENCES public.vertical_substrates(vertical_id) ON DELETE CASCADE,
  primitive_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  cycle_number INTEGER NOT NULL DEFAULT 1,
  knowledge_gained JSONB DEFAULT '{}',
  health_before NUMERIC(5,2),
  health_after NUMERIC(5,2),
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vertical Memory Stream entries (domain-specific discoveries)
CREATE TABLE public.vertical_memory_stream (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id TEXT NOT NULL REFERENCES public.vertical_substrates(vertical_id) ON DELETE CASCADE,
  discovery_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  scanner_focus TEXT,
  contributed_to_global BOOLEAN DEFAULT false,
  cjpi_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vertical Ascension sessions (domain-tuned refurbishments)
CREATE TABLE public.vertical_ascension_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id TEXT NOT NULL REFERENCES public.vertical_substrates(vertical_id) ON DELETE CASCADE,
  fingerprint_id TEXT NOT NULL,
  user_id UUID,
  original_cjpi NUMERIC(5,2),
  final_cjpi NUMERIC(5,2),
  primitives_applied TEXT[] DEFAULT '{}',
  capabilities_added TEXT[] DEFAULT '{}',
  enhancement_archetypes TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.vertical_substrates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vertical_primitives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vertical_clm_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vertical_memory_stream ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vertical_ascension_sessions ENABLE ROW LEVEL SECURITY;

-- Public read access for substrate catalog
CREATE POLICY "Anyone can view vertical substrates"
  ON public.vertical_substrates FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view vertical primitives"
  ON public.vertical_primitives FOR SELECT TO anon, authenticated
  USING (true);

-- Authenticated read for vertical-specific data
CREATE POLICY "Authenticated users can view vertical CLM cycles"
  ON public.vertical_clm_cycles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view vertical memory stream"
  ON public.vertical_memory_stream FOR SELECT TO authenticated
  USING (true);

-- Users can view their own ascension sessions
CREATE POLICY "Users can view own vertical ascension sessions"
  ON public.vertical_ascension_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create vertical ascension sessions"
  ON public.vertical_ascension_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Anon can view ascension sessions by fingerprint (for lookup)
CREATE POLICY "Anon can view ascension by fingerprint"
  ON public.vertical_ascension_sessions FOR SELECT TO anon
  USING (true);
