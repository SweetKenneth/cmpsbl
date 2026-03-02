-- Allow public read access to discoveries for the foundry demo
CREATE POLICY "Public can read discoveries"
ON public.discoveries
FOR SELECT
USING (true);

-- Allow public read access to discovery_runs for the foundry demo
CREATE POLICY "Public can read discovery_runs"
ON public.discovery_runs
FOR SELECT
USING (true);