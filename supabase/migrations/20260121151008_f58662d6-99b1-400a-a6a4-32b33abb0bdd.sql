-- Create execution traces table for storing execution history
CREATE TABLE IF NOT EXISTS public.execution_traces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agency_members(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.agency_tasks(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL,
  goal_state TEXT NOT NULL,
  action_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  match_score INTEGER DEFAULT 0,
  verification_status TEXT,
  discrepancies JSONB DEFAULT '[]'::jsonb,
  evidence JSONB DEFAULT '[]'::jsonb,
  credit_delta INTEGER DEFAULT 0,
  heuristics_learned TEXT[] DEFAULT '{}',
  fallback_used BOOLEAN DEFAULT false,
  recovery_strategy TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create agent competency tracking table
CREATE TABLE IF NOT EXISTS public.agent_competency (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agency_members(id) ON DELETE CASCADE,
  competency_score INTEGER NOT NULL DEFAULT 50,
  success_rate NUMERIC(5,2) DEFAULT 50.00,
  total_attempts INTEGER DEFAULT 0,
  successful_attempts INTEGER DEFAULT 0,
  partial_attempts INTEGER DEFAULT 0,
  failed_attempts INTEGER DEFAULT 0,
  escalations INTEGER DEFAULT 0,
  heuristics JSONB DEFAULT '[]'::jsonb,
  last_execution_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id)
);

-- Create integration usage tracking
CREATE TABLE IF NOT EXISTS public.integration_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  integration_id TEXT NOT NULL,
  endpoint_id TEXT,
  agent_id UUID REFERENCES public.agency_members(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'success',
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.execution_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_competency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for execution_traces
CREATE POLICY "Users can view execution traces for their agencies"
ON public.execution_traces FOR SELECT
USING (
  agency_id IN (
    SELECT id FROM public.agencies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert execution traces for their agencies"
ON public.execution_traces FOR INSERT
WITH CHECK (
  agency_id IN (
    SELECT id FROM public.agencies WHERE owner_id = auth.uid()
  )
);

-- RLS Policies for agent_competency
CREATE POLICY "Users can view agent competency for their agencies"
ON public.agent_competency FOR SELECT
USING (
  agent_id IN (
    SELECT am.id FROM public.agency_members am
    JOIN public.agencies a ON a.id = am.agency_id
    WHERE a.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update agent competency for their agencies"
ON public.agent_competency FOR UPDATE
USING (
  agent_id IN (
    SELECT am.id FROM public.agency_members am
    JOIN public.agencies a ON a.id = am.agency_id
    WHERE a.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert agent competency for their agencies"
ON public.agent_competency FOR INSERT
WITH CHECK (
  agent_id IN (
    SELECT am.id FROM public.agency_members am
    JOIN public.agencies a ON a.id = am.agency_id
    WHERE a.owner_id = auth.uid()
  )
);

-- RLS Policies for integration_usage
CREATE POLICY "Users can view integration usage for their agencies"
ON public.integration_usage FOR SELECT
USING (
  agency_id IN (
    SELECT id FROM public.agencies WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert integration usage for their agencies"
ON public.integration_usage FOR INSERT
WITH CHECK (
  agency_id IN (
    SELECT id FROM public.agencies WHERE owner_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_execution_traces_agency ON public.execution_traces(agency_id);
CREATE INDEX idx_execution_traces_agent ON public.execution_traces(agent_id);
CREATE INDEX idx_execution_traces_task ON public.execution_traces(task_id);
CREATE INDEX idx_execution_traces_status ON public.execution_traces(status);
CREATE INDEX idx_agent_competency_agent ON public.agent_competency(agent_id);
CREATE INDEX idx_integration_usage_agency ON public.integration_usage(agency_id);
CREATE INDEX idx_integration_usage_integration ON public.integration_usage(integration_id);

-- Create function to update agent competency
CREATE OR REPLACE FUNCTION public.update_agent_competency_from_trace()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agent_competency (agent_id, competency_score, success_rate, total_attempts, successful_attempts, partial_attempts, failed_attempts, escalations, last_execution_at)
  VALUES (
    NEW.agent_id,
    50 + COALESCE(NEW.credit_delta, 0),
    CASE WHEN NEW.verification_status = 'success' THEN 100.00 ELSE 0.00 END,
    1,
    CASE WHEN NEW.verification_status = 'success' THEN 1 ELSE 0 END,
    CASE WHEN NEW.verification_status = 'partial' THEN 1 ELSE 0 END,
    CASE WHEN NEW.verification_status = 'fail' THEN 1 ELSE 0 END,
    CASE WHEN NEW.recovery_strategy = 'escalate' THEN 1 ELSE 0 END,
    NEW.completed_at
  )
  ON CONFLICT (agent_id) DO UPDATE SET
    competency_score = LEAST(100, GREATEST(0, agent_competency.competency_score + COALESCE(NEW.credit_delta, 0))),
    total_attempts = agent_competency.total_attempts + 1,
    successful_attempts = agent_competency.successful_attempts + CASE WHEN NEW.verification_status = 'success' THEN 1 ELSE 0 END,
    partial_attempts = agent_competency.partial_attempts + CASE WHEN NEW.verification_status = 'partial' THEN 1 ELSE 0 END,
    failed_attempts = agent_competency.failed_attempts + CASE WHEN NEW.verification_status = 'fail' THEN 1 ELSE 0 END,
    escalations = agent_competency.escalations + CASE WHEN NEW.recovery_strategy = 'escalate' THEN 1 ELSE 0 END,
    success_rate = (agent_competency.successful_attempts + CASE WHEN NEW.verification_status = 'success' THEN 1 ELSE 0 END)::NUMERIC * 100 / (agent_competency.total_attempts + 1),
    last_execution_at = NEW.completed_at,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-updating competency
CREATE TRIGGER trigger_update_agent_competency
AFTER INSERT ON public.execution_traces
FOR EACH ROW
WHEN (NEW.agent_id IS NOT NULL AND NEW.completed_at IS NOT NULL)
EXECUTE FUNCTION public.update_agent_competency_from_trace();