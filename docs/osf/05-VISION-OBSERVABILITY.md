# PromptFluid Vision: Observability & Control Plane

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-VISION-001 |
| Version | 1.0.0 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Citation | Sese, K. (2026). PromptFluid Vision Observability. doi:10.5281/zenodo.XXXXXXX |

---

## 1. Introduction

Vision is the unified observability and control plane for the PromptFluid ecosystem. It provides real-time monitoring, analytics, configuration management, and administrative controls across all system modules.

### 1.1 Design Goals

1. **Single Pane of Glass:** One dashboard for all system visibility
2. **Real-Time Updates:** WebSocket-powered live data streaming
3. **Zero Mock Data:** All metrics from live system queries
4. **Actionable Insights:** Not just metrics, but recommendations
5. **Role-Based Access:** Admin, developer, and viewer tiers

### 1.2 Scope

Vision encompasses:
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
│  │  [12:34:53] Access: New user registration                          ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌───────────────────────────┐  ┌───────────────────────────────────┐   │
│  │    COST BREAKDOWN         │  │      PERFORMANCE TRENDS          │   │
│  │  [Chart: Provider costs]  │  │  [Chart: Latency over time]     │   │
│  └───────────────────────────┘  └───────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA COLLECTION LAYER                            │
│                                                                          │
│  Brain    Nexus    Defense    Ripple    Access    Studio    Marketing   │
│    │        │         │          │         │         │          │        │
│    └────────┴─────────┴──────────┴─────────┴─────────┴──────────┘        │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                        TELEMETRY PIPELINE                           ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐││
│  │  │  pf_logs │  │pf_health │  │ metrics  │  │ Supabase Realtime   │││
│  │  │ (events) │  │ (status) │  │ (agg)    │  │ (WebSocket)         │││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                        VISION FRONTEND                              ││
│  │          React + TanStack Query + Recharts + WebSocket             ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Module Dashboards

### 3.1 Overview Dashboard

The central command view showing aggregate system health:

| Widget | Data Source | Update Frequency |
|--------|-------------|------------------|
| System Health Matrix | `pf_core_health` | 60 seconds |
| Quick Stats | Aggregated queries | 30 seconds |
| Live Activity Feed | `pf_logs` | Real-time |
| Cost Breakdown | `ai_usage_log` | 5 minutes |
| Performance Trends | `nexus_logs` | 5 minutes |

### 3.2 Brain Dashboard

Cascade-specific monitoring:

| Widget | Purpose | Metrics |
|--------|---------|---------|
| Memory Status | Hot/Cold tier health | Count, size, age distribution |
| Learning Velocity | Knowledge acquisition rate | Memories/hour, patterns/day |
| Dream Monitor | Dream cycle activity | Last dream, next scheduled |
| Graph Visualization | Knowledge connections | Node count, edge density |
| Curiosity Queue | Pending explorations | Query count, domains |
| Reflection Log | Recent insights | Summaries, recommendations |

### 3.3 Defense Dashboard

Security operations center:

| Widget | Purpose | Metrics |
|--------|---------|---------|
| Threat Map | Geographic distribution | IP locations, block counts |
| Live Attacks | Real-time threat feed | IP, type, action taken |
| Rule Performance | Rule effectiveness | Blocks per rule, false positives |
| IP Reputation | Score distribution | High/medium/low risk |
| Challenge Stats | CAPTCHA metrics | Solve rate, average time |
| Trend Analysis | Attack patterns | Time series, seasonality |

### 3.4 Nexus Dashboard

AI routing analytics:

| Widget | Purpose | Metrics |
|--------|---------|---------|
| Provider Status | Health check | Availability, latency |
| Routing Distribution | Provider usage | Percentage per provider |
| Cost Tracker | Spending monitoring | Daily/weekly/monthly |
| Cache Performance | Cache efficiency | Hit rate, savings |
| Latency Heatmap | Response times | P50, P95, P99 |
| Error Rate | Failure tracking | Errors per provider |

### 3.5 Ripple Dashboard

Queue and job monitoring:

| Widget | Purpose | Metrics |
|--------|---------|---------|
| Queue Depth | Pending jobs | Count by priority |
| Processing Rate | Throughput | Jobs/minute |
| Job Distribution | Type breakdown | By category |
| Failed Jobs | Error tracking | Count, retry status |
| Latency Analysis | Wait times | Queue → completion |

---

## 4. Real-Time Features

### 4.1 WebSocket Subscriptions

Vision uses Supabase Realtime for live updates:

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

// Subscribe to health checks
const healthChannel = supabase
  .channel('vision-health')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'pf_core_health' },
    (payload) => updateHealthMatrix(payload.new)
  )
  .subscribe();

// Subscribe to defense events
const defenseChannel = supabase
  .channel('vision-defense')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'defense_events' },
    (payload) => updateThreatFeed(payload.new)
  )
  .subscribe();
```

### 4.2 Realtime Tables Configuration

```sql
-- Enable realtime for Vision tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.pf_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pf_core_health;
ALTER PUBLICATION supabase_realtime ADD TABLE public.defense_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.brain_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nexus_logs;
```

### 4.3 Activity Feed Schema

```sql
CREATE TABLE pf_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient querying
CREATE INDEX idx_pf_logs_module ON pf_logs(module);
CREATE INDEX idx_pf_logs_created_at ON pf_logs(created_at DESC);
```

---

## 5. Health Monitoring

### 5.1 Health Check Schema

```sql
CREATE TABLE pf_core_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  status TEXT DEFAULT 'healthy',
  latency_ms INTEGER,
  last_check TIMESTAMPTZ DEFAULT now(),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 Health Check Protocol

Each module reports health every 60 seconds:

```typescript
interface HealthReport {
  module: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms: number;
  details: {
    database_connected: boolean;
    cache_available: boolean;
    external_deps: Record<string, boolean>;
    error_rate_1h: number;
    memory_usage_mb: number;
  };
}

async function reportHealth(report: HealthReport): Promise<void> {
  await supabase
    .from('pf_core_health')
    .upsert({
      module: report.module,
      status: report.status,
      latency_ms: report.latency_ms,
      details: report.details,
      last_check: new Date().toISOString()
    }, { onConflict: 'module' });
}
```

### 5.3 Status Definitions

| Status | Criteria | Alert Level |
|--------|----------|-------------|
| Healthy | All checks pass, latency < threshold | None |
| Degraded | Minor issues, performance impact | Warning |
| Unhealthy | Critical failure, service impacted | Critical |

### 5.4 Alert Routing

```typescript
async function handleHealthAlert(module: string, status: string): Promise<void> {
  if (status === 'unhealthy') {
    // Immediate notification
    await sendAdminEmail({
      subject: `🚨 ${module} is UNHEALTHY`,
      body: generateAlertBody(module)
    });
    
    // Trigger auto-heal if available
    await supabase.functions.invoke('pf-self-heal', {
      body: { module }
    });
  }
  
  if (status === 'degraded') {
    // Log for review
    await logToSlack(`⚠️ ${module} degraded performance`);
  }
}
```

---

## 6. Cost Tracking

### 6.1 Cost Aggregation

```typescript
interface CostSummary {
  period: 'daily' | 'weekly' | 'monthly';
  total_cost: number;
  by_provider: Record<string, number>;
  by_module: Record<string, number>;
  by_task_type: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
  forecast: number;
}

async function getCostSummary(period: string): Promise<CostSummary> {
  const query = supabase
    .from('ai_usage_log')
    .select('provider, cost, category')
    .gte('created_at', getPeriodStart(period));
  
  const { data } = await query;
  
  return aggregateCosts(data);
}
```

### 6.2 Budget Alerts

```typescript
const BUDGET_THRESHOLDS = {
  daily: 100,   // $100/day
  weekly: 500,  // $500/week
  monthly: 1500 // $1500/month
};

async function checkBudgetAlerts(): Promise<void> {
  const daily = await getDailyCost();
  
  if (daily > BUDGET_THRESHOLDS.daily * 0.8) {
    await sendAlert({
      type: 'budget_warning',
      message: `Daily spend at ${(daily / BUDGET_THRESHOLDS.daily * 100).toFixed(0)}%`
    });
  }
  
  if (daily > BUDGET_THRESHOLDS.daily) {
    await sendAlert({
      type: 'budget_exceeded',
      message: 'Daily budget exceeded!',
      severity: 'critical'
    });
  }
}
```

### 6.3 Cost Optimization Recommendations

Vision generates actionable recommendations:

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

async function getLatencyMetrics(module: string, timeRange: string): Promise<LatencyMetrics> {
  const { data } = await supabase
    .rpc('calculate_latency_percentiles', {
      p_module: module,
      p_time_range: timeRange
    });
  
  return data;
}
```

### 7.2 Performance Dashboard Widgets

| Widget | Visualization | Data Range |
|--------|---------------|------------|
| Latency Trend | Line chart | 24h / 7d / 30d |
| Latency Distribution | Histogram | Last 1h |
| Slow Requests | Table | P99+ requests |
| Error Timeline | Bar chart | Hourly |

### 7.3 Performance Alerts

```typescript
const LATENCY_THRESHOLDS = {
  brain: { p95: 2000, p99: 5000 },
  nexus: { p95: 1000, p99: 2000 },
  defense: { p95: 50, p99: 100 }
};

async function checkPerformanceAlerts(module: string): Promise<void> {
  const metrics = await getLatencyMetrics(module, '1h');
  const thresholds = LATENCY_THRESHOLDS[module];
  
  if (metrics.p95_ms > thresholds.p95) {
    await sendAlert({
      type: 'performance_degradation',
      module,
      message: `P95 latency ${metrics.p95_ms}ms exceeds threshold ${thresholds.p95}ms`
    });
  }
}
```

---

## 8. Configuration Management

### 8.1 Settings Schema

```sql
CREATE TABLE core_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  scope TEXT DEFAULT 'global',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.2 Configuration Categories

| Category | Settings | Access Level |
|----------|----------|--------------|
| System | Log level, timezone, retention | Admin |
| AI Routing | Provider priorities, fallback rules | Admin |
| Security | Rate limits, block thresholds | Admin |
| Notifications | Alert channels, recipients | Admin |
| Display | Theme, dashboard layout | User |

### 8.3 Settings API

```typescript
// Get setting
const { data } = await supabase
  .from('core_settings')
  .select('value')
  .eq('key', 'ai_primary_provider')
  .single();

// Update setting
await supabase.functions.invoke('pf-core-settings', {
  body: {
    action: 'set',
    key: 'ai_primary_provider',
    value: 'groq'
  }
});
```

---

## 9. Access Control

### 9.1 Role Definitions

| Role | Permissions |
|------|-------------|
| Admin | Full access: view, configure, manage |
| Developer | View all, configure modules, no billing |
| Viewer | Read-only access to dashboards |
| API Only | Programmatic access, no UI |

### 9.2 Role Assignment

```sql
CREATE TABLE admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  role TEXT NOT NULL,
  modules TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy
CREATE POLICY "Admins can manage roles"
  ON admin_roles
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role = 'admin'
    )
  );
```

### 9.3 Component-Level Access

```typescript
// React component with role check
function SettingsPanel() {
  const { role } = useAdminRole();
  
  if (role !== 'admin') {
    return <AccessDenied />;
  }
  
  return <SettingsForm />;
}
```

---

## 10. Frontend Implementation

### 10.1 Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| TanStack Query | Data fetching, caching |
| Recharts | Data visualization |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |

### 10.2 Dashboard Component Structure

```
src/pages/admin/
├── OverviewDashboard.tsx      # Main dashboard
├── BrainDashboard.tsx         # Brain monitoring
├── DefenseDashboard.tsx       # Security ops
├── NexusDashboard.tsx         # AI routing
├── RippleDashboard.tsx        # Queue management
├── AccessDashboard.tsx        # User management
├── SettingsPage.tsx           # Configuration
└── components/
    ├── SystemHealthMatrix.tsx
    ├── ActivityFeed.tsx
    ├── CostChart.tsx
    ├── LatencyGraph.tsx
    └── AlertBanner.tsx
```

### 10.3 Data Fetching Pattern

```typescript
// TanStack Query hook for real-time data
function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pf_core_health')
        .select('*')
        .order('last_check', { ascending: false });
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}
```

---

## 11. Extension Points

### 11.1 Custom Dashboard Widgets

```typescript
// Register custom widget
registerWidget({
  id: 'custom-metrics',
  title: 'Custom Metrics',
  component: CustomMetricsWidget,
  dataSource: 'custom_metrics',
  refreshInterval: 60000
});
```

### 11.2 Custom Alert Channels

```typescript
// Add custom alert channel
await supabase.functions.invoke('pf-core-settings', {
  body: {
    action: 'add_alert_channel',
    channel: {
      type: 'webhook',
      name: 'PagerDuty',
      config: {
        url: 'https://events.pagerduty.com/v2/enqueue',
        routing_key: 'your-key'
      }
    }
  }
});
```

### 11.3 Custom Metrics Collection

```typescript
// Log custom metrics
await supabase.functions.invoke('pf-telemetry-log', {
  body: {
    module: 'custom',
    event_type: 'metric',
    data: {
      name: 'custom_conversion_rate',
      value: 0.045,
      tags: { source: 'landing_page' }
    }
  }
});
```

---

## References

1. Grafana Best Practices. https://grafana.com/docs/grafana/latest/best-practices/
2. Datadog Monitoring Philosophy. https://docs.datadoghq.com/getting_started/
3. Supabase Realtime Documentation. https://supabase.com/docs/guides/realtime

---

**Document Status:** STABLE  
**Next Review:** 2026-07-13
