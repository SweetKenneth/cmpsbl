
-- Phase 2: Extend immune_metrics with repair telemetry columns
ALTER TABLE public.immune_metrics
  ADD COLUMN IF NOT EXISTS repair_attempted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS repair_success boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS repair_type text NULL,
  ADD COLUMN IF NOT EXISTS retry_attempted boolean NOT NULL DEFAULT false;

-- Indexes for admin analytics queries
CREATE INDEX IF NOT EXISTS idx_immune_metrics_created_desc ON public.immune_metrics (run_at DESC);
CREATE INDEX IF NOT EXISTS idx_immune_metrics_repair ON public.immune_metrics (repair_attempted) WHERE repair_attempted = true;
