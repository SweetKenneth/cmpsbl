# Atlas Command Interface

**Version:** 7.5.3  
**Module:** Atlas Control Plane  
**Status:** Production

---

## Overview

Atlas Command is the **conversational control interface** for the Substrate OS. It allows operators to manage the entire system through natural language commands instead of navigating complex dashboards.

Think of Atlas as your AI operations assistant — tell it what you want, and it handles the rest.

---

## Getting Started

### Accessing Atlas Command

1. Navigate to **CMPSBL OS → Evolve → Atlas**
2. Select the **Command** tab
3. Type your command or use quick action buttons

### Your First Commands

```
help                    Show all available commands
show status             Check system health
activate SEBA           Enable evolution engine
```

---

## Command Categories

### 🔄 SEBA Control

Control the Self-Evolving Bounded Agent:

| Command | Description |
|---------|-------------|
| `activate SEBA` | Enable SEBA in advisory mode |
| `activate SEBA in autonomous mode` | Enable 24/7 evolution |
| `deactivate SEBA` | Pause all evolution |
| `run evolution cycle` | Trigger one analysis cycle |

**Example:**
```
> activate SEBA in advisory mode
✓ SEBA activated in advisory mode. All evolution proposals will require your approval before execution.
```

### 🎛️ Mode Control

Set the system operating mode:

| Command | Effect |
|---------|--------|
| `set advisory mode` | All proposals require approval |
| `set autonomous mode` | Low-risk proposals auto-execute |
| `set manual mode` | All automation disabled |
| `set emergency mode` | Full shutdown |

### ⚡ Capabilities

Toggle individual substrate modules:

| Command | Module |
|---------|--------|
| `enable CLM` | Continuous Learning Manager |
| `disable dream` | Dream-Eater ingestion |
| `enable encoded` | Encoded code agent |
| `enable nexus` | Nexus router |
| `disable defense` | Defense hardening |

### 📊 Observability

Monitor system health and activity:

| Command | Shows |
|---------|-------|
| `show status` | Full system health overview |
| `show metrics` | Usage and performance stats |
| `show Ripple logs` | Recent Ripple bus events |
| `show brain logs` | Cognitive processing events |
| `show system logs` | General system activity |

**Example Output:**
```
> show status

🔮 Atlas Control Plane Status

Mode: ADVISORY
Health: 94%

SEBA Agent:
• Phase: idle
• Cycles: 12
• Pending: 2 proposals

Active Capabilities:
• clm
• encoded
• nexus_routing
• ripple_bus
```

### ✅ Proposal Management

Handle pending evolution proposals:

| Command | Action |
|---------|--------|
| `approve pending proposals` | Approve all pending |
| `reject proposals` | Reject all pending |

### 🧠 Memory Operations

Manage the cognitive memory store:

| Command | Action |
|---------|--------|
| `show memories` | List recent memories |
| `query memories [topic]` | Search for specific topics |
| `consolidate memories` | Merge redundant entries |
| `prune memories` | Remove expired/low-value |

### 📝 Autoblog Control

Manage automated content generation:

| Command | Action |
|---------|--------|
| `check autoblog queue` | View pending posts |
| `pause autoblog` | Suspend generation |
| `resume autoblog` | Resume generation |

---

## Quick Actions

The Command interface includes one-click buttons for common operations:

- **Status** — Instant health check
- **SEBA On** — Activate evolution
- **Run Cycle** — Trigger analysis
- **Help** — Show commands

---

## Understanding Responses

### Success Indicators

✓ — Operation completed successfully
📊 — Data/metrics displayed
📋 — List or logs returned
🔮 — Status information

### Error Messages

If a command fails, Atlas provides:
1. Clear error description
2. Suggested alternatives
3. Quick-action buttons for common fixes

---

## Best Practices

### For Daily Operations

1. Start with `show status` to assess system health
2. Review pending proposals before approving
3. Run evolution cycles during low-traffic periods

### For Incident Response

1. `set emergency mode` to halt all automation
2. `show brain logs` to investigate issues
3. `deactivate SEBA` to prevent further changes
4. Address the issue, then `set advisory mode` to resume

### For Maintenance

1. `prune memories` weekly to remove stale data
2. `consolidate memories` monthly to optimize storage
3. `check autoblog queue` to ensure content pipeline

---

## Security Notes

- Commands are logged for audit purposes
- High-impact operations require operator authentication
- Sensitive data is automatically redacted from logs
- Rate limiting prevents abuse (10 commands/minute)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Send command |
| `Shift+Enter` | New line (for complex commands) |
| `↑` / `↓` | Command history (coming soon) |

---

## Related Documentation

- [SEBA Module](/docs/library/66-SEBA-MODULE.md) — Evolution engine details
- [Evolution Observability](/docs/library/79-EVOLUTION-OBSERVABILITY.md) — Monitoring evolution
- [System Architecture](/docs/library/02-SYSTEM-ARCHITECTURE.md) — Overall system design

---

*Atlas Command v7.2.0 — Prometheus*
