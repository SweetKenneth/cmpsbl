# CMPSBL® Unified Pipeline Architecture
## Internal Specification — v1.0.0
### U.S. Patent App. No. 64/029,678 & 64/031,637

---

## CANONICAL PIPELINE FLOW

```
ASCENSION ──▶ MANA ──┬──▶ TRACE ──▶ Symbiotic (Both Patents)
  (scan,      (attach,  │              (developer SDK,
   classify,   5 engines) │              Layer 3)
   fingerprint)          │
                         └──▶ Pure Layer 2 (Single Patent)

Both paths governed by LEX.
Both paths use 5 behavioral engines.
Trace presence = deployment mode selector.
```

---

## 5 BEHAVIORAL ENGINES (shared across Ascension, Mana, Lex)

| Engine   | Role           | Duties |
|----------|----------------|--------|
| DEFENSE  | Gating         | Lex deny semantics, attachment-time + runtime enforcement, threat classification |
| CORTEX   | Orchestration  | Wrapper composition order, execution flow, policy-driven enforcement, engine sequencing |
| NEXUS    | Routing        | Cost gate decisions, fallback paths, flow routing, provider selection |
| BRAIN    | Reasoning      | Confidence gate scoring, context integrity, traceability, decision auditing |
| ORACLE   | Analysis       | Anomaly detection, prediction signals, causal tracing, pattern recognition |

---

## LEX GOVERNANCE GATE

### Required Rule (non-removable)
Fingerprint verification: match → ATTACH, fail → DENY + phone home.

### Developer Rules (tunable via dashboard)
Custom governance authored as treaties/SLA contracts. Examples:
- "payments fail 3x in 12hr → detach + phone home"
- "traffic > 1000 users/24hr → escalate DEFENSE"
- "attachment layer altered → detach + phone home"
- "Trace fails 2x in 1min → detach + phone home"

### Verdict Expansion (v1 → v2)
| Verdict      | Action |
|--------------|--------|
| `allow`      | Proceed normally |
| `deny`       | Block + log |
| `escalate`   | Heighten DEFENSE posture |
| `detach`     | Sever Layer 2, phone home |
| `quarantine` | Isolate via MEDIC |
| `phone-home` | Notify without action |

---

## NERVOUS SYSTEM — 6 CORE WIRING CONNECTIONS

All components exist. These are the connections to build:

```
PERCEPTION          DECISION            ACTION
──────────          ────────            ──────
  VISION ──────────▶ LEX ──────────────▶ GATE
  (baselines,        (governor,          (enforcer)
   anomalies)        rules, verdicts)

PROPAGATION                             RECOVERY
───────────                             ────────
  RIPPLE ◀──────── BUS ────────────────▶ MEDIC
  (broadcast,       (event backbone)     (quarantine,
   phone-home)                            playbooks)

VALIDATION                              PROOF
──────────                              ─────
  SHADOW ──────────▶ EVOLUTION ────────▶ AUDIT
  (sandbox,          (DAG, gates,        (Merkle chain,
   mutation probes)   rollback)           receipts)
```

| # | From → To | What It Does |
|---|-----------|--------------|
| 1 | VISION → LEX | Anomaly signals auto-generate Lex rules |
| 2 | LEX verdict → RIPPLE | Detach/escalate broadcasts via event propagation |
| 3 | LEX detach → MEDIC | Post-detach quarantine + recovery playbooks |
| 4 | SHADOW → Trace validation | Pre-deploy sandbox isolation + EVOLUTION promotion gate |
| 5 | AUDIT → every verdict | Merkle receipt chain anchors every governance decision |
| 6 | BOOT → fingerprint gate | Fingerprint verification before ANY attachment activates |

### Infrastructure Layer
- **BOOT** — Ordered startup sequencer with fingerprint gate
- **CLOCK** — Clockless causal ordering (vector clocks)
- **GRAPH** — Dependency DAG for cascade ordering
- **HEARTBEAT** — Health pulse for phone-home
- **NERVE** — Auto-activation engine + Enhancement Mesh (ambient uplift)

---

## ADDITIONAL BUILT COMPONENTS — HONEST ASSESSMENT

### High-Value (wire into pipeline when core 6 connections ship)

| Component | Path | What It Actually Is | Realistic Pipeline Use |
|-----------|------|---------------------|----------------------|
| NERVE | `src/lib/nerve/` | Auto-activation engine + enhancement mesh. Signal routing, confidence gating, 30 always-on amplifiers. | Wire signals into Lex rule triggers. Enhancement Mesh provides passive uplift during execution. |
| RELAY | `src/lib/relay/ultimate/` | Adaptive route optimizer, circuit breaker matrix, delivery guarantor, message compression, rate governor. | Hardens RIPPLE broadcasts and phone-home with delivery guarantees and rate limiting. |
| TREATY | `src/lib/treaty/ultimate/` | Compliance prover, contract negotiation, dispute resolution, SLA forecaster, penalty calculus, audit chain. | *Candidate* for developer Lex rule authoring. Not currently connected — needs bridge to Lex. |
| CONTROL PLANE | `src/lib/control-plane/` | Write-Ahead Log (WAL), atomic versioned persistence, INTEL aggregation, rehydration engine. | WAL captures state mutations for tamper-evidence and replay. Crash-recovery for pipeline state. |
| EVOLUTION MESH | `src/lib/evolution-mesh/` | Snapshot, diff, integrity, promotion, mutation engine, hardening registry. | Service mesh around EVOLUTION: snapshot before deploy, diff against baseline, gated promotion. |
| CAPABILITY LIFECYCLE | `src/lib/capability-lifecycle/` | Activation guide, behavioral verifier, Mana bridge, ledger builder, export bridge. | Manages discovery → activation → verification → export. Mana bridge connects to attachment engine. |
| ERROR RECOVERY | `src/lib/error-recovery/` | Global fetch interceptor for 429/5xx, rate-limit events, automatic retry with backoff. | Wraps pipeline HTTP calls with automatic recovery. Prevents silent phone-home failures. |
| TELEMETRY | `src/lib/telemetry/` | Aggregate core, analytics events, error telemetry, web vitals, contract-based schema. | Unified telemetry across the pipeline. One contract for all events. |
| DILIGENCE | `src/lib/diligence/` | Test battery across terminal, governance, and command paths. Parallel handler suite validation. | Pre-deployment validation. Run before Trace promotion to verify governance paths. |

### Available But Don't Force Into Pipeline

These exist and work but their pipeline connections are aspirational, not architectural necessities:

| Component | Path | What It Actually Is | Honest Assessment |
|-----------|------|---------------------|-------------------|
| COMPASS | `src/lib/compass/ultimate/` | Drift compass (substrate behavior drift), spatial anomaly detector, geofence engine (geographic polygons), trajectory analyzer. | Drift detection is valuable but measures *substrate* drift, not Trace fingerprint drift. Don't conflate. Geofence is geographic, not jurisdictional. |
| HARVEST | `src/lib/harvest/ultimate/` | Crawler swarm, dedup forge, freshness oracle, provenance ledger, quality furnace. | Standalone crawling system. Not wired to Ascension. Could feed it, but that's new work, not wiring. |
| PHANTOM | `src/lib/phantom/ultimate/` | 10-system privacy suite: differential privacy, anonymization, canary tokens, consent registry, jurisdictional routing, etc. | Real and comprehensive but adds massive scope. Wire AFTER core pipeline ships, not before. |
| FORGE | `src/lib/forge/ultimate/` | Artifact foundry, blueprint genome, pattern library, fabrication pipeline. | Generates bots/artifacts. Not Trace deployment artifacts specifically. |
| FACTORY | `src/lib/factory/` | Collision engine, genesis seeds, template mutation, vertical factory, product compiler. | Discovery and template infrastructure. Feeds Ascension intake, not Trace execution. |
| CONTRACTS | `src/lib/contracts/` | Decode Contract system with typed interfaces and RFC. | DECODE ↔ pipeline interface. Useful for API stability but not on critical path. |
| CASCADE | `src/lib/cascade/` | YAML patch dry-run validator, project management, coder logs. | Patch sandbox, NOT a general Trace execution sandbox. |
| QUARRY | `src/lib/quarry/` | Pack density analysis, template policy enforcement. | Pack release safety. Tangential to pipeline execution. |
| CLOCKLESS RADIO | `src/lib/clockless-radio/` | Web Audio crossfade music engine, DJ, SFX, TTS. | UI audio feature. Not pipeline infrastructure. |

---

## IMPLEMENTATION ROADMAP

### Phase 0 — Foundation ✅ COMPLETE
- Mana engine with 92 capabilities across 5 engines
- Lex governor with priority-sorted rules and wildcards
- Ascension scan, classify, fingerprint generation
- All 5 behavioral engines (DEFENSE, CORTEX, NEXUS, BRAIN, ORACLE)
- All nervous system components built (VISION, MEDIC, RIPPLE, SHADOW, EVOLUTION, AUDIT)
- Core infrastructure (Boot, Clock, Graph, Heartbeat, Nerve)

### Phase 1 — Lex Expansion 🔜 NEXT
- Expand LexVerdict: add `detach`, `escalate`, `quarantine`, `phone-home`
- Add `phoneHome` callback hook on verdict execution
- Add `protected` flag on fingerprint rule (non-revocable)
- Wire VISION anomaly signals → Lex auto-rule generation
- Wire Lex verdicts → RIPPLE event propagation
- Wire Boot Sequencer → mandatory fingerprint gate on startup

### Phase 2 — Nervous System Wiring 📋 PLANNED
- Connect Lex detach → MEDIC quarantine + recovery playbooks
- Connect AUDIT Merkle chain to every Lex verdict
- Connect SHADOW → Trace pre-deployment validation
- Connect EVOLUTION → Trace promotion gating
- Connect GATE engine as Lex enforcement arm
- Connect Heartbeat Engine → phone-home pulse
- Connect Dependency Graph → detach cascade ordering
- Wire ERROR RECOVERY around all pipeline HTTP paths
- Wire TELEMETRY contract across all pipeline events

### Phase 3 — Trace SDK (Layer 3) 📋 PLANNED
- `@cmpsbl/trace` package creation
- Developer API for authoring Traces
- Trace → Mana merge protocol
- Trace validation via SHADOW before promotion
- Symbiotic deployment mode (both patents active)
- Pure Layer 2 mode (Ascension-only, single patent)

### Phase 4 — Developer Dashboard 🔮 FUTURE
- Lex rule composer UI (custom governance without code)
- TREATY integration as Lex rule authoring framework
- Real-time VISION metrics dashboard
- Trace deployment history and rollback controls
- AUDIT receipt explorer
- MEDIC recovery status and quarantine management
- Phone-home event log and alert configuration

### Phase 5 — Extended Integration 🔮 FUTURE
- RELAY hardening around RIPPLE broadcasts
- CONTROL PLANE WAL for verdict tamper-evidence
- NERVE Enhancement Mesh integration
- CAPABILITY LIFECYCLE → Mana bridge activation
- EVOLUTION MESH service layer
- COMPASS drift detection (substrate-level, not Trace-level)
- PHANTOM privacy suite (after core pipeline is stable)

---

## PATENT UNIFICATION MODEL

```
Patent 64/029,678 (Ascension)
├── Code scanning & classification
├── Layer 2 generation
└── Fingerprint anchoring

Patent 64/031,637 (Mana/Symbiosis)
├── Silent software attachment
├── Runtime governance (Lex)
└── Behavioral engine enforcement

UNIFIED: Ascension ──▶ Mana ──┬──▶ Trace ──▶ Symbiotic
                              └──▶ (skip) ──▶ Layer 2 Only

Both paths governed by Lex.
Both paths use 5 behavioral engines.
Trace presence = deployment mode selector.
```

---

*CMPSBL® · PromptFluid™ · Governed Cognitive Infrastructure*
*Internal document — not for public distribution*
