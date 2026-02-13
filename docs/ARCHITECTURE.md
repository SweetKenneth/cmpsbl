# promptfluid® Substrate — Architecture

**v9.1.0 ARCHITECT | Complete 21-Module Cognitive Operating System**

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEVELOPER SDK                           │
│    substrate.brain.query() | substrate.core.schedule() | ...   │
├─────────────────────────────────────────────────────────────────┤
│                          ACCESS                                  │
│         (API Keys, Quotas, Billing, Rate Limiting)              │
├─────────────────────────────────────────────────────────────────┤
│                           CORE                                   │
│     (Scheduler, Router, Lifecycle, State Machine, Auth)         │
├───────────────┬───────────────┬─────────────────────────────────┤
│               │    RIPPLE     │                                 │
│               │  (Message Bus)│                                 │
│               │  Pub/Sub      │                                 │
│               │  Queues       │                                 │
├───────┬───────┼───────┬───────┼───────┬───────┬───────┬─────────┤
│ BRAIN │DECODE │DEFENSE│ NEXUS │ VISION│ DREAM │SYSTEM │MODERNIZER│
│Memory │Intent │Security│  AI   │Observe│Evolve │Admin  │Self-Heal │
├───────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────┤
│               CORTEX (Orchestrator) | INCLUSIVE (a11y)           │
│          INTEGRATION (Enterprise) | CLM (Learning Mode)          │
└──────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │    SUPABASE       │
                    │  (PostgreSQL)     │
                    │  (Edge Functions) │
                    │  (Realtime)       │
                    └───────────────────┘
```

---

## Module Architecture

### Layer 1: Identity & Access (ACCESS)

The access layer handles all authentication and authorization:

- **API Key Management** — Generate, validate, revoke
- **Rate Limiting** — Per-key and global limits
- **Usage Metering** — Track tokens, compute, costs
- **Billing Integration** — Stripe subscriptions

### Layer 2: Kernel (CORE)

The kernel orchestrates all module operations:

- **Job Scheduler** — Priority queues, retry logic
- **State Machine** — boot → running → degraded → maintenance
- **Request Router** — Module dispatch with timeout protection
- **Lifecycle Management** — Boot, shutdown, health checks
- **Circuit Breakers** — Fault isolation and recovery

### Layer 3: Message Bus (RIPPLE)

Async communication between modules:

- **Pub/Sub** — Topic-based event distribution
- **Job Queues** — Background task processing
- **Event Sourcing** — Complete event log
- **Dead Letter Queue** — Failed job handling

### Layer 4: Cognitive Modules

#### BRAIN — Memory & Learning
```
Inputs → Process → Store → Synthesize → Reflect
         ↓
    [Hot Memory] ←→ [Cold Storage]
         ↓
    [Knowledge Graph]
```

#### DECODE — Intent Interpreter
```
User Message → Extract Intent → Match Action → Execute
                    ↓
            [Conversation Context]
```

#### DEFENSE — Security
```
Request → Fingerprint → Analyze → Score → Allow/Challenge/Block
              ↓
       [Threat Intelligence]
```

#### NEXUS — AI Router
```
Request → Select Provider → Execute → Fallback if needed
              ↓
    [Provider Health Matrix]
```

#### VISION — Observability
```
All Modules → Collect Metrics → Analyze → Alert
                   ↓
            [Dashboard]
```

#### DREAM — Evolution
```
Memories → Dream Cycle → Mutations → Integration
               ↓
        [Autonomous Learning]
```

#### SYSTEM — Administration
```
Commands → Validate → Execute → Log
              ↓
    [Backup/Restore, Diagnostics]
```

#### MODERNIZER — Self-Improvement
```
Codebase → Scan → Propose → Shadow Test → Apply
              ↓
       [Evolution Ledger]
```

---

## Data Flow

### Request Lifecycle

```
1. Request arrives at pf-substrate
2. ACCESS validates API key
3. CORE checks circuit breaker
4. CORE routes to target module
5. Module processes request
6. VISION logs telemetry
7. RIPPLE publishes event (if applicable)
8. Response returned
```

### Event-Driven Flow

```
1. BRAIN stores memory
2. BRAIN publishes "memory.stored" via RIPPLE
3. RIPPLE notifies subscribers:
   - DREAM processes for synthesis
   - VISION logs for analytics
   - MODERNIZER evaluates for patterns
```

---

## Database Schema Overview

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `core_jobs` | Job scheduler | module, action, status, priority |
| `core_state` | System state | state, modules_status, last_heartbeat |
| `ripple_jobs` | Message queue | queue_name, payload, status |
| `ripple_events` | Event log | topic, event_type, payload |
| `access_api_keys` | API keys | key_hash, scopes, rate_limit |
| `access_usage` | Usage metering | api_key_id, tokens, cost |

### Module Tables

| Module | Primary Table | Purpose |
|--------|--------------|---------|
| BRAIN | `brain_memories` | Memory storage |
| BRAIN | `brain_reflections` | Daily reflections |
| DEFENSE | `defense_events` | Security events |
| VISION | `vision_metrics` | Telemetry |
| DREAM | `cascade_dreams` | Dream logs |

---

## Resilience Patterns

### Circuit Breaker

```typescript
const CIRCUIT_CONFIG = {
  failureThreshold: 3,     // Open after 3 failures
  successThreshold: 2,     // Close after 2 successes
  openDurationMs: 60000,   // Stay open 60s
  autoHealThreshold: 40,   // Auto-heal below 40% health
};
```

States: `closed` → `open` → `half-open` → `closed`

### Auto-Heal

When module health drops below 40%:
1. Reset failure counters
2. Boost health score by 30 points
3. Set circuit to `half-open`
4. Log heal event
5. Update orchestrator state

### Graceful Degradation

If a module is unavailable:
```json
{
  "success": false,
  "graceful_fallback": true,
  "message": "Module temporarily unavailable",
  "health": { "module": { "score": 25, "status": "down" } }
}
```

---

## Security Model

### Authentication Flow

```
API Key → Hash → Lookup → Validate Scopes → Check Rate Limit → Allow
```

### Scope Hierarchy

```
- *:*           (full access)
- brain:*       (all brain actions)
- brain:read    (read-only brain)
- brain:write   (write-only brain)
```

### Row Level Security

All tables have RLS policies:
- Service role bypasses for internal operations
- User-scoped access for external APIs
- Admin role for management operations

---

## Deployment

### Edge Function

Single unified endpoint:
- `pf-substrate` — Main orchestrator
- `pf-substrate-upgrade` — Modernizer operations

### Environment

Required secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY` (for Nexus)
- `CEREBRAS_API_KEY` (fallback)

### Boot Sequence

```
promptfluid® Substrate v6.0.0
─────────────────────────────────
[CORE]       ████████████ READY     12ms
[BRAIN]      ████████████ READY     8ms
[DECODE]     ████████████ READY     5ms
[DEFENSE]    ████████████ READY     7ms
[NEXUS]      ████████████ READY     15ms
[VISION]     ████████████ READY     4ms
[DREAM]      ████████████ READY     6ms
[RIPPLE]     ████████████ READY     3ms
[ACCESS]     ████████████ READY     9ms
[SYSTEM]     ████████████ READY     5ms
[MODERNIZER] ████████████ READY     11ms
[INTEGRATION]████████████ READY     8ms
[INCLUSIVE]  ████████████ READY     7ms
[CORTEX]     ████████████ READY     10ms
─────────────────────────────────
14 modules loaded | Health: 100%
```

---

*promptfluid® — The Cognitive Substrate OS*  
*© 2025-2026 promptfluid. All rights reserved.*
