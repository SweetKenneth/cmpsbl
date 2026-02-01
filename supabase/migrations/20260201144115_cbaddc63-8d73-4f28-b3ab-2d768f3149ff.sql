-- Atlas Control Plane Tables for v7.0.0
-- Single-source-of-truth governance and audit infrastructure

-- Substrate capabilities with persistent toggles
CREATE TABLE IF NOT EXISTS public.substrate_capabilities (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.substrate_capabilities ENABLE ROW LEVEL SECURITY;

-- Policies: Only authenticated operators/governors can manage capabilities
CREATE POLICY "Authenticated users can read capabilities"
ON public.substrate_capabilities
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Operators can update capabilities"
ON public.substrate_capabilities
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operator') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Governors can insert capabilities"
ON public.substrate_capabilities
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Substrate audit log for Atlas operations
CREATE TABLE IF NOT EXISTS public.substrate_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor UUID REFERENCES auth.users(id),
  actor_role TEXT,
  op TEXT NOT NULL,
  target TEXT,
  payload_redacted JSONB,
  result_summary TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'fail', 'blocked', 'dry_run')),
  trace_id TEXT NOT NULL,
  execution_ms INTEGER,
  dry_run BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.substrate_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies: Authenticated can read, only service role inserts (via edge function)
CREATE POLICY "Authenticated users can read audit log"
ON public.substrate_audit_log
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert audit log"
ON public.substrate_audit_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated users to insert their own audit entries
CREATE POLICY "Authenticated users can insert own audit entries"
ON public.substrate_audit_log
FOR INSERT
TO authenticated
WITH CHECK (actor = auth.uid() OR actor IS NULL);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_substrate_audit_log_ts ON public.substrate_audit_log(ts DESC);
CREATE INDEX IF NOT EXISTS idx_substrate_audit_log_op ON public.substrate_audit_log(op);
CREATE INDEX IF NOT EXISTS idx_substrate_audit_log_status ON public.substrate_audit_log(status);
CREATE INDEX IF NOT EXISTS idx_substrate_audit_log_trace ON public.substrate_audit_log(trace_id);

-- Seed default capability toggles (all ON except experimental)
INSERT INTO public.substrate_capabilities (key, enabled, notes) VALUES
  ('atlas.enabled', true, 'Atlas control plane master toggle'),
  ('seba.enabled', true, 'Self-Evolving Bounded Agent'),
  ('autoblog.enabled', true, 'Autonomous blog publishing'),
  ('tests.enabled', true, 'System test runner'),
  ('module_exec.enabled', true, 'Module action execution'),
  ('clm_intel.enabled', true, 'Continuous Learning Mode intelligence'),
  ('dialogue.enabled', true, 'Atlas dialogue/brain routing'),
  ('capabilities.enabled', true, 'Capability toggle management'),
  ('audit.enabled', true, 'Audit log queries'),
  ('intel.enabled', true, 'Module intelligence summaries')
ON CONFLICT (key) DO NOTHING;