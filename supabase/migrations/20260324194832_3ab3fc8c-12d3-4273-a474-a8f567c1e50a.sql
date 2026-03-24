-- Drop empty, unreferenced tables (bloat cleanup)
DROP TABLE IF EXISTS brain_sensory_events;
DROP TABLE IF EXISTS brain_proxy_logs;

-- Add index for efficient time-based pruning on brain_events
CREATE INDEX IF NOT EXISTS idx_brain_events_type_created 
  ON brain_events (event_type, created_at DESC);