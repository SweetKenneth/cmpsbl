<div align="center">

# 🔒 Operational Runbook

### Day-to-Day Operations, Troubleshooting, and Incident Response

<table>
<tr><td><strong>Document</strong></td><td>14 — Operational Runbook</td></tr>
<tr><td><strong>Classification</strong></td><td>🟡 MEDIUM</td></tr>
</table>

</div>

---

## Daily Operations

### Morning Checklist

1. Check system health: `system.health_check`
2. Review overnight dream cycle results: `dream.insights`
3. Check for pending evolution proposals: `modernizer.history`
4. Review security incidents: `defense.report`
5. Check quota usage: `access.usage`
6. Review cost report: `economy.report` (if available)

### Module Health Response

| Health Score | Action |
|-------------|--------|
| 70–100 | No action needed |
| 40–69 | Monitor closely, check logs for root cause |
| < 40 | Auto-heal should trigger; if not, run `system.heal` manually |
| 0 | Module is down — check edge function deployment, restart if needed |

---

## Troubleshooting Guide

### "Module X is degraded"

1. Check the module's health: `system.health_check`
2. Check recent errors in VISION: `vision.alerts`
3. Check if circuit breaker is open: look for `circuit.opened` events in RIPPLE
4. If auto-heal hasn't triggered, run: `system.heal { module: "X" }`

### "AI responses are slow"

1. Check NEXUS provider health: `nexus.providers`
2. Check if a provider is failing (triggering failover): look for `nexus.fallback.triggered` events
3. Check rate limits: `access.quota`
4. Consider switching primary provider weights

### "Memory queries return nothing"

1. Check BRAIN health: `brain.status`
2. Verify memories exist: `brain.query { query_text: "test", limit: 5 }`
3. Check confidence gates — memories below 0.30 won't appear
4. Check if decay has archived old memories

### "Evolution was applied and things broke"

1. Identify the last evolution stamp: `modernizer.history { limit: 1 }`
2. Rollback immediately: `modernizer.rollback { stamp_id: "..." }`
3. Review the proposal to understand what changed
4. File the rollback as data for future evolution scoring

---

## Incident Response

### Severity Levels

| Level | Definition | Response Time |
|-------|-----------|---------------|
| **P0 — Critical** | System down, no workaround | Immediate |
| **P1 — High** | Major feature broken | < 1 hour |
| **P2 — Medium** | Feature degraded, workaround exists | < 4 hours |
| **P3 — Low** | Minor issue, no impact on operations | Next business day |

### P0 Response Procedure

1. Check if auto-heal is running — if yes, wait 30 seconds
2. If auto-heal hasn't resolved, manually restart the affected module
3. If module restart fails, check edge function deployment status
4. If deployment is healthy, check database connectivity
5. If database is healthy, check AI provider connectivity
6. Document the incident in AUDIT

---

## Key Commands Quick Reference

| Command | What It Does |
|---------|-------------|
| `system.health_check` | Full system diagnostic |
| `system.heal { module: "X" }` | Auto-heal specific module |
| `brain.status` | BRAIN module stats |
| `brain.query { query_text: "..." }` | Search memories |
| `nexus.providers` | List provider health |
| `defense.report` | Security incident report |
| `modernizer.history` | Evolution history |
| `modernizer.rollback { stamp_id: "..." }` | Roll back evolution |
| `dream.insights` | Recent dream insights |
| `vision.alerts` | Active system alerts |

---

<div align="center">

*INTERNAL USE ONLY*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

</div>
