# 13: Vision Deep Dive — The Observability Dashboard

**How the Substrate Monitors Itself**

---

## What Is Vision?

Vision is the "eyes" of the substrate—it watches everything that happens and reports on system health. It provides:

1. **Health monitoring** — Is everything working?
2. **Metrics collection** — How fast/slow/expensive?
3. **Event logging** — What just happened?
4. **Alerting** — Something's wrong, tell someone
5. **Dashboards** — Visual overview of everything

Think of it as the instrument panel of a car, but for your AI system.

---

## Why Observability Matters

### Without Vision

```
User: "The AI is slow today"
You: "Uh... let me check... somewhere..."
     [20 minutes of digging through logs]
You: "I think maybe the database is slow?"
```

### With Vision

```
User: "The AI is slow today"
You: vision.health
     → Nexus latency: 340ms (normal: 80ms) ⚠️
     → Provider: OpenAI experiencing degradation
     → Automatic failover to Groq in progress
You: "OpenAI is having issues, we're switching to backup. Fixed in 30 seconds."
```

---

## Vision Actions Explained

### `vision.health` — Quick Health Check

**What it does:** Returns a simple health status for all modules.

**Example:**
```
vision.health

System Health Overview
═══════════════════════════════════════════

Overall: HEALTHY (94%)

Module Status:
├── Brain:      ██████████ 98% HEALTHY
├── Decode:     ██████████ 96% HEALTHY
├── Defense:    ██████████ 99% HEALTHY
├── Nexus:      ████████░░ 82% DEGRADED ⚠️
├── Vision:     ██████████ 100% HEALTHY
├── Dream:      ██████████ 95% HEALTHY
├── System:     ██████████ 97% HEALTHY
└── Modernizer: ██████████ 93% HEALTHY

Issues:
└── [WARN] Nexus: OpenAI provider latency elevated (340ms vs 80ms normal)
```

### `vision.metrics` — Performance Numbers

**What it does:** Returns detailed performance metrics.

**Example:**
```
vision.metrics

System Metrics (Last Hour)
═══════════════════════════════════════════

Request Volume:
├── Total requests: 12,456
├── Requests/minute: 207
├── Peak: 423 req/min at 14:32
└── Trough: 89 req/min at 13:15

Latency:
├── P50 (median): 87ms
├── P95: 234ms
├── P99: 456ms
└── Max: 1,234ms

Errors:
├── Total errors: 45
├── Error rate: 0.36%
├── Top error: "rate_limit_exceeded" (23)
└── Second: "timeout" (12)

Cost:
├── Total: $12.34
├── Per request: $0.001
└── Projected daily: $296.16
```

### `vision.pulse` — Ultra-Fast Heartbeat

**What it does:** Returns alive/dead status with zero database queries.

**Example:**
```
vision.pulse

{
  alive: true,
  timestamp: "2026-01-22T14:32:17Z",
  uptime_seconds: 1234567,
  version: "3.11.1"
}
```

**When to use:** Lightweight health checks, monitoring systems, load balancers.

### `vision.logs` — Recent Activity

**What it does:** Returns recent system logs.

**Example:**
```
vision.logs module:brain limit:5

Recent Logs (Brain)
═══════════════════════════════════════════

[14:32:17] INFO  brain.recall completed in 45ms
[14:32:15] INFO  brain.store saved memory_id:abc123
[14:32:10] WARN  brain.reflect found conflicting memories
[14:31:55] INFO  brain.dream cycle started
[14:31:23] INFO  brain.learn ingested 234 tokens
```

### `vision.dashboard` — Full Overview

**What it does:** Returns all dashboard data in one call.

**Example:**
```
vision.dashboard

═══════════════════════════════════════════════════════════
                    SUBSTRATE DASHBOARD
═══════════════════════════════════════════════════════════

HEALTH: 94% (HEALTHY)

┌─────────────────────────────────────────────────────────┐
│  QUICK STATS                                            │
├─────────────────────────────────────────────────────────┤
│  Requests (24h)    │  Memory Count    │  AI Cost (24h)  │
│  156,789           │  89,234          │  $45.67         │
├─────────────────────────────────────────────────────────┤
│  Avg Latency       │  Error Rate      │  Cache Hit      │
│  123ms             │  0.23%           │  34.5%          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  MODULE HEALTH                                          │
├─────────────────────────────────────────────────────────┤
│  Brain      98%  ██████████  │  Vision    100%  ██████████
│  Decode     96%  ██████████  │  Dream      95%  ██████████
│  Defense    99%  ██████████  │  System     97%  ██████████
│  Nexus      82%  ████████░░  │  Modernize  93%  ██████████
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  RECENT EVENTS                                          │
├─────────────────────────────────────────────────────────┤
│  14:32  [INFO]  Brain: dream cycle completed            │
│  14:30  [WARN]  Nexus: OpenAI latency elevated          │
│  14:28  [INFO]  Defense: blocked 12 bot requests        │
│  14:25  [INFO]  System: backup completed                │
└─────────────────────────────────────────────────────────┘
```

### `vision.alert` — Create Alert

**What it does:** Manually creates an alert.

**Example:**
```
vision.alert {
  severity: "warn",
  message: "Manual deployment in progress",
  metadata: { deployer: "ken", version: "3.12.0" }
}

Response:
{
  alert_id: "alert_abc123",
  created: true,
  severity: "warn",
  message: "Manual deployment in progress"
}
```

### `vision.trace` — Distributed Tracing

**What it does:** Tracks a request across multiple modules.

**Example:**
```
vision.trace traceId:"trace_xyz789"

Request Trace: trace_xyz789
═══════════════════════════════════════════

Total Duration: 234ms

Timeline:
├── 0ms    [DECODE]   interpret started
├── 12ms   [DECODE]   interpret completed
├── 15ms   [DEFENSE]  analyze started
├── 18ms   [DEFENSE]  analyze completed (allowed)
├── 20ms   [BRAIN]    recall started
├── 67ms   [BRAIN]    recall completed (12 memories)
├── 70ms   [NEXUS]    route started
├── 220ms  [NEXUS]    route completed (groq)
├── 225ms  [BRAIN]    store started
├── 234ms  [BRAIN]    store completed
└── 234ms  [COMPLETE] response sent

Breakdown:
├── Decode: 12ms (5%)
├── Defense: 3ms (1%)
├── Brain: 56ms (24%)
└── Nexus: 150ms (64%)
```

### `vision.audit` — Audit Log

**What it does:** Returns security-relevant events.

**Example:**
```
vision.audit entity:user action:login

Audit Log
═══════════════════════════════════════════

[14:32:17] user:ken@example.com LOGIN success ip:203.0.113.45
[14:28:05] user:jane@example.com LOGIN success ip:203.0.113.50
[14:25:12] user:unknown@spam.com LOGIN failed ip:185.234.12.34
[14:25:10] user:unknown@spam.com LOGIN failed ip:185.234.12.34
[14:25:08] user:unknown@spam.com LOGIN failed ip:185.234.12.34
                                 ↑ Blocked after 3 failures
```

---

## Health Scoring

### How Health Is Calculated

Each module reports health based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Success rate** | 40% | % of requests that succeed |
| **Latency** | 30% | Response time vs baseline |
| **Error rate** | 20% | % of requests with errors |
| **Resource usage** | 10% | CPU, memory, connections |

### Health Thresholds

| Score | Status | Color | Meaning |
|-------|--------|-------|---------|
| 90-100 | HEALTHY | 🟢 | Everything working normally |
| 70-89 | DEGRADED | 🟡 | Working but with issues |
| 50-69 | UNHEALTHY | 🟠 | Significant problems |
| 0-49 | CRITICAL | 🔴 | Major failure, needs attention |

### Automatic Actions

| Health Score | Action |
|--------------|--------|
| < 40% | Trigger emergency recovery |
| < 50% | Alert + investigate |
| < 70% | Alert operators |
| < 90% | Log for review |

---

## Alerting

### Alert Channels

| Channel | Severity | Description |
|---------|----------|-------------|
| **Dashboard** | All | Always shown in UI |
| **Email** | WARN+ | Sent to operators |
| **SMS** | ERROR+ | Sent to on-call |
| **Webhook** | All | For custom integrations |

### Alert Format

```
═══════════════════════════════════════════════════════
VISION ALERT — ERROR
═══════════════════════════════════════════════════════

Time: 2026-01-22 14:32:17 UTC
Module: Nexus
Type: Provider Failure

Message:
OpenAI API returning 503 errors. Automatic failover
to Groq activated.

Impact:
- Requests routing to Groq instead of OpenAI
- Response quality may differ slightly
- Cost may be lower (free tier)

Actions Taken:
✓ Failover to Groq activated
✓ OpenAI marked as degraded
✓ Monitoring for recovery

Recommended:
- No action required
- Failback will be automatic when OpenAI recovers

═══════════════════════════════════════════════════════
```

---

## Metrics Deep Dive

### Request Metrics

```
vision.metrics category:requests

Request Metrics (24h)
═══════════════════════════════════════════

By Module:
├── Brain: 45,678 requests
├── Decode: 34,567 requests
├── Defense: 156,789 requests (inline with all)
├── Nexus: 23,456 requests
├── Vision: 12,345 requests
└── System: 1,234 requests

By Status:
├── Success (2xx): 154,567 (98.2%)
├── Client Error (4xx): 2,345 (1.5%)
└── Server Error (5xx): 456 (0.3%)

By Hour:
  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆
  00        06        12        18        24
```

### Latency Metrics

```
vision.metrics category:latency

Latency Distribution
═══════════════════════════════════════════

Overall:
├── Min: 12ms
├── P50: 87ms
├── P90: 234ms
├── P95: 345ms
├── P99: 567ms
└── Max: 2,345ms

By Module:
├── Brain: avg 45ms (range 12-234ms)
├── Decode: avg 23ms (range 8-89ms)
├── Defense: avg 3ms (range 1-12ms)
├── Nexus: avg 180ms (range 45-890ms)
├── Vision: avg 5ms (range 2-23ms)
└── System: avg 34ms (range 12-123ms)

Trend (7 days):
  P50: 87ms → 92ms (+5.7%) ⚠️ Slight increase
  P99: 567ms → 456ms (-19.6%) ✓ Improving
```

### Cost Metrics

```
vision.metrics category:cost

Cost Report (30 days)
═══════════════════════════════════════════

Total: $345.67

By Provider:
├── OpenAI: $234.56 (67.9%)
├── Anthropic: $67.89 (19.6%)
├── Google: $23.45 (6.8%)
├── Together: $12.34 (3.6%)
└── Free tier: $0.00 (2.1%) — 45,678 requests

By Day:
  $15│ █
     │ █ █       █
  $10│ █ █ █   █ █ █
     │ █ █ █ █ █ █ █ █   █
   $5│ █ █ █ █ █ █ █ █ █ █ █ █
     └──────────────────────────
        1        10        20    30

Projections:
├── This month: ~$380
├── Trend: +3.2% vs last month
└── Budget remaining: $620
```

---

## Vision Status

```
substrate:// vision.status

Vision Module Status
═══════════════════════════════════════════

Health Score: 100%

Monitoring Status:
├── Health checks: ACTIVE (every 30s)
├── Metrics collection: ACTIVE
├── Log aggregation: ACTIVE
├── Alerting: ACTIVE
└── Tracing: ACTIVE

Storage:
├── Logs retained: 30 days
├── Metrics retained: 90 days
├── Traces retained: 7 days
└── Alerts retained: 365 days

Recent Activity:
├── Health checks (24h): 2,880
├── Alerts generated: 3
├── Traces captured: 12,456
└── Metrics points: 1.2M
```

---

## Common Questions

### "How do I set up alerts?"

Alerts are automatic based on health thresholds. To customize:
```
vision.config alerts {
  email: "ops@company.com",
  sms: "+1234567890",
  thresholds: {
    warn: 80,
    error: 50,
    critical: 30
  }
}
```

### "Can I export metrics to Datadog/Prometheus?"

Yes, via webhooks:
```
vision.config export {
  type: "prometheus",
  endpoint: "https://prometheus.company.com/push"
}
```

### "How far back can I see logs?"

Default retention:
- Logs: 30 days
- Metrics: 90 days
- Traces: 7 days

### "What's the performance impact of Vision?"

Minimal—Vision is designed to be lightweight:
- Pulse: 0 database queries
- Health: 1 aggregate query
- Dashboard: 3-5 queries, cached for 30 seconds

---

## Next Document

→ [14-DREAM-DEEP-DIVE.md](./14-DREAM-DEEP-DIVE.md) — How the autonomous cognition system evolves
