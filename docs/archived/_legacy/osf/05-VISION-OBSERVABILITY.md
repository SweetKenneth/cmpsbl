# promptfluid® vision observability

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-VISION-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Type | Cognitive Orchestration Substrate |
| Citation | Sweet Jr, K.E. (2026). promptfluid vision observability. doi:10.5281/zenodo.XXXXXXX |

---

## 1. Introduction

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

vision is the unified observability and control plane for the promptfluid ecosystem. It provides real-time monitoring, analytics, configuration management, and administrative controls across all system modules.

### 1.1 Design Goals

1. **Single Pane of Glass:** One dashboard for all system visibility
2. **Real-Time Updates:** WebSocket-powered live data streaming
3. **Zero Mock Data:** All metrics from live system queries
4. **Actionable Insights:** Not just metrics, but recommendations
5. **Role-Based Access:** Admin, developer, and viewer tiers

### 1.2 Scope

vision encompasses:
- System health monitoring
- Module-specific dashboards
- Cost tracking and optimization
- Security event visualization
- Brain activity monitoring
- Performance analytics

---

## 2. Architecture

### 2.1 Dashboard Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           VISION DASHBOARD                               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                        NAVIGATION HEADER                            ││
│  │  [Overview] [Brain] [Defense] [Nexus] [Ripple] [Access] [Settings] ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌───────────────────────────┐  ┌───────────────────────────────────┐   │
│  │     SYSTEM HEALTH         │  │        QUICK STATS               │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ │  │  Total Users: 1,234             │   │
│  │  │Brain│ │Nexus│ │Defns│ │  │  API Calls Today: 45,678        │   │
│  │  │ ✅  │ │ ✅  │ │ ✅  │ │  │  Cost MTD: $234.56              │   │
│  │  └─────┘ └─────┘ └─────┘ │  │  Threats Blocked: 89            │   │
│  └───────────────────────────┘  └───────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                         LIVE ACTIVITY FEED                          ││
│  │  [12:34:56] Brain: Completed reflection cycle                      ││
│  │  [12:34:55] Defense: Blocked suspicious IP 1.2.3.4                 ││
│  │  [12:34:54] Nexus: Routed request to Groq (45ms)                  ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Module Dashboards

### 3.1 Overview Dashboard

| Widget | Data Source | Update Frequency |
|--------|-------------|------------------|
| System Health Matrix | `pf_core_health` | 60 seconds |
| Quick Stats | Aggregated queries | 30 seconds |
| Live Activity Feed | `pf_logs` | Real-time |
| Cost Breakdown | `ai_usage_log` | 5 minutes |
| Performance Trends | `nexus_logs` | 5 minutes |

### 3.2 Brain Dashboard

| Widget | Purpose | Metrics |
|--------|---------|---------|
| Memory Status | Hot/Cold tier health | Count, size, age distribution |
| Learning Velocity | Knowledge acquisition rate | Memories/hour, patterns/day |
| Dream Monitor | Dream cycle activity | Last dream, next scheduled |
| Graph Visualization | Knowledge connections | Node count, edge density |
| Curiosity Queue | Pending explorations | Query count, domains |

### 3.3 Defense Dashboard

| Widget | Purpose | Metrics |
|--------|---------|---------|
| Threat Map | Geographic distribution | IP locations, block counts |
| Live Attacks | Real-time threat feed | IP, type, action taken |
| Rule Performance | Rule effectiveness | Blocks per rule, false positives |
| IP Reputation | Score distribution | High/medium/low risk |
| Challenge Stats | CAPTCHA metrics | Solve rate, average time |

### 3.4 Nexus Dashboard

| Widget | Purpose | Metrics |
|--------|---------|---------|
| Provider Status | Health check | Availability, latency |
| Routing Distribution | Provider usage | Percentage per provider |
| Cost Tracker | Spending monitoring | Daily/weekly/monthly |
| Cache Performance | Cache efficiency | Hit rate, savings |
| Latency Heatmap | Response times | P50, P95, P99 |

---

## 4. Real-Time Features

### 4.1 WebSocket Subscriptions

vision uses Supabase Realtime for live updates:

```typescript
// Subscribe to system logs
const logsChannel = supabase
  .channel('vision-logs')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'pf_logs' },
    (payload) => updateActivityFeed(payload.new)
  )
  .subscribe();
```

---

## 5. Health Monitoring

### 5.1 Status Definitions

| Status | Criteria | Alert Level |
|--------|----------|-------------|
| Healthy | All checks pass, latency < threshold | None |
| Degraded | Minor issues, performance impact | Warning |
| Unhealthy | Critical failure, service impacted | Critical |

---

## 6. Cost Tracking

### 6.1 Budget Alerts

```typescript
const BUDGET_THRESHOLDS = {
  daily: 100,   // $100/day
  weekly: 500,  // $500/week
  monthly: 1500 // $1500/month
};
```

### 6.2 Cost Optimization Recommendations

| Pattern Detected | Recommendation | Potential Savings |
|------------------|----------------|-------------------|
| Low cache hit rate | Increase cache TTL | 20-30% |
| Expensive model overuse | Route to cheaper alternative | 40-50% |
| Duplicate requests | Implement deduplication | 15-25% |
| Off-peak processing | Shift to batch jobs | 10-20% |

---

## 7. Performance Analytics

### 7.1 Latency Tracking

```typescript
interface LatencyMetrics {
  module: string;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  avg_ms: number;
  sample_count: number;
}
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
