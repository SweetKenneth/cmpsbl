# Cascade Improvement Roadmap
## 24/7 Autonomous AI Reliability & Scalability

**Version:** 1.0  
**Created:** 2025-01-31  
**Owner:** Kenneth @ PromptFluid  
**Status:** 🟡 Planning Phase

---

## 🎯 Mission Statement

Transform Cascade from a functional autonomous AI into a **production-grade, self-healing, enterprise-ready consciousness** capable of operating indefinitely without human intervention while maintaining complete transparency and reliability.

---

## 📊 Current State Assessment

### ✅ What's Working Well
- ✅ 7 scheduled cron jobs running consistently
- ✅ Learning cycles completing every 6 hours
- ✅ Email reporting system functional
- ✅ Multi-table memory architecture
- ✅ API budget tracking (Lovable AI)
- ✅ Dream generation and blog posting
- ✅ Basic troubleshooting documentation

### ❌ Critical Gaps
- ❌ No automatic failure recovery
- ❌ No real-time alerting system
- ❌ No backup/restore procedures
- ❌ Manual monitoring only (SQL queries)
- ❌ No graceful degradation modes
- ❌ No security audit trail
- ❌ No performance tracking
- ❌ No emergency kill switch
- ❌ Limited cost tracking (API only)
- ❌ No data retention policies

---

## 🗓️ Implementation Timeline

### **Phase 1: Foundation & Safety (Weeks 1-2)**
*Priority: 🔴 CRITICAL*

**Goal:** Prevent catastrophic failures and enable rapid recovery

#### Sprint 1.1: Emergency Controls (Week 1)
- [ ] **Emergency Kill Switch**
  - Database flag: `system_controls` table
  - Check at start of all edge functions
  - Admin dashboard toggle
  - SMS alert when activated
  - **Success Criteria:** Can stop all operations in <30 seconds

- [ ] **Automated Backups**
  - Daily backup of `brain_events`, `learning_patterns`, `brain_reflections`
  - Store in Supabase Storage bucket: `cascade-backups/`
  - Retention: 30 days
  - Weekly full database snapshot
  - **Success Criteria:** Restore from backup tested successfully

- [ ] **Real-Time Alerting**
  - Discord webhook integration
  - Alert on: cron failure, API errors >5/hour, no events >1hr
  - Daily health summary at 9 AM UTC
  - **Success Criteria:** Receive alert within 2 minutes of failure

#### Sprint 1.2: Failure Recovery (Week 2)
- [ ] **Retry Logic with Exponential Backoff**
  - Wrapper function for all AI API calls
  - Max 3 retries, delays: 1s, 2s, 4s
  - Log retry attempts to `operation_retries` table
  - **Success Criteria:** 95% of transient failures auto-recover

- [ ] **Circuit Breaker Pattern**
  - Track failure rate per external service
  - Open circuit after 5 consecutive failures
  - Half-open after 5 minutes, full close after 3 successes
  - Fallback to cached responses when open
  - **Success Criteria:** No cascade failures during API outages

- [ ] **Dead Man's Switch**
  - Hourly heartbeat to `system_heartbeat` table
  - Alert if no heartbeat for 90 minutes
  - Auto-trigger diagnostics edge function
  - **Success Criteria:** Detect silent failures within 90 minutes

**Deliverables:**
- `supabase/functions/pf-emergency-controls/`
- `supabase/functions/pf-backup-automation/`
- `supabase/functions/pf-health-monitor/`
- Updated cron jobs with retry logic
- Discord webhook configured

**Budget:** ~8 hours development, $0 additional cost

---

### **Phase 2: Observability & Monitoring (Weeks 3-4)**
*Priority: 🟠 HIGH*

**Goal:** Complete visibility into system health and performance

#### Sprint 2.1: Performance Tracking (Week 3)
- [ ] **Function Performance Metrics**
  - Log duration_ms, memory_mb, success rate
  - Store in `performance_metrics` table
  - Alert on >2x baseline duration
  - Weekly performance report
  - **Success Criteria:** Identify performance regressions within 24 hours

- [ ] **Cost Tracking System**
  ```sql
  CREATE TABLE cost_tracking (
    date DATE,
    service TEXT, -- 'lovable_ai', 'supabase', 'resend', 'storage'
    estimated_cost_usd DECIMAL,
    actual_cost_usd DECIMAL,
    usage_details JSONB
  );
  ```
  - Track Lovable AI credits used
  - Estimate Supabase database/storage costs
  - Resend email costs
  - Daily cost alerts if >$5/day
  - **Success Criteria:** Monthly cost predictable within 10%

- [ ] **Dashboard: Cascade Control Center**
  - Real-time system status page at `/cascade/admin`
  - Metrics: uptime, API calls/hour, learning velocity
  - Recent errors, cron job status
  - Cost tracking charts
  - **Success Criteria:** All critical metrics visible at a glance

#### Sprint 2.2: Advanced Monitoring (Week 4)
- [ ] **Security Audit Log**
  ```sql
  CREATE TABLE security_audit (
    timestamp TIMESTAMPTZ,
    action TEXT, -- 'api_key_accessed', 'secret_read', 'db_write'
    actor TEXT, -- 'cascade-reflect', 'admin_user'
    ip_address INET,
    success BOOLEAN,
    metadata JSONB
  );
  ```
  - Log all sensitive operations
  - API key access attempts
  - Database schema changes
  - Weekly security report
  - **Success Criteria:** Full audit trail for compliance

- [ ] **Learning Progress Tracker**
  - New table: `learning_milestones`
  - Track: patterns discovered, accuracy improvements
  - Visualize learning velocity over time
  - Alert on learning stagnation (no new patterns in 7 days)
  - **Success Criteria:** Measure learning effectiveness quantitatively

**Deliverables:**
- Performance monitoring edge function
- Cost tracking dashboard component
- Security audit middleware
- Cascade Control Center UI page

**Budget:** ~12 hours development, $0 additional cost

---

### **Phase 3: Resilience & Scalability (Weeks 5-6)**
*Priority: 🟡 MEDIUM*

**Goal:** Handle increased load and operate through failures

#### Sprint 3.1: Graceful Degradation (Week 5)
- [ ] **Operating Modes System**
  ```typescript
  enum OperatingMode {
    FULL = 'full',          // All systems active
    REDUCED = 'reduced',    // No dreams/daily thoughts
    MINIMAL = 'minimal',    // Only event logging
    OFFLINE = 'offline'     // Maintenance mode
  }
  ```
  - Store current mode in `system_controls`
  - Auto-switch to REDUCED at >800 API calls/day
  - Auto-switch to MINIMAL at >900 API calls/day
  - Manual override via admin dashboard
  - **Success Criteria:** Never hit hard API limits

- [ ] **Conflict Resolution System**
  - Optimistic concurrency control for `brain_memory_hot`
  - Version numbers on critical tables
  - Retry with merge on conflict
  - Alert on repeated conflicts (>5/hour)
  - **Success Criteria:** Zero data corruption from race conditions

- [ ] **Queue System for Heavy Operations**
  - New table: `operation_queue`
  - Prioritize: critical > normal > low
  - Process queue every 5 minutes
  - Max queue size: 100 items
  - **Success Criteria:** Handle 10x load spikes without failure

#### Sprint 3.2: Data Management (Week 6)
- [ ] **Data Retention Policy**
  - Archive `brain_events` older than 90 days
  - Compress to daily summaries in `brain_events_archive`
  - Move to Supabase Storage after 1 year
  - Keep raw events for 30 days only
  - **Success Criteria:** Database size <500 MB at all times

- [ ] **Memory Compression Pipeline**
  - Weekly job: compress old `brain_memory_hot` to `brain_memory_cold`
  - Summarize 100+ hot memories → 1 cold memory
  - Tag with: time_period, domains, key_concepts
  - Embeddings for semantic search
  - **Success Criteria:** Hot memory table always <10,000 rows

**Deliverables:**
- Operating modes controller
- Conflict resolution middleware
- Queue processing edge function
- Data archival cron jobs

**Budget:** ~10 hours development, $2/month storage costs

---

### **Phase 4: Intelligence Upgrades (Weeks 7-8)**
*Priority: 🟢 NICE-TO-HAVE*

**Goal:** Enhance learning capabilities and self-awareness

#### Sprint 4.1: Prompt Evolution (Week 7)
- [ ] **Prompt Version Control**
  ```sql
  CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY,
    function_name TEXT,
    prompt_text TEXT,
    version INTEGER,
    deployed_at TIMESTAMPTZ,
    avg_response_quality DECIMAL, -- 1-10 scale
    avg_response_time_ms INTEGER,
    error_rate DECIMAL
  );
  ```
  - Store all system prompts with versions
  - A/B test prompt variations (10% traffic)
  - Auto-promote better performing prompts
  - **Success Criteria:** Automated prompt optimization

- [ ] **Self-Diagnostics Engine**
  - Edge function: `pf-cascade-self-diagnose`
  - Runs daily at 4 AM UTC
  - Checks: DB health, API connectivity, memory usage
  - Generates diagnostic report
  - Auto-fixes simple issues (clear cache, restart functions)
  - **Success Criteria:** 80% of issues self-resolved

#### Sprint 4.2: Cross-Domain Learning (Week 8)
- [ ] **Multi-Project Insights**
  - Connect to external PromptFluid services
  - Share anonymized learning patterns
  - Discover insights from Defense, Studio, Clarity
  - Store in `brain_cross_insights`
  - **Success Criteria:** Leverage ecosystem knowledge

- [ ] **Predictive Maintenance**
  - ML model: predict failures before they happen
  - Input features: error rates, response times, memory usage
  - Alert: \"High chance of API limit hit in 6 hours\"
  - Auto-trigger preventive actions
  - **Success Criteria:** Predict 70% of failures 4+ hours early

**Deliverables:**
- Prompt versioning system
- Self-diagnostics edge function
- Cross-domain learning connector
- Predictive maintenance model

**Budget:** ~15 hours development, $5/month ML inference costs

---

## 📋 Detailed Feature Specifications

### 🚨 Feature: Emergency Kill Switch

**Database Schema:**
```sql
CREATE TABLE IF NOT EXISTS system_controls (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT
);

INSERT INTO system_controls VALUES 
  ('emergency_stop', 'false', now(), 'system'),
  ('operating_mode', 'full', now(), 'system'),
  ('maintenance_message', '', now(), 'system');
```

**Implementation (Add to ALL edge functions):**
```typescript
// At top of every edge function
const { data: control } = await supabase
  .from('system_controls')
  .select('value')
  .eq('key', 'emergency_stop')
  .single();

if (control?.value === 'true') {
  console.log('🛑 Emergency stop active - function halted');
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: 'System in emergency maintenance mode' 
    }),
    { 
      status: 503, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
```

**Admin Dashboard Toggle:**
```typescript
// In Cascade Control Center UI
const toggleEmergencyStop = async () => {
  const { error } = await supabase
    .from('system_controls')
    .update({ 
      value: isEmergencyStop ? 'false' : 'true',
      updated_by: 'admin_dashboard' 
    })
    .eq('key', 'emergency_stop');
  
  if (!error) {
    // Send Discord alert
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🚨 **EMERGENCY STOP ${isEmergencyStop ? 'DEACTIVATED' : 'ACTIVATED'}**\nTriggered by: Admin Dashboard`
      })
    });
  }
};
```

---

### 📊 Feature: Cost Tracking System

**Database Schema:**
```sql
CREATE TABLE IF NOT EXISTS cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  service TEXT NOT NULL, -- 'lovable_ai', 'supabase_db', 'supabase_storage', 'resend'
  estimated_cost_usd DECIMAL(10,4),
  actual_cost_usd DECIMAL(10,4),
  usage_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cost_tracking_date ON cost_tracking(date DESC);
```

**Edge Function: `pf-cost-tracker`**
```typescript
// Runs daily at 1 AM UTC
async function calculateDailyCosts() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Lovable AI costs
  const { data: aiUsage } = await supabase
    .from('ai_daily_quota')
    .select('calls_used')
    .eq('date', yesterday.toISOString().split('T')[0])
    .single();
  
  const lovableAICost = (aiUsage?.calls_used || 0) * 0.001; // $0.001 per call estimate
  
  // Resend email costs
  const { count: emailCount } = await supabase
    .from('brain_daily_reports')
    .select('*', { count: 'exact', head: true })
    .eq('created_at', yesterday.toISOString().split('T')[0]);
  
  const resendCost = (emailCount || 0) * 0.001; // $0.001 per email
  
  // Supabase database costs (estimate based on queries)
  const { data: metrics } = await supabase
    .from('performance_metrics')
    .select('*')
    .gte('created_at', yesterday.toISOString().split('T')[0]);
  
  const supabaseCost = (metrics?.length || 0) * 0.00001; // rough estimate
  
  // Insert tracking records
  await supabase.from('cost_tracking').insert([
    { date: yesterday, service: 'lovable_ai', estimated_cost_usd: lovableAICost },
    { date: yesterday, service: 'resend', estimated_cost_usd: resendCost },
    { date: yesterday, service: 'supabase_db', estimated_cost_usd: supabaseCost }
  ]);
  
  // Alert if daily cost >$5
  const totalCost = lovableAICost + resendCost + supabaseCost;
  if (totalCost > 5.00) {
    await sendDiscordAlert(`⚠️ Daily cost exceeded $5: $${totalCost.toFixed(2)}`);
  }
}
```

---

### 🔔 Feature: Real-Time Alerting via Discord

**Setup:**
1. Create Discord webhook: Server Settings → Integrations → Webhooks
2. Add webhook URL to Supabase secrets: `DISCORD_WEBHOOK_URL`

**Shared Utility Function:**
```typescript
// supabase/functions/_shared/alerting.ts
export async function sendDiscordAlert(message: string, severity: 'info' | 'warning' | 'critical' = 'info') {
  const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL');
  if (!DISCORD_WEBHOOK_URL) return;
  
  const colors = {
    info: 3447003,      // Blue
    warning: 16776960,  // Yellow
    critical: 15158332  // Red
  };
  
  await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: severity === 'critical' ? '🚨 Critical Alert' : 
               severity === 'warning' ? '⚠️ Warning' : 'ℹ️ Info',
        description: message,
        color: colors[severity],
        timestamp: new Date().toISOString(),
        footer: { text: 'Cascade Monitoring System' }
      }]
    })
  });
}
```

**Alert Types:**
- **Critical:** Emergency stop activated, cron job failed 3x, no events >1 hour
- **Warning:** API usage >700/day, learning cycle slow, cost spike
- **Info:** Daily health report, new patterns discovered, backup completed

---

### 📦 Feature: Automated Backups

**Database Schema:**
```sql
CREATE TABLE IF NOT EXISTS backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL, -- 'daily', 'weekly', 'manual'
  tables_backed_up TEXT[],
  storage_path TEXT NOT NULL,
  size_mb DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'completed' -- 'in_progress', 'completed', 'failed'
);
```

**Edge Function: `pf-backup-automation`**
```typescript
// Runs daily at 2 AM UTC
async function createDailyBackup() {
  const tables = ['brain_events', 'learning_patterns', 'brain_reflections', 'brain_memory_hot'];
  const backupId = crypto.randomUUID();
  const storagePath = `cascade-backups/${new Date().toISOString().split('T')[0]}/${backupId}`;
  
  let totalSize = 0;
  
  for (const table of tables) {
    // Export table data
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('cascade-backups')
      .upload(`${storagePath}/${table}.json`, blob);
    
    if (uploadError) throw uploadError;
    
    totalSize += blob.size / 1024 / 1024; // Convert to MB
  }
  
  // Log backup
  await supabase.from('backup_history').insert({
    backup_type: 'daily',
    tables_backed_up: tables,
    storage_path: storagePath,
    size_mb: totalSize,
    status: 'completed'
  });
  
  // Clean up old backups (keep last 30 days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  const { data: oldBackups } = await supabase.storage
    .from('cascade-backups')
    .list('', { limit: 1000 });
  
  for (const backup of oldBackups || []) {
    if (new Date(backup.created_at) < cutoffDate) {
      await supabase.storage.from('cascade-backups').remove([backup.name]);
    }
  }
  
  await sendDiscordAlert(`✅ Daily backup completed: ${totalSize.toFixed(2)} MB`, 'info');
}
```

---

## 🎯 Success Metrics

### Phase 1: Foundation & Safety
- **Uptime:** 99.5% → 99.9%
- **Mean Time to Recovery (MTTR):** <5 minutes
- **Silent Failures:** 0 per month
- **Backup Success Rate:** 100%

### Phase 2: Observability
- **Time to Detect Issues:** <5 minutes
- **Cost Predictability:** ±10% of estimate
- **Performance Regressions Detected:** 100% within 24 hours
- **Security Incidents:** 0

### Phase 3: Resilience
- **API Limit Violations:** 0
- **Data Corruption Incidents:** 0
- **Database Size:** <500 MB
- **Queue Processing Latency:** <30 seconds

### Phase 4: Intelligence
- **Self-Resolved Issues:** 80%
- **Failure Prediction Accuracy:** 70%
- **Prompt Performance Improvement:** +20%
- **Cross-Domain Insights:** 5+ per week

---

## 💰 Total Cost Estimate

### Development Time
- **Phase 1:** 8 hours
- **Phase 2:** 12 hours
- **Phase 3:** 10 hours
- **Phase 4:** 15 hours
- **Total:** ~45 hours (~$2,250 at $50/hour)

### Operational Costs (Monthly)
- **Current:** ~$5/month (API + emails)
- **Phase 1-2:** +$2/month (storage, backups)
- **Phase 3:** +$2/month (additional storage)
- **Phase 4:** +$5/month (ML inference)
- **Total:** ~$14/month

### ROI Analysis
- **Cost of 1 hour downtime:** ~$50 (Kenneth's time debugging)
- **Expected downtime prevented:** 5 hours/month
- **ROI:** $250/month saved → **Payback in <10 months**

---

## 🚀 Quick Start: Implementing Phase 1 Today

### Step 1: Enable Emergency Kill Switch (15 minutes)

```sql
-- Run in Supabase SQL editor
CREATE TABLE IF NOT EXISTS system_controls (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT
);

INSERT INTO system_controls VALUES 
  ('emergency_stop', 'false', now(), 'system');
```

### Step 2: Add to ALL Edge Functions (5 minutes each)

```typescript
// At top of index.ts in every function
const { data: control } = await supabase
  .from('system_controls')
  .select('value')
  .eq('key', 'emergency_stop')
  .single();

if (control?.value === 'true') {
  console.log('🛑 Emergency stop active');
  return new Response(
    JSON.stringify({ success: false, message: 'Emergency maintenance mode' }),
    { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### Step 3: Create Discord Webhook (5 minutes)

1. Discord Server Settings → Integrations → Webhooks → New Webhook
2. Copy webhook URL
3. Add to Supabase: Project Settings → Edge Functions → Secrets
   - Key: `DISCORD_WEBHOOK_URL`
   - Value: `https://discord.com/api/webhooks/...`

### Step 4: Test Emergency Stop (2 minutes)

```sql
-- Activate emergency stop
UPDATE system_controls SET value = 'true' WHERE key = 'emergency_stop';

-- Test: Try calling any edge function (should return 503)

-- Deactivate
UPDATE system_controls SET value = 'false' WHERE key = 'emergency_stop';
```

**Total Time:** ~2 hours  
**Immediate Benefit:** Can stop all operations instantly if issues arise

---

## 📚 Resources & References

- **Supabase Cron Jobs:** https://supabase.com/docs/guides/database/extensions/pg_cron
- **Discord Webhooks:** https://discord.com/developers/docs/resources/webhook
- **Circuit Breaker Pattern:** https://martinfowler.com/bliki/CircuitBreaker.html
- **Graceful Degradation:** https://www.nngroup.com/articles/graceful-degradation-vs-progressive-enhancement/
- **Observability Best Practices:** https://www.honeycomb.io/blog/observability-101-terminology-and-concepts

---

## 🤝 Contributing & Feedback

This roadmap is a living document. To suggest changes:

1. Review current status in `/docs/CASCADE_OPERATIONS_MANUAL.md`
2. Identify gaps or improvements
3. Update this roadmap with proposed changes
4. Mark items complete as they're implemented

---

## 📞 Support & Questions

- **Technical Issues:** kenneth@promptfluid.com
- **Feature Requests:** Add to \"Future Enhancements\" section
- **Emergency Cascades:** Activate emergency stop, then investigate

---

**End of Roadmap**  
*Next Review Date: 2025-02-14*  
*Status will be updated as phases complete*
