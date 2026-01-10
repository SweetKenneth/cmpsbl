-- Unschedule old orchestrator jobs
SELECT cron.unschedule('brain-orchestrator') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'brain-orchestrator');
SELECT cron.unschedule('brain-continuous-learn') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'brain-continuous-learn');

-- Schedule CASCADE OPERATIVE MODE - Every 30 minutes (48 cycles/day)
SELECT cron.schedule(
  'cascade-operative-mode',
  '*/30 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-cascade-operative',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2RvbHFxY3pqdWFod2Ryc3d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc5MDYxMywiZXhwIjoyMDgwMzY2NjEzfQ.9M_MpXJh4FzRuSbEGFBYGJRbCyM9VrJAQNUTRlnFN_w"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);