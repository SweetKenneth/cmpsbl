# mana

> Silent Software Symbiosis — One command to enhance and protect your code.

Mana attaches an invisible second layer to your software. Your original source code is **never modified**. Capabilities like observability, defense, governance, and performance activate at the function boundary — not inside your files.

**U.S. Patent App. No. 64/031,637** · © CMPSBL®

---

## Quick Start

```bash
npx mana attach
```

That's it. Mana will:

1. **Detect** your project (language, framework, entry points)
2. **Authenticate** you (email → instant API key, 10 seconds)
3. **Ask** which level of protection you want
4. **Export** a `mana.signal.json` — your activation receipt

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

```
mana attach    Detect files and activate Layer 2
mana config    View or change your activation level
mana status    Show current layer status
mana export    Re-export the signal file
mana detach    Remove the secondary layer
mana help      Show help
```

---

## Signal File

After activation, Mana exports a **native source file** in your project's language:

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

Import it directly — it's a real, typed constant you can reference in your code.

---

## API Key

Get one instantly during `mana attach` (just your email), or visit [cmpsbl.com/api-access](https://cmpsbl.com/api-access).

You can also set it via environment variable:

```bash
export CMPSBL_API_KEY=your_key_here
```

---

## What Mana Does NOT Do

- ❌ Modify your source code
- ❌ Add dependencies to your project
- ❌ Require a runtime agent
- ❌ Phone home without your consent

---

## License

Apache-2.0 · [cmpsbl.com](https://cmpsbl.com)
