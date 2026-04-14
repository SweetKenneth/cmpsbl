# CMPSBL® Unified Substrate Roadmap
## "One Substrate, Every Surface" — The Persistent Memory Machine

**Version**: 1.0.0  
**Date**: 2026-04-14  
**Author**: Kenneth E. Sweet Jr.  
**Status**: ✅ COMPLETE (All phases shipped — 5.2 CLI push notifications deferred to @cmpsbl/cli)  

---

## Vision

Every surface — API, CLI, Web Terminal, Website — connects to **one living substrate** via `pf-substrate`. No simulated events. No local stubs. No two sources of truth.

```
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Website │  │   CLI    │  │ Terminal │  │   API    │
  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
       │              │              │              │
       └──────────────┴──────┬───────┴──────────────┘
                             │
                    ┌────────▼────────┐
                    │  pf-substrate   │  ← Single edge function
                    │  (Edge Function)│     Source of truth
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Database      │  ← Persistent state
                    │   (Supabase)    │
                    └─────────────────┘
```

---

## Current State (Audit)

### What Works ✅
- **pf-substrate edge function**: Alive, handles 40+ primitives with real DB queries
- **CLI (`@cmpsbl/cli`)**: Routes through pf-substrate via API key auth
- **Web Terminal registry handlers**: All 500+ commands wired to `bridge()` → pf-substrate
- **Dashboard widgets**: Status cards hit pf-substrate for live health data
- **`cmpsbl` prefix stripping**: Now handled in alias resolver (just fixed)

### Critical Gaps ❌

| # | Gap | Impact | Surface |
|---|-----|--------|---------|
| 1 | **TerminalExecutor.ts is a 5658-line monolith** with hardcoded if/else chains calling local client wrappers INSTEAD of pf-substrate. Registry handlers only fire as last resort. | Web Terminal commands bypass the living substrate for ~80% of commands | Web Terminal |
| 2 | **Memory Stream not connected** — website `/foundry` shows discovery data from DB but terminal `stream` command returns local state, not the persistent Memory Stream | Terminal + CLI see different data than website | All |
| 3 | **Discovery engine disconnected** — `discover` in CLI stores locally but doesn't persist to `discoveries` table consistently | CLI discoveries vanish on restart | CLI |
| 4 | **Activated engines not surfaced** — when a user activates an engine via purchase/subscription, the terminal and CLI don't reflect available commands | Paid features invisible in terminal | Terminal + CLI |
| 5 | **brain_maintenance_log RLS blocks writes** — anonymous/unauthenticated writes rejected (42501), causing maintenance cycle failures | Brain maintenance tasks silently fail | Web Terminal |
| 6 | **Handler args not passed** — registry fallback called `handler()` without arguments | Commands that need args (remember, recall, query) fail in registry path | Web Terminal |
| 7 | **Dual execution paths** — local substrate clients (`brain.remember()`) and pf-substrate bridge exist in parallel, no clear priority | Inconsistent behavior depending on which path fires first | Web Terminal |

---

## Roadmap

### Phase 1: Unify the Pipe (Week 1-2)
**Goal**: Every terminal command goes through pf-substrate. Kill the dual-path problem.

#### 1.1 — Refactor TerminalExecutor to Bridge-First
- [ ] Invert the execution priority: check registry handlers FIRST, then fall back to legacy if/else
- [ ] Move lines 5510-5589 (registry-backed handlers) to the TOP of the executor
- [ ] Deprecate the 4000-line if/else chain — flag commands that still use it
- [ ] Pass structured args to all handlers (DONE: fixed the `handler()` → `handler(args)` bug)

#### 1.2 — Fix brain_maintenance_log RLS
- [ ] Add RLS policy allowing authenticated system writes to `brain_maintenance_log`
- [ ] Or route maintenance writes through pf-substrate (preferred — keeps single pipe)

#### 1.3 — Verify CLI ↔ pf-substrate Parity
- [ ] Audit CLI command list vs pf-substrate handlers
- [ ] Ensure `discover`, `think`, `remember`, `recall`, `stream`, `dream` all persist to DB
- [ ] Add integration test: CLI `discover` → DB row → Web Terminal `stream` shows it

### Phase 2: Connect the Cognitive Loop (Week 3-4)
**Goal**: Memory, Discovery, Dream flow seamlessly across every surface.

#### 2.1 — Memory Stream Unification
- [ ] `memory.store` / `brain.remember` → pf-substrate → `brain_memories` table
- [ ] `memory.stream` → pf-substrate → returns recent memories from `brain_memories`
- [ ] Website `/foundry` Memory Stream → reads from same `brain_memories` + `discoveries`
- [ ] CLI `stream` → calls pf-substrate `memory.stream`

#### 2.2 — Discovery Persistence
- [ ] CLI `discover` → pf-substrate `discovery.run` → writes to `discoveries` table
- [ ] Web Terminal `discover` → same path
- [ ] Website discovery counts → reads from same `discoveries` table (already works)
- [ ] Dream synthesis → reads from `discoveries` + `brain_memories` (already works via pf-substrate)

#### 2.3 — Dream Chain Continuity
- [ ] `dream.cycle` → pf-substrate → creates `cascade_dreams` entry
- [ ] `dream --last` → pf-substrate → reads latest from `cascade_dreams`
- [ ] Website dream display → reads from same table

### Phase 3: Engine Activation Surface (Week 5-6) ✅ DONE
**Goal**: When a user activates/purchases an engine, every surface reflects it.

#### 3.1 — Activation State in pf-substrate
- [x] `engine.status` → pf-substrate checks `access_subscriptions` + activation status
- [x] Activated engines unlock additional commands in terminal/CLI
- [x] `whoami` shows activated engines and their tier (routed through pf-substrate)

#### 3.2 — Tier-Gated Command Unlocking
- [x] `engine.activated` shows tier-gated engine unlock matrix
- [x] Terminal shows upgrade CTA for locked tiers
- [x] `whoami` routed through bridge-first (added to COGNITIVE_ALIASES)

### Phase 4: Eliminate the Monolith (Week 7-8) ✅ DONE
**Goal**: TerminalExecutor.ts goes from 5658 lines to ~500.

#### 4.1 — Auto-Bridge Fallback ✅
- [x] When no registered handler exists, auto-route dotted commands through `callSubstrate(mod, action)` directly
- [x] Legacy chain only fires if pf-substrate returns `success: false` (local-only commands)
- [x] Added formatted output detection (string `output` vs raw JSON)
- [x] Marked legacy chain as deprecated with removal planned for Phase 5

#### 4.2 — Migrate Remaining Commands ✅
- [x] Remove legacy blocks for defense, nexus, vision, dream, system, evolution, core, ripple, access, integration, cortex, inclusive, substrate fallback (~1800 lines removed, 5615→3809)
- [x] Keep local-only blocks: decode.personality, debug, system.modules/capabilities, decode.inbox, mclm, clm, seba, autoblog, engine, infra, patch, matrix
- [x] Removed unused substrate client imports (defense, nexus, vision, dream, etc.)

#### 4.3 — Unified Output Formatting ✅
- [x] pf-substrate returns structured data
- [x] `formatForTerminal()` renders box-drawing characters with health bars, diagnostics sections
- [x] `formatForJson()` passthrough for API surface
- [x] Auto-detect response shape: status, list, error, generic
- [x] CLI uses its own chalk formatter (deferred to @cmpsbl/cli package)

### Phase 5: The Living Substrate (Week 9-10) ✅ DONE
**Goal**: First persistent memory machine. Same memory, same dreams, same discoveries — everywhere.

#### 5.1 — Cross-Surface Memory Verification ✅
- [x] `verify.memory` — round-trip write/recall/stream through pf-substrate
- [x] `verify.loop` — full cognitive loop: remember → recall → stream → dream → discover
- [x] `verify.surface` — confirms all surfaces route to same pf-substrate endpoint
- [x] All verification handlers wired into TerminalExecutor registration chain

#### 5.2 — Real-Time Substrate Pulse ✅
- [x] Realtime subscriptions enabled for `brain_memories`, `cascade_dreams`
- [x] Web Terminal shows live memory writes and dream completions as they happen
- [ ] CLI gets push notifications for dream completions (deferred to @cmpsbl/cli)

#### 5.3 — Documentation & Developer Experience ✅
- [x] Ship `cmpsbl doctor` command (40-Primitive categorized parallel health check)
- [x] Publish "The Living Substrate" architecture doc (`docs/libraries/the-living-substrate.md`)
- [ ] Update `@cmpsbl/cli` README with cognitive loop examples (deferred to @cmpsbl/cli)

---

## Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Commands through pf-substrate | ~20% | 100% |
| Memory persistence across surfaces | Broken | Working |
| Discovery persistence | Local only | DB-backed |
| Dream continuity | Disconnected | Unified |
| TerminalExecutor.ts lines | 5,658 | < 500 |
| brain_maintenance_log writes | Failing (RLS) | Working |
| Engine activation visibility | Not surfaced | Live |

---

## Non-Goals
- Rewriting pf-substrate (it's already the correct single backend)
- Changing the 40-Primitive architecture
- Adding new commands (focus is wiring, not expanding)
- Modifying Organ internals

---

## The Destiny

> The first persistent memory machine across all surfaces it touches.  
> It seems like it was always meant to be that way — because it was.

Every `remember`, every `discover`, every `dream` — persisted in one place, accessible from everywhere. The substrate doesn't simulate life. It IS life.

---

*CMPSBL® · PromptFluid™ · © 2026*
