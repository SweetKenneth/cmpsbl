# Dream Eater Unified Cron Setup

## Overview

**Cascade and Dream-Eater are the SAME entity.**

This document explains how to set up the unified Dream Eater cycle that:
1. Runs daily at 2-4 AM UTC
2. Consumes memories and patterns from the day
3. Generates a surreal dream synthesis
4. Sends ONE consolidated email to Kenneth

## Supabase Cron Job Setup

Run this SQL in your Supabase SQL Editor to schedule the Dream Eater:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove old fragmented dream crons (if they exist)
SELECT cron.unschedule('cascade-daily-dream');
SELECT cron.unschedule('cascade-dream-mode');
SELECT cron.unschedule('brain-dream-cycle');

-- Schedule the UNIFIED Dream Eater cycle
-- Runs at 3 AM UTC daily (optimal dream time)
SELECT cron.schedule(
  'dream-eater-daily-cycle',
  '0 3 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-dream-eater-cycle',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2RvbHFxY3pqdWFod2Ryc3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTA2MTMsImV4cCI6MjA4MDM2NjYxM30.-YWlnszid8aODq2Zv2EvxWcY2sTsRikPcNsMWpZ7lHc'
        ),
        body:=jsonb_build_object('force', true, 'send_email', true)
    ) as request_id;
  $$
);
```

## Verify Cron Job

```sql
SELECT * FROM cron.job WHERE jobname LIKE '%dream%';
```

## Manual Trigger

To manually trigger a dream cycle:

```sql
SELECT net.http_post(
  url:='https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-dream-eater-cycle',
  headers:=jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2RvbHFxY3pqdWFod2Ryc3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3OTA2MTMsImV4cCI6MjA4MDM2NjYxM30.-YWlnszid8aODq2Zv2EvxWcY2sTsRikPcNsMWpZ7lHc'
  ),
  body:=jsonb_build_object('force', true, 'send_email', true)
);
```

## Deprecated Functions

The following functions are now deprecated and should NOT be scheduled:
- `pf-cascade-dream` - Replaced by unified cycle
- `pf-brain-dream` - Replaced by unified cycle  
- `pf-dream-mode` - Replaced by unified cycle
- `cascade-reflection-email` - Already disabled, use unified cycle

## Email Configuration

Emails are sent via Resend to `kenneth@promptfluid.com`.

Ensure `RESEND_API_KEY` is configured in Supabase Edge Function secrets.

## What Gets Stored

Each dream cycle stores:
- `cascade_dreams` table: The dream text, mood, and insight
- `brain_memory_hot` table: A synthesis memory for future reference
- `brain_events` table: Logging for debugging

## Single Email Guarantee

The unified cycle sends **ONE email per dream** with:
- The full dream narrative
- Mood analysis
- Hidden insight extracted
- System stats (memories consumed, patterns found)
- AI provider used
