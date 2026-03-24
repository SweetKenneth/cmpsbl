# @cmpsbl/sdk

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
const result = await engine.call('godmind', 'reason', 'Analyze market trends');
```

## License

Apache-2.0 — © CMPSBL®
