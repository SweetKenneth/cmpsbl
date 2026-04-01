
-- ═══ FORGE AGENTS TABLE ═══
-- User-facing Agent Forge: custom named agents with tier-gated slots
CREATE TABLE public.forge_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name VARCHAR(8) NOT NULL,
  agency_name VARCHAR(16),
  display_name VARCHAR(32),
  agent_type VARCHAR(32) NOT NULL DEFAULT 'custom',
  specialization VARCHAR(64),
  tier_created_at VARCHAR(16) NOT NULL DEFAULT 'builder',
  is_active BOOLEAN NOT NULL DEFAULT false,
  loadout_id VARCHAR(64),
  primitive_chain TEXT[] DEFAULT '{}',
  cjpi_score NUMERIC(5,1),
  ascension_stage INTEGER DEFAULT 0,
  personality JSONB DEFAULT '{}',
  capabilities JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive unique agent names (globally unique)
CREATE UNIQUE INDEX idx_forge_agents_name_unique ON public.forge_agents (LOWER(agent_name));

-- Case-insensitive unique agency names (globally unique, nullable)
CREATE UNIQUE INDEX idx_forge_agents_agency_unique ON public.forge_agents (LOWER(agency_name)) WHERE agency_name IS NOT NULL;

-- Fast user lookups
CREATE INDEX idx_forge_agents_user ON public.forge_agents (user_id);

-- Only one active agent per user
CREATE UNIQUE INDEX idx_forge_agents_one_active ON public.forge_agents (user_id) WHERE is_active = true;

-- Reserved names list
CREATE TABLE public.forge_reserved_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserved_name VARCHAR(16) NOT NULL,
  reason VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_forge_reserved_lower ON public.forge_reserved_names (LOWER(reserved_name));

-- Seed reserved names
INSERT INTO public.forge_reserved_names (reserved_name, reason) VALUES
  ('ADMIN', 'system'),
  ('CMPSBL', 'brand'),
  ('SYSTEM', 'system'),
  ('ROOT', 'system'),
  ('NULL', 'system'),
  ('HELP', 'command'),
  ('TEST', 'system'),
  ('FORGE', 'brand'),
  ('NEXUS', 'primitive'),
  ('DREAM', 'primitive'),
  ('BRAIN', 'primitive'),
  ('DEFENSE', 'primitive'),
  ('BEACON', 'primitive'),
  ('ORACLE', 'primitive'),
  ('SHADOW', 'primitive'),
  ('VISION', 'primitive'),
  ('CORTEX', 'primitive'),
  ('NERVE', 'primitive'),
  ('MEDIC', 'primitive'),
  ('AUDIT', 'primitive'),
  ('MEMORY', 'primitive'),
  ('WRAITH', 'agent'),
  ('RAPTOR', 'agent'),
  ('MONOLITH', 'agent'),
  ('OBSIDIAN', 'agent');

-- ═══ RLS ═══
ALTER TABLE public.forge_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_reserved_names ENABLE ROW LEVEL SECURITY;

-- Users can read their own agents
CREATE POLICY "Users can view own forge agents"
  ON public.forge_agents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create agents (slot enforcement done in app layer)
CREATE POLICY "Users can create forge agents"
  ON public.forge_agents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own agents
CREATE POLICY "Users can update own forge agents"
  ON public.forge_agents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own agents
CREATE POLICY "Users can delete own forge agents"
  ON public.forge_agents FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Reserved names are readable by all authenticated users (for validation)
CREATE POLICY "Anyone can read reserved names"
  ON public.forge_reserved_names FOR SELECT
  TO authenticated
  USING (true);

-- Validation trigger: block reserved names
CREATE OR REPLACE FUNCTION public.validate_forge_agent_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.forge_reserved_names
    WHERE LOWER(reserved_name) = LOWER(NEW.agent_name)
  ) THEN
    RAISE EXCEPTION 'Agent name "%" is reserved', NEW.agent_name;
  END IF;

  IF NEW.agency_name IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.forge_reserved_names
    WHERE LOWER(reserved_name) = LOWER(NEW.agency_name)
  ) THEN
    RAISE EXCEPTION 'Agency name "%" is reserved', NEW.agency_name;
  END IF;

  -- Enforce format: 3-8 chars, alphanumeric + hyphens only
  IF NEW.agent_name !~ '^[A-Za-z0-9\-]{3,8}$' THEN
    RAISE EXCEPTION 'Agent name must be 3-8 characters, alphanumeric and hyphens only';
  END IF;

  IF NEW.agency_name IS NOT NULL AND NEW.agency_name !~ '^[A-Za-z0-9 \-]{3,16}$' THEN
    RAISE EXCEPTION 'Agency name must be 3-16 characters, alphanumeric, spaces and hyphens only';
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_forge_agent_name
  BEFORE INSERT OR UPDATE ON public.forge_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_forge_agent_name();
