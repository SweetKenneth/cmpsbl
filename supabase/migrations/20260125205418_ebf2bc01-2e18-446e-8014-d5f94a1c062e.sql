-- Module Registry v1.0 — Full introspection + DAG + roles
-- For Cortex world model and system.modules commands

-- Create module registry table
CREATE TABLE IF NOT EXISTS public.module_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL DEFAULT '1.0.0',
  category TEXT NOT NULL DEFAULT 'kernel',
  status TEXT NOT NULL DEFAULT 'active',
  health_score INTEGER NOT NULL DEFAULT 100,
  circuit_state TEXT NOT NULL DEFAULT 'closed',
  boot_order INTEGER NOT NULL DEFAULT 0,
  dependencies TEXT[] DEFAULT '{}',
  dependents TEXT[] DEFAULT '{}',
  roles TEXT[] DEFAULT ARRAY['observer'],
  eligible_for_upgrade BOOLEAN DEFAULT true,
  shadow_supported BOOLEAN DEFAULT true,
  production_supported BOOLEAN DEFAULT true,
  file_paths JSONB DEFAULT '[]',
  config JSONB DEFAULT '{}',
  capabilities TEXT[] DEFAULT '{}',
  last_seen TIMESTAMPTZ,
  last_error TEXT,
  last_success TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_registry ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users (observers can see)
CREATE POLICY "Module registry is publicly readable"
  ON public.module_registry
  FOR SELECT
  USING (true);

-- Allow admins to modify registry
CREATE POLICY "Admins can modify module registry"
  ON public.module_registry
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_module_registry_name ON public.module_registry(name);
CREATE INDEX IF NOT EXISTS idx_module_registry_status ON public.module_registry(status);
CREATE INDEX IF NOT EXISTS idx_module_registry_boot_order ON public.module_registry(boot_order);

-- Trigger for updated_at
CREATE TRIGGER update_module_registry_timestamp
  BEFORE UPDATE ON public.module_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 13 modules with initial data
INSERT INTO public.module_registry (name, version, category, boot_order, dependencies, dependents, roles, capabilities, metadata)
VALUES
  ('core', '1.0.0', 'kernel', 1, '{}', ARRAY['brain','decode','defense','nexus','vision','dream','ripple','access','system','modernizer','integration','cortex'], ARRAY['observer','operator','governor'], ARRAY['scheduling','routing','lifecycle'], '{"layer": "kernel", "description": "Kernel scheduler and lifecycle manager"}'),
  ('ripple', '2.0.0', 'kernel', 2, ARRAY['core'], ARRAY['brain','vision','cortex'], ARRAY['observer','operator','governor'], ARRAY['pub/sub','queues','events','fan-out'], '{"layer": "kernel", "description": "Hybrid event orchestrator and message bus"}'),
  ('access', '2.0.0', 'kernel', 3, ARRAY['core'], ARRAY['brain','defense','nexus','modernizer','integration'], ARRAY['observer','operator','governor'], ARRAY['api-keys','quotas','subscriptions','entitlements'], '{"layer": "kernel", "description": "Identity management and API key lifecycle"}'),
  ('brain', '3.0.0', 'cognitive', 4, ARRAY['core','ripple','access'], ARRAY['decode','defense','vision','dream','modernizer','cortex'], ARRAY['observer','operator','governor'], ARRAY['memory','learning','reflection','knowledge-graph'], '{"layer": "cognitive", "description": "Three-tier memory and knowledge graph"}'),
  ('decode', '1.0.0', 'cognitive', 5, ARRAY['core','brain'], ARRAY['dream','cortex'], ARRAY['observer','operator'], ARRAY['intent','interpretation','proposals'], '{"layer": "cognitive", "description": "Intent decoding and cognitive interface"}'),
  ('dream', '1.0.0', 'cognitive', 6, ARRAY['core','brain','decode'], ARRAY['cortex'], ARRAY['observer','operator'], ARRAY['nocturnal-processing','mutation','evolution'], '{"layer": "cognitive", "description": "Dream-Eater nocturnal processing"}'),
  ('defense', '1.0.0', 'operational', 7, ARRAY['core','brain','access'], ARRAY['vision','system'], ARRAY['observer','operator','governor'], ARRAY['threat-detection','rate-limiting','reputation'], '{"layer": "operational", "description": "Security, bot detection, threat analysis"}'),
  ('nexus', '5.0.0', 'operational', 8, ARRAY['core','access'], ARRAY['brain','decode','vision','modernizer','cortex'], ARRAY['observer','operator','governor'], ARRAY['ai-routing','multi-provider','fallback'], '{"layer": "operational", "description": "Multi-provider AI routing and fallback"}'),
  ('vision', '2.0.0', 'operational', 9, ARRAY['core','brain','defense'], ARRAY['system','modernizer','cortex'], ARRAY['observer','operator','governor'], ARRAY['observability','metrics','tracing','health'], '{"layer": "operational", "description": "Observability, metrics, and health monitoring"}'),
  ('system', '1.0.0', 'admin', 10, ARRAY['core','vision','defense'], ARRAY['modernizer','cortex'], ARRAY['observer','operator','governor'], ARRAY['administration','backup','restore','healing'], '{"layer": "admin", "description": "System administration and self-healing"}'),
  ('modernizer', '2.0.0', 'admin', 11, ARRAY['core','brain','vision','system'], ARRAY['cortex'], ARRAY['operator','governor'], ARRAY['self-upgrade','proposals','shadow-mode'], '{"layer": "admin", "description": "Self-upgrade and architecture improvement engine"}'),
  ('integration', '2.0.0', 'admin', 12, ARRAY['core','access','brain'], ARRAY['cortex'], ARRAY['observer','operator','governor'], ARRAY['adapters','discovery','governance'], '{"layer": "admin", "description": "Enterprise adapters and LLM governance"}'),
  ('cortex', '2.0.0', 'orchestrator', 13, ARRAY['core','brain','vision','modernizer'], '{}', ARRAY['operator','governor','cortex'], ARRAY['orchestration','dispatch','panic','evolution','agency'], '{"layer": "orchestrator", "description": "Agency-class orchestrator for multi-module cognition"}')
ON CONFLICT (name) DO UPDATE SET
  version = EXCLUDED.version,
  category = EXCLUDED.category,
  boot_order = EXCLUDED.boot_order,
  dependencies = EXCLUDED.dependencies,
  dependents = EXCLUDED.dependents,
  roles = EXCLUDED.roles,
  capabilities = EXCLUDED.capabilities,
  metadata = EXCLUDED.metadata,
  updated_at = now();