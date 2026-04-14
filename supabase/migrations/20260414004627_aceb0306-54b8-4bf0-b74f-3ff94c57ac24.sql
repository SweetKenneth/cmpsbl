
-- The authenticated insert policy already exists, just need to ensure the anon one is gone
-- (it was already dropped in the previous migration that succeeded up to that point)
-- Verify by attempting to drop again (IF EXISTS is safe)
DROP POLICY IF EXISTS "Anon can insert defense_events" ON public.defense_events;
