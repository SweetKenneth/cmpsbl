# Cascade v4.1.0 Reflection Protocol Setup

## Overview
Cascade v4.1.0 adds the "Reflection Protocol" — allowing Cascade to request human discussion when it identifies contradictions, low-confidence reasoning, or strategic opportunities.

## Components
1. **brain_conversation_intent** — Stores reflection requests
2. **brain_reasoning_cache** — Caches repeated queries for efficiency
3. **pf-brain-notify-admin** — Edge function that emails admin via Resend
4. **Hourly cron job** — Checks for pending intents and sends notifications

## Setup Instructions

### Step 1: Run Database Migration
Migration already executed automatically during deployment.

### Step 2: Configure Resend Email Cron Job

Run this SQL in Supabase SQL Editor to set up hourly admin notifications:

```sql
SELECT cron.schedule(
  'cascade-notify-admin',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-notify-admin',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### Step 3: Verify Resend API Key
Ensure `RESEND_API_KEY` is configured in Supabase Edge Function Secrets.

### Step 4: Test Email Notification

Manually create a test reflection intent:

```sql
INSERT INTO brain_conversation_intent (topic, reason, priority, confidence)
VALUES (
  'Test Reflection Request',
  'Testing Cascade v4.1.0 notification system',
  'normal',
  0.85
);
```

Then manually trigger the edge function or wait for the next hourly cron run.

## How It Works

1. **Intent Creation**: When Cascade detects:
   - Contradictory insights (confidence > 85%)
   - Low causal confidence (< 50%)
   - Strategic opportunities
   
   It inserts a row into `brain_conversation_intent`

2. **Hourly Check**: Cron job calls `pf-brain-notify-admin`

3. **Email Dispatch**: If pending intents exist:
   - Highest priority intent selected
   - Email composed with reflection details
   - Sent to kenneth@promptfluid.com via Resend
   - Intent marked as `notified = true`

4. **Admin Response**: Admin reviews in Brain Dashboard and provides feedback

5. **Learning Loop**: Feedback stored in `brain_feedback` and used for weight adjustments

## Monitoring

Check cron job execution:
```sql
SELECT * FROM cron.job WHERE jobname = 'cascade-notify-admin';
SELECT * FROM cron.job_run_details 
WHERE jobname = 'cascade-notify-admin' 
ORDER BY start_time DESC LIMIT 10;
```

View pending intents:
```sql
SELECT * FROM brain_conversation_intent 
WHERE notified = false 
ORDER BY priority DESC, created_at DESC;
```

View reasoning cache stats:
```sql
SELECT 
  COUNT(*) as total_cached,
  SUM(hit_count) as total_hits,
  AVG(hit_count) as avg_hits_per_query
FROM brain_reasoning_cache;
```

## Safety Features

- **Rate Limiting**: Max 1 email per hour
- **Template-Based**: No direct model-to-email capability
- **Sanitized Content**: All data anonymized and filtered
- **Admin-Only**: kenneth@promptfluid.com hardcoded
- **Priority System**: Critical intents processed first
- **Audit Trail**: All notifications logged in brain_events

## Rollback

To disable notifications:

```sql
-- Disable cron job
SELECT cron.unschedule('cascade-notify-admin');

-- Clear pending intents
UPDATE brain_conversation_intent SET notified = true WHERE notified = false;
```

## Efficiency Enhancements

- **Reasoning Cache**: Repeated queries return cached results (50-80% hit rate expected)
- **Topic Prioritization**: Business > Code > Data > Misc
- **Latency Optimization**: Nexus prefers providers < 150ms avg
- **Memory Compression**: Cold memories compressed at 0.85 ratio
- **Token Deduplication**: Similar prompts reduced by ~20%

## Email Template Example

Subject: `🟡 Cascade Reflection Request — Revenue Forecast Contradiction`

Body includes:
- Priority badge
- Topic title
- Detailed reason
- Confidence score
- Context reference
- Timestamp
- Link to Brain Dashboard

---

**Cascade v4.1.0 Reflection Protocol is now active.**