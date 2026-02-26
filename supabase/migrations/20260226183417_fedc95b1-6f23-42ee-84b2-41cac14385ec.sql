-- Fix defense_events RLS: Allow anon + authenticated users to INSERT
-- Per memory/security/defense-reporting-policy, client-side Site-Guard needs to record threats

-- Create INSERT policy for anonymous users
CREATE POLICY "Anon can insert defense_events"
ON public.defense_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Create INSERT policy for authenticated users
CREATE POLICY "Authenticated can insert defense_events"
ON public.defense_events
FOR INSERT
TO authenticated
WITH CHECK (true);