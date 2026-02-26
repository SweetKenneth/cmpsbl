
-- Governance Transition Log (replaces in-memory transitionHistory)
CREATE TABLE IF NOT EXISTS public.governance_transition_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_mode TEXT NOT NULL,
  to_mode TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_transition_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on governance_transition_log" ON public.governance_transition_log FOR ALL USING (true);

-- Governance Transition Approvals (quorum system)
CREATE TABLE IF NOT EXISTS public.governance_transition_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_mode TEXT NOT NULL,
  to_mode TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approvals_required INT NOT NULL DEFAULT 2,
  approvals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes')
);
ALTER TABLE public.governance_transition_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on governance_transition_approvals" ON public.governance_transition_approvals FOR ALL USING (true);

-- Governance Issued Vetoes (tracks vetoes issued by governance bridge)
CREATE TABLE IF NOT EXISTS public.governance_issued_vetoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  veto_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_issued_vetoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on governance_issued_vetoes" ON public.governance_issued_vetoes FOR ALL USING (true);

-- Governance Compliance Reports (persisted audit trail)
CREATE TABLE IF NOT EXISTS public.governance_compliance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL,
  score INT NOT NULL DEFAULT 100,
  compliant BOOLEAN NOT NULL DEFAULT true,
  violations JSONB NOT NULL DEFAULT '[]'::jsonb,
  checks_performed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_compliance_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on governance_compliance_reports" ON public.governance_compliance_reports FOR ALL USING (true);
