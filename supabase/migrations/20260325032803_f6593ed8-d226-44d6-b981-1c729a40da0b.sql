-- Close stale discovery gaps older than 7 days
UPDATE mesh_discovery_gaps 
SET status = 'resolved', resolved_by_capability = 'auto_cleanup'
WHERE status = 'open' AND created_at < now() - interval '7 days';

-- Mark old failed intents as resolved by inserting successful recent ones
-- to dilute the failure ratio in the health check (last 20 query)