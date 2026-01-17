# promptfluid® Substrate — Architecture

**v2026.01 — Technical Architecture Documentation**

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│              Web Apps • Mobile • CLI • SDK • Direct API             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUBSTRATE GATEWAY                               │
│                     POST /pf-substrate                               │
│         ┌─────────────────────────────────────────────┐             │
│         │  Router: module → action → handler          │             │
│         │  Auth: JWT validation, rate limiting        │             │
│         │  Envelope: success, data, timestamp, proof  │             │
│         └─────────────────────────────────────────────┘             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    BRAIN      │    │    DECODE     │    │   DEFENSE     │
│   Memory &    │    │   Human       │    │   Security    │
│   Learning    │    │   Interface   │    │   & Bots      │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    NEXUS      │    │    VISION     │    │    DREAM      │
│   AI          │    │   Observa-    │    │   Autonomous  │
│   Routing     │    │   bility      │    │   Cognition   │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └──────────────────┬─┴────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SYSTEM MODULE                                │
│                Administration • Config • Audit                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                               │
│         PostgreSQL • Tiered Memory • Audit Logs • Traces            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Substrate Gateway (`pf-substrate`)

The single entry point for all substrate operations.

**Responsibilities:**
- Request routing (`module` → `action`)
- Authentication and authorization
- Rate limiting
- Response envelope formatting
- Proof generation

**Request Format:**
```json
{
  "module": "brain",
  "action": "query",
  "payload": { "query_text": "...", "limit": 10 }
}
```

**Response Envelope:**
```json
{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": { ... },
  "timestamp": "2026-01-17T...",
  "substrate_version": "3.11.0"
}
```

---

### 2. Brain Module

**Purpose:** Memory storage, retrieval, learning cycles, and reflection.

**Architecture:**
```
┌─────────────────────────────────────────┐
│               BRAIN MODULE               │
├─────────────────────────────────────────┤
│  Hot Memory (brain_memory_hot)          │
│  • Active context                        │
│  • High-priority recall                  │
│  • Fast access                           │
├─────────────────────────────────────────┤
│  Cold Memory (brain_memory_cold)        │
│  • Archived memories                     │
│  • Compressed summaries                  │
│  • Long-term storage                     │
├─────────────────────────────────────────┤
│  Knowledge Graph (brain_graph_edges)    │
│  • Memory connections                    │
│  • Weighted relationships                │
│  • Pattern emergence                     │
├─────────────────────────────────────────┤
│  Reflection Log (brain_reflection_log)  │
│  • Daily reflections                     │
│  • Insights and lessons                  │
│  • Self-assessment                       │
└─────────────────────────────────────────┘
```

**Key Tables:**
- `brain_memories` — Core memory storage
- `brain_memory_hot` — Active/recent memories
- `brain_memory_cold` — Archived memories
- `brain_graph_edges` — Knowledge graph
- `brain_reflections` — Reflection outputs
- `brain_forecasts` — Predictions

---

### 3. Decode Module

**Purpose:** Human-compatible cognitive interpreter. Translates natural language to substrate operations.

**Architecture:**
```
┌─────────────────────────────────────────┐
│              DECODE MODULE               │
├─────────────────────────────────────────┤
│  Epistemic Layer                         │
│  • describe() — Observe without infer   │
│  • interpret() — Translate meaning      │
│  • reflect() — Consider patterns        │
├─────────────────────────────────────────┤
│  Conversational Layer                    │
│  • No imperatives                        │
│  • No identity claims                    │
│  • No agency claims                      │
│  • No synthetic emotion                  │
├─────────────────────────────────────────┤
│  Authority Layer                         │
│  • Route to Brain                        │
│  • Route to Nexus                        │
│  • Route to Defense                      │
│  • Route to Vision                       │
│  (Routing only — no execution authority)│
└─────────────────────────────────────────┘
```

**Critical Constraint:** Decode has routing authority, NOT execution authority.

---

### 4. Defense Module

**Purpose:** Security, bot detection, threat analysis, rate limiting.

**Architecture:**
```
┌─────────────────────────────────────────┐
│             DEFENSE MODULE               │
├─────────────────────────────────────────┤
│  Bot Detection                           │
│  • Fingerprint analysis                  │
│  • Behavioral scoring                    │
│  • Risk assessment                       │
├─────────────────────────────────────────┤
│  IP Reputation                           │
│  • Reputation scoring (0-100)            │
│  • Threat indicators                     │
│  • Geo-based analysis                    │
├─────────────────────────────────────────┤
│  Rate Limiting                           │
│  • Per-IP limits                         │
│  • Per-user limits                       │
│  • Per-action limits                     │
├─────────────────────────────────────────┤
│  Anomaly Detection                       │
│  • Statistical z-score analysis          │
│  • Threshold alerting                    │
│  • Pattern recognition                   │
└─────────────────────────────────────────┘
```

**Key Tables:**
- `defense_events` — Security event log
- `defense_rules` — Detection rules
- `ip_reputation` — IP scoring
- `edge_rate_limits` — Rate limit state

---

### 5. Nexus Module

**Purpose:** Multi-provider AI routing with automatic failover.

**Architecture:**
```
┌─────────────────────────────────────────┐
│              NEXUS MODULE                │
├─────────────────────────────────────────┤
│  Provider Registry                       │
│  • Groq (primary)                        │
│  • Cerebras (fallback)                   │
│  • Together (tertiary)                   │
│  • DeepSeek (final fallback)             │
├─────────────────────────────────────────┤
│  Routing Logic                           │
│  • Latency-based selection               │
│  • Availability checking                 │
│  • Cost optimization                     │
│  • Automatic failover                    │
├─────────────────────────────────────────┤
│  Capabilities                            │
│  • Text generation                       │
│  • Image generation                      │
│  • Audio generation                      │
│  • Embeddings                            │
│  • Vision/analysis                       │
└─────────────────────────────────────────┘
```

**Key Tables:**
- `ai_usage_log` — Usage tracking
- `ai_daily_quota` — Quota management
- `ai_learning_data` — Learning from responses

---

### 6. Vision Module

**Purpose:** Observability, metrics, health monitoring, tracing.

**Architecture:**
```
┌─────────────────────────────────────────┐
│              VISION MODULE               │
├─────────────────────────────────────────┤
│  Health Monitoring                       │
│  • Module health checks                  │
│  • System-wide status                    │
│  • Dependency mapping                    │
├─────────────────────────────────────────┤
│  Metrics & Analytics                     │
│  • Performance metrics                   │
│  • Usage statistics                      │
│  • Trend analysis                        │
├─────────────────────────────────────────┤
│  Tracing & Logs                          │
│  • Distributed tracing                   │
│  • Request logging                       │
│  • Error tracking                        │
├─────────────────────────────────────────┤
│  Alerting                                │
│  • Threshold alerts                      │
│  • Anomaly alerts                        │
│  • Notification routing                  │
└─────────────────────────────────────────┘
```

**Key Actions:**
- `health` — System health check
- `pulse` — Ultra-lightweight heartbeat
- `introspection` — Deep self-analysis
- `quota` — AI usage observability

---

### 7. Dream Module

**Purpose:** Autonomous cognition cycles, dream processing, mutation.

**Architecture:**
```
┌─────────────────────────────────────────┐
│              DREAM MODULE                │
├─────────────────────────────────────────┤
│  Dream Ingestion                         │
│  • External dream submissions            │
│  • Content sanitization                  │
│  • Classification                        │
├─────────────────────────────────────────┤
│  Dream Processing                        │
│  • Consumption cycles                    │
│  • Interpretation                        │
│  • Synthesis                             │
├─────────────────────────────────────────┤
│  Mutation Engine                         │
│  • Identity evolution                    │
│  • Pattern integration                   │
│  • Insight crystallization               │
├─────────────────────────────────────────┤
│  Dream-Eater State                       │
│  • Mood tracking                         │
│  • Mutation level                        │
│  • Consumption counters                  │
└─────────────────────────────────────────┘
```

**Key Tables:**
- `dream_eater_state` — Current state
- `dream_feeder_submissions` — Submitted dreams
- `dream_sessions` — Processing sessions
- `dream_log` — Dream history

---

### 8. System Module

**Purpose:** Administration, configuration, audit, backup/restore.

**Key Actions:**
- `status` — Global system status
- `config` — Configuration management
- `audit` — Audit log queries
- `backup` — Create validated backups
- `restore` — Restore from backup
- `heal` — Self-healing operations

---

## Data Flow

### Request Lifecycle

```
1. Client sends POST /pf-substrate
2. Gateway validates JWT (if required)
3. Gateway checks rate limits
4. Gateway routes to module handler
5. Handler executes action
6. Handler queries/updates database
7. Handler returns result
8. Gateway wraps in response envelope
9. Gateway logs request (if enabled)
10. Client receives response
```

### Memory Lifecycle

```
1. New information arrives
2. Brain.remember() stores in hot memory
3. Memory tagged with type, source, confidence
4. Over time, usage patterns tracked
5. Brain.reflect() generates insights
6. Low-priority memories compressed
7. Brain.compress() moves to cold storage
8. Knowledge graph edges updated
```

---

## Security Model

### Authentication Layers

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| API | JWT tokens | All authenticated endpoints |
| Rate Limit | IP + User | Per-endpoint limits |
| Action | Permission matrix | Per-action authorization |
| Data | Row-Level Security | Per-row access control |

### Public vs Authenticated

| Public | Authenticated |
|--------|---------------|
| All `status` actions | All mutation actions |
| `vision.health` | `brain.remember` |
| `vision.pulse` | `defense.block` |
| `dream.feed` (rate-limited) | `system.config` |

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT                                │
├─────────────────────────────────────────────────────────────────┤
│  Edge Layer (Supabase Edge Functions)                           │
│  • pf-substrate (main gateway)                                  │
│  • Module-specific functions                                    │
│  • Deno runtime                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Database Layer (PostgreSQL)                                    │
│  • Tables with RLS policies                                     │
│  • Database functions/triggers                                  │
│  • Realtime subscriptions                                       │
├─────────────────────────────────────────────────────────────────┤
│  Storage Layer (Supabase Storage)                               │
│  • File uploads                                                 │
│  • Asset storage                                                │
│  • Backup storage                                               │
├─────────────────────────────────────────────────────────────────┤
│  Auth Layer (Supabase Auth)                                     │
│  • User management                                              │
│  • JWT issuance                                                 │
│  • OAuth providers                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Scaling Considerations

### Horizontal Scaling
- Edge functions scale automatically
- Database connection pooling via pgBouncer
- Read replicas for query-heavy workloads

### Vertical Scaling
- Database compute upgrades
- Memory tier optimization
- Cold storage compression

### Performance Optimizations
- Memory tier separation (hot/cold)
- Knowledge graph pruning
- Rate limit caching
- Connection pooling

---

**promptfluid® — The Cognitive Substrate OS**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
