# IDENTITY Module

**CMPSBL® Substrate — Infrastructure Layer | v9.1.0 ARCHITECT Epoch**

---

## Overview

The **IDENTITY** module provides universal actor attribution for both human users and AI agents. Every action in the substrate is attributed to a verified identity, enabling granular access control, audit trails, and multi-tenant isolation.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| **Actor Resolution** | Resolve human/agent identity from context | FREE |
| **Session Management** | Token-based session lifecycle | Builder |
| **Agent Fingerprinting** | Unique cryptographic agent identities | Builder |
| **Role-Based Access** | RBAC with hierarchical inheritance | Pro |
| **Identity Federation** | Cross-system identity linking | Enterprise |
| **Zero-Trust Verification** | Continuous identity verification | Enterprise |

---

## Architecture

```
┌───────────────────────────────────┐
│        IDENTITY MODULE            │
├───────────────────────────────────┤
│  Actor Registry                   │
│  ├── Human user profiles          │
│  ├── Agent identity records       │
│  └── Service account management   │
├───────────────────────────────────┤
│  Authentication Engine            │
│  ├── Token issuance & validation  │
│  ├── MFA support                  │
│  └── Session lifecycle            │
├───────────────────────────────────┤
│  Authorization Engine             │
│  ├── RBAC policy evaluation       │
│  ├── Capability-based access      │
│  └── Tenant isolation             │
└───────────────────────────────────┘
```

---

## SDK Usage

```typescript
import { substrate } from '@cmpsbl/sdk';

// Resolve current actor
const actor = await substrate.identity.resolve();
// → { type: 'human', id: 'usr_abc', roles: ['admin'] }

// Create agent identity
const agentId = await substrate.identity.createAgent({
  name: 'research-agent-01',
  capabilities: ['brain.read', 'nexus.route'],
  ttl: '24h'
});

// Check authorization
const allowed = await substrate.identity.authorize({
  actor: agentId,
  action: 'modernizer.propose',
  resource: 'engine:cortex'
});
```

---

## Integration Points

| Module | Integration |
|--------|-------------|
| ACCESS | API key ↔ identity binding |
| AUDIT | Actor attribution on all log entries |
| CORTEX | Agent identity for autonomous decisions |
| DEFENSE | Identity-aware threat detection |
| ECONOMY | Per-actor cost attribution |

---

*CMPSBL® IDENTITY Module — v9.1.0 ARCHITECT Epoch*
*© 2025-2026 PromptFluid®. All rights reserved.*
