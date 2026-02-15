<div align="center">

# Module 18 — IDENTITY

### Actor Attribution, Reputation, and Sessions

Layer 6 — Infrastructure

v10.5.1 ARCHITECT Epoch

</div>

---

## Purpose

IDENTITY manages actor attribution — knowing exactly who or what is performing every action in the substrate. It handles user sessions, API key identities, system actor identities, cognitive agent identities, reputation scoring, and cross-agency identity portability.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| Session Management | Create, validate, and expire user sessions | Free |
| API Key Identity | Map API keys to developer accounts | Free |
| Actor Resolution | Resolve any request to a specific actor identity | Free |
| Actor Reputation Scoring (v10.5.1) | Trust scores mapped to tiers (untrusted → elite) | Free |
| Session Context | Attach metadata to sessions (preferences, state) | Pro |
| Multi-Session Support | Users can have multiple active sessions | Pro |
| Cross-Agency Identity Portability (v10.5.1) | Signed JWT tokens for identity transfer between agencies | Pro |
| Cognitive Identity | Assign identities to AI agents within agencies | Enterprise |
| Identity Federation | Map external identity providers to substrate identities | Enterprise |
| Identity Analytics | Track actor behavior patterns over time | CMPSBL |
| Actor Impersonation (Admin) | Admins can act as another identity for debugging | CMPSBL |

---

## Actor Reputation System (v10.5.1)

Every actor accumulates a trust score based on behavior:

| Tier | Score Range | Privileges |
|------|------------|------------|
| `untrusted` | 0.0–0.2 | Read-only access, rate limited |
| `basic` | 0.2–0.4 | Standard operations |
| `verified` | 0.4–0.6 | Extended quotas |
| `trusted` | 0.6–0.8 | Reduced governance friction |
| `elite` | 0.8–1.0 | Priority routing, elevated limits |

Trust scores are updated based on:
- Successful operations (+0.01)
- Security violations (-0.15)
- Consistent usage patterns (+0.005/day)
- Defense flags or blocks (-0.10)

---

## Cross-Agency Identity Portability (v10.5.1)

Actors can carry their identity and reputation across agencies using signed tokens:

```
┌──────────────┐         ┌──────────────┐
│  Agency A     │ ──JWT──► │  Agency B     │
│  actor: user1 │         │  actor: user1 │
│  trust: 0.85  │         │  trust: 0.85  │
│  tier: elite  │         │  tier: elite  │
└──────────────┘         └──────────────┘
```

Tokens include: `actor_id`, `trust_score`, `tier`, `origin_agency`, `issued_at`, `expires_at`, `signature`.

---

## Actor Types

| Actor Type | Identifier | Example |
|-----------|-----------|---------|
| Human User | `user:{uuid}` | Authenticated user via login |
| API Key | `key:{key_prefix}` | Developer accessing via API |
| System Module | `system:{module_name}` | DREAM performing autonomous operations |
| Cognitive Agent | `agent:{cognitive_id}` | Agency member executing a task |
| Anonymous | `anon:{session_id}` | Unauthenticated visitor (limited access) |

---

## Session Lifecycle

```
Authentication (login / API key)
         │
         ▼
┌─────────────────┐
│  Identity         │  Resolve actor type, permissions, and trust tier
│  Resolution       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Session          │  Create session with TTL and metadata
│  Creation         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Active           │  Session is valid for requests
│  Session          │  Refresh on activity, expire on TTL
└────────┬────────┘
         │
    On expiry or logout:
         ▼
┌─────────────────┐
│  Session          │  Clean up, log in AUDIT, update reputation
│  Termination      │
└─────────────────┘
```

---

## Integration with Other Modules

| Module | Integration |
|--------|------------|
| ACCESS | Validates API keys and resolves developer identity |
| AUDIT | Provides actor attribution for every logged event |
| BRAIN | Scopes memory access by actor identity; receives behavioral profiles via transfer |
| DEFENSE | Behavioral fingerprinting tied to actor identity; trust score informs threat assessment |
| RIPPLE | Emits `identity.session_created`, `identity.session_expired`, `identity.trust_updated` |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `identity_sessions` | Active and historical session records |
| `identity_actors` | Registered actor identities, metadata, and trust scores |
| `cognitive_registry` | AI agent identity records |

---

<div align="center">

CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch

Kenneth E Sweet Jr · PromptFluid

ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX

© 2025–2026 PromptFluid. All rights reserved.

</div>
