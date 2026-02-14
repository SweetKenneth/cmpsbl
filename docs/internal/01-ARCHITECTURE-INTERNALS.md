<div align="center">

# 🔒 Architecture Internals

### Complete Implementation Details — CONFIDENTIAL

<table>
<tr><td><strong>Document</strong></td><td>01 — Architecture Internals</td></tr>
<tr><td><strong>Classification</strong></td><td>🔴 HIGH — Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></td></tr>
</table>

</div>

---

> ⚠️ **CONFIDENTIAL** — This document contains proprietary implementation details. Do not distribute outside of CMPSBL/PromptFluid without written authorization.

---

## 1. Module Isolation — How It Actually Works

The public documentation describes module isolation as "each module has its own circuit breaker." Here is the full implementation:

### Circuit Breaker State Machine

Each module's circuit breaker follows a **three-state model**:

```
CLOSED (normal) ─── failure threshold hit ──→ OPEN (rejecting)
    ↑                                              │
    │                                         timeout expires
    │                                              │
    └──── success threshold hit ◄── HALF-OPEN (testing) ◄──┘
```

**Internal thresholds** (not public):

| Parameter | Value | Notes |
|-----------|-------|-------|
| Failure threshold | 3 consecutive | Opens circuit after 3 failures |
| Recovery timeout | 30 seconds | Time before HALF-OPEN test |
| Success threshold | 2 consecutive | Closes circuit after 2 successes in HALF-OPEN |
| Health decay rate | -20 per failure | `health = 100 - (consecutive_failures × 20)` |

### Health Score Formula

```
health_score = 100 - (consecutive_failures × 20)

Thresholds:
  healthy:  >= 70  (0-1 recent failures)
  degraded: >= 40  (2 recent failures)
  critical: < 40   (3+ recent failures → auto-heal)
```

This formula is deliberately simple. Complexity in health scoring creates unpredictable healing behavior. The substrate prioritizes *predictable recovery* over *nuanced scoring*.

---

## 2. The RIPPLE Event Bus — Implementation Secrets

### Schema Validation Pipeline

Every event passes through:

1. **Type check** — event name must be registered
2. **Schema validation** — payload must match Zod schema
3. **Size check** — payload must be < 64KB
4. **Rate check** — publisher cannot exceed 100 events/second
5. **Delivery** — fan-out to all subscribers

**Secret:** If validation fails at *any* step, the event is:
- Silently dropped (publisher receives no error)
- Logged to DEFENSE as a `ripple.event.rejected` meta-event
- The publishing module's health score is NOT affected

This silent-drop design is critical. If publishers received errors for malformed events, they might retry — creating feedback loops that amplify failures.

### Event Priority System

Events have three priority levels (not documented publicly):

| Priority | Behavior | Examples |
|----------|----------|---------|
| **Critical** | Delivered first, bypasses queue | `system.health.critical`, `defense.threat.detected` |
| **Normal** | Standard FIFO delivery | `brain.memory.stored`, `evolution.proposed` |
| **Background** | Delivered during idle time | `dream.insight.generated`, `vision.trend.updated` |

---

## 3. Request Routing — The Full Pipeline

The public docs show an 8-step request flow. The actual pipeline has 14 steps:

```
 1. Request received (edge function)
 2. ACCESS — API key extraction and validation
 3. ACCESS — Rate limit check (per-key and global)
 4. ACCESS — Quota check (daily/monthly)
 5. DEFENSE — IP reputation check
 6. DEFENSE — Behavioral analysis (request fingerprinting)
 7. DEFENSE — Threat classification
 8. IDENTITY — Actor attribution (human vs agent vs system)
 9. DECODE — Intent classification
10. CORTEX — Route to target module(s)
11. TARGET MODULE — Execute operation
12. RIPPLE — Broadcast result events
13. ECONOMY — Record cost and usage
14. AUDIT — Write to immutable decision ledger
```

Steps 5-7 run in parallel for performance. Steps 13-14 run asynchronously (fire-and-forget) so they don't impact response latency.

---

## 4. Boot Sequence — Why This Order

The boot order is not arbitrary. Each dependency is critical:

| Order | Module | Hard Dependency | What Breaks Without It |
|-------|--------|----------------|----------------------|
| 1 | CORE | None | Everything — no config available |
| 2 | RIPPLE | CORE | No events — modules can't communicate |
| 3 | ACCESS | RIPPLE | No auth — all requests rejected |
| 4 | BRAIN | RIPPLE | No memory — cognitive ops fail silently |
| 5 | VISION | BRAIN | No observability — blind to system state |
| 6 | CORTEX | VISION, BRAIN | No orchestration — complex ops impossible |
| 7 | MODERNIZER | CORTEX | No evolution — system can't improve |
| 8 | DECODE | BRAIN | No NLP — natural language fails |
| 9 | DEFENSE | RIPPLE | No security — system exposed |
| 10 | NEXUS | DEFENSE | No AI routing — can't reach providers |
| 11 | DREAM | NEXUS, BRAIN | No autonomous learning |
| 12 | INTEGRATION | All core | No external connections |
| 13 | INCLUSIVE | INTEGRATION | No a11y scanning |
| 14 | SYSTEM | All | Health monitoring needs everything running |
| 15-20 | Infrastructure | SYSTEM | Vector, relay, audit, identity, economy, sandbox |
| 21 | ENCODE | All | Orchestrator needs everything |

**Critical insight:** If RIPPLE fails during boot, the system enters **degraded boot mode** — modules communicate via direct function calls (bypassing the event bus) until RIPPLE recovers. This is the only exception to the "no direct calls" rule.

---

## 5. Database Architecture

### Table Organization

The substrate uses ~40 tables organized by module:

| Prefix | Module | Key Tables |
|--------|--------|-----------|
| `access_` | ACCESS | `api_keys`, `developers`, `subscriptions`, `usage`, `quotas` |
| `agency_` | CORTEX | `agencies`, `members`, `tasks`, `task_logs`, `dream_memory` |
| `ai_` | NEXUS | `usage_log`, `learning_data`, `daily_quota` |
| `audit_` | AUDIT | `audit_logs` |
| `atlas_` | SYSTEM | `atlas_capabilities` |
| `cognitive_` | BRAIN | `cognitive_registry` |
| `accessibility_` | INCLUSIVE | `accessibility_scans` |
| `autoblog_` | DREAM | `queue`, `drafts`, `runs`, `settings` |
| `auto_blog_` | DREAM | `posts`, `schedule` |

### RLS Policy Pattern

All user-facing tables follow this RLS pattern:

```sql
-- Users can only read their own data
CREATE POLICY "select_own" ON table
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "insert_own" ON table
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Exception:** Agency tables use `agency_id` scoping via membership lookups, not direct `user_id` matching.

---

## 6. Performance Secrets

### Response Time Budget

The substrate allocates a strict time budget per request:

| Phase | Budget | Notes |
|-------|--------|-------|
| AUTH + DEFENSE | 50ms | Cached — rarely hits DB |
| DECODE (intent) | 100ms | Local classification, no AI call |
| CORTEX (routing) | 10ms | Lookup only |
| TARGET MODULE | 5000ms max | AI calls dominate this |
| RIPPLE (events) | Async | Does not block response |
| AUDIT | Async | Does not block response |

**Total p95 target:** < 5200ms for AI-involved operations, < 200ms for non-AI operations.

### Caching Strategy

| Layer | Cache | TTL | Hit Rate |
|-------|-------|-----|----------|
| API Key validation | In-memory | 5 min | ~95% |
| Rate limit counters | localStorage + BroadcastChannel | Real-time | N/A |
| Module health scores | In-memory | 10 sec | ~99% |
| BRAIN memory queries | Supabase Edge Cache | 1 min | ~60% |

---

*This document is version-controlled and restricted to internal use only.*

---

<div align="center">

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch — INTERNAL USE ONLY*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
