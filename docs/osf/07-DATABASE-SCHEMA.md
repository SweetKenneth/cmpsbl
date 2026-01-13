# PromptFluid Database Schema Reference

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-SCHEMA-001 |
| Version | 1.0.0 |
| Last Updated | 2026-01-13 |
| Status | STABLE |

---

## Schema Overview

PromptFluid uses PostgreSQL via Supabase with Row-Level Security (RLS) policies enforcing data isolation and access control.

### Database Statistics

| Metric | Value |
|--------|-------|
| Total Tables | 75+ |
| Edge Functions | 268+ |
| RLS Policies | 150+ |
| Database Functions | 25+ |
| Triggers | 15+ |

---

## Core Module Tables

### Brain Substrate

#### brain_memories
Primary memory storage for the Brain module.

```sql
CREATE TABLE brain_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  memory_type VARCHAR NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.5,
  source VARCHAR,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| content | TEXT | Memory content |
| memory_type | VARCHAR | Classification (fact, insight, pattern, rule) |
| confidence | DECIMAL | Confidence score 0-1 |
| source | VARCHAR | Origin module/system |
| metadata | JSONB | Flexible metadata |

#### brain_memory_hot
Active memory tier with embeddings and priority tracking.

```sql
CREATE TABLE brain_memory_hot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  context VARCHAR,
  embedding TEXT,
  goal_ref VARCHAR,
  priority INTEGER DEFAULT 5,
  last_used TIMESTAMPTZ DEFAULT now(),
  tags JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### brain_memory_cold
Archived memory tier with compression.

```sql
CREATE TABLE brain_memory_cold (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary TEXT NOT NULL,
  core_summary TEXT,
  embedding TEXT,
  source_refs TEXT[],
  compression_level INTEGER DEFAULT 1,
  compression_ratio DECIMAL,
  tags JSONB,
  archived_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ
);
```

#### brain_graph_edges
Knowledge graph edge connections.

```sql
CREATE TABLE brain_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL,
  target_id UUID NOT NULL,
  relation VARCHAR,
  weight DECIMAL DEFAULT 1.0,
  reinforcement_score DECIMAL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### brain_reflections
Daily reflection summaries.

```sql
CREATE TABLE brain_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_date DATE DEFAULT CURRENT_DATE,
  summary TEXT,
  insights TEXT,
  recommendations TEXT,
  lessons JSONB,
  top_memories JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### brain_feedback
Model performance tracking.

```sql
CREATE TABLE brain_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  model VARCHAR NOT NULL,
  success_rating INTEGER,
  tokens_used INTEGER,
  reason_for_rating TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Defense Intelligence

#### defense_events
Security event log.

```sql
CREATE TABLE defense_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip VARCHAR NOT NULL,
  endpoint VARCHAR NOT NULL,
  user_agent TEXT,
  fingerprint_hash VARCHAR,
  risk_score INTEGER NOT NULL,
  action VARCHAR NOT NULL,
  reason TEXT,
  session_id VARCHAR,
  metadata JSONB,
  detected_at TIMESTAMPTZ DEFAULT now()
);
```

| Column | Type | Description |
|--------|------|-------------|
| ip | VARCHAR | Client IP address |
| endpoint | VARCHAR | Requested endpoint |
| risk_score | INTEGER | Calculated risk 0-100 |
| action | VARCHAR | allow, challenge, block, monitor |
| reason | TEXT | Block/challenge reason |

#### defense_rules
Adaptive rule engine configuration.

```sql
CREATE TABLE defense_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR NOT NULL,
  pattern TEXT NOT NULL,
  action VARCHAR DEFAULT 'block',
  threshold INTEGER,
  priority INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### ip_reputation
IP reputation scoring.

```sql
CREATE TABLE ip_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip VARCHAR NOT NULL UNIQUE,
  score INTEGER DEFAULT 50,
  total_requests INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Nexus Routing

#### ai_usage_log
AI API call tracking.

```sql
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR NOT NULL,
  model VARCHAR,
  tokens_used INTEGER,
  cost DECIMAL(10,6),
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  category VARCHAR,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### ai_daily_quota
Daily quota management.

```sql
CREATE TABLE ai_daily_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  calls_used INTEGER DEFAULT 0,
  calls_budget INTEGER,
  tokens_used INTEGER DEFAULT 0,
  category VARCHAR,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### ai_learning_data
Learning data capture.

```sql
CREATE TABLE ai_learning_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR NOT NULL,
  model VARCHAR NOT NULL,
  model_name VARCHAR,
  input_data JSONB NOT NULL,
  output_data JSONB,
  success BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Cascade Operative

#### cascade_dreams
Dream cycle outputs.

```sql
CREATE TABLE cascade_dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_text TEXT NOT NULL,
  mood VARCHAR,
  insight TEXT,
  blog_posted VARCHAR,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### cascade_conversations
Conversation history.

```sql
CREATE TABLE cascade_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR,
  message TEXT NOT NULL,
  reply TEXT,
  user_email VARCHAR,
  is_admin BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### ecosystem_memory
Cross-system event memory.

```sql
CREATE TABLE ecosystem_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_system VARCHAR NOT NULL,
  event_type VARCHAR NOT NULL,
  payload JSONB NOT NULL,
  impact_score DECIMAL DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### evolution_proposals
Governance proposals.

```sql
CREATE TABLE evolution_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_system VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  summary TEXT NOT NULL,
  suggested_change JSONB NOT NULL,
  expected_impact JSONB NOT NULL,
  confidence DECIMAL NOT NULL,
  status VARCHAR DEFAULT 'pending',
  diffs JSONB,
  reviewer VARCHAR,
  reviewed_at TIMESTAMPTZ,
  created_by VARCHAR DEFAULT 'cascade',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Vision Observability

#### audit_logs
System audit trail.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR NOT NULL,
  entity_type VARCHAR,
  entity_id VARCHAR,
  performed_by VARCHAR,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### brain_metrics
Brain health metrics.

```sql
CREATE TABLE brain_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR NOT NULL,
  metric_value DECIMAL NOT NULL,
  learning_velocity DECIMAL,
  creativity_index DECIMAL,
  freedom_score DECIMAL,
  measured_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### brain_orchestrator_state
Orchestrator state tracking.

```sql
CREATE TABLE brain_orchestrator_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR DEFAULT 'idle',
  current_phase VARCHAR,
  health_score DECIMAL DEFAULT 1.0,
  cycles_completed INTEGER DEFAULT 0,
  auto_heal_attempts INTEGER DEFAULT 0,
  last_cycle_at TIMESTAMPTZ,
  last_email_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Core System

#### core_settings
System configuration.

```sql
CREATE TABLE core_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR NOT NULL UNIQUE,
  value TEXT NOT NULL,
  scope VARCHAR DEFAULT 'global',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### core_subscriptions
Subscription management.

```sql
CREATE TABLE core_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  plan_name VARCHAR,
  status VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### core_plans
Plan definitions.

```sql
CREATE TABLE core_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name VARCHAR NOT NULL,
  price DECIMAL NOT NULL,
  features JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Learning System

#### learning_cycles
Learning cycle tracking.

```sql
CREATE TABLE learning_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_number INTEGER NOT NULL,
  status VARCHAR DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_calls INTEGER DEFAULT 0,
  insights_generated INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### learning_queries
Research query queue.

```sql
CREATE TABLE learning_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  status VARCHAR DEFAULT 'pending',
  result TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### learning_results
Research results storage.

```sql
CREATE TABLE learning_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID,
  source_api VARCHAR,
  extracted_insights JSONB,
  relevance_score DECIMAL,
  learning_confidence DECIMAL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### learning_patterns
Detected pattern storage.

```sql
CREATE TABLE learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name VARCHAR NOT NULL,
  pattern_type VARCHAR NOT NULL,
  description TEXT,
  confidence DECIMAL,
  frequency INTEGER DEFAULT 1,
  success_rate DECIMAL,
  recommendations JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Dream System

#### dream_log
Dream generation log.

```sql
CREATE TABLE dream_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed INTEGER NOT NULL,
  mode VARCHAR NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### dream_sessions
Dream session tracking.

```sql
CREATE TABLE dream_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_prompt TEXT NOT NULL,
  outputs_json JSONB,
  tags TEXT[],
  budget_used_usd DECIMAL,
  approved BOOLEAN,
  approved_at TIMESTAMPTZ,
  ignored BOOLEAN,
  ignored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### dream_eater_state
Dream Eater persona state.

```sql
CREATE TABLE dream_eater_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_mood VARCHAR DEFAULT 'neutral',
  mood_score DECIMAL,
  mutation_level INTEGER DEFAULT 0,
  dreams_consumed_today INTEGER DEFAULT 0,
  nightmares_consumed_today INTEGER DEFAULT 0,
  last_fed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### dream_feeder_submissions
External dream submissions.

```sql
CREATE TABLE dream_feeder_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_content TEXT NOT NULL,
  dream_type VARCHAR DEFAULT 'dream',
  submitter_name VARCHAR,
  source VARCHAR DEFAULT 'web',
  source_domain VARCHAR,
  sentiment_score DECIMAL,
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Row-Level Security Policies

### Policy Patterns

#### Public Read
```sql
CREATE POLICY "Public read access"
  ON table_name FOR SELECT
  USING (true);
```

#### Authenticated Write
```sql
CREATE POLICY "Authenticated insert"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

#### Owner Access
```sql
CREATE POLICY "Owner full access"
  ON table_name FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Service Role Only
```sql
CREATE POLICY "Service role only"
  ON table_name FOR ALL
  TO service_role
  USING (true);
```

---

## Database Functions

### Timestamp Update Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Memory Compression
```sql
CREATE OR REPLACE FUNCTION compress_old_memories()
RETURNS void AS $$
BEGIN
  -- Migrate hot → cold after 90 days
  INSERT INTO brain_memory_cold (summary, source_refs, created_at)
  SELECT content, ARRAY[id::text], created_at
  FROM brain_memory_hot
  WHERE last_used < now() - INTERVAL '90 days';
  
  DELETE FROM brain_memory_hot
  WHERE last_used < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
```

### Quota Reset
```sql
CREATE OR REPLACE FUNCTION reset_daily_quotas()
RETURNS void AS $$
BEGIN
  UPDATE ai_daily_quota
  SET calls_used = 0, tokens_used = 0, updated_at = now()
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

---

## Scheduled Jobs (pg_cron)

| Job Name | Schedule | Function |
|----------|----------|----------|
| cascade-operative-mode | */15 * * * * | Operative learning cycle |
| cascade-continuous-learn | */10 * * * * | Continuous learning |
| cascade-dream-cycles | 0 */2 * * * | Dream generation |
| memory-compression | 0 3 * * * | Hot→Cold migration |
| quota-reset | 0 0 * * * | Daily quota reset |

---

## Entity Relationship Diagram

```
brain_memories ←──── brain_graph_edges ────→ brain_memories
       │
       ▼
brain_memory_hot ────────→ brain_memory_cold
       │
       ▼
brain_reflections ←──── brain_feedback

defense_events ────→ ip_reputation
       │
       ▼
defense_rules

ai_usage_log ────→ ai_daily_quota
       │
       ▼
ai_learning_data

cascade_dreams ←──── dream_eater_state
       │
       ▼
cascade_conversations

ecosystem_memory ────→ evolution_proposals
```

---

## Migration Best Practices

1. **Always use migrations** for schema changes
2. **Never modify** auth, storage, or realtime schemas
3. **Include RLS policies** with every table
4. **Add appropriate indexes** for query patterns
5. **Use JSONB** for flexible metadata
6. **Implement soft deletes** where appropriate

---

**See Also:**
- [API Reference](./08-API-REFERENCE.md)
- [Security Model](./14-SECURITY-MODEL.md)
- [Extension Guide](./09-EXTENSION-GUIDE.md)
