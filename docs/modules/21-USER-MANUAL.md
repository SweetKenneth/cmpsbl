<div align="center">

# Module 21 — User Manual

### Complete Usage Guide

v9.3.0 ARCHITECT Epoch

</div>

---

## Getting Started

### Prerequisites

| Requirement | Details |
|------------|---------|
| Infrastructure | A Supabase project (PostgreSQL 15+ with pgvector) |
| AI Provider Key | At least one: OpenAI, Anthropic, Google, or Mistral |
| Client | Modern web browser for the Terminal UI |

### First-Time Setup

1. Deploy the substrate edge functions to your Supabase project
2. Run the database migration to create all required tables
3. Boot the substrate via the Terminal UI or API
4. Register your AI provider API keys
5. Create your first developer API key

---

## Terminal UI

The Terminal UI is the primary interface for interacting with the substrate.

### Command Structure

All commands follow the pattern:

```
module.action [parameters]
```

### Core Commands

| Command | Description |
|---------|-------------|
| `system.boot` | Initialize all 21 modules |
| `system.health` | Display substrate health dashboard |
| `system.heal [module]` | Trigger auto-heal for a specific module |
| `system.backup` | Create a full substrate backup |
| `system.restore [backup_id]` | Restore from a backup |

### Memory Commands

| Command | Description |
|---------|-------------|
| `brain.store [content]` | Store a new memory |
| `brain.recall [query]` | Search memories by natural language query |
| `brain.consolidate` | Trigger memory consolidation cycle |
| `brain.stats` | Display memory tier statistics |

### AI Commands

| Command | Description |
|---------|-------------|
| `nexus.route [prompt]` | Send a prompt to the optimal AI provider |
| `nexus.providers` | List configured providers and their health |
| `nexus.costs` | Display cost summary by provider |

### Evolution Commands

| Command | Description |
|---------|-------------|
| `modernizer.scan` | Scan for optimization opportunities |
| `modernizer.propose` | Generate an evolution proposal |
| `modernizer.history` | View evolution history |
| `modernizer.rollback [stamp_id]` | Revert an applied evolution |

### Dream Commands

| Command | Description |
|---------|-------------|
| `dream.cycle` | Trigger a dream cycle manually |
| `dream.insights` | View insights from recent dream cycles |
| `dream.pool [agency_id]` | View shared dream pool for an agency |

### Security Commands

| Command | Description |
|---------|-------------|
| `defense.status` | Display current threat level and recent activity |
| `defense.threats` | List recent threat detections |
| `defense.quarantine` | View quarantined requests |
| `access.keys` | List API keys and their usage |
| `access.quotas` | Display quota usage by key |

### Agency Commands

| Command | Description |
|---------|-------------|
| `agency.create [template]` | Create a new agency from a template |
| `agency.list` | List all agencies |
| `agency.task [agency_id] [type]` | Submit a task to an agency |
| `agency.status [agency_id]` | View agency status and member health |

---

## API Reference

### Authentication

All API requests require either a session token or an API key:

```
Authorization: Bearer {session_token}
```

or

```
X-API-Key: {api_key}
```

### Endpoint

All substrate operations go through a single endpoint:

```
POST /functions/v1/pf-substrate
```

### Request Format

```json
{
  "module": "brain",
  "action": "store",
  "params": {
    "content": "The user prefers dark mode interfaces",
    "tier": "semantic",
    "importance": 0.7
  }
}
```

### Response Format

```json
{
  "success": true,
  "module": "brain",
  "action": "store",
  "data": {
    "memory_id": "uuid",
    "tier": "semantic",
    "confidence": 0.85
  },
  "meta": {
    "latency_ms": 142,
    "provider": null,
    "cost_millicents": 0
  }
}
```

---

## Configuration

### Provider Setup

Register AI providers through the API or Terminal UI:

```
nexus.register openai {api_key}
nexus.register anthropic {api_key}
```

Provider keys are stored in an encrypted vault scoped to your substrate instance.

### Budget Configuration

Set spending limits to prevent unexpected costs:

```
economy.budget daily 500    (500 cents = $5.00 per day)
economy.budget monthly 5000 (5000 cents = $50.00 per month)
```

### Memory Configuration

Adjust memory behavior:

```
brain.config decay_rate episodic 0.023
brain.config decay_rate semantic 0.0046
brain.config consolidation_threshold 0.6
```

---

## Troubleshooting

### Module Shows Unhealthy

1. Run `system.health` to identify the unhealthy module
2. Check the module's circuit breaker state
3. Run `system.heal {module}` to trigger auto-recovery
4. If heal fails, check AUDIT logs for error details
5. Verify infrastructure dependencies (database, providers)

### AI Requests Failing

1. Run `nexus.providers` to check provider health
2. Verify API keys are valid and not expired
3. Check `economy.quotas` for budget exhaustion
4. Review DEFENSE for blocked requests
5. Check provider rate limits via `nexus.costs`

### Memory Not Found

1. Verify the memory was stored successfully via AUDIT
2. Check confidence score — memories below 0.1 are eligible for pruning
3. Run `brain.stats` to check tier health
4. Try a broader search query
5. Check if memory has decayed below retrieval threshold

### Evolution Stuck

1. Check `modernizer.history` for pending proposals
2. Verify CORTEX is healthy (required for proposal evaluation)
3. Check if another evolution is already in progress (only one at a time)
4. Review AUDIT for approval/rejection details
5. Run `modernizer.rollback` if a previous evolution caused issues

---

## Best Practices

| Practice | Rationale |
|----------|-----------|
| Start with one AI provider, add more as needed | Simplifies initial setup and debugging |
| Set conservative budgets initially | Prevents unexpected costs during learning |
| Review evolution proposals before enabling auto-approve | Understand what changes the substrate wants to make |
| Monitor VISION dashboards daily during initial deployment | Catch issues early while establishing baselines |
| Use agencies for complex multi-step tasks | Agents coordinate better than sequential API calls |
| Back up before major configuration changes | Ensures recovery path if something goes wrong |

---

<div align="center">

CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch

Kenneth E Sweet Jr · PromptFluid

ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX

© 2025–2026 PromptFluid. All rights reserved.

</div>
