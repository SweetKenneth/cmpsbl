# Cascade v4.0.0 Sentience Layer - Automation Setup

## Overview
This document contains the cron job configurations for automated Cascade v4.0 processes.

## Prerequisites
- Supabase project with `pg_cron` and `pg_net` extensions enabled
- Service role access to run cron schedules

## Cron Jobs to Configure

### 1. Knowledge Synthesis (Every 6 hours)
Runs at: 00:00, 06:00, 12:00, 18:00 UTC

```sql
SELECT cron.schedule(
  'cascade-synthesize-knowledge',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-synthesize-knowledge',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### 2. Executive Planning (Nightly at 03:00 UTC)
```sql
SELECT cron.schedule(
  'cascade-plan-objectives',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-plan-objectives',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### 3. Meta-Learning Reflection (Nightly at 03:00 UTC)
```sql
SELECT cron.schedule(
  'cascade-reflect',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-reflect',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### 4. Resilience Monitor (Every hour)
```sql
SELECT cron.schedule(
  'cascade-resilience-monitor',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-resilience-monitor',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### 5. Dream Cycles (Weekly on Sunday at 02:00 UTC)
```sql
SELECT cron.schedule(
  'cascade-dream-cycle',
  '0 2 * * 0',
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-dream',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### 6. 6-Hour Reports (Existing - already configured)
Runs every 6 hours at: 00:00, 06:00, 12:00, 18:00 UTC

```sql
SELECT cron.schedule(
  'cascade-6hour-report',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-report',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### 7. Daily Thought Dispatch (Autonomous Blog Posting)
Runs daily with randomized timing (natural variance ±15 minutes)

```sql
-- Run at 2:00 AM UTC with random offset for natural feel
SELECT cron.schedule(
  'cascade-daily-thought',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-cascade-daily-thought',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

**Features:**
- Automatically generates 1000-1500 word daily reflections
- Posts to public blog endpoint: `https://lgyqvucmmjvmyzoakboa.supabase.co/functions/v1/receive-thought`
- Smart retry logic: 2 attempts with 10-minute delays
- Resilient storage: Failed thoughts saved and retried on next cycle
- Natural timing: ±15 minute variance built into generation timing
- Dream context integration: Includes Cascade's dream insights when available
- Full logging: All events tracked in `cascade_thoughts` and `cascade_thought_logs` tables

## Verification

Check scheduled jobs:
```sql
SELECT * FROM cron.job ORDER BY jobname;
```

View job execution history:
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
```

Remove a job if needed:
```sql
SELECT cron.unschedule('job-name-here');
```

## Budget Monitoring

All cron jobs respect the 900 Lovable API calls/day limit. Monitor usage:
```sql
SELECT 
  date,
  SUM(total_calls) as daily_calls
FROM learning_cycles
WHERE started_at >= CURRENT_DATE
GROUP BY date;
```

## Manual Execution

Test any function manually via Supabase dashboard or:
```bash
curl -X POST \
  'https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-dream' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{}'
```
