-- ============================================================================
-- AGENCY TELEMETRY & WORK VERIFICATION SCHEMA
-- Tracks real work throughput, per-agent performance, and artifacts
-- ============================================================================

-- Agent telemetry ledger - per-agent performance tracking
CREATE TABLE IF NOT EXISTS public.agency_agent_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.agency_members(id) ON DELETE SET NULL,
  
  -- Core counters
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_failed INTEGER NOT NULL DEFAULT 0,
  datasets_processed INTEGER NOT NULL DEFAULT 0,
  websites_crawled INTEGER NOT NULL DEFAULT 0,
  api_calls INTEGER NOT NULL DEFAULT 0,
  enrichment_operations INTEGER NOT NULL DEFAULT 0,
  monitoring_cycles INTEGER NOT NULL DEFAULT 0,
  
  -- Performance metrics
  total_execution_time_ms BIGINT NOT NULL DEFAULT 0,
  avg_latency_ms NUMERIC(10, 2),
  estimated_cost_cents INTEGER NOT NULL DEFAULT 0,
  
  -- Skill usage frequency (JSONB for flexibility)
  skill_usage JSONB NOT NULL DEFAULT '{}'::JSONB,
  
  -- Period tracking
  period_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint per agent per day
  CONSTRAINT unique_agent_daily_telemetry UNIQUE (agency_id, member_id, period_date)
);

-- Task artifacts - stores work evidence
CREATE TABLE IF NOT EXISTS public.agency_task_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.agency_tasks(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.agency_members(id) ON DELETE SET NULL,
  
  -- Artifact details
  artifact_type VARCHAR(50) NOT NULL, -- 'csv', 'json', 'pdf', 'markdown', 'screenshot', 'zip'
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT,
  file_size_bytes INTEGER,
  content_hash VARCHAR(64), -- SHA-256 for verification
  
  -- Inline content for small artifacts
  inline_content TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  download_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API call log - tracks external API usage
CREATE TABLE IF NOT EXISTS public.agency_api_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.agency_tasks(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.agency_members(id) ON DELETE SET NULL,
  
  -- API details
  api_name VARCHAR(100) NOT NULL, -- 'firecrawl', 'groq', 'wikipedia', 'yelp', etc.
  endpoint VARCHAR(255),
  method VARCHAR(10) DEFAULT 'GET',
  
  -- Result tracking
  success BOOLEAN NOT NULL DEFAULT true,
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  
  -- Cost tracking (if applicable)
  estimated_cost_cents NUMERIC(10, 4) DEFAULT 0,
  tokens_used INTEGER,
  
  -- Request/response metadata (not full payloads for privacy)
  request_metadata JSONB DEFAULT '{}'::JSONB,
  response_metadata JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agency_agent_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_task_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_api_calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for telemetry
CREATE POLICY "Agency owners can view their telemetry"
  ON public.agency_agent_telemetry FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agencies a
    WHERE a.id = agency_agent_telemetry.agency_id AND a.owner_id = auth.uid()
  ));

CREATE POLICY "Agency owners can view their artifacts"
  ON public.agency_task_artifacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agencies a
    WHERE a.id = agency_task_artifacts.agency_id AND a.owner_id = auth.uid()
  ));

CREATE POLICY "Agency owners can view their API calls"
  ON public.agency_api_calls FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agencies a
    WHERE a.id = agency_api_calls.agency_id AND a.owner_id = auth.uid()
  ));

-- Public access for demo/testing (can be tightened)
CREATE POLICY "Service role can manage telemetry"
  ON public.agency_agent_telemetry FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage artifacts"
  ON public.agency_task_artifacts FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage API calls"
  ON public.agency_api_calls FOR ALL
  USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_telemetry_agency_date 
  ON public.agency_agent_telemetry(agency_id, period_date DESC);

CREATE INDEX IF NOT EXISTS idx_task_artifacts_task
  ON public.agency_task_artifacts(task_id);

CREATE INDEX IF NOT EXISTS idx_api_calls_agency_date
  ON public.agency_api_calls(agency_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_calls_task
  ON public.agency_api_calls(task_id);

-- Function to increment telemetry counters atomically
CREATE OR REPLACE FUNCTION public.increment_agent_telemetry(
  p_agency_id UUID,
  p_member_id UUID,
  p_field VARCHAR(50),
  p_increment INTEGER DEFAULT 1,
  p_skill_usage JSONB DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO agency_agent_telemetry (
    agency_id, member_id, period_date,
    tasks_completed, tasks_failed, datasets_processed,
    websites_crawled, api_calls, enrichment_operations,
    monitoring_cycles, total_execution_time_ms, skill_usage
  )
  VALUES (
    p_agency_id, p_member_id, CURRENT_DATE,
    CASE WHEN p_field = 'tasks_completed' THEN p_increment ELSE 0 END,
    CASE WHEN p_field = 'tasks_failed' THEN p_increment ELSE 0 END,
    CASE WHEN p_field = 'datasets_processed' THEN p_increment ELSE 0 END,
    CASE WHEN p_field = 'websites_crawled' THEN p_increment ELSE 0 END,
    CASE WHEN p_field = 'api_calls' THEN p_increment ELSE 0 END,
    CASE WHEN p_field = 'enrichment_operations' THEN p_increment ELSE 0 END,
    CASE WHEN p_field = 'monitoring_cycles' THEN p_increment ELSE 0 END,
    p_execution_time_ms,
    COALESCE(p_skill_usage, '{}'::JSONB)
  )
  ON CONFLICT (agency_id, member_id, period_date)
  DO UPDATE SET
    tasks_completed = agency_agent_telemetry.tasks_completed + 
      CASE WHEN p_field = 'tasks_completed' THEN p_increment ELSE 0 END,
    tasks_failed = agency_agent_telemetry.tasks_failed + 
      CASE WHEN p_field = 'tasks_failed' THEN p_increment ELSE 0 END,
    datasets_processed = agency_agent_telemetry.datasets_processed + 
      CASE WHEN p_field = 'datasets_processed' THEN p_increment ELSE 0 END,
    websites_crawled = agency_agent_telemetry.websites_crawled + 
      CASE WHEN p_field = 'websites_crawled' THEN p_increment ELSE 0 END,
    api_calls = agency_agent_telemetry.api_calls + 
      CASE WHEN p_field = 'api_calls' THEN p_increment ELSE 0 END,
    enrichment_operations = agency_agent_telemetry.enrichment_operations + 
      CASE WHEN p_field = 'enrichment_operations' THEN p_increment ELSE 0 END,
    monitoring_cycles = agency_agent_telemetry.monitoring_cycles + 
      CASE WHEN p_field = 'monitoring_cycles' THEN p_increment ELSE 0 END,
    total_execution_time_ms = agency_agent_telemetry.total_execution_time_ms + p_execution_time_ms,
    skill_usage = agency_agent_telemetry.skill_usage || COALESCE(p_skill_usage, '{}'::JSONB),
    updated_at = now();
END;
$$;