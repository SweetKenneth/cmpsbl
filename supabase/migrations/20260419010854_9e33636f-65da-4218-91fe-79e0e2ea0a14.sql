-- ============================================================
-- CONDUCTOR Hardening — Circuit Breakers, Quarantine, Tick Lease
-- ============================================================

-- 1. Add breaker + retry columns to conductor_pipelines
ALTER TABLE public.conductor_pipelines
  ADD COLUMN IF NOT EXISTS consecutive_failures integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_failures integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS breaker_state text NOT NULL DEFAULT 'closed'
    CHECK (breaker_state IN ('closed','open','half_open')),
  ADD COLUMN IF NOT EXISTS breaker_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS breaker_recovery_seconds integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS breaker_total_trips integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quarantined_at timestamptz,
  ADD COLUMN IF NOT EXISTS quarantine_reason text,
  ADD COLUMN IF NOT EXISTS dispatch_timeout_ms integer NOT NULL DEFAULT 25000,
  ADD COLUMN IF NOT EXISTS max_retries integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_conductor_pipelines_breaker
  ON public.conductor_pipelines(breaker_state) WHERE breaker_state <> 'closed';

-- 2. Tick lease table — single-row, ensures only one tick runs at a time
CREATE TABLE IF NOT EXISTS public.conductor_tick_lease (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  holder_id uuid,
  acquired_at timestamptz,
  expires_at timestamptz,
  last_completed_at timestamptz,
  last_completed_holder uuid
);
INSERT INTO public.conductor_tick_lease (id) VALUES (true) ON CONFLICT DO NOTHING;
ALTER TABLE public.conductor_tick_lease ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_lease_all" ON public.conductor_tick_lease;
CREATE POLICY "service_lease_all" ON public.conductor_tick_lease TO service_role
  USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_read_lease" ON public.conductor_tick_lease;
CREATE POLICY "admin_read_lease" ON public.conductor_tick_lease FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'admin'));

-- 3. Substrate health snapshots per tick
CREATE TABLE IF NOT EXISTS public.conductor_tick_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tick_id uuid NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  health_score integer NOT NULL,
  degradation_tier text NOT NULL CHECK (degradation_tier IN ('healthy','degraded','critical')),
  open_breakers integer NOT NULL DEFAULT 0,
  half_open_breakers integer NOT NULL DEFAULT 0,
  quarantined integer NOT NULL DEFAULT 0,
  dispatched integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  tick_duration_ms integer
);
CREATE INDEX IF NOT EXISTS idx_conductor_tick_health_recorded
  ON public.conductor_tick_health(recorded_at DESC);
ALTER TABLE public.conductor_tick_health ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_health_all" ON public.conductor_tick_health;
CREATE POLICY "service_health_all" ON public.conductor_tick_health TO service_role
  USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_read_health" ON public.conductor_tick_health;
CREATE POLICY "admin_read_health" ON public.conductor_tick_health FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'admin'));

-- 4. Acquire tick lease (returns true on success). Steals stale leases.
CREATE OR REPLACE FUNCTION public.conductor_acquire_tick_lease(
  p_holder uuid,
  p_ttl_seconds integer DEFAULT 110
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_acquired boolean := false;
BEGIN
  UPDATE public.conductor_tick_lease
     SET holder_id = p_holder,
         acquired_at = now(),
         expires_at = now() + make_interval(secs => p_ttl_seconds)
   WHERE id = true
     AND (holder_id IS NULL OR expires_at IS NULL OR expires_at < now())
  RETURNING true INTO v_acquired;
  RETURN COALESCE(v_acquired, false);
END;
$$;

-- 5. Release tick lease
CREATE OR REPLACE FUNCTION public.conductor_release_tick_lease(p_holder uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conductor_tick_lease
     SET holder_id = NULL,
         expires_at = NULL,
         last_completed_at = now(),
         last_completed_holder = p_holder
   WHERE id = true AND holder_id = p_holder;
END;
$$;

-- 6. Atomic breaker outcome handler
--    outcome: 'success' | 'failure'
--    Returns the resulting breaker_state.
CREATE OR REPLACE FUNCTION public.conductor_record_breaker_outcome(
  p_id uuid,
  p_outcome text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_state text;
  v_consec_fail integer;
  v_recovery integer;
  v_trips integer;
  v_max_recovery integer := 1800;        -- 30 min ceiling
  v_base_recovery integer := 60;
  v_failure_threshold integer := 5;
  v_quarantine_after integer := 4;       -- 4 trips → quarantine
BEGIN
  IF p_outcome = 'success' THEN
    -- Half-open success → close. Closed → just zero counters.
    UPDATE public.conductor_pipelines
       SET consecutive_failures = 0,
           breaker_state = 'closed',
           breaker_opened_at = NULL,
           breaker_recovery_seconds = v_base_recovery
     WHERE id = p_id
     RETURNING breaker_state INTO v_state;
    RETURN v_state;
  END IF;

  -- failure
  SELECT consecutive_failures, breaker_recovery_seconds, breaker_total_trips
    INTO v_consec_fail, v_recovery, v_trips
  FROM public.conductor_pipelines WHERE id = p_id;

  v_consec_fail := COALESCE(v_consec_fail, 0) + 1;

  IF v_consec_fail >= v_failure_threshold THEN
    -- Trip the breaker — exponential backoff
    v_recovery := LEAST(v_max_recovery, GREATEST(v_base_recovery, COALESCE(v_recovery, v_base_recovery) * 2));
    v_trips := COALESCE(v_trips, 0) + 1;

    UPDATE public.conductor_pipelines
       SET consecutive_failures = v_consec_fail,
           total_failures = total_failures + 1,
           breaker_state = 'open',
           breaker_opened_at = now(),
           breaker_recovery_seconds = v_recovery,
           breaker_total_trips = v_trips,
           -- Quarantine after too many trips
           quarantined_at = CASE WHEN v_trips >= v_quarantine_after THEN now() ELSE quarantined_at END,
           quarantine_reason = CASE WHEN v_trips >= v_quarantine_after
             THEN format('Auto-quarantined after %s breaker trips', v_trips)
             ELSE quarantine_reason END,
           enabled = CASE WHEN v_trips >= v_quarantine_after THEN false ELSE enabled END
     WHERE id = p_id
     RETURNING breaker_state INTO v_state;
  ELSE
    UPDATE public.conductor_pipelines
       SET consecutive_failures = v_consec_fail,
           total_failures = total_failures + 1
     WHERE id = p_id
     RETURNING breaker_state INTO v_state;
  END IF;

  RETURN v_state;
END;
$$;

-- 7. Auto half-open — call at the top of each tick to flip ready-to-probe breakers
CREATE OR REPLACE FUNCTION public.conductor_promote_half_open()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.conductor_pipelines
     SET breaker_state = 'half_open'
   WHERE breaker_state = 'open'
     AND breaker_opened_at IS NOT NULL
     AND breaker_opened_at + make_interval(secs => breaker_recovery_seconds) < now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;