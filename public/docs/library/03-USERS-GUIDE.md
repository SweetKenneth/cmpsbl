# CMPSBL OS Substrate — User's Guide

**Version 6.3.0 | Scientific Publication**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | CMPSBL-LIB-003 |
| **Version** | v6.3.0 |
| **Last Updated** | January 2026 |
| **Classification** | Public Research Document |

---

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMPSBL OS SUBSTRATE                          │
├─────────────────────────────────────────────────────────────────┤
│  Created By:        Kenneth E Sweet Jr                          │
│  Organization:      PromptFluid®                                │
├─────────────────────────────────────────────────────────────────┤
│  For licensing or acquisition inquiries:                        │
│  Email: Dev@CMPSBL.com | Phone: (760) FLUID-AI           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Introduction

This guide provides operational instructions for working with the CMPSBL OS Substrate. It covers the primary interfaces, command patterns, and workflows available to users and developers.

---

## 2. Interfaces

### 2.1 Terminal Interface

The primary interface for substrate interaction is the Terminal, providing direct command execution across all 14 modules.

**Access:** Navigate to `/os` in the web interface.

**Capabilities:**
- Execute 260+ registered commands
- Real-time system feedback
- Command history and auto-completion
- Alias and macro support

### 2.2 SDK Interface

Programmatic access is provided through the TypeScript SDK:

```typescript
import { substrate } from '@/lib/substrate';

// Example: Store a memory
const result = await substrate.invoke('brain', 'remember', {
  content: 'Important information',
  memory_type: 'doctrine'
});

// Example: Check system health
const health = await substrate.invoke('system', 'health');
```

### 2.3 API Interface

All substrate operations are accessible via REST API through the unified endpoint.

---

## 3. Command Reference

### 3.1 Command Syntax

Commands follow a consistent pattern:

```
<module>.<action> [--flag] [--param=value]
```

**Examples:**
- `system.status` — Check system status
- `brain.recall --query="user preferences"` — Search memories
- `nexus.route --provider=primary` — Route AI request

### 3.2 Module Commands Overview

#### SYSTEM Module

| Command | Description |
|---------|-------------|
| `system.status` | Overall system status |
| `system.health` | Detailed health metrics |
| `system.diagnostics` | Full diagnostics (add `--full` for extended) |
| `system.resilience` | Circuit breaker states |
| `system.modules` | List all modules |
| `system.backup` | Create system backup |
| `system.restore` | Restore from backup |
| `system.heal` | Trigger auto-heal |

#### BRAIN Module

| Command | Description |
|---------|-------------|
| `brain.status` | Memory system status |
| `brain.remember` | Store a memory |
| `brain.recall` | Search memories |
| `brain.reflect` | Trigger reflection |
| `brain.tier` | Run memory tiering |
| `brain.graph` | Knowledge graph summary |
| `brain.graph --inspect` | Detailed graph view |
| `brain.graph --stats` | Graph metrics |
| `brain.graph --export` | Export graph JSON |

#### NEXUS Module

| Command | Description |
|---------|-------------|
| `nexus.status` | Router status |
| `nexus.route` | Route a request |
| `nexus.providers` | List available providers |
| `nexus.health` | Provider health status |
| `nexus.fallback` | Test fallback chain |

#### VISION Module

| Command | Description |
|---------|-------------|
| `vision.pulse` | System pulse check |
| `vision.health` | Observability health |
| `vision.inspect` | Inspect observability state |
| `vision.inspect --links` | Include endpoint links |
| `vision.diagnostics` | Observability diagnostics |
| `vision.diagnostics --full` | Extended diagnostics |

#### CORTEX Module

| Command | Description |
|---------|-------------|
| `cortex.status` | Orchestrator status |
| `cortex.world` | Module world snapshot |
| `cortex.world --dag` | Dependency graph |
| `cortex.world --roles` | Modules by role |
| `cortex.world --eligible` | Upgrade-eligible modules |
| `cortex.inventory` | Module inventory |
| `cortex.inventory --eligible` | Eligible modules only |
| `cortex.plan` | Evolution sequences |
| `cortex.plan --eligible` | Ready-to-run sequences |
| `cortex.dispatch` | Dispatch operation |

#### DEFENSE Module

| Command | Description |
|---------|-------------|
| `defense.status` | Security status |
| `defense.scan` | Scan for threats |
| `defense.rules` | List active rules |
| `defense.block` | Block an IP/pattern |
| `defense.allow` | Whitelist an IP/pattern |

#### DREAM Module

| Command | Description |
|---------|-------------|
| `dream.status` | Dream system status |
| `dream.cycle` | Trigger dream cycle |
| `dream.feed` | Feed new content |
| `dream.mood` | Check system mood |
| `dream.mutations` | List active mutations |

#### MODERNIZER Module

| Command | Description |
|---------|-------------|
| `modernizer.status` | Upgrade engine status |
| `modernizer.scan` | Scan for improvements |
| `modernizer.proposals` | List pending proposals |
| `modernizer.apply` | Apply a proposal |
| `modernizer.shadow` | Run shadow test |
| `modernizer.refresh` | Refresh metrics |

#### ACCESS Module

| Command | Description |
|---------|-------------|
| `access.status` | Access module status |
| `access.register` | Register a developer |
| `access.create_key` | Generate API key |
| `access.revoke` | Revoke an API key |
| `access.entitlements` | List entitlements |
| `access.products` | List available products |

#### INTEGRATION Module

| Command | Description |
|---------|-------------|
| `integration.status` | Integration status |
| `integration.adapters` | List adapters |
| `integration.discover` | Discover connections |
| `integration.connect` | Establish connection |

#### RIPPLE Module

| Command | Description |
|---------|-------------|
| `ripple.status` | Message bus status |
| `ripple.jobs` | List pending jobs |
| `ripple.events` | List recent events |
| `ripple.publish` | Publish an event |
| `ripple.work` | Process next job |
| `ripple.drain` | Drain queue |

#### CORE Module

| Command | Description |
|---------|-------------|
| `core.status` | Kernel status |
| `core.jobs` | Scheduler jobs |
| `core.state` | System state |
| `core.circuits` | Circuit breaker status |

#### DECODE Module

| Command | Description |
|---------|-------------|
| `decode.status` | Interface status |
| `decode.parse` | Parse intent |
| `decode.route` | Route message |

---

## 4. Common Workflows

### 4.1 Health Monitoring

Check overall system health:

```
system.status
system.health
system.diagnostics --full
```

### 4.2 Memory Operations

Store and retrieve memories:

```
brain.remember --content="User prefers dark mode" --type=preference
brain.recall --query="user preferences"
brain.tier
```

### 4.3 AI Routing

Route requests through the multi-provider system:

```
nexus.providers
nexus.route --prompt="Summarize this document"
nexus.health
```

### 4.4 Observability

Monitor system behavior:

```
vision.pulse
vision.inspect --links
vision.diagnostics --full
```

### 4.5 Knowledge Graph Exploration

Explore the semantic network:

```
brain.graph
brain.graph --stats
brain.graph --inspect
brain.graph --export
```

### 4.6 Evolution Management

Manage system improvements:

```
modernizer.scan
modernizer.proposals
cortex.plan --eligible
cortex.world --dag
```

---

## 5. Best Practices

### 5.1 Health Monitoring

- Run `system.status` before critical operations
- Monitor circuit breaker states with `system.resilience`
- Use `vision.pulse` for real-time health checks

### 5.2 Memory Management

- Regularly run `brain.tier` to optimize memory placement
- Use appropriate `memory_type` for categorization
- Monitor hot tier capacity

### 5.3 Provider Routing

- Check `nexus.health` before high-volume operations
- Monitor fallback patterns
- Use provider-specific routing when latency matters

### 5.4 Security

- Review `defense.status` regularly
- Monitor threat scores and blocked requests
- Keep rules updated

### 5.5 Evolution Safety

- Always review proposals before applying
- Use shadow testing for significant changes
- Monitor outcomes after application

---

## 6. Troubleshooting

### 6.1 Module Not Responding

```
# Check specific module health
system.health

# Check circuit breaker state
system.resilience

# Attempt auto-heal
system.heal --module=<module_name>
```

### 6.2 Memory Retrieval Issues

```
# Check memory status
brain.status

# Verify tier distribution
brain.tier

# Test recall directly
brain.recall --query="test"
```

### 6.3 Routing Failures

```
# Check provider status
nexus.providers

# Test fallback chain
nexus.fallback

# Verify health scores
nexus.health
```

### 6.4 Event Processing Delays

```
# Check message bus status
ripple.status

# View pending jobs
ripple.jobs

# Process queue manually
ripple.work
```

---

## 7. Terminal Features

### 7.1 Aliases

Common command shortcuts:

| Alias | Expands To |
|-------|------------|
| `st` | `system.status` |
| `ll` | `system.modules` |
| `h` | `system.health` |

### 7.2 Macros

Execute command sequences:

```
@health_check    # Runs: system.status, system.health, vision.pulse
@daily_reflect   # Runs: brain.reflect, dream.cycle
```

### 7.3 Watch Mode

Continuous monitoring:

```
watch system.status     # Update every 5 seconds
watch --interval=10 nexus.health
```

### 7.4 Help System

Access documentation:

```
help                    # General help
help system             # Module-specific help
help brain.recall       # Command-specific help
```

---

## 8. SDK Usage Examples

### 8.1 Basic Invocation

```typescript
import { substrate } from '@/lib/substrate';

// Simple command
const status = await substrate.invoke('system', 'status');

// Command with parameters
const memories = await substrate.invoke('brain', 'recall', {
  query: 'user preferences',
  limit: 10
});

// Command with flags
const diagnostics = await substrate.invoke('system', 'diagnostics', {
  full: true
});
```

### 8.2 Error Handling

```typescript
try {
  const result = await substrate.invoke('brain', 'remember', {
    content: 'Important fact'
  });
  
  if (!result.success) {
    console.error('Operation failed:', result.message);
  }
} catch (error) {
  console.error('Substrate error:', error);
}
```

### 8.3 Module Shortcuts

```typescript
// Using module namespaces
await substrate.brain.status();
await substrate.brain.recall({ query: 'test' });
await substrate.nexus.providers();
await substrate.system.health();
```

---

## 9. Configuration

### 9.1 Proof Mode

The substrate can operate in proof mode (read-only):

```
# Check if proof mode is active
system.status

# Proof mode restricts write operations
```

### 9.2 Environment Variables

Key configuration is managed through environment:

| Variable | Purpose |
|----------|---------|
| `SUBSTRATE_MODE` | Operating mode (live/sandbox) |
| `PROOF_MODE` | Read-only operation flag |
| Provider keys | AI provider credentials |

---

## 10. Getting Help

### 10.1 Built-in Help

```
help                    # Full command list
whoami                  # System identity info
version                 # Version information
```

### 10.2 Contact Support

For licensing, technical support, or acquisition inquiries:

| Contact | Details |
|---------|---------|
| **Email** | promptfluid@gmail.com |
| **Phone** | (214) 548-0883 |
| **Web** | https://promptfluid.com |

---

*CMPSBL OS Substrate v5.5.0*
*© 2025-2026 PromptFluid®. All rights reserved.*
