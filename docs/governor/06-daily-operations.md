# 06 — Daily Operations Runbook

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. Daily Maintenance (15–20 minutes)

### Morning Health Check

| # | Task | Command | Expected |
|---|------|---------|----------|
| 1 | Full diagnostic | `system.health_check` | Score ≥ 80, all modules healthy |
| 2 | Overnight DREAM insights | `dream.insights` | New insights, no hallucination flags |
| 3 | Pending evolution proposals | `evolution.proposals` | Review confidence 0.85–0.94 items |
| 4 | Security incidents | `defense.report` | No P0/P1 incidents |
| 5 | Quota usage | `access.usage` | Within budget |
| 6 | NEXUS provider health | `nexus.providers` | ≥ 10 providers healthy |
| 7 | Cost report | `nexus.costs` | Daily spend within budget |
| 8 | Control plane status | `cp.status` | Not degraded |

### Triage Actions

| Condition | Action |
|-----------|--------|
| Module health < 70 | Monitor, check logs |
| Module health < 40 | Run `system.heal { module: "X" }` |
| Circuit breaker open | Check module, review errors |
| Evolution pending | Review confidence, approve or defer |
| Defense posture < B | Investigate threats |
| Provider health < 50 | Check status, adjust weights |

### Log Review

| Source | Command | Look For |
|--------|---------|----------|
| VISION alerts | `vision.alerts` | Anomalies, degradation |
| AUDIT trail | `audit.trail { limit: 50 }` | Unusual access patterns |
| RIPPLE events | `ripple.events { limit: 50 }` | Failed deliveries, DLQ items |
| DEFENSE events | `defense.events` | Blocked IPs, honeypot hits |

---

## 2. Weekly Maintenance (30–45 minutes)

### Health Review

| # | Task | Command |
|---|------|---------|
| 1 | Evolution history | `evolution.history { limit: 10 }` |
| 2 | Merkle chain integrity | `audit.verify` → must return `valid: true` |
| 3 | Governance drift | `governance.drift` |
| 4 | Memory health | `brain.status` → retention > 0.70 |
| 5 | Compliance audit | `governance.audit` |
| 6 | Cost trends | `nexus.costs { period: "week" }` |
| 7 | Circuit breaker history | `system.circuits { history: true }` |
| 8 | DLQ items | `ripple.dlq` |
| 9 | Snapshot health | `cp.health` |
| 10 | IP reputation | `defense.reputation { changes: true }` |

### Performance

| Metric | Command | Healthy |
|--------|---------|---------|
| P95 latency | `vision.latency { percentile: 95 }` | < baseline + 10% |
| Error rate (7d) | `vision.errors { period: "week" }` | < 1% |
| Cache hit rate | `nexus.cache.stats` | > 60% |
| Provider cost | `nexus.costs { breakdown: true }` | No provider > 40% of spend |

### Security

| # | Task | Command |
|---|------|---------|
| 1 | Honeypot hits | `defense.honeypots` |
| 2 | New threat patterns | `defense.threats` |
| 3 | Rate limit violations | `access.violations` |
| 4 | RLS enforcement | `defense.rls_check` |
| 5 | API key usage | `access.keys { activity: true }` |

---

## 3. Monthly Maintenance (1–2 hours)

### System Audit

| # | Task | Command |
|---|------|---------|
| 1 | Hardening assessment | Dashboard → Hardening → all modules graded A/B |
| 2 | Evolution skill tiers | `evolution.skills` |
| 3 | Entropy trend | `evolution.entropy { period: "month" }` |
| 4 | Memory tier distribution | `memory.tiers` → balanced, no overflow |
| 5 | DREAM effectiveness | `dream.effectiveness` → promotion rate > 10% |
| 6 | Control plane revisions | `cp.revisions { period: "month" }` |
| 7 | WAL health | `cp.wal.stats` → no gaps |
| 8 | Diligence harness | `diligence.run` → all 26 probes pass |

### Security Audit

| # | Task |
|---|------|
| 1 | Rotate API keys > 90 days old |
| 2 | Compare monthly defense posture grades |
| 3 | Verify no unprotected endpoints |
| 4 | Clean up stale IP reputation entries |
| 5 | Test PII egress filters |
| 6 | Verify black-box enforcement on sealed artifacts |

### Capacity Planning

| Metric | Action |
|--------|--------|
| Database size > 80% | Plan scaling |
| Monthly spend vs. budget | Adjust routing weights |
| Unused API keys | Revoke |
| Subscription utilization | Right-size plans |

---

## 4. Calendar Summary

| Frequency | Key Tasks | Duration |
|-----------|-----------|----------|
| **Daily** | Health check, DREAM review, security scan, cost check | 15–20 min |
| **Weekly** | Merkle verify, governance audit, performance review, DLQ cleanup | 30–45 min |
| **Monthly** | Full hardening audit, secret rotation, capacity planning, diligence run | 1–2 hours |

---

## 5. Quick Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Module degraded | Health below threshold | `system.heal { module: "X" }` |
| AI responses slow | Provider issue | `nexus.providers`, adjust weights |
| Memory queries empty | Confidence gate too strict | Check `brain.query`, review threshold |
| Evolution broke things | Failed mutation | `modernizer.rollback { stamp_id: "..." }` |
| Control plane degraded | DB connectivity | Check connection; system continues from memory |

---

© 2025–2026 PromptFluid®. Governor Eyes Only.
