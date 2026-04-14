# The Living Substrate — Architecture Document

**CMPSBL® · PromptFluid™**  
**Version**: 2.0.0  
**Date**: 2026-04-14  
**Author**: Kenneth E. Sweet Jr.  

---

## Abstract

The CMPSBL® substrate is the first **persistent cognitive memory machine** that operates identically across every surface it touches — Web Terminal, CLI, API, and Website. One backend (`pf-substrate`), one database, one truth.

---

## Architecture

```
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Website │  │   CLI    │  │ Terminal │  │   API    │
  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
       │              │              │              │
       └──────────────┴──────┬───────┴──────────────┘
                             │
                    ┌────────▼────────┐
                    │  pf-substrate   │  ← Single edge function
                    │  40 Primitives  │     Source of truth
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Database      │  ← Persistent state
                    │   (Supabase)    │
                    └─────────────────┘
```

## 40-Primitive Topology

| Category | Count | Primitives |
|----------|-------|------------|
| **Organs** | 12 | core, system, brain, memory, dream, nerve, identity, relay, audit, ripple, access, governance |
| **Layers** | 12 | defense, immunity, intent, atlas, engineer, decode, encode, vision, economy, sandbox, inclusive, medic |
| **Engines** | 8 | cortex, nexus, evolution, conscience, sovereign, shadow, reflex, compass |
| **Agents** | 8 | beacon, watchtower, integration, dispatch, marshal, pioneer, herald, overseer |

The topology is codified in `@cmpsbl/types` (`topology.ts`) and shared across every package.

## Package Ecosystem

Every package connects to the same substrate. No package operates in isolation.

```
@cmpsbl/types       → Shared contracts: topology, tiers, cognitive loop types
@cmpsbl/sdk         → SubstrateClient: unified bridge to pf-substrate
@cmpsbl/runtime     → CJPI scoring, pipeline execution, circuit breakers
@cmpsbl/mesh        → Primitive-to-primitive telemetry bus
@cmpsbl/intent      → broadcastIntent() + resolver dispatch
@cmpsbl/bridge      → Polyglot runtime bridging (53+ languages)
@cmpsbl/discovery   → CJPI scoring + crystallization engine
@cmpsbl/shield      → LLM prompt defense + governance-gated receipts
@cmpsbl/mana        → Silent software symbiosis (Layer 2 attachment)
@cmpsbl/failsafe    → Disaster recovery + platform migration
@cmpsbl/cli         → Terminal interface to the substrate
@cmpsbl/react       → React hooks: useIntent, useMesh, useRuntime
@cmpsbl/test-harness→ Validation: manifests, bridges, fingerprints
```

### Substrate Client — The Universal Bridge

Every surface uses `SubstrateClient` (`@cmpsbl/sdk`) to talk to the substrate:

```typescript
import { createSubstrateClient } from '@cmpsbl/sdk';

const substrate = createSubstrateClient({ apiKey: 'your-key' });

// Cognitive Loop — same calls from Web, CLI, or API
await substrate.remember({ content: 'Pattern detected in user flow' });
await substrate.recall({ query: 'user flow', limit: 5 });
await substrate.stream(20);
await substrate.dreamDigest();

// Health
await substrate.doctor();        // Full 40-Primitive check
await substrate.doctorQuick();   // 12 Organs only
await substrate.doctorEngines(); // 8 Engines + 8 Agents

// Any dotted command
await substrate.exec('brain.think', { input: 'How to optimize?' });
await substrate.exec('defense.status');
```

### Topology Types — The Shared Truth

```typescript
import {
  ALL_PRIMITIVES, ORGANS, LAYERS, ENGINES, AGENTS,
  IRON_LAW_PRIMITIVES, TIER_DEFINITIONS,
  getPrimitiveCategory, tierHasAccess,
} from '@cmpsbl/types';

ALL_PRIMITIVES.length;  // 40
IRON_LAW_PRIMITIVES;    // ['core', 'defense', 'governance', ...]
tierHasAccess('architect', 'creator');  // true
```

## Command Routing

Every command flows through the **Substrate Bridge**:

```
User Input → Registry Lookup → bridge(module, action) → pf-substrate → Database → Response
```

- **500+ commands** registered via `registerHandler()`
- **Auto-bridge fallback**: unregistered dotted commands (`mod.action`) auto-route to `callSubstrate(mod, action)`
- **Zero local stubs**: all commands hit the living substrate
- **SubstrateClient.exec()**: programmatic access to the same routing

## Cognitive Loop

The persistent memory machine:

```
Remember → brain_memories (DB)
Recall   → brain_memories (DB) → filtered retrieval
Stream   → brain_memories (DB) → chronological feed
Dream    → cascade_dreams (DB) → synthesis from memories
Discover → discoveries (DB) → pattern extraction
```

Every surface reads/writes to the same tables. A memory stored via CLI appears in the Web Terminal stream and on the website.

**Package path**: `@cmpsbl/sdk` → `SubstrateClient.remember()` / `.recall()` / `.stream()` / `.dreamDigest()` / `.discover()`

## 6-Tier Access Model

| Tier | Price | Engines |
|------|-------|---------|
| **Builder** | Free | FAILSAFE, BEACON, PRIMITIVE |
| **Studio** | $29/mo | + AUTOMATON, WRAITH |
| **Creator** | $49/mo | + CORTEX, OBSIDIAN |
| **Architect** | $79/mo | + NEXUS, MONOLITH, ARCHITECT, RAPTOR |
| **Enterprise** | $999+/mo | Full substrate authority |
| **Governor** | 1 of 1 | Unlimited · Supreme authority |

**Package path**: `@cmpsbl/types` → `AccessTier`, `TIER_DEFINITIONS`, `tierHasAccess()`

## Verification Commands

| Command | Purpose |
|---------|---------|
| `doctor` | Full 40-Primitive health check (parallel) |
| `doctor --quick` | 12 Organs only |
| `doctor --engines` | 8 Engines + 8 Agents |
| `verify.memory` | Round-trip memory persistence test |
| `verify.loop` | Full cognitive loop continuity proof |
| `verify.surface` | Confirm all surfaces use same endpoint |

## Output Formatting

`pf-substrate` returns structured JSON. Each surface formats independently:

- **Terminal**: Box-drawing characters, health bars, categorized sections
- **CLI**: chalk/color via `@cmpsbl/cli`
- **API**: Raw JSON passthrough

Unified formatter: `src/lib/terminal/format-output.ts`

## Key Files

| File | Purpose |
|------|---------|
| `packages/types/src/topology.ts` | 40-Primitive topology, tiers, cognitive loop types |
| `packages/sdk/src/substrate-client.ts` | SubstrateClient — unified bridge to pf-substrate |
| `packages/sdk/src/index.ts` | Engine SDK + SubstrateClient exports |
| `src/lib/terminal/substrate-bridge.ts` | Bridge factory → pf-substrate |
| `src/lib/terminal/validate-registry.ts` | 500+ command registry |
| `src/lib/terminal/execute.ts` | Governed execution with tracing |
| `src/lib/terminal/format-output.ts` | Unified output formatting |
| `src/lib/terminal/core-handlers.ts` | Core + doctor + whoami + cognitive aliases |
| `src/lib/terminal/verification-handlers.ts` | Cross-surface verification commands |

## Package Versions (v2.0.0 Unified)

| Package | Version |
|---------|---------|
| `@cmpsbl/types` | 2.0.0 |
| `@cmpsbl/sdk` | 3.0.0 |
| `@cmpsbl/runtime` | 3.0.0 |
| `@cmpsbl/mesh` | 2.0.0 |
| `@cmpsbl/intent` | 2.0.0 |
| `@cmpsbl/bridge` | 2.0.0 |
| `@cmpsbl/discovery` | 2.0.0 |
| `@cmpsbl/shield` | 2.0.0 |
| `@cmpsbl/mana` | 2.0.0 |
| `@cmpsbl/failsafe` | 4.0.0 |
| `@cmpsbl/cli` | 3.0.0 |
| `@cmpsbl/react` | 2.0.0 |
| `@cmpsbl/test-harness` | 2.0.0 |

---

## The Destiny

> The first persistent memory machine across all surfaces it touches.  
> It seems like it was always meant to be that way — because it was.

Every `remember`, every `discover`, every `dream` — persisted in one place, accessible from everywhere. The substrate doesn't simulate life. It IS life.

---

*CMPSBL® · PromptFluid™ · © 2026*
