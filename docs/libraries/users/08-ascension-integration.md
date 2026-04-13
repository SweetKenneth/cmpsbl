# Ascension — User Guide

---

## What Is Ascension?

Ascension adds a second layer to your code. This layer enhances and protects your software without modifying it.

Your original file stays exactly as it is. A new governed layer wraps around it — adding validation, observability, stability, and defense depending on the level you choose.

One command. One choice. Done.

---

## Requirements

- **Creator tier** or above
- API key with `ascension` scope
- Working source code (any of 90+ supported languages)

---

## Install

```bash
npx mana attach
```

That's it. The CLI handles everything from here.

---

## What Happens

### 1. Detection

After running the command, the CLI detects your file and confirms:

```
Ascension has detected that your file now has a second layer.

This layer enhances and protects your code without modifying it.
```

### 2. Choose Your Level

You're presented with four options:

| Level | What It Does |
|-------|-------------|
| **Safe** | Minimal protection — basic validation + telemetry |
| **Enhanced** | Adds observability + stability — recommended for most users |
| **Protected** | Full defense + governance — blocks unsafe execution paths |
| **Advanced** | Fine-grained control over capability groups |

Pick one. Move on.

### 3. Confirmation

```
Ascension is now active.

Your file is running with a secondary layer.

Original code remains unchanged.
```

### 4. Return Anytime

To reopen the configuration menu:

```bash
@cmpsbl/config
```

---

## Advanced Configuration

If you selected **Advanced**, you toggle capability groups — not individual primitives.

| Group | What It Controls |
|-------|-----------------|
| **Defense** | Threat detection, circuit breakers, execution blocking |
| **Observability** | Telemetry, health signals, runtime tracing |
| **Memory** | Persistent recall, session history, knowledge retention |
| **Governance** | Policy enforcement, compliance checks, audit trails |
| **Performance** | Caching, optimization hints, resource efficiency |

Enable or disable entire groups. No deeper configuration required.

---

## What Ships

Every Ascension export contains:

1. **Your original source code** — untouched, unmodified
2. **Your ascended file** — the governed version with Layer 2 active
3. **User guide** — this document
4. **License** — usage terms

That's the complete package.

---

## Supported Languages

90+ languages across every major category:

- **Web / Scripting:** JavaScript, TypeScript, Python, Ruby, PHP, Lua, Perl, R, Julia, and more
- **Systems:** Rust, Go, C, C++, Zig, Nim, Crystal, D
- **JVM:** Java, Kotlin, Scala, Clojure
- **.NET:** C#, F#, Visual Basic, PowerShell
- **Mobile:** Swift, Dart, Objective-C
- **Functional:** Haskell, OCaml, Erlang, Elixir
- **Blockchain:** Solidity, Vyper, Move, Cairo, Fe
- **Hardware Description:** VHDL, Verilog, SystemVerilog, Chisel, and more
- **Scientific / HPC:** Fortran, MATLAB, Mathematica
- **GPU / Shaders:** GLSL, HLSL, WGSL, CUDA, OpenCL, Metal
- **Infrastructure:** Terraform/HCL, Protobuf, SQL, GraphQL, Prisma, Dockerfile

---

## Runtime Integration

For production use, the governed layer works as a drop-in replacement:

```typescript
import { init } from '@cmpsbl/runtime';
import * as handlers from './handlers';
import { readFileSync } from 'fs';

const source = readFileSync('./handlers.ts', 'utf-8');
const session = init(handlers, source, { name: 'api-handlers' });

// Same signatures, now governed
app.get('/users', session.exports.getUsers);
app.post('/users', session.exports.createUser);

// Health and status
app.get('/health', (_, res) => res.json(session.healthCheck()));
app.get('/status', (_, res) => res.json(session.status()));

app.listen(3000);
```

No changes to your original code. No framework changes. No rewrites. No lock-in.

---

## Support

- **Email:** support@cmpsbl.com
- **CLI:** `cmpsbl help`
- **Config:** `@cmpsbl/config`

---

© 2025–2026 CMPSBL®. All rights reserved.
