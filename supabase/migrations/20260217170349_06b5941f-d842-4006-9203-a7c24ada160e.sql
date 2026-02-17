-- Enable realtime for defense_events so live feed works
ALTER PUBLICATION supabase_realtime ADD TABLE public.defense_events;

-- Allow anon/authenticated to SELECT defense_events for the analytics dashboard
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'defense_events' AND policyname = 'Anyone can view defense events'
  ) THEN
    CREATE POLICY "Anyone can view defense events"
    ON public.defense_events
    FOR SELECT
    USING (true);
  END IF;
END $$;