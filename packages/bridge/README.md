# @cmpsbl/bridge

> CMPSBL® Bridge Adapter Framework — Wire Python, Go, Rust, and 20+ language runtimes to the substrate.

[![npm](https://img.shields.io/npm/v/@cmpsbl/bridge)](https://www.npmjs.com/package/@cmpsbl/bridge)

## Install

```bash
npm install @cmpsbl/bridge
```

**Zero dependencies.** Self-contained. Builds standalone.

## Dependency Tier

```
Tier 1 (no deps — publish/install in any order)
```

## Usage

```typescript
import { createBridge } from '@cmpsbl/bridge';

const python = createBridge({ language: 'python', endpoint: 'http://localhost:8000' });
const result = await python.executePrimitive('analyze', { data: [1, 2, 3] }, 0.9);
```

## Supported Languages

TypeScript · JavaScript · Python · Go · Rust · Java · C# · Ruby · PHP · Swift · Kotlin · Scala · Dart · Elixir · C++ · C · Zig · Lua · R · Julia · Haskell · OCaml · Verilog · VHDL

## License

Apache-2.0 — © CMPSBL®
