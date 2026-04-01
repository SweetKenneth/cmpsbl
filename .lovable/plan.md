# CLI Substrate Simulation & Flow Gaps — Speedrun Roadmap
## 20 credits budget · Parallel execution · Zero drift

---

## Phase 1: Optional Simulation Mode (~3 credits)
`cmpsbl simulate` — founder-created guided walkthrough teaching the substrate through "system recovery" missions. Optional. Exits anytime. Collects feedback.

### 1A. Simulation Engine (`packages/cli/src/simulation.ts`)
- `SimulationState` persisted to `~/.cmpsbl/simulation.json`
- 5 missions: Stabilize → Repair → Build → Discover → Graduate
- System health starts 35%, increases per mission
- `cmpsbl simulate` start/resume · `simulate skip` exit w/ feedback · `simulate status`

### 1B. Mission Map
| # | Mission | Teaches | Health |
|---|---------|---------|--------|
| 1 | Stabilize | `health`, `doctor`, `heal` | 35→55% |
| 2 | Repair | `forge`, `loadout`, `scan` | 55→70% |
| 3 | Build | `think`, `remember`, `recall` | 70→82% |
| 4 | Discover | `dream`, `stream`, `discover` | 82→92% |
| 5 | Graduate | `ascend`, `witness`, `topology` | 92→100% |

### 1C. Feedback on Exit
- 3-question terminal prompt → `~/.cmpsbl/feedback.json` + API POST

---

## Phase 2: Contextual Event Surfacing (~2 credits)
On boot, surface real events: new loadouts, dream digest, health changes, active goals.

---

## Phase 3: Flow Gap Filling (~3 credits)
### 3A. Natural Aliases
`start/setup/begin` → init/simulate · `build/create` → forge · `connect` → login · `activate` → loadout · `stabilize/recover` → heal · `train/learn` → simulate · `explore` → explain · `search/find` → recall · `list/show` → nodes/status · `exit/quit` → graceful

### 3B. Multi-Response Variants
3-5 variants for status, health, help, whoami — random per invocation

### 3C. Contextual Nudges
30% post-command chance of "one more thing" based on simulation progress / unused capabilities

---

## Phase 4: Router Wiring (~2 credits)
`case 'simulate'` + aliases in switch. Simulation-aware unknown cmd responses. Post-mission celebration.

---

## Execution (Parallel Batches)
- **Batch 1**: Phase 1 (new simulation.ts) ‖ Phase 3A (aliases in index.ts)
- **Batch 2**: Phase 2 + 3B + 3C + Phase 4 (index.ts edits)

**Est: ~10 credits · Remaining ~10 for governor commands + polish**

---

## Previous: Vertical Ascension Packs (Agent-First) — Completed/Archived
