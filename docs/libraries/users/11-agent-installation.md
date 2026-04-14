# Installation Guide

---

## You Might Not Need This

Your ascended file ships with **Enhanced** capabilities already active:
- ✅ Telemetry, health signals, runtime tracing
- ✅ Caching, optimization hints

**If that's enough, skip this page entirely.** Just use your ascended file.

This guide is only for developers who want to:
- **Add** Defense or Governance capabilities
- **Change** which capabilities are active
- **Fine-tune** their configuration

---

## Install (One Command)

```bash
npx mana attach
```

That's all. The CLI walks you through everything:

1. **Detect** — scans your project and shows what it found (First Contact)
2. **Authenticate** — enter your email and name → get an API key instantly
3. **Choose** — pick your activation level
4. **Done** — Layer 2 configured

---

## Activation Levels

| Level | What's Active | When to Use |
|-------|-------------|-------------|
| **Safe** | Observability only | You want minimal footprint |
| **Enhanced** | Observability + Performance | **Already active by default** |
| **Protected** | + Defense + Governance | You want full protection |
| **Advanced** | You choose each group | You want total control |

Choosing a level **overrides** the defaults. If you pick Safe, it turns off Performance. If you pick Protected, it turns on Defense and Governance.

---

## Change Your Level Later

```bash
npx mana config
```

---

## Check Status

```bash
npx mana status
```

---

## Remove Layer 2

```bash
npx mana detach
```

Your original code was never modified. Detaching just removes the configuration.

---

## No Terminal?

If you don't have terminal access, your ascended file already works with Enhanced capabilities. No setup needed.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CMPSBL_API_KEY` | Only for Mana CLI | — | Your API key (free — register with email) |

---

## Support

- **Email:** support@cmpsbl.com
- **CLI:** `npx mana help`

---

© 2025–2026 CMPSBL®. All rights reserved.
