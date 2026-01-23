# promptfluid® Substrate — Developer Documentation

**v4.0.0 — Usage Documentation**

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
| [**USER-MANUAL.md**](./USER-MANUAL.md) | API usage guide with all 11 modules |
| [**MODULE-ACTIONS-REGISTRY.md**](./MODULE-ACTIONS-REGISTRY.md) | Complete action reference |
| [**CHANGELOG.md**](./CHANGELOG.md) | Version history |

---

## Quick Start

```
POST /functions/v1/pf-substrate

{
  "module": "core|ripple|access|brain|decode|defense|nexus|vision|dream|system|modernizer",
  "action": "<action-name>",
  "payload": { ... }
}
```

---

## 11-Module Architecture (v4.0.0)

| Layer | Modules |
|-------|---------|
| Kernel | CORE, RIPPLE, ACCESS |
| Cognitive | BRAIN, DECODE, DREAM |
| Operational | DEFENSE, NEXUS, VISION |
| Administrative | SYSTEM, MODERNIZER |

---

*promptfluid® v4.0.0 — Build on the substrate. Bring your own keys.*
