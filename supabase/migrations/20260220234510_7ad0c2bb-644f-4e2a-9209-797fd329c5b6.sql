-- Allow any authenticated user to update immune_escalations (ENCODE processor runs client-side)
DROP POLICY IF EXISTS "Admin update immune_escalations" ON public.immune_escalations;

CREATE POLICY "Authenticated update immune_escalations"
ON public.immune_escalations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Also allow authenticated SELECT so ENCODE can read the queue
DROP POLICY IF EXISTS "Admin read immune_escalations" ON public.immune_escalations;

CREATE POLICY "Authenticated read immune_escalations"
ON public.immune_escalations
FOR SELECT
USING (true);

-- Allow delete for telemetry reset
CREATE POLICY "Authenticated delete immune_escalations"
ON public.immune_escalations
FOR DELETE
USING (true);