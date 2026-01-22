# 04: The Terminal — How to Control the System

**Every Command You Can Run**

---

## What Is The Terminal?

The terminal is a command-line interface that lets you directly control the substrate. Think of it like the command prompt on a computer, but for AI operations.

It looks like this:
```
▓▓▓▓▓▓▓▓▓▓ substrate os v2026.01
◉ cognitive kernel loaded
◉ neural pathways initialized
◉ memory banks online
◉ dream-eater: standby
◉ defense grid: armed
◉ nexus router: connected
────────────────────────────────────────
type 'help' for commands

substrate:// _
```

---

## Command Structure

All commands follow this pattern:

```
module.action [arguments]
```

**Examples:**
- `brain.recall "what is promptfluid"` — Search brain memories
- `system.status` — Check system health
- `nexus.providers` — List AI providers
- `modernizer.propose` — Request improvement suggestions

---

## Complete Command Reference

### BRAIN Commands

| Command | What It Does |
|---------|--------------|
| `brain.recall [query]` | Search memories for matching content |
| `brain.store [content]` | Store new memory |
| `brain.reflect` | Trigger reflection on recent memories |
| `brain.synthesize` | Generate cross-domain insights |
| `brain.deep_think [topic]` | Extended reasoning on a topic |
| `brain.train [source]` | Batch ingest learning material |
| `brain.graph` | Build/view knowledge graph |
| `brain.status` | Brain module health |
| `brain.pulse` | Quick heartbeat check |

**Example Session:**
```
substrate:// brain.store "Series A closed at $5M valuation"
✓ Memory stored with confidence 0.9

substrate:// brain.recall "valuation"
Found 1 memory:
- "Series A closed at $5M valuation" (confidence: 0.9)

substrate:// brain.reflect
Triggering reflection cycle...
✓ Analyzed 47 memories, generated 3 insights
```

---

### DECODE Commands

| Command | What It Does |
|---------|--------------|
| `decode.chat [message]` | Natural language conversation |
| `decode.interpret [input]` | Parse ambiguous input |
| `decode.describe [subject]` | Explain something |
| `decode.pattern [input]` | Identify patterns |
| `decode.status` | Decode module health |
| `decode.pulse` | Quick heartbeat check |

**Example Session:**
```
substrate:// decode.chat "What's the system's current status?"
⟨System status: 8/8 modules active, overall health 94%, 
last learning cycle 12 minutes ago⟩

substrate:// decode.interpret "make it faster"
Interpretation: User likely requests performance optimization.
Possible targets: Nexus routing, Brain recall, Response latency.
```

---

### DEFENSE Commands

| Command | What It Does |
|---------|--------------|
| `defense.detect [request]` | Analyze request for bot behavior |
| `defense.analyze [ip]` | Threat analysis on IP address |
| `defense.rules` | List active defense rules |
| `defense.block [ip]` | Block an IP address |
| `defense.unblock [ip]` | Remove IP from blocklist |
| `defense.events` | Recent security events |
| `defense.stats` | Security statistics |
| `defense.status` | Defense module health |
| `defense.pulse` | Quick heartbeat check |

**Example Session:**
```
substrate:// defense.stats
Security Statistics (last 24h):
- Requests analyzed: 12,847
- Bots detected: 234 (1.8%)
- Blocked IPs: 12
- Threat level: LOW

substrate:// defense.events
Recent Events:
1. [14:32] Bot detected from 185.234.xx.xx - blocked
2. [14:28] Unusual request pattern from 92.xx.xx.xx - logged
3. [13:45] Failed auth attempt rate spike - alert sent
```

---

### NEXUS Commands

| Command | What It Does |
|---------|--------------|
| `nexus.route [prompt]` | Route prompt to best AI |
| `nexus.text [prompt]` | Generate text response |
| `nexus.providers` | List available AI providers |
| `nexus.switch [provider]` | Change primary provider |
| `nexus.health` | Provider health status |
| `nexus.status` | Nexus module health |
| `nexus.pulse` | Quick heartbeat check |

**Example Session:**
```
substrate:// nexus.providers
Available Providers:
1. Groq (primary) - HEALTHY - latency: 145ms
2. Cerebras (fallback) - HEALTHY - latency: 210ms
3. Together (fallback) - HEALTHY - latency: 320ms
4. DeepSeek (fallback) - DEGRADED - latency: 890ms

substrate:// nexus.text "Explain quantum computing in one sentence"
Response: "Quantum computing uses quantum mechanical phenomena 
like superposition to perform calculations that would be 
impractical for classical computers."
Model: groq/llama-3.3-70b | Latency: 156ms
```

---

### VISION Commands

| Command | What It Does |
|---------|--------------|
| `vision.dashboard` | Full system overview |
| `vision.health` | Health snapshot |
| `vision.metrics` | Performance metrics |
| `vision.events [count]` | Recent system events |
| `vision.errors` | Recent errors |
| `vision.status` | Vision module health |
| `vision.pulse` | Quick heartbeat check |

**Example Session:**
```
substrate:// vision.dashboard
╔══════════════════════════════════════════╗
║         SUBSTRATE OS v2026.01             ║
╠══════════════════════════════════════════╣
║ Health: 94/100 ████████████████████░░    ║
║ Modules: 8/8 active                       ║
║ Memory: 12,847 items (4.2GB)              ║
║ Last Learn: 12m ago                       ║
║ Last Dream: 6h ago                        ║
║ Requests Today: 8,432                     ║
╚══════════════════════════════════════════╝
```

---

### DREAM Commands

| Command | What It Does |
|---------|--------------|
| `dream.cycle` | Trigger full dream cycle |
| `dream.reflect` | Generate reflections |
| `dream.mutate` | Evolve internal structures |
| `dream.interpret` | Analyze recent dreams |
| `dream.feed [content]` | Input dream material |
| `dream.status` | Dream module health |
| `dream.pulse` | Quick heartbeat check |

**Example Session:**
```
substrate:// dream.cycle
Initiating dream cycle...
Phase 1: Gathering memories... ✓ (247 items)
Phase 2: Pattern analysis... ✓ (12 patterns found)
Phase 3: Synthesis... ✓ (3 insights generated)
Phase 4: Consolidation... ✓ (18 memories → cold storage)
Phase 5: Mutation... ✓ (mutation level: 4)
Dream cycle complete. System improved.
```

---

### SYSTEM Commands

| Command | What It Does |
|---------|--------------|
| `system.status` | Overall system status |
| `system.heal` | Trigger self-healing |
| `system.backup` | Create backup |
| `system.restore [id]` | Restore from backup |
| `system.config` | View configuration |
| `system.shutdown` | Graceful shutdown |
| `system.restart` | Restart all modules |
| `system.pulse` | Quick heartbeat check |

**Example Session:**
```
substrate:// system.status
System Status: HEALTHY
─────────────────────────────
Brain:     ████████████ 98%
Decode:    ████████████ 95%
Defense:   ████████████ 100%
Nexus:     ████████████ 92%
Vision:    ████████████ 96%
Dream:     ████████████ 88%
System:    ████████████ 100%
Modernizer:████████████ 94%
─────────────────────────────
Overall: 95% | Uptime: 14d 6h

substrate:// system.heal
Initiating self-healing...
Testing Brain... ✓
Testing Decode... ✓
Testing Defense... ✓
Testing Nexus... ⚠ (provider latency high)
Testing Vision... ✓
Testing Dream... ✓
Testing System... ✓
Testing Modernizer... ✓
Healing complete. 1 issue flagged for review.
```

---

### MODERNIZER Commands

| Command | What It Does |
|---------|--------------|
| `modernizer.propose` | Generate improvement suggestions |
| `modernizer.apply [plan_id]` | Apply approved upgrade |
| `modernizer.rollback [plan_id]` | Undo an upgrade |
| `modernizer.archived` | Scan archived code for reuse |
| `modernizer.plans` | List pending upgrade plans |
| `modernizer.history` | Upgrade history |
| `modernizer.status` | Modernizer module health |
| `modernizer.pulse` | Quick heartbeat check |

**Example Session:**
```
substrate:// modernizer.propose
Analyzing codebase for improvements...

Proposal Generated:
─────────────────────────────────────
ID: plan_a3f2c1
Title: "Enhance Brain Recall Performance"
Impact: MEDIUM
Risk: LOW

Description:
The brain.recall function currently scans all memories
linearly. Adding semantic indexing could improve speed by 60%.

Changes Required:
1. Add vector embeddings to brain_memory_hot table
2. Implement semantic similarity search
3. Update recall function to use embeddings

Estimated Implementation: 2 hours
─────────────────────────────────────
To apply: modernizer.apply plan_a3f2c1
```

---

## Special Commands

| Command | What It Does |
|---------|--------------|
| `help` | Show all commands |
| `help [module]` | Show commands for specific module |
| `clear` | Clear terminal screen |
| `history` | Show command history |
| `version` | Show system version |
| `whoami` | Show current user/role |

---

## Command Tips

### Autocomplete
Start typing and press Tab to autocomplete:
```
substrate:// bra<TAB>
substrate:// brain.
```

### History
Press Up/Down arrows to navigate command history.

### Chaining
You can run multiple commands with semicolons:
```
substrate:// system.status; brain.status; nexus.status
```

---

## Role-Based Access

Not everyone can run all commands:

| Role | Brain | Decode | Defense | Nexus | Vision | Dream | System | Modernizer |
|------|-------|--------|---------|-------|--------|-------|--------|------------|
| Observer | Read | Read | Read | Read | Read | Read | Read | Read |
| Operator | Full | Full | Full | Full | Full | Full | Limited | Limited |
| Governor | Full | Full | Full | Full | Full | Full | Full | Full |

**Observer:** Can view everything but not change anything
**Operator:** Can run day-to-day operations
**Governor:** Can make system-level changes (backups, upgrades, etc.)

---

## Next Document

→ [05-THE-MODERNIZER.md](./05-THE-MODERNIZER.md) — Deep dive into self-improvement
