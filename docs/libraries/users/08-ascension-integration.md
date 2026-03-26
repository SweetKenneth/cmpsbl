# Ascension Integration

---

## Overview

The Ascension Engine lets you upload working source code and have the substrate's 40-primitive matrix discover, augment, and export enhanced capabilities. This guide covers the developer workflow.

---

## Requirements

- **Creator tier** or above
- API key with `ascension` scope
- Source files in any of 25 supported languages

---

## Workflow

### 1. Upload

```bash
# Via CLI
cmpsbl ascension upload ./my-trading-bot.py

# Via API
curl -X POST https://api.cmpsbl.ai/api/v1/ascension/upload \
  -H "Authorization: Bearer pf_live_xxx" \
  -F "file=@my-trading-bot.py"
```

### 2. Monitor Discovery

```bash
# Check status
cmpsbl ascension status <discovery-id>

# Or watch in real-time
cmpsbl ascension watch <discovery-id>
```

The 40-primitive matrix tests your code. Each primitive asks whether your code's behavior combines meaningfully with its capabilities. Results include:

- **CJPI Score** — novelty, utility, complexity, composability
- **Execution trace** — exactly which primitives participated
- **Execution strategy** — native, bridge, or simulated

### 3. Export

```bash
cmpsbl ascension export <discovery-id> --format zip
```

The export contains:
1. Original source code (untouched)
2. Mini-Runtime Engine
3. Cognitive layer (substrate augmentations)
4. Auto-generated documentation
5. Test bench

---

## Supported Languages

**Software (18):** JavaScript, TypeScript, Python, Rust, Go, Java, C, C++, C#, Ruby, Swift, Kotlin, PHP, Scala, Lua, R, Dart, Elixir

**Hardware Description (7):** VHDL, Verilog, SystemVerilog, Chisel, SpinalHDL, Amaranth, FIRRTL

---

## Execution Strategies

| Strategy | When Used | How It Works |
|----------|----------|-------------|
| **Native** | JavaScript/TypeScript | Code runs directly in substrate runtime |
| **Bridge** | Other languages | Substrate wraps execution, captures I/O |
| **Simulated** | HDL / edge cases | Behavioral modeling of code patterns |

---

## Best Practices

1. **Upload working code** — Ascension evolves functional software, not broken scripts
2. **Use descriptive file names** — helps the discovery engine understand context
3. **Start with familiar code** — verify discoveries against known behavior
4. **Check execution traces** — understand exactly what the substrate found
5. **Review exported capabilities** — verify the augmented code matches your expectations

---

© 2025–2026 CMPSBL®. All rights reserved.
