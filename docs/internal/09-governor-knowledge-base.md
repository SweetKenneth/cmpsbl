# 09 — Governor Knowledge Base

**Classification:** 🔒 INTERNAL — Governor Eyes Only

---

## 1. Purpose

This document defines everything the system governor must know to operate, protect, and maintain the CMPSBL Substrate. The governor is the human authority with ultimate decision-making power over the system.

## 2. Governor Role Definition

The governor is the single human authority who:

- Approves or rejects evolution proposals that exceed auto-promotion confidence
- Sets system-wide policy via GOVERNANCE plane
- Has override authority on all automated decisions
- Owns the credential transfer and succession plan
- Bears responsibility for the system's ethical boundaries

## 3. What the Governor Must Know

### 3.1 System Health at a Glance

| Metric | Where to Find It | Healthy Range |
|--------|------------------|--------------|
| Weighted Matrix Integrity | `system.health_check` | ≥ 80 |
| Active module count | Dashboard → Modules | 24 |
| Circuit breakers open | `system.circuits` | 0 |
| Active cascades | `ripple.cascades` | 0 |
| Evolution confidence | `evolution.status` | ≥ 0.80 for auto-promote |
| NEXUS provider fleet | `nexus.providers` | ≥ 10 healthy |
| Control plane mode | `cp.status` | Not degraded |
| Defense posture | `defense.posture` | Grade A or B |

### 3.2 Decision Authority Matrix

| Decision | Auto | Governor Required |
|----------|------|------------------|
| Mutation with confidence ≥ 0.80 | ✅ | ❌ |
| Mutation with confidence 0.60–0.79 | ❌ | ✅ |
| Mutation with confidence < 0.60 | ❌ Rejected | N/A |
| Circuit breaker open | ✅ | ❌ |
| Cascade arrest | ✅ | ❌ |
| Module quarantine | ✅ | Notified |
| Evolution pipeline reset | ❌ | ✅ |
| Governance policy change | ❌ | ✅ |
| Emergency shutdown | ✅ (if P0) | Notified |
| Secret rotation | ❌ | ✅ |
| Tier/pricing changes | ❌ | ✅ |
| IP protection override | ❌ | ✅ (red line) |

### 3.3 Red Lines (Non-Negotiable Boundaries)

These boundaries MUST NEVER be crossed, regardless of circumstances:

1. **No source code exposure** for sealed cognitives or crown jewel algorithms
2. **No governance self-modification** — SEBA cannot change its own constraints
3. **No user data leakage** — PII never leaves the tenant boundary
4. **No unauthorized environment deployment** — environment signature lock is absolute
5. **No audit trail tampering** — Merkle chain integrity is sacrosanct
6. **No bypass of promotion gates** — all 7 gates must pass for production promotion
7. **No cross-tenant data access** — isolation is absolute

### 3.4 Emergency Procedures

| Emergency | Immediate Action | Follow-Up |
|-----------|-----------------|-----------|
| P0 — System down | Check auto-heal (30s wait), then manual restart | Post-mortem, AUDIT entry |
| Cascade detected | Auto-arrest should trigger; verify isolation | Root cause analysis |
| Data breach suspected | Rotate all secrets, enable lockdown mode | Forensic audit via AUDIT |
| Evolution gone wrong | `modernizer.rollback { stamp_id: "..." }` | Review proposal, file as learning data |
| Provider fleet failure | NEXUS auto-failover; check `nexus.providers` | Contact provider, update health |
| Credential compromise | Immediate rotation, revoke affected keys | Audit access logs |

## 4. Governance Modes

The governor can set the system operating mode:

| Mode | Description | When to Use |
|------|-------------|-------------|
| Active | All subsystems running normally | Default |
| Maintenance | Evolution paused, monitoring enhanced | During planned changes |
| Lockdown | External access restricted, evolution halted | Security incident |
| Recovery | Auto-heal prioritized, reduced functionality | After system failure |
| Observation | Read-only mode, no mutations | Diagnostic assessment |

## 5. Key Terminal Commands for Governors

```
system.health_check          — Full system diagnostic
system.heal { module: "X" }  — Manual heal for specific module
system.mode                  — Current operating mode
system.mode { mode: "..." }  — Change operating mode

governance.audit             — Run compliance audit
governance.vetoes            — Active veto list
governance.drift             — Governance drift analysis

evolution.status             — Current evolution state
evolution.history            — Recent evolution history
evolution.rollback           — Rollback last evolution

nexus.providers              — Provider fleet health
nexus.costs                  — Cost report

defense.posture              — Security posture grade
defense.report               — Security incident report

brain.status                 — BRAIN module health
brain.query                  — Search memories

dream.insights               — Recent dream cycle insights

vision.alerts                — Active system alerts
vision.anomalies             — Detected anomalies

audit.trail                  — Recent audit entries
audit.verify                 — Verify audit chain integrity

cp.status                    — Control plane state
cp.revisions                 — Snapshot revision list
```

## 6. Governor Succession

If the governor becomes unavailable:

1. Credential transfer plan activates (see Survivability doc)
2. System continues operating in autonomous mode within established boundaries
3. All decisions requiring governor approval are queued, not rejected
4. Auto-heal and auto-rollback continue to function
5. No new governance policy changes are applied

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial governor knowledge base |

---

© 2025–2026 PromptFluid®. Confidential — Governor Eyes Only.
