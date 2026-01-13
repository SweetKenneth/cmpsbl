# promptfluid® Substrate Documentation

**v2026.01 — Cognitive Orchestration Substrate**

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [**USER-MANUAL.md**](./USER-MANUAL.md) | Complete user guide with all modules, actions, and examples |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | System architecture, diagrams, and technical overview |
| [**MODULE-ACTIONS-REGISTRY.md**](./MODULE-ACTIONS-REGISTRY.md) | Complete registry of all 44 module actions |
| [**DecodeRFC.md**](./DecodeRFC.md) | OSF RFC for the Decode interpreter primitive |

---

## Quick Links

### By Use Case

- **I want to build a chatbot** → [Decode Module](./USER-MANUAL.md#module-decode)
- **I want to store/query knowledge** → [Brain Module](./USER-MANUAL.md#module-brain)
- **I want to generate AI content** → [Nexus Module](./USER-MANUAL.md#module-nexus)
- **I want to add security** → [Defense Module](./USER-MANUAL.md#module-defense)
- **I want monitoring/metrics** → [Vision Module](./USER-MANUAL.md#module-vision)
- **I want dream processing** → [Dream Module](./USER-MANUAL.md#module-dream)

### By Role

- **Developers** → Start with [USER-MANUAL.md](./USER-MANUAL.md)
- **Architects** → See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Researchers** → Read [DecodeRFC.md](./DecodeRFC.md)

---

## API Quick Reference

```
POST /functions/v1/pf-substrate

{
  "module": "brain|decode|defense|nexus|vision|dream|system",
  "action": "<action-name>",
  "payload": { ... }
}
```

---

*promptfluid® — A cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems.*
