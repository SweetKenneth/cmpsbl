-- ============================================
-- BYOK Extension Architecture Tables
-- Developers bring their own API keys
-- ============================================

-- Developer API Key Vault (encrypted storage)
CREATE TABLE public.substrate_developer_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- groq, openai, anthropic, together, deepseek, etc.
  encrypted_key TEXT NOT NULL, -- Encrypted with app-level secret
  key_hint TEXT, -- Last 4 chars for identification
  is_active BOOLEAN DEFAULT true,
  rate_limit_rpm INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(developer_id, app_id, provider)
);

-- Usage Metering per Developer
CREATE TABLE public.substrate_usage_meters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calls_count INTEGER DEFAULT 0,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  latency_avg_ms NUMERIC DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(developer_id, app_id, provider, date)
);

-- Extension Registry
CREATE TABLE public.substrate_extensions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  extension_type TEXT NOT NULL, -- memory_type, defense_rule, nexus_provider, agent_type
  extension_name TEXT NOT NULL,
  extension_version TEXT DEFAULT '1.0.0',
  config JSONB DEFAULT '{}',
  schema_definition JSONB, -- JSON Schema for validation
  handler_code TEXT, -- Optional custom handler (sandboxed)
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false, -- Marketplace sharing
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(developer_id, extension_type, extension_name)
);

-- Integration Registry (external services)
CREATE TABLE public.substrate_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  integration_type TEXT NOT NULL, -- stripe, twilio, shopify, n8n, webhook
  integration_name TEXT NOT NULL,
  config JSONB DEFAULT '{}', -- Non-sensitive config
  credentials_ref TEXT, -- Reference to encrypted credentials in vault
  webhook_url TEXT,
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  last_called_at TIMESTAMP WITH TIME ZONE,
  call_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(developer_id, app_id, integration_type, integration_name)
);

-- Agent Mesh Registry
CREATE TABLE public.substrate_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL, -- worker, supervisor, router, critic
  system_prompt TEXT,
  model_preference TEXT, -- Which model this agent prefers
  capabilities JSONB DEFAULT '[]', -- What this agent can do
  constraints JSONB DEFAULT '{}', -- Limits and boundaries
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(developer_id, app_id, agent_name)
);

-- Agent Coordination Events
CREATE TABLE public.substrate_agent_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mesh_id TEXT NOT NULL,
  agent_id UUID REFERENCES public.substrate_agents(id),
  event_type TEXT NOT NULL, -- task_assigned, task_completed, handoff, error, consensus
  source_agent TEXT,
  target_agent TEXT,
  payload JSONB DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Developer Apps Registry
CREATE TABLE public.substrate_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  app_id TEXT NOT NULL UNIQUE,
  description TEXT,
  tier TEXT DEFAULT 'free', -- free, pro, enterprise
  monthly_budget_usd NUMERIC DEFAULT 0, -- $0 = BYOK only
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  settings JSONB DEFAULT '{}',
  UNIQUE(developer_id, app_name)
);

-- Enable RLS on all tables
ALTER TABLE public.substrate_developer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_usage_meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_agent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substrate_apps ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Developers can only access their own data
CREATE POLICY "Developers access own keys" ON public.substrate_developer_keys
  FOR ALL USING (developer_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Developers access own meters" ON public.substrate_usage_meters
  FOR ALL USING (developer_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Developers access own extensions" ON public.substrate_extensions
  FOR ALL USING (developer_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Public extensions readable" ON public.substrate_extensions
  FOR SELECT USING (is_public = true);

CREATE POLICY "Developers access own integrations" ON public.substrate_integrations
  FOR ALL USING (developer_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Developers access own agents" ON public.substrate_agents
  FOR ALL USING (developer_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Developers access own events" ON public.substrate_agent_events
  FOR ALL USING (
    agent_id IN (
      SELECT id FROM public.substrate_agents 
      WHERE developer_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Developers access own apps" ON public.substrate_apps
  FOR ALL USING (developer_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role policies for edge functions
CREATE POLICY "Service role full access keys" ON public.substrate_developer_keys
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access meters" ON public.substrate_usage_meters
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access extensions" ON public.substrate_extensions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access integrations" ON public.substrate_integrations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access agents" ON public.substrate_agents
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access events" ON public.substrate_agent_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access apps" ON public.substrate_apps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_dev_keys_lookup ON public.substrate_developer_keys(developer_id, app_id, provider) WHERE is_active = true;
CREATE INDEX idx_usage_meters_date ON public.substrate_usage_meters(developer_id, app_id, date);
CREATE INDEX idx_extensions_type ON public.substrate_extensions(extension_type) WHERE is_active = true;
CREATE INDEX idx_extensions_public ON public.substrate_extensions(extension_type) WHERE is_public = true;
CREATE INDEX idx_integrations_lookup ON public.substrate_integrations(developer_id, app_id, integration_type) WHERE is_active = true;
CREATE INDEX idx_agents_lookup ON public.substrate_agents(developer_id, app_id) WHERE is_active = true;
CREATE INDEX idx_agent_events_mesh ON public.substrate_agent_events(mesh_id, created_at DESC);
CREATE INDEX idx_apps_lookup ON public.substrate_apps(developer_id) WHERE is_active = true;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_substrate_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_substrate_developer_keys_timestamp
  BEFORE UPDATE ON public.substrate_developer_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();

CREATE TRIGGER update_substrate_usage_meters_timestamp
  BEFORE UPDATE ON public.substrate_usage_meters
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();

CREATE TRIGGER update_substrate_extensions_timestamp
  BEFORE UPDATE ON public.substrate_extensions
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();

CREATE TRIGGER update_substrate_integrations_timestamp
  BEFORE UPDATE ON public.substrate_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();

CREATE TRIGGER update_substrate_agents_timestamp
  BEFORE UPDATE ON public.substrate_agents
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();

CREATE TRIGGER update_substrate_apps_timestamp
  BEFORE UPDATE ON public.substrate_apps
  FOR EACH ROW EXECUTE FUNCTION public.update_substrate_timestamp();