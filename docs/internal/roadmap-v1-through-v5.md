# CMPSBL® Phased Roadmap — V1 through V5
## Internal Specification · April 14, 2026
### U.S. Patent App. No. 64/029,678 & 64/031,637

---

## Guiding Principle

Ship a clean, undeniable V1 — then layer power over time.

Everything below is already built. Nothing is being deleted.
This document organizes what ships now vs. what ships later.

---

## V1 — Core (Ship This)

**Goal:** A developer can install, attach, and trust the system immediately
without needing to understand internals.

### What's In

| Capability | File(s) | Status |
|------------|---------|--------|
| **Wrapper Composition** — deterministic attach with double-wrap prevention | `src/lib/mana/engine.ts` | ✅ Hardened |
| **Lex Governance** — strict precedence (`deny > detach > quarantine > escalate > phone-home > observe > allow`), one event → one verdict, recursion guard, cooldowns, dedup | `src/lib/mana/lex.ts` | ✅ Hardened |
| **Safe Detach** — transactional (snapshot → boundary wait → detach → verify → propagate), no mid-execution detach, idempotent | `src/lib/mana/detach-safe.ts` | ✅ Hardened |
| **Fingerprint Gate** — 3-state triage (valid / suspect / invalid), deterministic hashing, mismatch classification, local-first verification | `src/core/boot/fingerprintGate.ts` | ✅ Hardened |
| **Minimal Audit Logging** — append-only hash chain, causal ordering, idempotency keys, replay verifier | `src/core/audit/auditChain.ts` | ✅ Hardened |
| **Wrapper Integrity** — `MANA_LAYER_TAG` enforcement, per-function capability tracking, post-detach verification | `src/lib/mana/engine.ts` | ✅ Hardened |
| **Lex Core Types** — `LexRule`, `LexVerdict`, capability contracts, deny semantics | `src/lib/mana/types.ts` | ✅ Stable |
| **Session Isolation** — scoped engine instances for multi-module safety | `src/lib/mana/session.ts` | ✅ Stable |
| **Stress Tests** — 12 adversarial scenarios, 70 assertions | `src/tests/stop-ship-stress.ts` | ✅ Passing |

### What's NOT In V1

- No VISION auto-rules
- No phone-home / outbound telemetry
- No RELAY / delivery infrastructure
- No nervous system wiring
- No developer dashboard
- No TREATY / custom rule authoring

### V1 Developer Experience

```
install → configure → attach(target) → Lex evaluates → execute safely
                                      → detach(target) → verify clean restore
```

### V1 Acceptance Criteria

- [x] All verdicts deterministic — one event, one outcome
- [x] No double wrapping possible
- [x] No mid-execution detach (execution boundary tracking)
- [x] Detach fully restores originals (verified via safe detach protocol)
- [x] Fingerprint gate blocks invalid, limits suspect
- [x] Audit chain is tamper-evident and replayable
- [x] All 12 stress tests pass (70 assertions)
- [x] V1 wiring verified — 6 integration tests (19 assertions)
- [x] Engine → Fingerprint Gate → Audit Chain → Safe Detach all connected

---

## V2 — Stability & Observability

**Goal:** Make the system easier to inspect and verify, not more complex to use.

**Prerequisite:** V1 acceptance criteria met.

### What's In

| Capability | File(s) | Status |
|------------|---------|--------|
| **Expanded Audit Chain** — deeper integrity tooling, chain anchoring, receipt exploration | `src/core/audit/auditChain.ts` + extensions | 🔧 Extend |
| **Improved Fingerprint Classification** — richer mismatch taxonomy, version drift scoring | `src/core/boot/fingerprintGate.ts` | 🔧 Extend |
| **Telemetry Contract** — unified event schema across pipeline, typed telemetry events | `src/lib/telemetry/` | ✅ Built |
| **Error Recovery** — global fetch interceptor for 429/5xx, automatic retry with backoff | `src/lib/error-recovery/` | ✅ Built |
| **Trace & Explainability** — execution trace, inspection, chain visibility | `src/lib/mana/engine.ts` (trace APIs) | ✅ Built |
| **Diligence Test Battery** — governance path validation, pre-deployment checks | `src/lib/diligence/` | ✅ Built |
| **Control Plane WAL** — write-ahead log for state mutations, crash-recovery | `src/lib/control-plane/` | ✅ Built |

### V2 Does NOT Add

- No auto-rule generation
- No outbound phone-home
- No VISION integration
- No new behavioral logic

---

## V3 — Controlled Intelligence

**Goal:** Add intelligence without sacrificing determinism.

**Prerequisite:** V2 shipped; observability stack proven stable.

### What's In

| Capability | File(s) | Status |
|------------|---------|--------|
| **VISION → LEX Bridge** — anomaly signals generate Lex rules with progressive escalation (observe → escalate → terminal), confidence thresholds, TTL, audit chain | `src/lib/mana/vision-lex-bridge.ts` | ✅ Hardened |
| **VISION Baselines** — anomaly detection, behavioral baselines, signal generation | `src/lib/vision/` | ✅ Built |
| **Rule Escalation Paths** — time-based progression from observe to terminal action | `src/lib/mana/vision-lex-bridge.ts` | ✅ Built |
| **Optional Human-Review Gate** — high-severity auto-rules can require manual approval | `src/lib/mana/vision-lex-bridge.ts` | ✅ Built |
| **Registry Bridge** — Lex Registry → runtime enforcement | `src/lib/mana/registry-bridge.ts` | ✅ Built |

### V3 Rules (Hard Constraints)

- First signal = observe only, NEVER terminal
- Terminal verdicts require repeated + confirmed signals (default: 5)
- All auto-rules have TTL (default: 5 min)
- Confidence threshold must be met (default: 0.6)
- Full audit reason chain required for every generated rule

### V3 Does NOT Add

- No phone-home / outbound
- No RELAY infrastructure
- No cross-system propagation

---

## V4 — Infrastructure & Resilience

**Goal:** Harden the system at scale.

**Prerequisite:** V3 intelligence layer stable; no false-positive incidents.

### What's In

| Capability | File(s) | Status |
|------------|---------|--------|
| **Phone-Home Controller** — all outbound through RELAY, 4 modes (notify-once / batched / urgent / local-only), dedup, rate limiting | `src/lib/relay/ultimate/phoneHome.ts` | ✅ Hardened |
| **RELAY Infrastructure** — adaptive routing, circuit breakers, delivery guarantees, rate governor, message compression | `src/lib/relay/ultimate/` | ✅ Built |
| **RIPPLE Event Propagation** — verdict broadcasts, ordered delivery, batch events, replay engine, persistent store | `src/lib/ripple/` | ✅ Built |
| **LEX → RIPPLE Wiring** — detach/escalate verdicts broadcast via event propagation | Wire `lex.ts` → `ripple/` | 🔧 Wire |
| **Retry Handling** — exponential backoff with jitter, configurable retry budgets | `src/lib/control-plane/retry.ts` | ✅ Built |
| **Heartbeat Engine** — health pulse for phone-home verification | `src/lib/heartbeat/` | ✅ Built |
| **Dependency Graph** — DAG for detach cascade ordering | `src/lib/graph/` | ✅ Built |

### V4 Modes

| Mode | Behavior |
|------|----------|
| `local-only` | No outbound. All events logged locally only. |
| `notify-once` | Deduped single notification per event type. |
| `notify-batched` | Queue + flush on interval or threshold. |
| `notify-urgent` | Immediate dispatch, bypass batch queue. |

### V4 Does NOT Add

- No cross-substrate intelligence
- No advanced recovery / propagation
- No extended components

---

## V5 — Full System Integration

**Goal:** Complete ecosystem. Not required for initial product success.

**Prerequisite:** V4 infrastructure proven under production load.

### What's In

| Capability | File(s) | Status |
|------------|---------|--------|
| **MEDIC** — quarantine isolation, recovery playbooks, triage priority, self-repair feedback, root-cause correlation | `src/lib/medic/` | ✅ Built |
| **SHADOW** — sandbox execution, mutation probes, pre-deployment validation | `src/lib/evolution/shadowExecution.ts` | ✅ Built |
| **EVOLUTION Promotion Gate** — DAG sequencer, promotion rules, rollback ledger, blast radius projection | `src/lib/evolution/` | ✅ Built |
| **NERVE** — auto-activation engine, enhancement mesh, signal routing, confidence gating | `src/lib/nerve/` | ✅ Built |
| **TREATY** — compliance prover, contract negotiation, SLA forecasting, dispute resolution | `src/lib/treaty/ultimate/` | ✅ Built |
| **CAPABILITY LIFECYCLE** — discovery → activation → verification → export | `src/lib/capability-lifecycle/` | ✅ Built |
| **EVOLUTION MESH** — snapshot, diff, integrity, promotion, mutation engine | `src/lib/evolution-mesh/` | ✅ Built |
| **LEX detach → MEDIC** — post-detach quarantine + recovery playbooks | Wire | 🔧 Wire |
| **SHADOW → Trace validation** — pre-deploy sandbox isolation + promotion gate | Wire | 🔧 Wire |
| **NERVE Enhancement Mesh** — ambient uplift during execution | Wire | 🔧 Wire |
| **TREATY → Lex bridge** — developer rule authoring framework | Wire | 🔧 Wire |

### Deferred (Available, Not Scheduled)

These exist and work but are not architectural necessities for the pipeline:

| Component | What It Is | Honest Assessment |
|-----------|------------|-------------------|
| COMPASS | Substrate drift, geofence engine | Measures substrate drift, not Trace drift. Don't conflate. |
| HARVEST | Crawler swarm, provenance ledger | Standalone. Not wired to Ascension. New work, not wiring. |
| PHANTOM | 10-system privacy suite | Real but massive scope. Wire after everything else. |
| FORGE | Artifact foundry, pattern library | Generates bots/artifacts. Not Trace artifacts specifically. |
| FACTORY | Collision engine, template mutation | Discovery intake. Feeds Ascension, not Trace execution. |
| CONTRACTS | DECODE contract system | API stability. Not on critical path. |
| CASCADE | YAML patch dry-run validator | Patch sandbox, NOT general execution sandbox. |
| QUARRY | Pack density analysis | Pack release safety. Tangential to pipeline. |
| CLOCKLESS RADIO | Web Audio music engine | UI feature. Not infrastructure. |

---

## Phase Dependency Chain

```
V1 (Core)
 └──▶ V2 (Observability)
       └──▶ V3 (Intelligence)
             └──▶ V4 (Infrastructure)
                   └──▶ V5 (Full Integration)
```

Each phase MUST meet its acceptance criteria before the next begins.
No skipping. No parallel phase work.

---

## What Ships When — Summary

| Phase | Ships | Developer Sees |
|-------|-------|----------------|
| **V1** | Attach, Lex, Detach, Fingerprint, Audit | "It works. I trust it." |
| **V2** | Telemetry, deeper audit, error recovery | "I can see what it's doing." |
| **V3** | VISION → LEX, auto-rules, escalation | "It's getting smarter — safely." |
| **V4** | Phone-home, RELAY, retry, batching | "It scales and stays connected." |
| **V5** | Full nervous system, recovery, TREATY | "It's a complete ecosystem." |

---

## Nothing Was Deleted

Every component listed in `docs/internal/pipeline-architecture-v1.md` is accounted for here.
Every hardening fix from the stop-ship directive is preserved.
This document reorganizes timing, not capability.

---

*CMPSBL® · PromptFluid™ · Governed Cognitive Infrastructure*
*Internal document — not for public distribution*
