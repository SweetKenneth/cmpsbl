# API Reference

---

> **CMPSBL®** — Governed Cognitive Infrastructure · PromptFluid™
> U.S. Patent App. No. 64/029,678 · 64/031,637


## Access Model

CMPSBL® uses a **substrate-routed API** — all requests flow through the `pf-substrate` backend function. There is no standalone REST API at a separate domain. All API interactions happen through:

1. **The website** (cmpsbl.com) — browser-based terminal and Ascension
2. **The CLI** (`@cmpsbl/cli`) — terminal commands that call the substrate
3. **Mana** (`@cmpsbl/mana`) — Layer 2 attachment and configuration

## Request Format (CLI / Internal)

All CLI and internal requests use a unified envelope:

```json
{
  "module": "string",
  "action": "string",
  "payload": {}
}
```

### Example: Validate an API Key

```json
{
  "module": "access",
  "action": "validate_key",
  "payload": {
    "api_key": "cmpsbl_bld_xxxxx"
  }
}
```

### Example: Register a Developer

```json
{
  "module": "access",
  "action": "create_key",
  "payload": {
    "email": "developer@example.com",
    "display_name": "Jane Developer",
    "scopes": ["substrate.read", "substrate.write"]
  }
}
```

## Response Format

```json
{
  "success": true,
  "data": {},
  "api_key": "cmpsbl_bld_xxxxx"
}
```

## Error Response

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

## Authentication

Include your API key in requests:

```bash
# Via environment variable (recommended)
export CMPSBL_API_KEY=your_key_here

# Via CLI stored credentials
# Keys are saved to ~/.cmpsbl/credentials after login
```

## Available Modules

| Module | Actions | Access |
|--------|---------|--------|
| `access` | `validate_key`, `create_key`, `revoke_key` | All tiers |
| `memory` | `store`, `retrieve`, `search` | Studio+ |
| `ascension` | `upload`, `status`, `export` | Creator+ |
| `cli` | `sync_state`, `pull_state`, `push_state` | All tiers |

## Rate Limits

| Tier | Requests/Minute | Requests/Day |
|------|----------------|--------------|
| Builder (Free) | 10 | 100 |
| Builder (Free) | 30 | 1,000 |
| Creator ($49) | 60 | 5,000 |
| Architect ($79) | 120 | 20,000 |
| Enterprise | Custom | Custom |

## API Key Scopes

| Scope | Description |
|-------|-------------|
| `substrate.read` | Read access to primitives and status |
| `substrate.write` | Write access (store memory, submit jobs) |
| `ascension` | Run Ascension scans |
| `mana.attach` | Configure Layer 2 attachment |

---

**CMPSBL®** · Governed Cognitive Infrastructure
Protected under U.S. Patent App. No. 64/029,678 (Ascension™ Discovery) & 64/031,637 (Mana™ Silent Symbiosis)
© 2025–2026 CMPSBL® · PromptFluid™ · All rights reserved.
