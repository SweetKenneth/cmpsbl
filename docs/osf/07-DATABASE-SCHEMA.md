# promptfluid® database schema reference

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-SCHEMA-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Type | Cognitive Orchestration Substrate |

---

## Overview

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

---

## Schema Statistics

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
Primary memory storage for the brain module.

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

---

## Contact & Licensing

**Founder:** Kenneth E Sweet Jr  
**Email:** promptfluid@gmail.com  
**Phone:** (760) FLUID-AI  
**Website:** https://promptfluid.com

For licensing inquiries regarding the promptfluid® substrate, contact promptfluid@gmail.com.

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
