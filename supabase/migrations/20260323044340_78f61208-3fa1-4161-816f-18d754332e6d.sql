-- Revert: restrict brain_events to admin/governor only
DROP POLICY IF EXISTS "Authenticated users can read brain_events" ON public.brain_events;
DROP POLICY IF EXISTS "Authenticated read brain_events" ON public.brain_events;

-- Restore admin-only access
CREATE POLICY "Admins can read brain_events"
  ON public.brain_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));