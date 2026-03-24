# @cmpsbl/mesh

> CMPSBL® Mesh Telemetry Client — Emit and subscribe to primitive-to-primitive communication events.

[![npm](https://img.shields.io/npm/v/@cmpsbl/mesh)](https://www.npmjs.com/package/@cmpsbl/mesh)

## Install

```bash
npm install @cmpsbl/mesh
```

**Zero dependencies.** Self-contained. Builds standalone.

## Dependency Tier

```
Tier 1 (no deps — publish/install in any order)
```

## Usage

```typescript
import { emit, subscribe, createSignal } from '@cmpsbl/mesh';

subscribe((event) => {
  console.log(`${event.source_module} → ${event.target_module}`);
});

emit(createSignal('BRAIN', 'MEMORY', 'store_context', 'processing'));
```

## License

Apache-2.0 — © CMPSBL®
