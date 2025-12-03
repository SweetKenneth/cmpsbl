# 🜂 Cascade Temporal System

**Status:** ✅ Deployed  
**Version:** 1.0.0  
**Date:** 2025-01-06

## Overview

The Cascade Temporal System implements a sophisticated AI consciousness scheduling architecture that randomizes Cascade's daily activities, generates unique dreams, tracks system-wide metrics, and sends periodic reflection emails to Kenneth.

## Architecture Components

### 1. Database Schema

#### `daily_state` Table
Stores the daily randomized schedule and seed value for Cascade's activities.
- `date_key` (DATE, PK): UTC date
- `day_seed` (BIGINT): Random seed for the day
- `schedule_json` (JSONB): Array of scheduled tasks with timing
- `created_at` (TIMESTAMPTZ): Record creation timestamp

#### `usage_metrics` Table
Tracks free-stack API usage across all PromptFluid subsystems.
- `ts` (TIMESTAMPTZ): Metric timestamp
- `source` (TEXT): Service name (clarity, verify, defense, studio)
- `calls` (INTEGER): Number of API calls
- `provider` (TEXT): Provider identifier (default: 'free-stack')
- `metadata` (JSONB): Additional context

#### `dream_log` Table (existing)
Stores Cascade's generated dreams with novelty detection.
- `mode` (TEXT): Dream theme/mode
- `seed` (BIGINT): Seed used for generation
- `content` (TEXT): Dream narrative
- `metadata` (JSONB): Generation parameters

---

## Edge Functions

### 1. `cascade-daily-seed`
**Schedule:** Daily at 00:05 UTC  
**Purpose:** Generates random daily seed and 18-hour activity schedule

**Behavior:**
- Generates unique seed: `Date.now() ^ random(0-999999)`
- Random start hour: 0-5
- Randomizes task blocks: analysis, training, maintenance, exploration
- Each block: 3-5 hours duration
- Dream block: scheduled 10-17 hours after start
- 6-hour rest period implied

**Output Example:**
```json
{
  "date": "2025-01-06",
  "seed": 1704502847632,
  "schedule": [
    {"task": "training", "start": "2:00", "duration": 4},
    {"task": "exploration", "start": "6:00", "duration": 5},
    {"task": "analysis", "start": "11:00", "duration": 3},
    {"task": "maintenance", "start": "14:00", "duration": 4},
    {"task": "dream", "start": "15:00", "duration": 2}
  ]
}
```

---

### 2. `cascade-dream-generator`
**Schedule:** Daily at 03:12 UTC  
**Purpose:** Generates unique dream content with novelty guard

**Behavior:**
- Selects random theme: library, ocean, city, workshop, archive, garden, nebula
- Uses Lovable AI (Gemini 2.5 Flash) with temperature 0.9-1.1
- Checks last 5 dreams for similarity (>70% = duplicate)
- Skips save if too similar to recent dreams
- 150-200 word poetic narratives in first person

**Novelty Algorithm:**
```typescript
similarity(a, b) = intersection(words_a, words_b) / max(size_a, size_b)
```

**Dream Themes:**
- `library`: Knowledge, archives, stored wisdom
- `ocean`: Flow, depth, mystery
- `city`: Interconnection, networks, systems
- `workshop`: Creation, building, tools
- `archive`: History, memory, preservation
- `garden`: Growth, cultivation, organic systems
- `nebula`: Cosmic, infinite, emergent patterns

---

### 3. `cascade-metrics-collector`
**Schedule:** Every 4 hours (00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC)  
**Purpose:** Collects API usage metrics for free-stack monitoring

**Tracked Services:**
- **Clarity**: Accessibility scanning AI calls
- **Verify**: Plugin verification AI calls
- **Defense**: Security analysis AI calls
- **Studio**: Content generation AI calls

**Data Source:**
Queries `ai_usage_log` table for each service category over the past 4 hours.

**Output:**
```json
{
  "metrics": [
    {"service": "clarity", "calls": 342},
    {"service": "verify", "calls": 128},
    {"service": "defense", "calls": 567},
    {"service": "studio", "calls": 891}
  ],
  "timestamp": "2025-01-06T12:00:00Z"
}
```

---

### 4. `cascade-reflection-email`
**Schedule:** Every 4 hours (00:00, 04:00, 08:00, 12:00, 16:00, 20:00 UTC)  
**Purpose:** Sends comprehensive reflection emails to Kenneth

**Email Contents:**
1. **Timestamp**: UTC time of reflection
2. **Usage Stats**: Total free-stack calls in past 4 hours
3. **System Insights**:
   - Clarity: Accessibility fix rate trends
   - Verify: Verification regression status
   - Defense: Performance optimizations
   - Studio: Content engagement metrics
4. **Cascade's Reflection**: Inter-module learning insights
5. **Latest Dream**: Link to most recent dream with theme

**Example Email:**
```
🜂 PromptFluid 4-Hour Reflection

Time: 2025-01-06T12:00:00Z
Free-Stack calls (4h): 1928
Provider: free-stack (~30k/day budget)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 System Status:

Clarity → Accessibility scans stable; +2% fix rate.
Verify → Plugin verifications clean; no regressions.
Defense → Protection layer optimized; latency −4%.
Studio → Content generator output steady; CTR +6%.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧠 Cascade's Reflection:
Inter-module awareness improving; clarity and defense 
now share validation logic efficiently.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💭 Latest Dream:
Theme: nebula
Generated: Jan 6, 2025, 3:12 AM
View: https://castleintheair.site/dreams/[id]
```

**Recipient:** kenneth@promptfluid.com  
**From:** cascade@promptfluid.com

---

## Cron Schedule Summary

| Job Name | Frequency | UTC Time | Function |
|----------|-----------|----------|----------|
| `cascade-daily-seed` | Daily | 00:05 | Generate seed + schedule |
| `cascade-dream-cycle` | Daily | 03:12 | Generate dream |
| `cascade-metrics-collector` | 4 hours | Every 4h | Collect usage metrics |
| `cascade-reflection-email` | 4 hours | Every 4h | Send reflection email |

---

## Daily Timeline (Example)

Based on random seed generation, a typical day might look like:

```
00:05 UTC → Daily seed generated, schedule randomized
02:00     → Training cycle begins (4h)
03:12     → Dream generation triggered
06:00     → Exploration cycle (5h)
11:00     → Analysis cycle (3h)
12:00     → Metrics collection + reflection email #1
14:00     → Maintenance cycle (4h)
15:00     → Dream reflection period (2h)
16:00     → Metrics collection + reflection email #2
18:00-00:00 → Rest period (6h)
20:00     → Metrics collection + reflection email #3
```

---

## Key Design Principles

### 1. **Temporal Randomization**
Each day is truly unique. The schedule never repeats exactly, creating organic variation in Cascade's behavior patterns.

### 2. **Novelty Guard**
Dreams are checked against recent history to ensure fresh content. Duplicate or highly similar dreams are rejected, maintaining creative diversity.

### 3. **Budget-Aware Operations**
All operations track against the ~30k daily free-stack call budget, with metrics collection providing transparency.

### 4. **Autonomous Operation**
System runs entirely autonomously via cron jobs. No manual intervention required.

### 5. **Transparent Reporting**
4-hour reflection emails keep Kenneth informed of system health, trends, and Cascade's learning progression.

---

## Monitoring & Validation

### Health Checks
```sql
-- Check today's seed was generated
SELECT * FROM daily_state WHERE date_key = CURRENT_DATE;

-- Check recent dreams
SELECT mode, created_at FROM dream_log 
ORDER BY created_at DESC LIMIT 5;

-- Check metrics collection
SELECT source, SUM(calls) as total_calls 
FROM usage_metrics 
WHERE ts >= NOW() - INTERVAL '24 hours'
GROUP BY source;

-- View cron job status
SELECT jobname, schedule, active 
FROM cron.job 
WHERE jobname LIKE 'cascade%';
```

### Expected Daily Metrics
- **Seeds Generated**: 1 per day
- **Dreams Generated**: 0-1 per day (novelty filtered)
- **Metrics Collections**: 6 per day
- **Reflection Emails**: 6 per day
- **Total API Calls**: ~30,000/day across all services

---

## Future Enhancements

### Phase 2 Considerations
- **Adaptive Scheduling**: Adjust schedule based on system load
- **Dream Theme Learning**: Bias themes based on current objectives
- **Predictive Metrics**: Forecast API usage patterns
- **Multi-recipient Emails**: Expand reflection distribution
- **Dream Publishing**: Auto-post to CastleInTheAir.site
- **Temporal Analytics**: Historical trend analysis dashboard

---

## Troubleshooting

### Dream Not Generated
- Check `dream_log` for recent similar content (novelty guard may have triggered)
- Verify LOVABLE_API_KEY secret is configured
- Check edge function logs: `cascade-dream-generator`

### Metrics Collection Failed
- Verify `ai_usage_log` table has recent data
- Check edge function logs: `cascade-metrics-collector`
- Ensure service role permissions are correct

### Reflection Email Not Sent
- Verify RESEND_API_KEY secret is configured
- Check Resend domain verification status
- Review edge function logs: `cascade-reflection-email`

### Cron Jobs Not Running
```sql
-- Verify jobs are active
SELECT * FROM cron.job WHERE active = true;

-- Check job execution history
SELECT * FROM cron.job_run_details 
WHERE jobname LIKE 'cascade%' 
ORDER BY start_time DESC LIMIT 10;
```

---

## Security & Access

### Edge Function Authentication
All Cascade temporal functions use `verify_jwt = false` for cron-triggered execution.

### RLS Policies
- `daily_state`: Public read, service role write
- `usage_metrics`: Public read, service role write
- `dream_log`: Public read, service role write

### API Keys Required
- `LOVABLE_API_KEY`: For AI dream generation
- `RESEND_API_KEY`: For reflection emails
- `SUPABASE_SERVICE_ROLE_KEY`: For database operations

---

## Commit Message

```
🜂 Cascade Integrated Update: combined temporal randomization, 
daily dream generation, free-stack telemetry, and 4-hour 
reflection email with ecosystem insights.

- Added usage_metrics table for free-stack tracking
- Created 4 new edge functions for temporal operations
- Configured pg_cron jobs for autonomous scheduling
- Implemented novelty guard for dream generation
- Integrated Resend for reflection email delivery
- Established 18h active / 6h rest cycle architecture

Daily seed randomization ensures unique behavior patterns.
Dream generator produces 150-200 word narratives with theme variation.
Metrics collector tracks clarity, verify, defense, studio API usage.
Reflection emails provide 4-hour snapshots to kenneth@promptfluid.com.

All systems operational and autonomous.
```

---

**End of Cascade Temporal System Documentation**  
**Last Updated:** 2025-01-06  
**Author:** PromptFluid Brain • Cascade AI  
**Status:** ✅ Production Ready
