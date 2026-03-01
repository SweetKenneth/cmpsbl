# 10 — Maintenance Runbook

**Classification:** 🔒 INTERNAL — Governor & Operator

---

## 1. Purpose

This document provides the complete daily, weekly, and monthly maintenance checklists for the CMPSBL Substrate. Every action item includes the terminal command or dashboard location required to complete it.

---

## 2. Daily Maintenance

**Estimated time:** 15–20 minutes  
**When:** Start of operating day

### 2.1 Morning Health Check

| # | Task | Command | Expected |
|---|------|---------|----------|
| 1 | Full system diagnostic | `system.health_check` | Score ≥ 80, all modules healthy |
| 2 | Review overnight DREAM insights | `dream.insights` | New insights logged, no hallucination flags |
| 3 | Check pending evolution proposals | `evolution.proposals` | Review any confidence 0.60–0.79 items |
| 4 | Review security incidents | `defense.report` | No P0/P1 incidents |
| 5 | Check quota usage | `access.usage` | Within budget |
| 6 | Check NEXUS provider health | `nexus.providers` | ≥ 10 providers healthy |
| 7 | Review cost report | `nexus.costs` | Daily spend within budget |
| 8 | Check control plane status | `cp.status` | Not degraded |

### 2.2 Daily Triage Actions

| Condition | Action |
|-----------|--------|
| Module health < 70 | Monitor, check logs for root cause |
| Module health < 40 | Auto-heal should have triggered; if not, run `system.heal { module: "X" }` |
| Circuit breaker open | Check which module, review recent errors |
| Evolution proposal pending | Review confidence score, approve or defer |
| Defense posture < B | Investigate, check for new threats |
| Provider health < 50 | Check provider status page, consider weight adjustment |

### 2.3 Daily Log Review

| Log Source | Command | Look For |
|------------|---------|----------|
| VISION alerts | `vision.alerts` | Anomalies, performance degradation |
| AUDIT trail | `audit.trail { limit: 50 }` | Unusual access patterns |
| RIPPLE events | `ripple.events { limit: 50 }` | Failed deliveries, DLQ items |
| DEFENSE events | `defense.events` | Blocked IPs, honeypot hits |

---

## 3. Weekly Maintenance

**Estimated time:** 30–45 minutes  
**When:** First business day of each week

### 3.1 Weekly Health Review

| # | Task | Command | Action |
|---|------|---------|--------|
| 1 | Review evolution history | `evolution.history { limit: 10 }` | Verify all mutations were beneficial |
| 2 | Check Merkle chain integrity | `audit.verify` | Must return `valid: true` |
| 3 | Review governance drift | `governance.drift` | Address any detected drift |
| 4 | Check SM-2 memory health | `brain.status` | Retention rate > 0.70 |
| 5 | Run compliance audit | `governance.audit` | Address any violations |
| 6 | Review cost trends | `nexus.costs { period: "week" }` | Compare to previous week |
| 7 | Check circuit breaker history | `system.circuits { history: true }` | Identify frequently tripping modules |
| 8 | Review DLQ items | `ripple.dlq` | Process or discard stale items |
| 9 | Check snapshot health | `cp.health` | All 4 dimensions healthy |
| 10 | Review IP reputation changes | `defense.reputation { changes: true }` | New hostile IPs |

### 3.2 Weekly Performance Review

| Metric | Command | Healthy |
|--------|---------|---------|
| P95 response time | `vision.latency { percentile: 95 }` | < baseline + 10% |
| Error rate (7d average) | `vision.errors { period: "week" }` | < 1% |
| Cache hit rate | `nexus.cache.stats` | > 60% |
| Provider cost efficiency | `nexus.costs { breakdown: true }` | No single provider > 40% of spend |

### 3.3 Weekly Security Review

| # | Task | Command |
|---|------|---------|
| 1 | Review honeypot hits | `defense.honeypots` |
| 2 | Check for new threat patterns | `defense.threats` |
| 3 | Review rate limit violations | `access.violations` |
| 4 | Verify RLS policies are enforced | `defense.rls_check` |
| 5 | Review API key usage patterns | `access.keys { activity: true }` |

---

## 4. Monthly Maintenance

**Estimated time:** 1–2 hours  
**When:** First business day of each month

### 4.1 Monthly System Audit

| # | Task | Command | Action |
|---|------|---------|--------|
| 1 | Full hardening assessment | Dashboard → Hardening | All 22 modules graded A or B |
| 2 | Evolution skill tier review | `evolution.skills` | Track progression, reset if needed |
| 3 | Entropy trend analysis | `evolution.entropy { period: "month" }` | Stable or decreasing |
| 4 | Memory tier distribution | `memory.tiers` | Balanced distribution, no tier overflow |
| 5 | DREAM cycle effectiveness | `dream.effectiveness` | Insight promotion rate > 10% |
| 6 | Control plane revision count | `cp.revisions { period: "month" }` | Consistent commit frequency |
| 7 | WAL health check | `cp.wal.stats` | No gaps, buffer not approaching limits |
| 8 | Diligence harness | `diligence.run` | All 26 probes pass |

### 4.2 Monthly Security Audit

| # | Task | Action |
|---|------|--------|
| 1 | Secret rotation review | Check age of all API keys, rotate any > 90 days |
| 2 | Defense posture trend | Compare monthly grades |
| 3 | Attack surface review | Verify no unprotected endpoints |
| 4 | IP reputation cleanup | Remove stale entries from reputation database |
| 5 | PII egress filter test | Verify egress filters catch test patterns |
| 6 | Black-box enforcement verify | Attempt to access sealed artifacts, verify block |

### 4.3 Monthly Capacity Planning

| Metric | Check | Action |
|--------|-------|--------|
| Database size growth | Query table sizes | Plan for scaling if > 80% capacity |
| Provider cost trend | Monthly spend vs. budget | Adjust routing weights if needed |
| API key count | Active keys | Revoke unused keys |
| Subscription utilization | Active vs. allocated quotas | Right-size plans |
| Storage usage | File storage metrics | Archive or clean up |

### 4.4 Monthly Documentation Review

| # | Task |
|---|------|
| 1 | Verify this runbook reflects current system state |
| 2 | Update threshold values if any have changed |
| 3 | Add new terminal commands if modules were updated |
| 4 | Review and update the governor knowledge base |

---

## 5. Incident Response Quick Reference

### Severity Levels

| Level | Definition | Response Time |
|-------|-----------|--------------|
| P0 — Critical | System down, no workaround | Immediate |
| P1 — High | Major feature broken | < 1 hour |
| P2 — Medium | Feature degraded, workaround exists | < 4 hours |
| P3 — Low | Minor issue, no operational impact | Next business day |

### P0 Response Procedure

```
1. Check auto-heal status (wait 30 seconds)
2. If unresolved: manually restart affected module
3. If restart fails: check edge function deployment status
4. If deployment healthy: check database connectivity
5. If database healthy: check AI provider connectivity
6. Document incident in AUDIT
7. Notify governor
8. Post-mortem within 24 hours
```

### Common Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| "Module X is degraded" | Health below threshold | `system.heal { module: "X" }` |
| "AI responses are slow" | Provider health issue | Check `nexus.providers`, adjust weights |
| "Memory queries return nothing" | Confidence gate too strict, or decay | Check `brain.query`, review confidence threshold |
| "Evolution was applied and broke things" | Failed mutation | `modernizer.rollback { stamp_id: "..." }` |
| "Control plane degraded" | Database connectivity | Check connection, system continues from memory |

---

## 6. Maintenance Calendar Summary

| Frequency | Key Tasks | Duration |
|-----------|-----------|----------|
| **Daily** | Health check, DREAM review, security scan, cost check | 15–20 min |
| **Weekly** | Merkle verify, governance audit, performance review, DLQ cleanup | 30–45 min |
| **Monthly** | Full hardening audit, secret rotation, capacity planning, diligence run | 1–2 hours |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial maintenance runbook |

---

© 2025–2026 PromptFluid®. Confidential.
