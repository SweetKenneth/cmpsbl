# 09. Terminal Command Reference

**CMPSBL OS Substrate — Internal Engineering Library**

---

## Command Structure

```
{module}.{action} [arguments]

Examples:
brain.store "new fact"
system.status
modernizer.evolve --shadow
```

---

## Module Prefixes

| Prefix | Module | Category |
|--------|--------|----------|
| `core.` | CORE | Configuration |
| `ripple.` | RIPPLE | Events |
| `access.` | ACCESS | Auth & Keys |
| `brain.` | BRAIN | Memory |
| `vision.` | VISION | Forecasting |
| `cortex.` | CORTEX | Orchestration |
| `modernizer.` | MODERNIZER | Evolution |
| `decode.` | DECODE | NLP |
| `defense.` | DEFENSE | Security |
| `nexus.` | NEXUS | AI Routing |
| `dream.` | DREAM | Learning |
| `integration.` | INTEGRATION | External APIs |
| `inclusive.` | INCLUSIVE | Accessibility |
| `system.` | SYSTEM | Health & Ops |

---

## Core Commands

### system.*

| Command | Description |
|---------|-------------|
| `system.status` | Overall health and module status |
| `system.diagnostics` | Detailed diagnostics with metrics |
| `system.health` | Health scores for all modules |
| `system.backup` | Create manual backup |
| `system.restore <id>` | Restore from backup |
| `system.heal` | Trigger auto-heal cycle |
| `system.metrics` | Performance metrics |

### brain.*

| Command | Description |
|---------|-------------|
| `brain.status` | Memory statistics |
| `brain.store "content"` | Store new memory |
| `brain.recall "query"` | Search memories |
| `brain.forget <id>` | Delete specific memory |
| `brain.consolidate` | Trigger memory consolidation |
| `brain.curiosity` | Show unexplored topics |
| `brain.cross` | Cross-domain insights |

### modernizer.*

| Command | Description |
|---------|-------------|
| `modernizer.status` | Evolution engine status |
| `modernizer.evolve` | Start evolution cycle |
| `modernizer.evolve --shadow` | Shadow test only |
| `modernizer.proposals` | List pending proposals |
| `modernizer.receipts` | View evolution history |
| `modernizer.receipt <id>` | Specific receipt details |
| `modernizer.autonomy status` | Current autonomy mode |
| `modernizer.autonomy set <mode>` | Change autonomy mode |
| `modernizer.circuit status` | Circuit breaker state |
| `modernizer.circuit reset` | Reset circuit breaker |

### nexus.*

| Command | Description |
|---------|-------------|
| `nexus.status` | Provider health scores |
| `nexus.providers` | List all providers |
| `nexus.route` | Current routing strategy |
| `nexus.chat "prompt"` | Direct AI chat |
| `nexus.embed "text"` | Generate embeddings |
| `nexus.cost` | Usage and cost report |

### defense.*

| Command | Description |
|---------|-------------|
| `defense.status` | Security status |
| `defense.threats` | Recent threat detections |
| `defense.limits` | Current rate limits |
| `defense.audit` | Recent audit log |
| `defense.lockdown` | Emergency lockdown |
| `defense.unlock` | Exit lockdown |

### access.*

| Command | Description |
|---------|-------------|
| `access.status` | Auth system status |
| `access.register` | Register new developer |
| `access.create_key` | Generate API key |
| `access.revoke <id>` | Revoke API key |
| `access.keys` | List active keys |
| `access.usage` | Usage report |
| `access.products` | Product catalog |
| `access.entitlements` | Current entitlements |

### dream.*

| Command | Description |
|---------|-------------|
| `dream.status` | Dream cycle status |
| `dream.cycle` | Trigger dream cycle |
| `dream.sources` | List content sources |
| `dream.learnings` | Recent learnings |
| `dream.pool` | Dream pool status |

### inclusive.*

| Command | Description |
|---------|-------------|
| `inclusive.status` | A11y scanner status |
| `inclusive.scan <url>` | Scan URL for issues |
| `inclusive.report <id>` | Detailed scan report |
| `inclusive.fix <id>` | Generate fix suggestions |

---

## Output Formats

### Standard Response

```json
{
  "success": true,
  "module": "brain",
  "action": "store",
  "result": { ... },
  "timestamp": "2026-01-30T..."
}
```

### Error Response

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retry_after": 60
}
```

### Streaming Response

```
data: {"chunk": "First part..."}
data: {"chunk": "Second part..."}
data: {"done": true, "total_tokens": 150}
```

---

## Flags & Modifiers

| Flag | Meaning |
|------|---------|
| `--shadow` | Run in shadow/test mode |
| `--force` | Skip confirmation prompts |
| `--verbose` | Extra output detail |
| `--json` | Force JSON output |
| `--dry-run` | Show what would happen |
| `--async` | Return immediately, process in background |

---

## Hidden Commands (Admin Only)

| Command | Description | Danger Level |
|---------|-------------|--------------|
| `system.wipe` | Full data reset | ☠️ EXTREME |
| `defense.bypass` | Disable security | ☠️ EXTREME |
| `cortex.override` | Manual orchestration | ⚠️ HIGH |
| `brain.purge` | Delete all memories | ⚠️ HIGH |
| `modernizer.force_apply` | Skip safety checks | ⚠️ HIGH |

**These commands require admin API key + 2FA confirmation.**

---

*CMPSBL OS Substrate v6.0.0 — Internal Engineering Library*
