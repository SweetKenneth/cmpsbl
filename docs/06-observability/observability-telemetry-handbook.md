# Observability & Telemetry Handbook

## 1. Purpose

This handbook defines the observability standards, telemetry schema, health scoring model, and diagnostic procedures for the CMPSBL substrate.

## 2. Metric Taxonomy

| Category | Metrics | Source |
|----------|---------|--------|
| **System Health** | Integrity score, module health, breaker states | CORE |
| **Performance** | Request latency (p50, p95, p99), throughput | NEXUS |
| **Availability** | Uptime percentage, error rate, degraded windows | SYSTEM |
| **Cognitive** | Reasoning accuracy, memory retrieval latency, tier capacity | BRAIN, MEMORY |
| **Economic** | Cost per request, ROI, quota utilization | ECONOMY |
| **Security** | Threat count, block rate, incident count | DEFENSE |
| **Evolution** | Shadow run count, confidence scores, promotion rate | EVOLUTION |
| **Visitor Intelligence** | Session count, page depth, bounce rate, churn risk | DECODE (Analytics) |
| **Developer Adoption** | API key count, per-developer usage, module heatmaps | ACCESS |

## 3. Event Schema

All telemetry events follow a standardized schema:

```json
{
  "event_id": "uuid",
  "event_type": "string",
  "category": "system|performance|security|cognitive|economic|visitor|developer",
  "timestamp": "ISO-8601",
  "module": "MODULE_NAME",
  "actor": "user_id|system",
  "data": {},
  "metadata": {
    "session_id": "string",
    "request_id": "string",
    "environment": "string"
  }
}
```

## 4. Health Scoring Model

System health is a deterministic weighted sum across all 40 matrix nodes:

```
health = Σ(node_weight × node_health) for all 40 nodes
```

| Health Range | Status | Action |
|-------------|--------|--------|
| 0.95–1.00 | Healthy | Normal operation |
| 0.80–0.94 | Degraded | Alert, investigate |
| 0.60–0.79 | Impaired | Escalate, activate recovery |
| < 0.60 | Critical | Emergency response |

Node health is binary when circuit breaker is open: **0.000**.

## 5. Integrity Seals

Integrity seals are deterministic checks that confirm system state validity:

- **Matrix seal**: Weighted sum equals 1.000 ± 0.001.
- **Node count seal**: Exactly 40 registered matrix nodes across 12 sectors.
- **Boot seal**: All Spine modules initialized before Execution.
- **Sector seal**: Zone shielding verified — expansion zones independently circuit-broken.
- **Config seal**: Runtime configuration matches declared state.
- **Memory seal**: Tier capacity limits enforced — no tier exceeds 2x capacity.

Failed integrity seals trigger Level 2 escalation.

## 6. Logging Standards

| Level | Use Case | Retention |
|-------|----------|-----------|
| ERROR | Failures requiring attention | 90 days |
| WARN | Anomalies that may indicate problems | 30 days |
| INFO | Significant state transitions | 14 days |
| DEBUG | Detailed diagnostic information | 7 days (disabled in production by default) |

### Log Format

```
[TIMESTAMP] [LEVEL] [MODULE] [REQUEST_ID] message {structured_data}
```

## 7. Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| System health score | < 0.90 | < 0.70 |
| Error rate (5-min window) | > 2% | > 5% |
| Request latency p95 | > 2s | > 5s |
| Circuit breakers open | ≥ 1 | ≥ 3 |
| DEFENSE block rate | > 10% | > 25% |
| Quota utilization | > 80% | > 95% |
| Memory tier overflow | > 1.5x capacity | > 2x capacity |

## 8. Diagnostic Flow

```
1. Symptom Identified
   → Check system health score
   → Identify degraded modules

2. Module Investigation
   → Review circuit breaker state
   → Check module-specific metrics
   → Review recent AUDIT entries

3. Root Cause Analysis
   → Correlate events by request_id
   → Review shadow run deviation reports
   → Check provider health (NEXUS)

4. Resolution
   → Apply fix or rollback
   → Verify integrity seals
   → Monitor for recurrence

5. Post-Mortem
   → Document root cause
   → Update IMMUNITY patterns
   → Adjust alert thresholds if needed
```

## 9. Audit Trace Guarantees

- Every request has a unique `request_id` traceable across all modules.
- AUDIT entries are immutable and append-only.
- Chain-of-custody checksums prevent tampering.
- Cross-module correlation is supported via `request_id` and `session_id`.
- Audit queries support time-range, module, actor, and action filtering.

## 10. Recent Additions (v14.1.0 MINDGAMES)

| System | Observability Integration |
|--------|--------------------------|
| AutoBlog Quality Pipeline | Confidence scores, contradiction scores, drift metrics tracked per post |
| CLM (Constant Learning Mode) | Topic mastery levels, call throughput, distillation efficiency |
| Scanner Orchestrator | Finding priority scores, regression detection verdicts, coverage gap alerts |
| Ironclad Hardening Fabric | Per-module rate limit utilization, auto-restore events, bulkhead pressure |
| ENGINEER Node | Finding counts, proposal pipeline status, CLM topic health |
| INTEL Aggregation | Signal volume, deduplication ratio, IntelCard generation rate |
| Memory Tier Enforcement | Capacity utilization per tier, bulk demotion events, cascade triggers |
| Visitor Intelligence | Session depth, bounce rate, retention cohorts (D1/D7/D14/D30), churn risk scoring |
| Developer Adoption | Per-developer API usage, module-level heatmaps, revenue attribution |
| Disaster Recovery | Backup initiation events, archive size, table export counts |

## 11. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | v14.1.0 MINDGAMES — Updated to 40-node topology, added memory tier enforcement, visitor intelligence, developer adoption, disaster recovery observability |
| 2026-03-03 | System | Added recent feature observability, updated node count seal to 38 nodes |
| 2026-03-03 | System | Verified health scoring model matches 38-node weighted topology |
| 2026-03-01 | System | Initial canonical observability handbook |

---

© 2025–2026 PromptFluid®. All rights reserved.
