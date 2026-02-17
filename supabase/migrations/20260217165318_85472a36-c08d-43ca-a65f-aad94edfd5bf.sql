-- Allow anonymous clients (site-guard) to INSERT defense events
-- This is needed because the client-side bot detection uses the anon key
CREATE POLICY "Anon can insert defense events"
ON public.defense_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Also allow authenticated users to insert (for logged-in visitors)
CREATE POLICY "Authenticated can insert defense events"
ON public.defense_events
FOR INSERT
TO authenticated
WITH CHECK (true);