# 03: The Modules — The 8 Building Blocks

**Everything the Substrate Can Do**

---

## The Module System Explained

Think of the substrate as a toolbox with 8 specialized tools. Each tool (module) does one category of things really well.

```
┌─────────────────────────────────────────────────────────┐
│                    THE SUBSTRATE                         │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  BRAIN  │ │ DECODE  │ │ DEFENSE │ │  NEXUS  │       │
│  │ Memory  │ │Interface│ │Security │ │ Routing │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ VISION  │ │  DREAM  │ │ SYSTEM  │ │MODERNIZE│       │
│  │ Observe │ │ Evolve  │ │ Control │ │ Improve │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Module 1: BRAIN

**What It Does:** Memory, learning, and knowledge management

**Plain English:** This is where the AI stores what it knows and learns new things.

### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `recall` | Search memories | "What do you know about X?" |
| `store` | Save new memory | "Remember that Y happened" |
| `train` | Ingest batch learning | Load a dataset of knowledge |
| `reflect` | Analyze patterns | "What patterns do you see?" |
| `synthesize` | Generate insights | "Combine what you've learned" |
| `deep_think` | Extended reasoning | "Think deeply about this problem" |
| `dream` | Run consolidation cycle | Nighttime memory organization |

### Why It Matters

Without Brain, AI has no persistent knowledge. Every conversation starts from zero. With Brain, AI accumulates expertise over time.

---

## Module 2: DECODE

**What It Does:** Human-to-machine translation layer

**Plain English:** This is how humans talk to the system in natural language and get structured responses back.

### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `chat` | Conversational interface | Natural language queries |
| `interpret` | Parse ambiguous input | "What did the user really mean?" |
| `describe` | Explain system state | "Describe what's happening" |
| `pattern` | Identify patterns in input | "What kind of request is this?" |

### The Special Rules

Decode has strict "personality" rules:
- **No imperatives:** Doesn't say "you should do X"
- **No identity claims:** Doesn't say "I am..."
- **No synthetic emotion:** Doesn't pretend to feel things
- **No agency claims:** Doesn't claim to make decisions

**Why?** This makes the system safe, predictable, and honest about what it is.

---

## Module 3: DEFENSE

**What It Does:** Security, bot detection, threat analysis

**Plain English:** This is the security guard that protects the system from attacks and abuse.

### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `detect` | Analyze for bot behavior | "Is this request from a human or bot?" |
| `analyze` | Threat assessment | "Is this IP address suspicious?" |
| `block` | Add to blocklist | Block a known attacker |
| `rules` | Manage security rules | Create/update defense rules |
| `event` | Log security event | Record a suspicious activity |

### What It Protects Against

- **Bot attacks:** Automated scripts trying to abuse the system
- **Credential stuffing:** Attackers trying stolen passwords
- **DDoS:** Overwhelming the system with traffic
- **Prompt injection:** Malicious prompts trying to manipulate AI
- **Data exfiltration:** Attempts to extract private data

---

## Module 4: NEXUS

**What It Does:** Multi-provider AI routing and model management

**Plain English:** This is the switchboard that connects to different AI providers (OpenAI, Google, etc.) and picks the best one for each request.

### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `route` | Send request to best AI | "Process this with optimal model" |
| `text` | Generate text | "Write me a summary" |
| `image` | Generate images | "Create an image of X" |
| `providers` | List available providers | "Which AI services are connected?" |
| `status` | Check provider health | "Are all AI services working?" |

### The Provider Cascade

When you make a request, Nexus tries providers in order:

1. **Primary (Groq)** — Fastest, try first
2. **Secondary (Cerebras)** — High throughput backup
3. **Tertiary (Together/DeepSeek)** — Additional fallbacks
4. **Emergency (any available)** — Last resort

**Why This Matters:** If OpenAI goes down, your app keeps working. If prices spike, you can switch providers. You're never locked in.

---

## Module 5: VISION

**What It Does:** Observability, monitoring, and health dashboards

**Plain English:** This is the dashboard that shows you what's happening inside the system—like the instrument panel of a car.

### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `dashboard` | Get system overview | "Show me the current state" |
| `health` | Check system health | "Is everything working?" |
| `metrics` | Get performance numbers | "How fast are requests being processed?" |
| `pulse` | Quick heartbeat check | "Is the system alive?" |
| `events` | Get recent activity | "What happened in the last hour?" |

### What You Can See

- **Health scores** for each module (0-100)
- **Request latency** (how fast things are)
- **Error rates** (what's breaking)
- **Memory usage** (how much data is stored)
- **Learning progress** (how much the brain is growing)

---

## Module 6: DREAM

**What It Does:** Autonomous cognition and self-improvement cycles

**Plain English:** This is the system's ability to "think" on its own, even when no one is asking it questions—like how humans think while sleeping.

### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `cycle` | Run full dream cycle | "Process today's learnings" |
| `reflect` | Generate reflections | "What insights emerged?" |
| `mutate` | Evolve internal structures | "Try new approaches" |
| `interpret` | Analyze dream outputs | "What does this synthesis mean?" |
| `feed` | Input dream material | "Consider this new data" |

### The Dream Cycle Explained

Every night (or on demand), the Dream module:

1. **Gathers** all recent memories and learnings
2. **Analyzes** patterns across them
3. **Generates** new insights by connecting ideas
4. **Proposes** improvements to the system
5. **Consolidates** important knowledge

**Plain English:** The system literally gets smarter overnight without anyone doing anything.

---

## Module 7: SYSTEM

**What It Does:** Core operations, administration, and control

**Plain English:** This is the master control panel for operating the entire substrate—like the captain's bridge on a starship.

### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `status` | Overall system status | "Is everything running?" |
| `heal` | Repair degraded modules | "Fix what's broken" |
| `backup` | Create system backup | "Save current state" |
| `restore` | Restore from backup | "Go back to previous state" |
| `shutdown` | Graceful shutdown | "Turn off safely" |
| `config` | View/update configuration | "Change settings" |

### The Self-Healing System

When something breaks:

1. System detects degraded health (via Vision)
2. System.heal is triggered
3. Each module is tested
4. Failing modules are restarted or repaired
5. If repair fails, backup is restored

---

## Module 8: MODERNIZER

**What It Does:** Self-improvement, code analysis, and automated upgrades

**Plain English:** This is the system's ability to look at its own code, find ways to improve, and upgrade itself—with human approval.

### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `propose` | Analyze and suggest improvements | "What should we upgrade?" |
| `apply` | Execute approved changes | "Make this improvement" |
| `rollback` | Undo a change | "Go back to before the upgrade" |
| `archived` | Scan old code for reuse | "What old functions can we repurpose?" |
| `status` | Upgrade system status | "What upgrades are pending?" |

### The Safety Gates

Modernizer has strict safety rules:

1. **Shadow Mode:** Changes are proposed, not applied automatically
2. **Human Approval:** A human must say "yes" before any change
3. **Pre-Backup:** System backs up before any change
4. **Health Gate:** If health drops below 95% after change, auto-rollback
5. **Rate Limit:** Maximum 3 upgrades per day

**Why This Matters:** The system can improve itself but can't break itself.

---

## How Modules Talk to Each Other

The modules aren't isolated—they work together:

```
User Request
     │
     ▼
  DECODE (interpret the request)
     │
     ▼
  DEFENSE (check if it's safe)
     │
     ▼
  NEXUS (route to AI if needed)
     │
     ▼
  BRAIN (store/retrieve knowledge)
     │
     ▼
  VISION (log what happened)
```

---

## Module Health Status

Each module reports a health score:

| Score | Meaning | What Happens |
|-------|---------|--------------|
| 80-100 | **Healthy** | Everything working |
| 50-79 | **Degraded** | Working but with issues |
| 0-49 | **Unhealthy** | Critical problems |

System.heal triggers automatically when health drops below 50.

---

## Next Document

→ [04-THE-TERMINAL.md](./04-THE-TERMINAL.md) — How to control the system with commands
