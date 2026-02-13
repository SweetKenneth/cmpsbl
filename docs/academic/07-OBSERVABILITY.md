# CMPSBL OS Substrate — Observability Infrastructure

**Document ID:** CMPSBL-ACAD-007  
**Version:** v9.1.0 (ARCHITECT Epoch)

---

## 1. Observability Overview

The CMPSBL Substrate provides comprehensive observability infrastructure that makes all system activity—especially self-evolution—visible, verifiable, and auditable. This infrastructure is essential for demonstrating that the system genuinely self-modifies.

### 1.1 Observability Principles

| Principle | Description |
|-----------|-------------|
| **Completeness** | All significant events are captured |
| **Verifiability** | Claims can be independently verified |
| **Immutability** | Logs cannot be retroactively altered |
| **Accessibility** | Appropriate access for all stakeholders |
| **Privacy** | Sensitive details are protected |

### 1.2 Observability Layers

```
┌─────────────────────────────────────────┐
│          Public Observability           │
│  Receipts │ Status │ Health Metrics     │
├─────────────────────────────────────────┤
│        Authenticated Observability      │
│  Dashboards │ Logs │ Traces │ Stamps    │
├─────────────────────────────────────────┤
│         Administrative Access           │
│  Full Audit │ Debug │ Configuration     │
└─────────────────────────────────────────┘
```

---

## 2. Evolution Stamps

### 2.1 Stamp Architecture

Evolution stamps are cryptographic proofs that self-modification occurred:

```typescript
interface EvolutionStamp {
  // Identification
  stampId: string;           // Format: SEBA-{hash1}-{hash2}
  
  // Lineage
  proposalId: string;        // Source proposal
  executionId: string;       // Execution record
  
  // Content
  filesModified: string[];   // Changed files
  changeHash: string;        // SHA-256 of all changes
  
  // Metadata
  appliedAt: string;         // ISO timestamp
  appliedBy: 'seba' | 'human';
  
  // Verification
  signature?: string;        // Optional cryptographic signature
}
```

### 2.2 Stamp Generation Process

```
Code Change
     │
     ▼
┌─────────────┐
│ Compute     │ ← SHA-256 hash of all modified content
│ Change Hash │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Generate    │ ← Create unique stamp identifier
│ Stamp ID    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Persist     │ ← Store in database
│ Stamp       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Embed       │ ← Insert comment in modified code
│ Reference   │
└─────────────┘
```

### 2.3 Stamp Verification Protocol

Independent verification steps:

1. **Extract**: Locate stamp reference in code comment
2. **Query**: Retrieve stamp record from database
3. **Hash**: Compute SHA-256 of current file content
4. **Compare**: Match computed hash against `changeHash`
5. **Verify**: Confirm proposal and execution records exist

### 2.4 Verification Outcomes

| Outcome | Meaning |
|---------|---------|
| Valid | Hash matches, records exist, chain intact |
| Hash Mismatch | Code modified after stamp generation |
| Missing Record | Stamp record not found |
| Broken Chain | Proposal or execution record missing |

---

## 3. Public Receipts

### 3.1 Receipt Purpose

Receipts provide public, read-only proof of evolution activity without exposing sensitive implementation details.

### 3.2 Receipt Schema

```typescript
interface EvolutionReceipt {
  // Identification
  runId: string;
  
  // Outcome
  phase: 'verified' | 'failed' | 'aborted';
  
  // Metrics
  confidenceScore: number;   // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  testsRun: number;
  testsPassed: number;
  healthBefore: number;
  healthAfter: number;
  
  // Metadata
  timestamp: string;
  initiatedBy: 'system' | 'human';
}
```

### 3.3 What Receipts DO NOT Expose

| Protected Information | Reason |
|----------------------|--------|
| Code diffs | Trade secrets |
| Payload content | Proprietary logic |
| Internal prompts | IP protection |
| Debug information | Security |

Receipts show **WHAT** happened, never **HOW**.

### 3.4 Receipt API

```
GET /evolution/receipts
GET /evolution/receipts?run_id=<uuid>
GET /evolution/receipts?page=1&page_size=20
```

---

## 4. System Intelligence Feed

### 4.1 Feed Purpose

Real-time visibility into system evolution activity for authenticated stakeholders.

### 4.2 Feed Events

| Event Type | Payload |
|------------|---------|
| `seba:proposal` | New proposal generated |
| `seba:approval` | Proposal approved/rejected |
| `seba:execution` | Execution started/completed |
| `seba:stamp` | New stamp generated |
| `seba:health` | Health score update |
| `seba:circuit` | Circuit state change |

### 4.3 Feed Access Modes

| Mode | Capabilities |
|------|--------------|
| Observer | Read-only, no controls |
| Operator | Read + acknowledge |
| Administrator | Full control |

### 4.4 WebSocket Protocol

```typescript
// Subscribe to evolution events
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'evolution',
  events: ['seba:proposal', 'seba:stamp']
}));

// Receive events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: 'seba:proposal', payload: {...}, timestamp: '...' }
};
```

---

## 5. Audit Logging

### 5.1 Audit Log Schema

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;           // System component or user
  action: string;          // Action performed
  resource: string;        // Affected resource
  resourceId?: string;     // Specific resource ID
  outcome: 'success' | 'failure';
  details: Record<string, unknown>;
  ip?: string;             // For user actions
  correlationId?: string;  // Request tracing
}
```

### 5.2 Logged Actions

| Category | Actions |
|----------|---------|
| Evolution | proposal_created, proposal_approved, execution_started, stamp_generated |
| Authentication | login, logout, token_refresh, permission_change |
| Configuration | setting_changed, capability_toggled, circuit_reset |
| Access | api_call, rate_limit_hit, unauthorized_attempt |

### 5.3 Log Retention

| Log Type | Retention | Archive |
|----------|-----------|---------|
| Evolution | Indefinite | N/A |
| Security | 2 years | 7 years |
| Operational | 90 days | 1 year |
| Debug | 7 days | None |

---

## 6. Telemetry Pipeline

### 6.1 Metric Categories

| Category | Metrics | Purpose |
|----------|---------|---------|
| Performance | Latency, throughput | Optimization |
| Availability | Uptime, error rate | Reliability |
| Usage | API calls, tokens | Billing |
| Evolution | Proposals, stamps | Self-improvement |

### 6.2 Metric Collection

```
Source → Collector → Aggregator → Storage → Query
```

### 6.3 Aggregation Periods

| Period | Granularity | Use Case |
|--------|-------------|----------|
| Real-time | 1 second | Alerting |
| Short-term | 1 minute | Dashboards |
| Medium-term | 1 hour | Analysis |
| Long-term | 1 day | Reporting |

### 6.4 Key Performance Indicators

| KPI | Target | Alert Threshold |
|-----|--------|-----------------|
| API Latency (p99) | < 500ms | > 1s |
| Error Rate | < 0.1% | > 1% |
| Evolution Success | > 90% | < 80% |
| Health Score | > 85 | < 70 |

---

## 7. Dashboards

### 7.1 System Health Dashboard

| Panel | Metrics |
|-------|---------|
| Health Score | Current, trend, components |
| Error Rate | By module, by capability |
| Latency | p50, p95, p99 by endpoint |
| Throughput | Requests per second |

### 7.2 Evolution Dashboard

| Panel | Metrics |
|-------|---------|
| Active Proposals | Count, status breakdown |
| Recent Executions | Timeline, outcomes |
| Stamp History | Generated stamps |
| Health Impact | Delta over time |

### 7.3 Access Levels

| Dashboard | Required Role |
|-----------|---------------|
| Public Status | None |
| System Health | Authenticated |
| Evolution | Operator |
| Full Admin | Administrator |

---

## 8. Alerting

### 8.1 Alert Categories

| Category | Severity | Response Time |
|----------|----------|---------------|
| Critical | P0 | Immediate |
| High | P1 | < 15 minutes |
| Medium | P2 | < 1 hour |
| Low | P3 | < 24 hours |

### 8.2 Alert Definitions

| Alert | Condition | Severity |
|-------|-----------|----------|
| Circuit Open | Evolution circuit opened | P1 |
| Health Critical | Score < 50 | P0 |
| Error Spike | Error rate > 5% | P1 |
| Evolution Failed | Execution failed | P2 |
| Rate Limit | Approaching quota | P3 |

### 8.3 Notification Channels

| Channel | Latency | Use Case |
|---------|---------|----------|
| WebSocket | Real-time | Dashboard |
| Webhook | < 5s | Integrations |
| Email | < 1m | Non-urgent |

---

## 9. Query Interface

### 9.1 Log Query Language

```sql
SELECT timestamp, action, outcome
FROM audit_logs
WHERE actor = 'seba'
  AND action LIKE 'proposal_%'
  AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC
LIMIT 100
```

### 9.2 Metric Query

```typescript
query({
  metric: 'evolution.proposals.count',
  groupBy: 'status',
  period: '7d',
  granularity: '1d'
});
```

### 9.3 API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /metrics` | Query metrics |
| `GET /logs` | Query audit logs |
| `GET /traces` | Query execution traces |
| `GET /alerts` | Query alert history |

---

## 10. Data Export

### 10.1 Export Formats

| Format | Use Case |
|--------|----------|
| JSON | API integration |
| CSV | Spreadsheet analysis |
| Parquet | Big data processing |

### 10.2 Export Scopes

| Scope | Contents |
|-------|----------|
| Receipts | Public evolution proofs |
| Metrics | Aggregated telemetry |
| Audit | Complete audit trail |

### 10.3 Compliance Export

For regulatory compliance, complete audit exports are available:

```
GET /export/audit?start=2026-01-01&end=2026-02-01&format=json
```

---

## 11. Security Considerations

### 11.1 Access Control

| Resource | Public | Auth | Admin |
|----------|--------|------|-------|
| Receipts | ✓ | ✓ | ✓ |
| Health Status | ✓ | ✓ | ✓ |
| Detailed Metrics | - | ✓ | ✓ |
| Audit Logs | - | - | ✓ |
| Full Export | - | - | ✓ |

### 11.2 Data Protection

| Data Type | Protection |
|-----------|------------|
| Stamps | Immutable storage |
| Logs | Append-only |
| Metrics | Retention policies |
| PII | Encryption at rest |

---

*CMPSBL OS Substrate v9.1.0 — Observability Infrastructure*  
*© 2025-2026 PromptFluid®. All rights reserved.*
