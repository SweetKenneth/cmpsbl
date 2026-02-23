
-- TSAC (Task-Specific Acceptance Criteria) verification results
CREATE TABLE public.tsac_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id TEXT NOT NULL,
  executor_id TEXT NOT NULL,
  task_description TEXT NOT NULL,
  acceptance_criteria JSONB NOT NULL DEFAULT '[]',
  criteria_results JSONB NOT NULL DEFAULT '[]',
  intent_match_score NUMERIC(5,2) DEFAULT NULL,
  intent_match_reasoning TEXT DEFAULT NULL,
  code_quality_score INTEGER DEFAULT NULL,
  overall_verdict TEXT NOT NULL DEFAULT 'pending' CHECK (overall_verdict IN ('pending', 'pass', 'fail', 'partial')),
  source TEXT NOT NULL DEFAULT 'executor' CHECK (source IN ('executor', 'encode', 'shadow', 'manual')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tsac_executor ON public.tsac_verifications (executor_id);
CREATE INDEX idx_tsac_verdict ON public.tsac_verifications (overall_verdict);
CREATE INDEX idx_tsac_created ON public.tsac_verifications (created_at DESC);
CREATE INDEX idx_tsac_source ON public.tsac_verifications (source);

-- RLS
ALTER TABLE public.tsac_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage TSAC verifications"
ON public.tsac_verifications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Allow service role (edge functions) full access implicitly

-- Aggregate view for executor TSAC performance
CREATE OR REPLACE VIEW public.tsac_executor_stats AS
SELECT
  executor_id,
  source,
  COUNT(*) AS total_verifications,
  COUNT(*) FILTER (WHERE overall_verdict = 'pass') AS pass_count,
  COUNT(*) FILTER (WHERE overall_verdict = 'fail') AS fail_count,
  COUNT(*) FILTER (WHERE overall_verdict = 'partial') AS partial_count,
  ROUND(AVG(intent_match_score), 2) AS avg_intent_score,
  ROUND(AVG(code_quality_score), 1) AS avg_quality_score,
  ROUND(
    COUNT(*) FILTER (WHERE overall_verdict = 'pass')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1
  ) AS pass_rate,
  MAX(created_at) AS last_verified
FROM public.tsac_verifications
GROUP BY executor_id, source;
