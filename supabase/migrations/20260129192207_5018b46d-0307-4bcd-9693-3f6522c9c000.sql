-- Evolution Circuit Breaker table
CREATE TABLE public.evolution_circuit (
  circuit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL DEFAULT 'closed' CHECK (state IN ('open', 'closed')),
  reason TEXT,
  last_trip_at TIMESTAMPTZ,
  auto_reset_after INTERVAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evolution_circuit ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage circuit
CREATE POLICY "Admins can manage circuit"
ON public.evolution_circuit
FOR ALL
USING (public.has_role('admin'));

-- Allow anyone to read circuit status
CREATE POLICY "Anyone can read circuit status"
ON public.evolution_circuit
FOR SELECT
USING (true);

-- Insert default closed circuit
INSERT INTO public.evolution_circuit (state, reason)
VALUES ('closed', 'Initial state - system operational');

-- Evolution autonomy config table
CREATE TABLE public.evolution_autonomy_config (
  config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autonomy_mode TEXT NOT NULL DEFAULT 'off' CHECK (autonomy_mode IN ('off', 'advisory', 'governed')),
  max_auto_runs_per_day INTEGER NOT NULL DEFAULT 1,
  require_confidence_threshold BOOLEAN NOT NULL DEFAULT true,
  min_confidence_prod NUMERIC(3,2) NOT NULL DEFAULT 0.80,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evolution_autonomy_config ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage config
CREATE POLICY "Admins can manage autonomy config"
ON public.evolution_autonomy_config
FOR ALL
USING (public.has_role('admin'));

-- Allow anyone to read config
CREATE POLICY "Anyone can read autonomy config"
ON public.evolution_autonomy_config
FOR SELECT
USING (true);

-- Insert default config
INSERT INTO public.evolution_autonomy_config (autonomy_mode, max_auto_runs_per_day)
VALUES ('off', 1);

-- Self-repair log table
CREATE TABLE public.evolution_repair_log (
  repair_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.evolution_runs(run_id),
  trigger_reason TEXT NOT NULL,
  actions_taken JSONB NOT NULL DEFAULT '[]',
  outcome TEXT CHECK (outcome IN ('success', 'partial', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.evolution_repair_log ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage repair logs
CREATE POLICY "Admins can manage repair logs"
ON public.evolution_repair_log
FOR ALL
USING (public.has_role('admin'));

-- Allow anyone to read repair logs
CREATE POLICY "Anyone can read repair logs"
ON public.evolution_repair_log
FOR SELECT
USING (true);

-- Add auto_runs_today counter to evolution_runs for daily limit tracking
ALTER TABLE public.evolution_runs ADD COLUMN IF NOT EXISTS auto_initiated BOOLEAN DEFAULT false;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_evolution_runs_auto_initiated ON public.evolution_runs(auto_initiated, created_at);

-- Trigger for updated_at
CREATE TRIGGER update_evolution_circuit_timestamp
BEFORE UPDATE ON public.evolution_circuit
FOR EACH ROW
EXECUTE FUNCTION public.update_brain_timestamp();

CREATE TRIGGER update_evolution_autonomy_config_timestamp
BEFORE UPDATE ON public.evolution_autonomy_config
FOR EACH ROW
EXECUTE FUNCTION public.update_brain_timestamp();