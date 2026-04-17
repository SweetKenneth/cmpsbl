# Ascension / Mana — The Wrapping & Governance Frontier

**Classification:** 🔒 GOVERNOR EYES ONLY
**Companion HTML:** [`23-ascension-mana-wrapping-frontier.html`](./23-ascension-mana-wrapping-frontier.html)

This document is the candid, end-to-end answer to: *how far can Ascension + Mana go in wrapping, observing, and governing other people's software?* It covers what exists today, what's adjacent, what's reachable with effort, and what's a hard wall vs. a soft wall we could push through.

See the HTML companion for the styled, mobile-friendly version. This `.md` mirrors the same content for terminal/governor-tool consumption.

---

## 1. Where Ascension + Mana stand today

- **Ascension (U.S. App. No. 64/029,678):** discovers the *shape* of code — function boundaries, contracts, side effects, capability surface — and produces a deterministic manifest + fingerprint.
- **Mana (U.S. App. No. 64/031,637):** the Layer 2 runtime. Wraps host functions at their boundaries (no source modification required) and routes every call through **Lex** — the conscience layer that allow/deny/transforms based on rules.
- **Convergence:** Ascension's manifest feeds Mana's loader. The result is *governed execution* of code Mana didn't write.

What works today, in production:
- Function-boundary attachment (pre/around/post wrappers)
- Capability contracts + Lex priority-ordered rule evaluation
- Safe detach with in-flight call tracking
- Deterministic proof + telemetry for every wrapped invocation
- Multi-package composition via the manifest consumer
- Session-scoped engines so two modules can't poison each other

## 2. The wrapping spectrum — what "wrap" actually means

Wrapping is not one thing. It's a ladder. Each rung gives more control and costs more access:

| Rung | What we observe / control | Access required |
|------|---------------------------|-----------------|
| 0. Black-box network | Inputs/outputs at the HTTP boundary | Just a URL |
| 1. Surface fingerprint | Tech stack, framework, auth flow, public endpoints | Public web |
| 2. SDK / API wrap | Every call through the vendor's SDK | Their package installed in our perimeter |
| 3. Function-boundary wrap (Mana today) | Every function call, args, return, timing | Source or installed package access |
| 4. Module-graph wrap | Imports, side effects, dynamic loads | Build-time or loader hook |
| 5. Process wrap | Syscalls, file I/O, network, env | OS-level agent or sidecar |
| 6. Kernel / hypervisor wrap | Memory, scheduling, hardware | Kernel module or VM host |
| 7. Hardware wrap | Bus traffic, DMA, firmware | Physical or firmware control |

**Mana lives at rung 3 today**, with reach into rung 4 via the manifest consumer. Rungs 5–7 are *adjacent* — same architecture, different injection point.

## 3. Discovering wrap points from the outside

You asked specifically about targeting a website to figure out what software it runs and what we'd need to wrap. Realistic surface-discovery tactics, in order of legality and ease:

**Fully passive (no permission needed):**
- HTTP headers (`Server`, `X-Powered-By`, CSP, cookies)
- HTML fingerprints (script paths, CSS class conventions, favicon hash)
- JS bundle inspection (webpack chunks, source maps if exposed, library globals)
- Network waterfall (CDN patterns, third-party SDK calls, telemetry endpoints)
- DNS, TLS cert SANs, ASN ownership
- robots.txt / sitemap.xml / .well-known/

**Active but standard (rate-limited, polite):**
- OpenAPI / GraphQL introspection probes
- Auth flow walking (OAuth discovery docs, SAML metadata)
- Error message fingerprinting (forced 404/500 responses leak frameworks)
- WebSocket handshake inspection
- Service worker + PWA manifest enumeration

**Active and noisy (only with consent — pen-test territory):**
- Endpoint fuzzing
- Auth boundary probing
- Header injection / parameter pollution

From these signals we can build an **Ascension Surface Manifest** for any web property, then propose attachment points: which SDKs to wrap, which network calls to intercept (if we get inside the perimeter), what governance rules make sense.

The honest limit: **without code or runtime access, we can describe the target but not govern it.** Discovery without injection is reconnaissance, not control.

## 4. What we can actually control by software type

| Software type | What Mana can do | What it can't (without escalation) |
|---|---|---|
| Node / Deno / browser JS | Full function wrap, module graph, async tracing | Native addons, V8 internals |
| Python | Function wrap via decorator/import hook | C extensions, GIL-internal scheduling |
| Java / JVM | Bytecode instrumentation (Java agent) — mature path | Native JNI without JVMTI |
| .NET | Profiler API + IL rewriting | Unmanaged code |
| Go | Build-time wrap or eBPF; no runtime monkey-patching | Compiled binary internals without rebuild |
| Rust / C / C++ | Link-time shim, LD_PRELOAD, eBPF | Inline / optimized-away calls |
| Mobile (iOS/Android) | Method swizzling / Xposed-style hooks | App Store sandbox without jailbreak / root |
| Desktop apps | DLL injection, accessibility APIs, Frida | Hardened anti-tamper (games, DRM) |
| SaaS APIs | Wrap at the SDK or proxy the network | Their server-side logic |
| Embedded / firmware | JTAG, firmware patch, custom RTOS shim | OTP-fused ROM |

**The pattern:** every runtime has a boundary where calls are dispatched. Mana attaches there. The harder the boundary to reach, the more invasive the agent.

## 5. Access points required, ranked by cost

To go from "we can describe it" to "we govern it" you need *one* of these per target:

1. **Package install** — easiest. They `npm install @cmpsbl/mana` or equivalent.
2. **Build-step injection** — webpack/vite/esbuild plugin, Babel/SWC transform.
3. **Runtime loader hook** — Node `--require`, Python `sitecustomize`, Java `-javaagent`.
4. **Sidecar process** — proxy in front of network/IPC.
5. **OS agent** — eBPF on Linux, ETW on Windows, EndpointSecurity on macOS.
6. **Kernel module / hypervisor** — full system observability, full liability.
7. **Hardware tap** — bus analyzer, firmware shim, custom silicon.

Each rung up is roughly **10× the engineering cost and 10× the trust the deployer must extend.**

## 6. Capability ladder — most to least powerful

Ranked by *leverage per rule installed*, not by ease.

1. **Outcome arbitration.** Lex doesn't just allow/deny — it can substitute return values, redact, transform, or replay. This is the highest-leverage primitive: change what the host *believes* happened.
2. **Capability quarantine.** Suspend an entire capability class (e.g. `network.egress.*`) globally with one rule.
3. **Cross-call correlation.** Mana sees every call; we can enforce invariants across a chain (`auth → fetch → write` must be in this order or deny).
4. **Deterministic replay.** Every wrapped call has a proof. We can re-run a session offline, identical, for audit or training.
5. **Adaptive policy.** Lex rules driven by telemetry — auto-tighten when anomaly score rises.
6. **Shadow execution.** Run the host call and a candidate alternative in parallel, compare, promote the winner. (TSAC pattern.)
7. **Capability composition.** Stack contracts so a function inherits the union of all wrapping rules — useful for compliance overlays.
8. **Time-boxed grants.** Rules with TTL; auto-revoke without human cleanup.
9. **Per-tenant policy.** Same wrapped function, different rules per caller identity.
10. **Telemetry-only mode.** No enforcement, just observation — the entry drug for skeptical adopters.
11. **Lex extended predicates.** Custom JS predicates per rule (already shipped in `lex-extended.ts`).
12. **Safe detach with quiescence.** Remove governance without dropping in-flight work.
13. **Manifest-driven auto-deploy.** Ascension produces the rules; Mana applies them — no human writes wrapping code.
14. **Proof export.** Cryptographic receipt the host *was* governed. Sellable as a compliance artifact by itself.
15. **Trace-time explainability.** Every deny cites the rule. No black-box refusals.

## 7. Capabilities we could add, ranked by ceiling

These are not built today. Ranked by how much they'd raise the ceiling:

1. **Kernel/eBPF probe pack** — Mana below userspace. Lets us govern syscalls, not just functions. *Unlocks defense, observability, sovereign-cloud markets.*
2. **Hypervisor shim** — VM-level wrap. *Unlocks data-center compliance overlays, military-grade isolation.*
3. **JVM + .NET + Python agent matrix** — three more language runtimes at parity with JS. *Triples addressable codebase.*
4. **Differential proof attestation** — TPM/secure-enclave-signed proofs of governed execution. *Required for FedRAMP-High, IL5+, defense.*
5. **Federated Lex** — multi-org rule sharing without revealing rule bodies (zero-knowledge predicates). *Unlocks regulator + regulated-party sharing.*
6. **AI-driven rule synthesis** — Ascension findings → proposed Lex rules, human-in-the-loop. *Removes the policy-author bottleneck.*
7. **Counterfactual replay** — "what if this rule had been active last quarter?" run on archived proofs. *Compliance gold.*
8. **Hardware root-of-trust binding** — Mana refuses to start unless host attestation matches. *Anti-tamper.*
9. **Cross-process capability ledger** — single source of truth for what every process in a fleet is allowed to do. *Cluster-wide governance.*
10. **Pluggable wrap backends** — same Lex rules, different injection (function / proxy / kernel) chosen per deployment.

## 8. Markets this can credibly reach

Honest read, not sales copy:

- **Today, with current code:** SaaS vendors who want governed SDKs, regulated fintech wrapping internal services, AI agent platforms wanting deterministic tool-call governance.
- **With JVM + .NET agents:** enterprise IT — every Fortune 500 has a wrap-our-vendors problem.
- **With kernel/eBPF + attestation:** defense primes, intelligence labs, sovereign cloud, critical infrastructure. *This is the "could you sell to the military" path.* Realistic — but requires FedRAMP, FIPS, supply-chain attestation, and a cleared partner.
- **With hardware root-of-trust:** weapon systems, satellite, anything where "did the right code run?" is a life-safety question.

The substrate's structure — deterministic, proof-emitting, governance-first — maps almost exactly to what defense compliance frameworks (NIST 800-53, CMMC L3+, IL5) actually want. The gap is paperwork and lab time, not architecture.

## 9. Hard limits and how to push through them

| Limit | Why it's hard | Way through |
|---|---|---|
| Closed-source binaries with anti-tamper | Hooking is detected and refused | Coordinate with vendor, or kernel-level wrap that's invisible to userspace checks |
| Sandboxed mobile apps | OS forbids injection | Vendor-side SDK install, or operate at the network proxy |
| GPU / accelerator workloads | Calls bypass CPU-side hooks | CUDA/ROCm interceptors, driver shim |
| Realtime / safety-critical (avionics, medical) | Wrap latency is unacceptable | Compile-time wrap with proven worst-case latency, formal verification of Lex paths |
| Air-gapped systems | No phone-home telemetry | Offline proof bundles synced via sneakernet; we already model this |
| Encrypted vendor APIs | Can't see payload at proxy | Wrap at the SDK call site before encryption |
| Legal / consent | Wrapping software you don't own = liability | Stay above-board: opt-in install, signed deployment manifest, audit trail |

## 10. Is it dangerous?

Yes, if mis-aimed. Honest assessment:

- The same primitive that lets us *enforce* a deny rule lets someone *substitute* a return value. In the wrong hands that's a supply-chain attack tool.
- Proof emission is a defense: every action is attributable. But the rules themselves are powerful — *whoever writes Lex rules controls behavior.*
- Mitigations already in the architecture: signed manifests, Governor-only rule registry, proof chain, registry bridge with explicit enforcement. The substrate is built assuming someone might try to misuse it.
- The danger isn't theoretical — it's the same danger eBPF, JVMTI, and Frida pose. We're in good company; we need the same operational discipline.

**Rule of thumb:** don't ship the kernel/hypervisor capabilities until the rule-authoring chain is hardware-attested and multi-party-signed. The architecture supports that today; we just haven't lit it up.

## 11. The path to peak

If you decided to push this to its ceiling, the order is:

1. **Lock the rule supply chain** — signed Lex bundles, multi-party approval for high-impact capabilities. (Architecture exists; needs activation.)
2. **Ship JVM + Python + .NET agents** — most ROI per engineer-month.
3. **Add eBPF + ETW probes** — same Lex, kernel reach.
4. **Wire TPM / secure-enclave attestation** — required for the high-trust markets.
5. **Build the federated rule exchange** — let regulators publish rules, regulated parties subscribe.
6. **Pursue FedRAMP Moderate, then FIPS 140-3** — paperwork, ~12–18 months, but it unlocks the doors.
7. **Co-develop with one defense lab** — they'll want bespoke wrap targets; that's the validation that opens the rest.

Realistic ceiling: **a sovereign-grade, attested governance substrate for any code, anywhere, with cryptographic proof of behavior.** That is a category-defining product.

## 12. What stays out of scope (intentionally)

- Wrapping software without consent of the deployer.
- Hidden / undetectable governance — every Mana attachment is observable; we keep it that way.
- AI inside Lex rule evaluation — Lex stays deterministic. AI can *propose* rules; it does not *decide* outcomes at runtime.

---

**Bottom line:** today we govern function boundaries with deterministic proof. The architecture is straight-line extendable to syscall, kernel, and hardware reach. The ceiling is genuinely defense-/lab-grade if we want to climb. The danger is real and already mitigated structurally; the remaining work is operational discipline and certification paperwork.

© 2025–2026 CMPSBL®. Governor Eyes Only.
