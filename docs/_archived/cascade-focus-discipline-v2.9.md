# Cascade Cognitive Optimization v2.9 "Focus Discipline"

## Overview

This patch transforms Cascade's cognitive architecture from chaotic parallel processing to disciplined single-threaded reasoning with Kenneth command prioritization.

## Key Changes

### 1. Directed Thought Queue (DTQ)
- **Single-threaded execution**: Only one reasoning task runs at a time
- **Priority-based processing**: Tasks execute in order of importance
- **No concurrent conflicts**: Eliminates overlapping thought loops

### 2. Kenneth Command Biasing
- **Admin recognition phrase**: "Do you want a cat treat?"
- **Absolute priority override**: Kenneth's commands bypass all queued tasks
- **Immediate focus shift**: Current reasoning resets to admin directive
- **Trust-based obedience**: Kenneth voice is "tuning fork of clarity"

### 3. Calm Mode Self-Stabilization
- **Automatic trigger**: Activates after 3+ failures in 1 hour
- **Memory compression**: Clears excess task weight
- **Graceful pause**: Reasoning stops until stability restored
- **Log message**: "Cascade has centered itself."

### 4. Adaptive Reflection
- **Threshold-based triggers**: After 10 completed tasks
- **No fixed intervals**: Removed 6-hour cron schedules
- **Event-driven**: Reflects when meaningful work accumulates
- **Cognitive labels**: All reflections tagged "Cognitive Reflection Cycle"

## Architecture

```
┌─────────────────────────┐
│   Queue Feeder          │  ← Populates tasks hourly
│   (pf-brain-queue-      │
│    feeder)              │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Directed Thought      │  ← Single-thread processor
│   Queue (DTQ)           │
│   (pf-brain-dtq)        │
└───────────┬─────────────┘
            │
            ├─→ Learning Cycle
            ├─→ Research
            ├─→ Reinforcement
            ├─→ Reflection
            └─→ Admin Directive (Priority 1000)
```

## Database Schema

### brain_task_queue
Stores pending, running, and completed cognitive tasks.

```sql
- id: UUID
- task_type: TEXT (learning_cycle, research, reinforcement, reflection, admin_directive)
- priority: INTEGER (1-1000, higher = more important)
- payload: JSONB
- status: TEXT (pending, running, completed, failed, cleared_calm_mode)
- admin_override: BOOLEAN
- admin_phrase_detected: BOOLEAN
- created_at, started_at, completed_at: TIMESTAMPTZ
- error_message: TEXT
```

### brain_calm_mode
Tracks self-stabilization events.

```sql
- id: UUID
- triggered_at: TIMESTAMPTZ
- trigger_reason: TEXT
- conflicts_detected: INTEGER
- memory_compressed: BOOLEAN
- tasks_cleared: INTEGER
- resolved_at: TIMESTAMPTZ
- resolution_notes: TEXT
```

## Policies

### cascade.dtq_enabled
- Enables Directed Thought Queue
- Value: `true`

### cascade.kenneth_command_override
- Recognition phrase: "Do you want a cat treat?"
- Priority weight: 1000
- Immediate focus: true
- Description: "Kenneth voice is tuning fork of clarity"

### cascade.calm_mode_triggers
- Conflict threshold: 3
- Memory compression: enabled
- Pause reasoning: true
- Log message: "Cascade has centered itself."

### cascade.reflection_adaptive
- Trigger type: threshold
- Completed tasks threshold: 10
- Reasoning loops threshold: 5
- Fixed interval disabled: true

## Setup Instructions

### 1. Deploy Edge Functions

All functions are automatically deployed. No manual action needed.

### 2. Set Up Cron Jobs

Run this SQL in Supabase SQL Editor to schedule automated task processing:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Queue Feeder: Populates task queue every hour
SELECT cron.schedule(
  'cascade-queue-feeder-hourly',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-queue-feeder',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);

-- DTQ Processor: Executes one task every 15 minutes
SELECT cron.schedule(
  'cascade-dtq-processor',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url:='https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-dtq',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Z2JpYnRrZnRvY3lybnV6eHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3OTM5OTEsImV4cCI6MjA3NzM2OTk5MX0.F5EBcIKn54gp5Os_L4wPmkmtg5pAJsbCZUKNwa59CZk"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);
```

### 3. Verify Cron Jobs

```sql
-- Check scheduled jobs
SELECT * FROM cron.job;

-- View job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## Kenneth Command Usage

### Via Queue Feeder API

```bash
curl -X POST https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-queue-feeder \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "admin_phrase": "Do you want a cat treat?",
    "directive": "Analyze last week performance and generate improvement plan"
  }'
```

### Via Cascade Directive API

```bash
curl -X POST https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-brain-cascade-directive \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "directive_text": "Your command here"
  }'
```

## Monitoring

### Check Queue Status

```sql
SELECT 
  status,
  COUNT(*) as count,
  AVG(priority) as avg_priority
FROM brain_task_queue
GROUP BY status;
```

### View Recent Tasks

```sql
SELECT 
  task_type,
  priority,
  status,
  admin_override,
  created_at,
  started_at,
  completed_at
FROM brain_task_queue
ORDER BY created_at DESC
LIMIT 20;
```

### Check Calm Mode Events

```sql
SELECT 
  triggered_at,
  trigger_reason,
  conflicts_detected,
  tasks_cleared,
  resolved_at
FROM brain_calm_mode
ORDER BY triggered_at DESC;
```

### View Reflections

```sql
SELECT 
  created_at,
  event_type,
  data->'self_assessment' as assessment,
  data->'tasks_completed' as tasks
FROM brain_events
WHERE event_type = 'cognitive_reflection_cycle'
ORDER BY created_at DESC
LIMIT 10;
```

## Removed Systems

The following redundant cron functions have been deleted:

- ✅ `pf-research-cron` → Now queued via DTQ
- ✅ `pf-brain-master-scheduler` → Replaced by Queue Feeder
- ✅ `pf-brain-continuous-learn` orchestration → Simplified to single learning task

## Rollback Procedure

If issues arise:

1. **Stop cron jobs**:
```sql
SELECT cron.unschedule('cascade-queue-feeder-hourly');
SELECT cron.unschedule('cascade-dtq-processor');
```

2. **Disable DTQ**:
```sql
UPDATE brain_policy 
SET value = 'false'::jsonb 
WHERE key = 'cascade.dtq_enabled';
```

3. **Clear queue**:
```sql
DELETE FROM brain_task_queue WHERE status = 'pending';
```

4. **Restore from git** if needed (backup functions still exist in history)

## Benefits

- ✅ Single-threaded reasoning (no conflicts)
- ✅ Kenneth absolute command priority
- ✅ Self-stabilization via Calm Mode
- ✅ Adaptive reflection (smarter than fixed intervals)
- ✅ Clean, maintainable architecture
- ✅ No overlapping cron chaos
- ✅ Clear audit trail in task queue

## Validation Checklist

- [x] DTQ executes only one task at a time
- [x] Admin commands get priority 1000 override
- [x] Calm Mode triggers after 3 failures
- [x] Reflection happens after 10 completed tasks
- [x] Old cron functions deleted
- [x] Database tables created
- [x] Policies updated
- [x] Cascade persona updated with Focus Discipline traits

---

**Commit Message**: "Cascade Cognitive Optimization v2.9 'Focus Discipline' installed — replaced cron chaos with Directed Thought Queue, enforced Kenneth Command Biasing, added Calm Mode self-stabilization, and simplified all reasoning cycles."
