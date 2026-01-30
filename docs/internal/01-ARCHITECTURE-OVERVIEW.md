# 01. Architecture Overview

**CMPSBL OS Substrate — Internal Engineering Library**

---

## The 14-Module Isolation Pattern

The substrate's core architectural secret is **complete module isolation**. Each of the 14 modules:

- Has its own **circuit breaker** (fails independently)
- Communicates only via the **RIPPLE event bus** (never direct calls)
- Maintains its own **health score** (0-100)
- Can be **healed independently** without affecting others

This means if BRAIN fails, NEXUS keeps routing AI requests. If DEFENSE crashes, DREAM keeps learning. **No single point of failure.**

---

## Boot Sequence

The boot order is **critical** and cannot be changed:

| Order | Module | Why This Order |
|-------|--------|----------------|
| 1 | CORE | Everything depends on config/constants |
| 2 | RIPPLE | Event bus must exist before anyone publishes |
| 3 | ACCESS | Auth must be ready before any operations |
| 4 | BRAIN | Memory must be online for cognitive ops |
| 5 | VISION | Needs BRAIN to model futures |
| 6 | CORTEX | Orchestrator needs lower layers ready |
| 7 | MODERNIZER | Evolution needs orchestrator |
| 8 | DECODE | NLP needs cognitive layer |
| 9 | DEFENSE | Security wraps everything above |
| 10 | NEXUS | AI routing needs security layer |
| 11 | DREAM | Autonomous cycles need AI routing |
| 12 | INTEGRATION | External APIs need everything internal ready |
| 13 | INCLUSIVE | A11y scanning needs integration layer |
| 14 | SYSTEM | Health monitoring is last (monitors everything) |

---

## The RIPPLE Event Bus

**This is the nervous system of the substrate.**

### How It Works

```
Publisher                    RIPPLE                     Subscribers
─────────────────────────────────────────────────────────────────────
BRAIN.store() ──────────►  brain.memory.stored  ──────► VISION
                                                 ──────► DREAM
                                                 ──────► CORTEX
```

### Key Events

| Event | Published By | Consumed By | Purpose |
|-------|--------------|-------------|---------|
| `brain.memory.stored` | BRAIN | VISION, DREAM | New memory available |
| `evolution.proposed` | MODERNIZER | CORTEX | Evolution ready for review |
| `evolution.applied` | MODERNIZER | SYSTEM, RIPPLE | Evolution completed |
| `circuit.opened` | Any Module | SYSTEM | Module entered failure state |
| `heal.triggered` | SYSTEM | Target Module | Auto-heal initiated |

### The Secret Sauce

RIPPLE uses **typed event payloads** with schema validation. If a publisher sends malformed data, RIPPLE **rejects it silently** and logs to defense. This prevents cascading failures from bad data.

---

## Request Flow

Every terminal command follows this exact path:

```
1. User Input
      │
      ▼
2. DECODE (parse natural language → structured command)
      │
      ▼
3. DEFENSE (rate limit check, API key validation)
      │
      ▼
4. CORTEX (route to correct module)
      │
      ▼
5. TARGET MODULE (execute operation)
      │
      ▼
6. RIPPLE (broadcast events)
      │
      ▼
7. SYSTEM (log metrics, update health)
      │
      ▼
8. Response to User
```

---

## Health Score Calculation

Every module maintains a health score using this formula:

```
health = 100 - (consecutive_failures × 20)

Status Thresholds:
- healthy:  health >= 70
- degraded: health >= 40 && health < 70  
- critical: health < 40
```

When any module drops below 40, **auto-heal triggers automatically**.

---

*CMPSBL OS Substrate v6.0.0 — Internal Engineering Library*
