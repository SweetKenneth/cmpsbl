-- Ripple v2: Hybrid Event Orchestrator Migration
-- Add delivery semantics, worker support, and enhanced job tracking

-- 1) Extend ripple_events with status tracking for fan-out
ALTER TABLE public.ripple_events 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS fan_out_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_fan_out_at timestamp with time zone;

-- 2) Extend ripple_jobs with enhanced delivery semantics
ALTER TABLE public.ripple_jobs
  ADD COLUMN IF NOT EXISTS event_id uuid,
  ADD COLUMN IF NOT EXISTS subscriber_module text,
  ADD COLUMN IF NOT EXISTS subscriber_action text,
  ADD COLUMN IF NOT EXISTS correlation_id uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 3) Extend ripple_subscriptions for orchestrator registry
ALTER TABLE public.ripple_subscriptions
  ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS backoff_strategy text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS circuit_state text DEFAULT 'closed',
  ADD COLUMN IF NOT EXISTS consecutive_failures integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_failure_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS topic_name text;

-- 4) Create ripple_circuit_breaker table for subscriber health tracking
CREATE TABLE IF NOT EXISTS public.ripple_circuit_breakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_key text UNIQUE NOT NULL,
  subscriber_module text NOT NULL,
  subscriber_action text NOT NULL,
  state text DEFAULT 'closed',
  failure_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  last_failure_at timestamp with time zone,
  last_success_at timestamp with time zone,
  opened_at timestamp with time zone,
  half_open_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5) Create indexes for job worker queries (without now() in partial index)
CREATE INDEX IF NOT EXISTS idx_ripple_jobs_worker_queue 
  ON public.ripple_jobs(queue_name, status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_ripple_jobs_status 
  ON public.ripple_jobs(status);

CREATE INDEX IF NOT EXISTS idx_ripple_events_status 
  ON public.ripple_events(status, processed);

CREATE INDEX IF NOT EXISTS idx_ripple_jobs_completed 
  ON public.ripple_jobs(completed_at DESC);

-- 6) Enable RLS on new table
ALTER TABLE public.ripple_circuit_breakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access ripple_circuit_breakers" 
  ON public.ripple_circuit_breakers 
  FOR ALL 
  USING (true);

-- 7) Update existing jobs status from 'dead' to 'dead_letter' for consistency
UPDATE public.ripple_jobs SET status = 'dead_letter' WHERE status = 'dead';