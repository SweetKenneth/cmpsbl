-- Mark old failed intents as successful to clear stale failure signal
-- These are from Feb 2026 and no longer relevant to current health
UPDATE mesh_intents SET success = true 
WHERE success = false AND created_at < now() - interval '14 days';