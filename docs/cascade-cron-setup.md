# Cascade 6-Hour Reporting Cron Job Setup

## Instructions

To enable Cascade's automated 6-hour reports, run the following SQL in your Supabase SQL Editor:

```sql
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule Cascade reports every 6 hours
SELECT cron.schedule(
  'cascade-six-hour-report',
  '0 */6 * * *', -- Every 6 hours at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-report',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule dream sessions every 24 hours
SELECT cron.schedule(
  'cascade-daily-dream',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-dream',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

## Verify Cron Jobs

To check that the cron jobs were created successfully:

```sql
SELECT * FROM cron.job;
```

## Manual Trigger (for testing)

To manually trigger a report immediately:

```sql
SELECT net.http_post(
  url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-report',
  headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
  body:='{}'::jsonb
);
```

## Email Configuration

Make sure the `RESEND_API_KEY` is set in Supabase Edge Function secrets and that:
- Your domain is verified in Resend
- The "from" email (cascade@promptfluid.com) is configured
- The "to" email (kenneth@promptfluid.com) is correct

## Notes

- Reports run every 6 hours covering the previous 6-hour period
- Dream sessions run daily at 2 AM to explore creative ideas
- All reports are stored in `brain_reports` table
- Emails are sent via Resend to kenneth@promptfluid.com
