# @cmpsbl/mesh
> **CMPSBL®** — Governed Cognitive Infrastructure · [cmpsbl.com](https://cmpsbl.com)
> Protected under U.S. Patent App. No. 64/029,678 & 64/031,637 · PromptFluid™


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

---

<p align="center">
  <strong>CMPSBL®</strong> · Governed Cognitive Infrastructure<br>
  U.S. Patent App. No. 64/029,678 (Ascension™) · 64/031,637 (Mana™)<br>
  <a href="https://cmpsbl.com">cmpsbl.com</a> · <code>npm i @cmpsbl/cli</code><br>
  © 2025–2026 CMPSBL® · PromptFluid™
</p>
