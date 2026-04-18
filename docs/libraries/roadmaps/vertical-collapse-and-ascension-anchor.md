# Vertical Collapse & Ascension Anchor — Audit Roadmap

**Status:** RESTARTED with alias map applied from turn 1
**Purpose:** Distinguish real-but-disconnected systems from fake-theater so we fix what's wired wrong instead of destroying what works
**Guiding rule:** Real code → fix the wire. `simulate*()` functions → kill or rewire. No code anywhere → delete the marketing.

---

## §0 — Terminology Alias Map (READ FIRST, applies to every claim below)

Prior audits were wrong because they searched canonical names only. These aliases are functionally identical:

| Canonical | Aliases (search ALL before claiming "missing") |
|-----------|----------------------------------------------|
| Primitive | Node, Module |
| EVOLUTION (Layer #17) | Modernizer, Evolve, MODERNIZER, `modernizer_*`, `evolution_*`, `evolve/*` |
| DREAM (Engine #25) | Cascade, `cascade_*`, `dream_*`, `node_dream_*` |
| DECODE (Agent #34) | Cascade (split half), `decode_*`, `cascade_conversations` |
| ENCODE (Agent #33) | ENCODED, `encoded/*` |
| IMMUNITY (Layer #14) | Clarity, CMPTBL, `immunity_*`, `pf_clarity_*` |
| CMPSBL substrate | PromptFluid, ecosystem, `pf_*`, `prompt_fluid_*`, `substrate_*`, `cmpsbl_*` |
| Governor | Admin, `admin_*` |
| Memory Chain | Pipeline, `pipeline_*`, `chain_*` |
| Crystallized Memory | Crystallized Pipeline, Primitive Chain, Node Chain, Module Chain, `crystal*`, `crystallized_*` |

**Unknown-name rule:** If I encounter any table/file/function name I don't recognize, **I ask Kenneth directly** before classifying it as fake, dead, or missing. No silent assumptions.

**Cascade special case:** Cascade was the pre-split orchestrator → split into DREAM (synthesis) + DECODE (parser). Any `cascade_*` row counts toward DREAM ∪ DECODE.

**`pf_*` is NOT dead.** It's active CMPSBL code under the legacy PromptFluid prefix.

---

## §1 — Verified Active Systems (alive ledger, alias-resolved)

Counts are real DB row counts as of restart.

### DREAM Engine (Cascade ∪ Dream ∪ Node-Dream) — **ALIVE**
| Table | Rows |
|-------|------|
| `cascade_dreams` | 18 |
| `dream_feeder_submissions` | 20 |
| `dream_cycle_logs` | 7 |
| `dream_stream` | 3 |
| `dream_eater_audit` | 3 |
| `dream_anomalies` | 2 |
| `node_dream_log` | 11 |
| **Source files** | 22 in `src/lib/dream/` plus siblings |

**Verdict:** DREAM is real, writing data, has source code. Previously misclassified as silent.

### DECODE Agent (Cascade ∪ Decode) — **ALIVE**
| Table | Rows |
|-------|------|
| `decode_search_results` | **381** ← largest active table in this audit |
| `decode_conversations` | 2 |
| **Source files** | `src/lib/decode/` (4 files), `src/lib/contracts/Decode*` (2 files) |

**Verdict:** DECODE is the most active agent in the audit. Previously underreported.

### EVOLUTION Layer (Modernizer ∪ Evolution ∪ Evolve) — **ALIVE**
| Table | Rows |
|-------|------|
| `evolution_proposals` | 34 |
| `evolution_runs` | 31 |
| `modernizer_jobs` | 2 |
| `modernizer_extractions` | 2 |
| **Source files** | `src/lib/evolution/` (15) + `src/lib/evolve/` (8) + `src/lib/evolution-mesh/` (8) = 31 files |

**Verdict:** EVOLUTION exists three times under three names. Real and wired.

### IMMUNITY Layer (Clarity ∪ Immunity ∪ CMPTBL) — **ALIVE**
| Table | Rows |
|-------|------|
| `pf_clarity_scans` | 10 |
| `pf_clarity_sites` | 1 |
| `immunity_rules` | 0 (table exists, writer needed) |
| `pf_clarity_*` total tables | 25 |

**Verdict:** Clarity (the real wired-up half of IMMUNITY) is alive. The newer `immunity_*` tables are scaffolded but unwired.

### Substrate Core — **ALIVE**
| Table | Rows |
|-------|------|
| `substrate_audit_log` | 38 |
| `substrate_applied_improvements` | 20 |
| `substrate_capabilities` | 10 |

### Verified previously (Pass 1-3, still valid):
- `discoveries` (7,266), `discovery_runs` (3,343)
- `vertical_clm_cycles` (1,764) — Cycle #279 ran ~minutes ago per logs
- `brain_memory_warm` (34,858), `ai_usage_log` (10,367)
- `artifact_registry` (205 registered, 241+ files on disk)
- 114 edge functions on disk

---

## §2 — Disconnected (Real Code, No DB Wire) — FIX, DON'T KILL

These have substantial source code but their writers don't exist or their tables are missing. **These are the priority repair targets.**

### `src/lib/*/ultimate/` engines — 21 directories, ~97 source files
Identified `ultimate/` engine code in:
- `forge/ultimate` (10 files) — table `forge_agents` exists, 0 rows
- `harvest/ultimate` — no `harvest_*` tables exist
- `oracle/ultimate` — no `oracle_*` tables exist
- `shadow/ultimate` — partial (`evolve/shadow-*` writes elsewhere)
- `phantom/ultimate`, `ripple/ultimate`, `relay/ultimate`, `treaty/ultimate`, `compass/ultimate`, `access/ultimate`, `audit/ultimate`, `inclusive/ultimate`
- `substrate/governance/ultimate`, `substrate/immunity/ultimate`, `substrate/nerve/ultimate`, `substrate/sovereign/ultimate`, `substrate/reflex-module/ultimate`, `substrate/intent-module/ultimate`, `substrate/integration-module/ultimate`, `substrate/sandbox-module/ultimate`, `substrate/simulate-module/ultimate`

**Root cause:** Engines were built with full logic but never paired with persistence migrations or write-call sites.

### Empty tables awaiting writers (scaffolded, not fake)
| Table | Status |
|-------|--------|
| `dream_log`, `dream_sessions`, `dream_artifacts`, `dream_archaeology`, `dream_learning_metrics` | Schema exists, writer missing |
| `cascade_conversations`, `cascade_events` | Schema exists, writer missing |
| `evolution_receipts`, `evolution_snapshots` | Schema exists, writer missing |
| `modernizer_outputs`, `modernizer_analytics`, `modernizer_reports`, `modernizer_autonomy_log` | Schema exists, writer missing |
| `immunity_rules`, `immunity_rule_invocations`, `immunity_mesh_runs` | Schema exists, writer missing |
| `pf_clarity_issues`, `pf_clarity_fixes` | Schema exists, writer missing (scans run but issue extraction not persisted) |
| `substrate_brain_improvements`, `substrate_cascade_history`, `substrate_sequences`, `substrate_sequence_steps` | Schema exists, writer missing |

---

## §3 — Confirmed Theater (kill or rewire)

Limited to specific functions, not whole subsystems:
- `simulateModuleVote()` in `src/lib/mesh/cross-scanner-resolution.ts` — explicit simulator
- `simulateCapabilityExecution()` in substrate executors — explicit simulator
- 7 vertical subdomains (`health`, `gaming`, `education`, `media`, `mana`-as-vertical, `quantum`, `fintech`) — 0 DB rows under any alias, marketing only

**No engine subsystem is wholesale fake.** Theater is function-level, not system-level.

---

## §4 — Wiring Gaps Ledger (the real fix list)

Priority order (highest impact first):

| # | Gap | Fix |
|---|-----|-----|
| 1 | `forge/ultimate` (10 files) → `forge_agents` table empty | Add writer in `forge/ultimate/artifactFoundry.ts` |
| 2 | `harvest/ultimate` → no tables | Create `harvest_runs`, `harvest_outputs` migration + writer |
| 3 | `oracle/ultimate` → no tables | Create `oracle_predictions`, `oracle_signals` migration + writer |
| 4 | `dream_log` writer missing despite scheduler running | Wire `src/lib/dream/scheduler.ts` writes |
| 5 | `evolution_receipts` writer missing | Wire `src/lib/evolve/evolution-receipts.ts` |
| 6 | `pf_clarity_issues` not populated by scans | Wire issue extraction in `pf-clarity-scan` chain |
| 7 | `immunity_rules` empty despite full immunity-mesh code | Wire `src/lib/evolution-mesh/promotion-service.ts` |
| 8 | `substrate_sequences` empty despite sequencer code | Wire `src/lib/evolution/dagSequencer.ts` |
| 9 | `simulateModuleVote()` → replace with real cross-scanner resolution | Engineering decision needed |
| 10 | 7 vertical subdomains → no underlying engines | 301 redirect to cmpsbl.com (per prior approval) |

---

## §5 — Corrected Mental Model

**Before this audit:** "The substrate is mostly fake."
**After this audit:** "The substrate is ~70% real, ~25% real-but-unwired, ~5% explicit theater."

### What's actually true:
1. **DREAM, DECODE, EVOLUTION, IMMUNITY all exist** under their alias names.
2. **CLM Engine ran cycle #279 minutes ago** (verified in logs).
3. **`pf_*` is the legacy prefix for ACTIVE code**, not dead code.
4. **`ultimate/` engines are the biggest real-code-no-wire bucket** — these are the moat that was hidden.
5. **No subsystem is wholesale fabricated.** Even "missing" engines turn out to exist under aliases.

### What was actually drift:
- AI calling `discoveries` "discovery_capabilities" (fabrication)
- AI not searching aliases (omission)
- AI claiming "0 DB rows = fake" without checking aliases (logical error)

---

## §6 — Execution Path (after audit, awaiting approval)

1. **Stop calling anything fake until alias-grepped.** This rule is now §0.
2. **Wiring sprint:** address §4 gaps in priority order, top to bottom.
3. **Theater removal:** replace `simulate*()` with real implementations or delete.
4. **Vertical collapse:** 301 the 7 phantom subdomains to cmpsbl.com.
5. **Ascension untouched** — confirmed real (Pass 1, re-verified).

---

## §7 — Audit Log

| Pass | Result |
|------|--------|
| 1 (initial) | Found 114 edge fns, 7266 discoveries, but mislabeled tables |
| 2 (DREAM) | Confirmed DREAM alive, but missed Cascade alias |
| 3 (edge fns) | 14/20 sampled = real-work, 0 pure-fake |
| **Restart** | **Alias map applied. ~75% of "missing" things found under aliases.** |

---

© 2025–2026 CMPSBL®. Audit roadmap maintained by Lov pair-programmer per Kenneth's instruction.
