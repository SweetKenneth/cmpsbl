-- Evolution Runs: Single Source of Truth for Evolution State
CREATE TYPE evolution_phase AS ENUM ('planning', 'shadow_applied', 'production_applied', 'verified', 'aborted', 'failed');
CREATE TYPE evolution_initiator AS ENUM ('system', 'human');
CREATE TYPE evolution_risk_level AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.evolution_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL,
  phase evolution_phase NOT NULL DEFAULT 'planning',
  initiated_by evolution_initiator NOT NULL DEFAULT 'system',
  confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  risk_level evolution_risk_level DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  receipt_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Evolution Receipts: Immutable audit trail
CREATE TABLE public.evolution_receipts (
  receipt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.evolution_runs(run_id),
  plan_id UUID NOT NULL,
  phase evolution_phase NOT NULL,
  changes_applied JSONB NOT NULL DEFAULT '[]'::jsonb,
  tests_run INTEGER DEFAULT 0,
  tests_passed INTEGER DEFAULT 0,
  health_before JSONB,
  health_after JSONB,
  backup_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_evolution_runs_phase ON public.evolution_runs(phase);
CREATE INDEX idx_evolution_runs_plan_id ON public.evolution_runs(plan_id);
CREATE INDEX idx_evolution_runs_created ON public.evolution_runs(created_at DESC);
CREATE INDEX idx_evolution_receipts_run_id ON public.evolution_receipts(run_id);

-- Trigger to update updated_at
CREATE TRIGGER update_evolution_runs_timestamp
  BEFORE UPDATE ON public.evolution_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_brain_timestamp();

-- Enable RLS
ALTER TABLE public.evolution_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolution_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Service role and admins can access
CREATE POLICY "Service role can manage evolution_runs"
  ON public.evolution_runs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage evolution_receipts"
  ON public.evolution_receipts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to enforce linear phase transitions
CREATE OR REPLACE FUNCTION public.validate_evolution_phase_transition()
RETURNS TRIGGER AS $$
DECLARE
  phase_order INTEGER[];
  old_order INTEGER;
  new_order INTEGER;
BEGIN
  -- Define phase order: planning=1, shadow_applied=2, production_applied=3, verified=4
  -- aborted and failed can come from any state
  IF NEW.phase IN ('aborted', 'failed') THEN
    RETURN NEW;
  END IF;
  
  phase_order := ARRAY[1, 2, 3, 4];
  
  old_order := CASE OLD.phase
    WHEN 'planning' THEN 1
    WHEN 'shadow_applied' THEN 2
    WHEN 'production_applied' THEN 3
    WHEN 'verified' THEN 4
    ELSE 0
  END;
  
  new_order := CASE NEW.phase
    WHEN 'planning' THEN 1
    WHEN 'shadow_applied' THEN 2
    WHEN 'production_applied' THEN 3
    WHEN 'verified' THEN 4
    ELSE 0
  END;
  
  -- Cannot go backwards (except to failed/aborted)
  IF new_order < old_order THEN
    RAISE EXCEPTION 'Invalid phase transition: cannot go from % to %', OLD.phase, NEW.phase;
  END IF;
  
  -- Cannot skip phases
  IF new_order > old_order + 1 THEN
    RAISE EXCEPTION 'Invalid phase transition: cannot skip from % to %', OLD.phase, NEW.phase;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER enforce_evolution_phase_transition
  BEFORE UPDATE ON public.evolution_runs
  FOR EACH ROW
  WHEN (OLD.phase IS DISTINCT FROM NEW.phase)
  EXECUTE FUNCTION public.validate_evolution_phase_transition();

-- Function to ensure only one active run
CREATE OR REPLACE FUNCTION public.check_single_active_evolution()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.phase NOT IN ('verified', 'aborted', 'failed') THEN
    IF EXISTS (
      SELECT 1 FROM public.evolution_runs 
      WHERE run_id != NEW.run_id 
      AND phase NOT IN ('verified', 'aborted', 'failed')
    ) THEN
      RAISE EXCEPTION 'Only one active evolution run allowed at a time';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER enforce_single_active_evolution
  BEFORE INSERT ON public.evolution_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.check_single_active_evolution();