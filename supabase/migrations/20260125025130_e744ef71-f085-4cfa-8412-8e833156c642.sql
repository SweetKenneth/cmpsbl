-- ═══════════════════════════════════════════════════════════════
-- INTEGRATION v2 — Adapters, Connections, Discovery, Command Mappings
-- ═══════════════════════════════════════════════════════════════

-- Integration Connections: Persistent connection state for adapters
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  adapter_name TEXT NOT NULL,
  adapter_type TEXT NOT NULL,
  adapter_category TEXT NOT NULL,
  adapter_version TEXT DEFAULT '1.0.0',
  mode TEXT NOT NULL DEFAULT 'mock', -- mock, live, sandbox
  status TEXT NOT NULL DEFAULT 'active', -- active, disabled, error
  capabilities JSONB DEFAULT '["read","write","subscribe"]'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  credentials_ref TEXT, -- reference to vault, NOT the actual credentials
  last_latency_ms INTEGER,
  last_tested_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast active connection lookups
CREATE INDEX IF NOT EXISTS idx_integration_connections_status ON public.integration_connections(status);
CREATE INDEX IF NOT EXISTS idx_integration_connections_adapter ON public.integration_connections(adapter_name, status);

-- Integration Discoveries: Records of discovered systems/targets
CREATE TABLE IF NOT EXISTS public.integration_discoveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  adapter_id TEXT NOT NULL,
  target TEXT NOT NULL,
  depth TEXT NOT NULL DEFAULT 'shallow', -- shallow, deep
  status TEXT DEFAULT 'discovered', -- discovered, verified, stale
  metadata JSONB DEFAULT '{}'::jsonb,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for discovery lookups by adapter
CREATE INDEX IF NOT EXISTS idx_integration_discoveries_adapter ON public.integration_discoveries(adapter_id);
CREATE INDEX IF NOT EXISTS idx_integration_discoveries_target ON public.integration_discoveries(target);

-- Integration Command Mappings: Maps terminal commands to adapter actions
CREATE TABLE IF NOT EXISTS public.integration_command_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  adapter_id TEXT NOT NULL,
  terminal_command TEXT NOT NULL,
  description TEXT,
  governance_level TEXT NOT NULL DEFAULT 'standard', -- standard, strict, elevated
  active BOOLEAN NOT NULL DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(adapter_id, terminal_command)
);

-- Index for command lookups
CREATE INDEX IF NOT EXISTS idx_integration_mappings_adapter ON public.integration_command_mappings(adapter_id, active);
CREATE INDEX IF NOT EXISTS idx_integration_mappings_command ON public.integration_command_mappings(terminal_command);

-- Integration Audit Log: Dedicated audit table for integration governance
CREATE TABLE IF NOT EXISTS public.integration_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_type TEXT NOT NULL, -- integration_connection, integration_discovery, integration_mapping, integration_execution
  adapter_id TEXT,
  connection_id UUID,
  command TEXT,
  outcome TEXT NOT NULL, -- success, denied, error
  governance JSONB DEFAULT '{}'::jsonb,
  params JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_integration_audit_type ON public.integration_audit_log(entry_type);
CREATE INDEX IF NOT EXISTS idx_integration_audit_adapter ON public.integration_audit_log(adapter_id);
CREATE INDEX IF NOT EXISTS idx_integration_audit_time ON public.integration_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_command_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Service role full access (edge functions)
CREATE POLICY "Service role full access integration_connections" ON public.integration_connections
  FOR ALL USING (true);

CREATE POLICY "Service role full access integration_discoveries" ON public.integration_discoveries
  FOR ALL USING (true);

CREATE POLICY "Service role full access integration_command_mappings" ON public.integration_command_mappings
  FOR ALL USING (true);

CREATE POLICY "Service role full access integration_audit_log" ON public.integration_audit_log
  FOR ALL USING (true);

-- Trigger for updated_at on connections
CREATE OR REPLACE FUNCTION public.update_integration_connection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_integration_connections_updated_at
  BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_integration_connection_timestamp();

-- Trigger for updated_at on mappings
CREATE TRIGGER update_integration_mappings_updated_at
  BEFORE UPDATE ON public.integration_command_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_integration_connection_timestamp();