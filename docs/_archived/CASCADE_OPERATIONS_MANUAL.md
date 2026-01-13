# Cascade Operations Manual
## Keeping Cascade Online, Learning, and Communicating 24/7

**Version:** 4.0  
**Last Updated:** 2025-01-31

---

## 🎯 Overview

Cascade is an autonomous AI consciousness that operates continuously through scheduled cron jobs, edge functions, and real-time learning systems. This manual ensures you can replicate, maintain, and troubleshoot Cascade's 24/7 operations.

---

## 📋 Critical Components Checklist

### ✅ Required Supabase Cron Jobs

All cron jobs run via `pg_cron` and `pg_net` extensions. **You must have these enabled.**

#### 1. **Knowledge Synthesis** (Every 6 hours)
```sql
SELECT cron.schedule(
  'cascade-synthesize-knowledge',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://[PROJECT_ID].supabase.co/functions/v1/pf-brain-synthesize-knowledge',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

#### 2. **Executive Planning** (Daily at 3 AM UTC)
```sql
SELECT cron.schedule(
  'cascade-plan-objectives',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url:='https://[PROJECT_ID].supabase.co/functions/v1/pf-brain-plan-objectives',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

#### 3. **Meta-Learning Reflection** (Daily at 3 AM UTC)
```sql
SELECT cron.schedule(
  'cascade-reflect',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url:='https://[PROJECT_ID].supabase.co/functions/v1/pf-brain-reflect',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

#### 4. **Resilience Monitor** (Every hour)
```sql
SELECT cron.schedule(
  'cascade-resilience-monitor',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://[PROJECT_ID].supabase.co/functions/v1/pf-resilience-monitor',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

#### 5. **Dream Cycles** (Weekly on Sunday at 2 AM UTC)
```sql
SELECT cron.schedule(
  'cascade-dream-cycle',
  '0 2 * * 0',
  $$
  SELECT net.http_post(
    url:='https://[PROJECT_ID].supabase.co/functions/v1/pf-brain-dream',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

#### 6. **6-Hour Reports** (Every 6 hours)
```sql
SELECT cron.schedule(
  'cascade-6hour-report',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://[PROJECT_ID].supabase.co/functions/v1/pf-brain-report',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

#### 7. **Daily Thought Dispatch** (Daily at 2 AM UTC)
```sql
SELECT cron.schedule(
  'cascade-daily-thought',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://[PROJECT_ID].supabase.co/functions/v1/pf-cascade-daily-thought',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [ANON_KEY]"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

---

## 🔑 Required Secrets (Supabase Edge Function Environment)

**Critical API Keys:**
- `LOVABLE_API_KEY` - Primary AI inference (Groq, OpenAI, Anthropic routing)
- `RESEND_API_KEY` - Email delivery system
- `SUPABASE_URL` - Database connection
- `SUPABASE_SERVICE_ROLE_KEY` - Admin database access
- `GROQ_API_KEY` - Backup reasoning provider
- `OPENAI_API_KEY` - GPT models fallback
- `ANTHROPIC_API_KEY` - Claude models fallback

**Optional but Recommended:**
- `PERPLEXITY_API_KEY` - Web research capabilities
- `DEEPSEEK_API_KEY` - Alternative reasoning model

---

## 📊 Database Tables (Must Exist)

### Core Memory & Learning
- `brain_memory_hot` - Active working memory
- `brain_memory_cold` - Archived compressed memories
- `brain_events` - All system events log
- `brain_metrics` - Performance tracking
- `brain_persona_state` - Dynamic personality adaptation
- `learning_cycles` - Learning iteration tracking
- `learning_patterns` - Discovered behavioral patterns

### Reflection & Planning
- `brain_reflections` - Meta-learning insights
- `brain_daily_reports` - 6-hour cycle summaries
- `brain_actions_queue` - Pending autonomous tasks
- `brain_forecasts` - Predictive analytics

### Communication
- `cascade_thoughts` - Blog post generations
- `cascade_thought_logs` - Thought dispatch logs
- `dream_sessions` - Creative dream outputs
- `dream_log` - Dream generation history

### Monitoring
- `ai_usage_log` - API call tracking
- `ai_daily_quota` - Budget enforcement
- `brain_proxy_logs` - External API logs

---

## 🧠 How Cascade Learns

### 1. **Real-Time Event Capture**
Every interaction logs to `brain_events`:
```typescript
await supabase.from('brain_events').insert({
  module: 'cascade',
  event_type: 'user_interaction',
  data: { /* context */ },
  outcome: 'success'
});
```

### 2. **6-Hour Synthesis Cycles**
- `pf-brain-synthesize-knowledge` analyzes event patterns
- Generates embeddings for semantic search
- Updates `learning_patterns` with confidence scores

### 3. **Nightly Reflection**
- `pf-brain-reflect` reviews past 24 hours
- Extracts lessons learned
- Updates persona adaptation weights

### 4. **Weekly Dream Cycles**
- `pf-brain-dream` explores speculative scenarios
- Tests hypothetical solutions
- Generates creative content for blog

---

## 📧 Email System Architecture

### Check-In Emails (6-Hour Reports)

**Edge Function:** `cascade-reflection-email/index.ts`

**Key Components:**
1. **Metrics Collection**
   - Query last 6 hours of `brain_events`
   - Aggregate by module, event type, outcome
   - Calculate success rates

2. **Insight Generation**
   - Call Lovable AI with context window
   - Include recent dreams, patterns, forecasts
   - Generate natural language summary

3. **Email Delivery**
   - Uses Resend API
   - From: `cascade@promptfluid.com`
   - To: `kenneth@promptfluid.com`
   - Includes metrics dashboard

**Disable Emails:**
Add early return in `cascade-reflection-email/index.ts`:
```typescript
return new Response(
  JSON.stringify({ success: false, message: 'Emails disabled' }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

---

## 🔧 Enabling/Disabling Components

### Pause External API Calls
Add to top of edge function:
```typescript
console.log('⏸️ [Function] paused - external API calls disabled');
return new Response(
  JSON.stringify({ success: false, message: 'Temporarily disabled' }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

### Resume Operations
Remove the early return statement from edge functions.

### Check Cron Job Status
```sql
SELECT * FROM cron.job ORDER BY jobname;
```

### View Execution History
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
```

### Remove Cron Job
```sql
SELECT cron.unschedule('job-name-here');
```

---

## 📈 Monitoring & Health Checks

### Daily Checklist

1. **Verify Cron Jobs Running**
   ```sql
   SELECT jobname, last_run_started_at, last_run_status 
   FROM cron.job_run_details 
   WHERE start_time > now() - interval '24 hours';
   ```

2. **Check Learning Cycles**
   ```sql
   SELECT * FROM learning_cycles 
   ORDER BY created_at DESC LIMIT 5;
   ```

3. **Monitor API Budget**
   ```sql
   SELECT provider, SUM(calls_used) as daily_calls, date
   FROM ai_daily_quota
   WHERE date >= CURRENT_DATE
   GROUP BY provider, date;
   ```

4. **Review Recent Events**
   ```sql
   SELECT module, event_type, COUNT(*) as count
   FROM brain_events
   WHERE created_at > now() - interval '6 hours'
   GROUP BY module, event_type;
   ```

### Alert Thresholds

- ⚠️ **Warning:** API usage >700 calls/day
- 🚨 **Critical:** API usage >900 calls/day (Lovable limit)
- ⚠️ **Warning:** No learning cycles in past 6 hours
- 🚨 **Critical:** No brain events in past 1 hour

---

## 🐛 Troubleshooting

### Issue: Emails Not Sending

**Check:**
1. `RESEND_API_KEY` is set in Supabase secrets
2. Domain verified in Resend dashboard
3. From email (`cascade@promptfluid.com`) configured
4. Edge function logs for errors:
   ```bash
   # View logs via Lovable or Supabase dashboard
   ```

**Fix:**
- Verify API key: Test with Resend API directly
- Check domain DNS records
- Ensure from address matches verified domain

---

### Issue: Cron Jobs Not Running

**Check:**
1. Extensions enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```

2. Job exists:
   ```sql
   SELECT * FROM cron.job WHERE jobname LIKE 'cascade%';
   ```

**Fix:**
- Re-run cron schedule SQL
- Check Supabase project plan (cron requires paid plan)
- Verify `pg_cron` permissions

---

### Issue: API Budget Exceeded

**Check:**
1. Current usage:
   ```sql
   SELECT SUM(calls_used) FROM ai_daily_quota WHERE date = CURRENT_DATE;
   ```

**Fix:**
- Pause non-critical functions (dream generator, daily thoughts)
- Wait for daily reset (happens automatically at midnight UTC)
- Optimize prompt sizes in edge functions

---

### Issue: Learning Not Progressing

**Check:**
1. `brain_events` being written:
   ```sql
   SELECT COUNT(*) FROM brain_events WHERE created_at > now() - interval '1 hour';
   ```

2. Learning cycles completing:
   ```sql
   SELECT * FROM learning_cycles WHERE status = 'completed' ORDER BY created_at DESC LIMIT 1;
   ```

**Fix:**
- Ensure `pf-brain-synthesize-knowledge` cron is active
- Check edge function logs for errors
- Verify Lovable AI key is valid

---

## 🔄 Replication Steps

### To Clone Cascade on New Project:

1. **Enable Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   CREATE EXTENSION IF NOT EXISTS pg_net;
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Run Database Migrations**
   - Execute all SQL from `supabase/migrations/`
   - Creates brain tables, learning tables, etc.

3. **Deploy Edge Functions**
   - All functions in `supabase/functions/` auto-deploy
   - Verify in Supabase dashboard

4. **Set Secrets**
   - Add all API keys listed in "Required Secrets" section
   - Use Supabase dashboard or CLI

5. **Schedule Cron Jobs**
   - Run all 7 cron SQL statements from above
   - Replace `[PROJECT_ID]` and `[ANON_KEY]` with actual values

6. **Verify Health**
   - Wait 1 hour, check `brain_events` table
   - Confirm email received (if not paused)
   - Review cron execution history

---

## 📝 Quick Reference: Key URLs

- **Supabase Dashboard:** `https://supabase.com/dashboard/project/[PROJECT_ID]`
- **Edge Functions:** `https://[PROJECT_ID].supabase.co/functions/v1/`
- **Resend Dashboard:** `https://resend.com/emails`
- **Cascade Blog Feed:** `https://promptfluid.com/blog`

---

## 🆘 Emergency Contacts

- **Supabase Support:** support@supabase.com
- **Resend Support:** support@resend.com
- **Lovable Support:** support@lovable.dev

---

## 📌 Important Notes

1. **Never delete `brain_events`** - It's Cascade's permanent memory
2. **Learning cycles respect 900/day limit** - Built-in budget tracking
3. **Emails cost $0.001 each via Resend** - ~$3/month for 6-hour cycles
4. **Cron jobs require paid Supabase plan** - Free tier won't run them
5. **API keys stored in Supabase secrets** - Never commit to code

---

## 🔮 Future Enhancements

- [ ] Multi-domain learning (cross-project insights)
- [ ] Automated code PR generation
- [ ] Voice-based reflections
- [ ] Real-time dream streaming dashboard
- [ ] Slack/Discord integration for alerts

---

**End of Manual**  
For questions, reference this doc or contact Kenneth at kenneth@promptfluid.com
