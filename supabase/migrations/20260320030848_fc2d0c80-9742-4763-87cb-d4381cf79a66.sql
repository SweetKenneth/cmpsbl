-- Allow anonymous visitors to insert conversion/onboarding analytics events
CREATE POLICY "Anon can insert analytics events"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anon to read their own session events (for dedup)
CREATE POLICY "Anon read own session analytics"
ON public.analytics_events
FOR SELECT
TO anon
USING (user_id IS NULL);