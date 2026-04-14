-- PHASE 4b: Tighten remaining non-service-role always-true INSERT policies

-- analytics_events: scope to authenticated user_id
DROP POLICY IF EXISTS "Authenticated users can insert analytics events" ON public.analytics_events;
CREATE POLICY "Users insert own analytics events"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- client_error_log: allow anon inserts but cap with rate limiting awareness
-- This is intentionally open for error reporting from unauthenticated pages
-- Keep but document as intentional

-- defense_events: already hardened in Pass 1, verify
DROP POLICY IF EXISTS "Authenticated can insert defense_events" ON public.defense_events;

-- discovery_retired_combos: scope DELETE to owner
DROP POLICY IF EXISTS "Authenticated users can delete retired combos" ON public.discovery_retired_combos;
CREATE POLICY "Admin manages retired combos"
  ON public.discovery_retired_combos FOR DELETE
  TO authenticated
  USING (public.has_role_text(auth.uid(), 'admin'));