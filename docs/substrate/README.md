# promptfluid® Substrate — Developer Documentation

**v2026.01 — Usage Documentation**

---

## ⚠️ BYOK Required

This is **usage documentation only**. You must:
1. Deploy your own Supabase project
2. Provide your own AI provider API keys
3. No compute resources are included

---

## Documentation

| Document | Description |
|----------|-------------|
| [**USER-MANUAL.md**](./USER-MANUAL.md) | API usage guide with all modules and examples |
| [**MODULE-ACTIONS-REGISTRY.md**](./MODULE-ACTIONS-REGISTRY.md) | Complete action reference |
| [**CHANGELOG.md**](./CHANGELOG.md) | Version history |

---

## Quick Start

```
POST /functions/v1/pf-substrate

{
  "module": "brain|decode|defense|nexus|vision|dream|system",
  "action": "<action-name>",
  "payload": { ... }
}
```

---

## SDK

Download the TypeScript SDK at `/sdk/substrate-client.ts`

---

*promptfluid® — Build on the substrate. Bring your own keys.*
