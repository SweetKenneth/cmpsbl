# mana

> **Silent Software Symbiosis** — One command to enhance and protect your code.

[![npm](https://img.shields.io/npm/v/@cmpsbl/mana)](https://www.npmjs.com/package/@cmpsbl/mana)
[![license](https://img.shields.io/npm/l/@cmpsbl/mana)](https://opensource.org/licenses/Apache-2.0)
[![node](https://img.shields.io/node/v/@cmpsbl/mana)](https://nodejs.org)

Mana attaches an invisible second layer to your software. Your original source code is **never modified**. Capabilities like observability, defense, governance, and performance activate at the function boundary — not inside your files.

**U.S. Patent App. No. 64/031,637** · © CMPSBL® · [cmpsbl.com](https://cmpsbl.com)

---

## Quick Start

```bash
npx mana attach
```

That's it. Mana will:

1. **Detect** your project (language, framework, entry points)
2. **First Contact** — a cinematic introduction to what Mana found
3. **Authenticate** you (email → instant API key, 10 seconds)
4. **Ask** which level of protection you want
5. **Export** a native signal file in your project's language

No dependencies added. No source code modified. No runtime agent required.

---

## Levels

| Level | What it does |
|---|---|
| **Safe** | Minimal — telemetry only |
| **Enhanced** | Observability + Performance *(default, already active)* |
| **Protected** | Adds Defense + Governance |
| **Advanced** | Pick individual capability groups |

---

## Commands

| Command | Description |
|---|---|
| `mana attach` | Detect files and activate Layer 2 |
| `mana status` | Show current layer status and active capabilities |
| `mana config` | View or change your activation level |
| `mana export` | Re-export the signal file |
| `mana detach` | Remove the secondary layer (code untouched) |
| `mana version` | Show version |
| `mana help` | Show help |

---

## Signal File

After activation, Mana exports a **native source file** in your project's language — not JSON. Import it directly as a typed constant.

| Language | File Created |
|---|---|
| TypeScript | `mana.signal.ts` |
| JavaScript | `mana.signal.js` |
| Python | `mana_signal.py` |
| Rust | `mana_signal.rs` |
| Go | `mana_signal.go` |
| Ruby | `mana_signal.rb` |
| PHP | `mana_signal.php` |
| Java | `ManaSignal.java` |
| C# | `ManaSignal.cs` |
| Swift | `ManaSignal.swift` |
| Dart | `mana_signal.dart` |
| Elixir | `mana_signal.ex` |
| Other | `mana.signal.json` |

```typescript
// TypeScript example
import { MANA_SIGNAL } from './mana.signal';

if (MANA_SIGNAL.active) {
  console.log(`Layer 2 active — ${MANA_SIGNAL.level}`);
}
```

---

## Authentication

Get an API key instantly during `mana attach` (just your email), or visit [cmpsbl.com/api-access](https://cmpsbl.com/api-access).

You can also set it via environment variable:

```bash
export CMPSBL_API_KEY=your_key_here
```

Credentials are stored locally in `~/.cmpsbl/credentials` (file permissions: 600).

---

## What Mana Does

- ✅ Detects your project structure automatically (90+ file types)
- ✅ Exports a branded, typed activation receipt in your language
- ✅ Provides four tiers of capability activation
- ✅ Stores configuration in `.mana/config.json`
- ✅ Recognizes returning operators across sessions

## What Mana Does NOT Do

- ❌ Modify your source code
- ❌ Add dependencies to your project
- ❌ Require a runtime agent
- ❌ Phone home without your consent

---

## Ecosystem

Mana is the **Layer 2 deployment engine** of the CMPSBL® substrate.

- **Ascension** discovers what your code needs → [cmpsbl.com](https://cmpsbl.com)
- **Mana** deploys the integration silently → `npx mana attach`

Together they form a complete code enhancement pipeline — scan, score, attach — without touching your source.

---

## Requirements

- Node.js 18+
- Any project with source files

---

## License

Apache-2.0 · [cmpsbl.com](https://cmpsbl.com)
