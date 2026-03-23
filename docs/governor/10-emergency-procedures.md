# 10 — Emergency Procedures

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. Severity Levels

| Level | Definition | Response Time |
|-------|-----------|--------------|
| **P0 — Critical** | System down, no workaround | Immediate |
| **P1 — High** | Major feature broken | < 1 hour |
| **P2 — Medium** | Feature degraded, workaround exists | < 4 hours |
| **P3 — Low** | Minor issue, no operational impact | Next business day |

---

## 2. P0 Response — System Down

```
1. Check auto-heal status (wait 30 seconds)
2. If unresolved: manually restart affected module
   → system.heal { module: "X" }
3. If restart fails: check edge function deployment status
4. If deployment healthy: check database connectivity
5. If database healthy: check AI provider connectivity
   → nexus.providers
6. Document incident in AUDIT
7. ATLAS Node Inbox will have auto-generated alert
8. Post-mortem within 24 hours
```

---

## 3. Emergency Scenarios

### Cascade Detected
| Step | Action |
|------|--------|
| 1 | Auto-arrest should trigger via RIPPLE — verify isolation |
| 2 | Check `ripple.cascades` for active chains |
| 3 | If not arrested: `system.mode { mode: "lockdown" }` |
| 4 | Root cause analysis after containment |

### Data Breach Suspected
| Step | Action |
|------|--------|
| 1 | Immediate: Rotate all secrets |
| 2 | Enable lockdown mode: `system.mode { mode: "lockdown" }` |
| 3 | Forensic audit via `audit.trail` — filter by entity and time |
| 4 | Check `defense.events` for breach indicators |
| 5 | Check for cross-tenant access attempts |

### Evolution Gone Wrong
| Step | Action |
|------|--------|
| 1 | `modernizer.rollback { stamp_id: "..." }` |
| 2 | Review evolution proposal and shadow run reports |
| 3 | File as learning data for future SEBA calibration |
| 4 | Check Scanner Orchestrator for regression signals |

### Provider Fleet Failure
| Step | Action |
|------|--------|
| 1 | NEXUS auto-failover should handle — check `nexus.providers` |
| 2 | If all providers down: system operates from cache |
| 3 | Contact provider, update health weights |
| 4 | Review `nexus.costs` for anomalous billing |

### Credential Compromise
| Step | Action |
|------|--------|
| 1 | Immediate rotation of all affected keys |
| 2 | Revoke affected API keys: check `access.keys` |
| 3 | Audit access logs: `audit.trail { actor: "..." }` |
| 4 | Rotate Agent JWT secrets if agent access was affected |
| 5 | Monitor for 24 hours post-rotation |

### Full Infrastructure Loss
| Step | Action |
|------|--------|
| 1 | Restore from one-click disaster recovery backup |
| 2 | Follow `RESTORE.md` in the backup archive |
| 3 | Verify AUDIT chain integrity: `audit.verify` |
| 4 | Verify all 40 primitives boot successfully |
| 5 | Monitor for stability before resuming normal operations |

---

## 4. Governance Mode Quick Reference

| Situation | Set Mode |
|-----------|----------|
| Security incident | `system.mode { mode: "lockdown" }` |
| Diagnostic needed | `system.mode { mode: "observe" }` |
| Accelerated evolution | `system.mode { mode: "evolve" }` |
| Return to normal | `system.mode { mode: "active" }` |

---

## 5. Critical Terminal Commands

```
system.health_check          — Full system diagnostic
system.heal { module: "X" }  — Manual heal for specific module
system.mode { mode: "..." }  — Change operating mode
system.circuits              — Circuit breaker status

governance.audit             — Run compliance audit
governance.vetoes            — Active veto list
governance.drift             — Governance drift analysis

evolution.status             — Current evolution state
evolution.rollback           — Rollback last evolution
evolution.history            — Recent history

nexus.providers              — Provider fleet health
nexus.costs                  — Cost report

defense.posture              — Security posture grade
defense.report               — Incident report
defense.events               — Recent security events

brain.status                 — Memory module health
brain.query                  — Search memories

dream.insights               — Recent DREAM cycle insights

vision.alerts                — Active alerts
vision.anomalies             — Detected anomalies

audit.trail                  — Recent audit entries
audit.verify                 — Verify chain integrity

cp.status                    — Control plane state
cp.revisions                 — Snapshot revision list

ripple.cascades              — Active cascade chains
ripple.dlq                   — Dead letter queue
```

---

## 6. Post-Incident Checklist

- [ ] Incident documented in AUDIT
- [ ] Root cause identified
- [ ] IMMUNITY updated with new threat pattern
- [ ] EVOLUTION path hardened if applicable
- [ ] Scanner Orchestrator regression test added
- [ ] Governor notified (if auto-handled)
- [ ] Post-mortem completed within 24 hours
- [ ] This runbook updated if procedures changed

---

© 2025–2026 PromptFluid®. Governor Eyes Only.
