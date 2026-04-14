# Ascension — User Guide

---

> **CMPSBL®** — Governed Cognitive Infrastructure · PromptFluid™
> U.S. Patent App. No. 64/029,678 · 64/031,637


## What Does This Do?

Ascension adds an invisible second layer around your code. This layer:

- **Watches** your code for problems (telemetry + health signals)
- **Protects** your code from unsafe behavior (validation + circuit breakers)
- **Governs** your code with policy enforcement (if you choose to enable it)

Your original code is **never changed**. Not one line. The layer wraps around it.

---

## What You Get Right Now (No Setup Required)

Your ascended file already has capabilities activated out of the box:

| Capability | What It Does | Status |
|-----------|-------------|--------|
| **Telemetry** | Tracks function calls, errors, and timing | ✅ Active |
| **Health Signals** | Reports whether your code is healthy or degraded | ✅ Active |
| **Runtime Tracing** | Records execution paths for debugging | ✅ Active |
| **Caching** | Stores repeated results for faster performance | ✅ Active |
| **Optimization Hints** | Suggests where your code can be more efficient | ✅ Active |

**You don't have to do anything.** These are already working in your ascended file.

---

## Step 1: Look at Your Files

After Ascension, you have two files:

```
your-project/
├── your-file.ts          ← Your original code (untouched)
└── your-file.ascended.ts ← Your code with Layer 2 (the enhanced version)
```

**Your original file** is exactly how you left it. Nothing was changed.

**Your ascended file** is the new version with the second layer active. Use this one in production.

---

## Step 2: Check Your Ascension Receipt

Ascension generates a **native-language receipt file** — not a generic JSON file. It matches the language of the code you uploaded:

| Your Language | Receipt File Generated |
|---|---|
| TypeScript | `ascension.receipt.ts` |
| JavaScript | `ascension.receipt.js` |
| Python | `ascension_receipt.py` |
| Rust | `ascension_receipt.rs` |
| Go | `ascension_receipt.go` |
| Ruby | `ascension_receipt.rb` |
| PHP | `ascension_receipt.php` |
| Java / Kotlin | `AscensionReceipt.java` |
| C# | `AscensionReceipt.cs` |
| Swift | `AscensionReceipt.swift` |
| Dart | `ascension_receipt.dart` |
| Elixir | `ascension_receipt.ex` |
| Other | `ascension.receipt.json` |

**This file is importable.** It's a real typed constant you can reference in your code:

```typescript
import { ASCENSION_RECEIPT } from './ascension.receipt';

console.log(ASCENSION_RECEIPT.cjpi);
// → { novelty: 18, utility: 21, composability: 15, maturity: 14, total: 68, tier: "A-TIER" }
```

---

## Step 3: Use the Ascended File

Replace your original import with the ascended version. That's it.

### Before (your original code):

```typescript
import * as handlers from './handlers';

app.get('/users', handlers.getUsers);
app.post('/users', handlers.createUser);
```

### After (using ascended version):

```typescript
import { init } from '@cmpsbl/runtime';
import * as handlers from './handlers';
import { readFileSync } from 'fs';

const source = readFileSync('./handlers.ts', 'utf-8');
const session = init(handlers, source, { name: 'api-handlers' });

app.get('/users', session.exports.getUsers);
app.post('/users', session.exports.createUser);

// See if your code is healthy
app.get('/health', (_, res) => res.json(session.healthCheck()));
```

**What changed:**
- Line 1: Added the runtime import
- Line 4-5: Wrapped your handlers in a session
- Lines 7-8: Used `session.exports` instead of `handlers` directly
- Line 11: Added a health endpoint (optional but recommended)

**What didn't change:**
- Your original `handlers.ts` file — completely untouched
- Your route structure — same paths, same HTTP methods
- Your function signatures — same inputs, same outputs

---

## Step 4: Want More Capabilities? (Optional)

Your file already ships with **Enhanced** capabilities active (observability + performance). If you want to go further — adding defense, governance, or memory — you have two options:

### Option A: Use Mana CLI (Recommended)

Mana is the Layer 2 attachment engine. Run:

```bash
npx mana attach
```

This will:
1. Ask you to register (just your email + name → instant API key)
2. Show you what was detected in your project
3. Let you pick a level:

| Level | What It Adds Beyond Default |
|-------|---------------------------|
| **Safe** | Nothing extra — keeps only the defaults |
| **Enhanced** | Already active — this is what you have |
| **Protected** | Adds Defense + Governance on top |
| **Advanced** | You pick exactly which groups to turn on/off |

4. Export a native-language signal file (e.g., `mana.signal.ts`)
5. Done

Mana also generates a **native-language signal file** — not a JSON file:

| Your Language | Mana Signal File |
|---|---|
| TypeScript | `mana.signal.ts` |
| JavaScript | `mana.signal.js` |
| Python | `mana_signal.py` |
| Rust | `mana_signal.rs` |
| Go | `mana_signal.go` |
| Other | See full list in Mana README |

**To change your level later**, run:

```bash
npx mana config
```

### Option B: No Terminal Access

If you can't use a terminal, you already have the **Enhanced** level active. Your code has observability and performance capabilities working right now. No action needed.

---

## What Each Level Includes

| Group | Safe | Enhanced (Default) | Protected | Advanced |
|-------|------|-------------------|-----------|----------|
| **Observability** (telemetry, health, tracing) | ✅ | ✅ | ✅ | You choose |
| **Performance** (caching, optimization) | — | ✅ | ✅ | You choose |
| **Defense** (threat detection, circuit breakers) | — | — | ✅ | You choose |
| **Governance** (policy enforcement, audit trails) | — | — | ✅ | You choose |
| **Memory** (persistent recall, session history) | — | — | — | You choose |

---

## Checking Your Status

### In code:

```typescript
// Quick health check
const health = session.healthCheck();
console.log(health);
// → { status: 'healthy', coverage: 85, ... }

// One-line status
const status = session.status();
console.log(status);
// → { health: 'healthy', coverage: 85, fingerprint: '...', identity: {...} }
```

### In terminal (if using Mana):

```bash
npx mana status
```

---

## Using the Legacy CLI for Ascension

You can also run Ascension directly from the CMPSBL CLI:

```bash
npx @cmpsbl/cli ascend your-file.ts
```

This runs the full 8-stage pipeline (upload, classify, register, collide, discover, score, export, protect) and generates a native-language ascension receipt in your project directory.

After Ascension completes, you'll be invited to install Mana for persistent Layer 2 governance.

---

## Your API Key & Developer Account

Your developer account is **the same** whether you register through:
- The CMPSBL website (cmpsbl.com/api-access)
- The Mana CLI (`npx mana attach`)
- The Legacy CLI (`npx @cmpsbl/cli login`)

One email = one developer profile. All your API keys, usage, and history are tracked in the same place.

---

## Requirements

- Your ascended file (you already have it)
- Node.js 18 or newer
- `@cmpsbl/runtime` package (included in your export)

For the terminal experience (optional):
- Any terminal / command line
- An API key (free — register with your email)

---

## Supported Languages

Your original code can be in any of 90+ languages. The ascended layer works with all of them.

**Most common:** JavaScript, TypeScript, Python, Rust, Go, Java, C#, Ruby, PHP, Swift, Kotlin, Dart, C, C++, Solidity

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Not sure which file to use | Use the `.ascended` version. Your original is the backup. |
| Health endpoint returns errors | Make sure `@cmpsbl/runtime` is installed: `npm install @cmpsbl/runtime` |
| `npx mana attach` not working | Make sure you're in your project directory with source files |
| Want to go back to original | Just switch your import back to the original file. Nothing was modified. |
| Don't have terminal access | No problem — Enhanced capabilities are already active in your ascended file |
| Receipt file is .json | Update to the latest CLI — native-language receipts are now standard |

---

## Summary

| What | How |
|------|-----|
| **Get capabilities** | Already active — use the ascended file |
| **Use in production** | Import from `session.exports` instead of directly |
| **Check health** | `session.healthCheck()` or `npx mana status` |
| **Add more capabilities** | `npx mana attach` → choose Protected or Advanced |
| **Change configuration** | `npx mana config` |
| **Go back to original** | Switch your import — original file was never touched |
| **Run Ascension from terminal** | `cmpsbl ascend <file>` or use the website |

---

## Support

- **Email:** support@cmpsbl.com
- **CLI:** `npx mana help`
- **Reconfigure:** `npx mana config`

---

**CMPSBL®** · Governed Cognitive Infrastructure
Protected under U.S. Patent App. No. 64/029,678 (Ascension™ Discovery) & 64/031,637 (Mana™ Silent Symbiosis)
© 2025–2026 CMPSBL® · PromptFluid™ · All rights reserved.
