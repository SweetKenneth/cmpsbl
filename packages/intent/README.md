# @cmpsbl/intent

> CMPSBL® Intent Router — `broadcastIntent()` + resolver dispatch for any app.

[![npm](https://img.shields.io/npm/v/@cmpsbl/intent)](https://www.npmjs.com/package/@cmpsbl/intent)

## Install

```bash
npm install @cmpsbl/intent
```

**Zero dependencies.** Self-contained. Builds standalone.

## Dependency Tier

```
Tier 1 (no deps — publish/install in any order)
```

## Usage

```typescript
import { broadcastIntent, registerResolver } from '@cmpsbl/intent';

registerResolver('analysis', (input) => ({
  resolverId: 'brain.reasoning',
  node: 'BRAIN',
  success: true,
  output: { result: 'analyzed' },
  confidence: 0.95,
  durationMs: 42,
}));

const resolution = await broadcastIntent({
  intentType: 'analysis',
  sourceModule: 'BRAIN',
  input: { query: 'test' },
});
```

## License

Apache-2.0 — © CMPSBL®
