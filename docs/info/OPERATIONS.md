# promptfluid® Substrate — Operations Guide

**v2026.01 — Day-to-Day Operations and Monitoring**

---

## Operational Overview

This guide covers the day-to-day operation of a promptfluid® substrate deployment:

1. **Health Monitoring** — Checking system status
2. **Performance Monitoring** — Tracking metrics
3. **Incident Response** — Handling issues
4. **Maintenance** — Routine tasks
5. **Scaling** — Handling growth

---

## Health Monitoring

### Quick Health Check

```typescript
import { vision } from '@/lib/substrate';

const health = await vision.health();
console.log(`Status: ${health.data.status}`);
```

### Module-Level Health

```typescript
const health = await vision.health();
for (const [module, status] of Object.entries(health.data.modules)) {
  if (status !== 'healthy') {
    console.warn(`⚠️ ${module}: ${status}`);
  }
}
```

### Lightweight Heartbeat

For high-frequency monitoring (no database queries):

```typescript
const pulse = await vision.pulse();
console.log(`Alive: ${pulse.data.alive}`);
```

### Health Snapshot

Consolidated status for dashboards:

```typescript
const snapshot = await vision.healthSnapshot();
```

---

## Performance Monitoring

### System Metrics

```typescript
const metrics = await vision.metrics('24h');
```

Returns:
- Request counts
- Error rates
- Response times
- Memory usage
- AI token consumption

### AI Usage Quota

```typescript
const quota = await vision.quota();
console.log(`Tokens used: ${quota.data.tokens_used}`);
console.log(`Daily limit: ${quota.data.daily_limit}`);
console.log(`Remaining: ${quota.data.tokens_remaining}`);
```

### Route Statistics

```typescript
const stats = await nexus.routeStats();
console.log(`Provider calls (24h): ${stats.data.calls_24h}`);
```

---

## Dashboard Data

### Vision Dashboard

```typescript
const dashboard = await vision.dashboard();
```

Includes:
- System health
- Recent activity
- Error summary
- Performance trends
- Security posture

### Brain Status

```typescript
const brain = await brain.status();
console.log(`Memories: ${brain.data.memories_count}`);
console.log(`Hot memories: ${brain.data.hot_memories}`);
console.log(`Last reflection: ${brain.data.last_reflection}`);
```

---

## Introspection

### Deep Analysis

For debugging and diagnostics:

```typescript
const intro = await vision.introspection();
```

Returns detailed analysis of:
- Module interdependencies
- Resource utilization
- Potential bottlenecks
- Optimization opportunities

### Dependency Map

```typescript
const deps = await vision.dependencyMap();
console.log(deps.data.modules);
console.log(`Cascade risks: ${deps.data.cascade_risks.length}`);
```

---

## Incident Response

### Detecting Issues

#### Check for Anomalies

```typescript
const anomalies = await defense.anomalyProbe(24);
if (anomalies.data.detected_anomalies.length > 0) {
  console.error('Anomalies detected!');
  for (const anomaly of anomalies.data.detected_anomalies) {
    console.error(`- ${anomaly.type}: ${anomaly.description}`);
  }
}
```

#### Check Security Posture

```typescript
const posture = await defense.posture();
if (posture.data.overall_risk !== 'low') {
  console.warn(`Risk level: ${posture.data.overall_risk}`);
  console.warn(`Active threats: ${posture.data.active_threats}`);
}
```

### Responding to Issues

#### Self-Healing

```typescript
// Attempt automated remediation
const result = await system.heal({
  target: 'brain',
  force: false
});

if (result.success) {
  console.log('Healing successful');
} else {
  console.error('Healing failed, manual intervention needed');
}
```

#### Restart Service

```typescript
await system.restart('nexus');
```

#### Emergency Shutdown

```typescript
// Admin only - use with caution
await system.shutdown({
  confirm: true,
  reason: 'security_incident'
});
```

---

## Maintenance Tasks

### Daily Tasks

1. **Check health status**
   ```typescript
   const health = await vision.health();
   ```

2. **Review error logs**
   ```typescript
   const logs = await vision.logs({ level: 'error', limit: 50 });
   ```

3. **Check security posture**
   ```typescript
   const posture = await defense.posture();
   ```

### Weekly Tasks

1. **Review AI usage**
   ```typescript
   const quota = await vision.quota();
   ```

2. **Check memory growth**
   ```typescript
   const status = await brain.status();
   ```

3. **Trigger reflection**
   ```typescript
   await brain.reflect();
   ```

4. **Review anomalies**
   ```typescript
   const anomalies = await defense.anomalyProbe(168);
   ```

### Monthly Tasks

1. **Full backup**
   ```typescript
   const backup = await system.backup({
     include_data: true
   });
   ```

2. **Audit log review**
   ```typescript
   const audit = await system.audit({
     since: '2026-01-01'
   });
   ```

3. **Memory optimization**
   ```typescript
   const coherence = await brain.coherenceCheck('deep');
   ```

---

## Backup and Recovery

### Create Backup

```typescript
const backup = await system.backup({
  include_data: true,
  tables: ['brain_memories', 'brain_graph_edges', 'defense_events']
});

console.log(`Backup ID: ${backup.data.backup_id}`);
console.log(`Size: ${backup.data.size_mb} MB`);
```

### List Backups

```typescript
const backups = await system.listBackups();
for (const b of backups.data) {
  console.log(`${b.id} - ${b.created_at} - ${b.size_mb} MB`);
}
```

### Restore from Backup

```typescript
// Validate first
const validation = await system.restore({
  backup_id: 'backup-uuid',
  validate_only: true
});

if (validation.success) {
  // Perform restore
  await system.restore({
    backup_id: 'backup-uuid',
    validate_only: false
  });
}
```

---

## Scaling

### Monitoring Load

Track these metrics for scaling decisions:
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Database connections
- Memory usage
- Error rate

### Horizontal Scaling

Edge functions scale automatically. For database scaling:

1. **Read replicas** — For read-heavy workloads
2. **Connection pooling** — Via PgBouncer
3. **Table partitioning** — For large tables

### Vertical Scaling

1. **Database compute** — Upgrade database tier
2. **Memory optimization** — Tune hot/cold memory ratios
3. **Cold storage compression** — Increase compression

### Memory Management

```typescript
// Check memory distribution
const status = await brain.status();
const hotRatio = status.data.hot_memories / status.data.memories_count;

if (hotRatio > 0.3) {
  // Too many hot memories, trigger compression
  await brain.compress();
}
```

---

## Alerting

### Setting Up Alerts

Configure alerting thresholds:

```typescript
await system.config({
  key: 'alerts.error_rate_threshold',
  value: 0.05  // Alert if error rate > 5%
});

await system.config({
  key: 'alerts.response_time_p95',
  value: 2000  // Alert if p95 > 2 seconds
});
```

### Alert Channels

Configure notification channels:

```typescript
await system.config({
  key: 'alerts.channels',
  value: ['email', 'slack']
});
```

### Alert History

```typescript
const alerts = await vision.alerts({
  severity: 'critical',
  since: '2026-01-10'
});
```

---

## Logging

### View Logs

```typescript
const logs = await vision.logs({
  module: 'brain',
  level: 'error',
  limit: 100
});
```

### Log Levels

| Level | Usage |
|-------|-------|
| `debug` | Development debugging |
| `info` | Normal operations |
| `warn` | Potential issues |
| `error` | Errors requiring attention |
| `critical` | Immediate attention needed |

### Log Retention

| Type | Retention |
|------|-----------|
| Debug | 7 days |
| Info | 30 days |
| Warn | 90 days |
| Error | 365 days |
| Critical | Forever |

---

## Runbook: Common Issues

### High Error Rate

1. Check health: `vision.health()`
2. Review recent logs: `vision.logs({ level: 'error' })`
3. Check security posture: `defense.posture()`
4. Attempt heal: `system.heal()`
5. If persists, restart: `system.restart()`

### High Response Times

1. Check metrics: `vision.metrics('1h')`
2. Check AI providers: `nexus.providers()`
3. Check memory status: `brain.status()`
4. Consider compression: `brain.compress()`

### Rate Limit Exhaustion

1. Check limits: `defense.limits()`
2. Review anomalies: `defense.anomalyProbe(6)`
3. Block bad actors: `defense.block({ ip: '...' })`
4. Consider limit increase

### Memory Growth

1. Check status: `brain.status()`
2. Check coherence: `brain.coherenceCheck()`
3. Trigger compression: `brain.compress()`
4. Review retention settings

---

## Contact

| Issue Type | Contact |
|------------|---------|
| Technical | support@promptfluid.com |
| Security | security@promptfluid.com |
| Sales | sales@promptfluid.com |

---

**promptfluid® — The Cognitive Substrate OS**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
