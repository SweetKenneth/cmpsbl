
-- Phase 0: System Flags table (source of truth for admin toggles)
CREATE TABLE IF NOT EXISTS public.system_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.system_flags ENABLE ROW LEVEL SECURITY;

-- Public read (flags are non-sensitive config)
CREATE POLICY "System flags are readable by everyone"
  ON public.system_flags FOR SELECT
  USING (true);

-- Only admins can update
CREATE POLICY "Only admins can update system flags"
  ON public.system_flags FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert
CREATE POLICY "Only admins can insert system flags"
  ON public.system_flags FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed the shadow_mesh_enabled flag (OFF by default)
INSERT INTO public.system_flags (key, enabled)
VALUES ('shadow_mesh_enabled', false)
ON CONFLICT (key) DO NOTHING;

-- Timestamp trigger
CREATE TRIGGER update_system_flags_timestamp
  BEFORE UPDATE ON public.system_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_substrate_timestamp();
