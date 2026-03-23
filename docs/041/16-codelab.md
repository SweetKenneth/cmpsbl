# 16 — CodeLab

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document describes CodeLab — the interactive development environment within the CMPSBL platform.

---

## 1. What Is CodeLab?

CodeLab is CMPSBL's interactive development surface for exploring, testing, and building on the cognitive substrate. It provides a hands-on environment where developers can:

- Explore node capabilities and resolver interactions
- Test intent routing patterns
- Prototype applications and workflows
- Observe Memory Stream activity in real time
- Access Signal Forge for blueprint synthesis

---

## 2. Who Is It For?

| Audience | Use Case |
|---|---|
| **New developers** | Learning the substrate through guided exploration |
| **Builders** | Prototyping apps, agents, and workflows |
| **Researchers** | Experimenting with node interaction patterns |
| **Power users** | Testing capability chains before production deployment |

---

## 3. How It Fits Into CMPSBL

CodeLab is one of three primary product surfaces within the platform:

```
CMPSBL Platform
├── CodeLab      → Interactive development
├── Dev Academy  → Structured learning
└── Signal Forge → Blueprint synthesis
```

CodeLab connects directly to the live substrate. Resolver invocations, memory operations, and discovery queries executed in CodeLab interact with the same 40-primitive matrix used in production.

---

## 4. Key Features

### Resolver Explorer

Browse and invoke resolvers from any of the 40 primitives. See input schemas, execute with test data, and inspect responses.

### Intent Playground

Compose and broadcast intents, then visualize how the router selects resolvers and aggregates responses.

### Memory Workspace

Store, search, and manage memories. Observe contradiction detection, tier management, and semantic search in action.

### Live Telemetry

Watch mesh communications and node health signals in real time as you interact with the substrate.

### Signal Forge Integration

Access Signal Forge's blueprint synthesis engine directly from within CodeLab. See [Signal Forge](18-signal-forge.md).

---

## 5. What It Produces

| Output | Description |
|---|---|
| Tested resolver invocations | Verified API calls ready for production |
| Intent patterns | Proven routing patterns for your application |
| Memory structures | Optimized memory schemas and tagging strategies |
| Blueprints | Architecture patterns via Signal Forge |
| Working prototypes | Functional application scaffolds |

---

## 6. Connection to the Substrate

CodeLab operates on the live substrate with the developer's own API key. Operations are:

- Authenticated and scoped to the developer's permissions
- Rate-limited per subscription tier
- Logged in the audit chain
- Subject to governance enforcement

---

## Related Documents

- [Signal Forge](18-signal-forge.md)
- [Dev Academy](17-dev-academy.md)
- [Developer Guide](03-developer-guide.md)
- [Substrate Development](13-substrate-development.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
