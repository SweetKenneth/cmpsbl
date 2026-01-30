# 04. Resilience & Circuit Breakers

**CMPSBL OS Substrate — Internal Engineering Library**

---

## The Stability Secret

The substrate "never crashes" because of **circuit breaker isolation**. Each module has its own circuit breaker. If BRAIN fails 3 times, only BRAIN is blocked—everything else keeps running.

---

## Circuit Breaker States

```
┌───────────────────────────────────────────────────────────────┐
│                   CIRCUIT BREAKER STATES                      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌────────┐    3 failures     ┌────────┐                    │
│   │ CLOSED │──────────────────►│  OPEN  │                    │
│   │(normal)│                   │(blocked)│                    │
│   └────────┘                   └────────┘                    │
│       ▲                            │                          │
│       │  2 successes        60s timeout                       │
│       │                            │                          │
│       │       ┌────────────┐       │                          │
│       └───────│ HALF-OPEN  │◄──────┘                          │
│               │  (testing) │                                  │
│               └────────────┘                                  │
└───────────────────────────────────────────────────────────────┘
```

### State Definitions

| State | Meaning | Behavior |
|-------|---------|----------|
| **CLOSED** | Normal operation | All requests pass through |
| **OPEN** | Failure mode | All requests immediately rejected |
| **HALF-OPEN** | Recovery testing | One test request allowed |

---

## Auto-Heal Trigger

When any module's health drops below 40%:

1. System triggers `system.heal` automatically
2. Module is put into "recovery mode"
3. Heal attempts are logged and rate-limited
4. If 3 heals fail, escalate to admin alert

### Health Score Calculation

```
health = 100 - (consecutive_failures × 20)

Status mapping:
- healthy:  health >= 70
- degraded: health >= 40 && health < 70
- critical: health < 40 → triggers auto-heal
```

### Auto-Heal Flow

```
Health drops below 40%
        │
        ▼
┌───────────────┐
│ Log heal      │
│ attempt       │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Run module    │
│ diagnostics   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Clear error   │
│ state         │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Reset circuit │
│ to HALF-OPEN  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Test request  │
└───────┬───────┘
        │
    ┌───┴───┐
    │       │
 Success  Failure
    │       │
    ▼       ▼
 CLOSED   OPEN
           │
           └──► If 3 failed heals → Admin alert
```

---

## Circuit Breaker Configuration

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `failure_threshold` | 3 | Failures before opening |
| `success_threshold` | 2 | Successes to close from half-open |
| `open_duration_ms` | 60000 | Time before trying half-open |
| `auto_heal_threshold` | 40 | Health score to trigger auto-heal |

---

## Module Isolation

```
BRAIN fails (circuit opens)
        │
        │ BRAIN blocked
        │
        ▼
╔═══════════════════════════════════════════════╗
║  Still operational:                           ║
║  ✅ NEXUS (AI routing continues)              ║
║  ✅ DEFENSE (security still active)           ║
║  ✅ SYSTEM (monitoring continues)             ║
║  ✅ DECODE (NLP still works)                  ║
║  ✅ ... all other modules                     ║
╚═══════════════════════════════════════════════╝
```

**The key insight:** Modules only depend on each other through the RIPPLE event bus. If a module is down, its events simply don't fire—but other modules continue operating independently.

---

## Graceful Degradation

When a module is in OPEN state:

```
Incoming request to module
        │
        ▼
┌───────────────────┐
│ Circuit OPEN?     │
└───────┬───────────┘
        │
    ┌───┴───┐
    │       │
   Yes      No
    │       │
    ▼       ▼
┌───────┐ ┌───────┐
│Return │ │Process│
│cached │ │normal │
│or     │ │       │
│fallback│ │       │
└───────┘ └───────┘
```

**Fallback strategies by module:**

| Module | Fallback When Open |
|--------|-------------------|
| BRAIN | Return "I don't recall" gracefully |
| NEXUS | Use cached responses or next provider |
| VISION | Return last known forecast |
| DREAM | Skip cycle, log and continue |

---

## Monitoring Commands

```bash
# Check all circuit states
system.health

# Check specific module
system.diagnostics

# Manual heal trigger
system.heal

# View recent failures
defense.audit
```

---

*CMPSBL OS Substrate v6.0.0 — Internal Engineering Library*
