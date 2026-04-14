# @cmpsbl/sdk
> **CMPSBL®** — Governed Cognitive Infrastructure · [cmpsbl.com](https://cmpsbl.com)
> Protected under U.S. Patent App. No. 64/029,678 & 64/031,637 · PromptFluid™


> CMPSBL® Engine SDK — Authenticated client for all 54 hosted engines + Memory Stream.

[![npm](https://img.shields.io/npm/v/@cmpsbl/sdk)](https://www.npmjs.com/package/@cmpsbl/sdk)

## Install

```bash
npm install @cmpsbl/sdk
```

**Zero dependencies.** Self-contained — builds and installs standalone.

## Dependency Tier

```
Tier 1 (no deps — publish/install in any order)
```

## Quick Start

```typescript
import { CMPSBL } from '@cmpsbl/sdk';

const cmpsbl = new CMPSBL({ apiKey: 'your-api-key' });

// Discovery starts automatically on first contact
const discovery = await cmpsbl.discover({ input: 'track user behavior' });

if (discovery.detected) {
  await cmpsbl.capture(discovery.memory.id);
  await cmpsbl.apply(discovery.memory.id);
}
```

## Engine API

```typescript
import { Engine } from '@cmpsbl/sdk';

const engine = new Engine('your-api-key');
const result = await engine.call('cortex', 'reason', 'Analyze market trends');
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
