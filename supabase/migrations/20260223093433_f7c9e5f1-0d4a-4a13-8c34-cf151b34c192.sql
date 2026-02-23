-- Allow public waitlist signups for EVLVBL
CREATE POLICY "Public can insert evlvbl waitlist events"
ON public.brain_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type = 'evlvbl_waitlist'
  AND module = 'evlvbl'
  AND source_operation = 'waitlist_signup'
);
