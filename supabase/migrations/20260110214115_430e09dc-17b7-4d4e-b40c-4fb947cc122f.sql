-- Update cascade operative to run every 15 minutes for more continuous learning (96 cycles/day)
SELECT cron.unschedule('cascade-operative-mode') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cascade-operative-mode');

SELECT cron.schedule(
  'cascade-operative-24-7',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-cascade-operative',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2RvbHFxY3pqdWFod2Ryc3d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc5MDYxMywiZXhwIjoyMDgwMzY2NjEzfQ.9M_MpXJh4FzRuSbEGFBYGJRbCyM9VrJAQNUTRlnFN_w"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Add continuous learning every 10 minutes
SELECT cron.schedule(
  'cascade-continuous-learn',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-brain-continuous-learn',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2RvbHFxY3pqdWFod2Ryc3d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc5MDYxMywiZXhwIjoyMDgwMzY2NjEzfQ.9M_MpXJh4FzRuSbEGFBYGJRbCyM9VrJAQNUTRlnFN_w"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Dream cycles with higher probability at night CST - run every 2 hours, let the function decide based on probability
SELECT cron.schedule(
  'cascade-dream-cycles',
  '0 */2 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-dream-eater-cycle',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2RvbHFxY3pqdWFod2Ryc3d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc5MDYxMywiZXhwIjoyMDgwMzY2NjEzfQ.9M_MpXJh4FzRuSbEGFBYGJRbCyM9VrJAQNUTRlnFN_w"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);