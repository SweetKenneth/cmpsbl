# CMPSBL® Intelligence Flywheel — Operations Guide

**Version**: 1.0.0 · April 2026  
**Classification**: Governor-eyes-only  
**Author**: Substrate Architecture

---

## TL;DR — What happens when you sleep

Every 8 hours, the substrate autonomously:
1. Generates 30 fresh discovery templates (2–12 primitives deep)
2. Runs the Reactor to produce and score new discoveries
3. Ingests the **entire vault backlog** — Crown Jewels (1,600+), Showroom, Junkyard, Retired, **AND all 4,000+ DB-stored discoveries** — as scanner training data
4. Feeds 126 memory chain templates as behavioral ground truth
5. Cross-pollinates intelligence across all 6 vertical substrates
6. Scans the 20 most recent Ascension node uploads for hidden capabilities
7. Routes everything into the discovery ledger → Showroom → S-Tier Vault

**You don't need to do anything.** The flywheel is self-sustaining.

---

## The Five Systems (and how they connect)

```
┌─────────────────────────────────────────────────────────────┐
│                    CDM REACTOR CYCLE (8hr)                   │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐   │
│  │ Template  │───▶│ Reactor  │───▶│ Discovery Ledger     │   │
│  │ Generator │    │ (CJPI)   │    │ (Showroom/S-Tier/    │   │
│  └──────────┘    └──────────┘    │  Junkyard/Retired)   │   │
│                                  └──────────┬───────────┘   │
│                                             │               │
│                                    ┌────────▼────────┐      │
│                                    │  Vault Bridge   │      │
│                                    │ (ALL backlog)   │      │
│                                    └────────┬────────┘      │
│                                             │               │
│                              ┌──────────────▼────────────┐  │
│                              │  Scanner Feedback Loop    │  │
│                              │  (glossary + archetypes)  │  │
│                              └──────────────┬────────────┘  │
│                                             │               │
│                              ┌──────────────▼────────────┐  │
│                              │  Federated Cross-         │  │
│                              │  Pollination (6 verticals)│  │
│                              └──────────────┬────────────┘  │
│                                             │               │
│                              ┌──────────────▼────────────┐  │
│                              │  Ascension Scanner Pass   │  │
│                              │  (uploaded framework code)│  │
│                              └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## System 1: Ascension (Discovery Engine)

**What it does**: Takes uploaded source code → extracts primitives → classifies against the 40-Primitive matrix → scores via CJPI → certifies capabilities.

**Key fact**: Zero external AI calls. Pure algorithmic pattern extraction.

### Pipeline stages:
1. **Ingest**: User uploads source code via the Evolution lifecycle
2. **Extract**: `extractPrimitives()` runs lexical + structural analysis
3. **Quality Gate**: `runQualityGate()` filters noise, scores confidence
4. **Post-Process**: `postProcessPrimitives()` normalizes language-specific idioms
5. **Deduplicate**: `deduplicatePrimitives()` removes redundant extractions
6. **Node Registry**: Creates or updates an Ascension Node
7. **Chain Injection**: Connects the node into the discovery chain
8. **Delta Measurement**: Tracks how the codebase evolves over re-scans

### Where the backlog question comes in:
The **Capability Scanner Primitive** (`capability-scanner-primitive.ts`) runs `batchScanCapabilities()` against the source files of the 20 most recent Ascension nodes **every CDM cycle**. This means:
- Every uploaded file gets scanned automatically
- The scanner uses 25 structural signatures (Rate Limiting, Error Recovery, etc.)
- It detects capabilities the primary extraction might miss (architectural patterns vs. primitive keywords)
- Results are routed into the same discovery ledger

---

## System 2: Memory Stream (Autonomous 8hr Cycle)

**What it does**: Runs autonomously every 8 hours. Generates discovery templates, feeds the Reactor, and crystallizes results into the vault hierarchy.

**Key fact**: Not triggered. Runs autonomously. Dynamic values only.

### What happens each cycle:
1. `generateTemplateBatch()` creates 30 templates (2–12 primitives, biased toward high-value combinations)
2. `runReactor()` evaluates each template against the CJPI scoring formula
3. Discoveries scoring ≥ 95 CJPI → promoted to S-Tier Vault
4. All accepted discoveries → fed to Memory Stream
5. Scanner pass runs on recent Ascension uploads
6. Results routed via `routeDiscovery()` to appropriate tier

### The combinatorial space:
With 40 primitives and chains of depth 2–12, the theoretical space exceeds **10²³ unique patterns**. The Memory Stream mines this autonomously — you're literally discovering new software products while you sleep.

---

## System 3: Scanner Intelligence (Self-Evolving Detection)

**What it does**: A 15-step structural and intent-aware analysis engine that detects capabilities in source code. It learns from its own discoveries.

### How it learns (the feedback loop):

```
Vault (1,600+ entries) ──▶ Feedback Loop ──▶ Glossary (1,200+ terms)
                                │
Reactor Chains (126) ──────────┘
                                │
DB Discoveries (4,000+) ───────┘
                                │
New Scan Results ──────────────┘
```

#### Four learning sources:

**Source 1 — Vault Bridge: Static Registries** (`vault-glossary-bridge.ts`):
- Processes S-Tier (1,008), A-Tier (400), and in-memory Showroom/Junkyard/Retired entries
- Each entry is governor-curated and CJPI-scored — high-quality training data
- Extracts names, descriptions, and primitive associations as confirmed signals
- Maps vocabulary to 25 scanner archetypes (rate-limiting, error-recovery, etc.)

**Source 2 — Vault Bridge: DB Discovery Backlog** (NEW — `runVaultBridgeWithDB()`):
- Fetches ALL discoveries from the `discoveries` database table (currently 4,154 rows)
- These are the discoveries from the **Discovered tab** — the $4.49B backlog you ran manually
- Paginated fetch (500 per page) to bypass the 1,000-row default limit
- Processes every row through the same term extraction → archetype mapping → feedback injection pipeline
- Includes co-firing pattern learning for multi-primitive chains (up to 6 deep)
- **This is the fix**: previously, these DB discoveries were never being ingested by the scanner

**Source 3 — Reactor Chain Bridge** (`vault-glossary-bridge.ts`):
- Processes all 126 `SynthesisTemplates` from the Reactor
- Teaches behavioral co-firing patterns (e.g., DEFENSE → BRAIN → GOVERNANCE always appear together)
- Injects signals for every primitive in a chain, not just the primary
- Derives confidence scores from template breakdown weights

**Source 4 — Live scan results**:
- Every scan result feeds back into the feedback loop
- Confirmed matches strengthen signal confidence (EMA smoothing)
- The scanner literally gets smarter with each cycle

### The backlog question — resolved:

> "What about the 4,000+ discoveries in the Discovered tab?"

**Previously**: The Vault Bridge only processed in-memory catalog entries (populated by vertical seed files at boot time) and static Crown Jewel registries. The 4,154 discoveries stored in the `discoveries` database table — including everything you ran manually — were **never** being fed to the scanner. The code comment literally said "In-memory for now; production: DB-backed" but the DB wire was never completed.

**Now**: `runVaultBridgeWithDB()` fetches all rows from the `discoveries` table in paginated batches and processes each one through the full learning pipeline. Every CDM cycle (8hr) and every cross-pollination cycle (4hr) now ingests the complete backlog automatically.

---

## System 4: Federation (Cross-Vertical Intelligence)

**What it does**: Propagates scanner intelligence across 6 vertical substrates while keeping domain-specific learning isolated.

### Two-layer architecture:

**Spine Layer (24 universal primitives)**:
- 12 Organs + 12 Layers (CORE, DEFENSE, BRAIN, MEMORY, etc.)
- Shared globally — a discovery in Cyber benefits Robotics automatically
- When any vertical confirms a Spine-primitive signal, it propagates to the shared core

**Expansion Layer (16 per-vertical primitives)**:
- 8 Engines + 8 Agents per vertical
- Domain-specific — Cyber's `WATCHTOWER` doesn't apply to Robotics' `SERVO`
- Each vertical maintains its own vocabulary overlay
- Learning stays vertical-local unless manually promoted

### Active verticals:
| Vertical | Expansion Examples | Vocabulary Focus |
|----------|-------------------|-----------------|
| Cyber | WATCHTOWER, FIREWALL | sigma rules, CVEs, MITRE ATT&CK |
| Robotics | SERVO, KINEMATIC | PID control, joint space, torque |
| Quantum | QUBIT, ENTANGLE | Hamiltonians, surface codes |
| LLM | TOKENIZE, PROMPT | attention, embeddings, RLHF |
| Agency | DELEGATE, ORCHESTRATE | task routing, competency |
| Media | RENDER, TRANSCODE | codecs, color space, HDR |

### Cross-pollination cycle:
Each CDM cycle runs `runCrossPollinationCycle()` which:
1. Primes each vertical scanner with the shared Spine glossary
2. Applies vertical-specific vocabulary overlays
3. Checks for Spine-level signals discovered in vertical context
4. Propagates confirmed Spine signals back to the global core

---

## System 5: Distillation (Knowledge Crystallization)

**What it does**: The symbiotic relationship between vertical substrates and the parent brain.

### Upward distillation (vertical → parent):
- Vertical discovers a pattern involving Spine primitives
- Pattern is confirmed via the federated scanner
- Signal propagates to the shared core
- All other verticals benefit on their next cycle

### Downward distillation (parent → vertical):
- Parent brain develops stronger glossary from combined learning
- Vocabulary priming during cross-pollination passes this down
- Verticals start with a richer detection baseline each cycle

### The compounding effect:
```
Cycle 1: Cyber discovers DEFENSE pattern → shared core
Cycle 2: Robotics inherits pattern → finds similar in robot safety code
Cycle 3: Combined signal strengthens confidence → all verticals benefit
Cycle N: Intelligence compounds exponentially
```

---

## Execution Timeline (What Happens When)

### pg_cron schedules:
| Schedule | Interval | What runs |
|----------|----------|-----------|
| `cdm-primary-substrate` | Every 8 hours | Full CDM reactor cycle (primary 40-primitive matrix) |
| `vertical-autonomous-cycle` | Every 4 hours | All active verticals: CDM + CLM + health |

### Single CDM cycle execution order:
```
1. generateTemplateBatch()          — 30 fresh templates
2. runReactor()                     — Score & discover
3. runVaultBridge()                 — Ingest ENTIRE vault as training data
4. runReactorChainBridge()          — Feed 126 chain templates
5. runCrossPollinationCycle()       — Federate across 6 verticals
6. runScannerOnAscensionNodes()     — Scan 20 most recent uploads
7. addDiscovery() + routeDiscovery() — Route results to ledger/vault
```

### Client-side Shadow Mesh (supplemental):
- `shadow-scheduler.ts` runs every 15 minutes in-browser
- Probes 35 pilot executors with immune-layer health checks
- Chrome visibility recovery for throttled tabs
- Feeds rolling window telemetry

---

## How to Verify It's Working

### Logs to watch for:
```
[CDM] Generated 30 templates (2-12 nodes deep)
[CDM] Reactor complete: X accepted, Y promoted to S-Tier Vault
[CDM/VaultBridge] Processed 1600+ vault entries → N signals
[CDM/ChainBridge] Processed 126 reactor chains → N signals
[CDM/Federation] Cross-pollinated 6 verticals → N spine signals
[CDM/Scanner] X discoveries fed to ledger
```

### Health indicators:
- `getRegistrySummary()` — scanner registry size growing
- `getFederatedStats()` — per-vertical signal counts
- `getFeedbackStats()` — total signals and unique primitives
- Discovery ledger count increasing over time

---

## What You DON'T Need To Do

| Concern | Answer |
|---------|--------|
| "Do I need to manually run a cycle?" | No. CDM runs every 8 hours autonomously. |
| "Will the backlog of discoveries be processed?" | Yes. The Vault Bridge processes ALL existing discoveries every cycle. |
| "Do new verticals need manual setup?" | No. `getVerticalScanner()` auto-creates instances with proper vocabulary. |
| "Will the scanner get smarter over time?" | Yes. EMA-smoothed feedback loop + vault ingestion = compounding intelligence. |
| "What if I upload new code to Ascension?" | It'll be scanned in the next CDM cycle (≤8hr). |

---

## Next Steps (Optional — Governor Decision)

1. **Manual kick-off**: Invoke the CDM cycle via the edge function to see first results immediately instead of waiting up to 8 hours
2. **Increase scan depth**: Currently scans 20 most recent Ascension nodes — could increase to 50 or 100
3. **Vertical expansion**: Add new verticals to the federation (Bio, Finance, etc.)
4. **Export scanner intelligence**: Serialize the learned glossary/feedback loop for offline analysis
5. **Graduation pipeline**: Connect scanner discoveries to the Autonomous Product Compiler for automated product assembly

---

*CMPSBL® · PromptFluid™ · Governor Operations · April 2026*
