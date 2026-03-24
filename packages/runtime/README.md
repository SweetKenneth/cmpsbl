# @cmpsbl/runtime

> CMPSBL® Mini-Runtime™ Engine — CJPI scoring, manifest parsing, pipeline execution, and First Contact ceremony.

[![npm](https://img.shields.io/npm/v/@cmpsbl/runtime)](https://www.npmjs.com/package/@cmpsbl/runtime)

## Install

```bash
npm install @cmpsbl/runtime
```

**Zero dependencies.** Self-contained — all types are inlined. Builds and installs standalone.

## Dependency Tier

```
Tier 1 (no deps — publish/install in any order)
├── @cmpsbl/types
├── @cmpsbl/runtime     ← YOU ARE HERE
├── @cmpsbl/intent
├── @cmpsbl/mesh
├── @cmpsbl/bridge
├── @cmpsbl/discovery
└── @cmpsbl/failsafe
```

## What's Inside

| Export | Description |
|--------|-------------|
| `computeCJPI()` / `tierFromCJPI()` | CJPI scoring engine |
| `parseManifest()` / `generateManifest()` | Manifest parsing & generation |
| `executeChain()` / `executePrimitive()` | Pipeline execution |
| `StateMachine` | Finite state machine |
| `topologicalSort()` | Dependency graph resolution |
| `createRuntime()` | Factory returning full `MiniRuntime` |
| `initFirstContact()` | Cinematic boot ceremony |
| `discoverMemory()` / `captureMemory()` | Memory Stream discovery |
| `DOMAIN_PATTERNS` | Domain patterns for all 11 packages |

## Usage

```typescript
import { computeCJPI, createRuntime, initFirstContact } from '@cmpsbl/runtime';

const score = computeCJPI({ novelty: 80, utility: 90, complexity: 70, composability: 85 });
console.log(score.tier); // 'Mythic'
```

## License

Apache-2.0 — © CMPSBL®
