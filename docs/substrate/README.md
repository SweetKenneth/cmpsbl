# promptfluid® Substrate — Developer Documentation

**v7.5.0 — SEBA Era (Self-Evolving Bounded Agent)**

---

## ⚠️ BYOK Required

This is **usage documentation only**. You must:
1. Deploy your own infrastructure
2. Provide your own AI provider API keys
3. No compute resources are included

---

## Documentation

| Document | Description |
|----------|-------------|
| [**USER-MANUAL.md**](./USER-MANUAL.md) | API usage guide with all 14 modules (156 actions) |
| [**MODULE-ACTIONS-REGISTRY.md**](./MODULE-ACTIONS-REGISTRY.md) | Complete action reference |
| [**CHANGELOG.md**](./CHANGELOG.md) | Version history |

---

## Quick Start

```
POST /functions/v1/pf-substrate

{
  "module": "core|ripple|access|brain|decode|defense|nexus|vision|dream|system|modernizer|integration|inclusive|cortex",
  "action": "<action-name>",
  "payload": { ... }
}
```

---

## 14-Module Architecture (v7.5.0)

| Layer | Modules |
|-------|---------|
| Kernel | CORE, RIPPLE, ACCESS |
| Cognitive | BRAIN, DECODE, NEXUS |
| Operational | DEFENSE, VISION, DREAM, INTEGRATION |
| Administrative | SYSTEM, MODERNIZER, INCLUSIVE |
| Orchestrator | CORTEX |

---

## v7.5.0 Enhancements (42 New Functions)

| Category | New Capabilities |
|----------|------------------|
| **Memory** | Query optimization, consolidation, batch operations |
| **Routing** | Load balancing, slot management, request queuing |
| **Security** | Behavioral analysis, threat intelligence, incident response |
| **Learning** | Creative synthesis, pattern mutation, insight extraction |
| **Monitoring** | Alert management, SLA tracking, resource monitoring |
| **Governance** | Permission graphs, hierarchical RBAC, session management |
| **Orchestration** | Workflow engine, multi-step pipelines, dependency graphs |
| **Integration** | Transform pipelines, webhook management, data sync |

---

## SEBA Era Features

- **Constant Learning Mode (CLM)**: 24/7 autonomous learning with budget governance
- **Bounded Autonomy**: Human-in-the-loop approval queue for proposals
- **Evolution Engine**: Self-improvement with rollback semantics
- **Governance Guard**: Ethical and coherence constraint enforcement

---

*promptfluid® v7.5.0 — Build on the substrate. Bring your own keys.*
