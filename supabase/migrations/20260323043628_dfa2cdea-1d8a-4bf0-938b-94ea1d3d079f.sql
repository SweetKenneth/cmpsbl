-- Allow all authenticated users to read brain_events (analytics telemetry)
CREATE POLICY "Authenticated users can read brain_events"
  ON public.brain_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop the restrictive admin-only and moderator-only read policies
DROP POLICY IF EXISTS "Admins can read brain_events" ON public.brain_events;
DROP POLICY IF EXISTS "Moderators can read internal brain_events" ON public.brain_events;