# 03: The Modules — The 12 Building Blocks

**Everything the Substrate Can Do (v4.2.0)**

---

## The Module System Explained

Think of the substrate as a toolbox with 12 specialized tools. Each tool (module) does one category of things really well.

The modules are organized into **4 layers**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    THE SUBSTRATE v4.2.0                              │
│                                                                      │
│  ┌─── KERNEL LAYER (Infrastructure) ──────────────────────────────┐ │
│  │  CORE         RIPPLE        ACCESS                              │ │
│  │  Scheduler    Message Bus   Identity & Billing                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─── COGNITIVE LAYER (Intelligence) ─────────────────────────────┐ │
│  │  BRAIN        DECODE        DREAM                               │ │
│  │  Memory       Interface     Evolution                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─── OPERATIONAL LAYER (Services) ───────────────────────────────┐ │
│  │  DEFENSE      NEXUS         VISION       INTEGRATION            │ │
│  │  Security     AI Routing    Observability Enterprise            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─── ADMINISTRATIVE LAYER (Control) ─────────────────────────────┐ │
│  │  SYSTEM       MODERNIZER                                        │ │
│  │  Operations   Self-Upgrade                                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## KERNEL LAYER — The Foundation

These 3 modules form the core infrastructure. All other modules depend on them.

---

### Module 1: CORE (The Scheduler)

**What It Does:** Job scheduling, lifecycle management, circuit breakers

**Plain English:** This is the "operating system kernel" that controls when things run, in what order, and makes sure nothing crashes the whole system.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `boot` | Start the substrate | "Turn on the system" |
| `schedule` | Queue a job for later | "Run this in 5 minutes" |
| `lifecycle` | Manage module states | "Check if brain is ready" |
| `circuit_open` | Open circuit breaker | "Stop calling failing service" |
| `circuit_close` | Close circuit breaker | "Service is healthy again" |
| `pulse` | Check kernel health | "Is the core alive?" |

#### Why It Matters

Without Core, jobs would run chaotically. Core ensures:
- Jobs run in the right order
- Failing modules don't crash everything (circuit breakers)
- The system boots up correctly every time

---

### Module 2: RIPPLE (The Message Bus)

**What It Does:** Pub/Sub messaging, event queues, async communication

**Plain English:** This is the "nervous system" that lets modules talk to each other. When something happens, it "ripples" out to whoever needs to know.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `publish` | Send an event to a topic | "User signed up!" |
| `subscribe` | Listen for events on a topic | "Tell me when users sign up" |
| `queue` | Add a job to a queue | "Process this email later" |
| `dequeue` | Get next item from queue | "What's the next email to send?" |
| `ack` | Mark message as processed | "I handled that message" |
| `events` | List recent events | "What happened?" |

#### Why It Matters

Without Ripple, modules would have to call each other directly (tight coupling). With Ripple:
- Modules are independent
- One event can trigger multiple handlers
- Failed messages can be retried

---

### Module 3: ACCESS (Identity & Billing)

**What It Does:** API key management, rate limiting, usage metering, billing

**Plain English:** This is the "front door" that checks who you are, what you're allowed to do, and tracks how much you've used.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `createKey` | Generate new API key | "Give me an API key" |
| `validateKey` | Check if key is valid | "Is this key real?" |
| `revokeKey` | Disable an API key | "Block this key" |
| `quotaCheck` | Check usage limits | "Have I hit my limit?" |
| `usage` | Get usage statistics | "How much have I used?" |
| `metered` | Record billable usage | "Log this API call" |

#### Why It Matters

Without Access, anyone could use the system unlimited. Access ensures:
- Only authorized users can connect
- Usage is tracked for billing
- Rate limits protect the system

---

## COGNITIVE LAYER — The Intelligence

These 3 modules handle thinking, remembering, and learning.

---

### Module 4: BRAIN

**What It Does:** Memory, learning, and knowledge management

**Plain English:** This is where the AI stores what it knows and learns new things.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `recall` | Search memories | "What do you know about X?" |
| `store` | Save new memory | "Remember that Y happened" |
| `train` | Ingest batch learning | Load a dataset of knowledge |
| `reflect` | Analyze patterns | "What patterns do you see?" |
| `synthesize` | Generate insights | "Combine what you've learned" |
| `deep_think` | Extended reasoning | "Think deeply about this problem" |
| `dream` | Run consolidation cycle | Nighttime memory organization |

#### Why It Matters

Without Brain, AI has no persistent knowledge. Every conversation starts from zero. With Brain, AI accumulates expertise over time.

---

### Module 5: DECODE

**What It Does:** Human-to-machine translation layer

**Plain English:** This is how humans talk to the system in natural language and get structured responses back.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `chat` | Conversational interface | Natural language queries |
| `interpret` | Parse ambiguous input | "What did the user really mean?" |
| `describe` | Explain system state | "Describe what's happening" |
| `pattern` | Identify patterns in input | "What kind of request is this?" |

#### The Special Rules

Decode has strict "personality" rules:
- **No imperatives:** Doesn't say "you should do X"
- **No identity claims:** Doesn't say "I am..."
- **No synthetic emotion:** Doesn't pretend to feel things
- **No agency claims:** Doesn't claim to make decisions

**Why?** This makes the system safe, predictable, and honest about what it is.

---

### Module 6: DREAM

**What It Does:** Autonomous cognition and self-improvement cycles

**Plain English:** This is the system's ability to "think" on its own, even when no one is asking it questions—like how humans think while sleeping.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `cycle` | Run full dream cycle | "Process today's learnings" |
| `reflect` | Generate reflections | "What insights emerged?" |
| `mutate` | Evolve internal structures | "Try new approaches" |
| `interpret` | Analyze dream outputs | "What does this synthesis mean?" |
| `feed` | Input dream material | "Consider this new data" |

#### The Dream Cycle Explained

Every night (or on demand), the Dream module:

1. **Gathers** all recent memories and learnings
2. **Analyzes** patterns across them
3. **Generates** new insights by connecting ideas
4. **Proposes** improvements to the system
5. **Consolidates** important knowledge

**Plain English:** The system literally gets smarter overnight without anyone doing anything.

---

## OPERATIONAL LAYER — The Services

These 3 modules handle security, AI routing, and monitoring.

---

### Module 7: DEFENSE

**What It Does:** Security, bot detection, threat analysis

**Plain English:** This is the security guard that protects the system from attacks and abuse.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `detect` | Analyze for bot behavior | "Is this request from a human or bot?" |
| `analyze` | Threat assessment | "Is this IP address suspicious?" |
| `block` | Add to blocklist | Block a known attacker |
| `rules` | Manage security rules | Create/update defense rules |
| `event` | Log security event | Record a suspicious activity |

#### What It Protects Against

- **Bot attacks:** Automated scripts trying to abuse the system
- **Credential stuffing:** Attackers trying stolen passwords
- **DDoS:** Overwhelming the system with traffic
- **Prompt injection:** Malicious prompts trying to manipulate AI
- **Data exfiltration:** Attempts to extract private data

---

### Module 8: NEXUS

**What It Does:** Multi-provider AI routing and model management

**Plain English:** This is the switchboard that connects to different AI providers (OpenAI, Google, etc.) and picks the best one for each request.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `route` | Send request to best AI | "Process this with optimal model" |
| `text` | Generate text | "Write me a summary" |
| `image` | Generate images | "Create an image of X" |
| `providers` | List available providers | "Which AI services are connected?" |
| `status` | Check provider health | "Are all AI services working?" |

#### The Provider Cascade

When you make a request, Nexus tries providers in order:

1. **Primary (Groq)** — Fastest, try first
2. **Secondary (Cerebras)** — High throughput backup
3. **Tertiary (Together/DeepSeek)** — Additional fallbacks
4. **Emergency (any available)** — Last resort

**Why This Matters:** If OpenAI goes down, your app keeps working. If prices spike, you can switch providers. You're never locked in.

---

### Module 9: VISION

**What It Does:** Observability, monitoring, and health dashboards

**Plain English:** This is the dashboard that shows you what's happening inside the system—like the instrument panel of a car.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `dashboard` | Get system overview | "Show me the current state" |
| `health` | Check system health | "Is everything working?" |
| `metrics` | Get performance numbers | "How fast are requests being processed?" |
| `pulse` | Quick heartbeat check | "Is the system alive?" |
| `events` | Get recent activity | "What happened in the last hour?" |

#### What You Can See

- **Health scores** for each module (0-100)
- **Request latency** (how fast things are)
- **Error rates** (what's breaking)
- **Memory usage** (how much data is stored)
- **Learning progress** (how much the brain is growing)

---

## ADMINISTRATIVE LAYER — The Control

These 2 modules handle operations and self-improvement.

---

### Module 10: SYSTEM

**What It Does:** Core operations, administration, and control

**Plain English:** This is the master control panel for operating the entire substrate—like the captain's bridge on a starship.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `status` | Overall system status | "Is everything running?" |
| `heal` | Repair degraded modules | "Fix what's broken" |
| `backup` | Create system backup | "Save current state" |
| `restore` | Restore from backup | "Go back to previous state" |
| `shutdown` | Graceful shutdown | "Turn off safely" |
| `config` | View/update configuration | "Change settings" |

#### The Self-Healing System

When something breaks:

1. System detects degraded health (via Vision)
2. System.heal is triggered
3. Each module is tested
4. Failing modules are restarted or repaired
5. If repair fails, backup is restored

---

### Module 11: MODERNIZER

**What It Does:** Self-improvement, upgrade proposals, and automated enhancements

**Plain English:** This is the system's ability to analyze itself, suggest improvements, and apply upgrades—with human approval.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `propose` | Analyze and suggest improvements | "What should we upgrade?" |
| `apply_shadow` | Apply changes to test environment | "Test this improvement" |
| `apply_production` | Promote to production | "Go live with this change" |
| `rollback` | Undo a change | "Go back to before the upgrade" |
| `list_plans` | See all upgrade plans | "What upgrades are pending?" |
| `list_applied` | See applied improvements | "What's already been done?" |

#### How Upgrades Work (The Important Part!)

**This is NOT an AI agent that writes code.** Here's what actually happens:

1. **Propose:** System scans a predefined catalog of improvements and suggests ones that haven't been applied yet
2. **Shadow Apply:** Marks improvements as "testing" and tracks them
3. **Test:** You run tests to verify the system is stable
4. **Production Apply:** Marks improvements as "applied" so they don't appear again
5. **Rollback:** If something breaks, marks them as "rolled back"

**What it DOES:**
- Tracks which improvements have been applied
- Prevents the same improvements from being suggested twice
- Creates backups before changes
- Checks system health before/after

**What it DOESN'T:**
- Write actual code changes
- Modify source files autonomously
- Deploy new functions automatically

**The actual code implementation is done by developers** (or an agentic coding system like Lovable) based on the improvement plans.

#### The Safety Gates

1. **Shadow Mode:** Changes are tested in shadow before production
2. **Human Approval:** A human must approve each step
3. **Pre-Backup:** System backs up before any change
4. **Health Gate:** If health drops, auto-rollback
5. **Rate Limit:** Maximum 3 upgrades per day
6. **Cooldown:** 1 hour wait after any rollback

---

## How Modules Talk to Each Other

The modules work together via the message bus:

```
User Request
     │
     ▼
  ACCESS (authenticate the request)
     │
     ▼
  CORE (schedule if needed)
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
  RIPPLE (publish events)
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

## Module 12: INTEGRATION (New in v4.2.0)

**What It Does:** Enterprise adapters, auto-discovery, LLM governance

**Plain English:** This is the "arms and legs" that let the substrate connect to and control external systems—from Salesforce to Unity game engines.

#### Key Actions

| Action | What It Does | Example |
|--------|--------------|---------|
| `adapters` | List available adapters | "What can I connect to?" |
| `connect` | Connect to external system | "Hook up Stripe" |
| `discover` | Auto-find API endpoints | "What can this system do?" |
| `execute` | Run action with governance | "Create a customer (supervised)" |
| `map_command` | Create terminal shortcut | "Make 'subscribe' trigger Stripe" |
| `policies` | View LLM governance rules | "What is AI allowed to do?" |

#### The 35+ Adapters

Integration comes with pre-built adapters for:

- **ERP:** SAP, Oracle, NetSuite, Dynamics 365
- **Payroll:** ADP, Gusto, Workday, BambooHR
- **Gaming:** Unity, Unreal, Godot, custom engines
- **CRM:** Salesforce, Zendesk, Intercom, Freshdesk
- **DevOps:** GitHub, GitLab, Jira, Linear
- **Payments:** Stripe, Shopify, Square

#### Why It Matters

Without Integration, connecting to external systems is manual and ungoverned. With Integration:
- Pre-built adapters save weeks of development
- LLM governance controls what AI can do
- Full audit trail of every action
- Terminal commands for easy operations

#### Deep Dive

→ [21-INTEGRATION-DEEP-DIVE.md](./21-INTEGRATION-DEEP-DIVE.md) — Complete enterprise integration guide

---

## Quick Reference Card

| Module | Layer | Purpose | Key Action |
|--------|-------|---------|------------|
| CORE | Kernel | Scheduling | `schedule` |
| RIPPLE | Kernel | Messaging | `publish` |
| ACCESS | Kernel | Identity | `createKey` |
| BRAIN | Cognitive | Memory | `recall` |
| DECODE | Cognitive | Interface | `chat` |
| DREAM | Cognitive | Evolution | `cycle` |
| DEFENSE | Operational | Security | `detect` |
| NEXUS | Operational | AI Routing | `route` |
| VISION | Operational | Monitoring | `health` |
| INTEGRATION | Operational | Enterprise | `connect` |
| SYSTEM | Administrative | Operations | `heal` |
| MODERNIZER | Administrative | Upgrades | `propose` |

---

## Next Document

→ [04-THE-TERMINAL.md](./04-THE-TERMINAL.md) — How to control the system with commands
