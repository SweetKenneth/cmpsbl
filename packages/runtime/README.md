# @cmpsbl/runtime

CMPSBL® Mini-Runtime™ Engine — the canonical execution runtime for the CMPSBL substrate.

## Install

```bash
npm install @cmpsbl/runtime
```

## Quick Start

```typescript
import { createRuntime } from '@cmpsbl/runtime';

const runtime = createRuntime();

// Score a discovery
const score = runtime.computeCJPI({ novelty: 80, utility: 90, complexity: 70, composability: 85 });
console.log(score.total, score.tier); // 83 'Mythic'

// Generate a manifest
const manifest = runtime.generateManifest({ name: 'my-pipeline', cjpi: 83, modules: ['BRAIN', 'CORTEX'] });

// Register custom primitives and execute chains
runtime.registerPrimitive('BRAIN', (data) => ({
  success: true, output: { analyzed: true, ...data }, confidence: 0.9, durationMs: 12, handler: 'brain-local'
}));
```

## Features

- **CJPI Scoring** — Crown Jewel Performance Index computation with weighted dimensions
- **Auto-Tiering** — Automatic tier assignment (Mint → Apex)
- **Manifest Parsing** — Parse and generate CMPSBL export manifests
- **Pipeline Execution** — Chain execution with fallback handling
- **State Machine** — Generic finite state machine
- **Dependency Graph** — Topological sort for module ordering
- **Zero Dependencies** — Pure TypeScript, runs anywhere

## License

Apache-2.0 © Kenneth E Sweet Jr
