# @cmpsbl/types

> Shared TypeScript type definitions for the CMPSBL® substrate.

[![npm](https://img.shields.io/npm/v/@cmpsbl/types)](https://www.npmjs.com/package/@cmpsbl/types)

## Install

```bash
npm install @cmpsbl/types
```

**No dependencies.** This is the foundation package — install it first.

## Dependency Tier

```
Tier 1 (no deps — publish/install first)
├── @cmpsbl/types       ← YOU ARE HERE
├── @cmpsbl/runtime
├── @cmpsbl/intent
├── @cmpsbl/mesh
├── @cmpsbl/bridge
├── @cmpsbl/discovery
└── @cmpsbl/failsafe
```

## What's Inside

| Export | Description |
|--------|-------------|
| `CJPIInput` / `CJPIScoreBreakdown` | CJPI scoring interfaces |
| `CrystallizedTier` / `ProductTier` | Tier classification types |
| `CmpsblManifest` | Pipeline manifest schema |
| `ChainManifest` / `ChainResult` | Chain execution contracts |
| `MeshIntent` / `MeshReceipt` | Intent routing types |
| `MeshCommEvent` / `MeshSignalCategory` | Mesh telemetry event shapes |
| `ResolverDefinition` / `ResolverResponse` | Resolver contracts |
| `SubstratePrimitive` / `PrimitiveHealth` | 40 canonical primitives |
| `FirstContactConfig` / `MemoryChain` | First Contact ceremony types |
| `DOMAIN_PATTERNS` | Domain pattern definitions for all 11 packages |

## Usage

```typescript
import type { MeshIntent, SubstratePrimitive, CJPIInput } from '@cmpsbl/types';
import { DOMAIN_PATTERNS } from '@cmpsbl/types';
```

## License

Apache-2.0 — © CMPSBL®
