# @cmpsbl/runtime

> CMPSBL® Convex Core™ Processing Layer — CJPI scoring, manifest parsing, pipeline execution, First Contact ceremony, and full 131-primitive catalog.

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
| `createRuntime()` | Factory returning full `ConvexCore` with auto-registered primitives |
| `initFirstContact()` | Cinematic boot ceremony |
| `discoverMemory()` / `captureMemory()` | Memory Stream discovery |
| `PRIMITIVE_CATALOG` | Full 131-primitive catalog across all verticals |
| `registerAllPrimitives()` | Bulk-register all ecosystem primitives |
| `getCatalogEntry()` / `getCatalogBySource()` | Primitive metadata lookups |
| `DOMAIN_PATTERNS` | Domain patterns for all 11 packages |

## Primitive Coverage

The runtime ships with handlers for **every primitive in the CMPSBL® ecosystem**:

| Source | Count | Primitives |
|--------|-------|------------|
| Spine Organs | 12 | CORE, SYSTEM, BRAIN, MEMORY, NERVE, NEXUS, IDENTITY, SOVEREIGN, ATLAS, MEDIC, RELAY, CONSCIENCE |
| Spine Layers | 12 | DEFENSE, IMMUNITY, GOVERNANCE, TREATY, EVOLUTION, REFLEX, COMPASS, INTEGRATION, INTENT, ACCESS, VISION, SHADOW |
| Original Engines | 8 | DREAM, HARVEST, FORGE, LINGUA, ECHO, PHANTOM, SANDBOX, RIPPLE |
| Original Agents | 8 | ENCODE, DECODE, AUDIT, ECONOMY, INCLUSIVE, CORTEX, ORACLE, ENGINEER |
| Cyber | 16 | WATCHTOWER, SHADE, AEGIS, CIPHER, RECON, VANGUARD, BASTION, TEMPEST, PROWLER, ONYX, SPECTER, BLACKOUT, TRACER, NOCTURNE, IRONCLAD, CITADEL |
| Robotics | 16 | SERVO, KINETIC, LIDAR, FABRICATOR, FLUX, VECTOR, TENSOR, CALIBER, GRIPPER, SWARM, ENVIRON, MARSHAL, DISPATCH, WELDER, INSPECTOR, PIONEER |
| Quantum | 16 | HADRON, QUBIT, PHOTON, FERMION, ENTANGLE, LATTICE, PLASMA, CRYOGEN, MUON, BOSON, NEUTRINO, GLUON, GRAVITON, TACHYON, MESON, PRISM |
| LLM | 16 | VERITAS, RAMPART, SYLLOGISM, LEXICON, CLARITY, FULCRUM, TETHER, SIEVE, SKEPTIC, TRIBUNAL, HERALD, MIMIC, LINEAGE, EMBARGO, GAUNTLET, CUSTODIAN |
| Agency | 16 | MANDATE, DELEGATE, RECONN, UPLINK, SCRIBE, INCENTIVE, REASON, TOOLKIT, OPERATOR, OVERSEER, LIAISON, SCHOLAR, ENVOY, WARDEN, ROGUE, ANCHOR |
| Ultimate | 11 | APEX, CONDUIT, GENESIS, CRUCIBLE, MERIDIAN, DYNAMO, SENTINEL, CATALYST, ARBITER, NOMAD, PHOENIX |
| **Total unique** | **131** | 5 shared names across verticals (ORACLE, FLUX, WELDER, PRISM, HERALD) |

## Usage

```typescript
import { createRuntime, PRIMITIVE_CATALOG, getCatalogEntry } from '@cmpsbl/runtime';

// createRuntime() auto-registers all 131 primitives
const runtime = createRuntime();

// Execute any primitive in the ecosystem — no module-not-found
const result = await runtime.executePrimitive('LEXICON', { text: 'hello' }, 0.95);
console.log(result.handler); // 'lexicon-engine'

// Look up metadata
const entry = getCatalogEntry('BASTION');
console.log(entry?.source); // 'cyber'
console.log(entry?.classification); // 'engine'

// CJPI scoring
const score = runtime.computeCJPI({ novelty: 80, utility: 90, complexity: 70, composability: 85 });
console.log(score.tier); // 'Mythic'
```

## v2.0.0 — What Changed

- **131 primitive handlers** registered automatically on `createRuntime()`
- Every vertical (Cyber, Robotics, Quantum, LLM, Agency, Ultimate) fully covered
- No more `default-fallback` — every primitive has a domain-appropriate handler
- Catalog metadata API: `getCatalogEntry()`, `getCatalogBySource()`, `getCatalogNames()`
- Runtime version bumped to `2.0.0`

## License

Apache-2.0 — © CMPSBL®
