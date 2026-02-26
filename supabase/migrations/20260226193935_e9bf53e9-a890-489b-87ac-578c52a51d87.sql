
-- Normalized vote storage for quorum transitions (concurrency safe)
CREATE TABLE IF NOT EXISTS public.governance_transition_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.governance_transition_approvals(id) ON DELETE CASCADE,
  approver TEXT NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_vote_per_approver UNIQUE (request_id, approver)
);

-- Index for fast vote counting
CREATE INDEX IF NOT EXISTS idx_gov_votes_request ON public.governance_transition_votes(request_id);

-- RLS
ALTER TABLE public.governance_transition_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can manage transition votes" ON public.governance_transition_votes FOR ALL USING (true);
