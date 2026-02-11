# 09. Terminal Command Reference

**CMPSBL OS Substrate — Internal Engineering Library**
**Version 8.5.0 SYNERGY+ Epoch | Updated 2026-02-11**
**340+ Commands | 14 Modules | 7 Infrastructure Systems | Full Observability**

---

## Command Structure

```
{module}.{action} [arguments]

Examples:
brain.store "new fact"
system.status
modernizer.evolve --shadow
clm.cycle
```

---

## Module Prefixes (15 Total)

| Prefix | Module | Category | Commands |
|--------|--------|----------|----------|
| `core.` | CORE | Kernel | 8 |
| `ripple.` | RIPPLE | Kernel | 18 |
| `access.` | ACCESS | Kernel | 14 |
| `brain.` | BRAIN | Cognitive | 49 |
| `decode.` | DECODE | Cognitive | 6 |
| `dream.` | DREAM | Cognitive | 11 |
| `defense.` | DEFENSE | Operations | 9 |
| `nexus.` | NEXUS | Operations | 9 |
| `vision.` | VISION | Operations | 22 |
| `system.` | SYSTEM | Admin | 18 |
| `modernizer.` | MODERNIZER | Admin | 17 |
| `inclusive.` | INCLUSIVE | Admin | 12 |
| `cortex.` | CORTEX | Orchestrator | 19 |
| `integration.` | INTEGRATION | Orchestrator | 19 |
| `clm.` | CLM | Learning | 10 |

---

## Kernel Layer Commands

### core.*

| Command | Description |
|---------|-------------|
| `core.status` | Kernel status with uptime |
| `core.pulse` | Lightweight heartbeat |
| `core.boot` | Initialize boot sequence |
| `core.schedule` | Schedule a delayed job |
| `core.jobs` | List scheduled jobs |
| `core.process` | Process next queued job |
| `core.config` | Get/set system config |
| `core.shutdown` | Graceful system shutdown |

### ripple.* (v2.0 Hybrid Event Orchestrator)

| Command | Description |
|---------|-------------|
| `ripple.status` | Bus status with job breakdown + 24h analytics |
| `ripple.pulse` | Lightweight heartbeat |
| `ripple.metrics` | Bus metrics for Vision integration |
| `ripple.topics` | List all topics |
| `ripple.events` | Get event log with status |
| `ripple.publish` | Publish event + fan-out to subscribers |
| `ripple.subscribe` | Subscribe module/action to topic |
| `ripple.replay` | Re-process events on topic |
| `ripple.jobs` | List jobs with filtering |
| `ripple.enqueue` | Add job to queue |
| `ripple.dequeue` | Get next pending job |
| `ripple.work` | Process job(s) from queue |
| `ripple.drain` | Process all pending jobs in queue |
| `ripple.ack` | Acknowledge job as succeeded |
| `ripple.nack` | Reject job (increment attempts) |
| `ripple.dead_letter` | View dead-letter jobs |
| `ripple.retry` | Retry dead-letter job |
| `ripple.circuits` | View subscriber circuit breakers |

### access.* (v2.1 Identity & Billing)

| Command | Description |
|---------|-------------|
| `access.status` | Module status (v2.1) |
| `access.pulse` | Lightweight heartbeat |
| `access.bootstrap` | Bootstrap developer identity + roles |
| `access.identity` | Get current session identity + roles |
| `access.register` | Register as developer |
| `access.developer` | Get developer profile |
| `access.developers` | List all developers (admin) |
| `access.create_key` | Create API key |
| `access.validate_key` | Validate API key |
| `access.revoke_key` | Revoke API key |
| `access.list_keys` | List your API keys |
| `access.usage` | Get usage statistics |
| `access.quota` | Check quota remaining |
| `access.subscription` | Get subscription info |
| `access.entitlements` | List your entitlements |
| `access.products` | List available products |

---

## Cognitive Layer Commands

### brain.*

| Command | Description |
|---------|-------------|
| `brain.status` | Full tier status (hot/warm/cold) |
| `brain.query` | Search memories by text |
| `brain.remember` | Store a new memory |
| `brain.recall` | Retrieve specific memories |
| `brain.reflect` | Trigger daily reflection cycle |
| `brain.dream` | Run autonomous dream cycle |
| `brain.reinforce` | Boost memory confidence |
| `brain.synthesize` | Cross-domain synthesis |
| `brain.tier` | Run hot→warm→cold tiering cycle |
| `brain.optimize` | Compress and clean memory |
| `brain.prune` | Remove low-value memories |
| `brain.deep_think` | Extended multi-step reasoning |
| `brain.hypothesis_test` | IF-THEN scenario modeling |
| `brain.causal` | Causal reasoning & hypothesis gen |
| `brain.ethical` | Ethical/legal risk evaluation |
| `brain.self_critique` | Output quality review |
| `brain.systems_reason` | Multi-layer dependency mapping |
| `brain.pattern_fusion` | Merge insights from unrelated domains |
| `brain.cognitive_cycle` | Full cognitive loop |
| `brain.continuous_learn` | Toggle 24/7 learning |
| `brain.graph_build` | Update knowledge graph |
| `brain.graph_summary` | Knowledge graph overview |
| `brain.graph` | Knowledge graph surfaces |
| `brain.synthesize_knowledge` | Compress findings into core principles |
| `brain.lesson_compress` | Compress session learnings |
| `brain.curiosity` | Get exploration queries |
| `brain.curiosity_reflect` | Prioritize topics by curiosity score |
| `brain.explore` | Active research query |
| `brain.patterns` | Learning patterns/insights |
| `brain.session_reflection` | Session activity summary |
| `brain.coherence_check` | Memory coherence validation |
| `brain.forecast` | Predictive forecasting |
| `brain.forecast_eval` | Evaluate forecast accuracy |
| `brain.tone_detect` | Emotional tone & persona analysis |
| `brain.insight_aggregate` | Cross-module metric collection |
| `brain.insight_synthesize` | Strategic insight generation |
| `brain.temporal_score` | Memory freshness scoring |
| `brain.reflexive_plan` | Task decomposition with context audit |
| `brain.reward` | Apply reward/penalty to memory confidence |
| `brain.reinforce_cycle` | Enhanced reinforcement learning |
| `brain.persona_refine` | Optimize persona patterns |

### decode.*

| Command | Description |
|---------|-------------|
| `decode.status` | Module status |
| `decode.chat` | Chat with interpreter |
| `decode.intent` | Extract structured intent |
| `decode.dream` | Generate dream content |
| `decode.propose` | Submit substrate proposal |
| `decode.learn` | Ingest learning content |

### dream.* (Dream-Eater)

| Command | Description |
|---------|-------------|
| `dream.status` | Dream-Eater state with histograms + metabolic data |
| `dream.mood` | Get/set mood with decay info |
| `dream.cycle` | Execute dream cycle |
| `dream.feed` | Feed dream text (auto-classifies type) |
| `dream.consume` | Process a dream (mutation curve) |
| `dream.interpret` | Interpret dream text |
| `dream.mutate` | Trigger mutation |
| `dream.reflect` | Dream reflection |
| `dream.awaken` | Awaken Dream-Eater (reset with reason) |
| `dream.pulse` | Lightweight heartbeat + circadian |
| `dream.anomalies` | View dream module anomalies |

---

## Operations Layer Commands

### defense.*

| Command | Description |
|---------|-------------|
| `defense.status` | Module status |
| `defense.analyze` | Analyze request for threats |
| `defense.reputation` | IP reputation score |
| `defense.ip_intel` | Full IP intelligence report |
| `defense.anomaly` | Real-time anomaly detection |
| `defense.anomaly_probe` | Statistical z-score analysis |
| `defense.posture` | Security posture summary |
| `defense.limits` | Rate limit status |
| `defense.rules` | Active defense rules |

### nexus.*

| Command | Description |
|---------|-------------|
| `nexus.status` | Module status with analytics |
| `nexus.route` | Route to best provider |
| `nexus.text` | Text generation via routing spine |
| `nexus.image` | Image generation metadata |
| `nexus.providers` | Provider registry + capabilities |
| `nexus.route_stats` | AI routing analytics (24h) |
| `nexus.analytics` | Session analytics accumulator |
| `nexus.test` | Test provider routing |
| `nexus.pulse` | Lightweight heartbeat |

### vision.* (Vee v2.0)

| Command | Description |
|---------|-------------|
| `vision.status` | Module status (Vee v2.0) |
| `vision.health` | System-wide health |
| `vision.pulse` | Lightweight heartbeat |
| `vision.metrics` | System metrics |
| `vision.logs` | View module logs |
| `vision.alert` | Create alert |
| `vision.audit` | Query audit log |
| `vision.dashboard` | Dashboard aggregation |
| `vision.trace` | Distributed tracing with causal chains |
| `vision.monitor` | Ecosystem health |
| `vision.resilience` | Error analysis + auto-fix |
| `vision.analytics` | Threat + provider analytics |
| `vision.anomalies` | Anomaly detection results |
| `vision.mode` | Get/set vision mode |
| `vision.replay` | Replay traces over time window |
| `vision.health_snapshot` | Quick health snapshot |
| `vision.introspection` | Deep self-analysis |
| `vision.quota` | AI usage quota |
| `vision.dependency_map` | Module dependencies |
| `vision.inspect` | Inspect observability state |
| `vision.diagnostics` | Diagnostics for observability |

---

## Admin Layer Commands

### system.*

| Command | Description |
|---------|-------------|
| `system.status` | Global system status |
| `system.health` | Full system health |
| `system.resilience` | Resilience snapshot (circuits, health, heals) |
| `system.version` | Substrate version |
| `system.config` | View configuration |
| `system.audit` | Query health incidents & audit log |
| `system.diagnostics` | Full diagnostics |
| `system.heal` | Self-healing trigger |
| `system.restart` | Restart service |
| `system.backup` | Create backup snapshot |
| `system.restore` | Restore from backup |
| `system.restore_portable` | Restore from portable JSON backup |
| `system.list_backups` | List available backups |
| `system.upgrade.propose` | Propose upgrade (shadow) |
| `system.upgrade.list` | List upgrade plans |
| `system.upgrade.apply` | Apply upgrade plan |
| `system.upgrade.rollback` | Rollback upgrade |
| `system.modules` | List all registered modules |
| `system.module` | Get specific module details |

### modernizer.* (Evolution Engine)

| Command | Description |
|---------|-------------|
| `modernizer.status` | Modernizer service status |
| `modernizer.jobs` | List evolution runs |
| `modernizer.evolve` | Unified Evolution Cycle |
| `modernizer.scan` | Cognitive systems scan |
| `modernizer.circuit` | Evolution circuit breaker control |
| `modernizer.autonomy` | Governed autonomy settings |
| `modernizer.receipts` | List evolution receipts |
| `modernizer.receipt` | View specific evolution receipt |
| `modernizer.analyze` | Quick analysis of a module |
| `modernizer.plans` | List active evolution plan |
| `modernizer.review` | Review a specific plan |
| `modernizer.validate` | Validate plan readiness |
| `modernizer.diff` | View plan diff and health comparison |
| `modernizer.rollback` | Rollback an applied plan |
| `modernizer.delete` | Delete/reject a plan |
| `modernizer.applied` | List all applied improvements |
| `modernizer.archived` | Scan archived functions |
| `modernizer.implement` | Generate code for function repurposing |
| `modernizer.export` | Export job assets |
| `modernizer.quota` | Check usage limits |
| `modernizer.refresh` | Resync metrics and clear stale hints |

### inclusive.* (Human Compatibility Pipeline)

| Command | Description |
|---------|-------------|
| `inclusive.status` | Module status with global score |
| `inclusive.health` | Health check |
| `inclusive.pulse` | Lightweight heartbeat |
| `inclusive.scan` | Scan URL/HTML for WCAG issues |
| `inclusive.self_scan` | Scan the substrate UI itself |
| `inclusive.repair` | Auto-fix accessibility issues |
| `inclusive.validate` | Validate repairs, check for regressions |
| `inclusive.profile` | Build user adaptive profile |
| `inclusive.report` | Generate compliance report |
| `inclusive.scan_all_templates` | Scan all marketplace templates |
| `inclusive.regressions` | Get regressions in last N hours |
| `inclusive.coverage` | Template coverage stats |

---

## Orchestrator Layer Commands

### cortex.* (v2.0 Agency-Class Orchestrator)

| Command | Description |
|---------|-------------|
| `cortex.status` | Full status + capabilities + circuits |
| `cortex.health` | Health + connected modules + circuits |
| `cortex.pulse` | Lightweight heartbeat |
| `cortex.diagnostics` | Deep self-analysis |
| `cortex.mode` | Get/set mode (manual/shadow/auto) |
| `cortex.restart` | Soft reload cortex state |
| `cortex.panic` | Panic mode controls |
| `cortex.dispatch` | Execute module.action with governance |
| `cortex.observe` | Subscribe to module events |
| `cortex.propose` | Generate improvement proposal |
| `cortex.evaluate` | Score and assess proposal |
| `cortex.apply` | Execute approved changes |
| `cortex.rollback` | Rollback applied changes |
| `cortex.audit` | Query decisions and deltas |
| `cortex.learn` | Ingest outcome for reinforcement |
| `cortex.summary` | Human-readable context dump |
| `cortex.plan` | Rank evolution sequences by priority |
| `cortex.run` | Execute sequence in shadow mode |
| `cortex.world` | Full module registry snapshot |
| `cortex.inventory` | Module inventory with eligibility |

### integration.* (v2.0 Enterprise Adapters)

| Command | Description |
|---------|-------------|
| `integration.status` | Integration module status (v2.0) |
| `integration.pulse` | Lightweight heartbeat |
| `integration.adapters` | List available adapters by category |
| `integration.connect` | Connect adapter with mode |
| `integration.disconnect` | Disconnect connection by ID |
| `integration.connections` | List active connections |
| `integration.test` | Test adapter connectivity |
| `integration.discover` | Discover system (shallow by default) |
| `integration.discovered` | List discoveries |
| `integration.map_command` | Map terminal command to adapter |
| `integration.mapped_commands` | List mapped commands |
| `integration.execute` | Execute governed command |
| `integration.policies` | Get governance policies |
| `integration.set_policy` | Set governance policy |
| `integration.governance` | Governance status |
| `integration.audit_log` | View governance audit log |
| `integration.game_discover` | Discover game engine APIs |
| `integration.enterprise_discover` | Discover enterprise APIs |
| `integration.dev_discover` | Discover dev platform APIs |
| `integration.payroll` | Execute payroll operation |
| `integration.customer_service` | Execute customer service op |

---

## CLM (Constant Learning Mode) v6.7.0

| Command | Description |
|---------|-------------|
| `clm.status` | CLM status (budget, topics, queue) |
| `clm.enable` | Enable Constant Learning Mode |
| `clm.disable` | Disable Constant Learning Mode |
| `clm.cycle` | Run a manual CLM cycle |
| `clm.budget` | View daily budget allocation |
| `clm.kill_switch` | Activate/deactivate kill switch |
| `clm.topics` | View topic bank with mastery scores |
| `clm.add_topic` | Add custom topic to bank |
| `clm.review_queue` | View spaced repetition queue |
| `clm.next_review` | Get next review item |

---

## Meta Commands (Terminal Control)

| Command | Description |
|---------|-------------|
| `help` | Show all commands |
| `help <module>` | Show module-specific commands |
| `clear` | Clear terminal history |
| `whoami` | Display identity |
| `history` | Command history |
| `export` | Export session log |
| `theme` | Toggle terminal theme |
| `alias` | List all command aliases |
| `alias add` | Create a custom alias |
| `alias remove` | Remove a custom alias |
| `macro` | Macro help & commands |
| `macro list` | List all macros |
| `macro run` | Execute a macro |
| `macro show` | Show macro details |
| `macro create` | Create a custom macro |
| `macro delete` | Delete a custom macro |
| `schedule` | Schedule command execution |
| `schedule list` | List scheduled commands |
| `schedule cancel` | Cancel a scheduled command |
| `schedule clear` | Cancel all scheduled commands |
| `watch` | Run command repeatedly |
| `watch list` | List active watch sessions |
| `watch stop` | Stop a watch session |
| `audit` | View session audit log |
| `audit stats` | Session statistics |
| `audit export` | Export audit log as JSON |

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
| `--explain` | Human-readable explanation |
| `--llm-report` | Include LLM reasoning |

---

## Aliases (Shortcuts)

| Alias | Expansion | Description |
|-------|-----------|-------------|
| `st` | `system.status` | System status |
| `sh` | `system.health` | System health |
| `hp` | `vision.pulse` | Health pulse |
| `br` | `brain.reflect` | Brain reflect |
| `bs` | `brain.status` | Brain status |
| `dc` | `dream.cycle` | Dream cycle |
| `ds` | `dream.status` | Dream status |
| `me` | `modernizer.evolve` | Evolution Cycle |
| `ms` | `modernizer.evolve status` | Evolution status |
| `cs` | `cortex.status` | Cortex status |
| `rs` | `ripple.status` | Ripple bus status |
| `is` | `inclusive.status` | Inclusive status |
| `heal` | `system.heal` | Self-healing |

---

## Infrastructure Commands (v8.5.0)

### cron.* (Scheduled Task Runner)

| Command | Description |
|---------|-------------|
| `cron.list` | List all registered cron jobs |
| `cron.status` | Cron runner status with next-run times |
| `cron.run` | Manually trigger a cron job |
| `cron.pause` | Pause a cron job |
| `cron.resume` | Resume a paused cron job |
| `cron.history` | View execution history |

### ratelimit.* (Persistent Rate Limiter)

| Command | Description |
|---------|-------------|
| `ratelimit.status` | Rate limiter status with window counts |
| `ratelimit.config` | View/update rate limit config |
| `ratelimit.reset` | Reset rate limit counters |
| `ratelimit.whitelist` | Manage whitelisted keys |

### snapshot.* (Rollback Snapshots — Enterprise)

| Command | Description |
|---------|-------------|
| `snapshot.capture` | Capture system state snapshot |
| `snapshot.list` | List available snapshots |
| `snapshot.restore` | Restore from snapshot |
| `snapshot.diff` | Diff two snapshots |
| `snapshot.prune` | Remove old snapshots |

### analytics.* (Capability Usage Analytics)

| Command | Description |
|---------|-------------|
| `analytics.summary` | Usage summary with top/dead capabilities |
| `analytics.capability` | Detailed stats for a capability |
| `analytics.trends` | Usage trends over time |
| `analytics.dead` | List unused/dead capabilities |
| `analytics.rising` | List capabilities with rising usage |

### streaming.* (Streaming Response Pipeline)

| Command | Description |
|---------|-------------|
| `streaming.status` | Pipeline status with active streams |
| `streaming.config` | View/update streaming config |
| `streaming.test` | Test streaming with sample payload |

### files.* (File Processing Pipeline)

| Command | Description |
|---------|-------------|
| `files.ingest` | Ingest a file for processing |
| `files.status` | Pipeline status |
| `files.supported` | List supported file types |
| `files.history` | View processing history |

### nl.* (Natural Language Terminal)

| Command | Description |
|---------|-------------|
| `nl.parse` | Parse natural language to command |
| `nl.suggest` | Get command suggestions from intent |
| `nl.history` | View NL parse history |

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

*CMPSBL OS Substrate v8.5.0 — SYNERGY+ Epoch — Internal Engineering Library*
*© 2025-2026 PromptFluid®. All rights reserved.*
