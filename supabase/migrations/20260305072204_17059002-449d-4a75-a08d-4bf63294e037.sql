
-- First-class KV table for Control Plane state
-- Replaces append-only brain_events usage with proper upsert semantics
CREATE TABLE public.control_plane_state (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for temporal queries (most recent first)
CREATE INDEX idx_cp_state_updated_at ON public.control_plane_state (updated_at DESC);

-- Index for prefix queries (cpList uses LIKE 'prefix%')
CREATE INDEX idx_cp_state_key_prefix ON public.control_plane_state (key text_pattern_ops);

-- Enable RLS
ALTER TABLE public.control_plane_state ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full CRUD
-- CP state is system-level; any authenticated user with access to the app can read/write
CREATE POLICY "Authenticated users can manage CP state"
  ON public.control_plane_state
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon read-only access (CP reads may happen before auth in degraded scenarios)
CREATE POLICY "Anon can read CP state"
  ON public.control_plane_state
  FOR SELECT
  TO anon
  USING (true);

-- Optional: backfill recent cp_state entries from brain_events (best-effort, one-time)
-- Copies the latest record for each distinct cp_state key into the new table
INSERT INTO public.control_plane_state (key, value, meta, updated_at, created_at)
SELECT DISTINCT ON (substring(event_type from 10))
  substring(event_type from 10) AS key,
  COALESCE((data->>'value')::jsonb, data->'value') AS value,
  COALESCE(data->'meta', '{}'::jsonb) AS meta,
  created_at AS updated_at,
  created_at
FROM public.brain_events
WHERE event_type LIKE 'cp_state:%'
  AND data IS NOT NULL
  AND data->>'value' IS NOT NULL
ORDER BY substring(event_type from 10), created_at DESC
ON CONFLICT (key) DO NOTHING;
