
-- 1. cortex_modes: drop permissive authenticated SELECT, add admin-only SELECT
DROP POLICY IF EXISTS "Authenticated users can read cortex modes" ON public.cortex_modes;
DROP POLICY IF EXISTS "Anyone can read cortex_modes" ON public.cortex_modes;
DROP POLICY IF EXISTS "Public read cortex_modes" ON public.cortex_modes;
DROP POLICY IF EXISTS "Authenticated can read cortex_modes" ON public.cortex_modes;

CREATE POLICY "Admins can read cortex_modes"
  ON public.cortex_modes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. brain_daily_reports: restrict to admin
DROP POLICY IF EXISTS "Authenticated users can read brain daily reports" ON public.brain_daily_reports;
DROP POLICY IF EXISTS "Anyone can read brain_daily_reports" ON public.brain_daily_reports;
DROP POLICY IF EXISTS "Authenticated can read brain_daily_reports" ON public.brain_daily_reports;

CREATE POLICY "Admins can read brain_daily_reports"
  ON public.brain_daily_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. evolution_receipts: restrict to admin
DROP POLICY IF EXISTS "Authenticated users can read evolution receipts" ON public.evolution_receipts;
DROP POLICY IF EXISTS "Anyone can read evolution_receipts" ON public.evolution_receipts;
DROP POLICY IF EXISTS "Authenticated can read evolution_receipts" ON public.evolution_receipts;

CREATE POLICY "Admins can read evolution_receipts"
  ON public.evolution_receipts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. evolution_runs: restrict to admin
DROP POLICY IF EXISTS "Authenticated users can read evolution runs" ON public.evolution_runs;
DROP POLICY IF EXISTS "Anyone can read evolution_runs" ON public.evolution_runs;
DROP POLICY IF EXISTS "Authenticated can read evolution_runs" ON public.evolution_runs;

CREATE POLICY "Admins can read evolution_runs"
  ON public.evolution_runs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. proposal_meta: restrict to admin
DROP POLICY IF EXISTS "Authenticated users can read proposal meta" ON public.proposal_meta;
DROP POLICY IF EXISTS "Anyone can read proposal_meta" ON public.proposal_meta;
DROP POLICY IF EXISTS "Authenticated can read proposal_meta" ON public.proposal_meta;

CREATE POLICY "Admins can read proposal_meta"
  ON public.proposal_meta FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. substrate_sequences: restrict to admin
DROP POLICY IF EXISTS "Authenticated users can read substrate sequences" ON public.substrate_sequences;
DROP POLICY IF EXISTS "Anyone can read substrate_sequences" ON public.substrate_sequences;
DROP POLICY IF EXISTS "Authenticated can read substrate_sequences" ON public.substrate_sequences;

CREATE POLICY "Admins can read substrate_sequences"
  ON public.substrate_sequences FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 7. substrate_sequence_steps: restrict to admin
DROP POLICY IF EXISTS "Authenticated users can read substrate sequence steps" ON public.substrate_sequence_steps;
DROP POLICY IF EXISTS "Anyone can read substrate_sequence_steps" ON public.substrate_sequence_steps;
DROP POLICY IF EXISTS "Authenticated can read substrate_sequence_steps" ON public.substrate_sequence_steps;

CREATE POLICY "Admins can read substrate_sequence_steps"
  ON public.substrate_sequence_steps FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 8. verification_scans: restrict to admin
DROP POLICY IF EXISTS "Authenticated users can read verification scans" ON public.verification_scans;
DROP POLICY IF EXISTS "Anyone can read verification_scans" ON public.verification_scans;
DROP POLICY IF EXISTS "Authenticated can read verification_scans" ON public.verification_scans;

CREATE POLICY "Admins can read verification_scans"
  ON public.verification_scans FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
