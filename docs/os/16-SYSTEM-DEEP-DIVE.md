# 16: System Deep Dive — Master Control & Administration

**The Captain's Bridge of the Substrate**

---

## What Is the System Module?

System is the master control panel for the entire substrate. It handles:

1. **Global status** — Is everything running?
2. **Health management** — Detect and fix problems
3. **Backup/restore** — Save and recover states
4. **Configuration** — Tune system behavior
5. **Emergency controls** — Shutdown, restart, heal

Think of it as the control room of a spaceship—where all critical operations happen.

---

## System Actions Explained

### `system.status` — Overall Health

**What it does:** Returns the status of every module in one view.

**Example:**
```
system.status

═══════════════════════════════════════════════════════════
                    SUBSTRATE STATUS
                       v3.11.1
═══════════════════════════════════════════════════════════

OVERALL HEALTH: 96% (HEALTHY)

MODULE STATUS:
─────────────────────────────────────────────────────────

Module      │ Health │ Status    │ Last Activity
────────────┼────────┼───────────┼──────────────────
Brain       │ 98%    │ HEALTHY   │ 2 min ago
Decode      │ 96%    │ HEALTHY   │ 1 min ago
Defense     │ 99%    │ HEALTHY   │ 30 sec ago
Nexus       │ 85%    │ DEGRADED  │ 1 min ago ⚠️
Vision      │ 100%   │ HEALTHY   │ now
Dream       │ 95%    │ HEALTHY   │ 6 hrs ago
System      │ 97%    │ HEALTHY   │ now
Modernizer  │ 93%    │ HEALTHY   │ 4 hrs ago

RESOURCES:
─────────────────────────────────────────────────────────

├── Database connections: 45/100 (45%)
├── Memory usage: 2.3 GB / 4 GB (58%)
├── Edge function workers: 8/16 (50%)
└── Queue depth: 23 items

UPTIME:
─────────────────────────────────────────────────────────

├── Current uptime: 14 days, 7 hours
├── Last restart: 2026-01-08 07:30:00 UTC
└── Reason: Scheduled maintenance

═══════════════════════════════════════════════════════════
```

### `system.heal` — Repair the System

**What it does:** Detects and fixes problems across all modules.

**Example:**
```
system.heal

System Healing
═══════════════════════════════════════════

Scanning for issues...

ISSUES DETECTED:
├── [Nexus] OpenAI provider timing out
├── [Brain] 3 stale connections in pool
└── [Vision] Log buffer 80% full

APPLYING FIXES:
├── [Nexus] Marking OpenAI as degraded, routing to Groq... ✓
├── [Brain] Clearing stale connections... ✓
└── [Vision] Flushing log buffer... ✓

POST-HEAL STATUS:
├── All modules responding ✓
├── Health score: 89% → 97% ✓
└── No critical issues remaining ✓

═══════════════════════════════════════════
HEALING COMPLETE
═══════════════════════════════════════════
```

### `system.backup` — Save System State

**What it does:** Creates a complete backup of the current system state.

**Example:**
```
system.backup

Creating System Backup
═══════════════════════════════════════════

Backing up:
├── Brain memories (hot).......... 12,456 records ✓
├── Brain memories (cold)......... 89,234 records ✓
├── Knowledge graph edges......... 156,789 records ✓
├── Defense rules................. 45 rules ✓
├── System configuration.......... 23 keys ✓
├── User preferences.............. 567 records ✓
└── Audit logs (30 days).......... 45,678 records ✓

Verifying backup integrity....... ✓
Compressing...................... ✓

═══════════════════════════════════════════
BACKUP COMPLETE

Backup ID: backup_20260122_1430
Size: 234 MB (compressed)
Location: /backups/daily/backup_20260122_1430
Expires: 2026-02-21 (30 days)

═══════════════════════════════════════════
```

### `system.restore` — Recover from Backup

**What it does:** Restores the system to a previous state.

**Example:**
```
system.restore backup_id:backup_20260120_0300

Restore Confirmation
═══════════════════════════════════════════

Backup: backup_20260120_0300
Created: 2026-01-20 03:00:00 UTC
Age: 2 days, 11 hours

WARNING: This will:
├── Replace all current memories with backup state
├── Overwrite configuration changes since backup
├── Reset knowledge graph to backup state
└── NOT affect audit logs (preserved)

Data that will be LOST:
├── 1,234 new memories (since backup)
├── 45 configuration changes
└── 567 new graph edges

Type RESTORE to confirm: RESTORE

Restoring...
├── Stopping active operations... ✓
├── Validating backup... ✓
├── Restoring brain_memory_hot... ✓
├── Restoring brain_memory_cold... ✓
├── Restoring graph_edges... ✓
├── Restoring configuration... ✓
├── Rebuilding indexes... ✓
├── Restarting modules... ✓

═══════════════════════════════════════════
RESTORE COMPLETE

Current state now matches: backup_20260120_0300
All modules healthy
═══════════════════════════════════════════
```

### `system.restart` — Restart Services

**What it does:** Restarts specific services or the entire system.

**Example (single service):**
```
system.restart service:nexus

Restarting Nexus Module
═══════════════════════════════════════════

├── Gracefully stopping nexus... ✓
├── Clearing provider connections... ✓
├── Resetting rate limit counters... ✓
├── Starting nexus... ✓
├── Health check... ✓

═══════════════════════════════════════════
NEXUS RESTARTED

Health: 99%
Uptime: 0 seconds
═══════════════════════════════════════════
```

**Example (full system):**
```
system.restart --all

Full System Restart
═══════════════════════════════════════════

WARNING: This will briefly interrupt all operations.
Estimated downtime: 30-60 seconds.

Type RESTART to confirm: RESTART

├── Notifying connected clients... ✓
├── Gracefully stopping all modules...
│   ├── Brain... ✓
│   ├── Decode... ✓
│   ├── Defense... ✓
│   ├── Nexus... ✓
│   ├── Vision... ✓
│   ├── Dream... ✓
│   └── System... ✓
├── Clearing all caches... ✓
├── Starting all modules...
│   ├── System... ✓
│   ├── Vision... ✓
│   ├── Defense... ✓
│   ├── Brain... ✓
│   ├── Nexus... ✓
│   ├── Decode... ✓
│   └── Dream... ✓
├── Running health checks... ✓

═══════════════════════════════════════════
SYSTEM RESTART COMPLETE

Total downtime: 43 seconds
All modules healthy
═══════════════════════════════════════════
```

### `system.config` — View/Update Configuration

**What it does:** Reads or modifies system configuration.

**Example (view):**
```
system.config

System Configuration
═══════════════════════════════════════════

GENERAL:
├── version: 3.11.1
├── environment: production
├── log_level: info
└── timezone: UTC

BRAIN:
├── hot_memory_ttl: 30 days
├── cold_migration_threshold: 0.3
├── embedding_model: text-embedding-3-small
└── max_recall_results: 20

NEXUS:
├── default_provider: groq
├── timeout_ms: 30000
├── cache_ttl_hours: 24
└── fallback_enabled: true

DEFENSE:
├── rate_limit_window: 60 seconds
├── max_requests_per_window: 100
├── bot_threshold: 0.7
└── auto_block_enabled: true

DREAM:
├── cycle_time: 03:00 UTC
├── max_duration_minutes: 60
├── mutation_enabled: true
└── email_report: true
```

**Example (update):**
```
system.config set brain.max_recall_results 30

Configuration Updated
═══════════════════════════════════════════

Key: brain.max_recall_results
Previous: 20
New: 30

Applied immediately. No restart required.
═══════════════════════════════════════════
```

### `system.shutdown` — Emergency Shutdown

**What it does:** Completely stops the substrate (requires double confirmation).

**Example:**
```
system.shutdown

═══════════════════════════════════════════════════════════
                    EMERGENCY SHUTDOWN
═══════════════════════════════════════════════════════════

WARNING: This will:
├── Stop all modules immediately
├── Disconnect all clients
├── Stop processing all queued items
└── Require manual restart to recover

This action is logged and cannot be undone.

First confirmation - Type SHUTDOWN: SHUTDOWN

Are you sure? Type CONFIRM SHUTDOWN: CONFIRM SHUTDOWN

Shutting down...
├── Notifying connected clients... ✓
├── Stopping brain... ✓
├── Stopping decode... ✓
├── Stopping defense... ✓
├── Stopping nexus... ✓
├── Stopping vision... ✓
├── Stopping dream... ✓
├── Stopping modernizer... ✓
├── Final backup created... ✓

═══════════════════════════════════════════════════════════
SUBSTRATE OFFLINE

Shutdown by: operator@company.com
Shutdown at: 2026-01-22 14:32:17 UTC
Backup ID: backup_shutdown_20260122_1432

To restart, access the Supabase console or deployment platform.
═══════════════════════════════════════════════════════════
```

### `system.version` — Version Information

**What it does:** Returns detailed version information.

**Example:**
```
system.version

Substrate Version Information
═══════════════════════════════════════════

Substrate:
├── Version: 3.11.1
├── Build: 2026.01.22-1430
├── Commit: abc1234
└── Environment: production

Modules:
├── Brain: 3.11.1
├── Decode: 3.11.1
├── Defense: 3.11.1
├── Nexus: 3.11.1
├── Vision: 3.11.1
├── Dream: 3.11.1
├── System: 3.11.1
└── Modernizer: 3.11.1

Dependencies:
├── Supabase: 2.45.0
├── Deno: 1.40.0
├── PostgreSQL: 15.4
└── pgvector: 0.5.1

Last Updated: 2026-01-22 07:30:00 UTC
═══════════════════════════════════════════
```

### `system.audit` — System Audit Log

**What it does:** Returns security and administrative events.

**Example:**
```
system.audit timeframe:24h

System Audit Log (Last 24 Hours)
═══════════════════════════════════════════

ADMINISTRATIVE ACTIONS:
─────────────────────────────────────────────
[14:30] system.restart (nexus) by operator@company.com
[12:15] system.config updated by operator@company.com
[08:00] system.backup (automatic daily)
[03:00] dream.cycle (automatic nightly)

SECURITY EVENTS:
─────────────────────────────────────────────
[14:25] defense.block 203.0.113.100 (credential stuffing)
[13:45] defense.alert HIGH: Anomaly detected
[11:30] defense.block 185.234.12.34 (bot activity)

ACCESS EVENTS:
─────────────────────────────────────────────
[14:32] Login: admin@company.com (success)
[14:28] Login: operator@company.com (success)
[13:12] Login: unknown@spam.com (failed x3, blocked)

MODERNIZER:
─────────────────────────────────────────────
[10:00] Proposal UP-2026-0122-001 created
[09:45] Proposal UP-2026-0121-002 applied (by operator)

STATISTICS:
├── Total events: 234
├── Security events: 45
├── Admin actions: 12
└── Errors: 0
═══════════════════════════════════════════
```

---

## The Self-Healing System

### How It Works

When problems are detected, System can automatically heal:

```
DETECTION → DIAGNOSIS → ACTION → VERIFICATION
     │           │          │           │
     ▼           ▼          ▼           ▼
  Vision    Identify    Fix or     Confirm
  monitors  root cause  escalate   resolution
```

### Automatic Healing Scenarios

| Scenario | Detection | Action |
|----------|-----------|--------|
| Stale connections | Pool > 80% | Clear and recreate |
| Memory pressure | RAM > 90% | Flush caches |
| Provider failure | Timeouts | Route to fallback |
| Queue backup | Depth > 1000 | Scale workers |
| Health < 40% | Continuous monitoring | Emergency recovery |

### Manual Healing

For complex issues, operators can trigger targeted healing:

```
system.heal target:brain

Healing Brain Module
═══════════════════════════════════════════

Diagnosis:
├── Found 45 orphaned memories
├── Found 3 corrupted graph edges
└── Found memory fragmentation

Actions:
├── Removed orphaned memories... ✓
├── Repaired graph edges... ✓
├── Compacted memory tables... ✓
└── Rebuilt indexes... ✓

Result:
├── Brain health: 78% → 98%
└── Recall latency: 340ms → 87ms
═══════════════════════════════════════════
```

---

## Backup Strategy

### Automatic Backups

| Type | Frequency | Retention |
|------|-----------|-----------|
| **Hourly** | Every hour | 24 hours |
| **Daily** | 3:00 AM UTC | 30 days |
| **Weekly** | Sunday 3:00 AM | 90 days |
| **Monthly** | 1st of month | 1 year |

### What's Backed Up

```
BACKUP CONTENTS
═══════════════════════════════════════════

Core Data:
├── brain_memory_hot (all memories)
├── brain_memory_cold (all archived)
├── brain_graph_edges (all connections)
└── knowledge_base (all knowledge)

Configuration:
├── system_config (all settings)
├── defense_rules (all rules)
├── user_preferences (all users)
└── api_keys (encrypted)

State:
├── dream_state (dream eater state)
├── modernizer_plans (pending upgrades)
└── queue_state (pending jobs)

NOT Backed Up (regenerated):
├── Caches (rebuild on restore)
├── Active connections (reconnect)
└── Temporary files (ephemeral)
```

---

## Emergency Recovery

If the system becomes severely degraded:

```
system.emergency_recovery

═══════════════════════════════════════════════════════════
                   EMERGENCY RECOVERY
═══════════════════════════════════════════════════════════

Current State:
├── Health: 23% (CRITICAL)
├── Modules responding: 3/8
└── Error rate: 45%

This will:
├── Stop all operations immediately
├── Restore from most recent healthy backup
├── Restart all modules in safe mode
└── Alert all administrators

Proceed? Type EMERGENCY RECOVER: EMERGENCY RECOVER

Executing emergency recovery...
├── Stopping all modules... ✓
├── Finding healthy backup... 
│   └── Using: backup_20260122_0800 (6 hours ago)
├── Restoring data... ✓
├── Restarting in safe mode... ✓
├── Running diagnostics... ✓

═══════════════════════════════════════════════════════════
EMERGENCY RECOVERY COMPLETE

Health: 96%
All modules: HEALTHY
Data loss: ~6 hours of activity (since backup)

Safe mode enabled. Some features restricted.
Run 'system.safe_mode disable' when confirmed stable.
═══════════════════════════════════════════════════════════
```

---

## System Status Monitoring

```
substrate:// system.status --detailed

System Health Dashboard
═══════════════════════════════════════════

REAL-TIME METRICS:
─────────────────────────────────────────────

Requests/sec:    ████████████░░░░░░░░  123 req/s
CPU Usage:       ████████░░░░░░░░░░░░  42%
Memory Usage:    ██████████░░░░░░░░░░  54%
Database Conn:   ████████████████░░░░  82%
Queue Depth:     ███░░░░░░░░░░░░░░░░░  15 items

MODULE HEALTH:
─────────────────────────────────────────────

Brain       ██████████  98%  healthy
Decode      ██████████  96%  healthy
Defense     ██████████  99%  healthy
Nexus       ████████░░  82%  degraded ⚠️
Vision      ██████████  100% healthy
Dream       ██████████  95%  healthy
System      ██████████  97%  healthy
Modernizer  ██████████  93%  healthy

RECENT EVENTS:
─────────────────────────────────────────────

[now]    System health check: 96%
[2m ago] Brain dream cycle completed
[5m ago] Nexus: OpenAI latency elevated
[1h ago] Defense: Blocked 12 bot requests

Press Ctrl+C to exit live view
═══════════════════════════════════════════
```

---

## Common Questions

### "Who can access System commands?"

Only administrators with `governor` role. Commands are logged.

### "What if I accidentally shut down?"

Contact your hosting provider (Supabase dashboard or platform console) to restart.

### "How do I know if healing worked?"

Check health scores before and after:
```
system.heal
system.status
```

### "Can I schedule maintenance windows?"

Yes:
```
system.schedule_maintenance {
  start: "2026-01-25 02:00 UTC",
  duration: "2 hours",
  actions: ["restart", "backup", "heal"]
}
```

---

## Next Document

→ [17-DECODE-DEEP-DIVE.md](./17-DECODE-DEEP-DIVE.md) — The human-compatible interpreter
