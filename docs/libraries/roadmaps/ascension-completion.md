# Ascension Completion Roadmap
## From Scanner to Sealed Runtime — Every Gap, Mapped

**Status**: The scanning/diagnosis engine is production-ready (25/25 archetype floor, 64-file corpus, IDF-weighted scoring). The code generation pipeline (generate-refurbished-code.ts) produces dual-layer exports across 90+ languages. The Mana deployment engine (Silent Software Symbiosis Engine v2.0.0) handles surgical attachment with SHA-256 proof.

**What "complete" means**: A user uploads code → Ascension scans → findings bridge maps capabilities → Mana attaches → export delivers a verified, portable, investor-grade artifact. Every step works end-to-end with zero manual intervention.

---

## Phase 1: Converged Pipeline Integrity (Current — Week 1)
*Goal: The Ascension→Mana pipeline is structurally sound and type-safe.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Findings bridge (`detectFunctionBoundaries` + `buildAttachmentPlan`) | ✅ Done | Surgical signal-matched capability mapping |
| 1.2 | Async wrapping (beacon + circuit breaker) | ✅ Done | Promise-aware telemetry and fault tracking |
| 1.3 | `observe` verdict in Lex wrappers | ✅ Done | Three-state governance: allow/deny/observe |
| 1.4 | Recursive layer tracking (layerDepth + parentLayerHash) | ✅ Done | V3→V2→V1 composition validated |
| 1.5 | ManaAttachPhase wired through bridge | ✅ Done | Lab UI uses surgical pipeline, not blanket rules |
| 1.6 | Terminology alignment (Ascension scans, Mana deploys) | ✅ Done | FAQ, meta, comments corrected |
| 1.7 | Engine renamed to Silent Software Symbiosis Engine | ✅ Done | Internal branding updated |

---

## Phase 2: Findings Bridge Hardening (Week 2)
*Goal: The bridge handles every language pattern in the 90+ supported set.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Expand `FUNCTION_PATTERNS` for Rust traits/impls, Go interfaces, Python class methods, Java annotations | 🔲 Todo | Current patterns cover ~70% of real-world code |
| 2.2 | Add `CAPABILITY_SIGNALS` for crypto/hashing functions → `defense_gate` | 🔲 Todo | `encrypt`, `hash`, `sign`, `verify` patterns |
| 2.3 | Add `CAPABILITY_SIGNALS` for lifecycle hooks → `audit_trail` | 🔲 Todo | `init`, `teardown`, `dispose`, `cleanup`, `shutdown` |
| 2.4 | Add `CAPABILITY_SIGNALS` for config/env → `governance_hook` | 🔲 Todo | `getConfig`, `loadEnv`, `setOption` patterns |
| 2.5 | Confidence scoring per-language (Python functions are higher confidence than regex-extracted C macros) | 🔲 Todo | Language-aware confidence weights |
| 2.6 | Test suite: 30+ source files across 10 languages → validate boundary detection recall | 🔲 Todo | Reuse training corpus from scanner |

---

## Phase 3: Lex Governance Completion (Week 2-3)
*Goal: Lex is a production-grade governance engine, not a prototype.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Rule priority/ordering — weighted rules instead of first-match-wins | 🔲 Todo | Priority field on LexRule, sorted evaluation |
| 3.2 | Wildcard + glob matching for targets (`process*`, `*.handler`) | 🔲 Todo | More flexible rule targeting |
| 3.3 | Rule expiration — TTL-based auto-revocation | 🔲 Todo | `expiresAt` field on LexRule |
| 3.4 | Rule audit chain — immutable log of all rule changes | 🔲 Todo | Every register/revoke is logged with timestamp |
| 3.5 | Lex policy presets (e.g., "SOC2-compliant", "HIPAA", "open-source-safe") | 🔲 Todo | Pre-configured rule sets for common compliance needs |
| 3.6 | `observe` → DREAM pipeline — observed invocations feed behavioral data into DREAM synthesis | 🔲 Todo | Lex observation as DREAM input |

---

## Phase 4: Export Artifact Convergence (Week 3)
*Goal: The Mana Lab export produces the same investor-grade artifact as the Ascension Lab.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Mana export includes `mana-manifest.json` with surgical attachment plan | 🔲 Todo | Which functions got which capabilities and why |
| 4.2 | Mana export includes Lex rule snapshot | 🔲 Todo | Governance state at time of attachment |
| 4.3 | Mana export includes telemetry summary | 🔲 Todo | Invocation/blocked/observed counts per function |
| 4.4 | Merge Ascension PROOF.txt format with Mana proof fields (layerDepth, parentLayerHash) | 🔲 Todo | Unified proof certificate |
| 4.5 | Mana export includes INTEGRATION.md with detach instructions | 🔲 Todo | How to cleanly remove Layer 2 |
| 4.6 | Unified verify page (`/verify/:fingerprint`) handles both Ascension and Mana fingerprints | 🔲 Todo | Single verification endpoint |

---

## Phase 5: Runtime Attachment for Real Hosts (Week 4)
*Goal: Mana attaches to real npm packages, not mock host modules.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 5.1 | lodash demo runs end-to-end in browser (current demo is importable but not wired to UI) | ⚠️ Partial | Demo exists in `demos/lodash-attachment.ts` |
| 5.2 | Express.js attachment demo — middleware injection via Layer 2 | 🔲 Todo | Campaign architecture exists, needs live demo |
| 5.3 | OpenAI SDK attachment demo — behavioral telemetry into DREAM | 🔲 Todo | OPERATION: DREAM STATE needs live pipeline |
| 5.4 | Generic npm package attachment flow — user types package name, Mana resolves and attaches | 🔲 Todo | This is the killer feature |
| 5.5 | Detach verification — run attachment → exercise → detach → hash comparison in UI | 🔲 Todo | Prove the full lifecycle visually |

---

## Phase 6: Ascension Lab ↔ Mana Lab Unification (Week 4-5)
*Goal: One continuous pipeline — upload → scan (Ascension) → attach (Mana) → export.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6.1 | Ascension Lab "Ascend" step produces a findings manifest consumable by Mana Lab | 🔲 Todo | Bridge the two UIs |
| 6.2 | Optional "Attach Layer 2" step after Ascension export | 🔲 Todo | User can choose: just scan, or scan + attach |
| 6.3 | Combined export: Ascension findings + Mana attachment + unified proof | 🔲 Todo | Single ZIP with both layers documented |
| 6.4 | CLI `cmpsbl ascend --attach` flag that runs full pipeline | 🔲 Todo | One command, both engines |

---

## Phase 7: Edge Deployment (Week 5-6)
*Goal: Ascension scan + Mana attachment as backend functions for API access.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 7.1 | Edge function: `POST /ascension/scan` — accepts source, returns findings | 🔲 Todo | API-first scan |
| 7.2 | Edge function: `POST /mana/attach` — accepts findings + source, returns proof | 🔲 Todo | API-first attachment |
| 7.3 | Edge function: `GET /mana/verify/:fingerprint` — returns proof status | 🔲 Todo | Public verification API |
| 7.4 | Rate limiting + API key scoping for ascension/mana endpoints | 🔲 Todo | Uses existing access_api_keys table |
| 7.5 | Webhook: notify on attachment complete | 🔲 Todo | Enterprise integration point |

---

## Phase 8: Patent-Grade Documentation (Week 6)
*Goal: Every claim in both patents has working, demonstrable code behind it.*

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8.1 | Patent 1 claim verification — dual-layer code generation for all 90+ languages | ⚠️ Partial | Works for ~25 languages, needs edge case testing |
| 8.2 | Patent 2 claim verification — silent attachment without source modification (SHA-256 proof) | ✅ Done | Core mechanism proven |
| 8.3 | Patent 2 claim verification — recursive composition (V3 wraps V2 wraps V1) | ⚠️ Partial | Engine supports it, no live demo |
| 8.4 | Patent 2 claim verification — voluntary detachment with integrity verification | ✅ Done | Detach + hash match |
| 8.5 | Patent 2 claim verification — integrated governance layer (Lex) | ✅ Done | Three-verdict system operational |
| 8.6 | Patent 2 claim verification — heterogeneous computing environments | 🔲 Todo | Demo across browser + Node.js + edge function |
| 8.7 | Technical reference document — maps every patent claim to specific code files/functions | 🔲 Todo | Investor/legal discovery prep |

---

## Completion Criteria

**Ascension is "complete" when:**
1. ✅ Scanner hits 25/25 archetype floor with ≥1 HIGH per archetype
2. ✅ Code generation produces valid dual-layer output for 90+ languages
3. ✅ Findings bridge maps scanner results to surgical Mana attachment targets
4. 🔲 Every patent claim has a working, demonstrable code path
5. 🔲 API endpoints exist for programmatic access
6. 🔲 Combined Ascension→Mana pipeline runs with zero manual intervention
7. 🔲 Export artifacts are investor-grade with unified proof

**Estimated timeline: 6 weeks from today (target: May 20, 2026)**

---

© 2025–2026 CMPSBL®. A PromptFluid™ Product. All rights reserved.
Patent Pending: U.S. App. No. 64/029,678 · U.S. App. No. 64/031,637
