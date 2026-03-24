# @cmpsbl/test-harness

> CMPSBL® Test Harness — Validate pipelines, manifests, bridge adapters, and first-contact flows.

[![npm](https://img.shields.io/npm/v/@cmpsbl/test-harness)](https://www.npmjs.com/package/@cmpsbl/test-harness)

## Install

> ⚠️ **Install peer dependencies first:**

```bash
# Step 1: Install peer deps (Tier 1 packages)
npm install @cmpsbl/runtime @cmpsbl/bridge

# Step 2: Install test-harness
npm install @cmpsbl/test-harness
```

## Dependency Tier

```
Tier 1 (install first)          Tier 2 (install after Tier 1)
├── @cmpsbl/runtime      ──→    @cmpsbl/test-harness  ← YOU ARE HERE
└── @cmpsbl/bridge       ──→
```

## Usage

```typescript
import { validateManifest, formatTestResults } from '@cmpsbl/test-harness';

const result = validateManifest(JSON.stringify({
  name: 'my-pipeline', cjpi: 85, tier: 'Mythic',
  modules: ['BRAIN', 'MEMORY'], exported: '2026-03-24',
  runtime: 'cmpsbl-mini-runtime-engine',
  targets: ['typescript'], version: '1.0.0',
}));

console.log(formatTestResults(result));
```

## License

Apache-2.0 — © CMPSBL®
