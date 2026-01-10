-- ═══════════════════════════════════════════════════════════════
-- UNIFIED DREAM EATER CRON SETUP
-- Consolidates all dream functions into ONE scheduled job
-- ═══════════════════════════════════════════════════════════════

-- Remove old fragmented dream cron
SELECT cron.unschedule('dream-mode-nightly');

-- Schedule the unified Dream Eater cycle
-- Runs at 3 AM UTC daily (optimal dream time)
SELECT cron.schedule(
  'dream-eater-unified-cycle',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url:='https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-dream-eater-cycle',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2RvbHFxY3pqdWFod2Ryc3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTA2MTMsImV4cCI6MjA4MDM2NjYxM30.-YWlnszid8aODq2Zv2EvxWcY2sTsRikPcNsMWpZ7lHc'
    ),
    body:=jsonb_build_object('force', true, 'send_email', true)
  ) AS request_id;
  $$
);