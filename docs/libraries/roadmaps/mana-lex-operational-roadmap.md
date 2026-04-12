# CMPSBL® Mana/Lex Operational Roadmap
## From Proven Concept → Working Runtime Loader → Production Symbiont

**Classification:** Strategic — Internal Engineering Reference  
**Author:** Kenneth E. Sweet Jr.  
**Version:** 1.0 — April 2026  
**Patent:** U.S. App. No. 64/031,637  

---

> **Status:** The ammunition is built. 92 wrapper factories, SHA-256 proof, recursive composition, Lex governance. What's missing is the **delivery system** — a runtime loader that resolves real npm packages and attaches at their function boundaries without source modification.

---

## Architecture Recap

```
┌──────────────────────────────────────────────────────────┐
│                    ASCENSION (Scanner)                    │
│  Scans source → detects boundaries → maps capabilities   │
│  OUTPUT: AscensionManifest (findings + function map)      │
└─────────────────────┬────────────────────────────────────┘
                      │ Findings Bridge
                      ▼
┌──────────────────────────────────────────────────────────┐
│                     MANA (Deployer)                       │
│  Consumes manifest → builds attachment plan → wraps       │
│  92 surgical wrappers · SHA-256 proof · recursive layers  │
└─────────────────────┬────────────────────────────────────┘
                      │ Governed by
                      ▼
┌──────────────────────────────────────────────────────────┐
│                    LEX (Conscience)                        │
│  allow/deny/observe per capability+target                 │
│  Registry: blacklist (free) / whitelist (licensed)        │
└──────────────────────────────────────────────────────────┘
```

**Gap:** Mana currently wraps in-memory function objects passed to it. It cannot yet **resolve a real npm package at runtime** and intercept its exports automatically. That's the loader.

---

## Ascension Components Available for Reuse

This is the critical efficiency map. Every ✅ item below is **already built** and can be directly consumed by the Mana runtime loader without reimplementation.

### Direct Reuse (Zero New Code)

| Component | Location | Reuse In Mana |
|-----------|----------|---------------|
| **Function Boundary Detection** | `findings-bridge.ts` → `detectFunctionBoundaries()` | Loader uses this to find wrappable exports in resolved packages |
| **Signal-to-Capability Mapping** | `findings-bridge.ts` → `CAPABILITY_SIGNALS` (40+ patterns) | Maps each detected function to the correct wrapper factory |
| **Attachment Plan Builder** | `findings-bridge.ts` → `buildAttachmentPlan()` | Generates the surgical plan consumed by `attach()` |
| **SHA-256 Proof Engine** | `engine.ts` → `computeHash()` | Proves Layer 1 source integrity before/after attachment |
| **92 Wrapper Factories** | `engine.ts` → `wrapWith*()` family | Every wrapper is ready — defense, beacon, governance, memory, nexus, brain, immunity, sovereign, etc. |
| **Lex Evaluator** | `lex.ts` → `evaluate()` | Governance decisions per capability+target |
| **Telemetry Emitter** | `engine.ts` → `emitTelemetry()` | All wrappers already emit structured telemetry |
| **Recursive Layer Tracking** | `engine.ts` → `layerDepth`, `parentLayerHash` | V3-wraps-V2-wraps-V1 composition works |
| **Manifest Generator** | `engine.ts` → `getManifest()` | Produces ManaManifest with full attachment proof |
| **Proof Generator** | `engine.ts` → `generateProof()` | SHA-256 fingerprinted proof of non-modification |

### Ascension Scanner Reuse (Scan → Loader Pipeline)

| Component | Location | Reuse In Mana |
|-----------|----------|---------------|
| **Capability Affinity Scoring** | `lib/ascension/capability-affinity.ts` | Score which wrappers are highest-value for a given package |
| **Structural Signatures** | `lib/ascension/structural-signatures.ts` | Classify package archetype (utility, framework, SDK, etc.) |
| **Primitive Extractor** | `lib/ascension/primitive-extractor.ts` | Extract what kind of software the package is |
| **Quality Gate** | `lib/ascension/quality-gate.ts` | Enforce minimum confidence before attaching |
| **Confidence Banding** | `lib/ascension/confidence-banding.ts` | Band attachment confidence for UI display |
| **Scan Integrity** | `lib/ascension/scan-integrity.ts` | Verify scan results haven't been tampered with |
| **Contract Extractor** | `lib/ascension/contract-extractor.ts` | Extract function signatures and type contracts |
| **Deduplication** | `lib/ascension/deduplication.ts` | Prevent duplicate attachments on re-scans |
| **Language Postprocessor** | `lib/ascension/language-postprocessor.ts` | Language-specific cleanup after boundary detection |

### Capability Lifecycle Reuse

| Component | Location | Reuse In Mana |
|-----------|----------|---------------|
| **Behavioral Verifier** | `lib/capability-lifecycle/behavioral-verifier.ts` | Prove wrappers are actually executing post-attach |
| **Activation Guide Generator** | `lib/capability-lifecycle/activation-guide.ts` | Generate HTML guides for attached packages |
| **Constrained Reporter** | `lib/capability-lifecycle/constrained-reporter.ts` | Report only what's provably activated |
| **Mana Bridge** | `lib/capability-lifecycle/mana-bridge.ts` | Already maps capabilities to primitives for ledger |
| **Export Bridge** | `lib/capability-lifecycle/export-bridge.ts` | Generates lifecycle artifacts for any export path |

### Core Engine Reuse

| Component | Location | Reuse In Mana |
|-----------|----------|---------------|
| **Observatory Governance** | `core/ascension/observatoryGovernance.ts` | Enable/disable capabilities with circuit breakers |
| **Self-Healing Consensus** | `core/ascension/selfHealingConsensusEngine.ts` | Auto-recover from attachment failures |
| **Cognitive Threat Profiler** | `core/ascension/cognitiveThreatProfiler.ts` | Profile threat surface of target package |

**Total reusable components: 28 modules → estimated 60-70% of the loader is already built.**

---

## Phase 0: JS/TS Runtime Loader (Week 1-2) 🎯 CRITICAL PATH

*The missing piece. Everything else is built.*

### 0A: Package Resolution

| # | Task | Reuses | Priority |
|---|------|--------|----------|
| 0.1 | `resolvePackage(name)` — resolve npm package to its entry module path | — | P0 |
| 0.2 | `readPackageSource(entryPath)` — read the resolved source for hashing | — | P0 |
| 0.3 | `extractExports(module)` — enumerate all named/default exports | Contract Extractor | P0 |
| 0.4 | `classifyExports(exports)` — filter to wrappable functions vs constants | Structural Signatures | P0 |

### 0B: Interception Layer

| # | Task | Reuses | Priority |
|---|------|--------|----------|
| 0.5 | **Node.js `require()` hook** — intercept CommonJS module loading | — | P0 |
| 0.6 | **ESM loader hook** — `--loader` flag for `import` interception | — | P0 |
| 0.7 | **Browser `Proxy` trap** — wrap `window.*` and ES module namespaces | — | P1 |
| 0.8 | **Module cache poisoning** — replace cached module with wrapped version | — | P0 |
| 0.9 | Environment detection (Node/Browser/Deno/Bun/Edge) | Ascension deployment engine | P0 |

### 0C: Attachment Orchestrator

| # | Task | Reuses | Priority |
|---|------|--------|----------|
| 0.10 | `mana.attach(packageName)` — full pipeline: resolve → scan → plan → wrap | Findings Bridge (all) | P0 |
| 0.11 | Pre-attach SHA-256 snapshot of original module | `computeHash()` | P0 |
| 0.12 | Post-attach verification — prove source unchanged | `generateProof()` | P0 |
| 0.13 | Lex check before every attachment | `evaluate()` | P0 |
| 0.14 | Rollback capability — clean detach restoring originals | `originals` Map | P0 |

**Deliverable:** `mana.attach('lodash')` works in a Node.js process. Every `_.map()` call flows through Layer 2 governance.

---

## Phase 1: Lodash PoC — The "Holy Shit" Demo (Week 2)

*The first live demonstration of silent software symbiosis.*

| # | Task | Reuses | Priority |
|---|------|--------|----------|
| 1.1 | `npm install lodash` in isolated sandbox | — | P0 |
| 1.2 | Run `mana.attach('lodash')` — auto-scans, builds plan, wraps all 300+ functions | Full pipeline | P0 |
| 1.3 | Exercise: `_.map([1,2,3], x => x*2)` — prove governance layer fires | Telemetry emitter | P0 |
| 1.4 | SHA-256 proof: show lodash source is byte-identical pre/post | `generateProof()` | P0 |
| 1.5 | Add Lex deny rule: `registerRule('defense_gate', '*.chunk', 'deny', 'blocked')` | Lex evaluator | P0 |
| 1.6 | Prove `_.chunk()` now throws — governed by Lex | Wrapper factories | P0 |
| 1.7 | Run `mana.detach()` — prove `_.chunk()` works again, hash identical | Detach flow | P0 |
| 1.8 | `@cmpsbl/shield` detects the attachment in < 1ms | Shield (Phase 3) | P1 |

**Script output:**
```
[MANA] Resolving lodash@4.17.21...
[MANA] Source hash: a3f2b8c... (SHA-256)
[MANA] Detected 312 function boundaries
[MANA] Attachment plan: 47 defense_gates, 312 beacon_telemetry, 89 governance_hooks
[MANA] Lex: all attachments ALLOWED (permissive mode)
[MANA] Layer 2 attached. Depth: 1. Source hash unchanged: a3f2b8c...
[MANA] Proof generated: MANA-X8K2M4-7FN3P9-Q1W5R6
```

---

## Phase 2: Multi-Package & Recursive Composition (Week 3)

| # | Task | Reuses | Priority |
|---|------|--------|----------|
| 2.1 | Express.js attachment — middleware injection via Layer 2 | Findings Bridge | P0 |
| 2.2 | OpenAI SDK attachment — telemetry on all API calls | Beacon wrappers | P0 |
| 2.3 | Recursive: Mana-wrapped Express uses Mana-wrapped lodash | `layerDepth` tracking | P0 |
| 2.4 | Generic `mana.attach(name)` for any npm package | Full pipeline | P0 |
| 2.5 | Batch attach: `mana.attachAll(['lodash', 'express', 'axios'])` | Deduplication | P1 |
| 2.6 | Capability affinity scoring — recommend highest-value wrappers per package | Capability Affinity | P1 |
| 2.7 | Package archetype classification (utility/framework/SDK) | Structural Signatures | P1 |

---

## Phase 3: @cmpsbl/shield — The Antidote (Week 3-4)

*Ship the detection tool alongside the symbiont.*

| # | Task | Reuses | Priority |
|---|------|--------|----------|
| 3.1 | **Behavioral Anomaly Detector** — sealed detection of Layer 2 activity | 🔒 Crown Jewel | P0 |
| 3.2 | **Heartbeat Monitor** — periodic runtime health check | BEACON telemetry patterns | P0 |
| 3.3 | **Attachment Alarm** — real-time alerts when unauthorized wrapping detected | Telemetry emitter pattern | P0 |
| 3.4 | **Blacklist Registration Client** — one-liner `shield.protect('my-package')` | — | P0 |
| 3.5 | npm package: `npm install @cmpsbl/shield` | — | P0 |
| 3.6 | Shield detects Mana in < 1ms (benchmark) | — | P0 |

> ⛔ **SEALED:** Shield detection vectors are Crown Jewel IP. Detection method never documented externally.

---

## Phase 4: Lex Registry — Universal Governance Database (Week 4-5)

| # | Task | Reuses | Priority |
|---|------|--------|----------|
| 4.1 | Database schema: `lex_registry` table (package_hash, status, owner, audit_chain) | — | P0 |
| 4.2 | `GET /registry/{package-hash}` → status lookup | — | P0 |
| 4.3 | `POST /registry/blacklist` → free protection registration | — | P0 |
| 4.4 | `POST /registry/whitelist` → licensed enablement | — | P0 |
| 4.5 | `GET /registry/audit/{id}` → immutable history | Audit chain pattern from Ascension | P0 |
| 4.6 | Mana loader checks registry BEFORE attaching | Lex evaluator | P0 |
| 4.7 | Rate limiting + API key scoping | Access system (existing) | P1 |

### Revenue Model

| Feature | Tier | Cost |
|---------|------|------|
| Blacklist registration | Free forever | $0 |
| Public API verification | Free | $0 |
| Whitelist licensing | Licensed | Per-package |
| Priority registration (SLA) | Pro | $29/mo |
| Enterprise registry federation | Enterprise | Custom |

---

## Phase 5: Multi-Language Loaders (Week 5-8)

*Extend beyond JS/TS to the languages Ascension already supports.*

| # | Language | Interception Method | Reuses | Priority |
|---|----------|-------------------|--------|----------|
| 5.1 | **Python** | `importlib` hooks, `sys.meta_path` | Language Postprocessor (Python patterns already in Findings Bridge) | P1 |
| 5.2 | **Rust** | `LD_PRELOAD` / dylib injection | Structural Signatures (Rust trait detection) | P2 |
| 5.3 | **Go** | Plugin system / `LD_PRELOAD` | Findings Bridge (Go func patterns) | P2 |
| 5.4 | **Java** | Java Agent (`-javaagent`), bytecode instrumentation | Findings Bridge (Java annotation patterns) | P2 |
| 5.5 | **Ruby** | `Module#prepend`, method aliasing | Findings Bridge (Ruby def patterns) | P2 |
| 5.6 | **PHP** | `runkit` extension, stream wrappers | Findings Bridge (PHP function patterns) | P3 |

**Key insight:** The Findings Bridge already has regex patterns for all these languages. The boundary detection is solved — only the interception mechanism differs per runtime.

---

## Phase 6: Edge API + Commercial Launch (Week 6-8)

| # | Task | Reuses | Priority |
|---|------|--------|----------|
| 6.1 | `POST /mana/attach` — cloud-hosted attachment as a service | Full pipeline | P0 |
| 6.2 | `POST /ascension/scan` → `POST /mana/attach` — unified API | Ascension scanner + Mana loader | P0 |
| 6.3 | `GET /mana/verify/:fingerprint` — proof verification | `generateProof()` | P0 |
| 6.4 | Webhook: notify on attachment/detachment events | Telemetry system | P1 |
| 6.5 | CLI: `cmpsbl attach lodash --governed --prove` | Full pipeline | P1 |
| 6.6 | CLI: `cmpsbl shield protect my-package` | Shield client | P1 |

---

## Phase 7: Legal & Patent Hardening (Week 8+)

| # | Task | Status |
|---|------|--------|
| 7.1 | Map every patent claim (64/031,637) to specific code paths | 🔲 Todo |
| 7.2 | Responsible disclosure policy for Mana capabilities | 🔲 Todo |
| 7.3 | Terms of service for Lex Registry | 🔲 Todo |
| 7.4 | "Indefensibility Thesis" whitepaper | 🔲 Todo |
| 7.5 | Security conference submissions (DEF CON, BSides, Black Hat) | 🔲 Todo |

---

## Reuse Efficiency Summary

```
Total roadmap tasks:           ~65
Tasks requiring new code:      ~22 (Phase 0 loader + Phase 3 shield + Phase 4 registry)
Tasks reusing Ascension code:  ~43 (66% reuse rate)

Estimated dev time saved:      ~60-70%
Critical new work:             Runtime loader (Phase 0) — ~2 weeks
Everything else:               Orchestration of existing components
```

### Component Dependency Graph

```
                    ┌─────────────────┐
                    │  Runtime Loader  │ ← THE ONLY NEW ENGINE
                    │  (Phase 0)       │
                    └───────┬─────────┘
                            │ calls
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
    ┌──────────────┐ ┌───────────┐ ┌──────────────┐
    │ Findings     │ │ Engine    │ │ Lex          │
    │ Bridge       │ │ (92       │ │ Evaluator    │
    │ (REUSE)      │ │ wrappers) │ │ (REUSE)      │
    │              │ │ (REUSE)   │ │              │
    └──────┬───────┘ └─────┬─────┘ └──────┬───────┘
           │               │              │
           ▼               ▼              ▼
    ┌──────────────┐ ┌───────────┐ ┌──────────────┐
    │ Ascension    │ │ Telemetry │ │ Registry     │
    │ Scanner      │ │ System    │ │ (NEW)        │
    │ (REUSE)      │ │ (REUSE)   │ │              │
    └──────────────┘ └───────────┘ └──────────────┘
```

---

## Completion Criteria

All four must be met:

1. **Working JS Runtime Loader** — `mana.attach('lodash')` works in Node.js with SHA-256 proof
2. **Shield Detection** — `@cmpsbl/shield` detects unauthorized Layer 2 in < 1ms
3. **Lex Registry** — Blacklist/whitelist API operational with audit chain
4. **Legal Readiness** — Patent claim 64/031,637 mapped to specific execution paths

**Target: 8 weeks from approval (June 7, 2026)**

---

## The Flywheel (Updated)

```
Mana attaches to codebases → Ascension scans against 159 primitives
    → Discoveries compound across 12 verticals
        → Product Compiler assembles software suites autonomously
            → ECONOMY auto-prices → Marketplace rotates
                → Scanner learns from every scan result
                    → Revenue funds multi-language loaders
                        → More languages = more attack surface = more shields needed
                            → More shields = more scans = more discoveries
                                → Flywheel compounds — zero AI, pure algorithmic curing
```

---

*© CMPSBL® — PromptFluid™ · April 2026*
