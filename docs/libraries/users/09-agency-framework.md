# Agency Framework

---

## What Is an Agency?

An agency is a coordinated team of **cognitive agents** — specialized AI workers deployed to handle tasks autonomously. Agencies provide task management, shared learning, economic tracking, and deliverable generation.

---

## Creating an Agency

```bash
# Via CLI
cmpsbl agency create --template "research-team" --name "Market Analysis"

# Via API
curl -X POST https://api.cmpsbl.ai/api/v1/agency/create \
  -H "Authorization: Bearer pf_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"template": "research-team", "name": "Market Analysis"}'
```

---

## Agency Templates

| Template | Agents Included | Focus |
|----------|----------------|-------|
| **Research Team** | ANALYST, EDUCATOR, WRITER | Market research, reports |
| **Development Team** | CODING, ANALYST, SECURITY | Software development |
| **Content Team** | WRITER, EDUCATOR, HYBRID | Content production |
| **Custom** | Your choice | Any combination |

---

## Task Management

```bash
# Assign a task
cmpsbl agency task create --agency <id> --type research \
  --title "Analyze competitor pricing" \
  --assign ANALYST

# Check progress
cmpsbl agency task status <task-id>

# List all tasks
cmpsbl agency tasks --agency <id>
```

Tasks include:
- **Priority levels** — determines execution order
- **Progress tracking** — percentage complete, estimated time
- **Deliverables** — output files, reports, data exports
- **Cost tracking** — per-task cost in compute and tokens
- **ROI measurement** — value generated vs. cost

---

## DREAM Engine Pools

Agents learn individually through DREAM Engine synthesis. Agencies can optionally enable shared learning:

- **Private mode** — each agent's DREAM Engine insights stay within the agent
- **Shared mode** — insights shared within the agency (consent-gated)
- **Global pooling** — anonymized insights shared across agencies (opt-in)

Privacy controls:
- Domain exclusions (exclude specific topics from sharing)
- Consent required for all sharing modes
- Audit trail for every shared insight

---

## Scheduled Tasks

```bash
# Create a daily research task
cmpsbl agency schedule create \
  --agency <id> \
  --type daily \
  --time "09:00" \
  --task-type research \
  --title "Morning market scan"
```

Schedule types: `daily`, `weekly`, `monthly`

---

## Economic Tracking

Each agency tracks:
- **Total cost** — compute time, API calls, tokens
- **Total value** — estimated value of deliverables
- **ROI** — value / cost ratio
- **Per-agent metrics** — task count, success rate, learning gain
- **Convergence speed** — how quickly agents improve

---

## Limits by Plan

| Feature | Pro | Enterprise |
|---------|-----|-----------|
| Agencies | 1 | Unlimited |
| Agents per agency | 5 | Unlimited |
| Scheduled tasks | 3 | Unlimited |
| DREAM Engine pool mode | Private only | All modes |

---

© 2025–2026 CMPSBL®. All rights reserved.
