# Agent Forge

---

## What Is the Agent Forge?

The Agent Forge lets you create **custom named agents** with globally unique identities. Each agent gets a permanent name (3-8 characters) that becomes your CLI command identifier. Think of it as minting your own cognitive worker — named, specialized, and yours.

---

## Naming Rules

### Agent Names
- **3-8 characters**, uppercase
- Letters, numbers, and hyphens only
- **Globally unique** — once claimed, nobody else can use it
- Cannot be changed after creation (rename feature coming soon)
- Reserved names (primitives, brand terms) are blocked

### Agency Names (Optional)
- **3-16 characters**
- Letters, numbers, spaces, and hyphens
- **Globally unique** — claim your team's identity
- Theme your agency however you want: gaming clans, rock bands, spy networks

### Examples

| Agent Name | Agency Name | Specialization |
|-----------|-------------|----------------|
| VIPER | The Syndicate | Defender |
| GHOST | Fortnight | Researcher |
| AXL-99 | Led Zeppelin | Optimizer |
| RECON | — | Monitor |

---

## Tier Limits

| Feature | Builder | Studio | Creator | Architect |
|---------|---------|--------|---------|-----------|
| **Forge Slots** | 3 | 6 | 9 | 12 |
| **Active Agents** | 1 | 1 | 1 | 1 |
| **Signal Forge** | — | — | ✓ | ✓ |
| **Skill Injection** | — | — | ✓ | ✓ |
| **Ascension** | — | — | — | ✓ |

Only **one agent can be active** at a time across all tiers. Activation and deactivation are instant.

---

## Dashboard Workflow

1. Navigate to **Agent Forge** (`/forge`)
2. Click **Forge Agent**
3. Enter a unique agent name (3-8 chars)
4. Optionally name your agency (3-16 chars)
5. Choose a specialization
6. Click **Forge Agent** — done

Manage agents from the dashboard:
- **Activate** — make this your active agent
- **Deactivate** — stand down the current agent
- **Decommission** — permanently delete (frees the name)

---

## CLI Commands

Once forged in the dashboard, manage agents from the terminal:

```bash
# List your forged agents
cmpsbl forge list

# Activate an agent by name
cmpsbl forge activate VIPER

# Check active agent status
cmpsbl forge status VIPER

# Deactivate current agent
cmpsbl forge deactivate

# Ascend an agent (Architect tier)
cmpsbl forge ascend VIPER

# Export agent config
cmpsbl forge export VIPER
```

Agent names are your CLI identifiers — no UUIDs, no lookup tables. Just `cmpsbl forge activate GHOST`.

---

## Specializations

| Specialization | Focus |
|---------------|-------|
| **Defender** | Security monitoring, threat detection |
| **Coordinator** | Task orchestration, workflow management |
| **Optimizer** | Performance tuning, resource efficiency |
| **Analyst** | Data analysis, pattern recognition |
| **Researcher** | Information gathering, intelligence synthesis |
| **Monitor** | System observation, anomaly detection |
| **Auditor** | Compliance checking, audit trail management |
| **Custom** | Define your own focus |

---

## Ascension Pipeline

Architect-tier agents can enter the **Ascension pipeline** — the 8-stage transformation that collides your agent against all 40 substrate primitives:

1. **Classification** — Agent capabilities mapped
2. **#41 Candidacy** — Treated as the 41st primitive
3. **Collision Matrix** — Interactions with all 40 primitives scored
4. **CJPI Scoring** — Composability score calculated
5. **Tier Assignment** — Ranked in the 6-tier taxonomy
6. **Certification** — Provenance chain generated
7. **Hardening** — DEFENSE + GOVERNANCE wrapping applied
8. **Deployment** — Production-ready export

Zero external AI calls. Pure algorithmic scoring.

---

## What Makes Forged Agents Different

Forged agents are not templates. They inherit:

- **Your identity** — API key and operator profile carry over
- **Persistent memory** — Knowledge compounds across sessions
- **40-Primitive collision** — Every interaction scored against the full substrate
- **DEFENSE wrapping** — Circuit breakers active from creation
- **GOVERNANCE checks** — Policy enforcement at every operation
- **Unique name** — A permanent identity nobody else can claim

---

© 2025–2026 CMPSBL®. All rights reserved.
