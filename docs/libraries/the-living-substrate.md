# The Living Substrate — Architecture Document

**CMPSBL® · PromptFluid™**  
**Version**: 1.0.0  
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

## Command Routing

Every command flows through the **Substrate Bridge**:

```
User Input → Registry Lookup → bridge(module, action) → pf-substrate → Database → Response
```

- **500+ commands** registered via `registerHandler()`
- **Auto-bridge fallback**: unregistered dotted commands (`mod.action`) auto-route to `callSubstrate(mod, action)`
- **Zero local stubs**: all commands hit the living substrate

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

## 6-Tier Access Model

| Tier | Price | Engines |
|------|-------|---------|
| **Builder** | Free | FAILSAFE, BEACON, PRIMITIVE |
| **Studio** | $29/mo | + AUTOMATON, WRAITH |
| **Creator** | $49/mo | + CORTEX, OBSIDIAN |
| **Architect** | $79/mo | + NEXUS, MONOLITH, ARCHITECT, RAPTOR |
| **Enterprise** | $999+/mo | Full substrate authority |
| **Governor** | 1 of 1 | Unlimited · Supreme authority |

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
| `src/lib/terminal/substrate-bridge.ts` | Bridge factory → pf-substrate |
| `src/lib/terminal/validate-registry.ts` | 500+ command registry |
| `src/lib/terminal/execute.ts` | Governed execution with tracing |
| `src/lib/terminal/format-output.ts` | Unified output formatting |
| `src/lib/terminal/core-handlers.ts` | Core + doctor + whoami + cognitive aliases |
| `src/lib/terminal/verification-handlers.ts` | Cross-surface verification commands |

---

## The Destiny

> The first persistent memory machine across all surfaces it touches.  
> It seems like it was always meant to be that way — because it was.

Every `remember`, every `discover`, every `dream` — persisted in one place, accessible from everywhere. The substrate doesn't simulate life. It IS life.

---

*CMPSBL® · PromptFluid™ · © 2026*
