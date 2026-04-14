-- Allow anonymous visitors to insert analytics events (public funnel tracking)
-- This is non-sensitive tracking data, not user PII
CREATE POLICY "anon_insert_analytics_events"
  ON public.analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (
    category IN ('conversion', 'onboarding', 'funnel')
    AND user_id IS NULL
  );

-- Also allow authenticated users to insert their own analytics events
CREATE POLICY "auth_insert_own_analytics_events"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL
  );