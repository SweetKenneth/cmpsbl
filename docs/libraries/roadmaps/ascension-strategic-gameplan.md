# CMPSBL® Ascension — Strategic Game Plan (No-Drift Phases)

> **Directional guidance for roadmap design, prioritization, and architectural integrity.**
> Implementation details and sequencing are decided by system realities — but must stay aligned with these phases and invariants.

---

## 🎯 End Goal

Ascension becomes a **runtime behavior deployment and governance layer** for existing software.

1. Developers provide code (repo, file, package)
2. The system scans and understands it
3. Behavior is attached declaratively (policies + capabilities)
4. A runtime layer activates that behavior without modifying source
5. Execution is governed, observable, and enforceable
6. Everything is verifiable and reproducible

### Invariants

- **No Source Modification**: Original code (Layer 1) remains untouched.
- **External Behavior**: All behavior lives in Layer 2 and is externally attachable.
- **Deterministic Runtime**: Runtime behavior is deterministic, inspectable, and provable.

---

## Phase 1 — Solidify Runtime Truth
*Where we are now → stable core*

**Goal:** Lock the runtime as a correct, composable policy engine.

**Key outcomes:**
- Clear separation: detection (`validate_input`) / enforcement (`block_execution`)
- Deterministic signal → rule → action chain
- Stable event model: `validation_failed`, `execution_blocked`
- No ambiguity in effects or execution flow

**Exit criteria:**
- Runtime behavior is predictable and explainable
- Policies execute consistently across functions
- Demo-level enforcement is stable without hacks

---

## Phase 2 — Make Attachments First-Class

**Goal:** Turn attachments into a formal, reliable behavior contract.

**Key outcomes:**
- Attachment schema is stable and expressive: capability, primitive, optional policy (on, condition, then)
- Capability → behavior mapping is deterministic
- Policies are composable chains (not single actions)
- Attachments can fully describe runtime behavior without engine edits

**Exit criteria:**
- Any behavior can be expressed declaratively via attachments
- Engine does not need custom logic per use case
- Attachments are portable across systems

---

## Phase 3 — Tighten Wrapper ↔ Runtime Integration

**Goal:** Ensure automatic activation with zero manual glue.

**Key outcomes:**
- Generic wrapper: resolves attachments, binds rules once per primitive, emits correct signals (`execution_started`)
- Function identity is stable and collision-free
- No hidden coupling between wrapper and engine
- Behavior activates simply by running the artifact

**Exit criteria:**
- "Drop-in → behavior works" is consistently true
- No manual registration steps required
- Wrapping is deterministic and repeatable

---

## Phase 4 — Make Scanning Actionable ✅ COMPLETE

**Goal:** Scanning produces behavior-ready outputs, not just analysis.

**Key outcomes:**
- ✅ Scan identifies: critical functions, risk surfaces, attachable primitives
- ✅ Scan output maps directly to attachments and policies (`scan-to-policy.ts`)
- ✅ "Recommended behaviors" generator (`recommended-behaviors.ts`)

**Delivered:**
- `scan-to-policy.ts` — Deterministic capability→policy template mapping (7 templates, priority-sorted)
- `recommended-behaviors.ts` — Risk-classified behavior reports (critical/high/medium/low/info)
- `scan-pipeline.ts` — Unified entry: `runScanPipeline(source)` → attachments + policies + report

**Exit criteria:**
- ✅ Scan → Attachment is a natural pipeline (`scanToAttachments()`)
- ✅ Minimal human interpretation required (what/why/ifSkipped per recommendation)
- ✅ Scanning becomes the entry point to Ascension (`runScanPipeline()`)

---

## Phase 5 — Close the Ascension Loop ✅ COMPLETE

**Goal:** Unify scanning, attachment, and runtime into one flow.

**Key outcomes:**
- ✅ Pipeline: Scan → Generate attachments → Produce artifact (L1 + L2) → Activate runtime
- ✅ Behavior declared at build time executes at runtime automatically
- ✅ No drift between what is declared and what runs

**Delivered:**
- `ascension-loop.ts` — Unified `ascend(sourceCode, moduleExports)` entry point
- Auto-computed CJPI from scan quality (density, enforcement ratio, confidence, engine diversity)
- `serializeArtifact()` — Embeddable payload for artifact ZIPs
- `generateBootstrap()` — Auto-generated globalThis injection code for artifact boot
- `renderPipelineSummary()` — Human-readable pipeline trace

**Exit criteria:**
- ✅ End-to-end flow works on real software repeatedly
- ✅ No manual stitching between phases (single `ascend()` call)
- ✅ Output artifact is self-contained and executable (serialized + bootstrap)

---

## Phase 6 — Verification & Proof Layer ✅ COMPLETE

**Goal:** Make behavior auditable and trustworthy.

**Key outcomes:**
- ✅ Runtime emits structured, queryable events (verification ledger)
- ✅ Verification answers: what was attached, what executed, what was blocked, why it happened
- ✅ Fingerprinting ties artifact → runtime → behavior
- ✅ Causal chain linkage connects events to their causes

**Delivered:**
- `verification-ledger.ts` — Append-only structured event log with 11 event kinds
- Artifact fingerprinting (FNV-1a composite of manifest + attachments)
- Query API: `queryByKind()`, `queryByPrimitive()`, `queryByFunction()`, `getCausalChain()`
- `generateVerificationSummary()` — Single-call trust surface
- `verifyIntegrity()` — Runtime fingerprint verification with tamper detection
- `renderVerificationReport()` — Human-readable externally shareable proof
- Integrated into `ascend()` — every pipeline run auto-records binding, wrapping, proof, and integrity events

**Exit criteria:**
- ✅ Every behavior has a trace (ledger records all binding, execution, enforcement events)
- ✅ No "black box" execution (causal chains link every event to its cause)
- ✅ Trust can be established externally (fingerprint + verification summary + report)

---

## Phase 7 — Deployment Model ✅ COMPLETE

**Goal:** Make Ascension usable in real environments.

**Key outcomes:**
- ✅ Artifacts can be dropped into existing stacks, run locally or in production
- ✅ Runtime behaves consistently across environments
- ✅ No lock-in required to execute behavior

**Delivered:**
- `portable-artifact.ts` — Full deployment model engine
- `detectEnvironment()` — Feature-based detection (Node, browser, Deno, Bun, edge workers)
- `loadArtifactPayload()` — Environment-agnostic loader (globalThis or explicit args)
- `generateDeploymentManifest()` — Machine-readable integration contract (compatibility matrix, behavior counts, verification metadata)
- `generateIntegrationCode()` — Copy-paste code for ESM, CJS, script tag, and global formats
- `getGlobalHealthCheck()` — Global health endpoint (reads latched pipeline state)
- `getSessionHealthCheck()` — Session-scoped health endpoint (deterministic, no global reads, multi-tenant safe)
- `UNCOMPUTED_FINGERPRINT` — Null-safe sentinel for pre-ascension state
- `generateDeploymentReadme()` — Human-readable deployment guide auto-generated per artifact

**Exit criteria:**
- ✅ Works outside dev demos (environment detection + portable loader)
- ✅ Minimal friction to adopt (4 integration formats + auto-generated README)
- ✅ Clear integration story (deployment manifest + health check endpoint)

---

## Phase 8 — Productization Layer ✅ COMPLETE

**Goal:** Translate system into something developers will adopt.

**Key outcomes:**
- ✅ Clear user journey: provide code → see scan → accept behaviors → run artifact → observe & verify
- ✅ Concepts are legible: no "magic", no hidden behavior
- ✅ Output is useful immediately

**Delivered:**
- `production-provider.ts` — Developer-facing API: `init()` returns a session with `.exports`, `.health()`, `.status()`, `.healthCheck()`, `.summary()`, `.verificationReport()`, `.destroy()`
- `ascendQuick()` — One-shot helper for scripts/CLIs (ascend + return wrapped exports)
- `AscensionConfig` — Developer-legible configuration (no engine jargon)
- `AscensionSession` — Stateful handle with unified health monitoring, verification, and teardown
- `SessionStatus` — Quick-glance status: `{ health, coverage, fingerprint, identity }`
- `UNCOMPUTED_FINGERPRINT` — Null-safe sentinel eliminates consumer null-branching
- AbortSignal support for graceful cancellation
- Session-scoped `healthCheck()` uses `getSessionHealthCheck()` — no global state dependency, multi-tenant safe
- `coverageRatio` stored in `PipelineTrace` — single source of truth, reused everywhere
- Single active session per process constraint documented

**Exit criteria:**
- ✅ A developer can understand value in minutes (`init()` → `.exports` → done)
- ✅ Behavior is visible, not implied (`.summary()`, `.verificationReport()`)
- ✅ System feels like a tool, not a concept (3-call API: configure → init → use)

---

## 🔒 No-Drift Principles (Critical)

These must remain true across all phases:

| Principle | Rule |
|-----------|------|
| No Source Modification | Layer 1 is always preserved |
| Behavior is Declarative | No hardcoding behavior per use case |
| Runtime is Deterministic | Same input → same behavior |
| Events are Truth | Runtime output must reflect real execution |
| Separation of Concerns | Detection ≠ Enforcement ≠ Orchestration |
| Drop-in Activation | No manual wiring required |

---

## 🧭 Strategic Direction

This system should evolve toward: **Behavioral integration layer for software**

Not: a scanner, a wrapper, a transformation tool.

But: **A way to deploy runtime behavior onto existing systems without rewriting them.**

---

## 🧩 Final Framing

| Stage | Function |
|-------|----------|
| Scanning | finds opportunities |
| Attachments | define behavior |
| Runtime | executes behavior |
| Verification | proves behavior |

**That loop is the product.**

---

© 2025–2026 CMPSBL®. All rights reserved. · PromptFluid™
