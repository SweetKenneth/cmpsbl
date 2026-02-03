# Atlas Control Plane — Internal Engineering Guide

**Version:** 7.2.0  
**Codename:** Prometheus  
**Last Updated:** 2026-02-03  
**Audience:** Internal Engineers, Operators, Auditors  
**Classification:** INTERNAL — Eyes Only

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Secrets](#architecture-secrets)
3. [Conversational Command System](#conversational-command-system)
4. [Capability Gate System](#capability-gate-system)
5. [Action Card Workflow](#action-card-workflow)
6. [Audit Trail & Trace IDs](#audit-trail--trace-ids)
7. [Mode System](#mode-system)
8. [Security Considerations](#security-considerations)
9. [Database Schema](#database-schema)
10. [Command Reference](#command-reference)
11. [Troubleshooting](#troubleshooting)
12. [Future Roadmap](#future-roadmap)

---

## Overview

Atlas is the **centralized control plane** for the Substrate OS. It serves as the single governance layer through which all privileged operations must pass. Atlas provides:

1. **Conversational Control** — Natural language command processing via `atlasInterpreter`
2. **Capability Gating** — Enable/disable substrate modules at runtime
3. **Action Cards** — Approve/reject workflow for high-impact operations
4. **Mandatory Dry Runs** — Preview all changes before execution
5. **Full Audit Logging** — Every operation logged with `trace_id` and secret redaction

**Key Insight:** Atlas is NOT just a UI — it's the enforcement layer. Even programmatic calls through SEBA or CLM are subject to Atlas policies.

---

## Architecture Secrets

### The Singleton Pattern

```typescript
class AtlasControlPlane {
  private static instance: AtlasControlPlane;
  
  static getInstance(): AtlasControlPlane {
    if (!AtlasControlPlane.instance) {
      AtlasControlPlane.instance = new AtlasControlPlane();
    }
    return AtlasControlPlane.instance;
  }
}

export const atlas = AtlasControlPlane.getInstance();
```

**Why singleton?** Ensures consistent state across all imports. React components, terminal commands, edge functions — all see the same Atlas state.

### State Persistence Strategy

Atlas uses a **dual-layer persistence** model:

| Layer | Storage | Purpose | Latency |
|-------|---------|---------|---------|
| In-Memory | `this.state` | Fast lookups during execution | <1ms |
| Database | `brain_memories` | Cross-session persistence | ~50ms |

**Secret:** We store capabilities in `brain_memories` as a key-value store (not a dedicated table) to avoid schema changes:

```typescript
await supabase.from('brain_memories').upsert({
  content: 'atlas_capabilities',
  memory_type: 'system_config',
  metadata: { seba: true, clm: false, ... }
});
```

### Command Interpreter Flow

```
User Input → Parse (regex patterns) → Extract Entities → Route to Handler → Execute → Audit → Response
```

The interpreter uses **pattern matching** with confidence scoring:

```typescript
const COMMAND_PATTERNS = [
  {
    patterns: [/\b(activate|enable)\s+seba\b/i],
    category: 'seba_control',
    confidence: 0.85,
    extractEntities: (match, input) => ({ module: 'seba', action: 'enable' })
  }
];
```

**Fallback behavior:** Unknown commands return suggestions to help the user.

---

## Conversational Command System

### Supported Command Categories

| Category | Examples | Handler |
|----------|----------|---------|
| `seba_control` | "activate SEBA", "deactivate evolution" | `handleSEBAControl` |
| `capability_toggle` | "enable CLM", "disable dream" | `handleCapabilityToggle` |
| `mode_change` | "set advisory mode", "switch to manual" | `handleModeChange` |
| `logs_view` | "show Ripple logs", "view system events" | `handleLogsView` |
| `metrics_query` | "show me metrics", "display telemetry" | `handleMetricsQuery` |
| `cycle_run` | "run evolution cycle", "trigger SEBA" | `handleCycleRun` |
| `status_check` | "what's the status?", "system health" | `handleStatusCheck` |
| `proposal_action` | "approve pending proposals", "reject changes" | `handleProposalAction` |
| `memory_operations` | "query memories", "consolidate memories" | `handleMemoryOps` |
| `brain_control` | "scan brain", "prune old memories" | `handleBrainControl` |
| `autoblog` | "check autoblog queue", "pause autoblog" | `handleAutoblog` |
| `help` | "help", "what can you do?" | `handleHelp` |

### Entity Normalization

The interpreter normalizes fuzzy user input to canonical identifiers:

```typescript
// User says: "enable dream eater"
// normalizeCapability("dream eater") → "dream_eater"
// normalizeCapability("CLM") → "clm"
// normalizeCapability("ripple") → "ripple_bus"
```

### Confidence Scoring

Each parsed command includes a confidence score (0.0 - 1.0):

- **≥0.85**: Direct regex match, execute immediately
- **0.5-0.84**: Partial match, execute with confirmation
- **<0.5**: Unknown, show suggestions

---

## Capability Gate System

### Gate Execution Flow

```
Request → Check Capability Enabled → Check Mode Policy → Dry Run → Execute → Audit
```

```typescript
import { checkGate, executeWithGate } from '@/lib/atlas';

// Check if operation is allowed
const gateResult = await checkGate({
  capability: 'seba',
  operation: 'evolution_cycle',
  risk: 'medium'
});

if (gateResult.allowed) {
  // Safe to proceed
  await executeWithGate({
    capability: 'seba',
    operation: 'evolution_cycle',
    executor: async () => sebaAgent.runCycle()
  });
}
```

### Mode-Based Policies

| Mode | SEBA Auto-Approve | High-Impact Allowed | User Approval Required |
|------|-------------------|---------------------|----------------------|
| `autonomous` | Yes (if confidence ≥ threshold) | Yes | No |
| `advisory` | No | Yes (with approval) | Yes |
| `manual` | No | No | Always |
| `emergency` | No | No | All features disabled |

---

## Action Card Workflow

Action Cards are approval tokens for high-impact operations.

### Card Lifecycle

```
Created → Pending → Approved/Rejected → Executed (if approved)
```

### Card Structure

```typescript
interface ActionCard {
  id: string;
  type: 'evolution' | 'config_change' | 'capability_toggle' | 'data_mutation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  reversible: boolean;
  dryRunResult?: { success: boolean; preview: string; affectedModules: string[] };
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  createdAt: string;
  expiresAt: string;  // 24-hour expiry
}
```

### Approval Rules

- **Low/Medium impact:** Can be auto-approved in autonomous mode
- **High/Critical impact:** Always requires human approval (even in autonomous mode)
- **Advisory mode:** SEBA cannot approve any high-impact cards
- **Expired cards:** Automatically rejected after 24 hours

---

## Audit Trail & Trace IDs

### Audit Entry Structure

```typescript
interface AuditEntry {
  id: string;
  traceId: string;            // UUID for request correlation
  action: string;             // What happened
  module: string;             // Which module
  actor: 'user' | 'seba' | 'system' | 'clm';
  result: 'success' | 'failure' | 'blocked';
  metadata: Record<string, unknown>;
  secretsRedacted: boolean;   // True if secrets were found and redacted
  timestamp: string;
}
```

### Secret Redaction

Atlas automatically redacts sensitive data from audit logs:

```typescript
const secretPatterns = ['key', 'token', 'password', 'secret', 'credential'];

// Before: { api_key: 'sk_live_xxx', count: 5 }
// After:  { api_key: '[REDACTED]', count: 5 }
```

### Trace ID Correlation

Every operation receives a `traceId` that can be used to:
1. Correlate frontend request → backend execution
2. Link evolution proposals → stamps → receipts
3. Debug multi-step operations

---

## Mode System

### Mode Definitions

| Mode | Description | Use Case |
|------|-------------|----------|
| `autonomous` | Full auto-execution with bounded limits | Hands-off operation |
| `advisory` | Proposals require human approval | Default production mode |
| `manual` | All operations require explicit commands | Debugging/maintenance |
| `emergency` | All autonomous features disabled | Incident response |

### Mode Transitions

```typescript
// Via command interpreter
atlasInterpreter.parse("set advisory mode");
// → { category: 'mode_change', entities: { mode: 'advisory' } }

// Programmatic
await atlas.setMode('advisory', 'user');
```

---

## Security Considerations

### Access Control

Atlas itself is protected by role-based access:

1. **Operators:** Full Atlas access (toggle capabilities, approve proposals, run cycles)
2. **Viewers:** Read-only access to status and logs
3. **System:** Internal substrate components (SEBA, CLM)

### Rate Limiting

The conversational interface implements per-session rate limiting:

- Max 10 commands per minute
- Complex operations (cycle runs) have 60-second cooldown
- Bulk approvals limited to 10 cards per action

### Injection Prevention

Command input is sanitized before processing:

```typescript
const trimmedInput = input.trim().slice(0, 500);  // Max 500 chars
// Regex patterns only match expected tokens
```

---

## Database Schema

Atlas uses existing tables rather than creating new ones:

| Table | Purpose | Atlas Usage |
|-------|---------|-------------|
| `brain_memories` | KV store for config | Capability states |
| `brain_events` | Event log | Audit entries |
| `evolution_proposals` | SEBA proposals | Pending approvals |
| `lovable_ai_usage` | Usage tracking | Free tier enforcement |

### Key Queries

```sql
-- Get Atlas audit log
SELECT * FROM brain_events 
WHERE module = 'atlas' 
ORDER BY created_at DESC 
LIMIT 50;

-- Get capability states
SELECT metadata FROM brain_memories 
WHERE memory_type = 'system_config' 
AND content = 'atlas_capabilities';

-- Get pending action cards (from proposals)
SELECT * FROM evolution_proposals 
WHERE status = 'pending_review'
ORDER BY created_at DESC;
```

---

## Command Reference

### Quick Reference

```
# SEBA Control
activate SEBA                     Enable SEBA in advisory mode
activate SEBA in autonomous mode  Enable SEBA in 24/7 mode
deactivate SEBA                   Disable SEBA
run evolution cycle               Trigger one cycle

# Mode Control
set advisory mode                 All proposals need approval
set autonomous mode               Allow auto-execution
set manual mode                   Disable all automation
set emergency mode                Full shutdown

# Capabilities
enable CLM                        Turn on Continuous Learning
disable dream                     Turn off Dream-Eater
enable encoded                    Activate Encoded agent

# Observability
show status                       System health overview
show Ripple logs                  View Ripple bus events
show metrics                      Display telemetry
show brain logs                   View cognitive events

# Proposals
approve pending proposals         Approve all pending
reject proposals                  Reject all pending

# Memory Operations
show memories                     List recent memories
query memories                    Search memory store
consolidate memories              Merge redundant entries
prune memories                    Remove expired entries

# Autoblog
check autoblog queue              View pending posts
pause autoblog                    Suspend generation
resume autoblog                   Resume generation

# Help
help                              Show command reference
```

---

## Troubleshooting

### "Command not recognized"

**Cause:** Input doesn't match any pattern.

**Solution:** Use simpler phrasing or check `help` for exact syntax.

### SEBA won't activate

**Cause:** Capability disabled or insufficient permissions.

**Solution:** Check Atlas mode, verify operator login.

### Logs not showing

**Cause:** No events for that module in the last 24 hours.

**Solution:** Try broader query like "show system logs".

### Approval stuck

**Cause:** Action card expired (24-hour limit).

**Solution:** Generate new proposal with `run evolution cycle`.

---

## Future Roadmap

### Planned Features

1. **AI-Enhanced Parsing** — Use LLM for fuzzy command understanding
2. **Voice Control** — Speech-to-text integration
3. **Multi-Agent Coordination** — Atlas as orchestrator for multiple SEBAs
4. **Predictive Actions** — Suggest commands based on patterns
5. **Visual Command Builder** — Drag-and-drop command construction

### Integration Points

- **Decode Module:** Already using for personality-aware responses
- **Nexus Router:** Route complex commands to specialized handlers
- **Vision Metrics:** Visual dashboard generation from commands

---

## Related Documentation

- `/docs/internal/13-SEBA-EVOLVE-OPERATOR-GUIDE.md` — SEBA operation
- `/docs/library/79-EVOLUTION-OBSERVABILITY.md` — Public observability
- `/docs/internal/02-EVOLUTION-ENGINE.md` — Evolution pipeline internals

---

*This document is classified INTERNAL. Do not expose command patterns, capability IDs, or audit schemas externally.*
