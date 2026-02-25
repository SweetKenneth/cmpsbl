
-- Governance Mode Control Plane
-- Stores the current governance mode for Clockless internal systems

CREATE TABLE public.governance_mode (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL DEFAULT 'ACTIVE' CHECK (mode IN ('ACTIVE', 'OBSERVE', 'LOCKDOWN', 'EVOLVE')),
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL DEFAULT 'System initialized',
  ttl_minutes integer,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Singleton constraint: only one row allowed
CREATE UNIQUE INDEX governance_mode_singleton ON public.governance_mode ((true));

-- Governance audit log
CREATE TABLE public.governance_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  previous_mode text NOT NULL,
  new_mode text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  ttl_minutes integer,
  affected_subsystems jsonb NOT NULL DEFAULT '[]',
  auto_reverted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.governance_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read governance mode
CREATE POLICY "Admins can read governance mode"
ON public.governance_mode FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update governance mode
CREATE POLICY "Admins can update governance mode"
ON public.governance_mode FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert governance mode (for initial seed)
CREATE POLICY "Admins can insert governance mode"
ON public.governance_mode FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Audit log: admins can read
CREATE POLICY "Admins can read governance audit log"
ON public.governance_audit_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Audit log: admins can insert
CREATE POLICY "Admins can insert governance audit log"
ON public.governance_audit_log FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed the default ACTIVE mode
INSERT INTO public.governance_mode (mode, reason)
VALUES ('ACTIVE', 'System initialized — default Clockless active mode');

-- Auto-revert function: checks if TTL has expired and reverts to ACTIVE
CREATE OR REPLACE FUNCTION public.governance_auto_revert()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current RECORD;
BEGIN
  SELECT * INTO v_current FROM governance_mode LIMIT 1;
  
  IF v_current IS NULL THEN RETURN; END IF;
  IF v_current.mode = 'ACTIVE' THEN RETURN; END IF;
  IF v_current.expires_at IS NULL THEN RETURN; END IF;
  IF v_current.expires_at > now() THEN RETURN; END IF;
  
  -- TTL expired, revert to ACTIVE
  INSERT INTO governance_audit_log (previous_mode, new_mode, changed_by, reason, auto_reverted, affected_subsystems)
  VALUES (v_current.mode, 'ACTIVE', v_current.changed_by, 'Auto-reverted: TTL expired after ' || v_current.ttl_minutes || ' minutes', true,
    '["clm", "dream", "evolution"]'::jsonb);
  
  UPDATE governance_mode SET
    mode = 'ACTIVE',
    reason = 'Auto-reverted from ' || v_current.mode || ' (TTL expired)',
    ttl_minutes = NULL,
    expires_at = NULL,
    updated_at = now();
END;
$$;

-- Timestamp trigger
CREATE TRIGGER update_governance_mode_timestamp
  BEFORE UPDATE ON public.governance_mode
  FOR EACH ROW
  EXECUTE FUNCTION public.update_brain_timestamp();
